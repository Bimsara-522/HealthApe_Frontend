import Card from './ui/Card'
import Badge from './ui/Badge'
import type { Milestone } from './types'
import { milestoneTone } from './utils'

export default function MilestoneTimelineCard({
  milestones,
  onViewFullHistory,
}: {
  milestones: Milestone[]
  onViewFullHistory?: () => void
}) {
  return (
    <Card title="Milestone timeline" right={<Badge tone="gray">Noteworthy events</Badge>}>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {milestones.map(m => (
          <div key={m.id} className="flex gap-4">
            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-gray-900" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                <Badge tone={milestoneTone(m.tag)}>{m.tag}</Badge>
                <span className="text-xs text-gray-500">{m.date}</span>
              </div>
              <p className="mt-1 text-sm text-gray-700">{m.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={onViewFullHistory}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          View full history
        </button>
      </div>
    </Card>
  )
}