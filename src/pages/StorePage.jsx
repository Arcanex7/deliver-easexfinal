import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Icons } from '../components/Icons'

const StorePage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cart, setCart] = useState([])
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerAddress: '', note: '' })
  const [showForm, setShowForm] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(null)

  useEffect(() => { fetchStore() }, [slug])

  const fetchStore = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/stores/${slug}`)
      setStore(res.data.store)
    } catch (err) {
      setError('Store not found')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (item) => {
    const existing = cart.find(c => c._id === item._id)
    if (existing) {
      setCart(cart.map(c => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
    toast.success(`${item.name} added`)
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c._id !== itemId))
  }

  const updateQty = (itemId, qty) => {
    if (qty < 1) return removeFromCart(itemId)
    setCart(cart.map(c => c._id === itemId ? { ...c, quantity: qty } : c))
  }

  const getCartItems = () => {
    if (store?.storeType === 'catalogue') {
      return cart.map(c => ({ name: c.name, quantity: c.quantity }))
    }
    return form.items || []
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setPlacing(true)
    try {
      const items = store.storeType === 'catalogue'
        ? cart.map(c => ({ name: c.name, quantity: c.quantity }))
        : store.storeType === 'simple'
          ? simpleItems.filter(i => i.name)
          : [{ name: form.note || 'Service Request', quantity: 1 }]

      const res = await axios.post(`http://localhost:5000/api/stores/${slug}/order`, {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerAddress: form.customerAddress,
        items,
        note: form.note
      })

      setOrderPlaced(res.data)
      toast.success('Order placed successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  const [simpleItems, setSimpleItems] = useState([{ name: '', quantity: 1 }])

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#08090E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center', color: 'rgba(240,238,233,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', opacity: 0.5 }}><Icons.Spinner /></div>
        <p>Loading store...</p>
      </div>
    </div>
  )

  if (error || !store) return (
    <div style={{ minHeight: '100vh', background: '#08090E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center', color: 'rgba(240,238,233,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#F87171' }}><Icons.AlertCircle /></div>
        <p style={{ fontSize: '16px', color: '#F0EEE9' }}>Store not found</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '16px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 16px', color: 'rgba(240,238,233,0.5)', cursor: 'pointer', fontFamily: 'inherit' }}>
          Back to Directory
        </button>
      </div>
    </div>
  )

  // Order placed success screen
  if (orderPlaced) return (
    <div style={{ minHeight: '100vh', background: '#08090E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', system-ui, sans-serif", padding: '24px' }}>
      <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '40px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#4ADE80' }}>
          <Icons.CheckCircle />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 400, color: '#F0EEE9', marginBottom: '8px' }}>
          Order Placed!
        </h2>
        <p style={{ color: 'rgba(240,238,233,0.45)', fontSize: '14px', marginBottom: '24px' }}>
          Your order has been received by {store.businessName}
        </p>
        <div style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.35)', marginBottom: '6px' }}>Order Number</p>
          <p style={{ fontSize: '22px', fontFamily: "'Playfair Display', serif", color: '#C9A96E' }}>{orderPlaced.orderNumber}</p>
        </div>
        <button onClick={() => navigate(orderPlaced.trackingUrl)} style={{
          width: '100%', background: 'linear-gradient(135deg, #C9A96E, #A07840)',
          border: 'none', borderRadius: '10px', padding: '13px',
          color: '#0D0D12', fontSize: '14px', fontWeight: 600,
          fontFamily: 'inherit', cursor: 'pointer', marginBottom: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}>
          <Icons.Truck /> Track My Order
        </button>
        <button onClick={() => navigate('/')} style={{
          width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px', padding: '12px', color: 'rgba(240,238,233,0.5)',
          fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer',
        }}>
          Back to Directory
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#08090E', color: '#F0EEE9', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');
        .menu-item { transition: border-color 0.2s ease, transform 0.2s ease; }
        .menu-item:hover { border-color: rgba(201,169,110,0.25) !important; transform: translateY(-2px); }
        .add-btn { transition: all 0.2s ease; }
        .add-btn:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(201,169,110,0.3); }
        .inp-f { outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .inp-f:focus { border-color: #C9A96E !important; box-shadow: 0 0 0 3px rgba(201,169,110,0.12); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease; }
      `}</style>

      {/* Navbar */}
      <nav style={{ background: '#0F111A', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,238,233,0.4)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontFamily: 'inherit', transition: 'color 0.2s ease' }}
          onMouseEnter={e => e.currentTarget.style.color = '#C9A96E'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,238,233,0.4)'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>
          All Stores
        </button>
        <Icons.WordMark size={0.55} />
        {store.storeType === 'catalogue' && cart.length > 0 && (
          <button onClick={() => setShowForm(true)} style={{ background: 'linear-gradient(135deg, #C9A96E, #A07840)', border: 'none', borderRadius: '8px', padding: '8px 16px', color: '#0D0D12', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icons.Package /> Cart ({cart.length})
          </button>
        )}
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Store Header */}
        <div className="fade-up" style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A96E', flexShrink: 0 }}>
              <Icons.Package />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 400, marginBottom: '6px' }}>{store.businessName}</h1>
              <p style={{ color: 'rgba(240,238,233,0.45)', fontSize: '14px', marginBottom: '12px', lineHeight: 1.6 }}>{store.storeDescription}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(201,169,110,0.1)', color: '#C9A96E', border: '1px solid rgba(201,169,110,0.2)' }}>{store.storeCategory}</span>
                {store.storeAddress && (
                  <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', color: 'rgba(240,238,233,0.4)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icons.MapPin /> {store.storeAddress}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SIMPLE ORDER FORM */}
        {store.storeType === 'simple' && (
          <div className="fade-up" style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '26px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 400, color: '#C9A96E', marginBottom: '20px' }}>Place Your Order</h2>
            <form onSubmit={handlePlaceOrder}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                {[
                  { ph: 'Your name', key: 'customerName' },
                  { ph: 'Phone number', key: 'customerPhone' },
                ].map(f => (
                  <input key={f.key} className="inp-f" type="text" placeholder={f.ph}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required
                    style={{ background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '11px 14px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit', width: '100%' }} />
                ))}
                <input className="inp-f" type="text" placeholder="Delivery address" style={{ gridColumn: 'span 2', background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '11px 14px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit', width: '100%' }}
                  value={form.customerAddress} onChange={e => setForm({ ...form, customerAddress: e.target.value })} required />
              </div>

              <p style={{ fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.35)', marginBottom: '8px' }}>Items</p>
              {simpleItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input className="inp-f" type="text" placeholder="Item name"
                    value={item.name} onChange={e => { const items = [...simpleItems]; items[idx].name = e.target.value; setSimpleItems(items) }} required
                    style={{ flex: 1, background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '10px 14px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit' }} />
                  <input className="inp-f" type="number" min="1" placeholder="Qty"
                    value={item.quantity} onChange={e => { const items = [...simpleItems]; items[idx].quantity = parseInt(e.target.value); setSimpleItems(items) }}
                    style={{ width: '72px', background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '10px 12px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit', textAlign: 'center' }} />
                  {simpleItems.length > 1 && (
                    <button type="button" onClick={() => setSimpleItems(simpleItems.filter((_, i) => i !== idx))}
                      style={{ background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: '10px', padding: '10px 12px', color: '#F87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Icons.Trash />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setSimpleItems([...simpleItems, { name: '', quantity: 1 }])}
                style={{ background: 'none', border: '1px dashed rgba(201,169,110,0.3)', borderRadius: '8px', padding: '7px 14px', color: '#C9A96E', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', transition: 'all 0.2s ease' }}>
                <Icons.Plus /> Add Item
              </button>

              <textarea className="inp-f" placeholder="Any special instructions? (optional)"
                value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                rows={3} style={{ width: '100%', background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '11px 14px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit', resize: 'none', marginBottom: '16px' }} />

              <button type="submit" disabled={placing} style={{ background: 'linear-gradient(135deg, #C9A96E, #A07840)', border: 'none', borderRadius: '10px', padding: '13px 28px', color: '#0D0D12', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.25s ease', opacity: placing ? 0.6 : 1 }}>
                <Icons.Truck /> {placing ? 'Placing order...' : 'Place Order'}
              </button>
            </form>
          </div>
        )}

        {/* CATALOGUE */}
        {store.storeType === 'catalogue' && (
          <div className="fade-up">
            {store.catalogue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(240,238,233,0.4)', background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
                <p>No items in catalogue yet</p>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 400, marginBottom: '16px' }}>Menu</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  {store.catalogue.filter(i => i.available).map(item => (
                    <div key={item._id} className="menu-item" style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>{item.name}</p>
                          {item.description && <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.4)' }}>{item.description}</p>}
                        </div>
                        <p style={{ fontSize: '15px', fontWeight: 600, color: '#C9A96E', marginLeft: '12px', flexShrink: 0 }}>₹{item.price}</p>
                      </div>
                      {cart.find(c => c._id === item._id) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button onClick={() => updateQty(item._id, cart.find(c => c._id === item._id).quantity - 1)}
                            style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', color: '#C9A96E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>−</button>
                          <span style={{ fontSize: '14px', fontWeight: 500 }}>{cart.find(c => c._id === item._id).quantity}</span>
                          <button onClick={() => updateQty(item._id, cart.find(c => c._id === item._id).quantity + 1)}
                            style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', color: '#C9A96E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>+</button>
                        </div>
                      ) : (
                        <button className="add-btn" onClick={() => addToCart(item)}
                          style={{ background: 'linear-gradient(135deg, #C9A96E, #A07840)', border: 'none', borderRadius: '8px', padding: '7px 16px', color: '#0D0D12', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                          Add
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Cart summary */}
                {cart.length > 0 && (
                  <div style={{ background: '#0F111A', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.4)', marginBottom: '12px' }}>Your Cart</p>
                    {cart.map(item => (
                      <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <p style={{ fontSize: '13px' }}>{item.name} ×{item.quantity}</p>
                        <p style={{ fontSize: '13px', color: '#C9A96E' }}>₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600 }}>Total</p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#C9A96E' }}>₹{totalPrice}</p>
                    </div>
                    <button onClick={() => setShowForm(true)} style={{ width: '100%', marginTop: '14px', background: 'linear-gradient(135deg, #C9A96E, #A07840)', border: 'none', borderRadius: '10px', padding: '12px', color: '#0D0D12', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                      Proceed to Order
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* REQUEST FORM */}
        {store.storeType === 'request' && (
          <div className="fade-up" style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '26px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 400, color: '#C9A96E', marginBottom: '20px' }}>Request Service</h2>
            <form onSubmit={handlePlaceOrder}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                {[{ ph: 'Your name', key: 'customerName' }, { ph: 'Phone number', key: 'customerPhone' }].map(f => (
                  <input key={f.key} className="inp-f" type="text" placeholder={f.ph}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required
                    style={{ background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '11px 14px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit', width: '100%' }} />
                ))}
              </div>
              <input className="inp-f" type="text" placeholder="Your address" style={{ width: '100%', background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '11px 14px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit', marginBottom: '10px' }}
                value={form.customerAddress} onChange={e => setForm({ ...form, customerAddress: e.target.value })} required />
              <textarea className="inp-f" placeholder="Describe what you need in detail..."
                value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} required
                rows={4} style={{ width: '100%', background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '11px 14px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit', resize: 'none', marginBottom: '16px' }} />
              <button type="submit" disabled={placing} style={{ background: 'linear-gradient(135deg, #C9A96E, #A07840)', border: 'none', borderRadius: '10px', padding: '13px 28px', color: '#0D0D12', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', opacity: placing ? 0.6 : 1 }}>
                {placing ? 'Sending request...' : 'Send Request'}
              </button>
            </form>
          </div>
        )}

        {/* Catalogue checkout form overlay */}
        {showForm && store.storeType === 'catalogue' && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }}>
            <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '440px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#C9A96E', fontWeight: 400 }}>Delivery Details</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,238,233,0.4)', display: 'flex', alignItems: 'center' }}><Icons.Close /></button>
              </div>
              <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[{ ph: 'Your name', key: 'customerName' }, { ph: 'Phone number', key: 'customerPhone' }, { ph: 'Delivery address', key: 'customerAddress' }].map(f => (
                  <input key={f.key} className="inp-f" type="text" placeholder={f.ph}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required
                    style={{ background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '11px 14px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit', width: '100%' }} />
                ))}
                <button type="submit" disabled={placing} style={{ background: 'linear-gradient(135deg, #C9A96E, #A07840)', border: 'none', borderRadius: '10px', padding: '13px', color: '#0D0D12', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', marginTop: '6px', opacity: placing ? 0.6 : 1 }}>
                  {placing ? 'Placing order...' : `Place Order · ₹${totalPrice}`}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StorePage