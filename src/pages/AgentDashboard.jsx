import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Icons } from '../components/Icons'

const AgentDashboard = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [darkMode, setDarkMode] = useState(true)
  const name = localStorage.getItem('name')
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode)
  }, [darkMode])

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/agent/orders')
      setOrders(res.data.orders)
    } catch { toast.error('Failed to fetch orders') }
    finally { setLoading(false) }
  }

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId)
    try {
      await api.put(`/agent/orders/${orderId}/status`, { status })
      toast.success(`Marked as ${status.replace('_', ' ')}`)
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    } finally { setUpdating(null) }
  }

  const getStatusConfig = (status) => ({
    pending:    { label: 'PENDING',    color: '#D4A017', bg: 'rgba(234,179,8,0.12)',   glow: '0 0 10px rgba(234,179,8,0.25)'   },
    assigned:   { label: 'ASSIGNED',   color: '#60A5FA', bg: 'rgba(59,130,246,0.12)',  glow: '0 0 10px rgba(59,130,246,0.25)'  },
    picked_up:  { label: 'PICKED UP',  color: '#C084FC', bg: 'rgba(168,85,247,0.12)', glow: '0 0 10px rgba(168,85,247,0.25)' },
    in_transit: { label: 'IN TRANSIT', color: '#FB923C', bg: 'rgba(249,115,22,0.12)', glow: '0 0 10px rgba(249,115,22,0.25)' },
    delivered:  { label: 'DELIVERED',  color: '#4ADE80', bg: 'rgba(34,197,94,0.12)',  glow: '0 0 10px rgba(34,197,94,0.25)'  },
    failed:     { label: 'FAILED',     color: '#F87171', bg: 'rgba(239,68,68,0.12)',  glow: '0 0 10px rgba(239,68,68,0.25)'  },
  }[status] || { label: status, color: '#888', bg: 'rgba(255,255,255,0.05)', glow: 'none' })

  const getNextActions = (status) => ({
    assigned:   [{ label: 'Mark Picked Up',  next: 'picked_up',  color: '#C084FC' }],
    picked_up:  [{ label: 'Mark In Transit', next: 'in_transit', color: '#FB923C' }],
    in_transit: [
      { label: 'Mark Delivered', next: 'delivered', color: '#4ADE80' },
      { label: 'Mark Failed',    next: 'failed',    color: '#F87171' },
    ],
  }[status] || [])

  const stats = [
    { label: 'Assigned',   value: orders.filter(o => o.status === 'assigned').length,   color: '#60A5FA', Icon: Icons.Package },
    { label: 'Picked Up',  value: orders.filter(o => o.status === 'picked_up').length,  color: '#C084FC', Icon: Icons.Clock   },
    { label: 'In Transit', value: orders.filter(o => o.status === 'in_transit').length, color: '#FB923C', Icon: Icons.Truck   },
    { label: 'Delivered',  value: orders.filter(o => o.status === 'delivered').length,  color: '#4ADE80', Icon: Icons.Check   },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', transition: 'all 0.4s ease', overflowX: 'hidden' }}>

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Logo />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 500, color: 'var(--gold)' }}>
            Deliver<span style={{ fontStyle: 'italic' }}>Ease</span>
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-sub)', background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2px 8px', letterSpacing: '1px' }}>
            AGENT
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>{name}</span>
          <button onClick={() => setDarkMode(!darkMode)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-icon)', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'rotate(15deg) scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            {darkMode ? <Icons.Sun /> : <Icons.Moon />}
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontFamily: 'inherit', transition: 'color 0.2s ease' }}
            onMouseEnter={e => e.currentTarget.style.color = '#F87171'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sub)'}>
            <Icons.Logout />
          </button>
        </div>
      </nav>

      <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Stats */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '24px' }}>
          {stats.map((s, i) => (
            <div key={i} className="card hover-lift" style={{ cursor: 'default', padding: '14px 16px' }}>
              <div style={{ color: s.color, marginBottom: '8px' }}><s.Icon /></div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: s.color, lineHeight: 1, marginBottom: '4px', textShadow: `0 0 20px ${s.color}40` }}>{s.value}</div>
              <div style={{ color: 'var(--text-sub)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 500, fontFamily: "'Playfair Display', serif" }}>My Deliveries</h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '12px', marginTop: '2px' }}>{orders.length} active orders</p>
        </div>

        {/* Orders */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-sub)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', opacity: 0.5 }}><Icons.Spinner /></div>
            <p style={{ fontSize: '14px' }}>Loading deliveries...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-sub)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.3, marginBottom: '14px', color: 'var(--text)' }}><Icons.EmptyBox /></div>
            <p style={{ fontSize: '15px', color: 'var(--text)' }}>No active deliveries</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>You'll see orders here when assigned</p>
          </div>
        ) : (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map(order => {
              const sc = getStatusConfig(order.status)
              const actions = getNextActions(order.status)
              return (
                <div key={order._id} className="card hover-up">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold)' }}>{order.orderNumber}</span>
                        <span className="badge" style={{ background: sc.bg, color: sc.color, boxShadow: sc.glow }}>{sc.label}</span>
                      </div>
                      <p style={{ fontSize: '15px', fontWeight: 500 }}>{order.customer.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '2px' }}>{order.customer.phone}</p>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-sub)', flexShrink: 0, marginLeft: '8px' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>

                  {/* Addresses */}
                  <div className="address-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px' }}>
                      <p style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: '5px' }}>Pickup</p>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--gold)', marginTop: '1px', flexShrink: 0 }}><Icons.MapPin /></span>
                        <p style={{ fontSize: '12px', lineHeight: 1.4 }}>{order.pickup.address}</p>
                      </div>
                    </div>
                    <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px' }}>
                      <p style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: '5px' }}>Delivery</p>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start' }}>
                        <span style={{ color: '#4ADE80', marginTop: '1px', flexShrink: 0 }}><Icons.MapPin /></span>
                        <p style={{ fontSize: '12px', lineHeight: 1.4 }}>{order.customer.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
                    {order.items.map((item, i) => (
                      <span key={i} style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', color: 'var(--text-sub)' }}>
                        {item.name} ×{item.quantity}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  {actions.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      {actions.map((action, i) => (
                        <button key={i} onClick={() => updateStatus(order._id, action.next)}
                          disabled={updating === order._id}
                          style={{ flex: 1, minWidth: '120px', background: `${action.color}15`, border: `1px solid ${action.color}40`, color: action.color, borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s ease', opacity: updating === order._id ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${action.color}25`; e.currentTarget.style.transform = 'translateY(-1px)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = `${action.color}15`; e.currentTarget.style.transform = 'none' }}>
                          {action.next === 'delivered' ? <Icons.CheckCircle /> : <Icons.Truck />}
                          {updating === order._id ? 'Updating...' : action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timeline */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                    <p style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--text-sub)', marginBottom: '8px', textTransform: 'uppercase' }}>Timeline</p>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {order.statusHistory.map((h, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <div className="timeline-dot" />
                          <div>
                            <p style={{ fontSize: '11px', fontWeight: 500, textTransform: 'capitalize' }}>{h.status.replace('_', ' ')}</p>
                            <p style={{ fontSize: '10px', color: 'var(--text-sub)' }}>{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentDashboard