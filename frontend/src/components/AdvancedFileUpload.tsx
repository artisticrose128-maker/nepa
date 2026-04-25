import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, Pause, Play, Trash2, FileText, Image, Film, Music, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  onFileSelect?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  className?: string;
  disabled?: boolean;
  autoUpload?: boolean;
}

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'paused';
  error?: string;
  preview?: string;
  uploadUrl?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

export const AdvancedFileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onFileSelect,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  allowedTypes = [],
  allowedExtensions = [],
  className = '',
  disabled = false,
  autoUpload = true
}) => {
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`;
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }

    // Check file extension
    if (allowedExtensions.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return `File extension ${fileExtension} is not allowed`;
      }
    }

    return null;
  }, [maxSize, allowedTypes, allowedExtensions]);

  // Generate file preview
  const generatePreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  }, []);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (fileType: string): React.ReactElement => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5 text-green-500" />;
    if (fileType.startsWith('video/')) return <Film className="w-5 h-5 text-purple-500" />;
    if (fileType.startsWith('audio/')) return <Music className="w-5 h-5 text-pink-500" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFiles: FileList | File[]) => {
    if (disabled) return;

    const fileArray = Array.from(selectedFiles);
    
    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: UploadItem[] = [];
    const validFiles: File[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        alert(`${file.name}: ${validationError}`);
        continue;
      }

      const preview = await generatePreview(file);
      const uploadItem: UploadItem = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'pending',
        preview
      };

      newFiles.push(uploadItem);
      validFiles.push(file);
    }

    if (newFiles.length > 0) {
      setFiles((prev: UploadItem[]) => [...prev, ...newFiles]);
      onFileSelect?.(validFiles);
      
      if (autoUpload) {
        startUpload(newFiles.map(f => f.id));
      }
    }
  }, [disabled, files.length, maxFiles, validateFile, generatePreview, onFileSelect, autoUpload]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (!disabled && e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [disabled, handleFileSelect]);

  // Simulate file upload
  const simulateUpload = useCallback(async (fileId: string) => {
    const updateProgress = (progress: number, status?: UploadItem['status'], error?: string) => {
      setFiles((prev: UploadItem[]) => prev.map((file: UploadItem) => 
        file.id === fileId 
          ? { ...file, progress, status: status || file.status, error }
          : file
      ));
    };

    try {
      updateProgress(0, 'uploading');
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += Math.random() * 30) {
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
        updateProgress(Math.min(progress, 99), 'uploading');
      }
      
      // Complete upload
      await new Promise(resolve => setTimeout(resolve, 200));
      updateProgress(100, 'completed');
      
      // Generate mock upload URL
      const file = files.find((f: UploadItem) => f.id === fileId);
      if (file) {
        const mockUrl = `https://example.com/uploads/${file.file.name}`;
        setFiles((prev: UploadItem[]) => prev.map((f: UploadItem) => 
          f.id === fileId ? { ...f, uploadUrl: mockUrl } : f
        ));
      }
      
    } catch (error) {
      updateProgress(0, 'error', 'Upload failed. Please try again.');
    }
  }, [files]);

  // Start upload process
  const startUpload = useCallback((fileIds: string[]) => {
    setUploadQueue(fileIds);
    setIsUploading(true);
    
    fileIds.forEach(fileId => {
      simulateUpload(fileId);
    });
  }, [simulateUpload]);

  // Pause upload
  const pauseUpload = useCallback((fileId: string) => {
    setFiles((prev: UploadItem[]) => prev.map((file: UploadItem) => 
      file.id === fileId && file.status === 'uploading'
        ? { ...file, status: 'paused' }
        : file
    ));
  }, []);

  // Resume upload
  const resumeUpload = useCallback((fileId: string) => {
    setFiles((prev: UploadItem[]) => prev.map((file: UploadItem) => 
      file.id === fileId && file.status === 'paused'
        ? { ...file, status: 'uploading' }
        : file
    ));
    
    simulateUpload(fileId);
  }, [simulateUpload]);

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setFiles((prev: UploadItem[]) => prev.filter((file: UploadItem) => file.id !== fileId));
    setUploadQueue((prev: string[]) => prev.filter((id: string) => id !== fileId));
  }, []);

  // Get uploaded files
  const getUploadedFiles = useCallback((): UploadedFile[] => {
    return files
      .filter((file: UploadItem) => file.status === 'completed')
      .map((file: UploadItem) => ({
        id: file.id,
        name: file.file.name,
        size: file.file.size,
        type: file.file.type,
        url: file.uploadUrl || '',
        uploadedAt: new Date()
      }));
  }, [files]);

  // Notify parent component when uploads complete
  useEffect(() => {
    const completedFiles = getUploadedFiles();
    if (completedFiles.length > 0 && files.every((f: UploadItem) => f.status === 'completed' || f.status === 'error')) {
      onUploadComplete?.(completedFiles);
    }
  }, [files, getUploadedFiles, onUploadComplete]);

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',') + ',' + allowedExtensions.join(',')}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isDragOver ? 'Drop files here' : 'Upload Files'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop files here, or click to select files
        </p>
        <p className="text-xs text-gray-500">
          Max {maxFiles} files, up to {Math.round(maxSize / 1024 / 1024)}MB each
          {allowedExtensions.length > 0 && ` • Allowed: ${allowedExtensions.join(', ')}`}
        </p>
        
        <button
          type="button"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={disabled}
        >
          Select Files
        </button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Upload Queue ({files.length})
            </h3>
            {!autoUpload && (
              <button
                onClick={() => startUpload(files.filter((f: UploadItem) => f.status === 'pending').map((f: UploadItem) => f.id))}
                disabled={isUploading || files.every((f: UploadItem) => f.status !== 'pending')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Start Upload
              </button>
            )}
          </div>
          
          {files.map((fileItem: UploadItem) => (
            <div
              key={fileItem.id}
              className="bg-white border rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3 flex-1">
                  {getFileIcon(fileItem.file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileItem.file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {fileItem.status === 'uploading' && (
                    <button
                      onClick={() => pauseUpload(fileItem.id)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Pause"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  {fileItem.status === 'paused' && (
                    <button
                      onClick={() => resumeUpload(fileItem.id)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Resume"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  {fileItem.status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {fileItem.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <button
                    onClick={() => removeFile(fileItem.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {fileItem.status !== 'error' && fileItem.status !== 'completed' && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="capitalize">{fileItem.status}</span>
                    <span>{Math.round(fileItem.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${fileItem.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {fileItem.status === 'error' && (
                <div className="mt-2 text-sm text-red-600">
                  {fileItem.error}
                </div>
              )}

              {/* Preview */}
              {fileItem.preview && fileItem.status === 'completed' && (
                <div className="mt-2">
                  {fileItem.file.type.startsWith('image/') ? (
                    <img
                      src={fileItem.preview}
                      alt={fileItem.file.name}
                      className="h-16 w-16 object-cover rounded"
                    />
                  ) : (
                    <p className="text-xs text-gray-600 italic">File uploaded successfully</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
