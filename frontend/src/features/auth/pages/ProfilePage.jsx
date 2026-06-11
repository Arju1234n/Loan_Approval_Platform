import { useAuth } from '../hooks/useAuth'
import { User, Mail, Shield, Calendar } from 'lucide-react'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user } = useAuth()

  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A'

  return (
    <div className="profile-page">
      <div className="page-header">
        <p className="eyebrow">Account</p>
        <h1>My Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-area">
          <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <h2>{user?.name}</h2>
            <span className={`role-badge ${user?.role}`}>{user?.role}</span>
          </div>
        </div>

        <div className="profile-fields">
          <div className="profile-field">
            <div className="field-icon"><Mail size={18} /></div>
            <div>
              <p className="field-label">Email Address</p>
              <p className="field-value">{user?.email}</p>
            </div>
          </div>

          <div className="profile-field">
            <div className="field-icon"><User size={18} /></div>
            <div>
              <p className="field-label">Full Name</p>
              <p className="field-value">{user?.name}</p>
            </div>
          </div>

          <div className="profile-field">
            <div className="field-icon"><Shield size={18} /></div>
            <div>
              <p className="field-label">Account Role</p>
              <p className="field-value" style={{ textTransform: 'capitalize' }}>{user?.role}</p>
            </div>
          </div>

          <div className="profile-field">
            <div className="field-icon"><Calendar size={18} /></div>
            <div>
              <p className="field-label">Member Since</p>
              <p className="field-value">{joined}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
