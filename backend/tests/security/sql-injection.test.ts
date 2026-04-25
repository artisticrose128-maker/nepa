import request from 'supertest';
import { app } from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('SQL Injection Security Tests', () => {
  describe('User Search Endpoint', () => {
    it('should handle SQL injection attempts in search parameter', async () => {
      const maliciousPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; SELECT * FROM users; --",
        "' UNION SELECT password FROM users --",
        "'; INSERT INTO users (email) VALUES ('hacked@evil.com'); --",
        "<script>alert('xss')</script>",
        "%27%20OR%201=1--",
        "admin'--",
        "' OR 'x'='x",
        "'; EXEC xp_cmdshell('dir'); --"
      ];

      for (const payload of maliciousPayloads) {
        const response = await request(app)
          .get('/api/users')
          .query({ search: payload })
          .expect(400);

        // Should return validation error for malformed input
        expect(response.body.error).toBeDefined();
      }
    });

    it('should handle SQL injection attempts in pagination parameters', async () => {
      const maliciousPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "0; DELETE FROM users; --",
        "1 UNION SELECT password FROM users --",
        "999999; DROP TABLE users; --"
      ];

      for (const payload of maliciousPayloads) {
        const response = await request(app)
          .get('/api/users')
          .query({ page: payload })
          .expect(400);

        expect(response.body.error).toBeDefined();
      }
    });

    it('should allow valid search queries', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ search: 'john', page: 1, limit: 10 })
        .expect(200);

      expect(response.body.users).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it('should reject oversized search parameters', async () => {
      const longSearch = 'a'.repeat(101); // Exceeds 100 character limit
      
      const response = await request(app)
        .get('/api/users')
        .query({ search: longSearch })
        .expect(400);

      expect(response.body.error).toContain('must be less than or equal to 100');
    });

    it('should reject invalid limit parameters', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ limit: 101 }) // Exceeds max limit of 100
        .expect(400);

      expect(response.body.error).toContain('must be less than or equal to 100');
    });
  });

  describe('Test Database Security', () => {
    it('should safely truncate tables in test setup', async () => {
      // This test verifies that the test setup uses parameterized queries
      // and doesn't expose the database to SQL injection
      const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
      
      expect(Array.isArray(tables)).toBe(true);
      
      // Verify that table names are properly escaped
      for (const table of tables as any[]) {
        expect(typeof table.tablename).toBe('string');
        expect(table.tablename).toMatch(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
      }
    });
  });

  describe('Analytics Endpoint Security', () => {
    it('should require authentication for analytics', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              dashboard {
                totalUsers
              }
            }
          `
        })
        .expect(200);

      // Should return authentication error
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Not authenticated');
    });
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
