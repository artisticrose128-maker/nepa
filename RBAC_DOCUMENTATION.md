# RBAC System Documentation

## Overview

The Role-Based Access Control (RBAC) system provides granular permission management for the NEPA platform. This system allows administrators to define roles with specific permissions and assign them to users for fine-grained access control.

## Architecture

### Core Components

1. **Roles**: Define sets of permissions that can be assigned to users
2. **Permissions**: Granular access controls for specific resources and actions
3. **Role-Permission Assignments**: Link permissions to roles
4. **User-Role Assignments**: Assign roles to users with optional expiration

### Permission Structure

```typescript
interface Permission {
  resource: ResourceType;     // USER, BILL, PAYMENT, UTILITY, etc.
  action: string;           // create, read, update, delete, manage
  scope: PermissionScope;     // GLOBAL, ORGANIZATION, DEPARTMENT, PERSONAL
}
```

### Resource Types

- **USER**: User management operations
- **BILL**: Bill management operations  
- **PAYMENT**: Payment processing operations
- **UTILITY**: Utility provider management
- **REPORT**: Report generation and viewing
- **WEBHOOK**: Webhook management
- **DOCUMENT**: Document management
- **AUDIT_LOG**: Audit log access
- **ROLE**: Role management
- **PERMISSION**: Permission management
- **SYSTEM**: System administration

### Permission Scopes

- **GLOBAL**: System-wide permissions
- **ORGANIZATION**: Organization-level permissions
- **DEPARTMENT**: Department-level permissions  
- **PERSONAL**: User-specific permissions (own resources only)

## Default Roles

### Super Admin
- **Description**: Full system access with all permissions
- **Scope**: Global
- **Permissions**: All system permissions

### Admin
- **Description**: Administrative access for most operations
- **Scope**: Global
- **Permissions**: User, billing, payment, utility, report, webhook, document management
- **Excludes**: System management, role/permission creation

### User Manager
- **Description**: Can manage users and their permissions
- **Scope**: Global
- **Permissions**: User CRUD, role/permission read access, audit log access

### Billing Manager
- **Description**: Can manage bills and payments
- **Scope**: Global
- **Permissions**: Bill and payment CRUD, utility management, reporting

### Report Viewer
- **Description**: Can view reports and analytics
- **Scope**: Global
- **Permissions**: Read-only access to all resources

### Standard User
- **Description**: Basic user permissions for personal resources
- **Scope**: Personal
- **Permissions**: Create/read/update own bills, payments, reports, webhooks, documents

## API Endpoints

### Role Management

#### Create Role
```http
POST /api/rbac/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Custom Role",
  "description": "Custom role description",
  "scope": "GLOBAL"
}
```

#### Get Roles
```http
GET /api/rbac/roles?includePermissions=true
Authorization: Bearer <token>
```

#### Update Role
```http
PUT /api/rbac/roles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Role",
  "description": "Updated description",
  "isActive": true
}
```

#### Delete Role
```http
DELETE /api/rbac/roles/:id
Authorization: Bearer <token>
```

### Permission Management

#### Create Permission
```http
POST /api/rbac/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "custom.permission",
  "description": "Custom permission",
  "resource": "BILL",
  "action": "approve",
  "scope": "GLOBAL"
}
```

#### Get Permissions
```http
GET /api/rbac/permissions
Authorization: Bearer <token>
```

### Role-Permission Assignment

#### Assign Permission to Role
```http
POST /api/rbac/roles/:roleId/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissionId": "permission-id"
}
```

#### Remove Permission from Role
```http
DELETE /api/rbac/roles/:roleId/permissions/:permissionId
Authorization: Bearer <token>
```

### User-Role Assignment

#### Assign Role to User
```http
POST /api/rbac/users/:userId/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "roleId": "role-id",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

#### Remove Role from User
```http
DELETE /api/rbac/users/:userId/roles/:roleId
Authorization: Bearer <token>
```

#### Get User Roles
```http
GET /api/rbac/users/:userId/roles
Authorization: Bearer <token>
```

#### Get User Permissions
```http
GET /api/rbac/users/:userId/permissions
Authorization: Bearer <token>
```

### Permission Checking

#### Check Single Permission
```http
POST /api/rbac/users/:userId/check-permission
Authorization: Bearer <token>
Content-Type: application/json

{
  "resource": "BILL",
  "action": "create",
  "scope": "PERSONAL"
}
```

#### Check Any Permission
```http
POST /api/rbac/users/:userId/check-any-permission
Authorization: Bearer <token>
Content-Type: application/json

{
  "checks": [
    {
      "resource": "BILL",
      "action": "create"
    },
    {
      "resource": "PAYMENT", 
      "action": "process"
    }
  ]
}
```

#### Check All Permissions
```http
POST /api/rbac/users/:userId/check-all-permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "checks": [
    {
      "resource": "BILL",
      "action": "create"
    },
    {
      "resource": "BILL",
      "action": "read"
    }
  ]
}
```

## Middleware Usage

### Basic Permission Check
```typescript
import { requirePermission } from '../middleware/authentication';
import { ResourceType, PermissionScope } from '@prisma/client';

// Require permission to create bills
router.post('/bills', 
  requirePermission({
    resource: ResourceType.BILL,
    action: 'create',
    scope: PermissionScope.PERSONAL
  }),
  createBillHandler
);
```

### Multiple Permission Check
```typescript
import { requireAnyPermission } from '../middleware/authentication';

// Require any of these permissions
router.post('/admin-action',
  requireAnyPermission([
    {
      resource: ResourceType.USER,
      action: 'manage'
    },
    {
      resource: ResourceType.SYSTEM,
      action: 'admin'
    }
  ]),
  adminActionHandler
);
```

### Resource-Specific Access
```typescript
import { requireResourceAccess } from '../middleware/authentication';

// Require permission to access specific bill
router.get('/bills/:id',
  requireResourceAccess('id', {
    resource: ResourceType.BILL,
    action: 'read',
    scope: PermissionScope.PERSONAL
  }),
  getBillHandler
);
```

### Self-Access Only
```typescript
import { requireSelfAccess } from '../middleware/authentication';

// Users can only access their own profile
router.get('/profile/:userId',
  requireSelfAccess('userId'),
  getProfileHandler
);
```

## GraphQL API

### Queries
```graphql
query {
  roles(includePermissions: true) {
    id
    name
    description
    scope
    permissions {
      id
      name
      resource
      action
      scope
    }
  }
  
  userPermissions(userId: "user-id") {
    id
    name
    resource
    action
    scope
  }
  
  checkUserPermission(userId: "user-id", check: {
    resource: BILL
    action: "create"
    scope: PERSONAL
  }) {
    hasPermission
    resource
    action
  }
}
```

### Mutations
```graphql
mutation {
  createRole(input: {
    name: "Custom Role"
    description: "Custom role description"
    scope: GLOBAL
  }) {
    id
    name
    description
    scope
  }
  
  assignRoleToUser(input: {
    userId: "user-id"
    roleId: "role-id"
    expiresAt: "2024-12-31T23:59:59Z"
  }) {
    id
    user {
      id
      email
    }
    role {
      id
      name
    }
  }
}
```

## Database Schema

### Role Table
```sql
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "scope" "PermissionScope" NOT NULL DEFAULT 'GLOBAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id")
);
```

### Permission Table
```sql
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "resource" "ResourceType" NOT NULL,
    "action" TEXT NOT NULL,
    "scope" "PermissionScope" NOT NULL DEFAULT 'GLOBAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id")
);
```

### RolePermission Junction Table
```sql
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    UNIQUE ("roleId", "permissionId"),
    FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE,
    FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE
);
```

### UserRoleAssignment Table
```sql
CREATE TABLE "UserRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY ("id"),
    UNIQUE ("userId", "roleId"),
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE
);
```

## Caching

The RBAC service implements permission caching for performance:

- **Cache TTL**: 5 minutes
- **Cache Key**: `user_perms_${userId}`
- **Cache Invalidation**: Automatic on role/permission changes

## Security Features

### Audit Logging
All RBAC operations are logged to the audit system:
- Role creation/modification/deletion
- Permission creation/modification/deletion
- Role-permission assignments
- User-role assignments

### System Protection
- System roles and permissions cannot be deleted
- Only users with appropriate permissions can modify RBAC settings
- Permission checks include resource ownership validation

### Performance Optimization
- Permission caching reduces database queries
- Batch permission checks for multiple operations
- Efficient database indexes for common queries

## Migration and Setup

### 1. Run Database Migration
```bash
# Apply the RBAC migration
psql -d your_database -f migrations/add_rbac_system.sql
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Run Seed Script
```bash
npx ts-node scripts/seed-rbac.ts
```

## Best Practices

### Permission Design
1. **Principle of Least Privilege**: Grant only necessary permissions
2. **Resource-Specific Actions**: Use specific actions over generic "manage"
3. **Scope Appropriately**: Use PERSONAL scope for user-owned resources
4. **Descriptive Names**: Use clear, consistent naming conventions

### Role Management
1. **Role Hierarchies**: Create logical role progressions
2. **Regular Audits**: Review role assignments periodically
3. **Expiration Dates**: Use temporary assignments for contractors
4. **Documentation**: Maintain clear role descriptions

### Implementation
1. **Middleware Usage**: Always use RBAC middleware for protection
2. **Permission Checking**: Validate permissions at multiple layers
3. **Error Handling**: Return appropriate 403 responses
4. **Testing**: Thoroughly test permission boundaries

## Troubleshooting

### Common Issues

1. **Permission Not Working**
   - Check if user has active role assignment
   - Verify permission exists and is active
   - Clear permission cache if recently modified

2. **Role Assignment Fails**
   - Verify role exists and is active
   - Check for duplicate assignments
   - Ensure user has permission to assign roles

3. **Performance Issues**
   - Check permission cache hit rate
   - Verify database indexes
   - Consider batch permission checks

### Debug Tools

Use the permission checking endpoints to debug access issues:
```bash
curl -X POST http://localhost:3000/api/rbac/users/user-id/check-permission \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"resource": "BILL", "action": "create"}'
```

## Future Enhancements

1. **Role Hierarchies**: Support for role inheritance
2. **Conditional Permissions**: Time-based or location-based permissions
3. **Permission Templates**: Pre-defined permission sets for common use cases
4. **Bulk Operations**: Batch role assignments and permission updates
5. **Advanced Caching**: Redis-based distributed caching
6. **Permission Analytics**: Usage tracking and optimization suggestions
