import { useEffect, useRef, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import { COLUMNS, PRIORITY_COLORS } from '../constants'

export default function TaskDetailDrawer({ task, onClose, onStatusChange, onTaskUpdated }) {
  const { userId, role } = useAuth()
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)
  const [workers, setWorkers] = useState([])
  const [assigning, setAssigning] = useState(false)
  const [selectedWorkerIds, setSelectedWorkerIds] = useState([])
  const [items, setItems] = useState([])
  const [scanMode, setScanMode] = useState(false)
  const [scanValue, setScanValue] = useState('')
  const [scanFeedback, setScanFeedback] = useState(null)
  const bottomRef = useRef(null)
  const scanInputRef = useRef(null)

  const isPrivileged = role === 'Admin' || role === 'Supervisor'
  const canChangeStatus = isPrivileged || (task?.assignments?.some(a => a.userId === userId) && task?.status !== 'Done')
  useEffect(() => {
    if (!task) return
    setSelectedWorkerIds(task.assignments.map(a => a.userId))
    setItems(task.items || [])
    setScanMode(false)
    setScanFeedback(null)
  }, [task])

  useEffect(() => {
    if (scanMode) scanInputRef.current?.focus()
  }, [scanMode])

  const handleScan = async () => {
    const barcode = scanValue.trim()
    setScanValue('')
    if (!barcode) return

    const match = items.find(i => i.barcode === barcode && !i.isCompleted)
    if (!match) {
      const alreadyDone = items.find(i => i.barcode === barcode && i.isCompleted)
      setScanFeedback({ ok: false, message: alreadyDone ? 'Already completed' : 'No match found' })
      setTimeout(() => setScanFeedback(null), 2000)
      return
    }
    await handleCompleteItem(match.id)
    setScanFeedback({ ok: true, message: `✓ ${match.productName} checked off` })
    setTimeout(() => setScanFeedback(null), 2000)
    scanInputRef.current?.focus()
  }

  const handleCompleteItem = async (itemId) => {
    await api.put(`/tasks/items/${itemId}/complete`)
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, isCompleted: true } : i))
    onTaskUpdated?.()
  }
  useEffect(() => {
    if (!task) return
    api.get(`/comments?taskId=${task.id}`).then(res => setComments(res.data))
  }, [task])

  useEffect(() => {
    if (!isPrivileged) return
    api.get('/users').then(res => setWorkers(res.data.filter(u => u.role === 'Worker')))
  }, [isPrivileged])

  const toggleWorker = (workerId) => {
    setSelectedWorkerIds(prev =>
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    )
  }

  const handleConfirmAssign = async () => {
    setAssigning(true)
    try {
      await api.put(`/tasks/${task.id}/assign`, { userIds: selectedWorkerIds })
      onTaskUpdated?.()
    } finally {
      setAssigning(false)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  if (!task) return null

  const priorityColor = PRIORITY_COLORS[task.priority] || 'var(--status-todo)'

  const handleComment = async () => {
    if (!commentText.trim()) return
    setPosting(true)
    try {
      await api.post('/comments', { taskId: task.id, content: commentText.trim() })
      setCommentText('')
      const res = await api.get(`/comments?taskId=${task.id}`)
      setComments(res.data)
    } finally {
      setPosting(false)
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.4)' }} />

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 51,
        width: '420px', maxWidth: '90vw',
        backgroundColor: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div style={{ flex: 1, paddingRight: '16px' }}>
            <p style={{ fontSize: '11px', color: priorityColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
              {task.priority} Priority
            </p>
            <h2 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {task.title}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '22px', cursor: 'pointer', flexShrink: 0 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {task.description && (
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{task.description}</p>
          )}

          {/* Checklist */}
          {items.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Barlow, sans-serif', fontWeight: 600 }}>
                  Items — {items.filter(i => i.isCompleted).length}/{items.length} done
                </p>
                {task.status === 'Todo' && (
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', fontFamily: 'Inter, sans-serif' }}>
                    Start task to unlock
                  </p>
                )}
                {task.status === 'InProgress' && (
                  <button
                    onClick={() => { setScanMode(v => !v); setScanFeedback(null) }}
                    style={{
                      padding: '4px 10px', fontSize: '11px', fontWeight: 600,
                      backgroundColor: scanMode ? 'var(--accent)' : 'transparent',
                      border: `1px solid ${scanMode ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: '5px',
                      color: scanMode ? '#0F1117' : 'var(--text-secondary)',
                      cursor: 'pointer', fontFamily: 'Barlow, sans-serif',
                    }}
                  >
                    ⬛ {scanMode ? 'Stop Scanning' : 'Scan'}
                  </button>
                )}
              </div>
              {scanMode && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      ref={scanInputRef}
                      value={scanValue}
                      onChange={e => setScanValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleScan()}
                      placeholder="Scan or type barcode, press Enter..."
                      style={{
                        flex: 1, padding: '8px 12px',
                        backgroundColor: 'var(--bg)',
                        border: '1px solid var(--accent)',
                        borderRadius: '7px',
                        color: 'var(--text-primary)',
                        fontSize: '13px', fontFamily: 'JetBrains Mono, monospace',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={handleScan}
                      style={{
                        padding: '8px 14px', fontSize: '12px', fontWeight: 600,
                        backgroundColor: 'var(--accent)', border: 'none',
                        borderRadius: '7px', color: '#0F1117',
                        cursor: 'pointer', fontFamily: 'Barlow, sans-serif',
                      }}
                    >OK</button>
                  </div>
                  {scanFeedback && (
                    <p style={{
                      marginTop: '6px', fontSize: '12px',
                      color: scanFeedback.ok ? '#22C55E' : 'var(--danger)',
                      fontFamily: 'Inter, sans-serif', fontWeight: 600,
                    }}>
                      {scanFeedback.message}
                    </p>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {items.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px',
                    backgroundColor: item.isCompleted ? 'rgba(34,197,94,0.06)' : 'var(--bg)',
                    border: `1px solid ${item.isCompleted ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                    borderRadius: '7px',
                    opacity: task.status === 'Todo' ? 0.5 : 1,
                  }}>
                    {!scanMode && (
                      <input
                        type="checkbox"
                        checked={item.isCompleted}
                        disabled={item.isCompleted || task.status === 'Todo'}
                        onChange={() => handleCompleteItem(item.id)}
                        style={{ accentColor: 'var(--status-done)', cursor: (item.isCompleted || task.status === 'Todo') ? 'not-allowed' : 'pointer', width: '15px', height: '15px' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <span style={{
                        fontSize: '13px',
                        color: item.isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)',
                        textDecoration: item.isCompleted ? 'line-through' : 'none',
                        fontFamily: 'Inter, sans-serif',
                      }}>
                        {item.productName}
                      </span>
                      {item.barcode && (
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', marginLeft: '8px' }}>
                          #{item.barcode}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
                      x{item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Status</p>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{task.status.replace('InProgress', 'In Progress')}</p>
            </div>
            {task.dueDate && (
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Due</p>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {task.assignments?.length > 0 && (
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Assigned To</p>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {task.assignments.map(a => a.userName).join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Assign workers — only visible to Admin/Supervisor */}
          {isPrivileged && (
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontFamily: 'Barlow, sans-serif', fontWeight: 600 }}>
                Assign Workers
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                {workers.map(w => (
                  <label key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={selectedWorkerIds.includes(w.id)}
                      onChange={() => toggleWorker(w.id)}
                      style={{ width: '15px', height: '15px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                    {w.firstName} {w.lastName}
                  </label>
                ))}
              </div>
              <button
                onClick={handleConfirmAssign}
                disabled={assigning}
                style={{
                  padding: '7px 16px', fontSize: '12px', fontWeight: 600,
                  backgroundColor: 'var(--accent)', border: 'none',
                  borderRadius: '6px', color: '#0F1117',
                  cursor: assigning ? 'not-allowed' : 'pointer',
                  fontFamily: 'Barlow, sans-serif',
                }}
              >
                {assigning ? 'Saving...' : 'Confirm Assignments'}
              </button>
            </div>
          )}

          {/* Status change buttons */}
          {canChangeStatus ? (
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontFamily: 'Barlow, sans-serif', fontWeight: 600 }}>
                Move to
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {COLUMNS.filter(c => c.key !== task.status && !(role === 'Worker' && c.key === 'Todo')).map(col => (
                  <button key={col.key} onClick={() => onStatusChange(task.id, col.key)} style={{
                    padding: '6px 12px', fontSize: '12px',
                    backgroundColor: 'transparent',
                    border: `1px solid ${col.color}`,
                    borderRadius: '6px', color: col.color,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}>
                    → {col.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Only the assigned worker or a supervisor can change this task's status.
            </p>
          )}

          <div style={{ borderTop: '1px solid var(--border)' }} />

          {/* Comments */}
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', fontFamily: 'Barlow, sans-serif', fontWeight: 600 }}>
              Comments ({comments.length})
            </p>

            {comments.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>No comments yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {comments.map(c => (
                  <div key={c.id} style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>{c.authorName}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {new Date(c.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{c.content}</p>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>

        {/* Comment input */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            style={{
              flex: 1, padding: '9px 12px',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '7px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none', resize: 'none',
            }}
          />
          <button onClick={handleComment} disabled={posting || !commentText.trim()} style={{
            padding: '9px 16px',
            backgroundColor: posting || !commentText.trim() ? 'rgba(245,158,11,0.3)' : 'var(--accent)',
            border: 'none', borderRadius: '7px',
            color: '#0F1117', fontSize: '13px', fontWeight: 600,
            cursor: posting || !commentText.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'Barlow, sans-serif', alignSelf: 'flex-end',
          }}>
            Post
          </button>
        </div>
      </div>
    </>
  )
}
