import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Icons } from '../components/Icons'

const categoryIcons = {
  'Pharmacy':  Icons.CheckCircle,
  'Grocery':   Icons.Package,
  'Food':      Icons.Clock,
  'Laundry':   Icons.Truck,
  'General':   Icons.Package,
}

const StoreDirectory = () => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const navigate = useNavigate()

  useEffect(() => { fetchStores() }, [])

  const fetchStores = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stores')
      setStores(res.data.stores)
    } catch (err) {
      console.log('Failed to fetch stores')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', ...new Set(stores.map(s => s.storeCategory))]

  const filtered = stores.filter(s => {
    const matchSearch = s.businessName.toLowerCase().includes(search.toLowerCase()) ||
      s.storeDescription.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory === 'All' || s.storeCategory === selectedCategory
    return matchSearch && matchCategory
  })

  const storeTypeLabel = (type) => ({
    simple: 'Order Form',
    catalogue: 'Menu Available',
    request: 'Request Service',
  }[type] || type)

  return (
    <div style={{ minHeight: '100vh', background: '#08090E', color: '#F0EEE9', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');
        .store-card { transition: transform 0.25s ease, border-color 0.25s ease; cursor: pointer; }
        .store-card:hover { transform: translateY(-4px); border-color: rgba(201,169,110,0.3) !important; }
        .search-inp { outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .search-inp:focus { border-color: #C9A96E !important; box-shadow: 0 0 0 3px rgba(201,169,110,0.12); }
        .cat-btn { transition: all 0.2s ease; cursor: pointer; }
        .cat-btn:hover { border-color: #C9A96E !important; color: #C9A96E !important; }
        .auth-btn { transition: all 0.2s ease; }
        .auth-btn:hover { opacity: 0.8; transform: translateY(-1px); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background: '#0F111A', borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '0 32px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Icons.WordMark size={0.65} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="auth-btn" onClick={() => navigate('/login')} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', padding: '8px 16px',
            color: 'rgba(240,238,233,0.6)', fontSize: '13px',
            fontFamily: 'inherit', cursor: 'pointer',
          }}>
            Sign in
          </button>
          <button className="auth-btn" onClick={() => navigate('/register')} style={{
            background: 'linear-gradient(135deg, #C9A96E, #A07840)',
            border: 'none', borderRadius: '8px', padding: '8px 16px',
            color: '#0D0D12', fontSize: '13px', fontWeight: 600,
            fontFamily: 'inherit', cursor: 'pointer',
          }}>
            Register Business
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '64px 24px 48px', position: 'relative' }}>
        <div style={{ position: 'absolute', width: '600px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.05), transparent 70%)', top: 0, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
        <p style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.4)', marginBottom: '16px' }}>
          Local Delivery Network
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '42px', fontWeight: 400, lineHeight: 1.2, marginBottom: '16px' }}>
          Order from local<br />
          <span style={{ color: '#C9A96E', fontStyle: 'italic' }}>businesses near you</span>
        </h1>
        <p style={{ color: 'rgba(240,238,233,0.45)', fontSize: '15px', maxWidth: '480px', margin: '0 auto 32px' }}>
          Browse pharmacies, grocery stores, tiffin services and more. Get anything delivered to your door.
        </p>

        {/* Search */}
        <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(240,238,233,0.3)', display: 'flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input className="search-inp" type="text" placeholder="Search stores..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', background: '#0F111A',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '14px 14px 14px 42px',
              color: '#F0EEE9', fontSize: '14px', fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 60px' }}>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {categories.map(cat => (
            <button key={cat} className="cat-btn" onClick={() => setSelectedCategory(cat)} style={{
              background: selectedCategory === cat ? 'linear-gradient(135deg, #C9A96E, #A07840)' : 'none',
              border: selectedCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px', padding: '6px 16px',
              color: selectedCategory === cat ? '#0D0D12' : 'rgba(240,238,233,0.5)',
              fontSize: '12px', fontWeight: selectedCategory === cat ? 600 : 400,
              fontFamily: 'inherit',
            }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Stores Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(240,238,233,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', opacity: 0.5 }}><Icons.Spinner /></div>
            <p style={{ fontSize: '14px' }}>Loading stores...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(240,238,233,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.3, marginBottom: '14px' }}><Icons.EmptyBox /></div>
            <p style={{ fontSize: '15px', color: '#F0EEE9' }}>No stores found</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Try a different search or category</p>
          </div>
        ) : (
          <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {filtered.map(store => {
              const CatIcon = categoryIcons[store.storeCategory] || Icons.Package
              return (
                <div key={store._id} className="store-card"
                  onClick={() => navigate(`/store/${store.storeSlug}`)}
                  style={{
                    background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px', padding: '22px', position: 'relative',
                    overflow: 'hidden',
                  }}>
                  {/* Category icon */}
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A96E', marginBottom: '14px' }}>
                    <CatIcon />
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{store.businessName}</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.4)', marginBottom: '12px', lineHeight: 1.5 }}>
                    {store.storeDescription || 'Local business'}
                  </p>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', letterSpacing: '0.5px', padding: '3px 9px', borderRadius: '20px', background: 'rgba(201,169,110,0.1)', color: '#C9A96E', border: '1px solid rgba(201,169,110,0.2)' }}>
                      {store.storeCategory}
                    </span>
                    <span style={{ fontSize: '10px', letterSpacing: '0.5px', padding: '3px 9px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', color: 'rgba(240,238,233,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {storeTypeLabel(store.storeType)}
                    </span>
                  </div>

                  {store.storeAddress && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: 'rgba(240,238,233,0.3)' }}><Icons.MapPin /></span>
                      <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.35)' }}>{store.storeAddress}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default StoreDirectory