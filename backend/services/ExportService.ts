import { PrismaClient, BillStatus, PaymentStatus, UserRole } from '@prisma/client';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import * as csvWriter from 'csv-writer';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Request } from 'express';

const prisma = new PrismaClient();

export interface ExportFilters {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  status?: BillStatus | PaymentStatus;
  utilityType?: string;
  role?: UserRole;
  limit?: number;
  offset?: number;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dataType: 'payments' | 'bills' | 'users' | 'analytics';
  filters?: ExportFilters;
  columns?: string[];
}

export interface ExportProgress {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  downloadUrl?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export class ExportService {
  private static activeExports = new Map<string, ExportProgress>();

  // Generate unique export ID
  private generateExportId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize export progress tracking
  private initializeExportProgress(totalRecords: number): ExportProgress {
    const id = this.generateExportId();
    const progress: ExportProgress = {
      id,
      status: 'pending',
      progress: 0,
      totalRecords,
      processedRecords: 0,
      createdAt: new Date()
    };
    
    ExportService.activeExports.set(id, progress);
    return progress;
  }

  // Update export progress
  private updateProgress(exportId: string, processedRecords: number, status?: ExportProgress['status']) {
    const progress = ExportService.activeExports.get(exportId);
    if (progress) {
      progress.processedRecords = processedRecords;
      progress.progress = Math.round((processedRecords / progress.totalRecords) * 100);
      if (status) {
        progress.status = status;
        if (status === 'completed' || status === 'failed') {
          progress.completedAt = new Date();
        }
      }
    }
  }

  // Get export progress
  getExportProgress(exportId: string): ExportProgress | undefined {
    return ExportService.activeExports.get(exportId);
  }

  // Get all active exports
  getAllActiveExports(): ExportProgress[] {
    return Array.from(ExportService.activeExports.values());
  }

  // Main export function
  async exportData(options: ExportOptions): Promise<ExportProgress> {
    const exportId = this.generateExportId();
    
    try {
      // Get data based on type
      let data: any[];
      let totalRecords: number;

      switch (options.dataType) {
        case 'payments':
          ({ data, totalRecords } = await this.getPaymentData(options.filters));
          break;
        case 'bills':
          ({ data, totalRecords } = await this.getBillData(options.filters));
          break;
        case 'users':
          ({ data, totalRecords } = await this.getUserData(options.filters));
          break;
        case 'analytics':
          ({ data, totalRecords } = await this.getAnalyticsData(options.filters));
          break;
        default:
          throw new Error('Invalid data type for export');
      }

      // Initialize progress tracking
      const progress = this.initializeExportProgress(totalRecords);
      progress.id = exportId;
      this.updateProgress(exportId, 0, 'processing');

      // Generate export based on format
      let filePath: string;
      switch (options.format) {
        case 'csv':
          filePath = await this.exportToCSV(data, options.dataType, exportId, options.columns);
          break;
        case 'excel':
          filePath = await this.exportToExcel(data, options.dataType, exportId, options.columns);
          break;
        case 'pdf':
          filePath = await this.exportToPDF(data, options.dataType, exportId, options.columns);
          break;
        default:
          throw new Error('Invalid export format');
      }

      // Update progress with download URL
      this.updateProgress(exportId, totalRecords, 'completed');
      const finalProgress = ExportService.activeExports.get(exportId);
      if (finalProgress) {
        finalProgress.downloadUrl = `/api/export/download/${exportId}`;
      }

      return progress;
    } catch (error) {
      this.updateProgress(exportId, 0, 'failed');
      const progress = ExportService.activeExports.get(exportId);
      if (progress) {
        progress.error = error instanceof Error ? error.message : 'Unknown error';
      }
      throw error;
    }
  }

  // Get payment data
  private async getPaymentData(filters?: ExportFilters) {
    const whereClause: any = {};
    
    if (filters?.startDate || filters?.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) whereClause.createdAt.gte = startOfDay(filters.startDate);
      if (filters.endDate) whereClause.createdAt.lte = endOfDay(filters.endDate);
    }
    
    if (filters?.userId) whereClause.userId = filters.userId;
    if (filters?.status) whereClause.status = filters.status;

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true }
          },
          bill: {
            select: { 
              id: true, 
              billNumber: true, 
              amount: true, 
              dueDate: true,
              utilityProvider: {
                select: { name: true, type: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 1000,
        skip: filters?.offset || 0
      }),
      prisma.payment.count({ where: whereClause })
    ]);

    return { data, total };
  }

  // Get bill data
  private async getBillData(filters?: ExportFilters) {
    const whereClause: any = {};
    
    if (filters?.startDate || filters?.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) whereClause.createdAt.gte = startOfDay(filters.startDate);
      if (filters.endDate) whereClause.createdAt.lte = endOfDay(filters.endDate);
    }
    
    if (filters?.userId) whereClause.userId = filters.userId;
    if (filters?.status) whereClause.status = filters.status;
    if (filters?.utilityType) {
      whereClause.utilityProvider = {
        type: filters.utilityType
      };
    }

    const [data, total] = await Promise.all([
      prisma.bill.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true }
          },
          utilityProvider: {
            select: { name: true, type: true }
          },
          payments: {
            select: { id: true, amount: true, status: true, createdAt: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 1000,
        skip: filters?.offset || 0
      }),
      prisma.bill.count({ where: whereClause })
    ]);

    return { data, total };
  }

  // Get user data
  private async getUserData(filters?: ExportFilters) {
    const whereClause: any = {};
    
    if (filters?.startDate || filters?.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) whereClause.createdAt.gte = startOfDay(filters.startDate);
      if (filters.endDate) whereClause.createdAt.lte = endOfDay(filters.endDate);
    }
    
    if (filters?.role) whereClause.role = filters.role;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          bills: {
            select: { id: true, amount: true, status: true, createdAt: true }
          },
          payments: {
            select: { id: true, amount: true, status: true, createdAt: true }
          },
          _count: {
            select: { bills: true, payments: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 1000,
        skip: filters?.offset || 0
      }),
      prisma.user.count({ where: whereClause })
    ]);

    return { data, total };
  }

  // Get analytics data
  private async getAnalyticsData(filters?: ExportFilters) {
    const days = filters?.limit || 30;
    const startDate = filters?.startDate || subDays(new Date(), days);
    const endDate = filters?.endDate || new Date();

    // Get daily analytics
    const dailyData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);
      
      const [paymentsCount, revenue, billsCount] = await Promise.all([
        prisma.payment.count({
          where: {
            createdAt: { gte: dayStart, lte: dayEnd },
            status: PaymentStatus.COMPLETED
          }
        }),
        prisma.payment.aggregate({
          where: {
            createdAt: { gte: dayStart, lte: dayEnd },
            status: PaymentStatus.COMPLETED
          },
          _sum: { amount: true }
        }),
        prisma.bill.count({
          where: {
            createdAt: { gte: dayStart, lte: dayEnd }
          }
        })
      ]);

      dailyData.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        paymentsCount,
        revenue: Number(revenue._sum.amount || 0),
        billsCount
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { data: dailyData, total: dailyData.length };
  }

  // Export to CSV
  private async exportToCSV(data: any[], dataType: string, exportId: string, columns?: string[]): Promise<string> {
    const csvConfig = this.getCSVConfig(dataType, columns);
    const csvFilePath = `./exports/${exportId}.csv`;
    
    const csvWriterInstance = csvWriter.createObjectCsvWriter({
      path: csvFilePath,
      header: csvConfig.headers,
      data: data.map(item => csvConfig.transform(item))
    });

    await csvWriterInstance.writeRecords(data);
    return csvFilePath;
  }

  // Export to Excel
  private async exportToExcel(data: any[], dataType: string, exportId: string, columns?: string[]): Promise<string> {
    const excelConfig = this.getExcelConfig(dataType, columns);
    const worksheet = XLSX.utils.json_to_sheet(
      data.map(item => excelConfig.transform(item)),
      { header: excelConfig.headers }
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, dataType);
    
    const excelFilePath = `./exports/${exportId}.xlsx`;
    XLSX.writeFile(workbook, excelFilePath);
    
    return excelFilePath;
  }

  // Export to PDF
  private async exportToPDF(data: any[], dataType: string, exportId: string, columns?: string[]): Promise<string> {
    const pdf = new jsPDF();
    const pdfConfig = this.getPDFConfig(dataType, columns);
    
    // Add title
    pdf.setFontSize(16);
    pdf.text(`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Export`, 14, 15);
    
    // Add date
    pdf.setFontSize(10);
    pdf.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 14, 25);
    
    // Add data
    let yPosition = 40;
    const headers = pdfConfig.headers;
    const columnWidths = pdfConfig.columnWidths;
    
    // Draw headers
    pdf.setFontSize(12);
    headers.forEach((header, index) => {
      pdf.text(header, 14 + (index * columnWidths[index]), yPosition);
    });
    
    yPosition += 10;
    
    // Draw data rows
    pdf.setFontSize(10);
    data.forEach((item, rowIndex) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      
      const transformedData = pdfConfig.transform(item);
      headers.forEach((header, colIndex) => {
        const cellData = transformedData[header] || '';
        pdf.text(String(cellData).substring(0, 20), 14 + (colIndex * columnWidths[colIndex]), yPosition);
      });
      
      yPosition += 8;
    });
    
    const pdfFilePath = `./exports/${exportId}.pdf`;
    pdf.save(pdfFilePath);
    
    return pdfFilePath;
  }

  // CSV configuration
  private getCSVConfig(dataType: string, columns?: string[]) {
    const configs = {
      payments: {
        headers: [
          { id: 'id', title: 'Payment ID' },
          { id: 'amount', title: 'Amount' },
          { id: 'currency', title: 'Currency' },
          { id: 'status', title: 'Status' },
          { id: 'method', title: 'Method' },
          { id: 'transactionId', title: 'Transaction ID' },
          { id: 'userEmail', title: 'User Email' },
          { id: 'billNumber', title: 'Bill Number' },
          { id: 'utilityProvider', title: 'Utility Provider' },
          { id: 'createdAt', title: 'Created At' }
        ],
        transform: (item: any) => ({
          id: item.id,
          amount: Number(item.amount),
          currency: item.currency,
          status: item.status,
          method: item.method,
          transactionId: item.transactionId || '',
          userEmail: item.user?.email || '',
          billNumber: item.bill?.billNumber || '',
          utilityProvider: item.bill?.utilityProvider?.name || '',
          createdAt: format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm:ss')
        })
      },
      bills: {
        headers: [
          { id: 'id', title: 'Bill ID' },
          { id: 'billNumber', title: 'Bill Number' },
          { id: 'amount', title: 'Amount' },
          { id: 'status', title: 'Status' },
          { id: 'dueDate', title: 'Due Date' },
          { id: 'userEmail', title: 'User Email' },
          { id: 'utilityProvider', title: 'Utility Provider' },
          { id: 'utilityType', title: 'Utility Type' },
          { id: 'createdAt', title: 'Created At' }
        ],
        transform: (item: any) => ({
          id: item.id,
          billNumber: item.billNumber,
          amount: Number(item.amount),
          status: item.status,
          dueDate: format(new Date(item.dueDate), 'yyyy-MM-dd'),
          userEmail: item.user?.email || '',
          utilityProvider: item.utilityProvider?.name || '',
          utilityType: item.utilityProvider?.type || '',
          createdAt: format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm:ss')
        })
      },
      users: {
        headers: [
          { id: 'id', title: 'User ID' },
          { id: 'email', title: 'Email' },
          { id: 'firstName', title: 'First Name' },
          { id: 'lastName', title: 'Last Name' },
          { id: 'role', title: 'Role' },
          { id: 'isActive', title: 'Active' },
          { id: 'billsCount', title: 'Bills Count' },
          { id: 'paymentsCount', title: 'Payments Count' },
          { id: 'createdAt', title: 'Created At' }
        ],
        transform: (item: any) => ({
          id: item.id,
          email: item.email,
          firstName: item.firstName || '',
          lastName: item.lastName || '',
          role: item.role,
          isActive: item.isActive,
          billsCount: item._count.bills,
          paymentsCount: item._count.payments,
          createdAt: format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm:ss')
        })
      },
      analytics: {
        headers: [
          { id: 'date', title: 'Date' },
          { id: 'paymentsCount', title: 'Payments Count' },
          { id: 'revenue', title: 'Revenue' },
          { id: 'billsCount', title: 'Bills Count' }
        ],
        transform: (item: any) => ({
          date: item.date,
          paymentsCount: item.paymentsCount,
          revenue: item.revenue,
          billsCount: item.billsCount
        })
      }
    };

    const config = configs[dataType as keyof typeof configs];
    if (!config) throw new Error(`Unsupported data type: ${dataType}`);

    // Filter columns if specified
    if (columns && columns.length > 0) {
      const filteredHeaders = config.headers.filter(h => columns.includes(h.id));
      return { ...config, headers: filteredHeaders };
    }

    return config;
  }

  // Excel configuration
  private getExcelConfig(dataType: string, columns?: string[]) {
    const csvConfig = this.getCSVConfig(dataType, columns);
    
    return {
      headers: csvConfig.headers.map(h => h.title),
      transform: csvConfig.transform
    };
  }

  // PDF configuration
  private getPDFConfig(dataType: string, columns?: string[]) {
    const csvConfig = this.getCSVConfig(dataType, columns);
    
    return {
      headers: csvConfig.headers.map(h => h.title),
      columnWidths: [30, 20, 20, 20, 30, 25, 30, 25, 30], // Adjust based on content
      transform: csvConfig.transform
    };
  }

  // Clean up old exports
  async cleanupOldExports(maxAgeHours: number = 24): Promise<void> {
    const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
    
    for (const [exportId, progress] of ExportService.activeExports.entries()) {
      if (progress.createdAt < cutoffTime) {
        ExportService.activeExports.delete(exportId);
      }
    }
  }
}

export const exportService = new ExportService();
