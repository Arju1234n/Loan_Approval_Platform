import { useEffect, useState } from 'react'
import api from '../../shared/services/api'
import {
  Users, FileText, CheckCircle, XCircle, TrendingUp, Search,
  ShieldCheck, Clock, RefreshCw, ChevronDown, ChevronUp,
  Cpu, BarChart3, AlertCircle, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import './AdminDashboard.css'

const INR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })

/* ── Override Confirmation Modal ──────────────── */
function OverrideModal({ app, action, onConfirm, onCancel }) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const ACTION_CONFIG = {
    approved:     { label: 'Approve',       color: '#10b981', icon: CheckCircle },
    rejected:     { label: 'Reject',        color: '#f43f5e', icon: XCircle },
    under_review: { label: 'Mark Review',   color: '#f59e0b', icon: Clock },
  }
  const cfg = ACTION_CONFIG[action]
  const Icon = cfg.icon

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm(note)
    setLoading(false)
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon" style={{ background: cfg.color + '20', color: cfg.color }}>
            <Icon size={22} />
          </div>
          <div>
            <h3>{cfg.label} Application</h3>
            <p>{app.userId?.name} — {INR(app.loanAmount)} ({app.loanPurpose})</p>
          </div>
          <button className="modal-close" onClick={onCancel}><X size={18} /></button>
        </div>

        <div className="modal-info">
          <div className="modal-info-row">
            <span>Current Status</span>
            <span className={`badge ${
              app.status === 'approved' ? 'badge-green' :
              app.status === 'rejected' ? 'badge-red' : 'badge-yellow'
            }`}>{app.status.replace('_', ' ')}</span>
          </div>
          <div className="modal-info-row">
            <span>ML Prediction</span>
            <span className={`badge ${app.prediction === 'Approved' ? 'badge-green' : 'badge-red'}`}>
              {app.prediction || '—'}
            </span>
          </div>
          <div className="modal-info-row">
            <span>Credit Score</span>
            <b style={{ color: app.creditScore >= 750 ? '#10b981' : app.creditScore >= 600 ? '#f59e0b' : '#f43f5e' }}>
              {app.creditScore}
            </b>
          </div>
          <div className="modal-info-row">
            <span>Confidence</span>
            <b>{app.confidence ? `${(app.confidence * 100).toFixed(0)}%` : '—'}</b>
          </div>
        </div>

        <label className="modal-note-label">
          Admin Note <span className="modal-note-opt">(optional)</span>
          <textarea
            className="modal-note-input"
            placeholder="Reason for override…"
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
          />
        </label>

        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className="modal-confirm-btn"
            style={{ background: cfg.color, boxShadow: `0 4px 20px ${cfg.color}44` }}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : <Icon size={15} />}
            {loading ? 'Processing…' : `Confirm ${cfg.label}`}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Metric Card ──────────────────────────────── */
function MetricCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="metric-card" style={{ '--c': color }}>
      <div className="metric-top">
        <div className="metric-icon"><Icon size={18} /></div>
        <span className="metric-label">{label}</span>
      </div>
      <p className="metric-value">{value}</p>
      {sub && <p className="metric-sub">{sub}</p>}
    </div>
  )
}

/* ── Applicant Avatar ─────────────────────────── */
function ApplicantAvatar({ name }) {
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
  const palette = ['#6366f1','#10b981','#f59e0b','#06b6d4','#ec4899','#8b5cf6']
  const color = palette[name?.charCodeAt(0) % palette.length] || '#6366f1'
  return (
    <div className="applicant-avatar" style={{ background: color + '22', color }}>
      {initials}
    </div>
  )
}

function statusBadge(s) {
  return {
    approved:     'badge badge-green',
    rejected:     'badge badge-red',
    under_review: 'badge badge-yellow',
    pending:      'badge badge-gray',
  }[s] || 'badge badge-gray'
}

/* ── Main Dashboard ───────────────────────────── */
export default function AdminDashboard() {
  const [stats, setStats]           = useState(null)
  const [apps, setApps]             = useState([])
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('')
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedRow, setExpanded]  = useState(null)

  // Modal state
  const [modal, setModal] = useState(null) // { app, action }

  const fetchDashboard = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [dashRes, appsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/applications'),
      ])
      setStats(dashRes.data.data)
      setApps(appsRes.data.data || [])
    } catch (e) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  // Open modal instead of window.prompt
  const openOverride = (app, action, e) => {
    e.stopPropagation()
    setModal({ app, action })
  }

  // Called when admin confirms inside modal
  const confirmOverride = async (note) => {
    try {
      await api.patch(`/admin/applications/${modal.app._id}/override`, {
        status: modal.action,
        adminNote: note,
      })
      toast.success(`✓ Application ${modal.action.replace('_', ' ')} successfully`)
      setModal(null)
      fetchDashboard(true)
    } catch (e) {
      toast.error(e.message)
    }
  }

  const filtered = apps.filter(a => {
    const q = search.toLowerCase()
    const matchQ = !q ||
      a.userId?.name?.toLowerCase().includes(q) ||
      a.userId?.email?.toLowerCase().includes(q) ||
      a._id.includes(q) ||
      a.loanPurpose?.toLowerCase().includes(q)
    const matchS = !statusFilter || a.status === statusFilter
    return matchQ && matchS
  })

  const pendingCount  = apps.filter(a => a.status === 'pending' || a.status === 'under_review').length
  const approvedCount = apps.filter(a => a.status === 'approved').length

  if (loading) return <div className="page-loader"><span className="spinner" /></div>

  return (
    <div className="admin-page">

      {/* Override Modal */}
      {modal && (
        <OverrideModal
          app={modal.app}
          action={modal.action}
          onConfirm={confirmOverride}
          onCancel={() => setModal(null)}
        />
      )}

      {/* ── Header ── */}
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">
            <ShieldCheck size={12} />
            <span>Administration</span>
            <span className="pro-chip">PRO</span>
          </div>
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">Manage applications, users and system health</p>
        </div>
        <button
          className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
        >
          <RefreshCw size={15} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Metric Cards ── */}
      {stats && (
        <div className="metrics-grid">
          <MetricCard icon={Users}       label="Total Users"       value={stats.cards.totalUsers}        sub="Registered accounts"          color="#6366f1" />
          <MetricCard icon={FileText}    label="Applications"      value={stats.cards.totalApplications} sub={`${pendingCount} pending review`} color="#06b6d4" />
          <MetricCard icon={CheckCircle} label="Approved"          value={stats.cards.approved}          sub="Loans disbursed"               color="#10b981" />
          <MetricCard icon={XCircle}     label="Rejected"          value={stats.cards.rejected}          sub="Declined by model"             color="#f43f5e" />
          <MetricCard icon={TrendingUp}  label="Approval Rate"     value={`${stats.cards.approvalRate}%`} sub="Model accuracy: 88.4%"        color="#f59e0b" />
        </div>
      )}

      {/* ── System Status Bar ── */}
      <div className="system-bar">
        <div className="sys-item green"><span className="sys-dot" /><Cpu size={13} /><span>ML Engine</span><b>Online · 88.4%</b></div>
        <div className="sys-item green"><span className="sys-dot" /><BarChart3 size={13} /><span>MongoDB Atlas</span><b>Connected</b></div>
        <div className="sys-item blue"><AlertCircle size={13} /><span>Pending Reviews</span><b>{pendingCount}</b></div>
        <div className="sys-item purple"><CheckCircle size={13} /><span>Approved</span><b>{approvedCount}</b></div>
      </div>

      {/* ── Applications Table ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>All Applications</h2>
            <p className="admin-card-sub">{filtered.length} of {apps.length} shown</p>
          </div>
          <div className="toolbar-row">
            <div className="search-wrap">
              <Search size={14} />
              <input
                id="admin-search" type="text"
                placeholder="Search name, email, purpose…"
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select id="admin-filter" value={statusFilter}
              onChange={e => setStatus(e.target.value)} className="filter-select">
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Applicant</th>
                <th>Loan Amount</th>
                <th>Purpose</th>
                <th>Credit Score</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>ML Prediction</th>
                <th>Date</th>
                <th>Admin Override</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <>
                  <tr key={app._id} className={expandedRow === app._id ? 'expanded' : ''}>

                    {/* Expand toggle — ONLY this triggers expand */}
                    <td className="expand-td">
                      <button
                        className="expand-btn"
                        onClick={() => setExpanded(expandedRow === app._id ? null : app._id)}
                        title="View details"
                      >
                        {expandedRow === app._id
                          ? <ChevronUp size={15} />
                          : <ChevronDown size={15} />
                        }
                      </button>
                    </td>

                    <td>
                      <div className="applicant-cell">
                        <ApplicantAvatar name={app.userId?.name} />
                        <div>
                          <p className="applicant-name">{app.userId?.name || '—'}</p>
                          <p className="applicant-email">{app.userId?.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="amount-cell">{INR(app.loanAmount)}</td>
                    <td>{app.loanPurpose}</td>
                    <td>
                      <span className={`credit-chip ${app.creditScore >= 750 ? 'good' : app.creditScore >= 600 ? 'fair' : 'poor'}`}>
                        {app.creditScore}
                      </span>
                    </td>
                    <td>
                      {app.confidence ? (
                        <div className="conf-mini-wrap">
                          <div className="conf-mini-bar">
                            <div className="conf-mini-fill" style={{
                              width: `${app.confidence * 100}%`,
                              background: app.confidence >= .7 ? 'var(--success)' : app.confidence >= .5 ? 'var(--warn)' : 'var(--danger)'
                            }} />
                          </div>
                          <span>{(app.confidence * 100).toFixed(0)}%</span>
                        </div>
                      ) : <span className="text-dim">—</span>}
                    </td>
                    <td><span className={statusBadge(app.status)}>{app.status.replace('_', ' ')}</span></td>
                    <td>
                      {app.prediction
                        ? <span className={app.prediction === 'Approved' ? 'badge badge-green' : 'badge badge-red'}>{app.prediction}</span>
                        : <span className="badge badge-gray">—</span>
                      }
                    </td>
                    <td className="date-cell">{new Date(app.createdAt).toLocaleDateString('en-IN')}</td>

                    {/* Override actions — each has stopPropagation + opens modal */}
                    <td>
                      <div className="override-actions">
                        <button
                          className="ovr-btn approve"
                          title="Approve this application"
                          onClick={e => openOverride(app, 'approved', e)}
                          disabled={app.status === 'approved'}
                        >
                          <CheckCircle size={13} />
                          <span>Approve</span>
                        </button>
                        <button
                          className="ovr-btn reject"
                          title="Reject this application"
                          onClick={e => openOverride(app, 'rejected', e)}
                          disabled={app.status === 'rejected'}
                        >
                          <XCircle size={13} />
                          <span>Reject</span>
                        </button>
                        <button
                          className="ovr-btn review"
                          title="Put under review"
                          onClick={e => openOverride(app, 'under_review', e)}
                          disabled={app.status === 'under_review'}
                        >
                          <Clock size={13} />
                          <span>Review</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {expandedRow === app._id && (
                    <tr key={`${app._id}-exp`} className="expand-row">
                      <td colSpan={10}>
                        <div className="expand-details">
                          <div className="expand-col">
                            <p className="expand-heading">Income & Employment</p>
                            <p>Monthly Income: <b>{INR(app.income)}</b></p>
                            <p>Co-Applicant: <b>{INR(app.coApplicantIncome)}</b></p>
                            <p>Savings: <b>{INR(app.savings)}</b></p>
                            <p>Employment: <b>{app.employmentStatus}</b></p>
                            <p>Employer: <b>{app.employerCategory}</b></p>
                          </div>
                          <div className="expand-col">
                            <p className="expand-heading">Loan Details</p>
                            <p>Amount: <b>{INR(app.loanAmount)}</b></p>
                            <p>Term: <b>{app.loanTerm} months</b></p>
                            <p>DTI Ratio: <b>{(app.dtiRatio * 100).toFixed(1)}%</b></p>
                            <p>Existing Loans: <b>{app.existingLoans}</b></p>
                            <p>Collateral: <b>{INR(app.collateralValue)}</b></p>
                          </div>
                          <div className="expand-col">
                            <p className="expand-heading">ML Insights</p>
                            {app.reasons?.length > 0 && (
                              <>
                                <p style={{ fontSize: '0.72rem', color: 'var(--success)', marginBottom: 4 }}>Positive Factors</p>
                                <div className="expand-reasons positive">
                                  {app.reasons.map((r, i) => <span key={i}>{r}</span>)}
                                </div>
                              </>
                            )}
                            {app.riskFactors?.length > 0 && (
                              <>
                                <p style={{ fontSize: '0.72rem', color: 'var(--danger)', margin: '8px 0 4px' }}>Risk Factors</p>
                                <div className="expand-reasons risk">
                                  {app.riskFactors.map((r, i) => <span key={i}>{r}</span>)}
                                </div>
                              </>
                            )}
                            {app.adminNote && (
                              <p className="admin-note-text">📝 {app.adminNote}</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="empty-row">
                    <Search size={22} />
                    <p>No applications match your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Recent Users ── */}
      {stats?.recentUsers?.length > 0 && (
        <div className="admin-card" style={{ marginTop: 16 }}>
          <div className="admin-card-header">
            <div>
              <h2>Recent Users</h2>
              <p className="admin-card-sub">Newly registered accounts</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {stats.recentUsers.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="applicant-cell">
                        <ApplicantAvatar name={u.name} />
                        <span className="applicant-name">{u.name}</span>
                      </div>
                    </td>
                    <td className="applicant-email">{u.email}</td>
                    <td>
                      <span className={u.role === 'admin' ? 'badge badge-yellow' : 'badge badge-gray'}>
                        {u.role}
                      </span>
                    </td>
                    <td className="date-cell">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
