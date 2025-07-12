import { UserRole, Permission, RoleDefinition } from '@/types/rbac'

// Define role permissions using a configuration approach
export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  guest: {
    name: 'guest',
    displayName: 'Guest',
    description: 'Anonymous user with read-only access',
    permissions: [
      'question:read',
      'answer:read',
      'comment:read',
    ]
  },
  
  user: {
    name: 'user',
    displayName: 'User',
    description: 'Registered user with full participation rights',
    permissions: [
      // Question permissions
      'question:create',
      'question:read',
      'question:update', // Own questions only
      'question:delete', // Own questions only
      'question:vote',
      
      // Answer permissions
      'answer:create',
      'answer:read',
      'answer:update', // Own answers only
      'answer:delete', // Own answers only
      'answer:vote',
      'answer:accept', // Own questions only
      
      // Comment permissions
      'comment:create',
      'comment:read',
      'comment:update', // Own comments only
      'comment:delete', // Own comments only
      
      // User permissions
      'user:read',
      'user:update', // Own profile only
    ]
  },
  
  admin: {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access with moderation capabilities',
    permissions: [
      // All user permissions
      'question:create',
      'question:read',
      'question:update',
      'question:delete',
      'question:vote',
      'question:moderate',
      
      'answer:create',
      'answer:read',
      'answer:update',
      'answer:delete',
      'answer:vote',
      'answer:accept',
      'answer:moderate',
      
      'comment:create',
      'comment:read',
      'comment:update',
      'comment:delete',
      'comment:moderate',
      
      // User management
      'user:create',
      'user:read',
      'user:update',
      'user:delete',
      'user:ban',
      'user:promote',
      
      // System permissions
      'system:moderate',
      'system:analytics',
      'system:settings',
      'system:logs',
    ]
  }
}

// Helper function to get all permissions for a role including inherited ones
export function getRolePermissions(role: UserRole): Permission[] {
  const roleDefinition = ROLE_DEFINITIONS[role]
  if (!roleDefinition) return []
  
  let permissions = [...roleDefinition.permissions]
  
  // Add inherited permissions
  if (roleDefinition.inherits) {
    for (const inheritedRole of roleDefinition.inherits) {
      permissions = [...permissions, ...getRolePermissions(inheritedRole)]
    }
  }
  
  // Remove duplicates
  return [...new Set(permissions)]
}

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  CONTENT_CREATION: [
    'question:create',
    'answer:create',
    'comment:create'
  ] as Permission[],
  
  CONTENT_MODERATION: [
    'question:moderate',
    'answer:moderate',
    'comment:moderate'
  ] as Permission[],
  
  USER_MANAGEMENT: [
    'user:create',
    'user:update',
    'user:delete',
    'user:ban',
    'user:promote'
  ] as Permission[],
  
  SYSTEM_ADMIN: [
    'system:moderate',
    'system:analytics',
    'system:settings',
    'system:logs'
  ] as Permission[],
  
  VOTING: [
    'question:vote',
    'answer:vote'
  ] as Permission[]
}

// Default role for new users
export const DEFAULT_ROLE: UserRole = 'user'

// Roles that can be assigned by admins
export const ASSIGNABLE_ROLES: UserRole[] = ['user', 'admin']

// Minimum role required for certain actions
export const ROLE_REQUIREMENTS = {
  CREATE_CONTENT: 'user' as UserRole,
  MODERATE_CONTENT: 'admin' as UserRole,
  MANAGE_USERS: 'admin' as UserRole,
  ACCESS_ANALYTICS: 'admin' as UserRole,
} as const
