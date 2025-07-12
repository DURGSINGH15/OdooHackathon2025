'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { UserWithRole, RBACContext, Permission } from '@/types/rbac'
import { RBACService } from '@/lib/rbac-service'

const RBACContextProvider = createContext<(RBACContext & {
  setUser: (user: UserWithRole | null) => void
  canVote: (resourceOwnerId?: string) => boolean
  canEdit: (resourceOwnerId: string) => boolean
  canDelete: (resourceOwnerId: string) => boolean
  isAuthenticated: () => boolean
  isAdmin: () => boolean
  isGuest: () => boolean
  updateUserRole: (userId: string, newRole: UserWithRole['role']) => void
  banUser: (userId: string, reason?: string) => void
  getAllPermissions: () => Permission[]
}) | undefined>(undefined)

interface RBACProviderProps {
  children: React.ReactNode
  initialUser?: UserWithRole | null
}

export function RBACProvider({ children, initialUser = null }: RBACProviderProps) {
  const [user, setUser] = useState<UserWithRole | null>(initialUser)
  const [rbacService, setRbacService] = useState<RBACService>(() => 
    RBACService.forUser(initialUser)
  )

  // Update RBAC service when user changes
  useEffect(() => {
    setRbacService(RBACService.forUser(user))
  }, [user])

  // Mock users for development - replace with actual auth integration
  useEffect(() => {
    // You can set a default user here for testing
    const mockUser: UserWithRole = {
      id: '1',
      username: 'john_dev',
      email: 'john@example.com',
      role: 'user', // Change this to 'admin' to test admin features
      isActive: true,
      isBanned: false,
      createdAt: '2024-01-01',
      lastLoginAt: '2024-01-15'
    }
    
    // Uncomment to use mock user
    // setUser(mockUser)
  }, [])

  const hasPermission = (permission: Permission): boolean => {
    return rbacService.hasPermission(permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return rbacService.hasAnyPermission(permissions)
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return rbacService.hasAllPermissions(permissions)
  }

  const canModerate = (resourceOwnerId?: string): boolean => {
    return rbacService.canModerate(resourceOwnerId)
  }

  const isOwner = (resourceOwnerId: string): boolean => {
    return rbacService.isOwner(resourceOwnerId)
  }

  const getRoleDisplayName = (): string => {
    return rbacService.getRoleDisplayName()
  }

  // Additional helper methods
  const canVote = (resourceOwnerId?: string): boolean => {
    return rbacService.canVote(resourceOwnerId)
  }

  const canEdit = (resourceOwnerId: string): boolean => {
    return isOwner(resourceOwnerId) || canModerate()
  }

  const canDelete = (resourceOwnerId: string): boolean => {
    return isOwner(resourceOwnerId) || canModerate()
  }

  const isAuthenticated = (): boolean => {
    return user !== null && user.isActive && !user.isBanned
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin' && isAuthenticated()
  }

  const isGuest = (): boolean => {
    return user === null
  }

  // User management functions (for admin)
  const updateUserRole = (userId: string, newRole: UserWithRole['role']): void => {
    if (!isAdmin()) {
      throw new Error('Insufficient permissions to update user role')
    }
    
    // In a real app, this would call an API
    console.log(`Updating user ${userId} role to ${newRole}`)
  }

  const banUser = (userId: string, reason?: string): void => {
    if (!canModerate()) {
      throw new Error('Insufficient permissions to ban user')
    }
    
    // In a real app, this would call an API
    console.log(`Banning user ${userId}${reason ? ` for: ${reason}` : ''}`)
  }

  const contextValue: RBACContext & {
    // Additional methods not in the base interface
    setUser: (user: UserWithRole | null) => void
    canVote: (resourceOwnerId?: string) => boolean
    canEdit: (resourceOwnerId: string) => boolean
    canDelete: (resourceOwnerId: string) => boolean
    isAuthenticated: () => boolean
    isAdmin: () => boolean
    isGuest: () => boolean
    updateUserRole: (userId: string, newRole: UserWithRole['role']) => void
    banUser: (userId: string, reason?: string) => void
    getAllPermissions: () => Permission[]
  } = {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canModerate,
    isOwner,
    getRoleDisplayName,
    setUser,
    canVote,
    canEdit,
    canDelete,
    isAuthenticated,
    isAdmin,
    isGuest,
    updateUserRole,
    banUser,
    getAllPermissions: () => rbacService.getAllPermissions()
  }

  return (
    <RBACContextProvider.Provider value={contextValue}>
      {children}
    </RBACContextProvider.Provider>
  )
}

export function useRBAC() {
  const context = useContext(RBACContextProvider)
  if (context === undefined) {
    throw new Error('useRBAC must be used within a RBACProvider')
  }
  return context
}
