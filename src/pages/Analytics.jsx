import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import api from '../services/api'
import { Icons } from '../components/Icons'

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement,
  Title, Tooltip, Legend, Filler
)

const Analytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const navigate = useNavigate()
  const name = localStorage.getItem('name')

  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode)
  }, [darkMode])

  useEffect(() => { fetchAnalytics() }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/orders/analytics')
      setData(res.data)
    } catch (err) {
      console.log('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#13161F',
        borderColor: 'rgba(201,169,110,0.2)',
        borderWidth: 1,
        titleColor: '#F0EEE9',
        bodyColor: 'rgba(240,238,233,0.6)',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: 'rgba(240,238,233,0.4)', font: { size: 11 } },
        border: { color: 'rgba(255,255,255,0.06)' }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: 'rgba(240,238,233,0.4)', font: { size: 11 } },
        border: { color: 'rgba(255,255,255,0.06)' },
        beginAtZero: true
      }
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center', color: 'var(--text-sub)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', opacity: 0.5 }}><Icons.Spinner /></div>
        <p>Loading analytics...</p>
      </div>
    </div>
  )

  if (!data) return null

  // Orders per day chart
  const ordersPerDayData = {
    labels: data.ordersPerDay.map(d => {
      const date = new Date(d.date)
      return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })
    }),
    datasets: [{
      data: data.ordersPerDay.map(d => d.count),
      backgroundColor: 'rgba(201,169,110,0.15)',
      borderColor: '#C9A96E',
      borderWidth: 2,
      borderRadius: 6,
      hoverBackgroundColor: 'rgba(201,169,110,0.3)',
    }]
  }

  // Status breakdown doughnut
  const statusData = {
    labels: ['Pending', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Failed'],
    datasets: [{
      data: [
        data.statusBreakdown.pending,
        data.statusBreakdown.assigned,
        data.statusBreakdown.picked_up,
        data.statusBreakdown.in_transit,
        data.statusBreakdown.delivered,
        data.statusBreakdown.failed,
      ],
      backgroundColor: [
        'rgba(234,179,8,0.7)',
        'rgba(59,130,246,0.7)',
        'rgba(168,85,247,0.7)',
        'rgba(249,115,22,0.7)',
        'rgba(34,197,94,0.7)',
        'rgba(239,68,68,0.7)',
      ],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  }

  // Agent performance chart
  const agentData = {
    labels: data.agentPerformance.map(a => a.name),
    datasets: [
      {
        label: 'Total',
        data: data.agentPerformance.map(a => a.total),
        backgroundColor: 'rgba(201,169,110,0.2)',
        borderColor: '#C9A96E',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Delivered',
        data: data.agentPerformance.map(a => a.delivered),
        backgroundColor: 'rgba(34,197,94,0.2)',
        borderColor: '#4ADE80',
        borderWidth: 2,
        borderRadius: 6,
      }
    ]
  }

  const agentChartOptions = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      legend: {
        display: true,
        labels: {
          color: 'rgba(240,238,233,0.5)',
          font: { size: 11 },
          boxWidth: 10,
          boxHeight: 10,
        }
      }
    }
  }

  const kpis = [
    { label: 'Total Orders',     value: data.totalOrders,                                   color: '#C9A96E', Icon: Icons.Package  },
    { label: 'This Week',        value: data.thisWeekOrders,                                color: '#60A5FA', Icon: Icons.Clock    },
    { label: 'Success Rate',     value: `${data.deliverySuccessRate}%`,                     color: '#4ADE80', Icon: Icons.Check    },
    { label: 'Avg Delivery',     value: `${data.avgDeliveryTime}m`,                         color: '#FB923C', Icon: Icons.Truck    },
    { label: 'Weekly Growth',    value: `${data.weeklyGrowth > 0 ? '+' : ''}${data.weeklyGrowth}%`, color: data.weeklyGrowth >= 0 ? '#4ADE80' : '#F87171', Icon: Icons.Arrow },
    { label: 'Active Agents',    value: data.agentPerformance.length,                       color: '#C084FC', Icon: Icons.User     },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif", transition: 'all 0.4s ease' }}>

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icons.Logo />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 500, color: 'var(--gold)' }}>
            Deliver<span style={{ fontStyle: 'italic' }}>Ease</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/business')} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 14px', color: 'var(--text-sub)', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            ← Dashboard
          </button>
          <button onClick={() => setDarkMode(!darkMode)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-icon)', display: 'flex', alignItems: 'center', transition: 'transform 0.3s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'rotate(15deg) scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            {darkMode ? <Icons.Sun /> : <Icons.Moon />}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 400, marginBottom: '4px' }}>Analytics</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '13px' }}>Business performance overview</p>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '12px', marginBottom: '24px' }}>
          {kpis.map((k, i) => (
            <div key={i} className="card hover-lift" style={{ cursor: 'default', padding: '16px 18px' }}>
              <div style={{ color: k.color, marginBottom: '8px' }}><k.Icon /></div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: k.color, lineHeight: 1, marginBottom: '5px', textShadow: `0 0 20px ${k.color}40` }}>{k.value}</div>
              <div style={{ color: 'var(--text-sub)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* Orders per day */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>Orders — Last 7 Days</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Daily order volume</p>
            </div>
            <div style={{ height: '200px' }}>
              <Bar data={ordersPerDayData} options={chartDefaults} />
            </div>
          </div>

          {/* Status Doughnut */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>Order Status</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Breakdown by status</p>
            </div>
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut data={statusData} options={{
                ...chartDefaults,
                scales: undefined,
                cutout: '70%',
                plugins: {
                  ...chartDefaults.plugins,
                  legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                      color: 'rgba(240,238,233,0.5)',
                      font: { size: 10 },
                      boxWidth: 8, boxHeight: 8,
                      padding: 8,
                    }
                  }
                }
              }} />
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Agent Performance */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>Agent Performance</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Total vs delivered orders per agent</p>
            </div>
            {data.agentPerformance.length === 0 ? (
              <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', fontSize: '13px' }}>
                No agent data yet
              </div>
            ) : (
              <div style={{ height: '180px' }}>
                <Bar data={agentData} options={agentChartOptions} />
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>Weekly Summary</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-sub)' }}>This week vs last week</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'This week', value: data.thisWeekOrders, color: '#C9A96E', bar: data.thisWeekOrders },
                { label: 'Last week', value: data.lastWeekOrders, color: 'rgba(240,238,233,0.2)', bar: data.lastWeekOrders },
              ].map((row, i) => {
                const max = Math.max(data.thisWeekOrders, data.lastWeekOrders, 1)
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <p style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{row.label}</p>
                      <p style={{ fontSize: '12px', fontWeight: 500 }}>{row.value} orders</p>
                    </div>
                    <div style={{ height: '6px', background: 'var(--surface-alt)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(row.bar / max) * 100}%`, background: row.color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                )
              })}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Weekly growth</p>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: data.weeklyGrowth >= 0 ? '#4ADE80' : '#F87171' }}>
                    {data.weeklyGrowth > 0 ? '+' : ''}{data.weeklyGrowth}%
                  </p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Success rate</p>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#4ADE80' }}>{data.deliverySuccessRate}%</p>
                </div>
                <div style={{ height: '6px', background: 'var(--surface-alt)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${data.deliverySuccessRate}%`, background: 'linear-gradient(90deg, #4ADE80, #22C55E)', borderRadius: '3px', transition: 'width 0.8s ease' }} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Avg delivery time</p>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#FB923C' }}>
                    {data.avgDeliveryTime > 0 ? `${data.avgDeliveryTime} min` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics