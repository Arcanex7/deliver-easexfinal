import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Icons } from '../components/Icons'

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: 'business', phone: '',
    businessName: '', vehicleType: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.user.role)
      localStorage.setItem('userId', res.data.user.id)
      localStorage.setItem('name', res.data.user.name)
      toast.success('Account created!')
      if (res.data.user.role === 'business') navigate('/business')
      else if (res.data.user.role === 'agent') navigate('/agent')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name',     ph: 'Full name',       Icon: Icons.User,     type: 'text'     },
    { key: 'email',    ph: 'Email address',   Icon: Icons.Mail,     type: 'email'    },
    { key: 'phone',    ph: 'Phone number',    Icon: Icons.Phone,    type: 'tel'      },
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
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.06), transparent 70%)', bottom: '-50px', right: '-50px', pointerEvents: 'none' }} />

        <div style={{ marginBottom: '40px' }}><Icons.WordMark size={0.65} /></div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 400, color: '#F0EEE9', lineHeight: 1.3, marginBottom: '16px' }}>
          Start managing<br />
          <span style={{ color: '#C9A96E', fontStyle: 'italic' }}>deliveries today.</span>
        </h1>
        <p style={{ color: 'rgba(240,238,233,0.4)', fontSize: '14px', lineHeight: 1.7, maxWidth: '340px', marginBottom: '48px' }}>
          Join businesses that use DeliverEase to track every delivery in real time.
        </p>

        {/* Role info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { role: 'Business Owner', desc: 'Create orders, assign agents, view analytics' },
            { role: 'Delivery Agent', desc: 'Receive assignments, update delivery status' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#C9A96E', marginTop: '6px', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#F0EEE9', marginBottom: '2px' }}>{r.role}</p>
                <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.35)' }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width: '480px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '50px 52px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 400, color: '#F0EEE9', marginBottom: '6px' }}>
            Create account
          </h2>
          <p style={{ color: 'rgba(240,238,233,0.4)', fontSize: '13px' }}>Fill in your details to get started</p>
        </div>

        {/* Role Toggle */}
        <div style={{ display: 'flex', background: '#0C0E16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '3px', marginBottom: '18px' }}>
          {['business', 'agent'].map(r => (
            <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
              style={{
                flex: 1, padding: '9px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontSize: '13px', fontFamily: 'inherit', fontWeight: 500, transition: 'all 0.2s ease',
                background: form.role === r ? 'linear-gradient(135deg, #C9A96E, #A07840)' : 'none',
                color: form.role === r ? '#0D0D12' : 'rgba(240,238,233,0.4)',
              }}>
              {r === 'business' ? 'Business Owner' : 'Delivery Agent'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {fields.map(f => (
            <div key={f.key} className="input-wrap">
              <span className="input-icon"><f.Icon /></span>
              <input className="inp" type={f.type} placeholder={f.ph}
                value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required />
            </div>
          ))}

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

          {form.role === 'business' && (
            <div className="input-wrap">
              <span className="input-icon"><Icons.Building /></span>
              <input className="inp" type="text" placeholder="Business name"
                value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} />
            </div>
          )}

          {form.role === 'agent' && (
            <div className="input-wrap">
              <span className="input-icon"><Icons.Bike /></span>
              <input className="inp" type="text" placeholder="Vehicle type (bike / car / van)"
                value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })} />
            </div>
          )}

          <button type="submit" className="btn-gold" disabled={loading} style={{ marginTop: '8px', width: '100%' }}>
            {loading ? 'Creating account...' : <><span>Create account</span><Icons.Arrow /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(240,238,233,0.4)', fontSize: '13px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#C9A96E', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register