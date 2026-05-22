/**
 * DefenseOS - Processes & Network Pages (combined module)
 */
import { useQuery } from '@tanstack/react-query'
import { metricsApi } from '../lib/api'
import clsx from 'clsx'

export function Processes() {
  const { data: procs = [], isFetching } = useQuery({
    queryKey: ['processes'],
    queryFn: () => metricsApi.processes().then((r) => r.data),
    refetchInterval: 10_000,
  })

  return (
    <div className="card-glow overflow-hidden">
      <div className="flex items-center px-5 py-4 border-b border-soc-border">
        <h2 className="text-sm font-semibold text-white">Top Processes by CPU</h2>
        <span className="ml-auto text-xs text-soc-muted">{isFetching ? 'Refreshing…' : `${procs.length} processes`}</span>
      </div>
      <div className="overflow-x-auto max-h-[75vh]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-soc-card">
            <tr className="border-b border-soc-border text-xs text-soc-muted uppercase tracking-wider">
              <th className="px-5 py-3 text-left">PID</th>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">User</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">CPU %</th>
              <th className="px-5 py-3 text-right">MEM MB</th>
              <th className="px-5 py-3 text-left">Flag</th>
            </tr>
          </thead>
          <tbody>
            {procs.map((p) => (
              <tr
                key={p.pid}
                className={clsx(
                  'border-b border-soc-border/40 transition-colors',
                  p.is_suspicious
                    ? 'bg-red-900/10 hover:bg-red-900/20'
                    : 'hover:bg-soc-card/50'
                )}
              >
                <td className="px-5 py-2.5 font-mono text-xs text-soc-muted">{p.pid}</td>
                <td className="px-5 py-2.5 font-mono text-sm text-soc-text">{p.name}</td>
                <td className="px-5 py-2.5 text-xs text-soc-muted">{p.username}</td>
                <td className="px-5 py-2.5 text-xs text-soc-muted capitalize">{p.status}</td>
                <td className="px-5 py-2.5 text-right font-mono text-xs"
                    style={{ color: p.cpu_percent > 50 ? '#ff4757' : p.cpu_percent > 20 ? '#ffd700' : '#6b7f9e' }}>
                  {p.cpu_percent.toFixed(1)}%
                </td>
                <td className="px-5 py-2.5 text-right font-mono text-xs text-soc-muted">
                  {p.memory_mb.toFixed(0)}
                </td>
                <td className="px-5 py-2.5">
                  {p.is_suspicious && (
                    <span className="text-xs badge-high px-1.5 py-0.5 rounded border" title={p.suspicious_reason}>
                      ⚠ Suspicious
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Network() {
  const { data: ports = [] } = useQuery({
    queryKey: ['ports'],
    queryFn: () => metricsApi.ports().then((r) => r.data),
    refetchInterval: 30_000,
  })
  const { data: conns = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: () => metricsApi.connections().then((r) => r.data),
    refetchInterval: 15_000,
  })

  return (
    <div className="space-y-6">
      {/* Listening Ports */}
      <div className="card-glow overflow-hidden">
        <div className="px-5 py-4 border-b border-soc-border">
          <h2 className="text-sm font-semibold text-white">Listening Ports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-soc-border text-xs text-soc-muted uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Port</th>
                <th className="px-5 py-3 text-left">Protocol</th>
                <th className="px-5 py-3 text-left">Address</th>
                <th className="px-5 py-3 text-left">PID</th>
                <th className="px-5 py-3 text-left">Process</th>
              </tr>
            </thead>
            <tbody>
              {ports.map((p) => (
                <tr key={`${p.port}-${p.protocol}`} className="border-b border-soc-border/40 hover:bg-soc-card/50">
                  <td className="px-5 py-2.5 font-mono text-soc-accent font-medium">{p.port}</td>
                  <td className="px-5 py-2.5 text-xs uppercase text-soc-muted">{p.protocol}</td>
                  <td className="px-5 py-2.5 font-mono text-xs text-soc-muted">{p.local_address}</td>
                  <td className="px-5 py-2.5 font-mono text-xs text-soc-muted">{p.pid ?? '—'}</td>
                  <td className="px-5 py-2.5 text-xs text-soc-text">{p.process_name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Connections */}
      <div className="card-glow overflow-hidden">
        <div className="px-5 py-4 border-b border-soc-border">
          <h2 className="text-sm font-semibold text-white">Active Connections</h2>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-soc-card">
              <tr className="border-b border-soc-border text-xs text-soc-muted uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Local</th>
                <th className="px-5 py-3 text-left">Remote</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Process</th>
              </tr>
            </thead>
            <tbody>
              {conns.map((c, i) => (
                <tr key={i} className="border-b border-soc-border/40 hover:bg-soc-card/50">
                  <td className="px-5 py-2 font-mono text-xs text-soc-text">
                    {c.local_address}:{c.local_port}
                  </td>
                  <td className="px-5 py-2 font-mono text-xs text-soc-muted">
                    {c.remote_address ? `${c.remote_address}:${c.remote_port}` : '—'}
                  </td>
                  <td className="px-5 py-2 text-xs text-soc-muted">{c.status}</td>
                  <td className="px-5 py-2 text-xs text-soc-muted">{c.process_name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
