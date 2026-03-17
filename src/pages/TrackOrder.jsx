import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'
import { Icons } from '../components/Icons'

const TrackOrder = () => {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    fetchOrder()

    // Connect to socket and join order room
    const socket = io(import.meta.env.VITE_API_URL)
    socket.on('connect', () => {
      socket.emit('join_order', orderNumber)
    })

    // Listen for real-time status updates
    socket.on('order_status_updated', (data) => {
      setLastUpdated(new Date())
      setPulse(true)
      setTimeout(() => setPulse(false), 2000)
      fetchOrder()
    })

    return () => socket.disconnect()
  }, [orderNumber])

  const fetchOrder = async () => {
    try {
     const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/track/${orderNumber}`)
      setOrder(res.data.order)
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found')
    } finally {
      setLoading(false)
    }
  }

  const statusSteps = [
    { key: 'pending',    label: 'Order Placed',   Icon: Icons.Package    },
    { key: 'assigned',   label: 'Agent Assigned', Icon: Icons.User       },
    { key: 'picked_up',  label: 'Picked Up',      Icon: Icons.CheckCircle },
    { key: 'in_transit', label: 'On the Way',     Icon: Icons.Truck      },
    { key: 'delivered',  label: 'Delivered',      Icon: Icons.Check      },
  ]

  const getStepStatus = (stepKey) => {
    const order_of = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered']
    const currentIndex = order_of.indexOf(order?.status)
    const stepIndex = order_of.indexOf(stepKey)
    if (stepIndex < currentIndex) return 'done'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  const getStatusConfig = (status) => ({
    pending:    { label: 'Order Placed',   color: '#D4A017', bg: 'rgba(234,179,8,0.12)',   glow: '0 0 16px rgba(234,179,8,0.3)'   },
    assigned:   { label: 'Agent Assigned', color: '#60A5FA', bg: 'rgba(59,130,246,0.12)',  glow: '0 0 16px rgba(59,130,246,0.3)'  },
    picked_up:  { label: 'Picked Up',      color: '#C084FC', bg: 'rgba(168,85,247,0.12)', glow: '0 0 16px rgba(168,85,247,0.3)' },
    in_transit: { label: 'On the Way',     color: '#FB923C', bg: 'rgba(249,115,22,0.12)', glow: '0 0 16px rgba(249,115,22,0.3)' },
    delivered:  { label: 'Delivered',      color: '#4ADE80', bg: 'rgba(34,197,94,0.12)',  glow: '0 0 16px rgba(34,197,94,0.3)'  },
    failed:     { label: 'Failed',         color: '#F87171', bg: 'rgba(239,68,68,0.12)',  glow: '0 0 16px rgba(239,68,68,0.3)'  },
  }[status] || { label: status, color: '#888', bg: 'rgba(255,255,255,0.05)', glow: 'none' })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#08090E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center', color: 'rgba(240,238,233,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', opacity: 0.5 }}>
          <Icons.Spinner />
        </div>
        <p style={{ fontSize: '14px' }}>Loading your order...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#08090E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center', color: 'rgba(240,238,233,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#F87171' }}>
          <Icons.AlertCircle />
        </div>
        <p style={{ fontSize: '16px', color: '#F0EEE9', marginBottom: '6px' }}>Order not found</p>
        <p style={{ fontSize: '13px' }}>{error}</p>
      </div>
    </div>
  )

  const sc = getStatusConfig(order.status)

  return (
    <div style={{ minHeight: '100vh', background: '#08090E', color: '#F0EEE9', fontFamily: "'DM Sans', system-ui, sans-serif", padding: '0 0 60px 0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');
        @keyframes pulseGlow {
          0%   { box-shadow: 0 0 0 0 rgba(201,169,110,0.4); }
          70%  { box-shadow: 0 0 0 12px rgba(201,169,110,0); }
          100% { box-shadow: 0 0 0 0 rgba(201,169,110,0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .live-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #4ADE80;
          animation: pulseGlow 2s infinite;
          display: inline-block;
        }
        .step-done   { opacity: 1; }
        .step-active { opacity: 1; }
        .step-pending { opacity: 0.3; }
        .fade-up { animation: fadeUp 0.4s ease; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background: '#0F111A', borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '0 24px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Icons.WordMark size={0.6} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="live-dot" />
          <span style={{ fontSize: '12px', color: '#4ADE80', letterSpacing: '0.5px' }}>Live Tracking</span>
        </div>
      </nav>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 20px' }} className="fade-up">

        {/* Order Header */}
        <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.4)', marginBottom: '4px' }}>
                Order Number
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 400, color: '#C9A96E' }}>
                {order.orderNumber}
              </h1>
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 600, letterSpacing: '1px',
              padding: '6px 14px', borderRadius: '20px',
              background: sc.bg, color: sc.color, boxShadow: sc.glow,
              animation: pulse ? 'pulseGlow 0.5s ease' : 'none',
            }}>
              {sc.label.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: 'rgba(240,238,233,0.6)' }}>
              {order.items.length} item{order.items.length > 1 ? 's' : ''}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: 'rgba(240,238,233,0.6)' }}>
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {lastUpdated && (
              <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#4ADE80' }}>
                Updated just now
              </div>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        {order.status !== 'failed' && (
          <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.4)', marginBottom: '20px' }}>
              Delivery Progress
            </p>
            <div style={{ position: 'relative' }}>
              {/* Progress line */}
              <div style={{ position: 'absolute', left: '15px', top: '16px', bottom: '16px', width: '1px', background: 'rgba(255,255,255,0.06)' }} />

              {statusSteps.map((step, i) => {
                const stepStatus = getStepStatus(step.key)
                const isActive = stepStatus === 'active'
                const isDone = stepStatus === 'done'
                const historyEntry = order.statusHistory.find(h => h.status === step.key)

                return (
                  <div key={i} className={`step-${stepStatus}`} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: i < statusSteps.length - 1 ? '20px' : '0', position: 'relative' }}>
                    {/* Step indicator */}
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isActive ? sc.bg : isDone ? 'rgba(201,169,110,0.12)' : 'rgba(255,255,255,0.04)',
                      border: isActive ? `1px solid ${sc.color}` : isDone ? '1px solid rgba(201,169,110,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: isActive ? sc.glow : 'none',
                      color: isActive ? sc.color : isDone ? '#C9A96E' : 'rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      zIndex: 1,
                    }}>
                      <step.Icon />
                    </div>

                    <div style={{ paddingTop: '6px' }}>
                      <p style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400, color: isActive ? sc.color : isDone ? '#F0EEE9' : 'rgba(240,238,233,0.3)' }}>
                        {step.label}
                      </p>
                      {historyEntry && (
                        <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.35)', marginTop: '2px' }}>
                          {new Date(historyEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {historyEntry.note && ` · ${historyEntry.note}`}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Failed State */}
        {order.status === 'failed' && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '20px 24px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: '#F87171' }}><Icons.AlertCircle /></span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#F87171', marginBottom: '2px' }}>Delivery Failed</p>
              <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.4)' }}>Please contact the business for assistance.</p>
            </div>
          </div>
        )}

        {/* Addresses */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '18px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.35)', marginBottom: '10px' }}>Pickup</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#C9A96E', flexShrink: 0, marginTop: '1px' }}><Icons.MapPin /></span>
              <p style={{ fontSize: '12px', lineHeight: 1.6, color: 'rgba(240,238,233,0.7)' }}>{order.pickup.address}</p>
            </div>
          </div>
          <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '18px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.35)', marginBottom: '10px' }}>Delivery</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#4ADE80', flexShrink: 0, marginTop: '1px' }}><Icons.MapPin /></span>
              <p style={{ fontSize: '12px', lineHeight: 1.6, color: 'rgba(240,238,233,0.7)' }}>{order.customer.address}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '18px', marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.35)', marginBottom: '12px' }}>Items</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px' }}>{item.name}</p>
                <span style={{ fontSize: '12px', color: 'rgba(240,238,233,0.4)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '20px' }}>×{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivered confirmation */}
        {order.status === 'delivered' && (
          <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '16px', padding: '20px 24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', color: '#4ADE80' }}><Icons.CheckCircle /></div>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#4ADE80', marginBottom: '4px' }}>Delivered Successfully</p>
            <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.4)' }}>
              {order.deliveredAt && `Delivered at ${new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackOrder
