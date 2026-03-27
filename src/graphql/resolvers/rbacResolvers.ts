import { gql } from 'apollo-server-express';
import { rbacService } from '../../services/RbacService';
import { ResourceType, PermissionScope } from '@prisma/client';

// GraphQL Type Definitions
export const rbacTypeDefs = gql`
  scalar DateTime

  enum PermissionScope {
    GLOBAL
    ORGANIZATION
    DEPARTMENT
    PERSONAL
  }

  enum ResourceType {
    USER
    BILL
    PAYMENT
    UTILITY
    REPORT
    WEBHOOK
    DOCUMENT
    AUDIT_LOG
    ROLE
    PERMISSION
    SYSTEM
  }

  type Role {
    id: String!
    name: String!
    description: String
    scope: PermissionScope!
    isActive: Boolean!
    isSystem: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    permissions: [Permission!]!
    userAssignments: [UserRoleAssignment!]!
  }

  type Permission {
    id: String!
    name: String!
    description: String
    resource: ResourceType!
    action: String!
    scope: PermissionScope!
    isActive: Boolean!
    isSystem: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    rolePermissions: [RolePermission!]!
  }

  type RolePermission {
    id: String!
    role: Role!
    permission: Permission!
    createdAt: DateTime!
  }

  type UserRoleAssignment {
    id: String!
    user: User!
    role: Role!
    assignedBy: User
    assignedAt: DateTime!
    expiresAt: DateTime
    isActive: Boolean!
  }

  type PermissionCheck {
    resource: ResourceType!
    action: String!
    scope: PermissionScope
  }

  type PermissionCheckResult {
    hasPermission: Boolean!
    resource: ResourceType!
    action: String!
    scope: PermissionScope
  }

  input CreateRoleInput {
    name: String!
    description: String
    scope: PermissionScope
    isSystem: Boolean
  }

  input UpdateRoleInput {
    name: String
    description: String
    scope: PermissionScope
    isActive: Boolean
  }

  input CreatePermissionInput {
    name: String!
    description: String
    resource: ResourceType!
    action: String!
    scope: PermissionScope
    isSystem: Boolean
  }

  input UpdatePermissionInput {
    name: String
    description: String
    resource: ResourceType
    action: String
    scope: PermissionScope
    isActive: Boolean
  }

  input AssignRoleInput {
    userId: String!
    roleId: String!
    expiresAt: DateTime
  }

  input PermissionCheckInput {
    resource: ResourceType!
    action: String!
    scope: PermissionScope
  }

  type Query {
    # Role queries
    roles(includePermissions: Boolean = false): [Role!]!
    role(id: ID!, includePermissions: Boolean = false): Role
    
    # Permission queries
    permissions: [Permission!]!
    permission(id: ID!): Permission
    
    # User role/permission queries
    userRoles(userId: ID!): [Role!]!
    userPermissions(userId: ID!): [Permission!]!
    
    # Permission checking
    checkUserPermission(userId: ID!, check: PermissionCheckInput!): PermissionCheckResult!
    checkUserAnyPermission(userId: ID!, checks: [PermissionCheckInput!]!): PermissionCheckResult!
    checkUserAllPermissions(userId: ID!, checks: [PermissionCheckInput!]!): PermissionCheckResult!
  }

  type Mutation {
    # Role mutations
    createRole(input: CreateRoleInput!): Role!
    updateRole(id: ID!, input: UpdateRoleInput!): Role!
    deleteRole(id: ID!): Boolean!
    
    # Permission mutations
    createPermission(input: CreatePermissionInput!): Permission!
    updatePermission(id: ID!, input: UpdatePermissionInput!): Permission!
    deletePermission(id: ID!): Boolean!
    
    # Role-Permission assignments
    assignPermissionToRole(roleId: ID!, permissionId: ID!): Boolean!
    removePermissionFromRole(roleId: ID!, permissionId: ID!): Boolean!
    
    # User-Role assignments
    assignRoleToUser(input: AssignRoleInput!): UserRoleAssignment!
    removeRoleFromUser(userId: ID!, roleId: ID!): Boolean!
    
    # System maintenance
    cleanupExpiredAssignments: Boolean!
  }
`;

// GraphQL Resolvers
export const rbacResolvers = {
  Query: {
    // Role queries
    roles: async (_: any, { includePermissions }: { includePermissions: boolean }) => {
      return await rbacService.getRoles(includePermissions);
    },

    role: async (_: any, { id, includePermissions }: { id: string; includePermissions: boolean }) => {
      return await rbacService.getRoleById(id, includePermissions);
    },

    // Permission queries
    permissions: async () => {
      return await rbacService.getPermissions();
    },

    permission: async (_: any, { id }: { id: string }) => {
      const permissions = await rbacService.getPermissions();
      return permissions.find(p => p.id === id) || null;
    },

    // User role/permission queries
    userRoles: async (_: any, { userId }: { userId: string }) => {
      return await rbacService.getUserRoles(userId);
    },

    userPermissions: async (_: any, { userId }: { userId: string }) => {
      return await rbacService.getUserPermissions(userId);
    },

    // Permission checking
    checkUserPermission: async (_: any, { userId, check }: { userId: string; check: any }) => {
      const hasPermission = await rbacService.hasPermission(userId, check);
      return {
        hasPermission,
        resource: check.resource,
        action: check.action,
        scope: check.scope
      };
    },

    checkUserAnyPermission: async (_: any, { userId, checks }: { userId: string; checks: any[] }) => {
      const hasPermission = await rbacService.hasAnyPermission(userId, checks);
      return {
        hasPermission,
        resource: checks[0]?.resource || ResourceType.SYSTEM,
        action: 'any',
        scope: checks[0]?.scope || PermissionScope.GLOBAL
      };
    },

    checkUserAllPermissions: async (_: any, { userId, checks }: { userId: string; checks: any[] }) => {
      const hasPermission = await rbacService.hasAllPermissions(userId, checks);
      return {
        hasPermission,
        resource: checks[0]?.resource || ResourceType.SYSTEM,
        action: 'all',
        scope: checks[0]?.scope || PermissionScope.GLOBAL
      };
    }
  },

  Mutation: {
    // Role mutations
    createRole: async (_: any, { input }: { input: any }) => {
      return await rbacService.createRole(input);
    },

    updateRole: async (_: any, { id, input }: { id: string; input: any }) => {
      return await rbacService.updateRole(id, input);
    },

    deleteRole: async (_: any, { id }: { id: string }) => {
      try {
        await rbacService.deleteRole(id);
        return true;
      } catch (error) {
        return false;
      }
    },

    // Permission mutations
    createPermission: async (_: any, { input }: { input: any }) => {
      return await rbacService.createPermission(input);
    },

    updatePermission: async (_: any, { id, input }: { id: string; input: any }) => {
      return await rbacService.updatePermission(id, input);
    },

    deletePermission: async (_: any, { id }: { id: string }) => {
      try {
        await rbacService.deletePermission(id);
        return true;
      } catch (error) {
        return false;
      }
    },

    // Role-Permission assignments
    assignPermissionToRole: async (_: any, { roleId, permissionId }: { roleId: string; permissionId: string }) => {
      try {
        await rbacService.assignPermissionToRole(roleId, permissionId);
        return true;
      } catch (error) {
        return false;
      }
    },

    removePermissionFromRole: async (_: any, { roleId, permissionId }: { roleId: string; permissionId: string }) => {
      try {
        await rbacService.removePermissionFromRole(roleId, permissionId);
        return true;
      } catch (error) {
        return false;
      }
    },

    // User-Role assignments
    assignRoleToUser: async (_: any, { input }: { input: any }, context: any) => {
      return await rbacService.assignRoleToUser({
        ...input,
        assignedBy: context.user?.id
      });
    },

    removeRoleFromUser: async (_: any, { userId, roleId }: { userId: string; roleId: string }) => {
      try {
        await rbacService.removeRoleFromUser(userId, roleId);
        return true;
      } catch (error) {
        return false;
      }
    },

    // System maintenance
    cleanupExpiredAssignments: async () => {
      try {
        await rbacService.cleanupExpiredAssignments();
        return true;
      } catch (error) {
        return false;
      }
    }
  },

  // Field resolvers for nested relationships
  Role: {
    permissions: async (parent: any) => {
      if (!parent.id) return [];
      const role = await rbacService.getRoleById(parent.id, true);
      return role?.permissions?.map((rp: any) => rp.permission) || [];
    },

    userAssignments: async (parent: any) => {
      // This would need to be implemented in the service
      // For now, return empty array
      return [];
    }
  },

  Permission: {
    rolePermissions: async (parent: any) => {
      // This would need to be implemented in the service
      // For now, return empty array
      return [];
    }
  },

  UserRoleAssignment: {
    user: async (parent: any) => {
      // This would need to be implemented in the service
      // For now, return null
      return null;
    },

    role: async (parent: any) => {
      // This would need to be implemented in the service
      // For now, return null
      return null;
    },

    assignedBy: async (parent: any) => {
      // This would need to be implemented in the service
      // For now, return null
      return null;
    }
  }
};
