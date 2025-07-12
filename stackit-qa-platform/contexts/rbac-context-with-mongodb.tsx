'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { UserWithRole, RBACContext, Permission } from '@/types/rbac'
import { RBACService } from '@/lib/rbac-service'
import { UserService } from '@/lib/services/user-service'

const RBACContextProvider = createContext<(RBACContext & {
  setUser: (user: UserWithRole | null) => void
  canVote: (resourceOwnerId?: string) => boolean
  canEdit: (resourceOwnerId: string) => boolean
  canDelete: (resourceOwnerId: string) => boolean
  isAuthenticated: () => boolean
  isAdmin: () => boolean
  isGuest: () => boolean
  updateUserRole: (userId: string, newRole: UserWithRole['role']) => Promise<boolean>
  banUser: (userId: string, reason?: string) => Promise<boolean>
  getAllPermissions: () => Permission[]
  refreshUser: () => Promise<void>
  loginUser: (email: string, password: string) => Promise<UserWithRole | null>
  logoutUser: () => void
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
  const [isLoading, setIsLoading] = useState(false)

  // Update RBAC service when user changes
  useEffect(() => {
    setRbacService(RBACService.forUser(user))
  }, [user])

  // Load user from localStorage on mount (when auth tokens are available)
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        // Check for auth token in localStorage
        const token = localStorage.getItem('authToken')
        const storedUserId = localStorage.getItem('userId')
        
        if (token && storedUserId) {
          setIsLoading(true)
          
          // Fetch user from MongoDB via UserService
          const userData = await UserService.getUserById(storedUserId)
          
          if (userData) {
            setUser(userData)
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('authToken')
            localStorage.removeItem('userId')
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error)
        // Clear invalid data
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserFromStorage()
  }, [])

  // Mock users for development - will be replaced by MongoDB
  useEffect(() => {
    // Only use mock data if no real user and no loading
    if (!user && !isLoading) {
      // You can uncomment one of these for testing:
      
      // Mock regular user
      // const mockUser: UserWithRole = {
      //   id: '1',
      //   username: 'john_dev',
      //   email: 'john@example.com',
      //   role: 'user',
      //   isActive: true,
      //   isBanned: false,
      //   createdAt: '2024-01-01',
      //   lastLoginAt: '2024-01-15'
      // }
      
      // Mock admin user
      // const mockAdmin: UserWithRole = {
      //   id: '2',
      //   username: 'admin_user',
      //   email: 'admin@example.com',
      //   role: 'admin',
      //   isActive: true,
      //   isBanned: false,
      //   createdAt: '2024-01-01',
      //   lastLoginAt: '2024-01-15'
      // }
      
      // setUser(mockUser) // Uncomment to test as regular user
      // setUser(mockAdmin) // Uncomment to test as admin
    }
  }, [user, isLoading])

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

  // MongoDB integration methods
  const refreshUser = async (): Promise<void> => {
    if (!user?.id) return
    
    try {
      setIsLoading(true)
      const updatedUser = await UserService.getUserById(user.id)
      if (updatedUser) {
        setUser(updatedUser)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loginUser = async (email: string, password: string): Promise<UserWithRole | null> => {
    try {
      setIsLoading(true)
      
      // In production, this would call your auth API
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // })
      
      // For now, mock the login
      console.log(`Login attempt: ${email}`)
      
      // Mock successful login - replace with real auth
      const userData = await UserService.getUserByEmail(email)
      
      if (userData) {
        setUser(userData)
        // Store auth data
        localStorage.setItem('userId', userData.id)
        localStorage.setItem('authToken', 'mock-jwt-token')
        
        // Update last login
        await UserService.updateLastLogin(userData.id)
        
        return userData
      }
      
      return null
    } catch (error) {
      console.error('Login error:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const logoutUser = (): void => {
    setUser(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
  }

  // User management functions (for admin)
  const updateUserRole = async (userId: string, newRole: UserWithRole['role']): Promise<boolean> => {
    if (!isAdmin()) {
      throw new Error('Insufficient permissions to update user role')
    }
    
    try {
      const success = await UserService.updateUserRole(userId, newRole, user!.id)
      if (success) {
        // Refresh current user if they updated their own role
        if (userId === user!.id) {
          await refreshUser()
        }
      }
      return success
    } catch (error) {
      console.error('Error updating user role:', error)
      return false
    }
  }

  const banUser = async (userId: string, reason?: string): Promise<boolean> => {
    if (!canModerate()) {
      throw new Error('Insufficient permissions to ban user')
    }
    
    try {
      return await UserService.banUser(userId, true, reason || 'No reason provided', user!.id)
    } catch (error) {
      console.error('Error banning user:', error)
      return false
    }
  }

  const contextValue: RBACContext & {
    setUser: (user: UserWithRole | null) => void
    canVote: (resourceOwnerId?: string) => boolean
    canEdit: (resourceOwnerId: string) => boolean
    canDelete: (resourceOwnerId: string) => boolean
    isAuthenticated: () => boolean
    isAdmin: () => boolean
    isGuest: () => boolean
    updateUserRole: (userId: string, newRole: UserWithRole['role']) => Promise<boolean>
    banUser: (userId: string, reason?: string) => Promise<boolean>
    getAllPermissions: () => Permission[]
    refreshUser: () => Promise<void>
    loginUser: (email: string, password: string) => Promise<UserWithRole | null>
    logoutUser: () => void
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
    getAllPermissions: () => rbacService.getAllPermissions(),
    refreshUser,
    loginUser,
    logoutUser
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
