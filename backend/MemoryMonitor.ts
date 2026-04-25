import { SocketServer } from './SocketServer';
import { ConnectionPoolManager } from './ConnectionPoolManager';

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  timestamp: Date;
}

interface ConnectionStats {
  totalConnections: number;
  userConnections: number;
  utilizationRate: number;
  connectionsPerUser: Array<{ userId: string; count: number }>;
}

interface HealthMetrics {
  memory: MemoryStats;
  connections: ConnectionStats;
  uptime: number;
  timestamp: Date;
}

export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private monitoringInterval?: NodeJS.Timeout;
  private memoryHistory: MemoryStats[] = [];
  private connectionHistory: ConnectionStats[] = [];
  private readonly MAX_HISTORY_SIZE = 100;
  private readonly MONITORING_INTERVAL = 30000; // 30 seconds
  private readonly MEMORY_THRESHOLD = 0.9; // 90% memory usage threshold

  private constructor() {
    this.startMonitoring();
  }

  public static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectMemoryStats();
      this.collectConnectionStats();
      this.checkMemoryThreshold();
      this.performCleanup();
    }, this.MONITORING_INTERVAL);
  }

  private collectMemoryStats(): void {
    const memUsage = process.memoryUsage();
    const stats: MemoryStats = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      timestamp: new Date()
    };

    this.memoryHistory.push(stats);
    
    // Keep only recent history
    if (this.memoryHistory.length > this.MAX_HISTORY_SIZE) {
      this.memoryHistory.shift();
    }
  }

  private collectConnectionStats(): void {
    try {
      const poolManager = ConnectionPoolManager.getInstance();
      const stats = poolManager.getConnectionStats();
      
      const connectionStats: ConnectionStats = {
        totalConnections: stats.totalConnections,
        userConnections: stats.userConnections,
        utilizationRate: stats.utilizationRate,
        connectionsPerUser: stats.connectionsPerUser
      };

      this.connectionHistory.push(connectionStats);
      
      if (this.connectionHistory.length > this.MAX_HISTORY_SIZE) {
        this.connectionHistory.shift();
      }
    } catch (error) {
      console.error('Failed to collect connection stats:', error);
    }
  }

  private checkMemoryThreshold(): void {
    const currentMemory = this.memoryHistory[this.memoryHistory.length - 1];
    if (!currentMemory) return;

    const memoryUsageRatio = currentMemory.heapUsed / currentMemory.heapTotal;
    
    if (memoryUsageRatio > this.MEMORY_THRESHOLD) {
      console.warn(`⚠️ High memory usage detected: ${(memoryUsageRatio * 100).toFixed(2)}%`);
      this.handleHighMemoryUsage();
    }
  }

  private handleHighMemoryUsage(): void {
    // Force garbage collection if available
    if (global.gc) {
      console.log('🗑️ Forcing garbage collection...');
      global.gc();
    }

    // Disconnect inactive connections
    try {
      const poolManager = ConnectionPoolManager.getInstance();
      poolManager.disconnectInactiveConnections();
    } catch (error) {
      console.error('Failed to disconnect inactive connections:', error);
    }

    // Log current state for debugging
    this.logCurrentState();
  }

  private performCleanup(): void {
    // Clean up old history entries
    const cutoffTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    
    this.memoryHistory = this.memoryHistory.filter(
      stats => stats.timestamp > cutoffTime
    );
    
    this.connectionHistory = this.connectionHistory.filter(
      stats => stats.timestamp && stats.timestamp > cutoffTime
    );
  }

  private logCurrentState(): void {
    const currentMemory = this.memoryHistory[this.memoryHistory.length - 1];
    const currentConnections = this.connectionHistory[this.connectionHistory.length - 1];

    console.log('📊 System Health Report:', {
      memory: currentMemory ? {
        heapUsed: `${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(currentMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        usage: `${((currentMemory.heapUsed / currentMemory.heapTotal) * 100).toFixed(2)}%`
      } : 'N/A',
      connections: currentConnections || 'N/A',
      uptime: `${(process.uptime() / 60).toFixed(2)} minutes`
    });
  }

  public getHealthMetrics(): HealthMetrics {
    const currentMemory = this.memoryHistory[this.memoryHistory.length - 1];
    const currentConnections = this.connectionHistory[this.connectionHistory.length - 1];

    return {
      memory: currentMemory || {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0,
        timestamp: new Date()
      },
      connections: currentConnections || {
        totalConnections: 0,
        userConnections: 0,
        utilizationRate: 0,
        connectionsPerUser: []
      },
      uptime: process.uptime(),
      timestamp: new Date()
    };
  }

  public getMemoryTrend(): Array<{ timestamp: Date; usage: number }> {
    return this.memoryHistory.map(stats => ({
      timestamp: stats.timestamp,
      usage: stats.heapUsed / stats.heapTotal
    }));
  }

  public getConnectionTrend(): Array<{ timestamp: Date; connections: number }> {
    return this.connectionHistory.map(stats => ({
      timestamp: stats.timestamp || new Date(),
      connections: stats.totalConnections
    }));
  }

  public forceCleanup(): void {
    console.log('🧹 Performing manual cleanup...');
    
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }

    // Disconnect inactive connections
    try {
      const poolManager = ConnectionPoolManager.getInstance();
      poolManager.disconnectInactiveConnections();
    } catch (error) {
      console.error('Failed to disconnect inactive connections:', error);
    }

    // Clear history
    this.memoryHistory = [];
    this.connectionHistory = [];

    // Collect fresh stats
    this.collectMemoryStats();
    this.collectConnectionStats();
  }

  public shutdown(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.memoryHistory = [];
    this.connectionHistory = [];
  }

  // Utility method to get memory leak warnings
  public detectMemoryLeaks(): Array<{ type: string; severity: string; message: string }> {
    const warnings: Array<{ type: string; severity: string; message: string }> = [];

    // Check for memory growth trend
    if (this.memoryHistory.length >= 10) {
      const recent = this.memoryHistory.slice(-10);
      const older = this.memoryHistory.slice(-20, -10);
      
      if (older.length > 0) {
        const recentAvg = recent.reduce((sum, stat) => sum + (stat.heapUsed / stat.heapTotal), 0) / recent.length;
        const olderAvg = older.reduce((sum, stat) => sum + (stat.heapUsed / stat.heapTotal), 0) / older.length;
        
        if (recentAvg > olderAvg + 0.1) { // 10% increase
          warnings.push({
            type: 'memory_growth',
            severity: 'warning',
            message: `Memory usage increased by ${((recentAvg - olderAvg) * 100).toFixed(2)}% over time`
          });
        }
      }
    }

    // Check for connection leaks
    const currentConnections = this.connectionHistory[this.connectionHistory.length - 1];
    if (currentConnections && currentConnections.totalConnections > 100) {
      warnings.push({
        type: 'connection_leak',
        severity: 'warning',
        message: `High number of connections: ${currentConnections.totalConnections}`
      });
    }

    return warnings;
  }
}
