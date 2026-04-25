-- Migration: Add RBAC System
-- Created: 2026-03-25
-- Description: Add Role-Based Access Control (RBAC) tables for granular permission management

-- Create PermissionScope enum type
DO $$ BEGIN
    CREATE TYPE "PermissionScope" AS ENUM('GLOBAL', 'ORGANIZATION', 'DEPARTMENT', 'PERSONAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create ResourceType enum type
DO $$ BEGIN
    CREATE TYPE "ResourceType" AS ENUM('USER', 'BILL', 'PAYMENT', 'UTILITY', 'REPORT', 'WEBHOOK', 'DOCUMENT', 'AUDIT_LOG', 'ROLE', 'PERMISSION', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Role table
CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" "PermissionScope" NOT NULL DEFAULT 'GLOBAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- Create unique index on role name
CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_key" ON "Role"("name");

-- Create indexes for Role table
CREATE INDEX IF NOT EXISTS "Role_scope_idx" ON "Role"("scope");
CREATE INDEX IF NOT EXISTS "Role_isActive_idx" ON "Role"("isActive");

-- Create Permission table
CREATE TABLE IF NOT EXISTS "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resource" "ResourceType" NOT NULL,
    "action" TEXT NOT NULL,
    "scope" "PermissionScope" NOT NULL DEFAULT 'GLOBAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- Create unique index on permission name
CREATE UNIQUE INDEX IF NOT EXISTS "Permission_name_key" ON "Permission"("name");

-- Create indexes for Permission table
CREATE INDEX IF NOT EXISTS "Permission_resource_idx" ON "Permission"("resource");
CREATE INDEX IF NOT EXISTS "Permission_action_idx" ON "Permission"("action");
CREATE INDEX IF NOT EXISTS "Permission_scope_idx" ON "Permission"("scope");
CREATE INDEX IF NOT EXISTS "Permission_isActive_idx" ON "Permission"("isActive");

-- Create RolePermission junction table
CREATE TABLE IF NOT EXISTS "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on roleId and permissionId
CREATE UNIQUE INDEX IF NOT EXISTS "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- Create indexes for RolePermission table
CREATE INDEX IF NOT EXISTS "RolePermission_roleId_idx" ON "RolePermission"("roleId");
CREATE INDEX IF NOT EXISTS "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- Create UserRoleAssignment table
CREATE TABLE IF NOT EXISTS "UserRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on userId and roleId
CREATE UNIQUE INDEX IF NOT EXISTS "UserRoleAssignment_userId_roleId_key" ON "UserRoleAssignment"("userId", "roleId");

-- Create indexes for UserRoleAssignment table
CREATE INDEX IF NOT EXISTS "UserRoleAssignment_userId_idx" ON "UserRoleAssignment"("userId");
CREATE INDEX IF NOT EXISTS "UserRoleAssignment_roleId_idx" ON "UserRoleAssignment"("roleId");
CREATE INDEX IF NOT EXISTS "UserRoleAssignment_assignedBy_idx" ON "UserRoleAssignment"("assignedBy");
CREATE INDEX IF NOT EXISTS "UserRoleAssignment_expiresAt_idx" ON "UserRoleAssignment"("expiresAt");
CREATE INDEX IF NOT EXISTS "UserRoleAssignment_isActive_idx" ON "UserRoleAssignment"("isActive");

-- Add foreign key constraints
DO $$ BEGIN
    ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" 
        FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" 
        FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_roleId_fkey" 
        FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add trigger for updating updatedAt timestamp on Role table
CREATE OR REPLACE FUNCTION update_role_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_role_updated_at_trigger ON "Role";
CREATE TRIGGER update_role_updated_at_trigger
    BEFORE UPDATE ON "Role"
    FOR EACH ROW
    EXECUTE FUNCTION update_role_updated_at();

-- Add trigger for updating updatedAt timestamp on Permission table
CREATE OR REPLACE FUNCTION update_permission_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_permission_updated_at_trigger ON "Permission";
CREATE TRIGGER update_permission_updated_at_trigger
    BEFORE UPDATE ON "Permission"
    FOR EACH ROW
    EXECUTE FUNCTION update_permission_updated_at();

-- Create trigger for updating updatedAt timestamp on UserRoleAssignment table
CREATE OR REPLACE FUNCTION update_user_role_assignment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- No updatedAt field in UserRoleAssignment, but keeping function for consistency
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add comments for documentation
COMMENT ON TABLE "Role" IS 'Defines roles that can be assigned to users with specific permissions';
COMMENT ON TABLE "Permission" IS 'Defines granular permissions for accessing resources';
COMMENT ON TABLE "RolePermission" IS 'Junction table linking roles to permissions';
COMMENT ON TABLE "UserRoleAssignment" IS 'Tracks role assignments to users with expiration support';

COMMENT ON COLUMN "Role"."isSystem" IS 'Indicates if this is a system role that cannot be deleted';
COMMENT ON COLUMN "Permission"."isSystem" IS 'Indicates if this is a system permission that cannot be deleted';
COMMENT ON COLUMN "UserRoleAssignment"."expiresAt" IS 'Optional expiration date for role assignment';
COMMENT ON COLUMN "UserRoleAssignment"."assignedBy" IS 'User who assigned this role (for audit purposes)';
