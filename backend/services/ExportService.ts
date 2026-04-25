import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { createObjectCsvWriter } from 'csv-writer';
import { Readable } from 'stream';
import { logger } from './logger';

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  dataType: 'users' | 'bills' | 'payments' | 'analytics' | 'reports';
  filters?: ExportFilters;
  columns?: string[];
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  includeHeaders?: boolean;
  pageSize?: number;
}

export interface ExportFilters {
  status?: string[];
  utilityType?: string[];
  paymentMethod?: string[];
  minAmount?: number;
  maxAmount?: number;
  userRole?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ExportProgress {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  downloadUrl?: string;
}

export interface ExportResult {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  data: Buffer | Readable;
  metadata: {
    totalRecords: number;
    exportDate: Date;
    filters: ExportFilters;
    columns: string[];
  };
}

class ExportService {
  private prisma: PrismaClient;
  private progressCache: Map<string, ExportProgress> = new Map();

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createExportTask(options: ExportOptions): Promise<string> {
    const taskId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const progress: ExportProgress = {
      id: taskId,
      status: 'pending',
      progress: 0,
      totalRecords: 0,
      processedRecords: 0,
      startTime: new Date()
    };

    this.progressCache.set(taskId, progress);

    // Start export processing in background
    this.processExport(taskId, options).catch(error => {
      logger.error('Export processing failed:', error);
      const failedProgress = this.progressCache.get(taskId);
      if (failedProgress) {
        failedProgress.status = 'failed';
        failedProgress.error = error.message;
        failedProgress.endTime = new Date();
      }
    });

    return taskId;
  }

  private async processExport(taskId: string, options: ExportOptions): Promise<void> {
    const progress = this.progressCache.get(taskId);
    if (!progress) throw new Error('Export task not found');

    try {
      progress.status = 'processing';
      
      // Get total record count
      const totalRecords = await this.getTotalRecords(options.dataType, options.filters);
      progress.totalRecords = totalRecords;

      // Generate export data
      const result = await this.generateExport(options, (processed) => {
        const currentProgress = this.progressCache.get(taskId);
        if (currentProgress) {
          currentProgress.processedRecords = processed;
          currentProgress.progress = Math.round((processed / totalRecords) * 100);
        }
      });

      progress.status = 'completed';
      progress.endTime = new Date();
      progress.downloadUrl = `/api/export/download/${taskId}`;
      
      // Store result for download
      await this.storeExportResult(taskId, result);
      
    } catch (error) {
      progress.status = 'failed';
      progress.error = error.message;
      progress.endTime = new Date();
      throw error;
    }
  }

  async getExportProgress(taskId: string): Promise<ExportProgress | null> {
    return this.progressCache.get(taskId) || null;
  }

  async getExportResult(taskId: string): Promise<ExportResult | null> {
    // This would typically retrieve from storage (S3, local file system, etc.)
    // For now, we'll regenerate the export
    const progress = this.progressCache.get(taskId);
    if (!progress || progress.status !== 'completed') {
      return null;
    }

    // Regenerate export (in production, this would retrieve from storage)
    const options = this.getStoredExportOptions(taskId);
    if (!options) return null;

    return await this.generateExport(options);
  }

  private async getTotalRecords(dataType: string, filters?: ExportFilters): Promise<number> {
    switch (dataType) {
      case 'users':
        return await this.prisma.user.count({
          where: this.buildUserFilters(filters)
        });
      case 'bills':
        return await this.prisma.bill.count({
          where: this.buildBillFilters(filters)
        });
      case 'payments':
        return await this.prisma.payment.count({
          where: this.buildPaymentFilters(filters)
        });
      case 'analytics':
        // For analytics, we'll estimate based on the data type
        return 1000; // Placeholder
      case 'reports':
        return await this.prisma.$queryRaw`SELECT COUNT(*) as count FROM reports`; // Placeholder
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }
  }

  private async generateExport(
    options: ExportOptions,
    onProgress?: (processed: number) => void
  ): Promise<ExportResult> {
    const { format, dataType, filters, columns, startDate, endDate } = options;
    const filename = this.generateFilename(dataType, format);
    const timestamp = new Date();

    let data: any[];
    let selectedColumns = columns;

    switch (dataType) {
      case 'users':
        data = await this.getUsersData(filters, selectedColumns, startDate, endDate);
        selectedColumns = selectedColumns || ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'];
        break;
      case 'bills':
        data = await this.getBillsData(filters, selectedColumns, startDate, endDate);
        selectedColumns = selectedColumns || ['id', 'userId', 'utilityProviderId', 'amount', 'dueDate', 'status', 'billNumber', 'createdAt'];
        break;
      case 'payments':
        data = await this.getPaymentsData(filters, selectedColumns, startDate, endDate);
        selectedColumns = selectedColumns || ['id', 'userId', 'billId', 'amount', 'currency', 'status', 'method', 'transactionId', 'createdAt'];
        break;
      case 'analytics':
        data = await this.getAnalyticsData(filters, selectedColumns, startDate, endDate);
        selectedColumns = selectedColumns || ['date', 'revenue', 'users', 'transactions', 'averageAmount'];
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }

    if (onProgress) {
      onProgress(data.length);
    }

    let exportData: Buffer | Readable;
    let mimeType: string;

    switch (format) {
      case 'csv':
        exportData = await this.generateCSV(data, selectedColumns, options.includeHeaders);
        mimeType = 'text/csv';
        break;
      case 'xlsx':
        exportData = await this.generateXLSX(data, selectedColumns, dataType);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'pdf':
        exportData = await this.generatePDF(data, selectedColumns, dataType);
        mimeType = 'application/pdf';
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    return {
      id: `export_${Date.now()}`,
      filename,
      mimeType,
      size: Buffer.isBuffer(exportData) ? exportData.length : 0,
      data: exportData,
      metadata: {
        totalRecords: data.length,
        exportDate: timestamp,
        filters: filters || {},
        columns: selectedColumns
      }
    };
  }

  private async getUsersData(filters?: ExportFilters, columns?: string[], startDate?: Date, endDate?: Date): Promise<any[]> {
    const where = this.buildUserFilters(filters);
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return await this.prisma.user.findMany({
      where,
      select: this.buildSelect(columns, ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt']),
      orderBy: { createdAt: 'desc' }
    });
  }

  private async getBillsData(filters?: ExportFilters, columns?: string[], startDate?: Date, endDate?: Date): Promise<any[]> {
    const where = this.buildBillFilters(filters);
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return await this.prisma.bill.findMany({
      where,
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        utilityProvider: { select: { name: true, type: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  private async getPaymentsData(filters?: ExportFilters, columns?: string[], startDate?: Date, endDate?: Date): Promise<any[]> {
    const where = this.buildPaymentFilters(filters);
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return await this.prisma.payment.findMany({
      where,
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        bill: { select: { billNumber: true, dueDate: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  private async getAnalyticsData(filters?: ExportFilters, columns?: string[], startDate?: Date, endDate?: Date): Promise<any[]> {
    // This would integrate with the existing AnalyticsService
    // For now, return sample data
    return [
      { date: '2024-01-01', revenue: 15000, users: 120, transactions: 89, averageAmount: 168.54 },
      { date: '2024-01-02', revenue: 18500, users: 135, transactions: 102, averageAmount: 181.37 },
      { date: '2024-01-03', revenue: 22100, users: 148, transactions: 118, averageAmount: 187.29 }
    ];
  }

  private buildUserFilters(filters?: ExportFilters): any {
    if (!filters) return {};
    
    const where: any = {};
    
    if (filters.userRole && filters.userRole.length > 0) {
      where.role = { in: filters.userRole };
    }
    
    if (filters.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      };
    }
    
    return where;
  }

  private buildBillFilters(filters?: ExportFilters): any {
    if (!filters) return {};
    
    const where: any = {};
    
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }
    
    if (filters.utilityType && filters.utilityType.length > 0) {
      where.utilityProvider = {
        type: { in: filters.utilityType }
      };
    }
    
    if (filters.minAmount || filters.maxAmount) {
      where.amount = {};
      if (filters.minAmount) where.amount.gte = filters.minAmount;
      if (filters.maxAmount) where.amount.lte = filters.maxAmount;
    }
    
    if (filters.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      };
    }
    
    return where;
  }

  private buildPaymentFilters(filters?: ExportFilters): any {
    if (!filters) return {};
    
    const where: any = {};
    
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }
    
    if (filters.paymentMethod && filters.paymentMethod.length > 0) {
      where.method = { in: filters.paymentMethod };
    }
    
    if (filters.minAmount || filters.maxAmount) {
      where.amount = {};
      if (filters.minAmount) where.amount.gte = filters.minAmount;
      if (filters.maxAmount) where.amount.lte = filters.maxAmount;
    }
    
    if (filters.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      };
    }
    
    return where;
  }

  private buildSelect(columns?: string[], defaultColumns?: string[]): any {
    if (!columns || columns.length === 0) {
      return defaultColumns?.reduce((acc, col) => ({ ...acc, [col]: true }), {}) || {};
    }
    
    return columns.reduce((acc, col) => ({ ...acc, [col]: true }), {});
  }

  private async generateCSV(data: any[], columns: string[], includeHeaders = true): Promise<Buffer> {
    const csvWriter = createObjectCsvWriter({
      path: 'temp.csv',
      header: columns.map(col => ({ id: col, title: col }))
    });

    if (includeHeaders) {
      await csvWriter.writeRecords(data);
    } else {
      // Write data without headers
      const records = data.map(row => columns.map(col => row[col]));
      // For simplicity, we'll use headers here
      await csvWriter.writeRecords(data);
    }

    // In production, this would read from the actual file
    const csvContent = columns.join(',') + '\n' + 
      data.map(row => columns.map(col => `"${row[col] || ''}"`).join(',')).join('\n');
    
    return Buffer.from(csvContent, 'utf8');
  }

  private async generateXLSX(data: any[], columns: string[], dataType: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(dataType.charAt(0).toUpperCase() + dataType.slice(1) + ' Data');

    // Add headers
    worksheet.addRow(columns);
    
    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Add data
    data.forEach(row => {
      worksheet.addRow(columns.map(col => row[col]));
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      if (column.width) {
        column.width = Math.min(column.width, 50);
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
  }

  private async generatePDF(data: any[], columns: string[], dataType: string): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 30 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add header
      doc.fontSize(20).text(`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Export Report`, { align: 'center' });
      doc.moveDown();

      // Add metadata
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
      doc.text(`Total Records: ${data.length}`);
      doc.moveDown();

      // Create table
      const tableTop = doc.y;
      const itemY = tableTop;
      let rowY = itemY;

      // Table headers
      doc.font('Helvetica-Bold');
      columns.forEach((column, index) => {
        const x = 50 + (index * 100);
        doc.text(column, x, rowY, { width: 90 });
      });
      rowY += 20;

      // Table data
      doc.font('Helvetica');
      data.slice(0, 50).forEach((row, rowIndex) => { // Limit to 50 rows for PDF
        columns.forEach((column, colIndex) => {
          const x = 50 + (colIndex * 100);
          doc.text(String(row[column] || ''), x, rowY, { width: 90 });
        });
        rowY += 15;

        // Add new page if needed
        if (rowY > 700 && rowIndex < data.length - 1) {
          doc.addPage();
          rowY = 50;
        }
      });

      if (data.length > 50) {
        doc.text(`... and ${data.length - 50} more records`, 50, rowY + 10);
      }

      doc.end();
    });
  }

  private generateFilename(dataType: string, format: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${dataType}_export_${timestamp}.${format}`;
  }

  private async storeExportResult(taskId: string, result: ExportResult): Promise<void> {
    // In production, this would store to S3, local filesystem, or database
    // For now, we'll store in memory/cache
    this.progressCache.set(`${taskId}_result`, result as any);
  }

  private getStoredExportOptions(taskId: string): ExportOptions | null {
    // In production, this would retrieve from storage
    // For now, return null (would need to store options during createExportTask)
    return null;
  }

  async cleanupExpiredExports(): Promise<void> {
    const now = new Date();
    const expiredTasks: string[] = [];

    this.progressCache.forEach((progress, taskId) => {
      const hoursSinceCreation = (now.getTime() - progress.startTime.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreation > 24) { // Clean up after 24 hours
        expiredTasks.push(taskId);
      }
    });

    expiredTasks.forEach(taskId => {
      this.progressCache.delete(taskId);
      this.progressCache.delete(`${taskId}_result`);
    });

    logger.info(`Cleaned up ${expiredTasks.length} expired export tasks`);
  }
}

export const exportService = new ExportService();
