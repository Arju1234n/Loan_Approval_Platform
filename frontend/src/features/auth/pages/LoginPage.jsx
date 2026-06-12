import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { CreditCard, Mail, Lock, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import './Auth.css'

const WAKING_UP_MSG = 'The server is taking too long'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [warming, setWarming]   = useState(false)
  const retryRef = useRef(null)

  // Clear auto-retry timer on unmount
  useEffect(() => () => clearTimeout(retryRef.current), [])

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e, isRetry = false) => {
    if (e && !isRetry) e.preventDefault()
    setError('')
    setWarming(false)
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'admin') {
        toast.success(`Welcome Admin! Redirecting to dashboard…`)
        navigate('/admin')
        return
      }
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/')
    } catch (err) {
      if (err.message.includes(WAKING_UP_MSG)) {
        // Cold-start: show warm-up banner and auto-retry in 10s
        setWarming(true)
        retryRef.current = setTimeout(() => handleSubmit(null, true), 10000)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-glow" />
      <div className="auth-card">

        {/* User badge */}
        <div className="user-login-badge">
          <CreditCard size={12} />
          <span>User Portal</span>
        </div>

        <div className="auth-card-header">
          <div className="auth-logo">
            <CreditCard size={26} strokeWidth={2} />
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {warming && (
            <div className="auth-warming">
              <Loader2 size={14} className="warming-spin" />
              <span>Server is waking up… retrying automatically.</span>
            </div>
          )}
          {error && !warming && <div className="auth-error">{error}</div>}

          <label className="field-label">
            Email address
            <div className="input-wrap">
              <Mail size={15} className="input-icon" />
              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="you@example.com"
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
                id="login-password"
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

          <button id="login-submit" type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

        {/* Admin portal link */}
        <Link to="/admin/login" className="admin-portal-link">
          <ShieldCheck size={13} />
          Admin Portal →
        </Link>
      </div>
    </div>
  )
}
