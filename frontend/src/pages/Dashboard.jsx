/**
 * DefenseOS - SOC Dashboard
 * Main overview: alert stats, system health, recent events.
 */
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle, Zap, FileText, CheckCircle,
  Activity, Shield, TrendingUp
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { format } from 'date-fns'

import { alertsApi, eventsApi, metricsApi } from '../lib/api'
import StatCard from '../components/common/StatCard'
import MetricGauge from '../components/common/MetricGauge'
import { SeverityBadge, StatusBadge } from '../components/common/Badge'

const SEVERITY_COLORS = {
  critical: '#ff4757',
  high:     '#ff6b35',
  medium:   '#ffd700',
  low:      '#00ff88',
}

export default function Dashboard() {
  const { data: alertStats } = useQuery({
    queryKey: ['alert-stats'],
    queryFn: () => alertsApi.stats().then((r) => r.data),
    refetchInterval: 15_000,
  })

  const { data: recentAlerts = [] } = useQuery({
    queryKey: ['alerts-recent'],
    queryFn: () => alertsApi.list({ limit: 8, status: 'open' }).then((r) => r.data),
    refetchInterval: 15_000,
  })

  const { data: recentEvents = [] } = useQuery({
    queryKey: ['events-recent'],
    queryFn: () => eventsApi.list({ limit: 10 }).then((r) => r.data),
    refetchInterval: 10_000,
  })

  const { data: metrics } = useQuery({
    queryKey: ['metrics-system'],
    queryFn: () => metricsApi.system().then((r) => r.data),
    refetchInterval: 5_000,
  })

  // Build severity pie data
  const severityPie = alertStats
    ? Object.entries(alertStats.by_severity)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : []

  return (
    <div className="space-y-6">
      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Open Alerts"
          value={alertStats?.open ?? '—'}
          icon={AlertTriangle}
          color="text-soc-red"
        />
        <StatCard
          label="Investigating"
          value={alertStats?.investigating ?? '—'}
          icon={TrendingUp}
          color="text-soc-yellow"
        />
        <StatCard
          label="Total Alerts"
          value={alertStats?.total ?? '—'}
          icon={Shield}
          color="text-soc-accent"
        />
        <StatCard
          label="Resolved"
          value={alertStats?.resolved ?? '—'}
          icon={CheckCircle}
          color="text-soc-green"
        />
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="card-glow p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-soc-accent" />
            <h2 className="text-sm font-semibold text-white">System Health</h2>
          </div>
          {metrics ? (
            <div className="space-y-3">
              <MetricGauge label="CPU" value={metrics.cpu_percent} />
              <MetricGauge label="Memory" value={metrics.memory_percent} />
              {metrics.disks?.[0] && (
                <MetricGauge label={`Disk (${metrics.disks[0].mountpoint})`} value={metrics.disks[0].percent} />
              )}
              {metrics.swap_total_gb > 0 && (
                <MetricGauge label="Swap" value={metrics.swap_percent} />
              )}
              <div className="pt-2 border-t border-soc-border text-xs text-soc-muted font-mono">
                Load: {metrics.load_avg_1m?.toFixed(2) ?? '—'} /
                      {metrics.load_avg_5m?.toFixed(2) ?? '—'} /
                      {metrics.load_avg_15m?.toFixed(2) ?? '—'}
              </div>
            </div>
          ) : (
            <p className="text-soc-muted text-sm">Loading…</p>
          )}
        </div>

        {/* Alert Severity Breakdown */}
        <div className="card-glow p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-soc-accent" />
            <h2 className="text-sm font-semibold text-white">Alert Severity</h2>
          </div>
          {severityPie.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={severityPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    dataKey="value"
                    stroke="none"
                  >
                    {severityPie.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={SEVERITY_COLORS[entry.name] ?? '#6b7f9e'}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {severityPie.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: SEVERITY_COLORS[entry.name] ?? '#6b7f9e' }}
                    />
                    <span className="text-soc-muted capitalize">{entry.name}</span>
                    <span className="font-mono text-soc-text">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-soc-muted text-sm">No alert data yet</p>
          )}
        </div>

        {/* Recent Events Feed */}
        <div className="card-glow p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-soc-accent" />
            <h2 className="text-sm font-semibold text-white">Event Feed</h2>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {recentEvents.length === 0 && (
              <p className="text-soc-muted text-xs">No events yet</p>
            )}
            {recentEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-2 py-1.5 border-b border-soc-border/50 last:border-0"
              >
                <SeverityBadge severity={ev.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-soc-text truncate">{ev.title}</p>
                  <p className="text-[10px] text-soc-muted font-mono">
                    {format(new Date(ev.timestamp), 'HH:mm:ss')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Open Alerts Table ── */}
      <div className="card-glow">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-soc-border">
          <FileText className="w-4 h-4 text-soc-accent" />
          <h2 className="text-sm font-semibold text-white">Open Alerts</h2>
          <span className="ml-auto text-xs text-soc-muted">{recentAlerts.length} shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-soc-border text-xs text-soc-muted uppercase tracking-wider">
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Severity</th>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Rule</th>
                <th className="px-5 py-3 text-left">Time</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-soc-muted text-xs">
                    No open alerts — system is healthy
                  </td>
                </tr>
              )}
              {recentAlerts.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-soc-border/50 hover:bg-soc-card/50 transition-colors"
                >
                  <td className="px-5 py-3 font-mono text-soc-muted text-xs">#{a.id}</td>
                  <td className="px-5 py-3"><SeverityBadge severity={a.severity} /></td>
                  <td className="px-5 py-3 text-soc-text max-w-xs truncate">{a.title}</td>
                  <td className="px-5 py-3 text-xs text-soc-muted font-mono">{a.rule_name ?? '—'}</td>
                  <td className="px-5 py-3 text-xs font-mono text-soc-muted">
                    {format(new Date(a.created_at), 'MM-dd HH:mm')}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
