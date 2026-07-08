import { useEffect, useRef, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'

const toUtcDate = (str) => new Date(str.endsWith('Z') ? str : str + 'Z')

function Avatar({ name, size = 36 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: 'rgba(245,158,11,0.15)',
      border: '1px solid rgba(245,158,11,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.38,
      fontWeight: 700,
      color: 'var(--accent)',
      flexShrink: 0,
      fontFamily: 'Barlow, sans-serif',
    }}>
      {name?.charAt(0).toUpperCase()}
    </div>
  )
}

export default function MessagesPage() {
  const { userId } = useAuth()
  const { markReadBySender } = useNotifications()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data.filter(u => u.id !== userId)))
  }, [userId])

  useEffect(() => {
    if (!selectedUser) return
    markReadBySender(selectedUser.id)
    fetchMessages()
  }, [selectedUser])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = () => {
    api.get(`/messages?otherUserId=${selectedUser.id}`)
      .then(res => setMessages(res.data))
  }

  const handleSend = async () => {
    if (!content.trim() || !selectedUser) return
    setSending(true)
    try {
      await api.post('/messages', { receiverId: selectedUser.id, content: content.trim() })
      setContent('')
      fetchMessages()
    } finally {
      setSending(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Layout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: 'Barlow, sans-serif',
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '4px',
        }}>Messages</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Direct messages between team members
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: '0',
        height: 'calc(100vh - 200px)',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {/* User list */}
        <div style={{
          borderRight: '1px solid var(--border)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            fontFamily: 'Barlow, sans-serif',
          }}>
            Team Members
          </div>
          {users.length === 0 ? (
            <p style={{ padding: '24px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No other users yet
            </p>
          ) : (
            users.map(user => {
              const isSelected = selectedUser?.id === user.id
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: isSelected ? 'rgba(245,158,11,0.08)' : 'transparent',
                    borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <Avatar name={user.firstName} />
                  <div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                      fontFamily: 'Inter, sans-serif',
                      marginBottom: '2px',
                    }}>
                      {user.firstName} {user.lastName}
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      fontFamily: 'Inter, sans-serif',
                    }}>
                      {user.email}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Chat area */}
        {selectedUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Chat header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'var(--surface)',
            }}>
              <Avatar name={selectedUser.firstName} size={32} />
              <div>
                <p style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontFamily: 'Barlow, sans-serif',
                }}>
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {selectedUser.email}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              backgroundColor: 'var(--bg)',
            }}>
              {messages.length === 0 ? (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                }}>
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.senderId === userId
                  return (
                    <div key={msg.id} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMine ? 'flex-end' : 'flex-start',
                    }}>
                      <div style={{
                        maxWidth: '68%',
                        padding: '10px 14px',
                        borderRadius: isMine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        backgroundColor: isMine ? 'rgba(245,158,11,0.15)' : 'var(--surface)',
                        border: `1px solid ${isMine ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        lineHeight: '1.5',
                        fontFamily: 'Inter, sans-serif',
                        wordBreak: 'break-word',
                      }}>
                        {msg.content}
                      </div>
                      <span style={{
                        fontSize: '10px',
                        color: 'var(--text-secondary)',
                        marginTop: '4px',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>
                        {toUtcDate(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '14px 16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '10px',
              backgroundColor: 'var(--surface)',
            }}>
              <input
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a message... (Enter to send)"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !content.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: sending || !content.trim() ? 'rgba(245,158,11,0.3)' : 'var(--accent)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0F1117',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'Barlow, sans-serif',
                  cursor: sending || !content.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <span style={{ fontSize: '32px', opacity: 0.3 }}>✉</span>
            <p>Select a team member to start messaging</p>
          </div>
        )}
      </div>
    </Layout>
  )
}