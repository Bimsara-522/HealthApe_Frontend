"use client"

import { useState } from 'react'
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
  onViewLabTrends,
}: {
  snapshot: SnapshotData
  attentionItems: AttentionItem[]
  onViewLabTrends?: () => void
}) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

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
          <p className="text-xs font-medium text-gray-600">Latest uploaded document</p>

          {snapshot.lastUpload ? (
            <>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {snapshot.lastUpload.type}
              </p>
              <p className="mt-1 text-xs text-gray-700">{snapshot.lastUpload.date}</p>
              {snapshot.lastUpload.facility ? (
                <p className="mt-1 text-xs text-gray-500">{snapshot.lastUpload.facility}</p>
              ) : null}
            </>
          ) : (
            <p className="mt-1 text-sm text-gray-700">No uploads yet.</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-600">Tracked conditions</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {snapshot.trackedConditions.length ? (
              snapshot.trackedConditions.map((c) => (
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
          {attentionItems.map((item) => {
            const isOpen = Boolean(openItems[item.id])
            const hasExtraContent =
              Boolean(item.fullDetail) || Boolean(item.detailsList?.length)

            return (
              <div
                key={item.id}
                className="rounded-xl border border-gray-100 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 shrink-0">{severityDot(item.severity)}</div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>

                        <p className="mt-1 text-sm leading-6 text-gray-700">
                          <span>{item.detail}</span>
                          {hasExtraContent ? (
                            <>
                              {' '}
                              <button
                                type="button"
                                onClick={() => toggleItem(item.id)}
                                className="inline font-medium text-blue-600 hover:text-blue-700"
                              >
                                {isOpen ? 'Show less' : 'Show more'}
                              </button>
                            </>
                          ) : null}
                        </p>
                      </div>

                      <div className="shrink-0">
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
                  </div>
                </div>

                {isOpen ? (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {item.fullDetail ? (
                      <p className="text-sm text-gray-700">{item.fullDetail}</p>
                    ) : null}

                    {item.detailsList?.length ? (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                        {item.detailsList.map((entry) => (
                          <li key={entry}>{entry}</li>
                        ))}
                      </ul>
                    ) : null}

                    {item.type === 'abnormal' && onViewLabTrends ? (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={onViewLabTrends}
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
                        >
                          View Lab trends
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Note: Insights are generated from uploaded documents and may be incomplete. This is not a diagnosis.
        </p>
      </div>
    </Card>
  )
}