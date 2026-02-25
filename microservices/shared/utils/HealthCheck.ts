
import { Logger } from './logger';
import { Request, Response } from 'express';
import * as os from 'os';

export interface HealthStatus {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  checks: {
    database: boolean;
    redis: boolean;
    memory: {
      status: 'OK' | 'WARNING' | 'CRITICAL';
      usage: number; // percentage
      heapUsed: number; // MB
    };
    errorRate: {
      status: 'OK' | 'WARNING' | 'CRITICAL';
      rate: number; // errors per minute
    };
  };
  version: string;
  timestamp: string;
}

export class HealthCheckManager {
  private logger: Logger;
  private errorCount: number = 0;
  private lastErrorReset: number = Date.now();
  private readonly ERROR_WINDOW_MS = 60 * 1000; // 1 minute window
  private readonly MEMORY_THRESHOLD_WARNING = 0.85; // 85%
  private readonly MEMORY_THRESHOLD_CRITICAL = 0.95; // 95%
  private readonly ERROR_RATE_THRESHOLD_WARNING = 10; // 10 errors/min
  private readonly ERROR_RATE_THRESHOLD_CRITICAL = 50; // 50 errors/min

  constructor(logger: Logger) {
    this.logger = logger;
    // Reset error count periodically
    setInterval(() => this.resetErrorCount(), this.ERROR_WINDOW_MS);
  }

  public recordError() {
    this.errorCount++;
  }

  private resetErrorCount() {
    this.errorCount = 0;
    this.lastErrorReset = Date.now();
  }

  private getMemoryUsage(): { usage: number; heapUsed: number; status: 'OK' | 'WARNING' | 'CRITICAL' } {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usage = usedMem / totalMem;
    const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024;

    let status: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';
    if (usage > this.MEMORY_THRESHOLD_CRITICAL) status = 'CRITICAL';
    else if (usage > this.MEMORY_THRESHOLD_WARNING) status = 'WARNING';

    return { usage, heapUsed, status };
  }

  private getErrorRateStatus(): { rate: number; status: 'OK' | 'WARNING' | 'CRITICAL' } {
    const elapsedMinutes = (Date.now() - this.lastErrorReset) / 60000;
    // Avoid division by zero or very small numbers
    const rate = elapsedMinutes > 0 ? this.errorCount / elapsedMinutes : this.errorCount;

    let status: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';
    if (rate > this.ERROR_RATE_THRESHOLD_CRITICAL) status = 'CRITICAL';
    else if (rate > this.ERROR_RATE_THRESHOLD_WARNING) status = 'WARNING';

    return { rate, status };
  }

  public async checkHealth(
    dbCheck: () => Promise<boolean>,
    redisCheck: () => Promise<boolean>,
    version: string
  ): Promise<HealthStatus> {
    const dbHealthy = await dbCheck().catch(() => false);
    const redisHealthy = await redisCheck().catch(() => false);
    const memory = this.getMemoryUsage();
    const errorRate = this.getErrorRateStatus();

    let status: 'UP' | 'DOWN' | 'DEGRADED' = 'UP';

    if (!dbHealthy || !redisHealthy || memory.status === 'CRITICAL' || errorRate.status === 'CRITICAL') {
      status = 'DOWN'; // Fail the health check to trigger rollback if critical
    } else if (memory.status === 'WARNING' || errorRate.status === 'WARNING') {
      status = 'DEGRADED';
    }

    return {
      status,
      checks: {
        database: dbHealthy,
        redis: redisHealthy,
        memory,
        errorRate
      },
      version,
      timestamp: new Date().toISOString()
    };
  }

  public middleware() {
    return async (req: Request, res: Response) => {
      // This should be implemented by the specific service using checkHealth
      // For now, return a placeholder or error if called directly without implementation
      res.status(501).json({ error: 'Health check middleware not configured with checks' });
    };
  }
}
