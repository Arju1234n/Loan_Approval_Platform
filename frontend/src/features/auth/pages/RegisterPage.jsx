import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { CreditCard, User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import './Auth.css'

const WAKING_UP_MSG = 'The server is taking too long'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [warming, setWarming] = useState(false)
  const retryRef = useRef(null)

  useEffect(() => () => clearTimeout(retryRef.current), [])

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e, isRetry = false) => {
    if (e && !isRetry) e.preventDefault()
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setError('')
    setWarming(false)
    setLoading(true)
    try {
      const user = await register(form.name, form.email, form.password)
      toast.success(`Account created! Welcome, ${user.name}!`)
      navigate('/')
    } catch (err) {
      if (err.message.includes(WAKING_UP_MSG)) {
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
        <div className="auth-card-header">
          <div className="auth-logo">
            <CreditCard size={28} strokeWidth={2} />
          </div>
          <h1>Create account</h1>
          <p>Create your account to get started</p>
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
            Full Name
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input
                id="reg-name"
                type="text"
                name="name"
                placeholder="John Smith"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
          </label>

          <label className="field-label">
            Email address
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                id="reg-email"
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
              <Lock size={16} className="input-icon" />
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button type="button" className="eye-btn" onClick={() => setShowPass(p => !p)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button id="reg-submit" type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
