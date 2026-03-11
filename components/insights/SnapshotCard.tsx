import React from 'react'
import Card from './ui/Card'
import Badge from './ui/Badge'
import type { AttentionItem, SnapshotData } from './types'

function severityDot(sev: AttentionItem['severity']) {
  const map: Record<AttentionItem['severity'], string> = {
    low: 'bg-gray-400',
    medium: 'bg-yellow-400',
    high: 'bg-red-500',
  }
  return <span className={`h-2.5 w-2.5 rounded-full ${map[sev]}`} />
}

export default function SnapshotCard({
  snapshot,
  attentionItems,
}: {
  snapshot: SnapshotData
  attentionItems: AttentionItem[]
}) {
  return (
    <Card
      title="Snapshot"
      right={
        <Badge tone={snapshot.coverage.label === 'Good' ? 'green' : 'yellow'}>
          {snapshot.coverage.label} coverage
        </Badge>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-600">Last upload</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {snapshot.lastUpload.type}
          </p>
          <p className="mt-1 text-xs text-gray-700">{snapshot.lastUpload.date}</p>
          {snapshot.lastUpload.facility ? (
            <p className="mt-1 text-xs text-gray-500">{snapshot.lastUpload.facility}</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-600">Tracked conditions</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {snapshot.trackedConditions.length ? (
              snapshot.trackedConditions.map(c => (
                <Badge key={c} tone="blue">
                  {c}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-700">No conditions detected yet.</p>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-500">{snapshot.coverage.detail}</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-gray-900">Attention items</p>
        <div className="mt-3 space-y-3">
          {attentionItems.map(item => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4"
            >
              <div className="mt-1">{severityDot(item.severity)}</div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="mt-1 text-sm text-gray-700">{item.detail}</p>
              </div>

              <div className="ml-auto">
                <Badge
                  tone={
                    item.severity === 'high'
                      ? 'red'
                      : item.severity === 'medium'
                        ? 'yellow'
                        : 'gray'
                  }
                >
                  {item.severity.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Note: Insights are generated from uploaded documents and may be incomplete. This is not a diagnosis.
        </p>
      </div>
    </Card>
  )
}