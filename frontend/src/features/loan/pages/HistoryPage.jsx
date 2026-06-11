import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../shared/services/api'
import { History, Search, ArrowRight } from 'lucide-react'

const INR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
import './HistoryPage.css'

function statusClass(s) {
  if (s === 'approved') return 'badge badge-green'
  if (s === 'rejected') return 'badge badge-red'
  if (s === 'under_review') return 'badge badge-yellow'
  return 'badge badge-gray'
}

export default function HistoryPage() {
  const [apps, setApps]     = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/loans/my-applications')
      .then(({ data }) => { setApps(data.data || []); setFiltered(data.data || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let list = [...apps]
    if (status) list = list.filter(a => a.status === status)
    if (search) list = list.filter(a =>
      a.loanPurpose?.toLowerCase().includes(search.toLowerCase()) ||
      a._id.includes(search)
    )
    setFiltered(list)
  }, [search, status, apps])

  return (
    <div className="history-page">
      <div className="page-header">
        <p className="eyebrow">Applications</p>
        <h1>My History</h1>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <Search size={15} />
          <input
            id="history-search"
            type="text"
            placeholder="Search by purpose or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          id="history-filter"
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
        </select>
      </div>

      <div className="section-card">
        {loading ? (
          <div className="table-loading"><span className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <History size={40} />
            <p>{apps.length === 0 ? 'No applications yet.' : 'No results match your filter.'}</p>
            {apps.length === 0 && <Link to="/apply" className="apply-cta small">Apply Now</Link>}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Purpose</th>
                  <th>Credit Score</th>
                  <th>Status</th>
                  <th>Confidence</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app._id}>
                    <td>{new Date(app.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="amount-cell">{INR(app.loanAmount)}</td>
                    <td>{app.loanPurpose}</td>
                    <td>{app.creditScore}</td>
                    <td><span className={statusClass(app.status)}>{app.status.replace('_', ' ')}</span></td>
                    <td>{app.confidence ? `${(app.confidence * 100).toFixed(1)}%` : '—'}</td>
                    <td><Link to={`/result/${app._id}`} className="table-link">View <ArrowRight size={12} /></Link></td>
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
