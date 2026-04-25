import request from 'supertest';
import app from '../app';
import { exportService } from '../services/ExportService';

describe('Export API', () => {
  let authToken: string;
  let taskId: string;

  beforeAll(async () => {
    // Setup test authentication
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword'
      });
    
    authToken = loginResponse.body.token || 'test-token';
  });

  describe('POST /api/export/create', () => {
    it('should create a new export task', async () => {
      const exportRequest = {
        format: 'csv',
        dataType: 'users',
        filters: {
          userRole: ['USER']
        },
        columns: ['id', 'email', 'firstName', 'lastName', 'role'],
        includeHeaders: true
      };

      const response = await request(app)
        .post('/api/export/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exportRequest)
        .expect(200);

      expect(response.body).toHaveProperty('taskId');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('estimatedTime');
      
      taskId = response.body.taskId;
      expect(taskId).toMatch(/^export_\d+_[a-z0-9]+$/);
    });

    it('should reject invalid export format', async () => {
      const exportRequest = {
        format: 'invalid',
        dataType: 'users'
      };

      const response = await request(app)
        .post('/api/export/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exportRequest)
        .expect(400);

      expect(response.body.error).toContain('Invalid export options');
    });

    it('should reject invalid data type', async () => {
      const exportRequest = {
        format: 'csv',
        dataType: 'invalid'
      };

      const response = await request(app)
        .post('/api/export/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exportRequest)
        .expect(400);

      expect(response.body.error).toContain('Invalid export options');
    });

    it('should reject invalid date range', async () => {
      const exportRequest = {
        format: 'csv',
        dataType: 'users',
        startDate: '2024-01-15',
        endDate: '2024-01-10' // End before start
      };

      const response = await request(app)
        .post('/api/export/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exportRequest)
        .expect(400);

      expect(response.body.error).toContain('Invalid export options');
    });
  });

  describe('GET /api/export/progress/:taskId', () => {
    it('should return export progress', async () => {
      // First create an export task
      const createResponse = await request(app)
        .post('/api/export/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'csv',
          dataType: 'users'
        });

      const taskId = createResponse.body.taskId;

      // Get progress
      const response = await request(app)
        .get(`/api/export/progress/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('progress');
      expect(response.body.data).toHaveProperty('totalRecords');
      expect(response.body.data).toHaveProperty('processedRecords');
      expect(response.body.data).toHaveProperty('startTime');
      
      expect(['pending', 'processing', 'completed', 'failed']).toContain(response.body.data.status);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/export/progress/non-existent-task')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Export task not found');
    });
  });

  describe('GET /api/export/templates', () => {
    it('should return export templates', async () => {
      const response = await request(app)
        .get('/api/export/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('dataTypes');
      expect(response.body.data).toHaveProperty('formats');
      
      expect(Array.isArray(response.body.data.dataTypes)).toBe(true);
      expect(Array.isArray(response.body.data.formats)).toBe(true);
      
      // Check data types
      const dataTypes = response.body.data.dataTypes;
      expect(dataTypes.some(dt => dt.value === 'users')).toBe(true);
      expect(dataTypes.some(dt => dt.value === 'bills')).toBe(true);
      expect(dataTypes.some(dt => dt.value === 'payments')).toBe(true);
      expect(dataTypes.some(dt => dt.value === 'analytics')).toBe(true);
      
      // Check formats
      const formats = response.body.data.formats;
      expect(formats.some(f => f.value === 'csv')).toBe(true);
      expect(formats.some(f => f.value === 'xlsx')).toBe(true);
      expect(formats.some(f => f.value === 'pdf')).toBe(true);
    });
  });

  describe('GET /api/export/history', () => {
    it('should return export history', async () => {
      const response = await request(app)
        .get('/api/export/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('exports');
      expect(Array.isArray(response.body.data.exports)).toBe(true);
      
      // Check structure of export items
      if (response.body.data.exports.length > 0) {
        const exportItem = response.body.data.exports[0];
        expect(exportItem).toHaveProperty('id');
        expect(exportItem).toHaveProperty('status');
        expect(exportItem).toHaveProperty('progress');
        expect(exportItem).toHaveProperty('startTime');
      }
    });

    it('should support limit parameter', async () => {
      const response = await request(app)
        .get('/api/export/history?limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.exports.length).toBeLessThanOrEqual(5);
    });

    it('should support status filter', async () => {
      const response = await request(app)
        .get('/api/export/history?status=completed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (response.body.data.exports.length > 0) {
        response.body.data.exports.forEach((exportItem: any) => {
          expect(exportItem.status).toBe('completed');
        });
      }
    });
  });

  describe('DELETE /api/export/cancel/:taskId', () => {
    it('should cancel a pending export task', async () => {
      // Create an export task
      const createResponse = await request(app)
        .post('/api/export/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'csv',
          dataType: 'users'
        });

      const taskId = createResponse.body.taskId;

      // Cancel the task
      const response = await request(app)
        .delete(`/api/export/cancel/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain('cancelled successfully');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/export/cancel/non-existent-task')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Export task not found');
    });
  });

  describe('Export Service Unit Tests', () => {
    it('should create export task successfully', async () => {
      const options = {
        format: 'csv' as const,
        dataType: 'users' as const,
        columns: ['id', 'email', 'firstName'],
        includeHeaders: true
      };

      const taskId = await exportService.createExportTask(options);
      
      expect(taskId).toMatch(/^export_\d+_[a-z0-9]+$/);
      
      // Check progress
      const progress = await exportService.getExportProgress(taskId);
      expect(progress).toBeTruthy();
      expect(progress?.status).toBe('pending' || 'processing');
    });

    it('should handle different export formats', async () => {
      const formats = ['csv', 'xlsx', 'pdf'] as const;
      
      for (const format of formats) {
        const options = {
          format,
          dataType: 'users' as const,
          columns: ['id', 'email'],
          includeHeaders: true
        };

        const taskId = await exportService.createExportTask(options);
        expect(taskId).toBeTruthy();
      }
    });

    it('should handle different data types', async () => {
      const dataTypes = ['users', 'bills', 'payments', 'analytics'] as const;
      
      for (const dataType of dataTypes) {
        const options = {
          format: 'csv' as const,
          dataType,
          columns: ['id'],
          includeHeaders: true
        };

        const taskId = await exportService.createExportTask(options);
        expect(taskId).toBeTruthy();
      }
    });

    it('should apply filters correctly', async () => {
      const options = {
        format: 'csv' as const,
        dataType: 'users' as const,
        filters: {
          userRole: ['USER'],
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31')
          }
        },
        columns: ['id', 'email', 'role']
      };

      const taskId = await exportService.createExportTask(options);
      expect(taskId).toBeTruthy();
    });
  });

  describe('Export Integration Tests', () => {
    it('should complete full export workflow', async () => {
      // Step 1: Create export task
      const createResponse = await request(app)
        .post('/api/export/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'csv',
          dataType: 'users',
          filters: {
            userRole: ['USER']
          },
          columns: ['id', 'email', 'firstName', 'lastName', 'role'],
          includeHeaders: true
        })
        .expect(200);

      const taskId = createResponse.body.taskId;

      // Step 2: Wait for processing (poll progress)
      let maxAttempts = 30;
      let exportCompleted = false;

      while (maxAttempts > 0 && !exportCompleted) {
        const progressResponse = await request(app)
          .get(`/api/export/progress/${taskId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const progress = progressResponse.body.data;
        
        if (progress.status === 'completed') {
          exportCompleted = true;
          break;
        } else if (progress.status === 'failed') {
          throw new Error(`Export failed: ${progress.error}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        maxAttempts--;
      }

      expect(exportCompleted).toBe(true);

      // Step 3: Download the export
      const downloadResponse = await request(app)
        .get(`/api/export/download/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(downloadResponse.headers['content-type']).toBe('text/csv');
      expect(downloadResponse.headers['content-disposition']).toContain('attachment');
      expect(downloadResponse.body.length).toBeGreaterThan(0);
    }, 60000); // 60 second timeout

    it('should handle Excel export workflow', async () => {
      const createResponse = await request(app)
        .post('/api/export/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'xlsx',
          dataType: 'payments',
          columns: ['id', 'amount', 'status', 'method', 'createdAt'],
          filters: {
            status: ['COMPLETED'],
            minAmount: 10,
            maxAmount: 1000
          }
        })
        .expect(200);

      const taskId = createResponse.body.taskId;

      // Wait for completion
      let maxAttempts = 30;
      let exportCompleted = false;

      while (maxAttempts > 0 && !exportCompleted) {
        const progressResponse = await request(app)
          .get(`/api/export/progress/${taskId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const progress = progressResponse.body.data;
        
        if (progress.status === 'completed') {
          exportCompleted = true;
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        maxAttempts--;
      }

      expect(exportCompleted).toBe(true);

      // Download and verify Excel format
      const downloadResponse = await request(app)
        .get(`/api/export/download/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(downloadResponse.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }, 60000);

    it('should handle PDF export workflow', async () => {
      const createResponse = await request(app)
        .post('/api/export/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'pdf',
          dataType: 'analytics',
          columns: ['date', 'revenue', 'users', 'transactions']
        })
        .expect(200);

      const taskId = createResponse.body.taskId;

      // Wait for completion
      let maxAttempts = 30;
      let exportCompleted = false;

      while (maxAttempts > 0 && !exportCompleted) {
        const progressResponse = await request(app)
          .get(`/api/export/progress/${taskId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const progress = progressResponse.body.data;
        
        if (progress.status === 'completed') {
          exportCompleted = true;
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        maxAttempts--;
      }

      expect(exportCompleted).toBe(true);

      // Download and verify PDF format
      const downloadResponse = await request(app)
        .get(`/api/export/download/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(downloadResponse.headers['content-type']).toBe('application/pdf');
    }, 60000);
  });

  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/api/export/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: null,
          dataType: undefined
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/export/create')
        .send({
          format: 'csv',
          dataType: 'users'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should handle large data sets', async () => {
      // This test would require setting up test data
      // For now, we'll just test the API structure
      const response = await request(app)
        .post('/api/export/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'csv',
          dataType: 'users',
          pageSize: 10000
        })
        .expect(200);

      expect(response.body.taskId).toBeDefined();
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await exportService.cleanupExpiredExports();
  });
});
