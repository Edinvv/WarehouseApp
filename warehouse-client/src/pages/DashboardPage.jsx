import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function DashboardPage() {
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/sectors')
      .then(res => setSectors(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Barlow, sans-serif',
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '4px',
        }}>Sectors</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Select a sector to view its Kanban board
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      ) : sectors.length === 0 ? (
        <div style={{
          padding: '48px',
          textAlign: 'center',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          color: 'var(--text-secondary)',
        }}>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No sectors yet</p>
          <p style={{ fontSize: '13px' }}>An admin can create sectors from the API.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px',
        }}>
          {sectors.map(sector => (
            <div
              key={sector.id}
              onClick={() => navigate(`/sectors/${sector.id}`)}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, transform 0.15s',
                borderLeft: '3px solid var(--accent)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.borderLeftColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(245,158,11,0.12)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginBottom: '16px',
              }}>⬡</div>
              <h3 style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}>{sector.name}</h3>
              {sector.description && (
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                }}>{sector.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}