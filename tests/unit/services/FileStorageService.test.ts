import { FileStorageService } from '../../../services/FileStorageService';
import { S3Client } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';

// Mock dependencies
jest.mock('@aws-sdk/client-s3');
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    document: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('FileStorageService Unit Tests', () => {
  let fileStorageService: FileStorageService;
  let mockPrisma: any;

  beforeEach(() => {
    fileStorageService = new FileStorageService();
    mockPrisma = new PrismaClient() as any;
    jest.clearAllMocks();
  });

  describe('validateFile', () => {
    const validFile = {
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
      size: 1024,
    };

    it('should return valid for a file within limits', () => {
      const result = fileStorageService.validateFile(validFile);
      expect(result.valid).toBe(true);
    });

    it('should return error for file exceeding maxSize', () => {
      const result = fileStorageService.validateFile(validFile, { maxSize: 500 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size exceeds');
    });

    it('should return error for disallowed MIME type', () => {
      const result = fileStorageService.validateFile(validFile, { allowedTypes: ['application/pdf'] });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File type image/jpeg is not allowed');
    });

    it('should return error for disallowed extension', () => {
      const result = fileStorageService.validateFile(validFile, { allowedExtensions: ['.png'] });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File extension .jpg is not allowed');
    });
  });

  describe('Progress Tracking', () => {
    it('should track upload progress correctly', async () => {
      const file = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('hello world'),
        size: 11
      };
      
      const onProgress = jest.fn();
      
      // We'll mock uploadFile to not actually call S3
      // But we can test the synchronous behavior or internal state
      const promise = fileStorageService.uploadFile(file, 'user-1', 'IPFS', {}, onProgress);
      
      const fileId = (await promise).fileId;
      const progress = fileStorageService.getUploadProgress(fileId);
      
      expect(progress).toBeDefined();
      expect(progress?.status).toBe('completed');
      expect(onProgress).toHaveBeenCalled();
    });

    it('should handle paused and resumed uploads', () => {
        const fileId = 'test-file-id';
        // Manually set a progress entry
        (fileStorageService as any).uploadQueue.set(fileId, {
            fileId,
            filename: 'test.txt',
            progress: 50,
            status: 'uploading'
        });

        fileStorageService.pauseUpload(fileId);
        expect(fileStorageService.getUploadProgress(fileId)?.status).toBe('paused');

        fileStorageService.resumeUpload(fileId);
        expect(fileStorageService.getUploadProgress(fileId)?.status).toBe('uploading');
    });
  });
});
