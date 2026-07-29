import { useEffect, useState } from 'react'
import api from '../api/axios'

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  backgroundColor: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '7px',
  color: 'var(--text-primary)',
  fontSize: '13px',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '4px',
  fontFamily: 'Barlow, sans-serif',
}

export default function CreateOutboundOrderModal({ open, onClose, onCreated }) {
  const [restaurantName, setRestaurantName] = useState('')
  const [stock, setStock] = useState([])
  const [selected, setSelected] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setRestaurantName('')
    setSelected({})
    api.get('/stock').then(res => setStock(res.data))
  }, [open])

  if (!open) return null

  const toggle = (item) => {
    setSelected(prev => {
      if (prev[item.id]) {
        const next = { ...prev }
        delete next[item.id]
        return next
      }
      return { ...prev, [item.id]: { ...item, requestedQty: 1 } }
    })
  }

  const setQty = (id, qty, max) => {
    const clamped = Math.min(Math.max(1, parseInt(qty) || 1), max)
    setSelected(prev => ({ ...prev, [id]: { ...prev[id], requestedQty: clamped } }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const items = Object.values(selected)
    if (!restaurantName.trim() || items.length === 0) return
    setSaving(true)
    try {
      await api.post('/outboundorders', {
        restaurantName: restaurantName.trim(),
        items: items.map(i => ({
          productName: i.productName,
          barcode: i.barcode,
          quantity: i.requestedQty,
          sectorId: i.sectorId,
        })),
      })
      onCreated()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const selectedCount = Object.keys(selected).length

  const grouped = stock.reduce((acc, item) => {
    const key = item.sectorName
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        width: '640px', maxWidth: '100%', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '11px', color: '#22C55E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>
                Outbound Order
              </p>
              <h2 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                New Restaurant Order
              </h2>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '20px', cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Restaurant Name *</label>
            <input value={restaurantName} onChange={e => setRestaurantName(e.target.value)}
              placeholder="e.g. The Grand Bistro" style={inputStyle} />
          </div>
        </div>

        {/* Stock list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px' }}>
          <p style={{ ...labelStyle, marginBottom: '12px' }}>
            Select Products ({selectedCount} selected)
          </p>

          {stock.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', padding: '32px 0' }}>
              No stock available. Complete an inbound order first.
            </p>
          ) : (
            Object.entries(grouped).map(([sectorName, items]) => (
              <div key={sectorName} style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontFamily: 'Barlow, sans-serif' }}>
                  ⬡ {sectorName}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {items.map(item => {
                    const isSelected = !!selected[item.id]
                    return (
                      <div key={item.id} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 14px',
                        backgroundColor: isSelected ? 'rgba(34,197,94,0.06)' : 'var(--bg)',
                        border: `1px solid ${isSelected ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }} onClick={() => toggle(item)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggle(item)}
                          style={{ accentColor: '#22C55E', cursor: 'pointer', width: '15px', height: '15px' }}
                          onClick={e => e.stopPropagation()}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                            {item.productName}
                          </p>
                          {item.barcode && (
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
                              #{item.barcode}
                            </p>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                          {item.quantity} available
                        </span>
                        {isSelected && (
                          <input
                            type="number"
                            min="1"
                            max={item.quantity}
                            value={selected[item.id].requestedQty}
                            onChange={e => setQty(item.id, e.target.value, item.quantity)}
                            onClick={e => e.stopPropagation()}
                            style={{ ...inputStyle, width: '70px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
            {selectedCount === 0 ? 'No products selected' : `${selectedCount} product${selectedCount > 1 ? 's' : ''} selected`}
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{
              padding: '9px 18px', backgroundColor: 'transparent',
              border: '1px solid var(--border)', borderRadius: '7px',
              color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}>Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={saving || !restaurantName.trim() || selectedCount === 0}
              style={{
                padding: '9px 22px',
                backgroundColor: saving || !restaurantName.trim() || selectedCount === 0 ? 'var(--border)' : '#22C55E',
                border: 'none', borderRadius: '7px',
                color: saving || !restaurantName.trim() || selectedCount === 0 ? 'var(--text-secondary)' : '#0F1117',
                fontSize: '14px', fontWeight: 600,
                cursor: saving || !restaurantName.trim() || selectedCount === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'Barlow, sans-serif',
              }}>
              {saving ? 'Placing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}