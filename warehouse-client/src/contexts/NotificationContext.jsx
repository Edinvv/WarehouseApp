import { createContext, useContext, useEffect, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

function parseMeta(raw) {
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function NotificationProvider({ children }) {
  const { token, isLoggedIn } = useAuth()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!isLoggedIn || !token) return

    const conn = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5200/hubs/notifications', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build()

    conn.on('ReceiveNotification', (message, type, metadataRaw) => {
      setNotifications(prev => [{
        id: Date.now(),
        message,
        type,
        metadata: parseMeta(metadataRaw),
        receivedAt: new Date(),
        read: false,
      }, ...prev])
    })

    conn.start().catch(err => console.error('SignalR connection error:', err))

    return () => { conn.stop() }
  }, [isLoggedIn, token])

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const clearAll = () => setNotifications([])
  const markNotificationRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const markReadBySender = (senderId) => {
    setNotifications(prev => prev.map(n =>
      n.type === 'NewMessage' && n.metadata?.senderId === senderId ? { ...n, read: true } : n
    ))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, clearAll, markNotificationRead, markReadBySender }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}