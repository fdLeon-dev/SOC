/**
 * DefenseOS - App Shell Layout
 */
import Sidebar from './Sidebar'
import Header from './Header'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/':          'SOC Dashboard',
  '/alerts':    'Alerts',
  '/events':    'Security Events',
  '/incidents': 'Incident Management',
  '/metrics':   'System Metrics',
  '/network':   'Network Monitor',
  '/processes': 'Process Monitor',
  '/users':     'User Management',
  '/audit':     'Audit Logs',
}

export default function AppLayout({ children }) {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'DefenseOS'

  return (
    <div className="flex h-screen overflow-hidden bg-soc-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
