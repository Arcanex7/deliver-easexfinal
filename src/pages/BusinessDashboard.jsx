import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Icons } from '../components/Icons'

const BusinessDashboard = () => {
  const [orders, setOrders] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [form, setForm] = useState({
    customerName: '', customerPhone: '',
    customerAddress: '', pickupAddress: '',
    items: [{ name: '', quantity: 1 }]
  })
  const name = localStorage.getItem('name')
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode)
  }, [darkMode])

  useEffect(() => { fetchOrders(); fetchAgents() }, [])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders')
      setOrders(res.data.orders)
    } catch { toast.error('Failed to fetch orders') }
    finally { setLoading(false) }
  }

  const fetchAgents = async () => {
    try {
      const res = await api.get('/auth/agents')
      setAgents(res.data.agents)
    } catch { console.log('Could not fetch agents') }
  }

  const handleCreateOrder = async (e) => {
    e.preventDefault()
    try {
      await api.post('/orders', form)
      toast.success('Order created!')
      setShowCreateForm(false)
      setForm({ customerName: '', customerPhone: '', customerAddress: '', pickupAddress: '', items: [{ name: '', quantity: 1 }] })
      fetchOrders()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create order') }
  }

  const handleAssignAgent = async (orderId, agentId) => {
    if (!agentId) return
    try {
      await api.put(`/orders/${orderId}/assign`, { agentId })
      toast.success('Agent assigned!')
      fetchOrders()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to assign') }
  }

  const addItem = () => setForm({ ...form, items: [...form.items, { name: '', quantity: 1 }] })
  const updateItem = (i, f, v) => { const items = [...form.items]; items[i][f] = v; setForm({ ...form, items }) }
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })

  const getStatusConfig = (status) => ({
    pending:    { label: 'PENDING',    bg: 'rgba(234,179,8,0.12)',   color: '#D4A017', glow: '0 0 10px rgba(234,179,8,0.25)'   },
    assigned:   { label: 'ASSIGNED',   bg: 'rgba(59,130,246,0.12)',  color: '#60A5FA', glow: '0 0 10px rgba(59,130,246,0.25)'  },
    picked_up:  { label: 'PICKED UP',  bg: 'rgba(168,85,247,0.12)', color: '#C084FC', glow: '0 0 10px rgba(168,85,247,0.25)' },
    in_transit: { label: 'IN TRANSIT', bg: 'rgba(249,115,22,0.12)', color: '#FB923C', glow: '0 0 10px rgba(249,115,22,0.25)' },
    delivered:  { label: 'DELIVERED',  bg: 'rgba(34,197,94,0.12)',  color: '#4ADE80', glow: '0 0 10px rgba(34,197,94,0.25)'  },
    failed:     { label: 'FAILED',     bg: 'rgba(239,68,68,0.12)',  color: '#F87171', glow: '0 0 10px rgba(239,68,68,0.25)'  },
  }[status] || { label: status, bg: 'rgba(255,255,255,0.05)', color: '#888', glow: 'none' })

  const stats = [
    { label: 'Total Orders', value: orders.length,                                        color: '#C9A96E', Icon: Icons.Package },
    { label: 'Pending',      value: orders.filter(o => o.status === 'pending').length,    color: '#D4A017', Icon: Icons.Clock   },
    { label: 'In Transit',   value: orders.filter(o => o.status === 'in_transit').length, color: '#FB923C', Icon: Icons.Truck   },
    { label: 'Delivered',    value: orders.filter(o => o.status === 'delivered').length,  color: '#4ADE80', Icon: Icons.Check   },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', transition: 'all 0.4s ease', overflowX: 'hidden' }}>

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icons.Logo />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 500, color: 'var(--gold)' }}>
            Deliver<span style={{ fontStyle: 'italic' }}>Ease</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, display: 'none' }} className="hide-mobile">{name}</span>
          <button onClick={() => setDarkMode(!darkMode)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-icon)', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'rotate(15deg) scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            {darkMode ? <Icons.Sun /> : <Icons.Moon />}
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)', fontSize: '13px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s ease' }}
            onMouseEnter={e => e.currentTarget.style.color = '#F87171'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sub)'}>
            <Icons.Logout />
            <span className="hide-mobile">Logout</span>
          </button>
        </div>
      </nav>

      <div className="page-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Stats */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
          {stats.map((s, i) => (
            <div key={i} className="card hover-lift" style={{ cursor: 'default' }}>
              <div style={{ color: s.color, marginBottom: '8px' }}><s.Icon /></div>
              <div style={{ fontSize: '32px', fontWeight: 600, color: s.color, lineHeight: 1, marginBottom: '4px', textShadow: `0 0 24px ${s.color}40` }}>{s.value}</div>
              <div style={{ color: 'var(--text-sub)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 500, fontFamily: "'Playfair Display', serif" }}>Orders</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: '12px', marginTop: '2px' }}>{orders.length} total</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn-ghost" onClick={() => navigate('/business/analytics')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 12px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Analytics
            </button>
            <button className="btn-ghost" onClick={() => navigate('/business/setup')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 12px' }}>
              <Icons.Building /> Store
            </button>
            <button className="btn-gold" onClick={() => setShowCreateForm(!showCreateForm)}
              style={{ background: showCreateForm ? 'none' : 'linear-gradient(135deg, var(--gold), var(--gold-dark))', border: showCreateForm ? '1px solid var(--border)' : 'none', color: showCreateForm ? 'var(--text-sub)' : '#0D0D12', padding: '8px 14px', fontSize: '13px' }}>
              {showCreateForm ? <><Icons.Close /><span>Cancel</span></> : <><Icons.Plus /><span>New Order</span></>}
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="card fade-down" style={{ marginBottom: '16px', borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', color: 'var(--gold)', marginBottom: '16px', fontWeight: 400 }}>
              New Delivery Order
            </h3>
            <form onSubmit={handleCreateOrder}>
              <div className="order-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                {[
                  { ph: 'Customer name',    key: 'customerName'    },
                  { ph: 'Customer phone',   key: 'customerPhone'   },
                  { ph: 'Pickup address',   key: 'pickupAddress'   },
                  { ph: 'Delivery address', key: 'customerAddress' },
                ].map(f => (
                  <input key={f.key} className="inp-bare" type="text" placeholder={f.ph}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required />
                ))}
              </div>

              <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: '8px' }}>Items</p>
              {form.items.map((item, idx) => (
                <div key={idx} className="slide-in" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input className="inp-bare" type="text" placeholder="Item name"
                    value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} required style={{ flex: 1 }} />
                  <input className="inp-bare" type="number" placeholder="Qty" min="1"
                    value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value))} required style={{ width: '64px', textAlign: 'center' }} />
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)}
                      style={{ background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: '10px', padding: '8px 10px', color: '#F87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Icons.Trash />
                    </button>
                  )}
                </div>
              ))}

              <button type="button" onClick={addItem}
                style={{ background: 'none', border: '1px dashed rgba(201,169,110,0.3)', borderRadius: '8px', padding: '7px 14px', color: 'var(--gold)', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', marginTop: '4px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.Plus /> Add Item
              </button>

              <button type="submit" className="btn-gold" style={{ width: '100%' }}>Create Order</button>
            </form>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-sub)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', opacity: 0.5 }}><Icons.Spinner /></div>
            <p style={{ fontSize: '14px' }}>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-sub)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.3, marginBottom: '14px', color: 'var(--text)' }}><Icons.EmptyBox /></div>
            <p style={{ fontSize: '15px', color: 'var(--text)' }}>No orders yet</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Create your first order to get started</p>
          </div>
        ) : (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {orders.map(order => {
              const sc = getStatusConfig(order.status)
              return (
                <div key={order._id} className="card hover-up">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold)' }}>{order.orderNumber}</span>
                        <span className="badge" style={{ background: sc.bg, color: sc.color, boxShadow: sc.glow }}>{sc.label}</span>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 500 }}>{order.customer.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.customer.phone} · {order.customer.address}
                      </p>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-sub)', flexShrink: 0, marginLeft: '8px' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                    {order.items.map((item, i) => (
                      <span key={i} style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', color: 'var(--text-sub)' }}>
                        {item.name} ×{item.quantity}
                      </span>
                    ))}
                  </div>

                  {order.status === 'pending' && (
                    <div style={{ marginBottom: '10px' }}>
                      <select className="sel" style={{ width: '100%' }}
                        onChange={e => handleAssignAgent(order._id, e.target.value)} defaultValue="">
                        <option value="" disabled>Assign delivery agent...</option>
                        {agents.map(agent => (
                          <option key={agent._id} value={agent._id}>{agent.name} — {agent.vehicleType || 'Vehicle'}</option>
                        ))}
                      </select>
                    </div>
                  )}

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

export default BusinessDashboard