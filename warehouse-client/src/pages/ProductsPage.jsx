import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import SectorTabs from '../components/SectorTabs'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'

function ProductCard({ product, isPrivileged, onStockUpdated, onDeleted }) {
  const [change, setChange] = useState('')
  const [applying, setApplying] = useState(false)

  const handleApply = async () => {
    const amount = parseInt(change)
    if (!amount || amount === 0) return
    setApplying(true)
    try {
      await api.patch(`/products/${product.id}/stock`, { change: amount })
      setChange('')
      onStockUpdated()
    } finally {
      setApplying(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    await api.delete(`/products/${product.id}`)
    onDeleted()
  }

  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      border: `1px solid ${product.isLowStock ? 'var(--danger)' : 'var(--border)'}`,
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}>
      {product.isLowStock && (
        <div style={{
          backgroundColor: 'rgba(239,68,68,0.1)',
          border: '1px solid var(--danger)',
          borderRadius: '6px',
          padding: '6px 10px',
          fontSize: '11px',
          color: 'var(--danger)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontFamily: 'Barlow, sans-serif',
        }}>
          ⚠ Low Stock
        </div>
      )}

      <h3 style={{
        fontFamily: 'Barlow, sans-serif',
        fontSize: '16px',
        fontWeight: 700,
        color: 'var(--text-primary)',
      }}>
        {product.name}
      </h3>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '32px',
          fontWeight: 700,
          color: product.isLowStock ? 'var(--danger)' : 'var(--accent)',
          lineHeight: 1,
        }}>
          {product.quantity}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>units in stock</span>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        Low stock threshold: <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{product.minimumStock}</span>
      </p>

      {isPrivileged && (
        <>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            <p style={{
              fontSize: '11px', fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              fontFamily: 'Barlow, sans-serif',
              marginBottom: '8px',
            }}>Adjust Stock</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                value={change}
                onChange={e => setChange(e.target.value)}
                placeholder="+20 or -5"
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '7px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleApply}
                disabled={applying || !change || parseInt(change) === 0}
                style={{
                  padding: '8px 14px',
                  backgroundColor: applying || !change ? 'rgba(245,158,11,0.3)' : 'var(--accent)',
                  border: 'none', borderRadius: '7px',
                  color: '#0F1117', fontSize: '13px', fontWeight: 600,
                  cursor: applying || !change ? 'not-allowed' : 'pointer',
                  fontFamily: 'Barlow, sans-serif',
                  whiteSpace: 'nowrap',
                }}>
                {applying ? '...' : 'Apply'}
              </button>
            </div>
          </div>

          <button
            onClick={handleDelete}
            style={{
              padding: '7px 12px',
              backgroundColor: 'transparent',
              border: '1px solid var(--danger)',
              borderRadius: '7px',
              color: 'var(--danger)',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              alignSelf: 'flex-start',
            }}>
            Delete product
          </button>
        </>
      )}
    </div>
  )
}

export default function ProductsPage() {
  const { id } = useParams()
  const { role } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const isPrivileged = role === 'Admin' || role === 'Supervisor'

  const fetchProducts = () => {
    api.get(`/products?sectorId=${id}`).then(res => setProducts(res.data))
  }

  useEffect(() => {
    api.get(`/products?sectorId=${id}`)
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <Layout>
      <SectorTabs sectorId={id} />

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Products
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Stock levels for this sector — products are created automatically when a delivery is received
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading products...</p>
      ) : products.length === 0 ? (
        <div style={{
          padding: '48px', textAlign: 'center',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          color: 'var(--text-secondary)',
        }}>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No products yet</p>
          <p style={{ fontSize: '13px' }}>Products appear here once a delivery order is received.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              isPrivileged={isPrivileged}
              onStockUpdated={fetchProducts}
              onDeleted={fetchProducts}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}
