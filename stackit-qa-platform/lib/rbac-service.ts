import { Permission, UserWithRole, ResourceAction, UserRole } from '@/types/rbac'
import { getRolePermissions } from '@/lib/rbac-config'

export class RBACService {
  private user: UserWithRole | null

  constructor(user: UserWithRole | null) {
    this.user = user
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: Permission): boolean {
    if (!this.user || !this.user.isActive || this.user.isBanned) {
      return this.getGuestPermissions().includes(permission)
    }

    const rolePermissions = getRolePermissions(this.user.role)
    const customPermissions = this.user.customPermissions || []
    const restrictedPermissions = this.user.restrictedPermissions || []

    // Combine role permissions and custom permissions
    const allPermissions = [...rolePermissions, ...customPermissions]
    
    // Remove restricted permissions
    const effectivePermissions = allPermissions.filter(
      p => !restrictedPermissions.includes(p)
    )

    return effectivePermissions.includes(permission)
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission))
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission))
  }

  /**
   * Check if user can perform an action on a resource
   */
  canPerformAction(action: ResourceAction): boolean {
    const { resource, action: actionType, ownerId } = action
    const permission = `${resource}:${actionType}` as Permission

    // Check basic permission
    if (!this.hasPermission(permission)) {
      return false
    }

    // For ownership-based permissions, check if user owns the resource
    if (this.requiresOwnership(permission) && ownerId) {
      return this.isOwner(ownerId) || this.canModerate()
    }

    return true
  }

  /**
   * Check if user owns a resource
   */
  isOwner(resourceOwnerId: string): boolean {
    return this.user?.id === resourceOwnerId
  }

  /**
   * Check if user can moderate content
   */
  canModerate(resourceOwnerId?: string): boolean {
    // Admins can moderate everything
    if (this.hasPermission('system:moderate')) {
      return true
    }

    // Check specific moderation permissions
    const moderationPermissions: Permission[] = [
      'question:moderate',
      'answer:moderate',
      'comment:moderate'
    ]

    return this.hasAnyPermission(moderationPermissions)
  }

  /**
   * Check if user can vote
   */
  canVote(resourceOwnerId?: string): boolean {
    // Users cannot vote on their own content
    if (resourceOwnerId && this.isOwner(resourceOwnerId)) {
      return false
    }

    return this.hasAnyPermission(['question:vote', 'answer:vote'])
  }

  /**
   * Get user's role display name
   */
  getRoleDisplayName(): string {
    if (!this.user) return 'Guest'
    
    const roleNames = {
      guest: 'Guest',
      user: 'User',
      admin: 'Administrator'
    }

    return roleNames[this.user.role] || 'Unknown'
  }

  /**
   * Get all effective permissions for the user
   */
  getAllPermissions(): Permission[] {
    if (!this.user || !this.user.isActive || this.user.isBanned) {
      return this.getGuestPermissions()
    }

    const rolePermissions = getRolePermissions(this.user.role)
    const customPermissions = this.user.customPermissions || []
    const restrictedPermissions = this.user.restrictedPermissions || []

    const allPermissions = [...rolePermissions, ...customPermissions]
    return allPermissions.filter(p => !restrictedPermissions.includes(p))
  }

  /**
   * Check if user has a specific role or higher
   */
  hasRole(role: UserRole): boolean {
    if (!this.user) return role === 'guest'

    const roleHierarchy = {
      guest: 0,
      user: 1,
      admin: 2
    }

    const userRoleLevel = roleHierarchy[this.user.role]
    const requiredRoleLevel = roleHierarchy[role]

    return userRoleLevel >= requiredRoleLevel
  }

  /**
   * Check if action requires ownership
   */
  private requiresOwnership(permission: Permission): boolean {
    const ownershipRequired = [
      'question:update',
      'question:delete',
      'answer:update',
      'answer:delete',
      'answer:accept',
      'comment:update',
      'comment:delete',
      'user:update'
    ]

    return ownershipRequired.includes(permission)
  }

  /**
   * Get permissions for guest users
   */
  private getGuestPermissions(): Permission[] {
    return getRolePermissions('guest')
  }

  /**
   * Create RBAC service instance for user
   */
  static forUser(user: UserWithRole | null): RBACService {
    return new RBACService(user)
  }

  /**
   * Create RBAC service instance for guest
   */
  static forGuest(): RBACService {
    return new RBACService(null)
  }
}
