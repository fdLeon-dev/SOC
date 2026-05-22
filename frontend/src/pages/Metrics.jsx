/**
 * DefenseOS - System Metrics Page
 * Live CPU, memory, disk, network visualization.
 */
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { useRef, useState, useEffect } from 'react'
import { metricsApi } from '../lib/api'
import MetricGauge from '../components/common/MetricGauge'
import { formatBytes, formatUptime } from '../lib/utils'
import { Activity, HardDrive, Cpu, MemoryStick } from 'lucide-react'

const MAX_HISTORY = 60

export default function Metrics() {
  const historyRef = useRef([])
  const [history, setHistory] = useState([])

  const { data: metrics } = useQuery({
    queryKey: ['metrics-system'],
    queryFn: () => metricsApi.system().then((r) => r.data),
    refetchInterval: 5_000,
  })

  useEffect(() => {
    if (!metrics) return
    const point = {
      time: new Date().toLocaleTimeString('en', { hour12: false }),
      cpu: metrics.cpu_percent,
      memory: metrics.memory_percent,
    }
    historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), point]
    setHistory([...historyRef.current])
  }, [metrics])

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-glow p-4">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-soc-accent" />
            <span className="text-xs text-soc-muted uppercase">CPU</span>
          </div>
          <MetricGauge label={`${metrics?.cpu_count ?? '?'} cores`} value={metrics?.cpu_percent ?? 0} />
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-soc-accent" />
            <span className="text-xs text-soc-muted uppercase">Memory</span>
          </div>
          <MetricGauge
            label={`${metrics?.memory_used_gb ?? 0} / ${metrics?.memory_total_gb ?? 0} GB`}
            value={metrics?.memory_percent ?? 0}
          />
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-4 h-4 text-soc-accent" />
            <span className="text-xs text-soc-muted uppercase">Disk (/)</span>
          </div>
          {metrics?.disks?.[0] ? (
            <MetricGauge
              label={`${metrics.disks[0].used_gb} / ${metrics.disks[0].total_gb} GB`}
              value={metrics.disks[0].percent}
            />
          ) : <p className="text-soc-muted text-xs">N/A</p>}
        </div>
        <div className="card-glow p-4 flex flex-col justify-between">
          <span className="text-xs text-soc-muted uppercase mb-2">Uptime</span>
          <p className="text-2xl font-bold font-mono text-soc-green">
            {metrics ? formatUptime(metrics.uptime_seconds) : '—'}
          </p>
          <p className="text-xs text-soc-muted font-mono mt-1">
            Load: {metrics?.load_avg_1m?.toFixed(2) ?? '—'}
          </p>
        </div>
      </div>

      {/* CPU + Memory chart */}
      <div className="card-glow p-5">
        <h2 className="text-sm font-semibold text-white mb-4">CPU & Memory History (last 60 ticks)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={history} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7f9e' }} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7f9e' }} unit="%" />
            <Tooltip
              contentStyle={{ background: '#141d35', border: '1px solid #1e2d4a', borderRadius: 8 }}
              labelStyle={{ color: '#c8d6f0' }}
            />
            <Area type="monotone" dataKey="cpu" stroke="#00d4ff" fill="url(#cpuGrad)" name="CPU %" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="memory" stroke="#00ff88" fill="url(#memGrad)" name="Memory %" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Network IO table */}
      {metrics?.network?.length > 0 && (
        <div className="card-glow overflow-hidden">
          <div className="px-5 py-4 border-b border-soc-border">
            <h2 className="text-sm font-semibold text-white">Network Interfaces</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soc-border text-xs text-soc-muted uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Interface</th>
                  <th className="px-5 py-3 text-right">Bytes Sent</th>
                  <th className="px-5 py-3 text-right">Bytes Recv</th>
                  <th className="px-5 py-3 text-right">Pkts Sent</th>
                  <th className="px-5 py-3 text-right">Pkts Recv</th>
                  <th className="px-5 py-3 text-right">Errors In</th>
                </tr>
              </thead>
              <tbody>
                {metrics.network.map((iface) => (
                  <tr key={iface.name} className="border-b border-soc-border/40 hover:bg-soc-card/50">
                    <td className="px-5 py-2.5 font-mono text-soc-accent text-sm">{iface.name}</td>
                    <td className="px-5 py-2.5 text-right font-mono text-xs text-soc-muted">{formatBytes(iface.bytes_sent)}</td>
                    <td className="px-5 py-2.5 text-right font-mono text-xs text-soc-muted">{formatBytes(iface.bytes_recv)}</td>
                    <td className="px-5 py-2.5 text-right font-mono text-xs text-soc-muted">{iface.packets_sent.toLocaleString()}</td>
                    <td className="px-5 py-2.5 text-right font-mono text-xs text-soc-muted">{iface.packets_recv.toLocaleString()}</td>
                    <td className="px-5 py-2.5 text-right font-mono text-xs"
                        style={{ color: iface.errors_in > 0 ? '#ff4757' : '#6b7f9e' }}>
                      {iface.errors_in}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
