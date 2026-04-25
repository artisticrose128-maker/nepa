import { PrismaClient, Role, Permission, UserRoleAssignment, RolePermission, ResourceType, PermissionScope, User } from '@prisma/client';
import { auditService } from './AuditService';
import { AuditAction, AuditSeverity, AuditStatus } from '../databases/audit-service/schema.prisma';

const prisma = new PrismaClient();

export interface CreateRoleData {
  name: string;
  description?: string;
  scope?: PermissionScope;
  isSystem?: boolean;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  scope?: PermissionScope;
  isActive?: boolean;
}

export interface CreatePermissionData {
  name: string;
  description?: string;
  resource: ResourceType;
  action: string;
  scope?: PermissionScope;
  isSystem?: boolean;
}

export interface UpdatePermissionData {
  name?: string;
  description?: string;
  resource?: ResourceType;
  action?: string;
  scope?: PermissionScope;
  isActive?: boolean;
}

export interface AssignRoleData {
  userId: string;
  roleId: string;
  assignedBy: string;
  expiresAt?: Date;
}

export interface PermissionCheck {
  resource: ResourceType;
  action: string;
  scope?: PermissionScope;
  resourceId?: string;
}

export class RbacService {
  private permissionCache = new Map<string, Set<string>>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Role Management
  async createRole(data: CreateRoleData): Promise<Role> {
    try {
      const existingRole = await prisma.role.findUnique({
        where: { name: data.name }
      });

      if (existingRole) {
        throw new Error(`Role with name '${data.name}' already exists`);
      }

      const role = await prisma.role.create({
        data: {
          name: data.name,
          description: data.description,
          scope: data.scope || PermissionScope.GLOBAL,
          isSystem: data.isSystem || false
        }
      });

      await auditService.logAudit({
        action: AuditAction.ROLE_CREATE,
        resource: 'role',
        resourceId: role.id,
        description: `Created role: ${role.name}`,
        severity: AuditSeverity.MEDIUM,
        status: AuditStatus.SUCCESS,
        metadata: {
          roleName: role.name,
          scope: role.scope
        }
      });

      this.clearUserPermissionCache();
      return role;
    } catch (error) {
      console.error('Create role error:', error);
      throw error;
    }
  }

  async updateRole(roleId: string, data: UpdateRoleData): Promise<Role> {
    try {
      const role = await prisma.role.findUnique({
        where: { id: roleId }
      });

      if (!role) {
        throw new Error('Role not found');
      }

      if (role.isSystem) {
        throw new Error('Cannot modify system roles');
      }

      const updatedRole = await prisma.role.update({
        where: { id: roleId },
        data
      });

      await auditService.logAudit({
        action: AuditAction.ROLE_UPDATE,
        resource: 'role',
        resourceId: roleId,
        description: `Updated role: ${updatedRole.name}`,
        severity: AuditSeverity.MEDIUM,
        status: AuditStatus.SUCCESS,
        metadata: {
          roleName: updatedRole.name,
          changes: data
        }
      });

      this.clearUserPermissionCache();
      return updatedRole;
    } catch (error) {
      console.error('Update role error:', error);
      throw error;
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      const role = await prisma.role.findUnique({
        where: { id: roleId }
      });

      if (!role) {
        throw new Error('Role not found');
      }

      if (role.isSystem) {
        throw new Error('Cannot delete system roles');
      }

      await prisma.role.delete({
        where: { id: roleId }
      });

      await auditService.logAudit({
        action: AuditAction.ROLE_DELETE,
        resource: 'role',
        resourceId: roleId,
        description: `Deleted role: ${role.name}`,
        severity: AuditSeverity.HIGH,
        status: AuditStatus.SUCCESS,
        metadata: {
          roleName: role.name
        }
      });

      this.clearUserPermissionCache();
    } catch (error) {
      console.error('Delete role error:', error);
      throw error;
    }
  }

  async getRoles(includePermissions: boolean = false): Promise<Role[]> {
    try {
      return await prisma.role.findMany({
        include: includePermissions ? {
          permissions: {
            include: {
              permission: true
            }
          }
        } : undefined,
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      console.error('Get roles error:', error);
      throw error;
    }
  }

  async getRoleById(roleId: string, includePermissions: boolean = false): Promise<Role | null> {
    try {
      return await prisma.role.findUnique({
        where: { id: roleId },
        include: includePermissions ? {
          permissions: {
            include: {
              permission: true
            }
          }
        } : undefined
      });
    } catch (error) {
      console.error('Get role by ID error:', error);
      throw error;
    }
  }

  // Permission Management
  async createPermission(data: CreatePermissionData): Promise<Permission> {
    try {
      const existingPermission = await prisma.permission.findUnique({
        where: { name: data.name }
      });

      if (existingPermission) {
        throw new Error(`Permission with name '${data.name}' already exists`);
      }

      const permission = await prisma.permission.create({
        data: {
          name: data.name,
          description: data.description,
          resource: data.resource,
          action: data.action,
          scope: data.scope || PermissionScope.GLOBAL,
          isSystem: data.isSystem || false
        }
      });

      await auditService.logAudit({
        action: AuditAction.PERMISSION_CREATE,
        resource: 'permission',
        resourceId: permission.id,
        description: `Created permission: ${permission.name}`,
        severity: AuditSeverity.MEDIUM,
        status: AuditStatus.SUCCESS,
        metadata: {
          permissionName: permission.name,
          resource: permission.resource,
          action: permission.action
        }
      });

      this.clearUserPermissionCache();
      return permission;
    } catch (error) {
      console.error('Create permission error:', error);
      throw error;
    }
  }

  async updatePermission(permissionId: string, data: UpdatePermissionData): Promise<Permission> {
    try {
      const permission = await prisma.permission.findUnique({
        where: { id: permissionId }
      });

      if (!permission) {
        throw new Error('Permission not found');
      }

      if (permission.isSystem) {
        throw new Error('Cannot modify system permissions');
      }

      const updatedPermission = await prisma.permission.update({
        where: { id: permissionId },
        data
      });

      await auditService.logAudit({
        action: AuditAction.PERMISSION_UPDATE,
        resource: 'permission',
        resourceId: permissionId,
        description: `Updated permission: ${updatedPermission.name}`,
        severity: AuditSeverity.MEDIUM,
        status: AuditStatus.SUCCESS,
        metadata: {
          permissionName: updatedPermission.name,
          changes: data
        }
      });

      this.clearUserPermissionCache();
      return updatedPermission;
    } catch (error) {
      console.error('Update permission error:', error);
      throw error;
    }
  }

  async deletePermission(permissionId: string): Promise<void> {
    try {
      const permission = await prisma.permission.findUnique({
        where: { id: permissionId }
      });

      if (!permission) {
        throw new Error('Permission not found');
      }

      if (permission.isSystem) {
        throw new Error('Cannot delete system permissions');
      }

      await prisma.permission.delete({
        where: { id: permissionId }
      });

      await auditService.logAudit({
        action: AuditAction.PERMISSION_DELETE,
        resource: 'permission',
        resourceId: permissionId,
        description: `Deleted permission: ${permission.name}`,
        severity: AuditSeverity.HIGH,
        status: AuditStatus.SUCCESS,
        metadata: {
          permissionName: permission.name
        }
      });

      this.clearUserPermissionCache();
    } catch (error) {
      console.error('Delete permission error:', error);
      throw error;
    }
  }

  async getPermissions(): Promise<Permission[]> {
    try {
      return await prisma.permission.findMany({
        orderBy: [
          { resource: 'asc' },
          { action: 'asc' }
        ]
      });
    } catch (error) {
      console.error('Get permissions error:', error);
      throw error;
    }
  }

  // Role-Permission Management
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    try {
      const existingAssignment = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId
          }
        }
      });

      if (existingAssignment) {
        throw new Error('Permission already assigned to role');
      }

      await prisma.rolePermission.create({
        data: {
          roleId,
          permissionId
        }
      });

      const role = await prisma.role.findUnique({ where: { id: roleId } });
      const permission = await prisma.permission.findUnique({ where: { id: permissionId } });

      await auditService.logAudit({
        action: AuditAction.PERMISSION_ASSIGN,
        resource: 'role_permission',
        resourceId: `${roleId}-${permissionId}`,
        description: `Assigned permission '${permission?.name}' to role '${role?.name}'`,
        severity: AuditSeverity.MEDIUM,
        status: AuditStatus.SUCCESS,
        metadata: {
          roleName: role?.name,
          permissionName: permission?.name
        }
      });

      this.clearUserPermissionCache();
    } catch (error) {
      console.error('Assign permission to role error:', error);
      throw error;
    }
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    try {
      await prisma.rolePermission.delete({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId
          }
        }
      });

      const role = await prisma.role.findUnique({ where: { id: roleId } });
      const permission = await prisma.permission.findUnique({ where: { id: permissionId } });

      await auditService.logAudit({
        action: AuditAction.PERMISSION_REVOKE,
        resource: 'role_permission',
        resourceId: `${roleId}-${permissionId}`,
        description: `Removed permission '${permission?.name}' from role '${role?.name}'`,
        severity: AuditSeverity.MEDIUM,
        status: AuditStatus.SUCCESS,
        metadata: {
          roleName: role?.name,
          permissionName: permission?.name
        }
      });

      this.clearUserPermissionCache();
    } catch (error) {
      console.error('Remove permission from role error:', error);
      throw error;
    }
  }

  // User-Role Management
  async assignRoleToUser(data: AssignRoleData): Promise<UserRoleAssignment> {
    try {
      const existingAssignment = await prisma.userRoleAssignment.findUnique({
        where: {
          userId_roleId: {
            userId: data.userId,
            roleId: data.roleId
          }
        }
      });

      if (existingAssignment) {
        throw new Error('User already assigned to this role');
      }

      const assignment = await prisma.userRoleAssignment.create({
        data: {
          userId: data.userId,
          roleId: data.roleId,
          assignedBy: data.assignedBy,
          expiresAt: data.expiresAt
        }
      });

      const user = await prisma.user.findUnique({ where: { id: data.userId } });
      const role = await prisma.role.findUnique({ where: { id: data.roleId } });

      await auditService.logAudit({
        action: AuditAction.ROLE_ASSIGN,
        resource: 'user_role',
        resourceId: assignment.id,
        description: `Assigned role '${role?.name}' to user '${user?.email}'`,
        severity: AuditSeverity.MEDIUM,
        status: AuditStatus.SUCCESS,
        metadata: {
          userEmail: user?.email,
          roleName: role?.name,
          assignedBy: data.assignedBy,
          expiresAt: data.expiresAt
        }
      });

      this.clearUserPermissionCache();
      return assignment;
    } catch (error) {
      console.error('Assign role to user error:', error);
      throw error;
    }
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    try {
      await prisma.userRoleAssignment.delete({
        where: {
          userId_roleId: {
            userId,
            roleId
          }
        }
      });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const role = await prisma.role.findUnique({ where: { id: roleId } });

      await auditService.logAudit({
        action: AuditAction.ROLE_REVOKE,
        resource: 'user_role',
        resourceId: `${userId}-${roleId}`,
        description: `Removed role '${role?.name}' from user '${user?.email}'`,
        severity: AuditSeverity.MEDIUM,
        status: AuditStatus.SUCCESS,
        metadata: {
          userEmail: user?.email,
          roleName: role?.name
        }
      });

      this.clearUserPermissionCache();
    } catch (error) {
      console.error('Remove role from user error:', error);
      throw error;
    }
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const assignments = await prisma.userRoleAssignment.findMany({
        where: {
          userId,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        include: {
          role: true
        }
      });

      return assignments.map(assignment => assignment.role);
    } catch (error) {
      console.error('Get user roles error:', error);
      throw error;
    }
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const cacheKey = `user_perms_${userId}`;
      const cached = this.getCachedPermissions(cacheKey);
      if (cached) {
        return cached;
      }

      const assignments = await prisma.userRoleAssignment.findMany({
        where: {
          userId,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      });

      const permissions = assignments.flatMap(assignment =>
        assignment.role.permissions
          .filter(rp => rp.permission.isActive)
          .map(rp => rp.permission)
      );

      // Remove duplicates
      const uniquePermissions = permissions.filter((permission, index, self) =>
        index === self.findIndex(p => p.id === permission.id)
      );

      this.setCachedPermissions(cacheKey, uniquePermissions);
      return uniquePermissions;
    } catch (error) {
      console.error('Get user permissions error:', error);
      throw error;
    }
  }

  // Permission Checking
  async hasPermission(userId: string, check: PermissionCheck): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      
      return permissions.some(permission => {
        const resourceMatch = permission.resource === check.resource;
        const actionMatch = permission.action === check.action || permission.action === 'manage';
        const scopeMatch = !check.scope || permission.scope === check.scope || permission.scope === PermissionScope.GLOBAL;
        
        return resourceMatch && actionMatch && scopeMatch;
      });
    } catch (error) {
      console.error('Has permission error:', error);
      return false;
    }
  }

  async hasAnyPermission(userId: string, checks: PermissionCheck[]): Promise<boolean> {
    try {
      for (const check of checks) {
        if (await this.hasPermission(userId, check)) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Has any permission error:', error);
      return false;
    }
  }

  async hasAllPermissions(userId: string, checks: PermissionCheck[]): Promise<boolean> {
    try {
      for (const check of checks) {
        if (!(await this.hasPermission(userId, check))) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Has all permissions error:', error);
      return false;
    }
  }

  async canAccessResource(userId: string, resourceId: string, check: PermissionCheck): Promise<boolean> {
    try {
      // First check if user has the general permission
      if (!(await this.hasPermission(userId, check))) {
        return false;
      }

      // For personal scope, check if resource belongs to user
      if (check.scope === PermissionScope.PERSONAL) {
        // This would need to be implemented based on resource type
        // For now, we'll assume the resource ownership is validated elsewhere
        return true;
      }

      return true;
    } catch (error) {
      console.error('Can access resource error:', error);
      return false;
    }
  }

  // Utility methods
  private getCachedPermissions(cacheKey: string): Permission[] | null {
    const cached = this.permissionCache.get(cacheKey);
    const expiry = this.cacheExpiry.get(cacheKey);
    
    if (cached && expiry && expiry > Date.now()) {
      return Array.from(cached);
    }
    
    this.permissionCache.delete(cacheKey);
    this.cacheExpiry.delete(cacheKey);
    return null;
  }

  private setCachedPermissions(cacheKey: string, permissions: Permission[]): void {
    this.permissionCache.set(cacheKey, new Set(permissions));
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
  }

  private clearUserPermissionCache(): void {
    this.permissionCache.clear();
    this.cacheExpiry.clear();
  }

  // Cleanup expired role assignments
  async cleanupExpiredAssignments(): Promise<void> {
    try {
      await prisma.userRoleAssignment.updateMany({
        where: {
          expiresAt: {
            lt: new Date()
          },
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      console.log('Cleaned up expired role assignments');
    } catch (error) {
      console.error('Cleanup expired assignments error:', error);
    }
  }
}

export const rbacService = new RbacService();
