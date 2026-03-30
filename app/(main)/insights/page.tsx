'use client'

import { useEffect, useRef, useState } from 'react'
import SnapshotCard from '@/components/insights/SnapshotCard'
import LabTrendsCard from '@/components/insights/LabTrendsCard'
import MilestoneTimelineCard from '@/components/insights/MilestoneTimelineCard'
import DataQualityCard from '@/components/insights/DataQualityCard'
import type {
  AttentionItem,
  DataQualityIssue,
  Milestone,
  SnapshotData,
  TrackedLab,
} from '@/components/insights/types'
import api from '@/lib/api/client'
import { useRouter } from 'next/navigation'
import MetricDecisionsCard from '@/components/insights/MergedDecisionsCard'

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

type InsightLabResponse = {
  key: string
  name: string
  unit?: string | null
  refLow?: number
  refHigh?: number
  latestDate?: string
  latestValueText?: string
  status?: TrackedLab['status']
  isTracked?: boolean
  sourceReports?: TrackedLab['sourceReports']
  series?: TrackedLab['series']
}

type InsightsResponse = {
  patientName: string | null
  snapshot: SnapshotData | null
  labs: InsightLabResponse[]
  milestones: Milestone[]
  attentionItems: AttentionItem[]
  trackedMetricCount: number
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsResponse | null>(null)
  const [qualityIssues, setQualityIssues] = useState<DataQualityIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [, setQualityLoading] = useState(false)
  const [merges, setMerges] = useState<MetricMerge[]>([])
  const [ignoredSuggestions, setIgnoredSuggestions] = useState<IgnoredMetricSuggestion[]>([])
  const router = useRouter()
  const labTrendsRef = useRef<HTMLDivElement | null>(null)

  const loadInsights = async () => {
    const res = await api.get<InsightsResponse>('/insights/getDetails')
    setData(res.data)
  }

  const loadMerges = async () => {
    const res = await api.get<MetricMergeItem[]>('/insights/metric-merges')
    setMerges(res.data ?? [])
  }

  const loadIgnoredSuggestions = async () => {
    const res = await api.get<IgnoredMetricSuggestion[]>('/insights/ignored-metric-suggestions')
    setIgnoredSuggestions(res.data ?? [])
  }

  const handleUndoMerge = async (rawName: string) => {
    await api.post('/insights/undo-metric-merge', { rawName })
    await refreshInsightsState()
  }

  const loadQualityIssues = async () => {
    setQualityLoading(true)
    try {
      const qualityRes = await api.get<DataQualityIssue[]>('/insights/data-quality')
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

      await refreshInsightsState()
    } catch (e: unknown) {
      console.error('Failed to undo keep-separate decision', e)
    }
  }

  const refreshInsightsState = async () => {
    await Promise.all([
      loadInsights(),
      loadQualityIssues(),
      loadMerges(),
      loadIgnoredSuggestions(),
    ])
  }

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setErr(null)
        await Promise.all([loadInsights(), loadQualityIssues(), loadMerges(), loadIgnoredSuggestions()])
      } catch (e: unknown) {
        if (e instanceof Error) {
          setErr(e.message || 'Failed to load insights')
        } else {
          setErr('Failed to load insights')
        }
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

      await refreshInsightsState()
    } catch (e: unknown) {
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

      await refreshInsightsState()
    } catch (e: unknown) {
      console.error('Failed to ignore metric suggestion', e)
    }
  }

  const handleViewLabTrends = () => {
    labTrendsRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  if (loading) return <div className="text-sm text-gray-500">Loading insights…</div>
  if (err) return <div className="text-sm text-red-600">{err}</div>
  if (!data) return null

  const snapshot: SnapshotData = {
    lastUpload: data.snapshot?.lastUpload
      ? { ...data.snapshot.lastUpload }
      : { date: '-', type: '-', facility: undefined },
    trackedConditions: [],
    coverage: data.snapshot?.coverage ?? { label: 'Partial', detail: '' },
  }

  const attentionItems: AttentionItem[] = data.attentionItems ?? []

  const labs: TrackedLab[] = (data.labs ?? []).map((l) => ({
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

  const milestones: Milestone[] = (data.milestones ?? []).map((m) => ({
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
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <SnapshotCard
        snapshot={snapshot}
        attentionItems={attentionItems}
        onViewLabTrends={handleViewLabTrends}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div ref={labTrendsRef}>
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
                } catch (e: unknown) {
                  if (e instanceof Error) {
                    alert(e.message || 'Failed to update tracked test')
                  } else {
                    alert('Failed to update tracked test')
                  }
                }
              }}
            />
          </div>

          <MilestoneTimelineCard
            milestones={milestones}
            onViewFullHistory={() => router.push('/insights/history')}
          />
        </div>

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
  )
}