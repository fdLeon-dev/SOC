/** Gauge-style progress bar for metric percentages. */
import { metricColor } from '../../lib/utils'

export default function MetricGauge({ label, value, unit = '%' }) {
  const color = metricColor(value)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-soc-muted">{label}</span>
        <span className="font-mono" style={{ color }}>{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-soc-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
