import { GraphQLCache, CachePresets } from '../../nepa-dapp/src/graphql/cache';
import { cacheMiddleware, invalidateCache, invalidateUserCache, invalidateCacheByPattern } from '../../middleware/cache';

describe('Cache Invalidation Tests', () => {
  let cache: GraphQLCache;
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    cache = new GraphQLCache(CachePresets.development);
    
    mockReq = {
      method: 'GET',
      path: '/api/user/profile',
      query: {},
      params: {},
      user: { id: 'test-user-id' }
    };
    
    mockRes = {
      statusCode: 200,
      json: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      on: jest.fn()
    };
    
    mockNext = jest.fn();
  });

  afterEach(async () => {
    await cache.clear();
  });

  describe('Cache Middleware', () => {
    it('should cache GET requests', async () => {
      const middleware = cacheMiddleware({ ttl: 300 });
      
      // First call - cache miss
      await middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.set).toHaveBeenCalledWith('X-Cache', 'MISS');
    });

    it('should skip caching for non-GET requests', async () => {
      mockReq.method = 'POST';
      const middleware = cacheMiddleware({ ttl: 300 });
      
      await middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.set).not.toHaveBeenCalledWith('X-Cache', expect.any(String));
    });

    it('should respect cache TTL', async () => {
      const middleware = cacheMiddleware({ ttl: 1 }); // 1 second TTL
      
      // Set cache data
      await cache.set('test-key', { data: 'test' }, 1);
      
      // Should be available immediately
      const cached = await cache.get('test-key');
      expect(cached).toEqual({ data: 'test' });
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should be expired
      const expired = await cache.get('test-key');
      expect(expired).toBeNull();
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate user cache correctly', async () => {
      // Set some user-specific cache entries
      await cache.set('user:test-user-id:profile', { name: 'Test User' });
      await cache.set('user:test-user-id:preferences', { theme: 'dark' });
      await cache.set('user:other-user:profile', { name: 'Other User' });
      
      // Verify cache entries exist
      expect(await cache.get('user:test-user-id:profile')).toBeTruthy();
      expect(await cache.get('user:test-user-id:preferences')).toBeTruthy();
      expect(await cache.get('user:other-user:profile')).toBeTruthy();
      
      // Invalidate user cache
      const invalidatedCount = await invalidateUserCache('test-user-id');
      
      // Verify only target user's cache is invalidated
      expect(invalidatedCount).toBeGreaterThan(0);
      expect(await cache.get('user:test-user-id:profile')).toBeNull();
      expect(await cache.get('user:test-user-id:preferences')).toBeNull();
      expect(await cache.get('user:other-user:profile')).toBeTruthy();
    });

    it('should invalidate cache by pattern', async () => {
      // Set cache entries with different patterns
      await cache.set('payment:123:history', [{ id: 1, amount: 100 }]);
      await cache.set('payment:456:history', [{ id: 2, amount: 200 }]);
      await cache.set('user:123:profile', { name: 'Test User' });
      
      // Verify cache entries exist
      expect(await cache.get('payment:123:history')).toBeTruthy();
      expect(await cache.get('payment:456:history')).toBeTruthy();
      expect(await cache.get('user:123:profile')).toBeTruthy();
      
      // Invalidate payment cache
      const invalidatedCount = await invalidateCacheByPattern('payment');
      
      // Verify only payment cache is invalidated
      expect(invalidatedCount).toBeGreaterThan(0);
      expect(await cache.get('payment:123:history')).toBeNull();
      expect(await cache.get('payment:456:history')).toBeNull();
      expect(await cache.get('user:123:profile')).toBeTruthy();
    });

    it('should handle invalidation middleware correctly', async () => {
      const middleware = invalidateCache({ patterns: ['test'] });
      
      // Mock successful response
      mockRes.statusCode = 200;
      
      await middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });
  });

  describe('Cache Performance', () => {
    it('should maintain good hit rates', async () => {
      // Set up cache entries
      const testData = { id: 1, data: 'test' };
      await cache.set('test-key-1', testData);
      await cache.set('test-key-2', testData);
      await cache.set('test-key-3', testData);
      
      // Generate cache hits
      await cache.get('test-key-1');
      await cache.get('test-key-2');
      await cache.get('test-key-1'); // Hit again
      await cache.get('test-key-3');
      await cache.get('non-existent'); // Miss
      
      const stats = cache.getStats();
      
      expect(stats.hits).toBe(4);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.8, 1);
    });

    it('should handle cache size limits', async () => {
      // Create cache with small size limit
      const smallCache = new GraphQLCache({
        ...CachePresets.development,
        maxSize: 2
      });
      
      // Fill cache beyond limit
      await smallCache.set('key1', 'value1');
      await smallCache.set('key2', 'value2');
      await smallCache.set('key3', 'value3'); // Should evict oldest
      
      const stats = smallCache.getStats();
      expect(stats.size).toBeLessThanOrEqual(2);
      expect(stats.evictions).toBeGreaterThan(0);
      
      await smallCache.disconnect();
    });
  });

  describe('Cache Health', () => {
    it('should report healthy status for good cache', async () => {
      const health = await cache.healthCheck();
      
      expect(health.status).toBe('healthy');
      expect(health.details.memory.size).toBeGreaterThanOrEqual(0);
      expect(health.details.performance.hitRate).toBeGreaterThanOrEqual(0);
    });

    it('should report degraded status for low hit rate', async () => {
      // Generate many misses
      await cache.get('non-existent-1');
      await cache.get('non-existent-2');
      await cache.get('non-existent-3');
      
      const health = await cache.healthCheck();
      
      expect(health.status).toBe('degraded');
      expect(health.details.performance.hitRate).toBeLessThan(0.5);
    });
  });
});
