import clsx from 'clsx'

/** Returns Tailwind badge class for a severity level. */
export function severityClass(sev) {
  return clsx('px-2 py-0.5 rounded text-xs font-mono font-medium border', {
    'badge-critical': sev === 'critical',
    'badge-high':     sev === 'high',
    'badge-medium':   sev === 'medium',
    'badge-low':      sev === 'low',
    'badge-info':     sev === 'info',
  })
}

/** Returns Tailwind badge class for an alert/incident status. */
export function statusClass(status) {
  return clsx('px-2 py-0.5 rounded text-xs font-mono font-medium border', {
    'badge-open':          status === 'open',
    'badge-investigating': status === 'investigating',
    'badge-resolved':      status === 'resolved',
    'badge-false_positive': status === 'false_positive',
  })
}

/** Format bytes to human-readable string. */
export function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/** Format uptime seconds to a readable string. */
export function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/** Color for a metric percentage value. */
export function metricColor(pct) {
  if (pct >= 90) return '#ff4757'
  if (pct >= 75) return '#ffd700'
  return '#00ff88'
}
