/**
 * DefenseOS - Security Events Page
 */
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useState } from 'react'
import { eventsApi } from '../lib/api'
import { SeverityBadge } from '../components/common/Badge'

const CATEGORIES = ['', 'authentication', 'network', 'process', 'file', 'system', 'log', 'other']
const SEVERITIES  = ['', 'critical', 'high', 'medium', 'low', 'info']

export default function Events() {
  const [category, setCategory] = useState('')
  const [severity, setSeverity] = useState('')

  const { data: events = [], isFetching } = useQuery({
    queryKey: ['events', category, severity],
    queryFn: () =>
      eventsApi
        .list({
          ...(category && { category }),
          ...(severity && { severity }),
          limit: 300,
        })
        .then((r) => r.data),
    refetchInterval: 10_000,
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-soc-card border border-soc-border text-sm text-soc-text rounded-lg px-3 py-1.5 focus:outline-none focus:border-soc-accent"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c || 'All Categories'}</option>
          ))}
        </select>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="bg-soc-card border border-soc-border text-sm text-soc-text rounded-lg px-3 py-1.5 focus:outline-none focus:border-soc-accent"
        >
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>{s || 'All Severities'}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-soc-muted">
          {isFetching ? 'Refreshing…' : `${events.length} events`}
        </span>
      </div>

      {/* Table */}
      <div className="card-glow overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-soc-card z-10">
              <tr className="border-b border-soc-border text-xs text-soc-muted uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Sev</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Host</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">MITRE</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-soc-muted text-xs">
                    No events yet — monitoring is active
                  </td>
                </tr>
              )}
              {events.map((ev) => (
                <tr
                  key={ev.id}
                  className="border-b border-soc-border/40 hover:bg-soc-card/50 transition-colors"
                >
                  <td className="px-4 py-2.5 text-xs font-mono text-soc-muted whitespace-nowrap">
                    {format(new Date(ev.timestamp), 'MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-4 py-2.5"><SeverityBadge severity={ev.severity} /></td>
                  <td className="px-4 py-2.5 text-xs text-soc-muted capitalize">{ev.category}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-soc-muted">{ev.source_host}</td>
                  <td className="px-4 py-2.5 text-sm text-soc-text max-w-sm truncate">{ev.title}</td>
                  <td className="px-4 py-2.5">
                    {ev.mitre_technique && (
                      <span className="text-xs font-mono bg-soc-border/50 px-1.5 py-0.5 rounded text-soc-accent">
                        {ev.mitre_technique}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
