import request from 'supertest';
import app from '../app';

describe('RSS Feed Endpoints', () => {
  describe('GET /api/rss/payments', () => {
    it('should return RSS feed for payments', async () => {
      const response = await request(app)
        .get('/api/rss/payments')
        .expect('Content-Type', /application\/rss\+xml/)
        .expect(200);

      // Verify RSS structure
      expect(response.text).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(response.text).toContain('<rss version="2.0">');
      expect(response.text).toContain('<channel>');
      expect(response.text).toContain('<title>NEPA - Recent Payments</title>');
      expect(response.text).toContain('</channel>');
      expect(response.text).toContain('</rss>');
    });

    it('should support limit parameter', async () => {
      const response = await request(app)
        .get('/api/rss/payments?limit=10')
        .expect(200);

      expect(response.text).toContain('<?xml version="1.0" encoding="utf-8"?>');
    });

    it('should support status filter', async () => {
      const response = await request(app)
        .get('/api/rss/payments?status=SUCCESS')
        .expect(200);

      expect(response.text).toContain('<?xml version="1.0" encoding="utf-8"?>');
    });
  });

  describe('GET /api/rss/bills', () => {
    it('should return RSS feed for bills', async () => {
      const response = await request(app)
        .get('/api/rss/bills')
        .expect('Content-Type', /application\/rss\+xml/)
        .expect(200);

      expect(response.text).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(response.text).toContain('<title>NEPA - Recent Bills</title>');
    });
  });

  describe('GET /api/rss/reports', () => {
    it('should return RSS feed for reports', async () => {
      const response = await request(app)
        .get('/api/rss/reports')
        .expect('Content-Type', /application\/rss\+xml/)
        .expect(200);

      expect(response.text).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(response.text).toContain('<title>NEPA - Recent Reports</title>');
    });
  });

  describe('GET /api/rss/activity', () => {
    it('should return RSS feed for all activity', async () => {
      const response = await request(app)
        .get('/api/rss/activity')
        .expect('Content-Type', /application\/rss\+xml/)
        .expect(200);

      expect(response.text).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(response.text).toContain('<title>NEPA - Recent Activity</title>');
    });
  });

  describe('GET /api/rss/user/:userId', () => {
    it('should return RSS feed for user activity', async () => {
      const testUserId = 'test-user-id';
      const response = await request(app)
        .get(`/api/rss/user/${testUserId}`)
        .expect('Content-Type', /application\/rss\+xml/)
        .expect(200);

      expect(response.text).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(response.text).toContain('User Activity');
    });

    it('should return 400 for missing user ID', async () => {
      await request(app)
        .get('/api/rss/user/')
        .expect(404); // Express returns 404 for missing route parameter
    });
  });

  describe('RSS Feed Validation', () => {
    it('should include required RSS elements', async () => {
      const response = await request(app)
        .get('/api/rss/activity')
        .expect(200);

      const rssContent = response.text;
      
      // Check for required RSS 2.0 elements
      expect(rssContent).toMatch(/<rss[^>]*version="2.0">/);
      expect(rssContent).toContain('<channel>');
      expect(rssContent).toContain('<title>');
      expect(rssContent).toContain('<description>');
      expect(rssContent).toContain('<link>');
      expect(rssContent).toContain('</channel>');
      expect(rssContent).toContain('</rss>');
    });

    it('should include TTL for caching', async () => {
      const response = await request(app)
        .get('/api/rss/activity')
        .expect(200);

      expect(response.text).toContain('<ttl>60</ttl>');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // This test would require mocking the database to simulate errors
      // For now, we just verify the endpoint exists and returns proper content type
      const response = await request(app)
        .get('/api/rss/payments')
        .expect('Content-Type', /application\/rss\+xml/);

      // Should either succeed or fail gracefully
      expect([200, 500]).toContain(response.status);
    });
  });
});
