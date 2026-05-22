/**
 * DefenseOS - Alerts Page
 * Full alert list with status management.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Filter, RefreshCw } from 'lucide-react'
import { alertsApi } from '../lib/api'
import { SeverityBadge, StatusBadge } from '../components/common/Badge'
import toast from 'react-hot-toast'

const STATUSES = ['', 'open', 'investigating', 'resolved', 'false_positive']
const SEVERITIES = ['', 'critical', 'high', 'medium', 'low']

export default function Alerts() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')

  const { data: alerts = [], isFetching, refetch } = useQuery({
    queryKey: ['alerts', statusFilter, severityFilter],
    queryFn: () =>
      alertsApi
        .list({
          ...(statusFilter && { status: statusFilter }),
          ...(severityFilter && { severity: severityFilter }),
          limit: 200,
        })
        .then((r) => r.data),
    refetchInterval: 20_000,
  })

  const patchMutation = useMutation({
    mutationFn: ({ id, status }) => alertsApi.update(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] })
      qc.invalidateQueries({ queryKey: ['alert-stats'] })
      toast.success('Alert updated')
    },
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-4 h-4 text-soc-muted" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-soc-card border border-soc-border text-sm text-soc-text rounded-lg px-3 py-1.5 focus:outline-none focus:border-soc-accent"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s || 'All Statuses'}</option>
          ))}
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-soc-card border border-soc-border text-sm text-soc-text rounded-lg px-3 py-1.5 focus:outline-none focus:border-soc-accent"
        >
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>{s || 'All Severities'}</option>
          ))}
        </select>
        <button
          onClick={() => refetch()}
          className="ml-auto flex items-center gap-1.5 text-xs text-soc-muted hover:text-soc-text"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="card-glow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-soc-border text-xs text-soc-muted uppercase tracking-wider">
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Severity</th>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Rule</th>
                <th className="px-5 py-3 text-left">Created</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-soc-muted text-xs">
                    No alerts match the current filters
                  </td>
                </tr>
              )}
              {alerts.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-soc-border/40 hover:bg-soc-card/50 transition-colors"
                >
                  <td className="px-5 py-3 font-mono text-xs text-soc-muted">#{a.id}</td>
                  <td className="px-5 py-3"><SeverityBadge severity={a.severity} /></td>
                  <td className="px-5 py-3 text-soc-text max-w-xs">
                    <p className="truncate">{a.title}</p>
                    {a.description && (
                      <p className="text-xs text-soc-muted truncate mt-0.5">{a.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs font-mono text-soc-muted">{a.rule_name ?? '—'}</td>
                  <td className="px-5 py-3 text-xs font-mono text-soc-muted">
                    {format(new Date(a.created_at), 'MM-dd HH:mm')}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3">
                    <select
                      defaultValue={a.status}
                      onChange={(e) =>
                        patchMutation.mutate({ id: a.id, status: e.target.value })
                      }
                      className="bg-soc-bg border border-soc-border text-xs text-soc-text rounded px-2 py-1 focus:outline-none focus:border-soc-accent"
                    >
                      {STATUSES.filter(Boolean).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
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
