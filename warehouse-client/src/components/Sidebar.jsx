import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'



const TYPE_ICONS = {
  TaskAssigned: { icon: '⬡', color: 'var(--accent)' },
  NewMessage: { icon: '✉', color: '#3B82F6' },
  NewComment: { icon: '✎', color: '#22C55E' },
}

function NotificationPanel({ onClose }) {
  const { notifications, unreadCount, markAllRead, clearAll, markNotificationRead } = useNotifications()
  const navigate = useNavigate()

  const handleClick = (n) => {
    if (n.type === 'TaskAssigned' && n.metadata?.sectorId) {
      markNotificationRead(n.id)
      navigate(`/sectors/${n.metadata.sectorId}`, { state: { openTaskId: n.metadata.taskId } })
      onClose()
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
      <div style={{
        position: 'fixed',
        top: 0,
        left: '220px',
        bottom: 0,
        width: '320px',
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        zIndex: 41,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Notifications {unreadCount > 0 && <span style={{ color: 'var(--accent)' }}>({unreadCount})</span>}
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                background: 'none', border: 'none',
                fontSize: '12px', color: 'var(--accent)',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>Mark all read</button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll} style={{
                background: 'none', border: 'none',
                fontSize: '12px', color: 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>Clear</button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '200px', gap: '8px',
              color: 'var(--text-secondary)',
            }}>
              <span style={{ fontSize: '28px', opacity: 0.3 }}>🔔</span>
              <p style={{ fontSize: '13px' }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => {
              const meta = TYPE_ICONS[n.type] || { icon: '●', color: 'var(--text-secondary)' }
              const isClickable = n.type === 'TaskAssigned' && n.metadata?.sectorId
              return (
                <div key={n.id} onClick={() => handleClick(n)} style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: n.read ? 'transparent' : 'rgba(245,158,11,0.04)',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  cursor: isClickable ? 'pointer' : 'default',
                }}>
                  <span style={{
                    fontSize: '16px',
                    color: meta.color,
                    marginTop: '1px',
                    flexShrink: 0,
                  }}>{meta.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '13px',
                      color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)',
                      lineHeight: 1.5,
                      fontFamily: 'Inter, sans-serif',
                      marginBottom: '4px',
                    }}>{n.message}</p>
                    <p style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      {n.receivedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.read && (
                    <div style={{
                      width: '7px', height: '7px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent)',
                      flexShrink: 0,
                      marginTop: '5px',
                    }} />
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

export default function Sidebar() {
  const { logout, role } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)

  const navItems = [
    { label: 'Sectors', path: '/dashboard', icon: '⬡' },
    { label: 'Messages', path: '/messages', icon: '✉' },
    ...(role === 'Admin' ? [{ label: 'Team', path: '/users', icon: '◎' }] : []),
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <aside style={{
        width: '220px',
        minHeight: '100vh',
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 30,
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '32px', height: '32px',
            backgroundColor: 'var(--accent)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Barlow, sans-serif', fontWeight: 700,
            fontSize: '16px', color: '#0F1117', flexShrink: 0,
          }}>W</div>
          <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>
            WarehouseApp
          </span>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
                textDecoration: 'none', fontSize: '14px', fontWeight: 500,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(245,158,11,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Bell */}
          <button
            onClick={() => setShowNotifications(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
              width: '100%', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: 500,
              color: showNotifications ? 'var(--accent)' : 'var(--text-secondary)',
              backgroundColor: showNotifications ? 'rgba(245,158,11,0.08)' : 'transparent',
              borderLeft: showNotifications ? '2px solid var(--accent)' : '2px solid transparent',
              fontFamily: 'Inter, sans-serif',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: '16px', position: 'relative' }}>
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-8px',
                  backgroundColor: 'var(--accent)',
                  color: '#0F1117',
                  borderRadius: '10px',
                  fontSize: '10px', fontWeight: 700,
                  padding: '1px 5px',
                  fontFamily: 'Barlow, sans-serif',
                  lineHeight: '1.4',
                }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </span>
            Notifications
          </button>
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '10px 12px',
            backgroundColor: 'transparent',
            border: '1px solid var(--border)', borderRadius: '8px',
            color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500,
            cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: '10px',
            fontFamily: 'Inter, sans-serif',
          }}>
            <span>⎋</span> Sign out
          </button>
        </div>
      </aside>

      {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
    </>
  )
}