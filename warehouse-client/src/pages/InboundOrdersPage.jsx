import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import CreateInboundOrderModal from '../components/CreateInboundOrderModal'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'

const STATUS_STYLES = {
  Pending:   { color: 'var(--accent)',      bg: 'rgba(245,158,11,0.1)',  label: 'Pending Approval' },
  Approved:  { color: '#3B82F6',            bg: 'rgba(59,130,246,0.1)',  label: 'Approved' },
  Rejected:  { color: 'var(--danger)',      bg: 'rgba(239,68,68,0.1)',   label: 'Rejected' },
  Unloading: { color: '#A855F7',            bg: 'rgba(168,85,247,0.1)',  label: 'Unloading' },
  Received:  { color: 'var(--status-done)', bg: 'rgba(34,197,94,0.1)',   label: 'Received' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending
  return (
    <span style={{
      padding: '3px 10px',
      backgroundColor: s.bg,
      color: s.color,
      border: `1px solid ${s.color}`,
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      fontFamily: 'Barlow, sans-serif',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      {s.label}
    </span>
  )
}

function OrderCard({ order, isAdmin, onAction }) {
  const [acting, setActing] = useState(false)
  const { userId } = useAuth()
  const [expanded, setExpanded] = useState(false)

  const handleReview = async (approved) => {
    setActing(true)
    try {
      await api.post(`/inboundorders/${order.id}/review`, {
        reviewedById: userId,
        isApproved: approved,
      })
      onAction()
    } finally {
      setActing(false)
    }
  }

  const handleArrived = async () => {
    setActing(true)
    try {
      await api.post(`/inboundorders/${order.id}/arrived`, {})
      onAction()
    } finally {
      setActing(false)
    }
  }

  const handleComplete = async () => {
    setActing(true)
    try {
      await api.post(`/inboundorders/${order.id}/complete`, {})
      onAction()
    } catch (err) {
      if (err.response?.status === 400) {
        alert('Not all restock tasks are completed yet. Check the Kanban board.')
      }
    } finally {
      setActing(false)
    }
  }

  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {order.supplierName}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
            {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </p>
        </div>

        <StatusBadge status={order.status} />

        {/* Admin actions */}
        {isAdmin && order.status === 'Pending' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleReview(false)} disabled={acting} style={{
              padding: '6px 14px', fontSize: '12px', fontWeight: 600,
              backgroundColor: 'transparent', border: '1px solid var(--danger)',
              borderRadius: '6px', color: 'var(--danger)', cursor: acting ? 'not-allowed' : 'pointer',
              fontFamily: 'Barlow, sans-serif',
            }}>Reject</button>
            <button onClick={() => handleReview(true)} disabled={acting} style={{
              padding: '6px 14px', fontSize: '12px', fontWeight: 600,
              backgroundColor: '#3B82F6', border: 'none',
              borderRadius: '6px', color: '#fff', cursor: acting ? 'not-allowed' : 'pointer',
              fontFamily: 'Barlow, sans-serif',
            }}>Approve</button>
          </div>
        )}

        {isAdmin && order.status === 'Approved' && (
          <button onClick={handleArrived} disabled={acting} style={{
            padding: '6px 16px', fontSize: '12px', fontWeight: 600,
            backgroundColor: '#A855F7', border: 'none',
            borderRadius: '6px', color: '#fff', cursor: acting ? 'not-allowed' : 'pointer',
            fontFamily: 'Barlow, sans-serif',
          }}>
            {acting ? '...' : 'Delivery Arrived'}
          </button>
        )}

        {isAdmin && order.status === 'Unloading' && (
          <button onClick={handleComplete} disabled={acting} style={{
            padding: '6px 16px', fontSize: '12px', fontWeight: 600,
            backgroundColor: 'var(--status-done)', border: 'none',
            borderRadius: '6px', color: '#0F1117', cursor: acting ? 'not-allowed' : 'pointer',
            fontFamily: 'Barlow, sans-serif',
          }}>
            {acting ? '...' : 'Mark as Received'}
          </button>
        )}

        {/* Expand/collapse items */}
        <button onClick={() => setExpanded(v => !v)} style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          cursor: 'pointer', fontSize: '18px', padding: '0 4px',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>▶</button>
      </div>

      {/* Items list */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {order.items.map(item => (
            <div key={item.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: '12px',
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: 'var(--bg)',
              borderRadius: '6px',
              fontSize: '13px',
            }}>
              <div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.productName}</span>
                {item.barcode && (
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', marginLeft: '8px' }}>
                    #{item.barcode}
                  </span>
                )}
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                min: {item.minimumQuantity}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                color: 'var(--accent)',
              }}>
                ×{item.quantity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function InboundOrdersPage() {
  const { role } = useAuth()
  const { notifications } = useNotifications()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const isAdmin = role === 'Admin'
  const canCreate = role === 'Admin' || role === 'Supervisor'

  const fetchOrders = () => {
    api.get('/inboundorders').then(res => setOrders(res.data))
  }

  useEffect(() => {
    api.get('/inboundorders')
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const latest = notifications[0]
    if (latest?.type === 'OrderReviewed' || latest?.type === 'DeliveryArrived') {
      fetchOrders()
    }
  }, [notifications])

  const pending = orders.filter(o => o.status === 'Pending')
  const approved = orders.filter(o => o.status === 'Approved')
  const unloading = orders.filter(o => o.status === 'Unloading')
  const history = orders.filter(o => o.status === 'Rejected' || o.status === 'Received')

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Inbound Orders
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Supplier delivery requests and approvals
          </p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreate(true)} style={{
            padding: '10px 20px',
            backgroundColor: 'var(--accent)',
            border: 'none', borderRadius: '8px',
            color: '#0F1117', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Barlow, sans-serif',
          }}>
            + New Order Request
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div style={{
          padding: '48px', textAlign: 'center',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          color: 'var(--text-secondary)',
        }}>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No orders yet</p>
          {canCreate && <p style={{ fontSize: '13px' }}>Click "+ New Order Request" to submit a delivery request.</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {pending.length > 0 && (
            <section>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--accent)', marginBottom: '12px' }}>
                Awaiting Approval ({pending.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pending.map(o => <OrderCard key={o.id} order={o} isAdmin={isAdmin} onAction={fetchOrders} />)}
              </div>
            </section>
          )}

          {approved.length > 0 && (
            <section>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#3B82F6', marginBottom: '12px' }}>
                Approved — Awaiting Delivery ({approved.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {approved.map(o => <OrderCard key={o.id} order={o} isAdmin={isAdmin} onAction={fetchOrders} />)}
              </div>
            </section>
          )}

          {unloading.length > 0 && (
            <section>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#A855F7', marginBottom: '12px' }}>
                Unloading — Workers Restocking ({unloading.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {unloading.map(o => <OrderCard key={o.id} order={o} isAdmin={isAdmin} onAction={fetchOrders} />)}
              </div>
            </section>
          )}

          {history.length > 0 && (
            <section>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                History ({history.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.map(o => <OrderCard key={o.id} order={o} isAdmin={isAdmin} onAction={fetchOrders} />)}
              </div>
            </section>
          )}

        </div>
      )}

      <CreateInboundOrderModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchOrders}
      />
    </Layout>
  )
}
