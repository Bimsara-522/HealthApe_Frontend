import { useMemo, useState } from 'react'
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
  const [showAllMerges, setShowAllMerges] = useState(false)
  const [showAllIgnored, setShowAllIgnored] = useState(false)
  const [openGrouped, setOpenGrouped] = useState(true)
  const [openMerged, setOpenMerged] = useState(true)
  const [openIgnored, setOpenIgnored] = useState(true)

  const previewCount = 4

  const visibleMerges = showAllMerges ? merges : merges.slice(0, previewCount)
  const visibleIgnored = showAllIgnored ? ignored : ignored.slice(0, previewCount)

  const groupedMerges = useMemo(() => {
    const map = new Map<string, string[]>()

    for (const item of merges) {
      if (!map.has(item.canonicalName)) {
        map.set(item.canonicalName, [])
      }
      map.get(item.canonicalName)!.push(item.rawName)
    }

    return Array.from(map.entries())
      .map(([canonical, raws]) => [
        canonical,
        Array.from(new Set(raws)).sort((a, b) => a.localeCompare(b)),
      ] as const)
      .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
  }, [merges])

  const meaningfulGroupedMerges = groupedMerges.filter(
    ([, raws]) => raws.length > 1
  )

  if (!merges.length && !ignored.length) return null

  return (
    <Card
      title="Metric decisions"
      right={<Badge tone="gray">User-reviewed</Badge>}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            {merges.length} merged
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {ignored.length} kept separate
          </span>
        </div>

        <p className="text-xs leading-relaxed text-gray-500">
          These are the metric matching decisions already made by the user. They
          can be undone at any time.
        </p>

        {meaningfulGroupedMerges.length > 0 && (
          <section className="rounded-2xl border border-gray-200 bg-gray-50/90">
            <button
              type="button"
              onClick={() => setOpenGrouped((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-gray-500" />
                <p className="text-sm font-semibold text-gray-900">
                  Grouped metrics
                </p>
                <span className="text-xs text-gray-500">
                  ({meaningfulGroupedMerges.length})
                </span>
              </div>

              <span className="text-xs font-medium text-gray-600">
                {openGrouped ? 'Hide' : 'Show'}
              </span>
            </button>

            {openGrouped && (
              <div className="border-t border-gray-200 px-4 py-3">
                <div className="space-y-3">
                  {meaningfulGroupedMerges.map(([canonical, raws]) => (
                    <div
                      key={canonical}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-3"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {canonical}
                        <span className="ml-2 text-xs font-medium text-gray-400">
                          {raws.length} linked
                        </span>
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {raws.map((r) => (
                          <span
                            key={r}
                            className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {merges.length > 0 && (
          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/40">
            <button
              type="button"
              onClick={() => setOpenMerged((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <p className="text-sm font-semibold text-gray-900">
                  Merged together
                </p>
                <span className="text-xs text-gray-500">({merges.length})</span>
              </div>
              <span className="text-xs font-medium text-emerald-700">
                {openMerged ? 'Hide' : 'Show'}
              </span>
            </button>

            {openMerged && (
              <div className="border-t border-emerald-100 px-3 py-3">
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {visibleMerges.map((m) => (
                    <div
                      key={`${m.rawName}__${m.canonicalName}`}
                      className="flex flex-col gap-3 rounded-xl border border-white/70 bg-white px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {m.rawName}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          merged into{' '}
                          <span className="font-medium text-emerald-700">
                            {m.canonicalName}
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={() => onUndoMerge(m.rawName)}
                        className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Undo
                      </button>
                    </div>
                  ))}
                </div>

                {(merges.length > previewCount || showAllMerges) && (
                  <div className="mt-3 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAllMerges((v) => !v)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100/60"
                    >
                      {showAllMerges
                        ? 'Show less'
                        : `Show ${merges.length - previewCount} more`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {ignored.length > 0 && (
          <section className="rounded-2xl border border-blue-100 bg-blue-50/40">
            <button
              type="button"
              onClick={() => setOpenIgnored((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <p className="text-sm font-semibold text-gray-900">
                  Kept separate
                </p>
                <span className="text-xs text-gray-500">
                  ({ignored.length})
                </span>
              </div>
              <span className="text-xs font-medium text-blue-700">
                {openIgnored ? 'Hide' : 'Show'}
              </span>
            </button>

            {openIgnored && (
              <div className="border-t border-blue-100 px-3 py-3">
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {visibleIgnored.map((item) => (
                    <div
                      key={`${item.metricA}__${item.metricB}`}
                      className="flex flex-col gap-3 rounded-xl border border-white/70 bg-white px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {item.metricA}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          kept separate from{' '}
                          <span className="font-medium text-blue-700">
                            {item.metricB}
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          onUndoKeepSeparate(item.metricA, item.metricB)
                        }
                        className="shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        Allow merge
                      </button>
                    </div>
                  ))}
                </div>

                {(ignored.length > previewCount || showAllIgnored) && (
                  <div className="mt-3 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAllIgnored((v) => !v)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100/60"
                    >
                      {showAllIgnored
                        ? 'Show less'
                        : `Show ${ignored.length - previewCount} more`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </Card>
  )
}