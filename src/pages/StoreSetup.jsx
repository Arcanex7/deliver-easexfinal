import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Icons } from '../components/Icons'

const StoreSetup = () => {
  const [form, setForm] = useState({
    storeSlug: '', storeType: 'simple',
    storeDescription: '', storeAddress: '', storeCategory: 'General'
  })
  const [catalogue, setCatalogue] = useState([])
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: 'General' })
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('profile')
  const navigate = useNavigate()

  const categories = ['General', 'Pharmacy', 'Grocery', 'Food', 'Laundry', 'Electronics', 'Clothing']

  const handleSetup = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/stores/setup', form)
      toast.success('Store setup saved!')
      navigate('/business')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/stores/catalogue', newItem)
      setCatalogue(res.data.catalogue)
      setNewItem({ name: '', description: '', price: '', category: 'General' })
      toast.success('Item added!')
    } catch (err) {
      toast.error('Failed to add item')
    }
  }

  const handleDeleteItem = async (itemId) => {
    try {
      const res = await api.delete(`/stores/catalogue/${itemId}`)
      setCatalogue(res.data.catalogue)
      toast.success('Item removed')
    } catch (err) {
      toast.error('Failed to remove item')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08090E', color: '#F0EEE9', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');
        .inp-s { outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .inp-s:focus { border-color: #C9A96E !important; box-shadow: 0 0 0 3px rgba(201,169,110,0.12); }
        .tab-btn { transition: all 0.2s ease; cursor: pointer; }
      `}</style>

      {/* Navbar */}
      <nav style={{ background: '#0F111A', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icons.Logo />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#C9A96E' }}>Deliver<span style={{ fontStyle: 'italic' }}>Ease</span></span>
        </div>
        <button onClick={() => navigate('/business')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 16px', color: 'rgba(240,238,233,0.5)', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 400, marginBottom: '6px' }}>Store Setup</h1>
          <p style={{ color: 'rgba(240,238,233,0.4)', fontSize: '13px' }}>Configure your public store page for customers</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '3px', marginBottom: '24px' }}>
          {[{ key: 'profile', label: 'Store Profile' }, { key: 'catalogue', label: 'Catalogue' }].map(t => (
            <button key={t.key} className="tab-btn" onClick={() => setTab(t.key)} style={{
              flex: 1, padding: '9px', border: 'none', borderRadius: '8px',
              background: tab === t.key ? 'linear-gradient(135deg, #C9A96E, #A07840)' : 'none',
              color: tab === t.key ? '#0D0D12' : 'rgba(240,238,233,0.4)',
              fontSize: '13px', fontWeight: tab === t.key ? 600 : 400, fontFamily: 'inherit',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '26px' }}>
            <form onSubmit={handleSetup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.35)', marginBottom: '6px' }}>Store URL</p>
                <div style={{ display: 'flex', alignItems: 'center', background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
                  <span style={{ padding: '11px 12px', color: 'rgba(240,238,233,0.25)', fontSize: '13px', borderRight: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>deliverease.app/store/</span>
                  <input className="inp-s" type="text" placeholder="your-store-name"
                    value={form.storeSlug} onChange={e => setForm({ ...form, storeSlug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} required
                    style={{ flex: 1, background: 'none', border: 'none', padding: '11px 14px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
                </div>
              </div>

              <div>
                <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.35)', marginBottom: '6px' }}>Store Type</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                  {[
                    { key: 'simple', label: 'Order Form', desc: 'Customer fills items manually' },
                    { key: 'catalogue', label: 'Menu', desc: 'Customer picks from your menu' },
                    { key: 'request', label: 'Request', desc: 'Customer describes their need' },
                  ].map(t => (
                    <div key={t.key} onClick={() => setForm({ ...form, storeType: t.key })}
                      style={{ padding: '14px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease', border: form.storeType === t.key ? '1px solid #C9A96E' : '1px solid rgba(255,255,255,0.07)', background: form.storeType === t.key ? 'rgba(201,169,110,0.06)' : 'rgba(255,255,255,0.02)' }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: form.storeType === t.key ? '#C9A96E' : '#F0EEE9', marginBottom: '3px' }}>{t.label}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.35)' }}>{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.35)', marginBottom: '6px' }}>Category</p>
                <select className="inp-s" value={form.storeCategory} onChange={e => setForm({ ...form, storeCategory: e.target.value })}
                  style={{ width: '100%', background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '11px 14px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit' }}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <input className="inp-s" type="text" placeholder="Store address"
                value={form.storeAddress} onChange={e => setForm({ ...form, storeAddress: e.target.value })}
                style={{ background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '11px 14px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit' }} />

              <textarea className="inp-s" placeholder="Store description — tell customers what you offer"
                value={form.storeDescription} onChange={e => setForm({ ...form, storeDescription: e.target.value })}
                rows={3} style={{ background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '11px 14px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit', resize: 'none' }} />

              <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #C9A96E, #A07840)', border: 'none', borderRadius: '10px', padding: '13px', color: '#0D0D12', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', marginTop: '6px', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Saving...' : 'Save Store Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Catalogue Tab */}
        {tab === 'catalogue' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '24px' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', color: '#C9A96E', marginBottom: '16px', fontWeight: 400 }}>Add Item</h3>
              <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input className="inp-s" type="text" placeholder="Item name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required
                  style={{ background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '11px 14px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit' }} />
                <input className="inp-s" type="number" placeholder="Price (₹)" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} required
                  style={{ background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '11px 14px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit' }} />
                <input className="inp-s" type="text" placeholder="Description (optional)" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  style={{ gridColumn: 'span 2', background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '11px 14px', color: '#F0EEE9', fontSize: '13px', fontFamily: 'inherit' }} />
                <button type="submit" style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, #C9A96E, #A07840)', border: 'none', borderRadius: '10px', padding: '12px', color: '#0D0D12', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Icons.Plus /> Add to Catalogue
                </button>
              </form>
            </div>

            {catalogue.length > 0 && (
              <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '24px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', marginBottom: '16px', fontWeight: 400 }}>Your Catalogue</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {catalogue.map(item => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500 }}>{item.name}</p>
                        {item.description && <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.4)', marginTop: '1px' }}>{item.description}</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#C9A96E' }}>₹{item.price}</p>
                        <button onClick={() => handleDeleteItem(item._id)} style={{ background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: '8px', padding: '6px 8px', color: '#F87171', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s ease' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StoreSetup