'use client'

import React, { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import Card from './ui/Card'
import Badge from './ui/Badge'
import type { TrackedLab } from './types'
import { statusTone } from './utils'

export default function LabTrendsCard({
  labs,
  onViewReport,
  onTrackTest,
}: {
  labs: TrackedLab[]
  onViewReport?: (labKey: string) => void
  onTrackTest?: (labKey: string) => void
}) {
  const [selectedLabKey, setSelectedLabKey] = useState(labs[0]?.key ?? '')

  const selectedLab = useMemo(
    () => labs.find(l => l.key === selectedLabKey) ?? labs[0],
    [labs, selectedLabKey]
  )

  const labHighlights = useMemo(() => {
    const rank = (s: TrackedLab['status']) =>
      s === 'High' || s === 'Low' ? 0 : s === 'Unknown' ? 2 : 1
    return [...labs].sort((a, b) => rank(a.status) - rank(b.status)).slice(0, 5)
  }, [labs])

  return (
    <Card
      title="Lab trends & highlights"
      right={
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Track:</span>
          <select
            value={selectedLabKey}
            onChange={e => setSelectedLabKey(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {labs.map(l => (
              <option key={l.key} value={l.key}>
                {l.displayName}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-gray-900">Key highlights</p>
          <div className="mt-3 space-y-3">
            {labHighlights.map(l => (
              <button
                key={l.key}
                onClick={() => setSelectedLabKey(l.key)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  l.key === selectedLabKey
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-100 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">{l.displayName}</p>
                  <Badge tone={statusTone(l.status)}>{l.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-700">
                  Latest: <span className="font-medium">{l.latestValueText}</span> {l.unit}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {l.latestDate}
                  {l.facility ? ` · ${l.facility}` : ''}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedLab ? (
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedLab.displayName} trend
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Latest {selectedLab.latestDate}: {selectedLab.latestValueText}{' '}
                    {selectedLab.unit}
                    {typeof selectedLab.refLow === 'number' &&
                    typeof selectedLab.refHigh === 'number'
                      ? ` · Reference: ${selectedLab.refLow}–${selectedLab.refHigh} ${selectedLab.unit}`
                      : ''}
                  </p>
                </div>
                <Badge tone={statusTone(selectedLab.status)}>{selectedLab.status}</Badge>
              </div>

              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedLab.series}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    {typeof selectedLab.refLow === 'number' ? (
                      <ReferenceLine y={selectedLab.refLow} strokeDasharray="4 4" />
                    ) : null}
                    {typeof selectedLab.refHigh === 'number' ? (
                      <ReferenceLine y={selectedLab.refHigh} strokeDasharray="4 4" />
                    ) : null}
                    <Line type="monotone" dataKey="value" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => selectedLab && onViewReport?.(selectedLab.key)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  View source lab report
                </button>
                <button
                  onClick={() => selectedLab && onTrackTest?.(selectedLab.key)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  Track this test
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700">No lab trend data available yet.</p>
          )}
        </div>
      </div>
    </Card>
  )
}