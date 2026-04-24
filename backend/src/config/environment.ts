export type NodeEnvironment = 'development' | 'production' | 'staging' | 'test';

export const nodeEnv: NodeEnvironment = (process.env.NODE_ENV as NodeEnvironment) || 'development';

export const isProduction = nodeEnv === 'production';
export const isStaging = nodeEnv === 'staging';
export const isDevelopment = nodeEnv === 'development';
export const isTest = nodeEnv === 'test';

export interface DatabasePoolConfig {
  connectionLimit: number;
  poolTimeout: number;
  connectTimeout: number;
  idleTimeout: number;
  maxLifetime: number;
  maxUses: number;
}

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const environmentDefaults = {
  development: {
    connectionLimit: 20,
    poolTimeout: 30,
    connectTimeout: 15,
    idleTimeout: 900,
    maxLifetime: 1800,
    maxUses: 5000,
  },
  staging: {
    connectionLimit: 50,
    poolTimeout: 30,
    connectTimeout: 15,
    idleTimeout: 600,
    maxLifetime: 3600,
    maxUses: 8000,
  },
  production: {
    connectionLimit: 100,
    poolTimeout: 45,
    connectTimeout: 15,
    idleTimeout: 300,
    maxLifetime: 3600,
    maxUses: 10000,
  },
  test: {
    connectionLimit: 5,
    poolTimeout: 10,
    connectTimeout: 5,
    idleTimeout: 60,
    maxLifetime: 60,
    maxUses: 100,
  },
};

const defaultPoolConfig = environmentDefaults[nodeEnv];

export const appConfig = {
  nodeEnv,
  port: parseNumber(process.env.PORT, 3000),
  logLevel: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  sentryDsn: process.env.SENTRY_DSN || '',
  enableDbPoolMonitoring: process.env.DB_POOL_MONITORING_ENABLED !== 'false',
  dbPoolMonitoringInterval: parseNumber(process.env.DB_POOL_MONITORING_INTERVAL, 60000),
  enablePerformanceMetrics: process.env.PERFORMANCE_METRICS_ENABLED !== 'false',
  enableDatabaseHealthChecks: process.env.DB_HEALTH_CHECK_ENABLED !== 'false',
  monitoringApiKey: process.env.MONITORING_API_KEY || 'monitoring-key',
  disableTelemetry: process.env.DISABLE_TELEMETRY === 'true',
};

export const dbPoolConfig: Record<string, DatabasePoolConfig> = {
  default: {
    connectionLimit: parseNumber(process.env.DB_CONNECTION_LIMIT, defaultPoolConfig.connectionLimit),
    poolTimeout: parseNumber(process.env.DB_POOL_TIMEOUT_SECONDS, defaultPoolConfig.poolTimeout),
    connectTimeout: parseNumber(process.env.DB_CONNECT_TIMEOUT_SECONDS, defaultPoolConfig.connectTimeout),
    idleTimeout: parseNumber(process.env.DB_IDLE_TIMEOUT_SECONDS, defaultPoolConfig.idleTimeout),
    maxLifetime: parseNumber(process.env.DB_MAX_LIFETIME_SECONDS, defaultPoolConfig.maxLifetime),
    maxUses: parseNumber(process.env.DB_MAX_USES, defaultPoolConfig.maxUses),
  },
  highTraffic: {
    connectionLimit: parseNumber(process.env.DB_CONNECTION_LIMIT_HIGH_TRAFFIC, defaultPoolConfig.connectionLimit * 2),
    poolTimeout: parseNumber(process.env.DB_POOL_TIMEOUT_SECONDS_HIGH_TRAFFIC, defaultPoolConfig.poolTimeout),
    connectTimeout: parseNumber(process.env.DB_CONNECT_TIMEOUT_SECONDS_HIGH_TRAFFIC, defaultPoolConfig.connectTimeout),
    idleTimeout: parseNumber(process.env.DB_IDLE_TIMEOUT_SECONDS_HIGH_TRAFFIC, Math.max(180, defaultPoolConfig.idleTimeout / 2)),
    maxLifetime: parseNumber(process.env.DB_MAX_LIFETIME_SECONDS_HIGH_TRAFFIC, defaultPoolConfig.maxLifetime),
    maxUses: parseNumber(process.env.DB_MAX_USES_HIGH_TRAFFIC, defaultPoolConfig.maxUses),
  },
  background: {
    connectionLimit: parseNumber(process.env.DB_CONNECTION_LIMIT_BACKGROUND, Math.max(10, defaultPoolConfig.connectionLimit / 2)),
    poolTimeout: parseNumber(process.env.DB_POOL_TIMEOUT_SECONDS_BACKGROUND, defaultPoolConfig.poolTimeout * 2),
    connectTimeout: parseNumber(process.env.DB_CONNECT_TIMEOUT_SECONDS_BACKGROUND, defaultPoolConfig.connectTimeout),
    idleTimeout: parseNumber(process.env.DB_IDLE_TIMEOUT_SECONDS_BACKGROUND, defaultPoolConfig.idleTimeout * 2),
    maxLifetime: parseNumber(process.env.DB_MAX_LIFETIME_SECONDS_BACKGROUND, defaultPoolConfig.maxLifetime),
    maxUses: parseNumber(process.env.DB_MAX_USES_BACKGROUND, defaultPoolConfig.maxUses),
  },
};

export const getDatabasePoolConfig = (serviceType: string): DatabasePoolConfig => {
  if (serviceType === 'high-traffic') {
    return dbPoolConfig.highTraffic;
  }
  if (serviceType === 'background') {
    return dbPoolConfig.background;
  }
  return dbPoolConfig.default;
};
