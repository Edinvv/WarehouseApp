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

const emptyItem = () => ({ productName: '', barcode: '', quantity: '', sectorId: '' })

export default function CreateOutboundOrderModal({ open, onClose, onCreated }) {
  const [restaurantName, setRestaurantName] = useState('')
  const [items, setItems] = useState([emptyItem()])
  const [sectors, setSectors] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) api.get('/sectors').then(res => setSectors(res.data))
  }, [open])

  if (!open) return null

  const addItem = () => setItems(prev => [...prev, emptyItem()])
  const removeItem = (index) => setItems(prev => prev.filter((_, i) => i !== index))
  const updateItem = (index, field, value) =>
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!restaurantName.trim() || items.some(i => !i.productName.trim() || !i.sectorId)) return
    setSaving(true)
    try {
      await api.post('/outboundorders', {
        restaurantName: restaurantName.trim(),
        items: items.map(i => ({
          productName: i.productName.trim(),
          barcode: i.barcode.trim(),
          quantity: parseInt(i.quantity) || 1,
          sectorId: i.sectorId,
        })),
      })
      setRestaurantName('')
      setItems([emptyItem()])
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
      padding: '20px',
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '28px',
        width: '620px',
        maxWidth: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Restaurant Name *</label>
            <input value={restaurantName} onChange={e => setRestaurantName(e.target.value)}
              placeholder="e.g. The Grand Bistro" style={inputStyle} required />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ ...labelStyle, marginBottom: 0 }}>Items to Pick *</p>
              <button type="button" onClick={addItem} style={{
                padding: '5px 12px', fontSize: '12px',
                backgroundColor: 'transparent',
                border: '1px solid var(--accent)',
                borderRadius: '6px', color: 'var(--accent)',
                cursor: 'pointer', fontFamily: 'Barlow, sans-serif', fontWeight: 600,
              }}>+ Add Item</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((item, index) => (
                <div key={index} style={{
                  padding: '14px',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'Barlow, sans-serif' }}>
                      Item {index + 1}
                    </span>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} style={{
                        background: 'none', border: 'none',
                        color: 'var(--danger)', fontSize: '18px',
                        cursor: 'pointer', lineHeight: 1,
                      }}>×</button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={labelStyle}>Product Name *</label>
                      <input value={item.productName} onChange={e => updateItem(index, 'productName', e.target.value)}
                        placeholder="e.g. Olive Oil" style={inputStyle} required />
                    </div>
                    <div>
                      <label style={labelStyle}>Barcode</label>
                      <input value={item.barcode} onChange={e => updateItem(index, 'barcode', e.target.value)}
                        placeholder="e.g. 5901234123457" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Quantity *</label>
                      <input type="number" min="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)}
                        placeholder="0" style={inputStyle} required />
                    </div>
                    <div>
                      <label style={labelStyle}>Pick From Sector *</label>
                      <select value={item.sectorId} onChange={e => updateItem(index, 'sectorId', e.target.value)} style={inputStyle} required>
                        <option value="">Select sector...</option>
                        {sectors.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              padding: '9px 18px', backgroundColor: 'transparent',
              border: '1px solid var(--border)', borderRadius: '7px',
              color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              padding: '9px 22px', backgroundColor: '#22C55E',
              border: 'none', borderRadius: '7px',
              color: '#0F1117', fontSize: '14px', fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'Barlow, sans-serif',
            }}>
              {saving ? 'Submitting...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}