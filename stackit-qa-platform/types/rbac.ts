// RBAC Type definitions
export type UserRole = 'guest' | 'user' | 'admin'

export type Permission = 
  // Question permissions
  | 'question:create'
  | 'question:read'
  | 'question:update'
  | 'question:delete'
  | 'question:vote'
  | 'question:moderate'
  
  // Answer permissions
  | 'answer:create'
  | 'answer:read'
  | 'answer:update'
  | 'answer:delete'
  | 'answer:vote'
  | 'answer:accept'
  | 'answer:moderate'
  
  // Comment permissions
  | 'comment:create'
  | 'comment:read'
  | 'comment:update'
  | 'comment:delete'
  | 'comment:moderate'
  
  // User management permissions
  | 'user:create'
  | 'user:read'
  | 'user:update'
  | 'user:delete'
  | 'user:ban'
  | 'user:promote'
  
  // System permissions
  | 'system:moderate'
  | 'system:analytics'
  | 'system:settings'
  | 'system:logs'

export interface RoleDefinition {
  name: UserRole
  displayName: string
  description: string
  permissions: Permission[]
  inherits?: UserRole[] // Roles that this role inherits permissions from
}

export interface UserWithRole {
  id: string
  username: string
  email: string
  role: UserRole
  customPermissions?: Permission[] // Additional permissions beyond role
  restrictedPermissions?: Permission[] // Permissions removed from role
  isActive: boolean
  isBanned: boolean
  createdAt: string
  lastLoginAt?: string
}

export interface RBACContext {
  user: UserWithRole | null
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  canModerate: (resourceOwnerId?: string) => boolean
  isOwner: (resourceOwnerId: string) => boolean
  getRoleDisplayName: () => string
}

// Action types for different resources
export interface ResourceAction {
  resource: 'question' | 'answer' | 'comment' | 'user'
  action: 'create' | 'read' | 'update' | 'delete' | 'vote' | 'moderate'
  ownerId?: string // ID of the resource owner
}

// Moderation actions
export type ModerationAction = 
  | 'flag'
  | 'unflag'
  | 'hide'
  | 'unhide'
  | 'lock'
  | 'unlock'
  | 'delete'
  | 'ban_user'
  | 'unban_user'
  | 'feature'
  | 'unfeature'

export interface ModerationLog {
  id: string
  moderatorId: string
  targetType: 'question' | 'answer' | 'comment' | 'user'
  targetId: string
  action: ModerationAction
  reason?: string
  timestamp: string
}
