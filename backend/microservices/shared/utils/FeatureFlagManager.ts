
import { Redis } from 'ioredis';
import { Logger } from './logger';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  percentage?: number; // 0-100 for percentage rollout
  users?: string[]; // Specific user IDs allowed
  segments?: string[]; // User segments (e.g., 'beta-testers', 'internal')
}

export class FeatureFlagManager {
  private redis: Redis;
  private logger: Logger;
  private prefix = 'feature_flags:';

  constructor(redisClient: Redis, logger: Logger) {
    this.redis = redisClient;
    this.logger = logger;
  }

  /**
   * Initialize or update a feature flag definition
   */
  async setFlag(flag: FeatureFlag): Promise<void> {
    const key = `${this.prefix}${flag.name}`;
    await this.redis.set(key, JSON.stringify(flag));
    this.logger.info(`Feature flag updated: ${flag.name}`, { flag });
  }

  /**
   * Get feature flag definition
   */
  async getFlag(name: string): Promise<FeatureFlag | null> {
    const key = `${this.prefix}${name}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Check if a feature is enabled for a specific context (user, segment)
   */
  async isEnabled(flagName: string, context: { userId?: string; segments?: string[] } = {}): Promise<boolean> {
    const flag = await this.getFlag(flagName);

    if (!flag) {
      return false; // Default to disabled if not found
    }

    if (!flag.enabled) {
      return false; // Globally disabled
    }

    // If no specific rollout strategy is defined, it's enabled for everyone
    if (flag.percentage === undefined && !flag.users && !flag.segments) {
      return true;
    }

    // Check specific user allowlist
    if (flag.users && context.userId && flag.users.includes(context.userId)) {
      return true;
    }

    // Check segments
    if (flag.segments && context.segments) {
      const hasSegment = flag.segments.some(s => context.segments?.includes(s));
      if (hasSegment) return true;
    }

    // Check percentage rollout (sticky based on userId)
    if (flag.percentage !== undefined && context.userId) {
      const hash = this.hashString(context.userId + flagName);
      const normalized = hash % 100;
      return normalized < flag.percentage;
    }

    return false;
  }

  /**
   * Simple hash function for sticky rollout
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Disable a feature instantly (kill switch)
   */
  async disableFlag(name: string): Promise<void> {
    const flag = await this.getFlag(name);
    if (flag) {
      flag.enabled = false;
      await this.setFlag(flag);
      this.logger.warn(`Feature flag disabled via kill switch: ${name}`);
    }
  }
}
