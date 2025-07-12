import React from 'react'
import { useRBAC } from '@/contexts/rbac-context'
import { Permission } from '@/types/rbac'

interface ProtectedComponentProps {
  children: React.ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  fallback?: React.ReactNode
  requireAuth?: boolean
  ownerId?: string // For ownership-based access
}

/**
 * Component that conditionally renders content based on user permissions
 */
export function ProtectedComponent({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  requireAuth = false,
  ownerId
}: ProtectedComponentProps) {
  const rbac = useRBAC()

  // Check authentication if required
  if (requireAuth && !rbac.isAuthenticated()) {
    return <>{fallback}</>
  }

  // Check single permission
  if (permission) {
    if (ownerId && rbac.isOwner(ownerId)) {
      return <>{children}</>
    }
    
    if (!rbac.hasPermission(permission)) {
      return <>{fallback}</>
    }
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll 
      ? rbac.hasAllPermissions(permissions)
      : rbac.hasAnyPermission(permissions)
    
    if (!hasAccess) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

/**
 * Higher-order component for protecting components
 */
export function withRBAC<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedComponentProps, 'children'>
) {
  return function ProtectedWrappedComponent(props: P) {
    return (
      <ProtectedComponent {...options}>
        <Component {...props} />
      </ProtectedComponent>
    )
  }
}

/**
 * Component for admin-only content
 */
export function AdminOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <ProtectedComponent
      permission="system:moderate"
      fallback={fallback}
    >
      {children}
    </ProtectedComponent>
  )
}

/**
 * Component for authenticated users only
 */
export function AuthenticatedOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <ProtectedComponent
      requireAuth={true}
      fallback={fallback}
    >
      {children}
    </ProtectedComponent>
  )
}

/**
 * Component for moderators only
 */
export function ModeratorsOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <ProtectedComponent
      permissions={['question:moderate', 'answer:moderate', 'comment:moderate']}
      requireAll={false}
      fallback={fallback}
    >
      {children}
    </ProtectedComponent>
  )
}

/**
 * Component that shows content only to the owner or moderators
 */
export function OwnerOrModeratorOnly({ 
  children, 
  ownerId,
  fallback = null 
}: { 
  children: React.ReactNode
  ownerId: string
  fallback?: React.ReactNode 
}) {
  const rbac = useRBAC()
  
  if (rbac.isOwner(ownerId) || rbac.canModerate()) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}
