export interface Notification {
  id: string
  type: 'answer' | 'comment' | 'mention'
  title: string
  message: string
  read: boolean
  createdAt: Date
  questionId?: number
  answerId?: number
  fromUser: string
  toUser: string
  actionUrl: string
}

export interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  removeNotification: (notificationId: string) => void
}
