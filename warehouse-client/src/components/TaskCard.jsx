import { PRIORITY_COLORS } from '../constants'

export default function TaskCard({ task, onClick }) {
  const priorityColor = PRIORITY_COLORS[task.priority] || 'var(--status-todo)'
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'
  const isDueSoon = task.dueDate && !isOverdue && (new Date(task.dueDate) - new Date()) < 1000 * 60 * 60 * 48
  const dueDateColor = isOverdue ? 'var(--danger)' : isDueSoon ? 'var(--accent)' : 'var(--text-secondary)'

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--bg)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${priorityColor}`,
        borderRadius: '8px',
        padding: '14px',
        marginBottom: '10px',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = priorityColor}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.borderLeftColor = priorityColor
      }}
    >
      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px' }}>
        {task.title}
      </p>

      {task.description && (
        <p style={{
          fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.5',
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>{task.description}</p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: priorityColor, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span style={{ fontSize: '11px', color: dueDateColor, fontFamily: 'JetBrains Mono, monospace' }}>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {task.assignedToName && (
        <div style={{
          marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)',
          fontSize: '12px', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%',
            backgroundColor: 'rgba(245,158,11,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', color: 'var(--accent)', fontWeight: 700,
          }}>
            {task.assignedToName.charAt(0).toUpperCase()}
          </div>
          {task.assignedToName}
        </div>
      )}
    </div>
  )
}
