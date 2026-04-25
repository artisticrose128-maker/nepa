import { Request, Response } from 'express';
import { exportService, ExportOptions, ExportFilters } from '../services/ExportService';
import { logger } from '../services/logger';

/**
 * @openapi
 * /api/export/create:
 *   post:
 *     summary: Create a new export task
 *     description: Initiates a new export task with specified format, data type, and filters
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [csv, xlsx, pdf]
 *                 description: Export format
 *               dataType:
 *                 type: string
 *                 enum: [users, bills, payments, analytics, reports]
 *                 description: Type of data to export
 *               filters:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: array
 *                     items:
 *                       type: string
 *                   utilityType:
 *                     type: array
 *                     items:
 *                       type: string
 *                   paymentMethod:
 *                     type: array
 *                     items:
 *                       type: string
 *                   minAmount:
 *                     type: number
 *                   maxAmount:
 *                     type: number
 *                   userRole:
 *                     type: array
 *                     items:
 *                       type: string
 *                   dateRange:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       end:
 *                         type: string
 *                         format: date
 *               columns:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific columns to include
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date for filtering
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date for filtering
 *               includeHeaders:
 *                 type: boolean
 *                 default: true
 *                 description: Include headers in export
 *               pageSize:
 *                 type: integer
 *                 default: 1000
 *                 description: Page size for processing
 *     responses:
 *       200:
 *         description: Export task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taskId:
 *                   type: string
 *                 message:
 *                   type: string
 *                 estimatedTime:
 *                   type: string
 *       400:
 *         description: Invalid export options
 *       500:
 *         description: Failed to create export task
 */
export const createExportTask = async (req: Request, res: Response) => {
  try {
    const exportOptions: ExportOptions = {
      format: req.body.format,
      dataType: req.body.dataType,
      filters: req.body.filters,
      columns: req.body.columns,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      userId: (req as any).user?.id,
      includeHeaders: req.body.includeHeaders !== false,
      pageSize: req.body.pageSize || 1000
    };

    // Validate export options
    const validation = validateExportOptions(exportOptions);
    if (!validation.isValid) {
      return res.status(400).json({
        status: 400,
        error: 'Invalid export options',
        details: validation.errors
      });
    }

    const taskId = await exportService.createExportTask(exportOptions);

    logger.info('Export task created', {
      taskId,
      format: exportOptions.format,
      dataType: exportOptions.dataType,
      userId: exportOptions.userId
    });

    res.status(200).json({
      status: 200,
      taskId,
      message: 'Export task created successfully',
      estimatedTime: estimateExportTime(exportOptions)
    });

  } catch (error) {
    logger.error('Failed to create export task:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to create export task',
      message: error.message
    });
  }
};

/**
 * @openapi
 * /api/export/progress/{taskId}:
 *   get:
 *     summary: Get export task progress
 *     description: Retrieves the current progress and status of an export task
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Export task ID
 *     responses:
 *       200:
 *         description: Export progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [pending, processing, completed, failed]
 *                 progress:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 100
 *                 totalRecords:
 *                   type: integer
 *                 processedRecords:
 *                   type: integer
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                 error:
 *                   type: string
 *                 downloadUrl:
 *                   type: string
 *       404:
 *         description: Export task not found
 *       500:
 *         description: Failed to retrieve export progress
 */
export const getExportProgress = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({
        status: 400,
        error: 'Task ID is required'
      });
    }

    const progress = await exportService.getExportProgress(taskId);

    if (!progress) {
      return res.status(404).json({
        status: 404,
        error: 'Export task not found'
      });
    }

    res.status(200).json({
      status: 200,
      data: progress
    });

  } catch (error) {
    logger.error('Failed to get export progress:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to retrieve export progress',
      message: error.message
    });
  }
};

/**
 * @openapi
 * /api/export/download/{taskId}:
 *   get:
 *     summary: Download exported file
 *     description: Downloads the generated export file
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Export task ID
 *     responses:
 *       200:
 *         description: Export file downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *           application/pdf:
 *             schema:
 *               type: string
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *       404:
 *         description: Export task not found or not completed
 *       500:
 *         description: Failed to download export file
 */
export const downloadExport = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({
        status: 400,
        error: 'Task ID is required'
      });
    }

    const result = await exportService.getExportResult(taskId);

    if (!result) {
      return res.status(404).json({
        status: 404,
        error: 'Export task not found or not completed'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', result.size.toString());

    // Send the file
    if (Buffer.isBuffer(result.data)) {
      res.send(result.data);
    } else {
      (result.data as Readable).pipe(res);
    }

    logger.info('Export file downloaded', {
      taskId,
      filename: result.filename,
      size: result.size,
      userId: (req as any).user?.id
    });

  } catch (error) {
    logger.error('Failed to download export:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to download export file',
      message: error.message
    });
  }
};

/**
 * @openapi
 * /api/export/templates:
 *   get:
 *     summary: Get export templates
 *     description: Retrieves available export templates and configurations
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Export templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dataTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: string
 *                       label:
 *                         type: string
 *                       description:
 *                         type: string
 *                       availableColumns:
 *                         type: array
 *                         items:
 *                           type: string
 *                       availableFilters:
 *                           type: array
 *                           items:
 *                             type: object
 *                 formats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: string
 *                       label:
 *                         type: string
 *                       description:
 *                         type: string
 *                       mimeType:
 *                         type: string
 *       500:
 *         description: Failed to retrieve export templates
 */
export const getExportTemplates = async (req: Request, res: Response) => {
  try {
    const templates = {
      dataTypes: [
        {
          value: 'users',
          label: 'Users',
          description: 'User account information and activity',
          availableColumns: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
          availableFilters: ['userRole', 'dateRange']
        },
        {
          value: 'bills',
          label: 'Bills',
          description: 'Utility bills and invoices',
          availableColumns: ['id', 'userId', 'utilityProviderId', 'amount', 'dueDate', 'status', 'billNumber', 'createdAt'],
          availableFilters: ['status', 'utilityType', 'minAmount', 'maxAmount', 'dateRange']
        },
        {
          value: 'payments',
          label: 'Payments',
          description: 'Payment transactions and history',
          availableColumns: ['id', 'userId', 'billId', 'amount', 'currency', 'status', 'method', 'transactionId', 'createdAt'],
          availableFilters: ['status', 'paymentMethod', 'minAmount', 'maxAmount', 'dateRange']
        },
        {
          value: 'analytics',
          label: 'Analytics',
          description: 'Analytics and reporting data',
          availableColumns: ['date', 'revenue', 'users', 'transactions', 'averageAmount'],
          availableFilters: ['dateRange']
        }
      ],
      formats: [
        {
          value: 'csv',
          label: 'CSV',
          description: 'Comma-separated values format',
          mimeType: 'text/csv'
        },
        {
          value: 'xlsx',
          label: 'Excel',
          description: 'Microsoft Excel format',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        {
          value: 'pdf',
          label: 'PDF',
          description: 'Portable Document Format',
          mimeType: 'application/pdf'
        }
      ]
    };

    res.status(200).json({
      status: 200,
      data: templates
    });

  } catch (error) {
    logger.error('Failed to get export templates:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to retrieve export templates',
      message: error.message
    });
  }
};

/**
 * @openapi
 * /api/export/history:
 *   get:
 *     summary: Get export history
 *     description: Retrieves the user's export task history
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of records to return
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Export history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exports:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       status:
 *                         type: string
 *                       progress:
 *                         type: integer
 *                       totalRecords:
 *                         type: integer
 *                       startTime:
 *                         type: string
 *                       endTime:
 *                         type: string
 *                       downloadUrl:
 *                         type: string
 *       500:
 *         description: Failed to retrieve export history
 */
export const getExportHistory = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const userId = (req as any).user?.id;

    // In a real implementation, this would query a database for user's export history
    // For now, we'll return a mock response
    const history = [
      {
        id: 'export_1234567890_abc123',
        status: 'completed',
        progress: 100,
        totalRecords: 1250,
        processedRecords: 1250,
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() - 3000000).toISOString(),
        downloadUrl: '/api/export/download/export_1234567890_abc123',
        format: 'csv',
        dataType: 'payments',
        filename: 'payments_export_2024-01-15.csv'
      },
      {
        id: 'export_1234567891_def456',
        status: 'processing',
        progress: 45,
        totalRecords: 5000,
        processedRecords: 2250,
        startTime: new Date(Date.now() - 600000).toISOString(),
        format: 'xlsx',
        dataType: 'users',
        filename: 'users_export_2024-01-15.xlsx'
      }
    ];

    const filteredHistory = status 
      ? history.filter(item => item.status === status)
      : history;

    res.status(200).json({
      status: 200,
      data: filteredHistory.slice(0, limit)
    });

  } catch (error) {
    logger.error('Failed to get export history:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to retrieve export history',
      message: error.message
    });
  }
};

/**
 * @openapi
 * /api/export/cancel/{taskId}:
 *   delete:
 *     summary: Cancel export task
 *     description: Cancels a pending or processing export task
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Export task ID
 *     responses:
 *       200:
 *         description: Export task cancelled successfully
 *       404:
 *         description: Export task not found
 *       400:
 *         description: Cannot cancel completed task
 *       500:
 *         description: Failed to cancel export task
 */
export const cancelExportTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({
        status: 400,
        error: 'Task ID is required'
      });
    }

    const progress = await exportService.getExportProgress(taskId);

    if (!progress) {
      return res.status(404).json({
        status: 404,
        error: 'Export task not found'
      });
    }

    if (progress.status === 'completed') {
      return res.status(400).json({
        status: 400,
        error: 'Cannot cancel completed export task'
      });
    }

    // In a real implementation, this would cancel the background task
    // For now, we'll just update the status
    progress.status = 'failed';
    progress.error = 'Cancelled by user';
    progress.endTime = new Date();

    logger.info('Export task cancelled', { taskId });

    res.status(200).json({
      status: 200,
      message: 'Export task cancelled successfully'
    });

  } catch (error) {
    logger.error('Failed to cancel export task:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to cancel export task',
      message: error.message
    });
  }
};

// Helper functions
function validateExportOptions(options: ExportOptions): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!['csv', 'xlsx', 'pdf'].includes(options.format)) {
    errors.push('Invalid format. Must be csv, xlsx, or pdf');
  }

  if (!['users', 'bills', 'payments', 'analytics', 'reports'].includes(options.dataType)) {
    errors.push('Invalid data type');
  }

  if (options.startDate && options.endDate && options.startDate > options.endDate) {
    errors.push('Start date must be before end date');
  }

  if (options.filters?.minAmount && options.filters?.maxAmount && 
      options.filters.minAmount > options.filters.maxAmount) {
    errors.push('Minimum amount must be less than maximum amount');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function estimateExportTime(options: ExportOptions): string {
  // Simple estimation based on data type and format
  const baseTime = {
    users: 30,
    bills: 45,
    payments: 60,
    analytics: 20,
    reports: 40
  };

  const formatMultiplier = {
    csv: 1,
    xlsx: 1.5,
    pdf: 2
  };

  const estimatedSeconds = (baseTime[options.dataType] || 30) * 
                          (formatMultiplier[options.format] || 1);

  if (estimatedSeconds < 60) {
    return `${Math.round(estimatedSeconds)} seconds`;
  } else {
    return `${Math.round(estimatedSeconds / 60)} minutes`;
  }
}
