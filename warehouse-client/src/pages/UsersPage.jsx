import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'

const ROLE_COLORS = {
  Admin: { bg: 'rgba(245,158,11,0.15)', color: 'var(--accent)', border: 'rgba(245,158,11,0.3)' },
  Supervisor: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: 'rgba(59,130,246,0.3)' },
  Worker: { bg: 'rgba(100,116,139,0.15)', color: 'var(--text-secondary)', border: 'var(--border)' },
}

function RoleBadge({ role }) {
  const style = ROLE_COLORS[role] || ROLE_COLORS.Worker
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      backgroundColor: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      fontFamily: 'Barlow, sans-serif',
    }}>
      {role}
    </span>
  )
}

function AddUserModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'Worker' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  if (!open) return null

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.post('/users', form)
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'Worker' })
      onCreated()
      onClose()
    } catch (err) {
      const errors = err.response?.data
      if (Array.isArray(errors)) setError(errors.map(e => e.description).join(' '))
      else setError('Failed to create user.')
    } finally {
      setSaving(false)
    }
  }

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
        width: '440px',
        maxWidth: '90vw',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Add Team Member
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '20px', cursor: 'pointer' }}>×</button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', marginBottom: '16px',
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '7px',
            fontSize: '13px', color: 'var(--danger)',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>First Name *</label>
              <input value={form.firstName} onChange={set('firstName')} placeholder="John" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Last Name *</label>
              <input value={form.lastName} onChange={set('lastName')} placeholder="Doe" style={inputStyle} required />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email *</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="john@warehouse.com" style={inputStyle} required />
          </div>

          <div>
            <label style={labelStyle}>Password *</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="Min 6 chars, 1 uppercase, 1 digit" style={inputStyle} required />
          </div>

          <div>
            <label style={labelStyle}>Role *</label>
            <select value={form.role} onChange={set('role')} style={inputStyle}>
              <option value="Worker">Worker</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Admin">Admin</option>
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
              {saving ? 'Creating...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { userId: currentUserId } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const fetchUsers = () => {
    api.get('/users').then(res => setUsers(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Team
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Manage team members and their roles
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          padding: '10px 20px',
          backgroundColor: 'var(--accent)',
          border: 'none', borderRadius: '8px',
          color: '#0F1117', fontSize: '14px', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'Barlow, sans-serif',
        }}>
          + Add Member
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      ) : (
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 120px',
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            fontFamily: 'Barlow, sans-serif',
          }}>
            <span>Member</span>
            <span>Email</span>
            <span>Role</span>
          </div>

          {users.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              No team members yet
            </div>
          ) : (
            users.map((user, i) => (
              <div key={user.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 120px',
                padding: '14px 20px',
                alignItems: 'center',
                borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
                backgroundColor: user.id === currentUserId ? 'rgba(245,158,11,0.04)' : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    backgroundColor: 'rgba(245,158,11,0.15)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 700, color: 'var(--accent)',
                    fontFamily: 'Barlow, sans-serif', flexShrink: 0,
                  }}>
                    {user.firstName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                      {user.firstName} {user.lastName}
                      {user.id === currentUserId && (
                        <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>(you)</span>
                      )}
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
                  {user.email}
                </p>

                <RoleBadge role={user.role} />
              </div>
            ))
          )}
        </div>
      )}

      <AddUserModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={fetchUsers}
      />
    </Layout>
  )
}