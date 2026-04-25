import request from 'supertest';
import app from '../../app';
import path from 'path';
import fs from 'fs';

describe('Document Upload API Integration Tests', () => {
  const uploadDir = path.join(__dirname, '../../uploads');
  
  beforeAll(() => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
  });

  afterAll(() => {
    // Optionally clean up the upload directory
    // fs.rmdirSync(uploadDir, { recursive: true });
  });

  it('should upload a file successfully', async () => {
    const res = await request(app)
      .post('/api/documents/upload')
      .set('x-api-key', 'valid-api-key') // Using API authentication
      .field('userId', 'user123')
      .attach('file', Buffer.from('Testing contents'), 'test.txt');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('fileName', 'test.txt');
  });

  it('should return 413 error for a file exceeding the 50MB limit', async () => {
    // Creating a buffer larger than 50MB (e.g. 51MB)
    const largeBuffer = Buffer.alloc(51 * 1024 * 1024);
    
    const res = await request(app)
      .post('/api/documents/upload')
      .set('x-api-key', 'valid-api-key')
      .field('userId', 'user123')
      .attach('file', largeBuffer, 'large_file.zip');

    expect(res.status).toBe(413);
    expect(res.body.error).toBe('File too large');
    expect(res.body.message).toMatch(/exceeds/);
  });

  it('should return 400 error for missing user ID', async () => {
    const res = await request(app)
      .post('/api/documents/upload')
      .set('x-api-key', 'valid-api-key')
      .attach('file', Buffer.from('Missing user data'), 'test.txt');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('User ID is required');
  });

  it('should return 400 error for invalid field name', async () => {
    const res = await request(app)
      .post('/api/documents/upload')
      .set('x-api-key', 'valid-api-key')
      .field('userId', 'user123')
      .attach('invalid_field', Buffer.from('Unexpected field'), 'test.txt');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('File upload error');
  });
});
