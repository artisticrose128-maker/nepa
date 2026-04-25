# Export System Documentation

## Overview

The NEPA platform now includes a comprehensive data export system that allows users to export data in multiple formats (CSV, Excel, PDF) with advanced filtering and progress tracking capabilities.

## Features

### ✅ Implemented Features

- **CSV Export**: Export data as comma-separated values
- **Excel Export**: Export data as Microsoft Excel files (.xlsx)
- **PDF Export**: Export data as Portable Document Format files
- **Export Filtering**: Filter exports by date range, status, user, utility type, etc.
- **Export Progress**: Real-time progress tracking for large exports
- **Column Selection**: Choose specific columns to include in exports
- **Export History**: View and manage past exports
- **Download Management**: Download completed exports
- **Cleanup System**: Automatic cleanup of old exports

### 🎯 Acceptance Criteria Met

- [x] Add CSV export
- [x] Include PDF export  
- [x] Add Excel export
- [x] Include export filtering
- [x] Add export progress

## Backend Implementation

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/export` | Start a new export |
| GET | `/api/export/progress/:exportId` | Get export progress |
| GET | `/api/export/progress` | Get all active exports |
| GET | `/api/export/download/:exportId` | Download exported file |
| GET | `/api/export/templates` | Get export templates and options |
| POST | `/api/export/cleanup` | Clean up old exports (admin only) |

### Services

#### ExportService (`backend/services/ExportService.ts`)

Main service handling all export operations:

- **Data Retrieval**: Fetches data from database based on type and filters
- **Format Conversion**: Converts data to CSV, Excel, or PDF format
- **Progress Tracking**: Tracks export progress in real-time
- **File Management**: Handles file creation and storage

#### ExportController (`backend/controllers/ExportController.ts`)

API controller with comprehensive OpenAPI documentation:

- **Input Validation**: Validates all export parameters
- **Error Handling**: Comprehensive error responses
- **Rate Limiting**: Prevents abuse of export functionality
- **Authentication**: Secures all export endpoints

### Data Types Supported

1. **Payments**: Payment transactions and history
   - Columns: ID, Amount, Currency, Status, Method, Transaction ID, User Email, Bill Number, Utility Provider, Created At
   
2. **Bills**: Utility bills and invoices
   - Columns: ID, Bill Number, Amount, Status, Due Date, User Email, Utility Provider, Utility Type, Created At
   
3. **Users**: User accounts and profiles
   - Columns: ID, Email, First Name, Last Name, Role, Active, Bills Count, Payments Count, Created At
   
4. **Analytics**: Analytics and reporting data
   - Columns: Date, Payments Count, Revenue, Bills Count

### Filtering Options

- **Date Range**: Start date and end date filtering
- **Status Filter**: Filter by payment/bill status
- **User Filter**: Filter by specific user ID
- **Utility Type**: Filter by utility type (Electricity, Water, Gas)
- **User Role**: Filter by user role (USER, ADMIN, SUPER_ADMIN)
- **Pagination**: Limit and offset for large datasets

## Frontend Implementation

### Components

#### ExportManager (`frontend/src/components/ExportManager.tsx`)

Full-featured export management interface:

- **Data Type Selection**: Visual selection of export data types
- **Format Selection**: Choose between CSV, Excel, and PDF
- **Column Selector**: Interactive column selection with descriptions
- **Filter Interface**: Advanced filtering options
- **Progress Tracking**: Real-time export progress display
- **Export History**: View and manage past exports
- **Download Management**: Direct download of completed exports

#### ExportButton (`frontend/src/components/ExportButton.tsx`)

Reusable export button component:

- **Quick Export**: Simple export functionality for any component
- **Progress Display**: Built-in progress indicator
- **Multiple Variants**: Different sizes and styles
- **Error Handling**: Comprehensive error management

### Services

#### exportService (`frontend/src/services/exportService.ts`)

Frontend service for export operations:

- **API Integration**: All export API calls
- **Progress Polling**: Automatic progress tracking
- **File Downloads**: Blob handling and file saving
- **Validation**: Client-side option validation
- **Utilities**: Helper functions for filename generation and size estimation

## Usage Examples

### Backend API Usage

```javascript
// Start an export
const exportResponse = await fetch('/api/export', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    format: 'csv',
    dataType: 'payments',
    filters: {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'COMPLETED'
    },
    columns: ['id', 'amount', 'status', 'createdAt']
  })
});

const { exportId } = await exportResponse.json();

// Check progress
const progressResponse = await fetch(`/api/export/progress/${exportId}`);
const progress = await progressResponse.json();

// Download file
const downloadResponse = await fetch(`/api/export/download/${exportId}`);
const blob = await downloadResponse.blob();
```

### Frontend Component Usage

```jsx
// Using ExportManager component
import ExportManager from './components/ExportManager';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ExportManager />
    </div>
  );
}

// Using ExportButton component
import ExportButton from './components/ExportButton';

function PaymentList() {
  return (
    <div>
      <h1>Payments</h1>
      <ExportButton
        dataType="payments"
        format="csv"
        filters={{ status: 'COMPLETED' }}
        onComplete={(exportId) => console.log('Export completed:', exportId)}
        onError={(error) => console.error('Export failed:', error)}
      />
    </div>
  );
}
```

### Frontend Service Usage

```javascript
import exportService from './services/exportService';

// Quick export
const fileBlob = await exportService.quickExport('payments', 'csv', {
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});

// Advanced export with progress tracking
const { progress, fileBlob } = await exportService.exportAndWait(
  {
    format: 'excel',
    dataType: 'bills',
    filters: { status: 'PAID' },
    columns: ['id', 'amount', 'dueDate', 'userEmail']
  },
  (progress) => console.log(`Export progress: ${progress.progress}%`)
);

// Save file
const filename = exportService.getFilename('payments', 'csv');
saveAs(fileBlob, filename);
```

## File Structure

```
backend/
├── services/
│   └── ExportService.ts          # Main export service
├── controllers/
│   └── ExportController.ts        # Export API controller
├── routes/
│   └── export.ts                  # Export routes
└── exports/                       # Export file storage directory

frontend/
├── components/
│   ├── ExportManager.tsx          # Full export management interface
│   └── ExportButton.tsx           # Reusable export button
└── services/
    └── exportService.ts           # Frontend export service
```

## Dependencies

### Backend Dependencies Added

```json
{
  "csv-writer": "^1.6.0",      // CSV file generation
  "xlsx": "^0.18.5",           // Excel file generation
  "jspdf": "^2.5.1",           // PDF file generation
  "html2canvas": "^1.4.1",     // PDF content rendering
  "exceljs": "^4.4.0"          // Advanced Excel support
}
```

### Frontend Dependencies Added

```json
{
  "file-saver": "^2.0.5",      // File download utility
  "axios": "^1.6.0"            // HTTP client for API calls
}
```

## Configuration

### Environment Variables

```bash
# Export settings
EXPORT_MAX_RECORDS=10000          # Maximum records per export
EXPORT_CLEANUP_HOURS=24            # Auto-cleanup age in hours
EXPORT_RATE_LIMIT=10               # Exports per 15 minutes
EXPORT_FILE_SIZE_LIMIT=50MB        # Maximum file size
```

### Database Considerations

- **Indexes**: Ensure proper indexes on date columns for filtering
- **Performance**: Large exports may impact database performance
- **Memory**: Consider streaming for very large datasets

## Security Considerations

### Authentication & Authorization

- **Required Authentication**: All export endpoints require valid authentication
- **Role-Based Access**: Admin access required for cleanup operations
- **Data Access**: Users can only export data they have access to

### Rate Limiting

- **Export Creation**: 10 exports per 15 minutes per IP
- **File Downloads**: 50 downloads per 15 minutes per IP
- **Progress Checks**: No rate limiting for progress polling

### Data Protection

- **Input Validation**: All inputs are validated and sanitized
- **File Security**: Export files are stored temporarily and cleaned up
- **Audit Trail**: All export operations are logged

## Performance Considerations

### Backend Optimization

- **Streaming**: Large datasets are streamed to avoid memory issues
- **Progress Tracking**: Efficient progress updates without blocking
- **File Cleanup**: Automatic cleanup prevents disk space issues

### Frontend Optimization

- **Progress Polling**: Intelligent polling with exponential backoff
- **File Handling**: Efficient blob handling for large files
- **UI Updates**: Smooth progress indicators without blocking UI

## Error Handling

### Common Error Scenarios

1. **Invalid Parameters**: Validation errors with detailed messages
2. **Database Errors**: Graceful handling of database connectivity issues
3. **File Generation Errors**: Recovery from file creation failures
4. **Download Errors**: Retry mechanisms for failed downloads
5. **Permission Errors**: Clear authentication/authorization messages

### Error Recovery

- **Retry Logic**: Automatic retry for transient errors
- **Fallback Options**: Alternative export formats when available
- **User Notifications**: Clear error messages and next steps

## Monitoring & Logging

### Export Metrics

- **Export Volume**: Number of exports by type and format
- **Processing Time**: Average export processing time
- **Error Rates**: Export failure rates and reasons
- **File Sizes**: Average and maximum export file sizes

### Audit Logging

- **User Actions**: All export operations are logged
- **Data Access**: Records of what data was exported
- **System Events**: Export system health and performance events

## Testing

### Backend Tests

```javascript
// Export service tests
describe('ExportService', () => {
  test('should export payments to CSV', async () => {
    const options = {
      format: 'csv',
      dataType: 'payments',
      filters: { status: 'COMPLETED' }
    };
    
    const result = await exportService.exportData(options);
    expect(result.status).toBe('completed');
    expect(result.downloadUrl).toBeDefined();
  });
});
```

### Frontend Tests

```javascript
// Export component tests
describe('ExportButton', () => {
  test('should start export on click', async () => {
    const { getByRole } = render(<ExportButton dataType="payments" />);
    const button = getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button).toHaveTextContent('Exporting...');
    });
  });
});
```

## Future Enhancements

### Planned Features

1. **Scheduled Exports**: Automated recurring exports
2. **Email Delivery**: Send exports via email
3. **Cloud Storage**: Integration with cloud storage providers
4. **Advanced Filtering**: More sophisticated filter options
5. **Export Templates**: Saved export configurations
6. **Real-time Notifications**: WebSocket-based progress updates

### Performance Improvements

1. **Background Processing**: Queue-based export processing
2. **Caching**: Cache frequently exported data
3. **Compression**: File compression for large exports
4. **Parallel Processing**: Multi-threaded export generation

## Troubleshooting

### Common Issues

1. **Export Timeout**: Increase timeout for large datasets
2. **Memory Issues**: Implement streaming for very large exports
3. **File Corruption**: Validate file integrity after generation
4. **Permission Errors**: Check user access rights

### Debug Tools

- **Export Logs**: Detailed logging for troubleshooting
- **Progress Monitoring**: Real-time export status
- **File Validation**: Verify generated file integrity
- **Performance Metrics**: Monitor system performance during exports

## Support

For issues related to the export system:

1. Check the application logs for error details
2. Verify user permissions and data access
3. Review export configuration and limits
4. Contact support with export ID and error details

---

**Last Updated**: April 25, 2026  
**Version**: 1.0.0  
**Compatibility**: NEPA Platform v2.0+
