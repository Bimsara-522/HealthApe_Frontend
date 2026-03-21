'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useRouter } from 'next/navigation'
import Card from './ui/Card'
import Badge from './ui/Badge'
import type { TrackedLab } from './types'
import { statusTone } from './utils'

export default function LabTrendsCard({
  labs,
  onTrackTest,
}: {
  labs: TrackedLab[]
  onTrackTest?: (labKey: string) => void
}) {
  const router = useRouter()
  const [selectedLabKey, setSelectedLabKey] = useState('')
  const [showSources, setShowSources] = useState(false)

  useEffect(() => {
    if (!selectedLabKey && labs[0]?.key) {
      setSelectedLabKey(labs[0].key)
    }
  }, [labs, selectedLabKey])

  useEffect(() => {
    if (selectedLabKey && !labs.some((l) => l.key === selectedLabKey)) {
      setSelectedLabKey(labs[0]?.key ?? '')
    }
  }, [labs, selectedLabKey])

  const selectedLab = useMemo(
    () => labs.find((l) => l.key === selectedLabKey) ?? labs[0],
    [labs, selectedLabKey]
  )

  const trackedCount = useMemo(
    () => labs.filter((l) => l.isTracked).length,
    [labs]
  )

  const labHighlights = useMemo(() => {
    const rank = (lab: TrackedLab) => {
      if (lab.isTracked) return 0
      if (lab.status === 'High' || lab.status === 'Low') return 1
      if (lab.status === 'Unknown') return 3
      return 2
    }

    return [...labs].sort((a, b) => rank(a) - rank(b)).slice(0, 5)
  }, [labs])

  const isTrackDisabled =
    !!selectedLab && !selectedLab.isTracked && trackedCount >= 5

  return (
    <Card
      title="Lab trends & highlights"
      right={
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Track:</span>
          <select
            value={selectedLabKey}
            onChange={(e) => {
              setSelectedLabKey(e.target.value)
              setShowSources(false)
            }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {labs.map((l) => (
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
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">Key highlights</p>
            <span className="text-xs text-gray-500">
              Tracked {trackedCount}/5
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {labHighlights.map((l) => (
              <button
                key={l.key}
                onClick={() => {
                  setSelectedLabKey(l.key)
                  setShowSources(false)
                }}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  l.key === selectedLabKey
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-100 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {l.displayName}
                      </p>
                      {l.isTracked ? (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                          Tracked
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <Badge tone={statusTone(l.status)}>{l.status}</Badge>
                </div>

                <p className="mt-1 text-sm text-gray-700">
                  Latest: <span className="font-medium">{l.latestValueText}</span>{' '}
                  {l.unit}
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedLab.displayName} trend
                    </p>
                    {selectedLab.isTracked ? (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                        Tracked
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Latest {selectedLab.latestDate}: {selectedLab.latestValueText}{' '}
                    {selectedLab.unit}
                    {typeof selectedLab.refLow === 'number' &&
                    typeof selectedLab.refHigh === 'number'
                      ? ` · Reference: ${selectedLab.refLow}–${selectedLab.refHigh} ${selectedLab.unit}`
                      : ''}
                  </p>
                </div>

                <Badge tone={statusTone(selectedLab.status)}>
                  {selectedLab.status}
                </Badge>
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
                  onClick={() => setShowSources((prev) => !prev)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  {showSources ? 'Hide details' : 'View details'}
                </button>

                <button
                  onClick={() => selectedLab && onTrackTest?.(selectedLab.key)}
                  disabled={isTrackDisabled}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    isTrackDisabled
                      ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                      : selectedLab.isTracked
                      ? 'border-red-200 bg-white text-red-600 hover:bg-red-50'
                      : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {selectedLab.isTracked ? 'Untrack this test' : 'Track this test'}
                </button>
              </div>

              {isTrackDisabled ? (
                <p className="mt-2 text-xs text-gray-500">
                  You can track up to 5 tests only. Untrack one to add another.
                </p>
              ) : null}

              {showSources ? (
                <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Source reports behind this trend
                    </p>
                    <span className="text-xs text-gray-500">
                      {selectedLab.sourceReports?.length ?? 0} report
                      {(selectedLab.sourceReports?.length ?? 0) !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {selectedLab.sourceReports?.length ? (
                    <div className="space-y-3">
                      {selectedLab.sourceReports.map((report) => (
                        <div
                          key={`${report.docId}_${report.date}_${report.value}`}
                          className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {report.date}
                              {report.value != null ? ` · ${report.value}` : ''}
                              {report.unit ? ` ${report.unit}` : ''}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {report.hospital || 'Unknown facility'}
                              {report.docCategory ? ` · ${report.docCategory}` : ''}
                            </p>
                          </div>

                          <button
                            onClick={() => router.push(`/records/${report.docId}`)}
                            className="shrink-0 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                          >
                            View details
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No source report details available for this trend yet.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-gray-700">No lab trend data available yet.</p>
          )}
        </div>
      </div>
    </Card>
  )
}