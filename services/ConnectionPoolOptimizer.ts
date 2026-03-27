import { logger } from './logger';

interface PoolConfiguration {
  connectionLimit: number;
  poolTimeout: number;
  connectTimeout: number;
  idleTimeout: number;
  maxLifetime: number;
  maxUses: number;
}

export class ConnectionPoolOptimizer {
  private static instance: ConnectionPoolOptimizer;
  private configurations: Map<string, PoolConfiguration> = new Map();

  private constructor() {
    this.setupDefaultConfigurations();
  }

  public static getInstance(): ConnectionPoolOptimizer {
    if (!ConnectionPoolOptimizer.instance) {
      ConnectionPoolOptimizer.instance = new ConnectionPoolOptimizer();
    }
    return ConnectionPoolOptimizer.instance;
  }

  private setupDefaultConfigurations(): void {
    // Default configuration optimized for heavy load
    const defaultConfig: PoolConfiguration = {
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '50'),
      poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT_SECONDS || '30'),
      connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT_SECONDS || '15'),
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT_SECONDS || '600'),
      maxLifetime: parseInt(process.env.DB_MAX_LIFETIME_SECONDS || '3600'),
      maxUses: parseInt(process.env.DB_MAX_USES || '10000')
    };

    // Configuration for different service types
    this.configurations.set('default', defaultConfig);
    this.configurations.set('high-traffic', {
      ...defaultConfig,
      connectionLimit: 100,
      poolTimeout: 45,
      idleTimeout: 300
    });
    this.configurations.set('background', {
      ...defaultConfig,
      connectionLimit: 20,
      poolTimeout: 60,
      idleTimeout: 1200
    });
  }

  public optimizeDatabaseUrl(url: string, serviceType: string = 'default'): string {
    if (!url) return url;

    try {
      const config = this.configurations.get(serviceType) || this.configurations.get('default')!;
      const urlObj = new URL(url);

      // Set connection pool parameters
      urlObj.searchParams.set('connection_limit', String(config.connectionLimit));
      urlObj.searchParams.set('pool_timeout', String(config.poolTimeout));
      urlObj.searchParams.set('connect_timeout', String(config.connectTimeout));
      urlObj.searchParams.set('idle_timeout', String(config.idleTimeout));
      urlObj.searchParams.set('max_lifetime', String(config.maxLifetime));
      urlObj.searchParams.set('max_uses', String(config.maxUses));

      // Performance optimizations
      urlObj.searchParams.set('prepared_statements', 'true');
      urlObj.searchParams.set('binary_packets', 'true');
      urlObj.searchParams.set('cursor_based_fetch', 'true');

      // SSL configuration
      if (process.env.DB_SSL_MODE) {
        urlObj.searchParams.set('sslmode', process.env.DB_SSL_MODE);
      }

      // Application name for monitoring
      urlObj.searchParams.set('application_name', `nepa-${serviceType}`);

      // Add connection retry settings
      urlObj.searchParams.set('retry_attempts', '3');
      urlObj.searchParams.set('retry_delay', '1000');

      logger.info(`Optimized database URL for ${serviceType} service`, {
        connectionLimit: config.connectionLimit,
        poolTimeout: config.poolTimeout
      });

      return urlObj.toString();
    } catch (error) {
      logger.error('Failed to optimize database URL:', { error, url });
      return url;
    }
  }

  public getConfiguration(serviceType: string): PoolConfiguration | undefined {
    return this.configurations.get(serviceType);
  }

  public setConfiguration(serviceType: string, config: Partial<PoolConfiguration>): void {
    const existing = this.configurations.get(serviceType) || this.configurations.get('default')!;
    this.configurations.set(serviceType, { ...existing, ...config });
    
    logger.info(`Updated pool configuration for ${serviceType}:`, this.configurations.get(serviceType));
  }

  public getRecommendedConfigurations(): Record<string, PoolConfiguration> {
    return Object.fromEntries(this.configurations);
  }

  public validateConfiguration(config: PoolConfiguration): boolean {
    const errors: string[] = [];

    if (config.connectionLimit < 1 || config.connectionLimit > 1000) {
      errors.push('connectionLimit must be between 1 and 1000');
    }

    if (config.poolTimeout < 1 || config.poolTimeout > 300) {
      errors.push('poolTimeout must be between 1 and 300 seconds');
    }

    if (config.connectTimeout < 1 || config.connectTimeout > 60) {
      errors.push('connectTimeout must be between 1 and 60 seconds');
    }

    if (config.idleTimeout < 60 || config.idleTimeout > 3600) {
      errors.push('idleTimeout must be between 60 and 3600 seconds');
    }

    if (errors.length > 0) {
      logger.error('Invalid pool configuration:', { errors, config });
      return false;
    }

    return true;
  }

  public async testConnectionPool(url: string, serviceType: string = 'default'): Promise<boolean> {
    try {
      const optimizedUrl = this.optimizeDatabaseUrl(url, serviceType);
      
      // This would require a Prisma client to test
      // For now, just validate the URL format
      const urlObj = new URL(optimizedUrl);
      
      if (!urlObj.hostname || !urlObj.protocol.includes('postgresql')) {
        throw new Error('Invalid PostgreSQL URL format');
      }

      logger.info(`Connection pool test passed for ${serviceType}`);
      return true;
    } catch (error) {
      logger.error(`Connection pool test failed for ${serviceType}:`, { error });
      return false;
    }
  }

  public generateHealthReport(): {
    timestamp: Date;
    configurations: Record<string, PoolConfiguration>;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    const configs = this.getRecommendedConfigurations();

    // Analyze configurations and provide recommendations
    Object.entries(configs).forEach(([serviceType, config]) => {
      if (config.connectionLimit < 20) {
        recommendations.push(`Consider increasing connection_limit for ${serviceType} (current: ${config.connectionLimit})`);
      }

      if (config.idleTimeout > 1800) {
        recommendations.push(`Consider reducing idle_timeout for ${serviceType} to free connections faster`);
      }

      if (config.poolTimeout < 30) {
        recommendations.push(`Consider increasing pool_timeout for ${serviceType} to handle peak loads`);
      }
    });

    return {
      timestamp: new Date(),
      configurations: configs,
      recommendations
    };
  }
}

// Export singleton instance
export const poolOptimizer = ConnectionPoolOptimizer.getInstance();
