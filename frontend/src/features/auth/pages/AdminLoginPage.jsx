import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import './AdminLogin.css'

export default function AdminLoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role !== 'admin') {
        // Not an admin — log them out immediately
        localStorage.removeItem('cw_token')
        localStorage.removeItem('cw_user')
        setError('Access denied. This portal is for administrators only.')
        setLoading(false)
        return
      }
      toast.success(`Admin access granted. Welcome, ${user.name}!`)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-auth-screen">
      {/* Background grid effect */}
      <div className="admin-bg-grid" />
      <div className="admin-bg-glow" />

      <div className="admin-auth-card">
        {/* Security badge */}
        <div className="admin-security-badge">
          <ShieldCheck size={13} />
          <span>Secured Admin Portal</span>
        </div>

        {/* Header */}
        <div className="admin-card-header">
          <div className="admin-logo">
            <ShieldCheck size={26} strokeWidth={1.8} />
          </div>
          <h1>Admin Access</h1>
          <p>CreditWise Administration Panel</p>
        </div>

        {/* Warning notice */}
        <div className="admin-notice">
          <AlertTriangle size={14} />
          <span>Restricted to authorised administrators only</span>
        </div>

        <form onSubmit={handleSubmit} className="admin-auth-form">
          {error && (
            <div className="admin-auth-error">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <label className="field-label">
            Admin Email
            <div className="input-wrap">
              <Mail size={15} className="input-icon" />
              <input
                id="admin-email"
                type="email"
                name="email"
                placeholder="admin@creditwise.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </label>

          <label className="field-label">
            Password
            <div className="input-wrap">
              <Lock size={15} className="input-icon" />
              <input
                id="admin-password"
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button type="button" className="eye-btn" onClick={() => setShowPass(p => !p)}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>

          <button id="admin-login-submit" type="submit" className="admin-auth-btn" disabled={loading}>
            {loading
              ? <><span className="btn-spinner" /> Verifying...</>
              : <><ShieldCheck size={15} /> Sign In as Admin</>
            }
          </button>
        </form>

        <p className="admin-auth-switch">
          Not an admin?{' '}
          <Link to="/login">User Login →</Link>
        </p>
      </div>
    </div>
  )
}
