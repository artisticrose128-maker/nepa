import { AuthenticationService } from '../../../services/AuthenticationService';
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userProfile: {
      create: jest.fn(),
    },
    userSession: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
        create: jest.fn()
    }
  })),
  UserRole: { USER: 'USER', ADMIN: 'ADMIN', SUPER_ADMIN: 'SUPER_ADMIN' },
  UserStatus: { ACTIVE: 'ACTIVE', PENDING_VERIFICATION: 'PENDING_VERIFICATION' }
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthenticationService Unit Tests', () => {
  let authService: AuthenticationService;
  let mockPrisma: any;

  beforeEach(() => {
    authService = new AuthenticationService();
    mockPrisma = new PrismaClient() as any;
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      };

      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'user-1', ...registerData });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await authService.register(registerData);

      expect(result.success).toBe(true);
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockPrisma.userProfile.create).toHaveBeenCalled();
    });

    it('should return error if user already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ email: 'test@example.com' });

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already registered');
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has required role', async () => {
      const user = { role: UserRole.ADMIN } as any;
      const result = await authService.hasPermission(user, UserRole.USER);
      expect(result).toBe(true);
    });

    it('should return false if user has insufficient role', async () => {
      const user = { role: UserRole.USER } as any;
      const result = await authService.hasPermission(user, UserRole.ADMIN);
      expect(result).toBe(false);
    });
  });
});
