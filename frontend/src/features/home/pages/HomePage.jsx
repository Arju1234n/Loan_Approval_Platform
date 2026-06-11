import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import api from '../../shared/services/api'
import { FileText, CheckCircle, XCircle, Clock, Brain, Plus, ArrowRight, Cpu, Zap } from 'lucide-react'
import './HomePage.css'

const INR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })

const ML_MODELS = [
  {
    name: 'Naive Bayes',
    accuracy: 88.42, precision: 89.58, recall: 71.67, f1: 79.63,
    active: true,
    desc: 'Gaussian probabilistic classifier',
    color: '#6366f1',
  },
  {
    name: 'Logistic Regression',
    accuracy: 87.37, precision: 84.62, recall: 73.33, f1: 78.57,
    active: false,
    desc: 'Linear boundary classifier',
    color: '#06b6d4',
  },
  {
    name: 'KNN (k=5)',
    accuracy: 78.95, precision: 69.23, recall: 60.00, f1: 64.29,
    active: false,
    desc: 'k-Nearest Neighbors',
    color: '#f59e0b',
  },
]

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ '--glow': color }}>
      <div className="stat-icon" style={{ background: color + '1a', color }}>
        <Icon size={20} />
      </div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  )
}

function statusClass(s) {
  if (s === 'approved')    return 'badge badge-green'
  if (s === 'rejected')    return 'badge badge-red'
  if (s === 'under_review') return 'badge badge-yellow'
  return 'badge badge-gray'
}

function MetricPill({ label, value, color }) {
  return (
    <div className="metric-pill">
      <span className="metric-pill-label">{label}</span>
      <span className="metric-pill-value" style={{ color }}>{value}%</span>
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const [apps, setApps]       = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/loans/my-applications')
      .then(({ data }) => setApps(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const total    = apps.length
  const approved = apps.filter(a => a.status === 'approved').length
  const rejected = apps.filter(a => a.status === 'rejected').length
  const pending  = apps.filter(a => a.status === 'pending' || a.status === 'under_review').length
  const recent   = apps.slice(0, 5)

  return (
    <div className="home-page">

      {/* ── Welcome Banner ── */}
      <div className="welcome-banner">
        <div className="welcome-left">
          <p className="welcome-eyebrow"><Cpu size={12} /> Live Dashboard</p>
          <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="welcome-sub">Track your loan applications and decisions in real-time.</p>
        </div>
        <Link to="/apply" className="apply-cta">
          <Plus size={16} /> Apply for Loan
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        <StatCard icon={FileText}    label="Total Applications" value={total}    color="#6366f1" />
        <StatCard icon={CheckCircle} label="Approved"           value={approved} color="#10b981" />
        <StatCard icon={XCircle}     label="Rejected"           value={rejected} color="#f43f5e" />
        <StatCard icon={Clock}       label="Pending"            value={pending}  color="#f59e0b" />
      </div>

      {/* ── ML Models Comparison ── */}
      <div className="ml-models-section">
        <div className="ml-models-header">
          <div className="ml-models-title-wrap">
            <Brain size={16} style={{ color: 'var(--brand-light)' }} />
            <span className="ml-models-title">Model Performance Comparison</span>
            <span className="ml-models-badge">Trained on 1,000 samples · 18 features</span>
          </div>
          <p className="ml-models-sub">
            3 models were trained and evaluated. The best performer is deployed for your applications.
          </p>
        </div>

        <div className="ml-models-grid">
          {ML_MODELS.map((m) => (
            <div key={m.name} className={`ml-model-card ${m.active ? 'active' : ''}`}
              style={{ '--mc': m.color }}>
              <div className="ml-card-top">
                <div className="ml-card-icon" style={{ background: m.color + '22', color: m.color }}>
                  <Brain size={16} />
                </div>
                <div className="ml-card-name-wrap">
                  <span className="ml-card-name">{m.name}</span>
                  {m.active && (
                    <span className="ml-active-tag">
                      <Zap size={10} /> Active
                    </span>
                  )}
                </div>
                <span className="ml-card-desc">{m.desc}</span>
              </div>

              <div className="ml-accuracy-row">
                <span className="ml-accuracy-label">Accuracy</span>
                <span className="ml-accuracy-val" style={{ color: m.color }}>{m.accuracy}%</span>
              </div>
              <div className="ml-bar-track">
                <div className="ml-bar-fill" style={{ width: `${m.accuracy}%`, background: m.color }} />
              </div>

              <div className="ml-pills">
                <MetricPill label="Precision" value={m.precision} color={m.color} />
                <MetricPill label="Recall"    value={m.recall}    color={m.color} />
                <MetricPill label="F1 Score"  value={m.f1}        color={m.color} />
              </div>
            </div>
          ))}
        </div>

        <p className="ml-pipeline-note">
          Pipeline: Raw Data → Clean (impute nulls) → Label Encode → StandardScale → GaussianNB → Predict
        </p>
      </div>

      {/* ── Recent Applications ── */}
      <div className="section-card">
        <div className="section-card-header">
          <h2>Recent Applications</h2>
          <Link to="/history" className="view-all-link">View all <ArrowRight size={13} /></Link>
        </div>

        {loading ? (
          <div className="table-loading"><span className="spinner" /></div>
        ) : recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Brain size={32} /></div>
            <p className="empty-title">No applications yet</p>
            <p className="empty-sub">Apply for a loan and get an instant decision</p>
            <Link to="/apply" className="apply-cta small">
              <Plus size={14} /> Get Started
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Loan Amount</th>
                  <th>Purpose</th>
                  <th>Decision</th>
                  <th>Confidence</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map(app => (
                  <tr key={app._id}>
                    <td>{new Date(app.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="amount-cell">{INR(app.loanAmount)}</td>
                    <td>{app.loanPurpose}</td>
                    <td><span className={statusClass(app.status)}>{app.status.replace('_', ' ')}</span></td>
                    <td>
                      {app.confidence ? (
                        <div className="conf-mini">
                          <div className="conf-mini-bar">
                            <div className="conf-mini-fill"
                              style={{ width: `${app.confidence * 100}%`,
                                background: app.confidence >= .7 ? 'var(--success)' : 'var(--warn)' }} />
                          </div>
                          <span>{(app.confidence * 100).toFixed(0)}%</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      <Link to={`/result/${app._id}`} className="table-link">
                        View <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
