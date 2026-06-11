import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../shared/services/api'
import {
  CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown,
  ArrowLeft, Cpu, Brain, BarChart3, Shield, Zap,
} from 'lucide-react'
import './ResultPage.css'

const INR = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })

const ML_MODELS = [
  { name: 'Naive Bayes', accuracy: 88.42, f1: 79.63, active: true,  desc: 'Probabilistic classifier using Bayes theorem' },
  { name: 'Logistic Reg', accuracy: 87.37, f1: 78.57, active: false, desc: 'Linear boundary classifier' },
  { name: 'KNN',          accuracy: 78.95, f1: 64.29, active: false, desc: 'k-Nearest Neighbors (k=5)' },
]

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  )
}

function ConfidenceRing({ value }) {
  const pct = Math.round((value || 0) * 100)
  const r = 54, circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct >= 75 ? '#10b981' : pct >= 55 ? '#f59e0b' : '#f43f5e'
  return (
    <div className="conf-ring-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1.2s ease, stroke .4s' }}
        />
        <text x="70" y="64" textAnchor="middle" fill={color}
          fontSize="22" fontWeight="800" fontFamily="Inter">
          {pct}%
        </text>
        <text x="70" y="82" textAnchor="middle" fill="rgba(255,255,255,.45)"
          fontSize="11" fontFamily="Inter">
          confidence
        </text>
      </svg>
    </div>
  )
}

export default function ResultPage() {
  const { id } = useParams()
  const [app, setApp]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [animIn, setAnimIn]   = useState(false)

  useEffect(() => {
    api.get(`/loans/${id}`)
      .then(({ data }) => { setApp(data.data); setTimeout(() => setAnimIn(true), 100) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page-loader"><span className="spinner" /></div>
  if (!app)    return <div className="result-page"><p style={{ color: 'var(--text-muted)' }}>Application not found.</p></div>

  const status     = app.status
  const isApproved = status === 'approved'
  const isRejected = status === 'rejected'
  const DecisionIcon = isApproved ? CheckCircle2 : isRejected ? XCircle : Clock

  return (
    <div className={`result-page ${animIn ? 'anim-in' : ''}`}>
      <Link to="/history" className="back-link">
        <ArrowLeft size={15} /> Back to History
      </Link>

      <div className="result-grid">

        {/* ── LEFT: Decision + Explainability ── */}
        <div className="result-left">

          {/* Decision Card */}
          <div className={`decision-card ${status}`}>
            <div className="dec-header">
              <div className="dec-icon-wrap">
                <DecisionIcon size={32} strokeWidth={1.8} />
              </div>
              <div>
                <p className="dec-eyebrow"><Cpu size={12} /> Decision</p>
                <h2 className="dec-title">
                  {isApproved ? 'Loan Approved' : isRejected ? 'Loan Rejected' : 'Under Review'}
                </h2>
                <p className="dec-model-tag">Naive Bayes · 88.4% accuracy</p>
              </div>
            </div>

            <ConfidenceRing value={app.confidence} />

            {/* Explainability */}
            {app.reasons?.length > 0 && (
              <div className="xai-block positive">
                <p className="xai-title"><TrendingUp size={14} /> Positive Factors</p>
                <ul className="xai-list">
                  {app.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            {app.riskFactors?.length > 0 && (
              <div className="xai-block risk">
                <p className="xai-title"><TrendingDown size={14} /> Risk Factors</p>
                <ul className="xai-list">
                  {app.riskFactors.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* ML Models Comparison */}
          <div className="ml-showcase">
            <div className="ml-showcase-header">
              <Brain size={16} style={{ color: 'var(--brand-light)' }} />
              <span>ML Models Performance</span>
              <span className="ml-showcase-badge">Trained on 1,000 samples</span>
            </div>
            <div className="ml-models-list">
              {ML_MODELS.map((m) => (
                <div key={m.name} className={`ml-model-row ${m.active ? 'active' : ''}`}>
                  <div className="ml-model-info">
                    <span className="ml-model-name">{m.name}</span>
                    {m.active && <span className="ml-active-chip"><Zap size={10} /> Active</span>}
                    <span className="ml-model-desc">{m.desc}</span>
                  </div>
                  <div className="ml-model-metrics">
                    <div className="ml-metric">
                      <span className="ml-metric-val">{m.accuracy}%</span>
                      <span className="ml-metric-key">Accuracy</span>
                    </div>
                    <div className="ml-metric">
                      <span className="ml-metric-val">{m.f1}%</span>
                      <span className="ml-metric-key">F1 Score</span>
                    </div>
                  </div>
                  <div className="ml-bar-wrap">
                    <div className="ml-bar" style={{ width: `${m.accuracy}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="ml-pipeline">
              <BarChart3 size={13} />
              <span>Pipeline: Data → Label Encode → StandardScale → GaussianNB → Predict</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Application Details ── */}
        <div className="details-panel">
          <div className="details-panel-header">
            <Shield size={16} style={{ color: 'var(--brand-light)' }} />
            <h3>Application Details</h3>
          </div>

          <div className="details-section">
            <p className="details-heading">Personal</p>
            <DetailRow label="Age"            value={`${app.age} years`} />
            <DetailRow label="Gender"         value={app.gender} />
            <DetailRow label="Marital Status" value={app.maritalStatus} />
            <DetailRow label="Dependents"     value={app.dependents} />
            <DetailRow label="Education"      value={app.educationLevel} />
            <DetailRow label="Property Area"  value={app.propertyArea} />
          </div>

          <div className="details-section">
            <p className="details-heading">Employment & Income</p>
            <DetailRow label="Employment"     value={app.employmentStatus} />
            <DetailRow label="Employer Type"  value={app.employerCategory} />
            <DetailRow label="Monthly Income" value={`${INR(app.income)}/mo`} />
            <DetailRow label="Co-Applicant"   value={`${INR(app.coApplicantIncome)}/mo`} />
            <DetailRow label="Savings"        value={INR(app.savings)} />
            <DetailRow label="Collateral"     value={INR(app.collateralValue)} />
          </div>

          <div className="details-section">
            <p className="details-heading">Financial Profile</p>
            <DetailRow label="Credit Score"   value={app.creditScore} />
            <DetailRow label="Existing Loans" value={app.existingLoans} />
            <DetailRow label="DTI Ratio"      value={`${(app.dtiRatio * 100).toFixed(1)}%`} />
          </div>

          <div className="details-section">
            <p className="details-heading">Loan Details</p>
            <DetailRow label="Amount"    value={INR(app.loanAmount)} />
            <DetailRow label="Term"      value={`${app.loanTerm} months`} />
            <DetailRow label="Purpose"   value={app.loanPurpose} />
            <DetailRow label="Applied"   value={new Date(app.createdAt).toLocaleDateString('en-IN')} />
            {app.adminOverride && <DetailRow label="Override" value="Admin Reviewed" />}
            {app.adminNote     && <DetailRow label="Admin Note" value={app.adminNote} />}
          </div>
        </div>
      </div>
    </div>
  )
}
