import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import CreateOutboundOrderModal from '../components/CreateOutboundOrderModal'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'

const STATUS_STYLES = {
  Pending:    { color: 'var(--accent)',       bg: 'rgba(245,158,11,0.1)',  label: 'Pending Approval' },
  Approved:   { color: '#22C55E',             bg: 'rgba(34,197,94,0.1)',   label: 'Picking' },
  Rejected:   { color: 'var(--danger)',       bg: 'rgba(239,68,68,0.1)',   label: 'Rejected' },
  Dispatched: { color: '#3B82F6',             bg: 'rgba(59,130,246,0.1)', label: 'Dispatched' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending
  return (
    <span style={{
      padding: '3px 10px',
      backgroundColor: s.bg, color: s.color,
      border: `1px solid ${s.color}`,
      borderRadius: '20px', fontSize: '11px', fontWeight: 600,
      fontFamily: 'Barlow, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px',
    }}>{s.label}</span>
  )
}

function OrderCard({ order, isAdmin, isPrivileged, onAction, onAssignWorkers }) {
  const [acting, setActing] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleReview = async (approved) => {
    setActing(true)
    try {
      await api.post(`/outboundorders/${order.id}/review`, { isApproved: approved })
      onAction()
    } finally { setActing(false) }
  }

  const handleDispatch = async () => {
    setActing(true)
    try {
      await api.post(`/outboundorders/${order.id}/dispatch`)
      onAction()
    } catch (err) {
      if (err.response?.status === 400) alert('Not all pick tasks are completed yet.')
    } finally { setActing(false) }
  }

  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {order.restaurantName}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
            {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </p>
        </div>

        <StatusBadge status={order.status} />

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
              backgroundColor: '#22C55E', border: 'none',
              borderRadius: '6px', color: '#0F1117', cursor: acting ? 'not-allowed' : 'pointer',
              fontFamily: 'Barlow, sans-serif',
            }}>Approve & Pick</button>
          </div>
        )}

        {isPrivileged && order.status === 'Approved' && (
          <button onClick={() => onAssignWorkers(order)} style={{
            padding: '6px 16px', fontSize: '12px', fontWeight: 600,
            backgroundColor: 'transparent', border: '1px solid #22C55E',
            borderRadius: '6px', color: '#22C55E', cursor: 'pointer',
            fontFamily: 'Barlow, sans-serif',
          }}>
            Assign Workers
          </button>
        )}

        {isAdmin && order.status === 'Approved' && (
          <button onClick={handleDispatch} disabled={acting} style={{
            padding: '6px 16px', fontSize: '12px', fontWeight: 600,
            backgroundColor: '#3B82F6', border: 'none',
            borderRadius: '6px', color: '#fff', cursor: acting ? 'not-allowed' : 'pointer',
            fontFamily: 'Barlow, sans-serif',
          }}>
            {acting ? '...' : 'Mark as Dispatched'}
          </button>
        )}

        <button onClick={() => setExpanded(v => !v)} style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          cursor: 'pointer', fontSize: '18px', padding: '0 4px',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>▶</button>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {order.items.map(item => (
            <div key={item.id} style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto auto',
              gap: '12px', alignItems: 'center',
              padding: '8px 12px', backgroundColor: 'var(--bg)',
              borderRadius: '6px', fontSize: '13px',
            }}>
              <div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.productName}</span>
                {item.barcode && (
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', marginLeft: '8px' }}>
                    #{item.barcode}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '11px', color: '#22C55E', fontWeight: 600, fontFamily: 'Barlow, sans-serif' }}>
                ⬡ {item.sectorName}
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--accent)' }}>
                x{item.quantity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OutboundOrdersPage() {
  const { role } = useAuth()
  const { notifications, setPendingDelivery } = useNotifications()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const isAdmin = role === 'Admin'
  const isPrivileged = role === 'Admin' || role === 'Supervisor'

  const fetchOrders = () => {
    api.get('/outboundorders').then(res => setOrders(res.data))
  }

  useEffect(() => {
    api.get('/outboundorders')
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const latest = notifications[0]
    if (latest?.type === 'OrderReviewed') fetchOrders()
  }, [notifications])

  const handleAssignWorkers = async (order) => {
    const res = await api.get(`/tasks/by-order/${order.id}`)
    setPendingDelivery({
      message: `Pick order for ${order.restaurantName}`,
      metadata: { tasks: res.data },
    })
  }

  const pending = orders.filter(o => o.status === 'Pending')
  const approved = orders.filter(o => o.status === 'Approved')
  const history = orders.filter(o => o.status === 'Rejected' || o.status === 'Dispatched')

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Outbound Orders
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Restaurant orders — pick and dispatch from warehouse
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} style={{
            padding: '10px 20px', backgroundColor: '#22C55E',
            border: 'none', borderRadius: '8px',
            color: '#0F1117', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Barlow, sans-serif',
          }}>
            + New Order
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div style={{
          padding: '48px', textAlign: 'center',
          backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', color: 'var(--text-secondary)',
        }}>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No outbound orders yet</p>
          {isAdmin && <p style={{ fontSize: '13px' }}>Click "+ New Order" to create a restaurant order.</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {pending.length > 0 && (
            <section>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--accent)', marginBottom: '12px' }}>
                Awaiting Approval ({pending.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pending.map(o => <OrderCard key={o.id} order={o} isAdmin={isAdmin} isPrivileged={isPrivileged} onAction={fetchOrders} onAssignWorkers={handleAssignWorkers} />)}
              </div>
            </section>
          )}

          {approved.length > 0 && (
            <section>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#22C55E', marginBottom: '12px' }}>
                Picking in Progress ({approved.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {approved.map(o => <OrderCard key={o.id} order={o} isAdmin={isAdmin} isPrivileged={isPrivileged} onAction={fetchOrders} onAssignWorkers={handleAssignWorkers} />)}
              </div>
            </section>
          )}

          {history.length > 0 && (
            <section>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                History ({history.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.map(o => <OrderCard key={o.id} order={o} isAdmin={isAdmin} isPrivileged={isPrivileged} onAction={fetchOrders} onAssignWorkers={handleAssignWorkers} />)}
              </div>
            </section>
          )}
        </div>
      )}

      <CreateOutboundOrderModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchOrders}
      />
    </Layout>
  )
}