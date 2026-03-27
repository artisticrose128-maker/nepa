import { logger } from './logger';

// Use any type for Prisma client to avoid import issues
type PrismaClientType = any;

interface DatabaseConfig {
  url: string;
  connectionLimit: number;
  poolTimeout: number;
  connectTimeout: number;
  idleTimeout: number;
  maxUses: number;
}

export class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager;
  private clients: Map<string, PrismaClientType> = new Map();
  private connectionConfigs: Map<string, DatabaseConfig> = new Map();
  private isShuttingDown = false;
  private clientConstructors: Map<string, any> = new Map();

  private constructor() {
    this.setupGracefulShutdown();
  }

  public static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager();
    }
    return DatabaseConnectionManager.instance;
  }

  public registerClientConstructor(name: string, constructor: any): void {
    this.clientConstructors.set(name, constructor);
  }

  public async registerClient(name: string, urlEnvVar: string, clientConstructor?: any): Promise<PrismaClientType> {
    if (this.clients.has(name)) {
      return this.clients.get(name)!;
    }

    const config = this.buildDatabaseConfig(urlEnvVar);
    this.connectionConfigs.set(name, config);

    const PrismaClientClass = clientConstructor || this.clientConstructors.get(name);
    
    if (!PrismaClientClass) {
      throw new Error(`No Prisma client constructor provided for ${name}`);
    }
    
    const client = new PrismaClientClass({
      datasources: {
        db: {
          url: this.buildOptimizedUrl(config)
        }
      },
      log: [
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'info', emit: 'event' }
      ]
    });

    this.setupClientLogging(client, name);
    this.clients.set(name, client);

    // Initialize connection
    await this.initializeClient(client, name);

    return client;
  }

  private buildDatabaseConfig(urlEnvVar: string): DatabaseConfig {
    const rawUrl = process.env[urlEnvVar];
    if (!rawUrl) {
      throw new Error(`Database URL environment variable ${urlEnvVar} is not set`);
    }

    return {
      url: rawUrl,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '50'),
      poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT_SECONDS || '30'),
      connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT_SECONDS || '15'),
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT_SECONDS || '600'),
      maxUses: parseInt(process.env.DB_MAX_USES || '10000')
    };
  }

  private buildOptimizedUrl(config: DatabaseConfig): string {
    try {
      const url = new URL(config.url);

      // Set connection pool parameters
      url.searchParams.set('connection_limit', String(config.connectionLimit));
      url.searchParams.set('pool_timeout', String(config.poolTimeout));
      url.searchParams.set('connect_timeout', String(config.connectTimeout));
      
      // Advanced pooling settings
      url.searchParams.set('idle_timeout', String(config.idleTimeout));
      url.searchParams.set('max_lifetime', '3600'); // 1 hour
      url.searchParams.set('max_uses', String(config.maxUses));
      
      // Enable prepared statements for better performance
      url.searchParams.set('prepared_statements', 'true');
      
      // SSL configuration
      if (process.env.DB_SSL_MODE) {
        url.searchParams.set('sslmode', process.env.DB_SSL_MODE);
      }

      // Application name for monitoring
      url.searchParams.set('application_name', 'nepa-app');

      return url.toString();
    } catch (error) {
      logger.error('Failed to build optimized database URL:', { error, config });
      return config.url;
    }
  }

  private setupClientLogging(client: PrismaClient, name: string): void {
    client.$on('error', (e) => {
      logger.error(`Database error in ${name}:`, { error: e, client: name });
    });

    client.$on('warn', (e) => {
      logger.warn(`Database warning in ${name}:`, { warning: e, client: name });
    });

    client.$on('info', (e) => {
      logger.info(`Database info in ${name}:`, { info: e, client: name });
    });
  }

  private async initializeClient(client: PrismaClientType, name: string): Promise<void> {
    try {
      await client.$connect();
      logger.info(`Database client ${name} connected successfully`);
    } catch (error) {
      logger.error(`Failed to connect database client ${name}:`, { error });
      throw error;
    }
  }

  public getClient(name: string): PrismaClientType | undefined {
    return this.clients.get(name);
  }

  public async healthCheck(name: string): Promise<boolean> {
    const client = this.clients.get(name);
    if (!client) return false;

    try {
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error(`Health check failed for ${name}:`, { error });
      return false;
    }
  }

  public async disconnectClient(name: string): Promise<void> {
    const client = this.clients.get(name);
    if (!client) return;

    try {
      await client.$disconnect();
      this.clients.delete(name);
      logger.info(`Database client ${name} disconnected`);
    } catch (error) {
      logger.error(`Error disconnecting client ${name}:`, { error });
    }
  }

  public async disconnectAll(): Promise<void> {
    this.isShuttingDown = true;
    const disconnectPromises = Array.from(this.clients.keys()).map(name => 
      this.disconnectClient(name)
    );

    await Promise.allSettled(disconnectPromises);
    logger.info('All database clients disconnected');
  }

  public getConnectionStats(): Array<{ name: string; config: DatabaseConfig; connected: boolean }> {
    return Array.from(this.connectionConfigs.entries()).map(([name, config]) => ({
      name,
      config,
      connected: this.clients.has(name)
    }));
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) return;
      
      logger.info(`Received ${signal}, shutting down database connections...`);
      await this.disconnectAll();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon
  }
}

// Export singleton instance
export const dbManager = DatabaseConnectionManager.getInstance();
