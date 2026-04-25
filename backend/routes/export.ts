import { Router } from 'express';
import {
  startExport,
  getExportProgress,
  getAllExports,
  downloadExport,
  cleanupExports,
  getExportTemplates
} from '../controllers/ExportController';
import { authenticateToken } from '../middleware/auth';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Rate limiting for export endpoints
const exportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 export requests per window
  message: {
    error: 'Too many export requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const downloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 download requests per window
  message: {
    error: 'Too many download requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply authentication to all export routes
router.use(authenticateToken);

// Export routes
router.post('/', exportLimiter, startExport);
router.get('/progress/:exportId', getExportProgress);
router.get('/progress', getAllExports);
router.get('/templates', getExportTemplates);
router.get('/download/:exportId', downloadLimiter, downloadExport);
router.post('/cleanup', cleanupExports);

export default router;
