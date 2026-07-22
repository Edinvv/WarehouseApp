import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import TaskDetailDrawer from '../components/TaskDetailDrawer'
import api from '../api/axios'

const PRIORITY_COLOR = { High: 'var(--danger)', Medium: 'var(--accent)', Low: 'var(--status-todo)' }
const STATUS_COLOR = { Todo: 'var(--text-secondary)', InProgress: '#3B82F6', Done: 'var(--status-done)' }

function TaskCard({ task, onClick }) {
  const total = task.items?.length || 0
  const done = task.items?.filter(i => i.isCompleted).length || 0
  const isCompleted = task.status === 'Done'

  return (
    <div onClick={onClick} style={{
      backgroundColor: 'var(--surface)',
      border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
      borderRadius: '10px',
      padding: '18px 20px',
      cursor: 'pointer',
      transition: 'border-color 0.15s',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    }}>
      <div style={{
        width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
        backgroundColor: STATUS_COLOR[task.status] || 'var(--text-secondary)',
      }} />

      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: 'Barlow, sans-serif', fontWeight: 600,
          fontSize: '15px', color: 'var(--text-primary)', marginBottom: '5px',
        }}>
          {task.title}
        </p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {task.priority && (
            <span style={{
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.5px', color: PRIORITY_COLOR[task.priority] || 'var(--text-secondary)',
            }}>
              {task.priority}
            </span>
          )}
          {task.sectorName && (
            <span style={{
              fontSize: '11px', color: 'var(--text-secondary)',
              fontFamily: 'Inter, sans-serif',
            }}>
              ⬡ {task.sectorName}
            </span>
          )}
          {total > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
              {done}/{total} items
            </span>
          )}
        </div>
      </div>

      {total > 0 && (
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{
            width: '80px', height: '4px',
            backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden',
          }}>
            <div style={{
              width: `${total === 0 ? 0 : (done / total) * 100}%`,
              height: '100%',
              backgroundColor: done === total ? 'var(--status-done)' : 'var(--accent)',
              borderRadius: '2px',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      )}

      <span style={{ fontSize: '18px', color: 'var(--text-secondary)', flexShrink: 0 }}>›</span>
    </div>
  )
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const fetchTasks = () => {
    api.get('/tasks/my')
      .then(res => setTasks(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTasks() }, [])

  const active = tasks.filter(t => t.status !== 'Done')
  const history = tasks.filter(t => t.status === 'Done')

  const handleStatusChange = async (taskId, newStatus) => {
    await api.put(`/tasks/${taskId}/status`, { status: newStatus })
    fetchTasks()
    setSelectedTask(null)
  }

  return (
    <Layout>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            My Tasks
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {active.length} active task{active.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowHistory(v => !v)} style={{
          padding: '8px 16px', fontSize: '13px', fontWeight: 600,
          backgroundColor: showHistory ? 'rgba(245,158,11,0.1)' : 'transparent',
          border: '1px solid var(--border)', borderRadius: '7px',
          color: showHistory ? 'var(--accent)' : 'var(--text-secondary)',
          cursor: 'pointer', fontFamily: 'Barlow, sans-serif',
        }}>
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {active.length === 0 ? (
            <div style={{
              padding: '48px', textAlign: 'center',
              backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '12px', color: 'var(--text-secondary)',
            }}>
              <p style={{ fontSize: '16px', marginBottom: '6px' }}>No active tasks</p>
              <p style={{ fontSize: '13px' }}>You're all caught up.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {active.map(t => <TaskCard key={t.id} task={t} onClick={() => setSelectedTask(t)} />)}
            </div>
          )}

          {showHistory && history.length > 0 && (
            <div>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Completed ({history.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.map(t => (
                  <div key={t.id} onClick={() => setSelectedTask(t)} style={{
                    backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '10px', padding: '14px 20px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.6,
                  }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--status-done)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '3px' }}>
                        {t.title}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {t.startedAt && (
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
                            Started {new Date(t.startedAt).toLocaleDateString()} {new Date(t.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        {t.completedAt && (
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
                            Done {new Date(t.completedAt).toLocaleDateString()} {new Date(t.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusChange={handleStatusChange}
        onTaskUpdated={fetchTasks}
      />
    </Layout>
  )
}