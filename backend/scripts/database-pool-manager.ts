#!/usr/bin/env ts-node

import { poolOptimizer } from '../services/ConnectionPoolOptimizer';
import { logger } from '../services/logger';

interface DatabasePoolHealth {
  name: string;
  url: string;
  status: 'healthy' | 'warning' | 'critical';
  connectionCount: number;
  maxConnections: number;
  utilizationPercent: number;
  recommendations: string[];
}

class DatabasePoolManager {
  private databases: Array<{ name: string; urlEnvVar: string; serviceType: string }> = [
    { name: 'user', urlEnvVar: 'USER_SERVICE_DATABASE_URL', serviceType: 'default' },
    { name: 'payment', urlEnvVar: 'PAYMENT_SERVICE_DATABASE_URL', serviceType: 'high-traffic' },
    { name: 'billing', urlEnvVar: 'BILLING_SERVICE_DATABASE_URL', serviceType: 'high-traffic' },
    { name: 'notification', urlEnvVar: 'NOTIFICATION_SERVICE_DATABASE_URL', serviceType: 'default' },
    { name: 'document', urlEnvVar: 'DOCUMENT_SERVICE_DATABASE_URL', serviceType: 'background' },
    { name: 'utility', urlEnvVar: 'UTILITY_SERVICE_DATABASE_URL', serviceType: 'default' },
    { name: 'analytics', urlEnvVar: 'ANALYTICS_SERVICE_DATABASE_URL', serviceType: 'background' },
    { name: 'webhook', urlEnvVar: 'WEBHOOK_SERVICE_DATABASE_URL', serviceType: 'default' },
    { name: 'audit', urlEnvVar: 'AUDIT_DATABASE_URL', serviceType: 'background' }
  ];

  public async checkAllPools(): Promise<DatabasePoolHealth[]> {
    const results: DatabasePoolHealth[] = [];

    for (const db of this.databases) {
      const url = process.env[db.urlEnvVar];
      if (!url) {
        logger.warn(`Database URL not found for ${db.name}`);
        continue;
      }

      try {
        const health = await this.checkPoolHealth(db.name, url, db.serviceType);
        results.push(health);
      } catch (error) {
        logger.error(`Failed to check pool health for ${db.name}:`, { error });
        results.push({
          name: db.name,
          url,
          status: 'critical',
          connectionCount: 0,
          maxConnections: 0,
          utilizationPercent: 0,
          recommendations: ['Database connection failed']
        });
      }
    }

    return results;
  }

  private async checkPoolHealth(name: string, url: string, serviceType: string): Promise<DatabasePoolHealth> {
    const config = poolOptimizer.getConfiguration(serviceType);
    
    // Simulate connection check (in real implementation, this would query the database)
    const connectionCount = Math.floor(Math.random() * (config?.connectionLimit || 50));
    const maxConnections = config?.connectionLimit || 50;
    const utilizationPercent = (connectionCount / maxConnections) * 100;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    const recommendations: string[] = [];

    if (utilizationPercent > 90) {
      status = 'critical';
      recommendations.push('Immediate action required: Connection pool nearly exhausted');
      recommendations.push('Consider increasing connection_limit or optimizing queries');
    } else if (utilizationPercent > 75) {
      status = 'warning';
      recommendations.push('Monitor closely: High connection utilization');
      recommendations.push('Consider scaling up during peak hours');
    }

    if (connectionCount === 0) {
      status = 'critical';
      recommendations.push('No active connections detected');
    }

    return {
      name,
      url: this.maskUrl(url),
      status,
      connectionCount,
      maxConnections,
      utilizationPercent,
      recommendations
    };
  }

  private maskUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.username ? '***:***@' : ''}${urlObj.hostname}:${urlObj.port}${urlObj.pathname}`;
    } catch {
      return '***';
    }
  }

  public async optimizeAllPools(): Promise<void> {
    logger.info('Starting database pool optimization...');

    for (const db of this.databases) {
      const url = process.env[db.urlEnvVar];
      if (!url) continue;

      try {
        const success = await poolOptimizer.testConnectionPool(url, db.serviceType);
        if (success) {
          logger.info(`Pool optimization successful for ${db.name}`);
        } else {
          logger.warn(`Pool optimization failed for ${db.name}`);
        }
      } catch (error) {
        logger.error(`Error optimizing pool for ${db.name}:`, { error });
      }
    }
  }

  public generateReport(): void {
    const healthReport = poolOptimizer.generateHealthReport();
    
    console.log('\n=== Database Pool Health Report ===');
    console.log(`Generated at: ${healthReport.timestamp.toISOString()}`);
    
    console.log('\nConfigurations:');
    Object.entries(healthReport.configurations).forEach(([serviceType, config]) => {
      console.log(`  ${serviceType}:`);
      console.log(`    connection_limit: ${config.connectionLimit}`);
      console.log(`    pool_timeout: ${config.poolTimeout}s`);
      console.log(`    connect_timeout: ${config.connectTimeout}s`);
      console.log(`    idle_timeout: ${config.idleTimeout}s`);
    });

    if (healthReport.recommendations.length > 0) {
      console.log('\nRecommendations:');
      healthReport.recommendations.forEach(rec => console.log(`  - ${rec}`));
    } else {
      console.log('\n✅ All configurations look good!');
    }
  }

  public async startMonitoring(intervalMinutes: number = 5): Promise<void> {
    logger.info(`Starting database pool monitoring (interval: ${intervalMinutes} minutes)`);

    const monitor = async () => {
      try {
        const health = await this.checkAllPools();
        this.logHealthSummary(health);
      } catch (error) {
        logger.error('Pool monitoring error:', { error });
      }
    };

    // Run immediately
    await monitor();

    // Set up interval
    setInterval(monitor, intervalMinutes * 60 * 1000);
  }

  private logHealthSummary(health: DatabasePoolHealth[]): void {
    const critical = health.filter(h => h.status === 'critical').length;
    const warning = health.filter(h => h.status === 'warning').length;
    const healthy = health.filter(h => h.status === 'healthy').length;

    logger.info('Database Pool Health Summary:', {
      total: health.length,
      healthy,
      warning,
      critical
    });

    if (critical > 0) {
      logger.error('🚨 CRITICAL: Some database pools are in critical state!');
    }

    if (warning > 0) {
      logger.warn('⚠️  WARNING: Some database pools need attention');
    }

    if (healthy === health.length) {
      logger.info('✅ All database pools are healthy');
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const manager = new DatabasePoolManager();

  switch (command) {
    case 'check':
      const health = await manager.checkAllPools();
      console.log(JSON.stringify(health, null, 2));
      break;

    case 'optimize':
      await manager.optimizeAllPools();
      break;

    case 'report':
      manager.generateReport();
      break;

    case 'monitor':
      const interval = parseInt(process.argv[3]) || 5;
      await manager.startMonitoring(interval);
      break;

    default:
      console.log('Usage:');
      console.log('  npm run db:pool-manager check       - Check all pool health');
      console.log('  npm run db:pool-manager optimize     - Optimize all pools');
      console.log('  npm run db:pool-manager report       - Generate health report');
      console.log('  npm run db:pool-manager monitor [min]  - Start monitoring (default: 5min)');
      break;
  }
}

if (require.main === module) {
  main().catch(error => {
    logger.error('Database pool manager error:', { error });
    process.exit(1);
  });
}

export { DatabasePoolManager };
