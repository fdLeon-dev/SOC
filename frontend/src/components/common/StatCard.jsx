/** Reusable stat card widget for the dashboard. */
export default function StatCard({ label, value, icon: Icon, color = 'text-soc-accent', sub }) {
  return (
    <div className="card-glow p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-soc-muted uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-3xl font-bold font-mono ${color}`}>{value}</p>
          {sub && <p className="text-xs text-soc-muted mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg bg-soc-border/30 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  )
}
