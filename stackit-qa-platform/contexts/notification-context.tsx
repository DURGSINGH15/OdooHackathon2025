"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Notification, NotificationContextType } from '@/types/notification'

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Mock notifications for demonstration
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'answer',
    title: 'New Answer',
    message: 'sarah_auth answered your question about NextAuth.js implementation',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    questionId: 1,
    fromUser: 'sarah_auth',
    toUser: 'john_dev',
    actionUrl: '/question/1'
  },
  {
    id: '2',
    type: 'mention',
    title: 'You were mentioned',
    message: '@john_dev thanks for the great question! Here\'s an additional resource.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    questionId: 1,
    answerId: 2,
    fromUser: 'mike_nextjs',
    toUser: 'john_dev',
    actionUrl: '/question/1#answer-2'
  },
  {
    id: '3',
    type: 'comment',
    title: 'New Comment',
    message: 'Someone commented on your answer about React state management',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    questionId: 2,
    answerId: 1,
    fromUser: 'alex_dev',
    toUser: 'john_dev',
    actionUrl: '/question/2#answer-1'
  }
]

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }, [])

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    )
  }, [])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
