import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { apiLimiter, ddosDetector, checkBlockedIP, ipRestriction, progressiveLimiter, authLimiter } from './middleware/rateLimiter';
import { configureSecurity } from './middleware/security';
import { apiKeyAuth } from './middleware/auth';
import { loggingMiddleware, setupGlobalErrorHandling, errorTracker, logger } from './middleware/logger';
import { errorTracker as abuseDetector } from './middleware/abuseDetection';

import { upload } from './middleware/upload';
import { uploadDocument } from './controllers/DocumentController';
import { getDashboardData, generateReport, exportData } from './controllers/AnalyticsController';
import { applyPaymentSecurity, processPayment, getPaymentHistory, validatePayment } from './controllers/PaymentController';
import { setupRateLimitRoutes } from './routes/rateLimitRoutes';
import auditRoutes from './routes/auditRoutes';
import fraudRoutes from './routes/fraudRoutes';

import { auditCleanupService } from './services/AuditCleanupService';
import { registerAuditHandlers } from './databases/event-patterns/handlers/auditHandlers';
import { EventBus } from './databases/event-patterns/EventBus';
import { AuthenticationController } from './controllers/AuthenticationController';
import { UserController } from './controllers/UserController';
import { authenticate, authorize } from './middleware/authentication';

// Define UserRole locally since it's not exported from @prisma/client
enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// Initialize controllers
const authController = new AuthenticationController();
const userController = new UserController();

// Mock services for now - replace with actual implementations
const performanceMonitor = {
  getHealthStatus: () => ({ status: 'healthy' }),
  getMemoryUsage: () => ({ heapUsed: 0, heapTotal: 0, external: 0 }),
  getRequestMetrics: (limit: number) => [],
  getCustomMetrics: (limit: number) => []
};

const analyticsService = {
  getAnalyticsData: () => ({ userEvents: [], activeUsers: 0 })
};

const app = express();

// Initialize cache system on startup
initializeCacheSystem().then(result => {
  if (result.success) {
    logger.info('Cache system initialized successfully', {
      initializationTime: result.metrics.initializationTime,
      services: result.services
    });
  } else {
    logger.error('Cache system initialization failed', {
      errors: result.errors,
      warnings: result.warnings
    });
  }
}).catch(error => {
  logger.error('Cache system initialization error:', error);
});

// Initialize logging and monitoring
logger.info('Application starting up', { 
  nodeEnv: process.env.NODE_ENV,
  version: process.env.npm_package_version 
});

// Initialize error tracking if DSN is provided
if (process.env.SENTRY_DSN) {
  errorTracker.initialize({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    release: process.env.npm_package_version
  });
}

// 1. Comprehensive logging middleware (should be first)
app.use(...loggingMiddleware);

// 2. DDoS Protection and IP Blocking
app.use(ddosDetector);
app.use(checkBlockedIP);
app.use(ipRestriction);

// 3. Security Headers & CORS
configureSecurity(app);

// 4. Body Parsing
app.use(express.json({ limit: '10kb' })); // Limit body size for security

// 5. Progressive Rate Limiting
app.use('/api', progressiveLimiter);

// 6. Audit Context Capture (before rate limiting to capture all requests)
app.use('/api', captureAuditContext);

// 7. Advanced rate limiting is applied by setupRateLimitRoutes(app)

// 8. Audit rate limit breaches
app.use('/api', auditRateLimit);

// 9. Error tracking for abuse detection
app.use(abuseDetector);

// 10. Setup rate limiting routes
setupRateLimitRoutes(app);

// 11. Audit Routes
app.use('/api/audit', auditRoutes);

// 11b. Fraud detection API (ML scoring 0-100, manual review workflow, adaptive learning)
app.use('/api/fraud', fraudRoutes);

n


// 12. API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api-docs/v1', swaggerUi.serve, swaggerUi.setup(getVersionedSwaggerSpec('v1')));
app.use('/api-docs/v2', swaggerUi.serve, swaggerUi.setup(getVersionedSwaggerSpec('v2')));

// 11. Enhanced Health Check
app.get('/health', (req, res) => {
  const healthStatus = performanceMonitor.getHealthStatus();
  const memoryUsage = performanceMonitor.getMemoryUsage();
  
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    performance: healthStatus,
    memory: {
      used: memoryUsage.heapUsed,
      total: memoryUsage.heapTotal,
      external: memoryUsage.external
    },
    analytics: {
      totalEvents: analyticsService.getAnalyticsData().userEvents.length,
      activeUsers: analyticsService.getAnalyticsData().activeUsers
    }
  });
});

// 10. Monitoring endpoints (unversioned)
app.get('/api/monitoring/metrics', apiKeyAuth, (req, res) => {
  const analytics = analyticsService.getAnalyticsData();
  const performance = performanceMonitor.getHealthStatus();

  res.json({
    analytics,
    performance,
    requestMetrics: performanceMonitor.getRequestMetrics(100),
    customMetrics: performanceMonitor.getCustomMetrics(100)
  });
});

// 11. API version discovery (no auth required for discovery)
app.get('/api/versions', (_req, res) => {
  res.json({
    defaultVersion: apiVersioningConfig.defaultVersion,
    latestVersion: apiVersioningConfig.latestVersion,
    supportedVersions: apiVersioningConfig.supportedVersions,
    lifecycle: apiVersioningConfig.lifecycle,
  });
});

// 12. Authentication endpoints with comprehensive audit logging
app.post('/api/auth/register', 
  authLimiter, 
  auditAuth(AuditAction.USER_REGISTER), 
  authController.register.bind(authController)
);
app.post('/api/auth/login', 
  authLimiter, 
  auditAuth(AuditAction.USER_LOGIN), 
  authController.login.bind(authController)
);
app.post('/api/auth/logout', 
  authenticate, 
  auditAuth(AuditAction.USER_LOGOUT), 
  authController.logout.bind(authController)
);

// 13. User profile endpoints with audit logging
app.get('/api/user/profile', authenticate, authController.getProfile.bind(authController));
app.put('/api/user/profile', 
  authenticate, 
  auditAuth(AuditAction.USER_UPDATE_PROFILE), 
  userController.updateProfile.bind(userController)
);
app.post('/api/user/change-password', 
  authenticate, 
  auditAuth(AuditAction.USER_CHANGE_PASSWORD), 
  userController.changePassword.bind(userController)
);

// 14. Admin user management endpoints with audit logging
app.get('/api/admin/users', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  auditAdmin(AuditAction.ADMIN_VIEW_USER_DATA, 'user'),
  userController.getAllUsers.bind(userController)
);
app.put('/api/admin/users/:id/role', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  auditAdmin(AuditAction.ADMIN_UPDATE_USER_ROLE, 'user'),
  userController.updateUserRole.bind(userController)
);
app.delete('/api/admin/users/:id', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  auditAdmin(AuditAction.ADMIN_DELETE_USER, 'user'),
  userController.deleteUser.bind(userController)
);

// 15. Payment endpoints with comprehensive audit logging
app.post('/api/payment/process', 
  ...applyPaymentSecurity, 
  auditPayment(AuditAction.PAYMENT_INITIATE),
  processPayment
);

// 16. Document upload with audit logging
app.post('/api/documents/upload', 
  apiKeyAuth, 
  upload.single('file'), 
  auditDocument(AuditAction.DOCUMENT_UPLOAD),
  uploadDocument
);

// Analytics Routes
/**
 * @openapi
 * /api/documents/upload:
 *   post:
 *     summary: Upload a document
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 */
app.get('/api/analytics/dashboard', apiKeyAuth, getDashboardData);

/**
 * @openapi
 * /api/analytics/reports:
 *   post:
 *     summary: Generate and save a custom report
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       201:
 *         description: Report created
 */
app.post('/api/analytics/reports', apiKeyAuth, generateReport);
app.get('/api/analytics/export', apiKeyAuth, exportData);

// Additional authentication routes for wallet login and 2FA
app.post('/api/auth/wallet', 
  authLimiter, 
  auditAuth(AuditAction.USER_LOGIN), 
  authController.loginWithWallet.bind(authController)
);
app.post('/api/auth/refresh', 
  authLimiter, 
  authController.refreshToken.bind(authController)
);

// Two-factor authentication endpoints
app.post('/api/user/2fa/enable', 
  authenticate, 
  auditAuth(AuditAction.USER_ENABLE_2FA), 
  authController.enableTwoFactor.bind(authController)
);
app.post('/api/user/2fa/disable', 
  authenticate, 
  auditAuth(AuditAction.USER_DISABLE_2FA), 
  authController.disableTwoFactor.bind(authController)
);

// User sessions
app.get('/api/user/sessions', authenticate, userController.getUserSessions.bind(userController));
app.delete('/api/user/sessions/:sessionId', 
  authenticate, 
  auditAuth(AuditAction.USER_REVOKE_SESSION), 
  userController.revokeSession.bind(userController)
);

// Initialize audit system
const initializeAuditSystem = async () => {
  try {
    // Register audit event handlers
    const eventBus = EventBus.getInstance();
    registerAuditHandlers(eventBus);
    
    // Start audit cleanup service
    auditCleanupService.start();
    
    logger.info('Audit system initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize audit system:', error);
  }
};

// Initialize audit system on startup
initializeAuditSystem();

// Cache Management Routes (Admin only)
app.use('/api/cache', cacheRoutes);

export default app;