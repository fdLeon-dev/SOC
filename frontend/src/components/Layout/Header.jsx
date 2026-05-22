/**
 * DefenseOS - Top Header Bar
 */
import { format } from 'date-fns'
import { Bell, Radio } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { alertsApi } from '../../lib/api'

export default function Header({ title }) {
  const { data: stats } = useQuery({
    queryKey: ['alert-stats'],
    queryFn: () => alertsApi.stats().then((r) => r.data),
    refetchInterval: 15_000,
  })

  const openCount = stats?.open ?? 0

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-soc-border bg-soc-surface shrink-0">
      <h1 className="text-lg font-semibold text-white">{title}</h1>

      <div className="flex items-center gap-5">
        {/* Live indicator */}
        <span className="live-dot text-xs text-soc-green font-mono">LIVE</span>

        {/* Open alerts badge */}
        <div className="relative">
          <Bell className="w-5 h-5 text-soc-muted" />
          {openCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-soc-red text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {openCount > 9 ? '9+' : openCount}
            </span>
          )}
        </div>

        {/* Clock */}
        <span className="text-xs font-mono text-soc-muted">
          {format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
        </span>
      </div>
    </header>
  )
}
