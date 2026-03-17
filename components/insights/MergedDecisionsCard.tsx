import React from 'react'
import Card from './ui/Card'
import Badge from './ui/Badge'

type MergeItem = {
  rawName: string
  canonicalName: string
}

type IgnoredItem = {
  metricA: string
  metricB: string
}

export default function MetricDecisionsCard({
  merges,
  ignored,
  onUndoMerge,
  onUndoKeepSeparate,
}: {
  merges: MergeItem[]
  ignored: IgnoredItem[]
  onUndoMerge: (rawName: string) => void
  onUndoKeepSeparate: (metricA: string, metricB: string) => void
}) {
  if (!merges.length && !ignored.length) return null

  return (
    <Card
      title="Metric decisions"
      right={<Badge tone="gray">User-reviewed</Badge>}
    >
      <p className="mb-4 text-xs leading-relaxed text-gray-500">
        These are the metric matching decisions you’ve already made. You can undo any of them at any time.
      </p>

      {merges.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <p className="text-sm font-semibold text-gray-900">Merged together</p>
            <span className="text-xs text-gray-500">({merges.length})</span>
          </div>

          <div className="space-y-3">
            {merges.map((m) => (
              <div
                key={m.rawName}
                className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{m.rawName}</p>
                    <p className="mt-1 text-xs text-emerald-700">merged into</p>
                    <p className="mt-1 text-sm font-medium text-gray-700">{m.canonicalName}</p>
                  </div>

                  <button
                    onClick={() => onUndoMerge(m.rawName)}
                    className="shrink-0 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Undo merge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {merges.length > 0 && ignored.length > 0 && (
        <div className="my-5 border-t border-dashed border-gray-200" />
      )}

      {ignored.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <p className="text-sm font-semibold text-gray-900">Kept separate</p>
            <span className="text-xs text-gray-500">({ignored.length})</span>
          </div>

          <div className="space-y-3">
            {ignored.map((item) => (
              <div
                key={`${item.metricA}__${item.metricB}`}
                className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{item.metricA}</p>
                    <p className="mt-1 text-xs text-blue-700">kept separate from</p>
                    <p className="mt-1 text-sm font-medium text-gray-700">{item.metricB}</p>
                  </div>

                  <button
                    onClick={() => onUndoKeepSeparate(item.metricA, item.metricB)}
                    className="shrink-0 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                  >
                    Allow merge again
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}