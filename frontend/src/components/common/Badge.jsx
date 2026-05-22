import { severityClass, statusClass } from '../../lib/utils'

/** Generic badge component. */
export function SeverityBadge({ severity }) {
  return <span className={severityClass(severity)}>{severity}</span>
}

export function StatusBadge({ status }) {
  return <span className={statusClass(status)}>{status?.replace('_', ' ')}</span>
}
