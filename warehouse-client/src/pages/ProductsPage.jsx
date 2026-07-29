import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import SectorTabs from '../components/SectorTabs'
import api from '../api/axios'

function StockCard({ item }) {
  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <h3 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
        {item.productName}
      </h3>

      {item.barcode && (
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
          #{item.barcode}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '32px', fontWeight: 700,
          color: 'var(--accent)', lineHeight: 1,
        }}>
          {item.quantity}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>units in stock</span>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const { id } = useParams()
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/stock?sectorId=${id}`)
      .then(res => setStock(res.data))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <Layout>
      <SectorTabs sectorId={id} />

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Stock
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Current inventory in this sector — updated automatically on inbound and outbound orders
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading stock...</p>
      ) : stock.length === 0 ? (
        <div style={{
          padding: '48px', textAlign: 'center',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          color: 'var(--text-secondary)',
        }}>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No stock in this sector</p>
          <p style={{ fontSize: '13px' }}>Stock appears here once a delivery order is received.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {stock.map(item => <StockCard key={item.id} item={item} />)}
        </div>
      )}
    </Layout>
  )
}
