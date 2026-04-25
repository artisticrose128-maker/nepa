import { logger } from './logger';
import { dbManager } from './DatabaseConnectionManager';

interface PoolMetrics {
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  waitingClients: number;
  maxConnections: number;
  averageWaitTime: number;
  timestamp: Date;
}

interface AlertThresholds {
  maxConnectionUsage: number; // percentage
  averageWaitTime: number; // milliseconds
  waitingClients: number;
}

export class ConnectionPoolMonitor {
  private static instance: ConnectionPoolMonitor;
  private metrics: Map<string, PoolMetrics[]> = new Map();
  private alertThresholds: AlertThresholds = {
    maxConnectionUsage: 80, // Alert at 80% connection usage
    averageWaitTime: 1000, // Alert if wait time exceeds 1 second
    waitingClients: 10 // Alert if more than 10 clients are waiting
  };
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly METRICS_RETENTION_HOURS = 24;
  private readonly MONITORING_INTERVAL_MS = 30000; // 30 seconds

  private constructor() {}

  public static getInstance(): ConnectionPoolMonitor {
    if (!ConnectionPoolMonitor.instance) {
      ConnectionPoolMonitor.instance = new ConnectionPoolMonitor();
    }
    return ConnectionPoolMonitor.instance;
  }

  public startMonitoring(): void {
    if (this.monitoringInterval) {
      logger.warn('Connection pool monitoring is already running');
      return;
    }

    logger.info('Starting connection pool monitoring');
    this.monitoringInterval = setInterval(
      () => this.collectMetrics(),
      this.MONITORING_INTERVAL_MS
    );
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('Connection pool monitoring stopped');
    }
  }

  private async collectMetrics(): Promise<void> {
    const connectionStats = dbManager.getConnectionStats();
    
    for (const { name, config } of connectionStats) {
      try {
        const metrics = await this.getPoolMetrics(name, config);
        this.storeMetrics(name, metrics);
        this.checkAlerts(name, metrics, config);
      } catch (error) {
        logger.error(`Failed to collect metrics for ${name}:`, { error });
      }
    }

    this.cleanupOldMetrics();
  }

  private async getPoolMetrics(name: string, config: any): Promise<PoolMetrics> {
    const client = dbManager.getClient(name);
    if (!client) {
      throw new Error(`Database client ${name} not found`);
    }

    try {
      // Get connection pool statistics
      const poolStats = await client.$queryRaw`
        SELECT 
          count(*) as total_connections,
          count(CASE WHEN state = 'active' THEN 1 END) as active_connections,
          count(CASE WHEN state = 'idle' THEN 1 END) as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
          AND application_name = 'nepa-app'
      ` as any[];

      const stats = poolStats[0] || {};

      return {
        activeConnections: stats.active_connections || 0,
        idleConnections: stats.idle_connections || 0,
        totalConnections: stats.total_connections || 0,
        waitingClients: 0, // PostgreSQL doesn't expose waiting clients directly
        maxConnections: config.connectionLimit,
        averageWaitTime: 0, // Would need custom instrumentation
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`Failed to get pool metrics for ${name}:`, { error });
      
      // Return default metrics
      return {
        activeConnections: 0,
        idleConnections: 0,
        totalConnections: 0,
        waitingClients: 0,
        maxConnections: config.connectionLimit,
        averageWaitTime: 0,
        timestamp: new Date()
      };
    }
  }

  private storeMetrics(name: string, metrics: PoolMetrics): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const clientMetrics = this.metrics.get(name)!;
    clientMetrics.push(metrics);

    // Keep only metrics within retention period
    const cutoffTime = new Date(Date.now() - this.METRICS_RETENTION_HOURS * 60 * 60 * 1000);
    const filteredMetrics = clientMetrics.filter(m => m.timestamp > cutoffTime);
    
    this.metrics.set(name, filteredMetrics);
  }

  private checkAlerts(name: string, metrics: PoolMetrics, config: any): void {
    const connectionUsagePercent = (metrics.totalConnections / metrics.maxConnections) * 100;

    // Check connection usage
    if (connectionUsagePercent > this.alertThresholds.maxConnectionUsage) {
      logger.warn(`High connection usage detected for ${name}:`, {
        usage: `${connectionUsagePercent.toFixed(2)}%`,
        current: metrics.totalConnections,
        max: metrics.maxConnections
      });

      // Trigger automatic connection pool optimization
      this.optimizeConnectionPool(name, config);
    }

    // Check waiting clients
    if (metrics.waitingClients > this.alertThresholds.waitingClients) {
      logger.error(`High number of waiting clients for ${name}:`, {
        waiting: metrics.waitingClients,
        threshold: this.alertThresholds.waitingClients
      });
    }

    // Check average wait time
    if (metrics.averageWaitTime > this.alertThresholds.averageWaitTime) {
      logger.warn(`High average wait time for ${name}:`, {
        waitTime: `${metrics.averageWaitTime}ms`,
        threshold: `${this.alertThresholds.averageWaitTime}ms`
      });
    }
  }

  private async optimizeConnectionPool(name: string, config: any): Promise<void> {
    logger.info(`Attempting to optimize connection pool for ${name}`);

    try {
      // Kill idle connections that have been idle for too long
      const client = dbManager.getClient(name);
      if (client) {
        await client.$executeRaw`
          SELECT pg_terminate_backend(pid)
          FROM pg_stat_activity
          WHERE state = 'idle'
            AND query_start < NOW() - INTERVAL '5 minutes'
            AND application_name = 'nepa-app'
            AND pid != pg_backend_pid()
        `;

        logger.info(`Optimized connection pool for ${name} by terminating long idle connections`);
      }
    } catch (error) {
      logger.error(`Failed to optimize connection pool for ${name}:`, { error });
    }
  }

  private cleanupOldMetrics(): void {
    const cutoffTime = new Date(Date.now() - this.METRICS_RETENTION_HOURS * 60 * 60 * 1000);
    
    for (const [name, metrics] of this.metrics.entries()) {
      const filteredMetrics = metrics.filter(m => m.timestamp > cutoffTime);
      this.metrics.set(name, filteredMetrics);
    }
  }

  public getMetrics(name: string): PoolMetrics[] {
    return this.metrics.get(name) || [];
  }

  public getAllMetrics(): Map<string, PoolMetrics[]> {
    return new Map(this.metrics);
  }

  public getAverageMetrics(name: string, minutes: number = 5): PoolMetrics | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    const recentMetrics = metrics.filter(m => m.timestamp > cutoffTime);
    
    if (recentMetrics.length === 0) return null;

    const avgMetrics: PoolMetrics = {
      activeConnections: Math.round(recentMetrics.reduce((sum, m) => sum + m.activeConnections, 0) / recentMetrics.length),
      idleConnections: Math.round(recentMetrics.reduce((sum, m) => sum + m.idleConnections, 0) / recentMetrics.length),
      totalConnections: Math.round(recentMetrics.reduce((sum, m) => sum + m.totalConnections, 0) / recentMetrics.length),
      waitingClients: Math.round(recentMetrics.reduce((sum, m) => sum + m.waitingClients, 0) / recentMetrics.length),
      maxConnections: recentMetrics[0].maxConnections,
      averageWaitTime: Math.round(recentMetrics.reduce((sum, m) => sum + m.averageWaitTime, 0) / recentMetrics.length),
      timestamp: new Date()
    };

    return avgMetrics;
  }

  public setAlertThresholds(thresholds: Partial<AlertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    logger.info('Updated alert thresholds:', this.alertThresholds);
  }

  public getAlertThresholds(): AlertThresholds {
    return { ...this.alertThresholds };
  }
}

// Export singleton instance
export const poolMonitor = ConnectionPoolMonitor.getInstance();
