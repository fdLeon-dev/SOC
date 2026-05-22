/**
 * DefenseOS - Incident Management Page
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Plus, X } from 'lucide-react'
import { incidentsApi } from '../lib/api'
import { SeverityBadge, StatusBadge } from '../components/common/Badge'
import toast from 'react-hot-toast'

const SEVERITIES = ['low', 'medium', 'high', 'critical']

function CreateIncidentModal({ onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ title: '', description: '', severity: 'medium' })

  const mutation = useMutation({
    mutationFn: (data) => incidentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] })
      toast.success('Incident created')
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.detail ?? 'Error'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="card-glow w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-soc-muted hover:text-soc-text">
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-base font-semibold text-white mb-4">New Incident</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-soc-text focus:outline-none focus:border-soc-accent"
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-soc-text focus:outline-none focus:border-soc-accent resize-none"
          />
          <select
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
            className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-soc-text focus:outline-none focus:border-soc-accent"
          >
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={!form.title || mutation.isPending}
            className="w-full bg-soc-accent text-soc-bg font-semibold py-2 rounded-lg hover:bg-soc-accent/90 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Creating…' : 'Create Incident'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Incidents() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => incidentsApi.list({ limit: 100 }).then((r) => r.data),
    refetchInterval: 20_000,
  })

  const patchMutation = useMutation({
    mutationFn: ({ id, status }) => incidentsApi.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents'] }),
  })

  return (
    <div className="space-y-4">
      {showModal && <CreateIncidentModal onClose={() => setShowModal(false)} />}

      <div className="flex items-center">
        <h2 className="text-sm text-soc-muted">{incidents.length} incidents</h2>
        <button
          onClick={() => setShowModal(true)}
          className="ml-auto flex items-center gap-2 bg-soc-accent/10 border border-soc-accent/30 text-soc-accent text-sm px-3 py-1.5 rounded-lg hover:bg-soc-accent/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Incident
        </button>
      </div>

      <div className="card-glow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-soc-border text-xs text-soc-muted uppercase tracking-wider">
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Severity</th>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Alerts</th>
                <th className="px-5 py-3 text-left">Created</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-soc-muted text-xs">
                    No incidents — create one to start an investigation
                  </td>
                </tr>
              )}
              {incidents.map((inc) => (
                <tr key={inc.id} className="border-b border-soc-border/40 hover:bg-soc-card/50">
                  <td className="px-5 py-3 font-mono text-xs text-soc-muted">#{inc.id}</td>
                  <td className="px-5 py-3"><SeverityBadge severity={inc.severity} /></td>
                  <td className="px-5 py-3 text-soc-text max-w-xs">
                    <p className="truncate">{inc.title}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-soc-muted font-mono">
                    {inc.alerts?.length ?? 0}
                  </td>
                  <td className="px-5 py-3 text-xs font-mono text-soc-muted">
                    {format(new Date(inc.created_at), 'MM-dd HH:mm')}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={inc.status} /></td>
                  <td className="px-5 py-3">
                    <select
                      defaultValue={inc.status}
                      onChange={(e) => patchMutation.mutate({ id: inc.id, status: e.target.value })}
                      className="bg-soc-bg border border-soc-border text-xs text-soc-text rounded px-2 py-1 focus:outline-none focus:border-soc-accent"
                    >
                      {['open', 'in_progress', 'contained', 'resolved', 'closed'].map((s) => (
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
