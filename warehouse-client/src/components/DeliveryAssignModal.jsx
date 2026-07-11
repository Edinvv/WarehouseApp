import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'

export default function DeliveryAssignModal() {
  const { role } = useAuth()
  const { pendingDelivery, clearPendingDelivery } = useNotifications()
  const [workers, setWorkers] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedWorkers, setSelectedWorkers] = useState([])
  const [saving, setSaving] = useState(false)

  const isPrivileged = role === 'Admin' || role === 'Supervisor'

  useEffect(() => {
    if (!pendingDelivery || !isPrivileged) return
    api.get('/users').then(res => setWorkers(res.data.filter(u => u.role === 'Worker')))
    if (pendingDelivery.metadata?.tasks) {
      setTasks(pendingDelivery.metadata.tasks)
      setSelectedWorkers([])
    }
  }, [pendingDelivery])

  if (!pendingDelivery || !isPrivileged) return null

  const toggleWorker = (workerId) => {
    setSelectedWorkers(prev =>
      prev.includes(workerId) ? prev.filter(id => id !== workerId) : [...prev, workerId]
    )
  }

  const handleConfirm = async () => {
    setSaving(true)
    try {
      await Promise.all(
        tasks.map(task =>
          api.put(`/tasks/${task.id}/assign`, { userIds: selectedWorkers })
        )
      )
      clearPendingDelivery()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.6)' }} />

      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 101,
        width: '480px', maxWidth: '90vw', maxHeight: '80vh',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: '11px', color: '#A855F7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>
            Delivery Arrived
          </p>
          <h2 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Assign Workers to Delivery
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {pendingDelivery.message}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Task list - read only */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontFamily: 'Barlow, sans-serif' }}>
              Restock Tasks ({tasks.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {tasks.map(task => (
                <div key={task.id} style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '7px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  fontFamily: 'Barlow, sans-serif',
                  fontWeight: 500,
                }}>
                  {task.title}
                </div>
              ))}
            </div>
          </div>

          {/* Worker picker - single list for all tasks */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontFamily: 'Barlow, sans-serif' }}>
              Assign Workers
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {workers.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No workers available.</p>
              ) : workers.map(w => (
                <label key={w.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px',
                  backgroundColor: selectedWorkers.includes(w.id) ? 'rgba(245,158,11,0.08)' : 'var(--bg)',
                  border: `1px solid ${selectedWorkers.includes(w.id) ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`,
                  borderRadius: '7px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  <input
                    type="checkbox"
                    checked={selectedWorkers.includes(w.id)}
                    onChange={() => toggleWorker(w.id)}
                    style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                    {w.firstName} {w.lastName}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
            {selectedWorkers.length === 0 ? 'No workers selected' : `${selectedWorkers.length} worker${selectedWorkers.length > 1 ? 's' : ''} selected`}
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={clearPendingDelivery} style={{
              padding: '8px 18px', fontSize: '13px', fontWeight: 600,
              backgroundColor: 'transparent', border: '1px solid var(--border)',
              borderRadius: '7px', color: 'var(--text-secondary)', cursor: 'pointer',
              fontFamily: 'Barlow, sans-serif',
            }}>
              Skip
            </button>
            <button onClick={handleConfirm} disabled={saving || selectedWorkers.length === 0} style={{
              padding: '8px 18px', fontSize: '13px', fontWeight: 600,
              backgroundColor: selectedWorkers.length === 0 ? 'var(--border)' : 'var(--accent)',
              border: 'none', borderRadius: '7px',
              color: selectedWorkers.length === 0 ? 'var(--text-secondary)' : '#0F1117',
              cursor: saving || selectedWorkers.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'Barlow, sans-serif',
            }}>
              {saving ? 'Saving...' : 'Confirm Assignments'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}