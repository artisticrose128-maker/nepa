import { poolOptimizer } from '../../services/ConnectionPoolOptimizer';

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const buildOptimizedDatabaseUrl = (rawUrl: string | undefined): string | undefined => {
  if (!rawUrl) {
    return rawUrl;
  }

  try {
    // Determine service type from URL or environment
    let serviceType = 'default';
    
    // Extract service type from database name or port
    const url = new URL(rawUrl);
    const databaseName = url.pathname.split('/').pop();
    
    if (databaseName) {
      if (databaseName.includes('payment') || databaseName.includes('billing')) {
        serviceType = 'high-traffic';
      } else if (databaseName.includes('audit') || databaseName.includes('analytics')) {
        serviceType = 'background';
      }
    }

    // Use the new connection pool optimizer
    return poolOptimizer.optimizeDatabaseUrl(rawUrl, serviceType);
  } catch (error) {
    // Fallback to the original implementation
    try {
      const url = new URL(rawUrl);

      const connectionLimit = parsePositiveInt(process.env.DB_CONNECTION_LIMIT, 20);
      const poolTimeout = parsePositiveInt(process.env.DB_POOL_TIMEOUT_SECONDS, 15);
      const connectTimeout = parsePositiveInt(process.env.DB_CONNECT_TIMEOUT_SECONDS, 10);

      url.searchParams.set('connection_limit', String(connectionLimit));
      url.searchParams.set('pool_timeout', String(poolTimeout));
      url.searchParams.set('connect_timeout', String(connectTimeout));

      if (process.env.DB_USE_PGBOUNCER === 'true') {
        url.searchParams.set('pgbouncer', 'true');
      }

      return url.toString();
    } catch {
      return rawUrl;
    }
  }
};
