/**
 * DefenseOS - Sidebar Navigation (SOC/NOC style)
 */
import { NavLink } from 'react-router-dom'
import {
  Shield, LayoutDashboard, AlertTriangle, Activity,
  Network, FileText, Users, LogOut, Cpu, Zap
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../lib/AuthContext'

const navItems = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alerts',     icon: AlertTriangle,   label: 'Alerts' },
  { to: '/events',     icon: Zap,             label: 'Events' },
  { to: '/incidents',  icon: FileText,        label: 'Incidents' },
  { to: '/metrics',    icon: Activity,        label: 'System' },
  { to: '/network',    icon: Network,         label: 'Network' },
  { to: '/processes',  icon: Cpu,             label: 'Processes' },
]

const adminItems = [
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/audit', icon: Shield, label: 'Audit' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-soc-surface border-r border-soc-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-soc-border">
        <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-soc-accent text-soc-bg shadow-lg shadow-soc-accent/20">
          <span className="text-xl font-black">D</span>
        </div>
        <div>
          <div className="text-lg font-bold text-white tracking-wide">DefenseOS</div>
          <div className="text-xs uppercase text-soc-muted tracking-[0.2em]">SOC Command</div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150',
                isActive
                  ? 'bg-soc-accent/10 text-soc-accent border border-soc-accent/20'
                  : 'text-soc-muted hover:text-soc-text hover:bg-soc-card'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}

        {/* Admin section */}
        {user?.role === 'admin' && (
          <>
            <div className="pt-4 pb-1 px-3 text-[10px] uppercase tracking-widest text-soc-muted">
              Admin
            </div>
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150',
                    isActive
                      ? 'bg-soc-accent/10 text-soc-accent border border-soc-accent/20'
                      : 'text-soc-muted hover:text-soc-text hover:bg-soc-card'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-soc-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-soc-text truncate">{user?.username}</p>
            <p className="text-xs text-soc-muted capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-soc-muted hover:text-soc-red transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
