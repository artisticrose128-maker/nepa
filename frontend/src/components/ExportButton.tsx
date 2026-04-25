import React, { useState } from 'react';
import { Download, FileText, Table, FileSpreadsheet, Loader2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { format } from 'date-fns';

interface ExportButtonProps {
  dataType: 'payments' | 'bills' | 'users' | 'analytics';
  format?: 'csv' | 'excel' | 'pdf';
  filters?: Record<string, any>;
  columns?: string[];
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  onComplete?: (exportId: string) => void;
  onError?: (error: string) => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  dataType,
  format = 'csv',
  filters = {},
  columns,
  className = '',
  disabled = false,
  size = 'md',
  variant = 'primary',
  onComplete,
  onError
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportId, setExportId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const getIcon = () => {
    if (isExporting) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    
    switch (format) {
      case 'csv':
        return <Table className="w-4 h-4" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700';
      case 'outline':
        return 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  const handleExport = async () => {
    if (isExporting || disabled) return;

    setIsExporting(true);
    setProgress(0);

    try {
      // Start export
      const exportData = {
        format,
        dataType,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        columns
      };

      const response = await axios.post('/api/export', exportData);
      const newExportId = response.data.exportId;
      setExportId(newExportId);

      // Poll for progress
      const pollInterval = setInterval(async () => {
        try {
          const progressResponse = await axios.get(`/api/export/progress/${newExportId}`);
          const exportProgress = progressResponse.data;
          
          setProgress(exportProgress.progress);

          if (exportProgress.status === 'completed') {
            clearInterval(pollInterval);
            
            // Download the file
            await downloadFile(newExportId);
            
            setIsExporting(false);
            setProgress(100);
            onComplete?.(newExportId);
            
            // Reset after a delay
            setTimeout(() => {
              setProgress(0);
              setExportId(null);
            }, 2000);
            
          } else if (exportProgress.status === 'failed') {
            clearInterval(pollInterval);
            setIsExporting(false);
            setProgress(0);
            setExportId(null);
            onError?.(exportProgress.error || 'Export failed');
          }
        } catch (error) {
          clearInterval(pollInterval);
          setIsExporting(false);
          setProgress(0);
          setExportId(null);
          onError?.('Failed to check export progress');
        }
      }, 1000);

    } catch (error) {
      setIsExporting(false);
      setProgress(0);
      setExportId(null);
      onError?.('Failed to start export');
    }
  };

  const downloadFile = async (exportId: string) => {
    try {
      const response = await axios.get(`/api/export/download/${exportId}`, {
        responseType: 'blob'
      });
      
      // Get filename from content-disposition header or create one
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${dataType}_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      saveAs(response.data, filename);
    } catch (error) {
      console.error('Failed to download export:', error);
      throw error;
    }
  };

  const getButtonText = () => {
    if (isExporting) {
      if (progress > 0) {
        return `Exporting... ${progress}%`;
      }
      return 'Starting...';
    }
    return `Export ${format.toUpperCase()}`;
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isExporting}
      className={`
        inline-flex items-center space-x-2 rounded-lg font-medium transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${className}
      `}
    >
      {getIcon()}
      <span>{getButtonText()}</span>
      
      {isExporting && progress > 0 && (
        <div className="w-16 bg-gray-200 rounded-full h-1.5 ml-2">
          <div
            className="bg-white h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </button>
  );
};

export default ExportButton;
