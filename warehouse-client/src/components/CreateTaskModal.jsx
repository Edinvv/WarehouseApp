import { useState } from 'react'
import api from '../api/axios'

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  backgroundColor: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '7px',
  color: 'var(--text-primary)',
  fontSize: '14px',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '6px',
  fontFamily: 'Barlow, sans-serif',
}

export default function CreateTaskModal({ open, onClose, sectorId, users, createdById, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', dueDate: '', assignedToId: '' })
  const [saving, setSaving] = useState(false)

  if (!open) return null

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await api.post('/tasks', {
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        sectorId,
        createdById,
        dueDate: form.dueDate || null,
        assignedToId: form.assignedToId || null,
      })
      setForm({ title: '', description: '', priority: 'Medium', dueDate: '', assignedToId: '' })
      onCreated()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '28px',
        width: '460px',
        maxWidth: '90vw',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            New Task
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '20px', cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input value={form.title} onChange={set('title')} placeholder="Task title" style={inputStyle} required />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={set('description')} placeholder="Optional description" rows={3}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Priority</label>
              <select value={form.priority} onChange={set('priority')} style={inputStyle}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={set('dueDate')} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Assign To</label>
            <select value={form.assignedToId} onChange={set('assignedToId')} style={inputStyle}>
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{
              padding: '9px 18px', backgroundColor: 'transparent',
              border: '1px solid var(--border)', borderRadius: '7px',
              color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              padding: '9px 22px', backgroundColor: 'var(--accent)',
              border: 'none', borderRadius: '7px',
              color: '#0F1117', fontSize: '14px', fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'Barlow, sans-serif',
            }}>
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
