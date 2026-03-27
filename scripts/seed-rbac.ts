import { PrismaClient, ResourceType, PermissionScope } from '@prisma/client';
import { rbacService } from '../services/RbacService';

const prisma = new PrismaClient();

export async function seedRbacData() {
  try {
    console.log('🌱 Starting RBAC seed data...');

    // Create default permissions
    const defaultPermissions = [
      // User permissions
      { name: 'user.create', description: 'Create new users', resource: ResourceType.USER, action: 'create', scope: PermissionScope.GLOBAL },
      { name: 'user.read', description: 'View user information', resource: ResourceType.USER, action: 'read', scope: PermissionScope.GLOBAL },
      { name: 'user.update', description: 'Update user information', resource: ResourceType.USER, action: 'update', scope: PermissionScope.GLOBAL },
      { name: 'user.delete', description: 'Delete users', resource: ResourceType.USER, action: 'delete', scope: PermissionScope.GLOBAL },
      { name: 'user.manage', description: 'Full user management', resource: ResourceType.USER, action: 'manage', scope: PermissionScope.GLOBAL },
      { name: 'user.read.self', description: 'View own user information', resource: ResourceType.USER, action: 'read', scope: PermissionScope.PERSONAL },
      { name: 'user.update.self', description: 'Update own user information', resource: ResourceType.USER, action: 'update', scope: PermissionScope.PERSONAL },

      // Bill permissions
      { name: 'bill.create', description: 'Create new bills', resource: ResourceType.BILL, action: 'create', scope: PermissionScope.GLOBAL },
      { name: 'bill.read', description: 'View bill information', resource: ResourceType.BILL, action: 'read', scope: PermissionScope.GLOBAL },
      { name: 'bill.update', description: 'Update bill information', resource: ResourceType.BILL, action: 'update', scope: PermissionScope.GLOBAL },
      { name: 'bill.delete', description: 'Delete bills', resource: ResourceType.BILL, action: 'delete', scope: PermissionScope.GLOBAL },
      { name: 'bill.manage', description: 'Full bill management', resource: ResourceType.BILL, action: 'manage', scope: PermissionScope.GLOBAL },
      { name: 'bill.read.self', description: 'View own bills', resource: ResourceType.BILL, action: 'read', scope: PermissionScope.PERSONAL },
      { name: 'bill.create.self', description: 'Create own bills', resource: ResourceType.BILL, action: 'create', scope: PermissionScope.PERSONAL },

      // Payment permissions
      { name: 'payment.create', description: 'Create new payments', resource: ResourceType.PAYMENT, action: 'create', scope: PermissionScope.GLOBAL },
      { name: 'payment.read', description: 'View payment information', resource: ResourceType.PAYMENT, action: 'read', scope: PermissionScope.GLOBAL },
      { name: 'payment.update', description: 'Update payment information', resource: ResourceType.PAYMENT, action: 'update', scope: PermissionScope.GLOBAL },
      { name: 'payment.delete', description: 'Delete payments', resource: ResourceType.PAYMENT, action: 'delete', scope: PermissionScope.GLOBAL },
      { name: 'payment.manage', description: 'Full payment management', resource: ResourceType.PAYMENT, action: 'manage', scope: PermissionScope.GLOBAL },
      { name: 'payment.read.self', description: 'View own payments', resource: ResourceType.PAYMENT, action: 'read', scope: PermissionScope.PERSONAL },
      { name: 'payment.create.self', description: 'Create own payments', resource: ResourceType.PAYMENT, action: 'create', scope: PermissionScope.PERSONAL },

      // Utility permissions
      { name: 'utility.create', description: 'Create new utilities', resource: ResourceType.UTILITY, action: 'create', scope: PermissionScope.GLOBAL },
      { name: 'utility.read', description: 'View utility information', resource: ResourceType.UTILITY, action: 'read', scope: PermissionScope.GLOBAL },
      { name: 'utility.update', description: 'Update utility information', resource: ResourceType.UTILITY, action: 'update', scope: PermissionScope.GLOBAL },
      { name: 'utility.delete', description: 'Delete utilities', resource: ResourceType.UTILITY, action: 'delete', scope: PermissionScope.GLOBAL },
      { name: 'utility.manage', description: 'Full utility management', resource: ResourceType.UTILITY, action: 'manage', scope: PermissionScope.GLOBAL },

      // Report permissions
      { name: 'report.create', description: 'Create new reports', resource: ResourceType.REPORT, action: 'create', scope: PermissionScope.GLOBAL },
      { name: 'report.read', description: 'View report information', resource: ResourceType.REPORT, action: 'read', scope: PermissionScope.GLOBAL },
      { name: 'report.update', description: 'Update report information', resource: ResourceType.REPORT, action: 'update', scope: PermissionScope.GLOBAL },
      { name: 'report.delete', description: 'Delete reports', resource: ResourceType.REPORT, action: 'delete', scope: PermissionScope.GLOBAL },
      { name: 'report.manage', description: 'Full report management', resource: ResourceType.REPORT, action: 'manage', scope: PermissionScope.GLOBAL },
      { name: 'report.read.self', description: 'View own reports', resource: ResourceType.REPORT, action: 'read', scope: PermissionScope.PERSONAL },
      { name: 'report.create.self', description: 'Create own reports', resource: ResourceType.REPORT, action: 'create', scope: PermissionScope.PERSONAL },

      // Webhook permissions
      { name: 'webhook.create', description: 'Create new webhooks', resource: ResourceType.WEBHOOK, action: 'create', scope: PermissionScope.GLOBAL },
      { name: 'webhook.read', description: 'View webhook information', resource: ResourceType.WEBHOOK, action: 'read', scope: PermissionScope.GLOBAL },
      { name: 'webhook.update', description: 'Update webhook information', resource: ResourceType.WEBHOOK, action: 'update', scope: PermissionScope.GLOBAL },
      { name: 'webhook.delete', description: 'Delete webhooks', resource: ResourceType.WEBHOOK, action: 'delete', scope: PermissionScope.GLOBAL },
      { name: 'webhook.manage', description: 'Full webhook management', resource: ResourceType.WEBHOOK, action: 'manage', scope: PermissionScope.GLOBAL },
      { name: 'webhook.read.self', description: 'View own webhooks', resource: ResourceType.WEBHOOK, action: 'read', scope: PermissionScope.PERSONAL },
      { name: 'webhook.create.self', description: 'Create own webhooks', resource: ResourceType.WEBHOOK, action: 'create', scope: PermissionScope.PERSONAL },

      // Document permissions
      { name: 'document.create', description: 'Create new documents', resource: ResourceType.DOCUMENT, action: 'create', scope: PermissionScope.GLOBAL },
      { name: 'document.read', description: 'View document information', resource: ResourceType.DOCUMENT, action: 'read', scope: PermissionScope.GLOBAL },
      { name: 'document.update', description: 'Update document information', resource: ResourceType.DOCUMENT, action: 'update', scope: PermissionScope.GLOBAL },
      { name: 'document.delete', description: 'Delete documents', resource: ResourceType.DOCUMENT, action: 'delete', scope: PermissionScope.GLOBAL },
      { name: 'document.manage', description: 'Full document management', resource: ResourceType.DOCUMENT, action: 'manage', scope: PermissionScope.GLOBAL },
      { name: 'document.read.self', description: 'View own documents', resource: ResourceType.DOCUMENT, action: 'read', scope: PermissionScope.PERSONAL },
      { name: 'document.create.self', description: 'Create own documents', resource: ResourceType.DOCUMENT, action: 'create', scope: PermissionScope.PERSONAL },

      // Audit log permissions
      { name: 'audit.read', description: 'View audit logs', resource: ResourceType.AUDIT_LOG, action: 'read', scope: PermissionScope.GLOBAL },
      { name: 'audit.manage', description: 'Full audit log management', resource: ResourceType.AUDIT_LOG, action: 'manage', scope: PermissionScope.GLOBAL },

      // Role permissions
      { name: 'role.create', description: 'Create new roles', resource: ResourceType.ROLE, action: 'create', scope: PermissionScope.GLOBAL },
      { name: 'role.read', description: 'View role information', resource: ResourceType.ROLE, action: 'read', scope: PermissionScope.GLOBAL },
      { name: 'role.update', description: 'Update role information', resource: ResourceType.ROLE, action: 'update', scope: PermissionScope.GLOBAL },
      { name: 'role.delete', description: 'Delete roles', resource: ResourceType.ROLE, action: 'delete', scope: PermissionScope.GLOBAL },
      { name: 'role.manage', description: 'Full role management', resource: ResourceType.ROLE, action: 'manage', scope: PermissionScope.GLOBAL },

      // Permission permissions
      { name: 'permission.create', description: 'Create new permissions', resource: ResourceType.PERMISSION, action: 'create', scope: PermissionScope.GLOBAL },
      { name: 'permission.read', description: 'View permission information', resource: ResourceType.PERMISSION, action: 'read', scope: PermissionScope.GLOBAL },
      { name: 'permission.update', description: 'Update permission information', resource: ResourceType.PERMISSION, action: 'update', scope: PermissionScope.GLOBAL },
      { name: 'permission.delete', description: 'Delete permissions', resource: ResourceType.PERMISSION, action: 'delete', scope: PermissionScope.GLOBAL },
      { name: 'permission.manage', description: 'Full permission management', resource: ResourceType.PERMISSION, action: 'manage', scope: PermissionScope.GLOBAL },

      // System permissions
      { name: 'system.manage', description: 'Full system administration', resource: ResourceType.SYSTEM, action: 'manage', scope: PermissionScope.GLOBAL },
      { name: 'system.debug', description: 'Debug and troubleshooting access', resource: ResourceType.SYSTEM, action: 'debug', scope: PermissionScope.GLOBAL },
      { name: 'system.monitor', description: 'System monitoring access', resource: ResourceType.SYSTEM, action: 'monitor', scope: PermissionScope.GLOBAL }
    ];

    console.log('📋 Creating default permissions...');
    const createdPermissions = [];
    for (const permissionData of defaultPermissions) {
      try {
        const permission = await rbacService.createPermission({
          ...permissionData,
          isSystem: true
        });
        createdPermissions.push(permission);
        console.log(`✅ Created permission: ${permission.name}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Permission already exists: ${permissionData.name}`);
        } else {
          console.error(`❌ Error creating permission ${permissionData.name}:`, error.message);
        }
      }
    }

    // Create default roles
    const defaultRoles = [
      {
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        scope: PermissionScope.GLOBAL,
        isSystem: true
      },
      {
        name: 'Admin',
        description: 'Administrative access for most operations',
        scope: PermissionScope.GLOBAL,
        isSystem: true
      },
      {
        name: 'User Manager',
        description: 'Can manage users and their permissions',
        scope: PermissionScope.GLOBAL,
        isSystem: true
      },
      {
        name: 'Billing Manager',
        description: 'Can manage bills and payments',
        scope: PermissionScope.GLOBAL,
        isSystem: true
      },
      {
        name: 'Report Viewer',
        description: 'Can view reports and analytics',
        scope: PermissionScope.GLOBAL,
        isSystem: true
      },
      {
        name: 'Standard User',
        description: 'Basic user permissions for personal resources',
        scope: PermissionScope.PERSONAL,
        isSystem: true
      }
    ];

    console.log('👥 Creating default roles...');
    const createdRoles = [];
    for (const roleData of defaultRoles) {
      try {
        const role = await rbacService.createRole(roleData);
        createdRoles.push(role);
        console.log(`✅ Created role: ${role.name}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Role already exists: ${roleData.name}`);
        } else {
          console.error(`❌ Error creating role ${roleData.name}:`, error.message);
        }
      }
    }

    // Assign permissions to roles
    console.log('🔗 Assigning permissions to roles...');
    
    // Get all permissions for easier lookup
    const allPermissions = await rbacService.getPermissions();
    const permissionMap = new Map(allPermissions.map(p => [p.name, p]));

    // Super Admin gets all permissions
    const superAdminRole = createdRoles.find(r => r.name === 'Super Admin');
    if (superAdminRole) {
      for (const permission of allPermissions) {
        try {
          await rbacService.assignPermissionToRole(superAdminRole.id, permission.id);
        } catch (error: any) {
          if (!error.message.includes('already assigned')) {
            console.error(`❌ Error assigning permission ${permission.name} to Super Admin:`, error.message);
          }
        }
      }
      console.log('🔑 Super Admin role assigned all permissions');
    }

    // Admin gets most permissions except system management
    const adminRole = createdRoles.find(r => r.name === 'Admin');
    if (adminRole) {
      const adminPermissions = [
        'user.create', 'user.read', 'user.update', 'user.manage',
        'bill.create', 'bill.read', 'bill.update', 'bill.manage',
        'payment.create', 'payment.read', 'payment.update', 'payment.manage',
        'utility.create', 'utility.read', 'utility.update', 'utility.manage',
        'report.create', 'report.read', 'report.update', 'report.manage',
        'webhook.create', 'webhook.read', 'webhook.update', 'webhook.manage',
        'document.create', 'document.read', 'document.update', 'document.manage',
        'audit.read',
        'role.read', 'permission.read',
        'system.monitor'
      ];

      for (const permName of adminPermissions) {
        const permission = permissionMap.get(permName);
        if (permission) {
          try {
            await rbacService.assignPermissionToRole(adminRole.id, permission.id);
          } catch (error: any) {
            if (!error.message.includes('already assigned')) {
              console.error(`❌ Error assigning permission ${permName} to Admin:`, error.message);
            }
          }
        }
      }
      console.log('🔑 Admin role assigned administrative permissions');
    }

    // User Manager gets user management permissions
    const userManagerRole = createdRoles.find(r => r.name === 'User Manager');
    if (userManagerRole) {
      const userManagerPermissions = [
        'user.create', 'user.read', 'user.update', 'user.manage',
        'role.read', 'permission.read',
        'audit.read'
      ];

      for (const permName of userManagerPermissions) {
        const permission = permissionMap.get(permName);
        if (permission) {
          try {
            await rbacService.assignPermissionToRole(userManagerRole.id, permission.id);
          } catch (error: any) {
            if (!error.message.includes('already assigned')) {
              console.error(`❌ Error assigning permission ${permName} to User Manager:`, error.message);
            }
          }
        }
      }
      console.log('🔑 User Manager role assigned user management permissions');
    }

    // Billing Manager gets billing permissions
    const billingManagerRole = createdRoles.find(r => r.name === 'Billing Manager');
    if (billingManagerRole) {
      const billingManagerPermissions = [
        'bill.create', 'bill.read', 'bill.update', 'bill.manage',
        'payment.create', 'payment.read', 'payment.update', 'payment.manage',
        'utility.read', 'utility.update',
        'report.create', 'report.read',
        'audit.read'
      ];

      for (const permName of billingManagerPermissions) {
        const permission = permissionMap.get(permName);
        if (permission) {
          try {
            await rbacService.assignPermissionToRole(billingManagerRole.id, permission.id);
          } catch (error: any) {
            if (!error.message.includes('already assigned')) {
              console.error(`❌ Error assigning permission ${permName} to Billing Manager:`, error.message);
            }
          }
        }
      }
      console.log('🔑 Billing Manager role assigned billing permissions');
    }

    // Report Viewer gets read permissions
    const reportViewerRole = createdRoles.find(r => r.name === 'Report Viewer');
    if (reportViewerRole) {
      const reportViewerPermissions = [
        'user.read', 'bill.read', 'payment.read', 'utility.read',
        'report.read', 'webhook.read', 'document.read'
      ];

      for (const permName of reportViewerPermissions) {
        const permission = permissionMap.get(permName);
        if (permission) {
          try {
            await rbacService.assignPermissionToRole(reportViewerRole.id, permission.id);
          } catch (error: any) {
            if (!error.message.includes('already assigned')) {
              console.error(`❌ Error assigning permission ${permName} to Report Viewer:`, error.message);
            }
          }
        }
      }
      console.log('🔑 Report Viewer role assigned read permissions');
    }

    // Standard User gets personal permissions
    const standardUserRole = createdRoles.find(r => r.name === 'Standard User');
    if (standardUserRole) {
      const standardUserPermissions = [
        'user.read.self', 'user.update.self',
        'bill.read.self', 'bill.create.self',
        'payment.read.self', 'payment.create.self',
        'report.read.self', 'report.create.self',
        'webhook.read.self', 'webhook.create.self',
        'document.read.self', 'document.create.self'
      ];

      for (const permName of standardUserPermissions) {
        const permission = permissionMap.get(permName);
        if (permission) {
          try {
            await rbacService.assignPermissionToRole(standardUserRole.id, permission.id);
          } catch (error: any) {
            if (!error.message.includes('already assigned')) {
              console.error(`❌ Error assigning permission ${permName} to Standard User:`, error.message);
            }
          }
        }
      }
      console.log('🔑 Standard User role assigned personal permissions');
    }

    console.log('🎉 RBAC seed data completed successfully!');
    
    return {
      permissions: createdPermissions.length,
      roles: createdRoles.length
    };

  } catch (error) {
    console.error('❌ Error seeding RBAC data:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedRbacData()
    .then((result) => {
      console.log(`✅ Seeded ${result.permissions} permissions and ${result.roles} roles`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}
