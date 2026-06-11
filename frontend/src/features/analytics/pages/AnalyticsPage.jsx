import { useEffect, useState } from 'react'
import api from '../../shared/services/api'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { TrendingUp, FileText, IndianRupee, Star, BarChart3 } from 'lucide-react'
import './AnalyticsPage.css'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6']

const INR_K = (n) => {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L'
  if (n >= 1000)   return '₹' + (n / 1000).toFixed(0) + 'K'
  return '₹' + n
}

const darkTooltipStyle = {
  contentStyle: {
    background: '#0f1421',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 10,
    color: '#e2e8f0',
    fontSize: 12,
  },
  itemStyle: { color: '#94a3b8' },
  labelStyle: { color: '#f8fafc', fontWeight: 700 },
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3 className="chart-title">{title}</h3>
        {subtitle && <p className="chart-sub">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="kpi-card" style={{ '--c': color }}>
      <div className="kpi-icon"><Icon size={18} /></div>
      <div>
        <p className="kpi-value">{value}</p>
        <p className="kpi-label">{label}</p>
        {sub && <p className="kpi-sub">{sub}</p>}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics')
      .then(({ data: res }) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loader"><span className="spinner" /></div>
  if (!data)   return <div className="analytics-page"><p style={{ color: 'var(--text-muted)' }}>Could not load analytics.</p></div>

  const trendMap = {}
  data.approvalTrends?.forEach(item => {
    if (!trendMap[item.month]) trendMap[item.month] = { month: item.month }
    trendMap[item.month][item.status] = item.count
  })
  const trendData = Object.values(trendMap).sort((a, b) => a.month.localeCompare(b.month))

  const loanBuckets = (data.loanAmountDistribution || []).map(b => ({
    name: INR_K(Number(b.bucket.replace(/[^0-9]/g, ''))),
    count: b.count,
  }))

  const creditBuckets = (data.creditScoreDistribution || []).map(b => ({
    name: b.bucket, count: b.count,
  }))

  const pieData = [
    { name: 'Approved', value: data.approvedApplications },
    { name: 'Rejected', value: data.rejectedApplications },
    { name: 'Pending',  value: data.totalApplications - data.approvedApplications - data.rejectedApplications },
  ].filter(d => d.value > 0)

  const axisStyle = { fill: '#475569', fontSize: 11 }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="admin-eyebrow">
          <BarChart3 size={12} />
          <span>Insights</span>
        </div>
        <h1>Analytics Dashboard</h1>
        <p className="admin-subtitle">System-wide loan performance & trends</p>
      </div>

      {/* ── KPIs ── */}
      <div className="kpi-grid">
        <KpiCard
          icon={TrendingUp} label="Approval Rate"
          value={`${data.approvalRate}%`}
          sub="Model-driven decisions"
          color="#10b981"
        />
        <KpiCard
          icon={FileText} label="Total Applications"
          value={data.totalApplications}
          sub={`${data.approvedApplications} approved`}
          color="#6366f1"
        />
        <KpiCard
          icon={IndianRupee} label="Avg. Loan Amount"
          value={'₹' + Number(data.averageLoanAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          sub="Per application"
          color="#8b5cf6"
        />
        <KpiCard
          icon={Star} label="Avg. Credit Score"
          value={data.averageCreditScore}
          sub="Portfolio quality"
          color="#f59e0b"
        />
      </div>

      {/* ── Charts ── */}
      <div className="charts-grid">

        <ChartCard title="Approval Distribution" subtitle="Approved vs Rejected">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...darkTooltipStyle} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Applications" subtitle="Volume over time">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.monthlyTrends || []} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip {...darkTooltipStyle} />
              <Bar dataKey="applications" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Approval vs Rejection Trends" subtitle="Month-over-month">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip {...darkTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
              <Line type="monotone" dataKey="rejected" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4, fill: '#f43f5e' }} />
              <Line type="monotone" dataKey="pending"  stroke="#f59e0b" strokeWidth={2}   dot={{ r: 3, fill: '#f59e0b' }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Loan Amount Distribution" subtitle="₹ brackets">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={loanBuckets} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={axisStyle} width={64} axisLine={false} tickLine={false} />
              <Tooltip {...darkTooltipStyle} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Credit Score Distribution" subtitle="Applicant creditworthiness">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={creditBuckets} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip {...darkTooltipStyle} />
              <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  )
}
