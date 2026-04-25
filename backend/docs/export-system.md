# NEPA Export System Documentation

## Overview

The NEPA Export System provides comprehensive data export functionality supporting multiple formats (CSV, Excel, PDF) with advanced filtering, progress tracking, and asynchronous processing. This system allows users to export various data types including users, bills, payments, and analytics data.

## Features

### ✅ Implemented Features

- **Multiple Export Formats**: CSV, Excel (XLSX), and PDF support
- **Data Types**: Users, Bills, Payments, Analytics, and Reports
- **Advanced Filtering**: Status, date ranges, amounts, user roles, utility types
- **Progress Tracking**: Real-time export progress monitoring
- **Asynchronous Processing**: Background processing for large datasets
- **Export History**: Track and manage previous exports
- **Column Selection**: Choose specific columns for export
- **Error Handling**: Comprehensive error reporting and validation
- **Security**: API key authentication and audit logging

### 🔄 Export Workflow

1. **Create Export Task**: Submit export request with format, data type, and filters
2. **Track Progress**: Monitor export progress in real-time
3. **Download File**: Retrieve completed export file
4. **Manage History**: View and cancel export tasks

## API Endpoints

### 1. Create Export Task

**Endpoint**: `POST /api/export/create`

**Description**: Creates a new export task with specified parameters.

**Authentication**: Required (API Key)

**Request Body**:
```json
{
  "format": "csv|xlsx|pdf",
  "dataType": "users|bills|payments|analytics|reports",
  "filters": {
    "status": ["PENDING", "PAID"],
    "utilityType": ["ELECTRICITY", "WATER"],
    "paymentMethod": ["STELLAR", "CREDIT_CARD"],
    "minAmount": 10.00,
    "maxAmount": 1000.00,
    "userRole": ["USER", "ADMIN"],
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    }
  },
  "columns": ["id", "email", "firstName", "lastName", "role"],
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "includeHeaders": true,
  "pageSize": 1000
}
```

**Response**:
```json
{
  "status": 200,
  "taskId": "export_1642234567890_abc123def",
  "message": "Export task created successfully",
  "estimatedTime": "2 minutes"
}
```

### 2. Get Export Progress

**Endpoint**: `GET /api/export/progress/{taskId}`

**Description**: Retrieves the current progress of an export task.

**Authentication**: Required (API Key)

**Response**:
```json
{
  "status": 200,
  "data": {
    "id": "export_1642234567890_abc123def",
    "status": "processing",
    "progress": 45,
    "totalRecords": 5000,
    "processedRecords": 2250,
    "startTime": "2024-01-15T10:30:00.000Z",
    "endTime": null,
    "error": null,
    "downloadUrl": null
  }
}
```

**Status Values**:
- `pending`: Task is queued for processing
- `processing`: Export is currently being generated
- `completed`: Export is ready for download
- `failed`: Export failed with an error

### 3. Download Export

**Endpoint**: `GET /api/export/download/{taskId}`

**Description**: Downloads the completed export file.

**Authentication**: Required (API Key)

**Response**: Binary file data with appropriate headers:
- `Content-Type`: `text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, or `application/pdf`
- `Content-Disposition`: `attachment; filename="users_export_2024-01-15.csv"`

### 4. Get Export Templates

**Endpoint**: `GET /api/export/templates`

**Description**: Retrieves available export templates and configurations.

**Authentication**: Required (API Key)

**Response**:
```json
{
  "status": 200,
  "data": {
    "dataTypes": [
      {
        "value": "users",
        "label": "Users",
        "description": "User account information and activity",
        "availableColumns": ["id", "email", "firstName", "lastName", "role", "isActive", "createdAt"],
        "availableFilters": ["userRole", "dateRange"]
      }
    ],
    "formats": [
      {
        "value": "csv",
        "label": "CSV",
        "description": "Comma-separated values format",
        "mimeType": "text/csv"
      }
    ]
  }
}
```

### 5. Get Export History

**Endpoint**: `GET /api/export/history`

**Description**: Retrieves the user's export task history.

**Authentication**: Required (API Key)

**Query Parameters**:
- `limit` (optional): Maximum number of records (default: 10)
- `status` (optional): Filter by status (`pending`, `processing`, `completed`, `failed`)

**Response**:
```json
{
  "status": 200,
  "data": {
    "exports": [
      {
        "id": "export_1642234567890_abc123def",
        "status": "completed",
        "progress": 100,
        "totalRecords": 1250,
        "processedRecords": 1250,
        "startTime": "2024-01-15T10:30:00.000Z",
        "endTime": "2024-01-15T10:32:15.000Z",
        "downloadUrl": "/api/export/download/export_1642234567890_abc123def",
        "format": "csv",
        "dataType": "payments",
        "filename": "payments_export_2024-01-15.csv"
      }
    ]
  }
}
```

### 6. Cancel Export Task

**Endpoint**: `DELETE /api/export/cancel/{taskId}`

**Description**: Cancels a pending or processing export task.

**Authentication**: Required (API Key)

**Response**:
```json
{
  "status": 200,
  "message": "Export task cancelled successfully"
}
```

## Data Types and Columns

### Users
**Available Columns**: `id`, `email`, `firstName`, `lastName`, `role`, `isActive`, `createdAt`
**Available Filters**: `userRole`, `dateRange`

### Bills
**Available Columns**: `id`, `userId`, `utilityProviderId`, `amount`, `dueDate`, `status`, `billNumber`, `createdAt`
**Available Filters**: `status`, `utilityType`, `minAmount`, `maxAmount`, `dateRange`

### Payments
**Available Columns**: `id`, `userId`, `billId`, `amount`, `currency`, `status`, `method`, `transactionId`, `createdAt`
**Available Filters**: `status`, `paymentMethod`, `minAmount`, `maxAmount`, `dateRange`

### Analytics
**Available Columns**: `date`, `revenue`, `users`, `transactions`, `averageAmount`
**Available Filters**: `dateRange`

## Export Formats

### CSV (Comma-Separated Values)
- **MIME Type**: `text/csv`
- **Description**: Universal format compatible with spreadsheet applications
- **Features**: Headers, customizable columns, filtering
- **Best For**: Data analysis, import into other systems

### Excel (XLSX)
- **MIME Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Description**: Microsoft Excel format with styling
- **Features**: Formatted headers, auto-fit columns, professional appearance
- **Best For**: Business reports, presentations

### PDF (Portable Document Format)
- **MIME Type**: `application/pdf`
- **Description**: Fixed-layout document format
- **Features**: Professional layout, metadata, limited to 50 rows per page
- **Best For**: Official reports, sharing, printing

## Filtering Options

### Status Filter
```json
{
  "filters": {
    "status": ["PENDING", "PAID", "OVERDUE"]
  }
}
```

### Date Range Filter
```json
{
  "filters": {
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    }
  }
}
```

### Amount Range Filter
```json
{
  "filters": {
    "minAmount": 10.00,
    "maxAmount": 1000.00
  }
}
```

### User Role Filter
```json
{
  "filters": {
    "userRole": ["USER", "ADMIN"]
  }
}
```

### Utility Type Filter
```json
{
  "filters": {
    "utilityType": ["ELECTRICITY", "WATER", "GAS"]
  }
}
```

### Payment Method Filter
```json
{
  "filters": {
    "paymentMethod": ["STELLAR", "CREDIT_CARD", "BANK_TRANSFER"]
  }
}
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "status": 400,
  "error": "Invalid export options",
  "details": [
    "Invalid format. Must be csv, xlsx, or pdf",
    "Start date must be before end date"
  ]
}
```

#### 401 Unauthorized
```json
{
  "status": 401,
  "error": "Authentication required"
}
```

#### 404 Not Found
```json
{
  "status": 404,
  "error": "Export task not found"
}
```

#### 500 Internal Server Error
```json
{
  "status": 500,
  "error": "Failed to create export task",
  "message": "Database connection error"
}
```

## Performance Considerations

### Large Datasets
- Exports are processed asynchronously in the background
- Progress tracking allows monitoring of long-running exports
- Page size can be adjusted for memory management
- Automatic cleanup of expired exports (24 hours)

### Memory Management
- Streaming for large file downloads
- Efficient database queries with proper indexing
- Progress cache with automatic cleanup
- Error handling for resource exhaustion

### Rate Limiting
- Export creation is rate-limited to prevent abuse
- Concurrent export limits may be enforced
- API key authentication required for all operations

## Security

### Authentication
- All endpoints require valid API key authentication
- User context is captured for audit logging
- Export tasks are isolated by user

### Audit Logging
- All export operations are logged with full context
- Sensitive data access is tracked
- Export downloads are monitored

### Data Privacy
- Filters ensure users only export authorized data
- Column selection prevents accidental data exposure
- Export files have limited retention period

## Implementation Details

### Architecture
- **ExportService**: Core business logic for export processing
- **ExportController**: HTTP API layer with validation
- **ExportRoutes**: Route definitions with middleware
- **Background Processing**: Asynchronous task handling

### Dependencies
- `xlsx`: Excel file generation
- `exceljs`: Advanced Excel formatting
- `pdfkit`: PDF document generation
- `csv-writer`: CSV file creation
- `@prisma/client`: Database access

### Database Integration
- Direct Prisma queries for optimal performance
- Proper filtering at database level
- Efficient pagination for large datasets

## Usage Examples

### Example 1: Export Users to CSV
```bash
curl -X POST http://localhost:3000/api/export/create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "dataType": "users",
    "columns": ["id", "email", "firstName", "lastName", "role"],
    "filters": {
      "userRole": ["USER"]
    }
  }'
```

### Example 2: Export Payments to Excel with Date Range
```bash
curl -X POST http://localhost:3000/api/export/create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "xlsx",
    "dataType": "payments",
    "filters": {
      "status": ["COMPLETED"],
      "dateRange": {
        "start": "2024-01-01",
        "end": "2024-01-31"
      },
      "minAmount": 50.00
    }
  }'
```

### Example 3: Check Export Progress
```bash
curl -X GET http://localhost:3000/api/export/progress/export_1642234567890_abc123def \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example 4: Download Completed Export
```bash
curl -X GET http://localhost:3000/api/export/download/export_1642234567890_abc123def \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -o export_file.csv
```

## Testing

### Unit Tests
- Export service functionality
- Data validation
- Filter application
- Format generation

### Integration Tests
- Full export workflow
- API endpoint testing
- Error scenarios
- Performance testing

### Test Coverage
- All export formats
- All data types
- Filter combinations
- Error conditions

## Future Enhancements

### Planned Features
- Scheduled exports
- Export templates
- Email delivery
- Cloud storage integration
- Real-time notifications
- Advanced data transformations

### Performance Improvements
- Parallel processing
- Caching strategies
- Database optimization
- Streaming improvements

### Additional Formats
- JSON export
- XML export
- Custom formats
- Report templates

## Support

For issues, questions, or feature requests related to the export system:

1. Check the API documentation
2. Review the error messages
3. Consult the test examples
4. Contact the development team

## Changelog

### v1.0.0 (Current)
- Initial implementation
- CSV, Excel, PDF export support
- Users, Bills, Payments, Analytics data types
- Advanced filtering and progress tracking
- Comprehensive API with authentication
- Full test coverage

---

*This documentation covers the complete export system implementation as of version 1.0.0.*
