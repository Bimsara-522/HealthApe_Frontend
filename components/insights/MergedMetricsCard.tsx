import React from 'react'
import Card from './ui/Card'

export default function MergedMetricsCard({
  merges,
  onUndo,
}: {
  merges: { rawName: string; canonicalName: string }[]
  onUndo: (rawName: string) => void
}) {
  if (!merges.length) return null

  return (
    <Card title="Merged metrics">

      <p className="text-xs text-gray-500 mb-3">
        These lab names were merged to keep trends consistent.
        You can undo any merge if they represent different tests.
      </p>

      <div className="space-y-3">
        {merges.map((m) => (
          <div
            key={m.rawName}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {m.rawName}
              </p>

              <p className="text-xs text-gray-500">
                merged into
              </p>

              <p className="text-sm font-medium text-gray-700">
                {m.canonicalName}
              </p>
            </div>

            <button
              onClick={() => onUndo(m.rawName)}
              className="rounded-lg border border-red-200 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Undo merge
            </button>
          </div>
        ))}
      </div>
    </Card>
  )
}