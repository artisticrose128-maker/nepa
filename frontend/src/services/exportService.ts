import axios from 'axios';

export interface ExportFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  status?: string;
  utilityType?: string;
  role?: string;
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
  createdAt: string;
  completedAt?: string;
}

export interface ExportTemplate {
  name: string;
  displayName: string;
  description: string;
  columns: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

export interface ExportFormat {
  value: string;
  label: string;
  description: string;
}

export interface ExportTemplatesResponse {
  dataTypes: ExportTemplate[];
  formats: ExportFormat[];
  filters: {
    statuses: {
      payments: string[];
      bills: string[];
    };
    utilityTypes: string[];
    userRoles: string[];
  };
}

class ExportService {
  private baseURL = '/api/export';

  /**
   * Start a new export
   */
  async startExport(options: ExportOptions): Promise<{ exportId: string; status: string; totalRecords: number }> {
    try {
      const response = await axios.post(`${this.baseURL}`, options);
      return response.data;
    } catch (error) {
      console.error('Failed to start export:', error);
      throw new Error('Failed to start export');
    }
  }

  /**
   * Get export progress
   */
  async getExportProgress(exportId: string): Promise<ExportProgress> {
    try {
      const response = await axios.get(`${this.baseURL}/progress/${exportId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get export progress:', error);
      throw new Error('Failed to get export progress');
    }
  }

  /**
   * Get all active exports
   */
  async getAllExports(): Promise<ExportProgress[]> {
    try {
      const response = await axios.get(`${this.baseURL}/progress`);
      return response.data;
    } catch (error) {
      console.error('Failed to get all exports:', error);
      throw new Error('Failed to get all exports');
    }
  }

  /**
   * Download exported file
   */
  async downloadExport(exportId: string): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseURL}/download/${exportId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to download export:', error);
      throw new Error('Failed to download export');
    }
  }

  /**
   * Clean up old exports
   */
  async cleanupExports(maxAgeHours: number = 24): Promise<{ message: string; maxAgeHours: number }> {
    try {
      const response = await axios.post(`${this.baseURL}/cleanup`, { maxAgeHours });
      return response.data;
    } catch (error) {
      console.error('Failed to cleanup exports:', error);
      throw new Error('Failed to cleanup exports');
    }
  }

  /**
   * Get export templates and configurations
   */
  async getExportTemplates(): Promise<ExportTemplatesResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/templates`);
      return response.data;
    } catch (error) {
      console.error('Failed to get export templates:', error);
      throw new Error('Failed to get export templates');
    }
  }

  /**
   * Poll export progress until completion or failure
   */
  async pollExportProgress(
    exportId: string,
    onProgress?: (progress: ExportProgress) => void,
    pollInterval: number = 1000
  ): Promise<ExportProgress> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const progress = await this.getExportProgress(exportId);
          onProgress?.(progress);

          if (progress.status === 'completed') {
            resolve(progress);
          } else if (progress.status === 'failed') {
            reject(new Error(progress.error || 'Export failed'));
          } else {
            setTimeout(poll, pollInterval);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  /**
   * Start export and wait for completion
   */
  async exportAndWait(
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<{ progress: ExportProgress; fileBlob: Blob }> {
    // Start export
    const { exportId } = await this.startExport(options);

    // Wait for completion
    const progress = await this.pollExportProgress(exportId, onProgress);

    // Download file
    const fileBlob = await this.downloadExport(exportId);

    return { progress, fileBlob };
  }

  /**
   * Quick export with default settings
   */
  async quickExport(
    dataType: ExportOptions['dataType'],
    format: ExportOptions['format'] = 'csv',
    filters?: ExportFilters
  ): Promise<Blob> {
    const options: ExportOptions = {
      format,
      dataType,
      filters
    };

    const { fileBlob } = await this.exportAndWait(options);
    return fileBlob;
  }

  /**
   * Get suggested filename for export
   */
  getFilename(dataType: string, format: string, date?: Date): string {
    const timestamp = date || new Date();
    const formattedDate = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
    const formattedTime = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    
    return `${dataType}_export_${formattedDate}_${formattedTime}.${format}`;
  }

  /**
   * Validate export options
   */
  validateExportOptions(options: ExportOptions): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate format
    if (!['csv', 'excel', 'pdf'].includes(options.format)) {
      errors.push('Invalid format. Must be csv, excel, or pdf');
    }

    // Validate data type
    if (!['payments', 'bills', 'users', 'analytics'].includes(options.dataType)) {
      errors.push('Invalid data type. Must be payments, bills, users, or analytics');
    }

    // Validate date range
    if (options.filters?.startDate && options.filters?.endDate) {
      const start = new Date(options.filters.startDate);
      const end = new Date(options.filters.endDate);
      
      if (start > end) {
        errors.push('Start date must be before end date');
      }
    }

    // Validate limit
    if (options.filters?.limit && (options.filters.limit < 1 || options.filters.limit > 10000)) {
      errors.push('Limit must be between 1 and 10000');
    }

    // Validate offset
    if (options.filters?.offset && options.filters.offset < 0) {
      errors.push('Offset must be 0 or greater');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get default columns for data type
   */
  async getDefaultColumns(dataType: string): Promise<string[]> {
    try {
      const templates = await this.getExportTemplates();
      const dataTypeTemplate = templates.dataTypes.find(dt => dt.name === dataType);
      
      if (!dataTypeTemplate) {
        throw new Error(`Data type ${dataType} not found`);
      }

      return dataTypeTemplate.columns.map(col => col.id);
    } catch (error) {
      console.error('Failed to get default columns:', error);
      throw error;
    }
  }

  /**
   * Estimate export size (rough calculation)
   */
  estimateExportSize(dataType: string, recordCount: number, columns: string[]): string {
    // Rough estimation: ~100 bytes per record per column
    const bytesPerRecord = columns.length * 100;
    const totalBytes = recordCount * bytesPerRecord;

    if (totalBytes < 1024) {
      return `${totalBytes} bytes`;
    } else if (totalBytes < 1024 * 1024) {
      return `${Math.round(totalBytes / 1024)} KB`;
    } else {
      return `${Math.round(totalBytes / (1024 * 1024))} MB`;
    }
  }
}

export const exportService = new ExportService();
export default exportService;
