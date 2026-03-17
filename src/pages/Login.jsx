import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Icons } from '../components/Icons'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.user.role)
      localStorage.setItem('userId', res.data.user.id)
      localStorage.setItem('name', res.data.user.name)
      toast.success('Welcome back!')
      if (res.data.user.role === 'business') navigate('/business')
      else if (res.data.user.role === 'agent') navigate('/agent')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { title: 'Real-time tracking', sub: 'Live delivery updates via Socket.io' },
    { title: 'Role-based access', sub: 'Business, agent and customer views' },
    { title: 'Smart assignment', sub: 'Assign agents with one click' },
    { title: 'Full analytics', sub: 'Track performance and delivery times' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#08090E', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Left Panel */}
      <div style={{
        flex: 1, background: '#0F111A',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.06), transparent 70%)', top: '-50px', left: '-50px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.04), transparent 70%)', bottom: '50px', right: '-50px', pointerEvents: 'none' }} />

        <div style={{ marginBottom: '48px' }}>
          <div style={{ marginBottom: '24px' }}><Icons.WordMark size={0.65} /></div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 400, color: '#F0EEE9', lineHeight: 1.2, marginBottom: '12px' }}>
            Deliver smarter.<br />
            <span style={{ color: '#C9A96E', fontStyle: 'italic' }}>Track better.</span>
          </h1>
          <p style={{ color: 'rgba(240,238,233,0.4)', fontSize: '14px', lineHeight: 1.7, maxWidth: '340px' }}>
            A complete last-mile delivery management platform built for modern businesses.
          </p>
        </div>

        <div>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '22px', alignItems: 'flex-start' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#C9A96E', marginTop: '7px', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#F0EEE9', marginBottom: '2px' }}>{f.title}</p>
                <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.4)' }}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.2)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Built for — Pharmacies · Tiffin Services · Local Stores
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width: '460px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 52px' }}>
        <div style={{ marginBottom: '36px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 400, color: '#F0EEE9', marginBottom: '6px' }}>
            Sign in
          </h2>
          <p style={{ color: 'rgba(240,238,233,0.4)', fontSize: '13px' }}>
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="input-wrap">
            <span className="input-icon"><Icons.Mail /></span>
            <input className="inp" type="email" placeholder="Email address"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="input-wrap">
            <span className="input-icon"><Icons.Lock /></span>
            <input className="inp" type={showPass ? 'text' : 'password'} placeholder="Password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
              style={{ paddingRight: '48px' }} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,238,233,0.3)', display: 'flex', alignItems: 'center', transition: 'color 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = '#C9A96E'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,238,233,0.3)'}>
              {showPass ? <Icons.EyeOff /> : <Icons.Eye />}
            </button>
          </div>

          <button type="submit" className="btn-gold" disabled={loading} style={{ marginTop: '8px', width: '100%' }}>
            {loading ? 'Signing in...' : <><span>Sign in</span><Icons.Arrow /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(240,238,233,0.4)', fontSize: '13px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#C9A96E', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Create one
          </Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: '48px', color: 'rgba(240,238,233,0.15)', fontSize: '11px', letterSpacing: '1px' }}>
          DELIVEREASE · SECURE · RELIABLE
        </p>
      </div>
    </div>
  )
}

export default Login