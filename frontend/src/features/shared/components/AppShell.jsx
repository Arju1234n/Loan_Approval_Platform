import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FilePlus, History, User, BarChart2,
  ShieldCheck, LogOut, CreditCard, ChevronRight, Cpu,
} from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import toast from 'react-hot-toast'
import './AppShell.css'

const NAV_LINKS = [
  { to: '/',        label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/apply',   label: 'Apply Loan', icon: FilePlus },
  { to: '/history', label: 'My History', icon: History },
  { to: '/profile', label: 'Profile',    icon: User },
]

const ADMIN_LINKS = [
  { to: '/admin',     label: 'Admin Panel', icon: ShieldCheck },
  { to: '/analytics', label: 'Analytics',   icon: BarChart2 },
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className="shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <CreditCard size={17} strokeWidth={2.5} />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">CreditWise</span>
            <span className="sidebar-brand-sub">Smart Loan Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">Main Menu</p>
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={17} />
              <span>{label}</span>
              <ChevronRight size={13} className="nav-chevron" />
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <p className="nav-label" style={{ marginTop: 14 }}>Admin</p>
              {ADMIN_LINKS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  <span className="nav-ai-badge">PRO</span>
                </NavLink>
              ))}
            </>
          )}

          {/* ML Status indicator */}
          <div style={{ marginTop: 'auto', paddingTop: 20 }}>
            <div className="nav-link" style={{ cursor: 'default', opacity: .8 }}>
              <Cpu size={15} style={{ color: 'var(--success)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ML Engine</span>
              <span style={{
                marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%',
                background: 'var(--success)',
                boxShadow: '0 0 8px var(--success)',
                animation: 'pulse-glow 2s infinite',
              }} />
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <p className="user-name">{user?.name}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
