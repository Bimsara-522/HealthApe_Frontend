'use client'

import React, { useEffect, useState } from 'react'
import SnapshotCard from '@/components/insights/SnapshotCard'
import LabTrendsCard from '@/components/insights/LabTrendsCard'
import MilestoneTimelineCard from '@/components/insights/MilestoneTimelineCard'
import DataQualityCard from '@/components/insights/DataQualityCard'
import type { DataQualityIssue } from '@/components/insights/types'
import api from '@/lib/api/client'
import { useRouter } from 'next/navigation'
// import MergedMetricsCard from '@/components/insights/MergedMetricsCard'
import MetricDecisionsCard from '@/components/insights/MergedDecisionsCard'

type InsightsResponse = {
  patientName: string | null
  snapshot: any
  labs: any[]
  milestones: any[]
  attentionItems: any[]
  trackedMetricCount: number
}

type MetricMerge = {
  rawName: string
  canonicalName: string
}

type MetricMergeItem = {
  rawName: string
  canonicalName: string
}

type IgnoredMetricSuggestion = {
  metricA: string
  metricB: string
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsResponse | null>(null)
  const [qualityIssues, setQualityIssues] = useState<DataQualityIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [qualityLoading, setQualityLoading] = useState(false)
  const [merges, setMerges] = useState<MetricMerge[]>([])
  const [ignoredSuggestions, setIgnoredSuggestions] = useState<IgnoredMetricSuggestion[]>([])
  const router = useRouter()

  const loadInsights = async () => {
    const res = await api.get('/insights/getDetails')
    setData(res.data)
  }

  const loadMerges = async () => {
    const res = await api.get('/insights/metric-merges')
    setMerges(res.data ?? [])
  }

const loadIgnoredSuggestions = async () => {
  const res = await api.get<IgnoredMetricSuggestion[]>('/insights/ignored-metric-suggestions')
  setIgnoredSuggestions(res.data ?? [])
}

  const handleUndoMerge = async (rawName: string) => {
    await api.post('/insights/undo-metric-merge', { rawName })

    await loadInsights()
    await loadQualityIssues()
    await loadMerges()
  }
  

  const loadQualityIssues = async () => {
    setQualityLoading(true)
    try {
      const qualityRes = await api.get('/insights/data-quality')
      setQualityIssues(qualityRes.data ?? [])
    } finally {
      setQualityLoading(false)
    }
  }

  const handleUndoKeepSeparate = async (metricA: string, metricB: string) => {
  try {
    await api.post('/insights/undo-ignored-metric-suggestion', {
      metricA,
      metricB,
    })

    await loadQualityIssues()
    await loadIgnoredSuggestions()
  } catch (e) {
    console.error('Failed to undo keep-separate decision', e)
  }
}

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setErr(null)
        await Promise.all([ loadInsights(), loadQualityIssues(), loadMerges(), loadIgnoredSuggestions() ])
      } catch (e: any) {
        setErr(e?.response?.data?.message || e?.message || 'Failed to load insights')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleMergeMetric = async (issueId: string) => {
    const issue = qualityIssues.find((q) => q.id === issueId)
    if (!issue || !issue.rawName || !issue.suggestedCanonicalName) return

    try {
      await api.post('/insights/merge-metric', {
        rawName: issue.rawName,
        canonicalName: issue.suggestedCanonicalName,
      })

      setQualityIssues((prev) => prev.filter((q) => q.id !== issueId))

      await loadInsights()
      await loadQualityIssues()
    } catch (e) {
      console.error('Failed to merge metric', e)
    }
  }

  const handleSkipMetric = async (issueId: string) => {
    const issue = qualityIssues.find((q) => q.id === issueId)
    if (!issue || !issue.rawName || !issue.compareName) return

    try {
      await api.post('/insights/ignore-metric-suggestion', {
        metricA: issue.rawName,
        metricB: issue.compareName,
      })

      setQualityIssues((prev) => prev.filter((q) => q.id !== issueId))
      await loadQualityIssues()
    } catch (e) {
      console.error('Failed to ignore metric suggestion', e)
    }
  }

  if (loading) return <div className="text-sm text-gray-500">Loading insights…</div>
  if (err) return <div className="text-sm text-red-600">{err}</div>
  if (!data) return null

  const snapshot = {
    lastUpload: data.snapshot?.lastUpload
      ? { ...data.snapshot.lastUpload }
      : { date: '-', type: '-', facility: null },
    trackedConditions: [],
    coverage: data.snapshot?.coverage ?? { label: 'Partial', detail: '' },
  }

  const attentionItems = data.attentionItems ?? []

  const labs = (data.labs ?? []).map((l: any) => ({
    key: l.key,
    displayName: l.name,
    unit: l.unit ?? '',
    refLow: l.refLow ?? undefined,
    refHigh: l.refHigh ?? undefined,
    latestDate: l.latestDate ?? '',
    latestValueText: l.latestValueText ?? '',
    status: l.status ?? 'Unknown',
    facility: undefined,
    isTracked: Boolean(l.isTracked),
    sourceReports: l.sourceReports ?? [],
    series: l.series ?? [],
  }))

  const milestones = (data.milestones ?? []).map((m: any) => ({
    id: m.id,
    date: m.date,
    title: m.title,
    detail: m.detail,
    tag: m.tag,
  }))

  const sortedLabs = [...labs].sort((a, b) => {
  if (a.isTracked && !b.isTracked) return -1
  if (!a.isTracked && b.isTracked) return 1
  return 0
})

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">

  {/* Top snapshot */}
  <SnapshotCard snapshot={snapshot} attentionItems={attentionItems} />

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

    {/* LEFT MAIN CONTENT */}
    <div className="lg:col-span-2 space-y-6">

      <LabTrendsCard
        labs={sortedLabs}
        onTrackTest={async (labKey) => {
          const selectedLab = sortedLabs.find((lab) => lab.key === labKey)
          if (!selectedLab) return

          try {
            if (selectedLab.isTracked) {
              await api.post('/insights/untrack-metric', {
                metricKey: selectedLab.key,
              })
            } else {
              await api.post('/insights/track-metric', {
                metricKey: selectedLab.key,
                metricName: selectedLab.displayName,
              })
            }

            await loadInsights()
          } catch (e: any) {
            alert(
              e?.response?.data?.message ||
                e?.message ||
                'Failed to update tracked test'
            )
          }
        }}
      />

      <MilestoneTimelineCard
        milestones={milestones}
        onViewFullHistory={() => router.push('/insights/history')}
      />

    </div>

    {/* RIGHT SIDEBAR */}
    <div className="space-y-6">

      <DataQualityCard
              issues={qualityIssues}
              onAction={handleMergeMetric}
              onSkip={handleSkipMetric}
            />

      <MetricDecisionsCard
        merges={merges}
        ignored={ignoredSuggestions}
        onUndoMerge={handleUndoMerge}
        onUndoKeepSeparate={handleUndoKeepSeparate}
      />

    </div>

  </div>
</div>







    // <div className="space-y-6 animate-fade-in">
    //   <div className="space-y-1">
    //     <h1 className="text-xl font-bold text-gray-900">Health Insights</h1>
    //   </div>

    //   <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
    //     <div className="lg:col-span-2 space-y-6">
    //       <SnapshotCard snapshot={snapshot} attentionItems={attentionItems} />
    //       <LabTrendsCard labs={labs} />
    //       <MilestoneTimelineCard
    //         milestones={milestones}
    //         onViewFullHistory={() => router.push('/insights/history')}
    //       />
    //       <MergedMetricsCard
    //         merges={merges}
    //         onUndo={handleUndoMerge}
    //       />
    //     </div>

    //     <div className="lg:col-span-1 space-y-6">
    //       {qualityLoading ? (
    //         <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500 shadow-sm">
    //           Loading data quality checks…
    //         </div>
    //       ) : qualityIssues.length > 0 ? (
    //         <DataQualityCard
    //           issues={qualityIssues}
    //           onAction={handleMergeMetric}
    //           onSkip={handleSkipMetric}
    //         />
    //       ) : (
    //         <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500 shadow-sm">
    //           No data quality issues found right now.
    //         </div>
    //       )}
    //     </div>
    //   </div>
    // </div>
  )
  
}