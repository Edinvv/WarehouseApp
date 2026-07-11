import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import { COLUMNS } from '../constants'
import TaskCard from '../components/TaskCard'
import CreateTaskModal from '../components/CreateTaskModal'
import TaskDetailDrawer from '../components/TaskDetailDrawer'
import SectorTabs from '../components/SectorTabs'

const ACTIVE_COLUMNS = COLUMNS.filter(c => c.key !== 'Done')

export default function SectorBoardPage() {
  const { id } = useParams()
  const location = useLocation()
  const { userId, role } = useAuth()
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)

  const canCreateTask = role === 'Admin' || role === 'Supervisor'

  const fetchTasks = () => {
    api.get(`/tasks?sectorId=${id}`).then(res => setTasks(res.data))
  }

  useEffect(() => {
    Promise.all([
      api.get(`/tasks?sectorId=${id}`),
      api.get('/users'),
    ]).then(([tasksRes, usersRes]) => {
      setTasks(tasksRes.data)
      setUsers(usersRes.data)

      const openTaskId = location.state?.openTaskId
      if (openTaskId) {
        const task = tasksRes.data.find(t => t.id === openTaskId)
        if (task) setSelectedTask(task)
      }
    }).finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus })
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
      if (selectedTask?.id === taskId) setSelectedTask(prev => ({ ...prev, status: newStatus }))
    } catch {
      alert('Failed to update task status.')
    }
  }

  const tasksByStatus = (status) => tasks.filter(t => t.status === status)
  const completedTasks = tasksByStatus('Done')

  return (
    <Layout>
      <SectorTabs sectorId={id} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Kanban Board
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Click a task to view details and comments
          </p>
        </div>
        {canCreateTask && (
          <button onClick={() => setShowCreate(true)} style={{
            padding: '10px 20px',
            backgroundColor: 'var(--accent)',
            border: 'none', borderRadius: '8px',
            color: '#0F1117', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Barlow, sans-serif',
          }}>
            + New Task
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading tasks...</p>
      ) : (
        <>
          {/* Active columns: Todo + In Progress */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', alignItems: 'start' }}>
            {ACTIVE_COLUMNS.map(col => (
              <div key={col.key}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginBottom: '12px', paddingBottom: '12px',
                  borderBottom: `2px solid ${col.color}`,
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color, display: 'inline-block' }} />
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    {col.label}
                  </span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {tasksByStatus(col.key).length}
                  </span>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', borderRadius: '10px', padding: '12px', minHeight: '200px' }}>
                  {tasksByStatus(col.key).length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', padding: '32px 0' }}>No tasks</p>
                  ) : (
                    tasksByStatus(col.key).map(task => (
                      <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Completed history */}
          <div style={{ marginTop: '40px' }}>
            <button
              onClick={() => setShowCompleted(v => !v)}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 18px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: showCompleted ? '10px 10px 0 0' : '10px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'Barlow, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                textAlign: 'left',
              }}
            >
              <span style={{
                display: 'inline-block',
                transition: 'transform 0.2s',
                transform: showCompleted ? 'rotate(90deg)' : 'rotate(0deg)',
                fontSize: '12px',
              }}>▶</span>
              Completed
              <span style={{
                marginLeft: 'auto',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
                color: 'var(--status-done)',
              }}>
                {completedTasks.length}
              </span>
            </button>

            {showCompleted && (
              <div style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderTop: 'none',
                borderRadius: '0 0 10px 10px',
                padding: '16px',
              }}>
                {completedTasks.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', padding: '24px 0' }}>
                    No completed tasks yet
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                    {completedTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        style={{
                          padding: '12px 14px',
                          backgroundColor: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderLeft: '3px solid var(--status-done)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          opacity: 0.75,
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.75'}
                      >
                        <p style={{
                          fontFamily: 'Barlow, sans-serif', fontWeight: 600,
                          fontSize: '14px', color: 'var(--text-primary)',
                          marginBottom: '4px',
                          textDecoration: 'line-through',
                          textDecorationColor: 'var(--text-secondary)',
                        }}>
                          {task.title}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {task.assignedToName && (
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{task.assignedToName}</span>
                          )}
                          {task.dueDate && (
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', marginLeft: 'auto' }}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <CreateTaskModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        sectorId={id}
        users={users}
        createdById={userId}
        onCreated={fetchTasks}
      />

      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusChange={handleStatusChange}
        onTaskUpdated={() => {
          fetchTasks()
          setSelectedTask(null)
        }}
      />
    </Layout>
  )
}
