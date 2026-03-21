import Card from './ui/Card'
import Badge from './ui/Badge'
import type { DataQualityIssue } from './types'

export default function DataQualityCard({
  issues,
  onAction,
  onSkip,
}: {
  issues: DataQualityIssue[]
  onAction?: (issueId: string) => void
  onSkip?: (issueId: string) => void
}) {
  return (
    <Card title="Data quality & fixes" right={<Badge tone="yellow">Improves accuracy</Badge>}>
      <div className="space-y-3">
        {issues.map(issue => (
          <div key={issue.id} className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-sm font-semibold text-gray-900">{issue.title}</p>
            <p className="mt-1 text-sm text-gray-700">{issue.detail}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => onAction?.(issue.id)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                {issue.actionLabel}
              </button>

              <button
                onClick={() => onSkip?.(issue.id)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {issue.skipLabel ?? 'Keep separate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Tip: Fixing these helps trends and summaries become more reliable.
      </p>
    </Card>
  )
}