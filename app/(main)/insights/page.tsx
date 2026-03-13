'use client'

import React, { useEffect, useState } from 'react'
import SnapshotCard from '@/components/insights/SnapshotCard'
import LabTrendsCard from '@/components/insights/LabTrendsCard'
import MilestoneTimelineCard from '@/components/insights/MilestoneTimelineCard'
import DataQualityCard from '@/components/insights/DataQualityCard'
import type { DataQualityIssue } from '@/components/insights/types'
import api from '@/lib/api/client'

type InsightsResponse = {
  patientName: string | null
  snapshot: any
  labs: any[]
  milestones: any[]
  attentionItems: any[]
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsResponse | null>(null)
  const [qualityIssues, setQualityIssues] = useState<DataQualityIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [qualityLoading, setQualityLoading] = useState(false)

  const loadInsights = async () => {
    const res = await api.get('/insights/getDetails')
    setData(res.data)
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

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setErr(null)
        await Promise.all([loadInsights(), loadQualityIssues()])
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
    series: l.series ?? [],
  }))

  const milestones = (data.milestones ?? []).map((m: any) => ({
    id: m.id,
    date: m.date,
    title: m.title,
    detail: m.detail,
    tag: m.tag,
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Health Insights</h1>
        <p className="text-sm text-gray-500">
          Patient: {data.patientName ?? '—'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SnapshotCard snapshot={snapshot} attentionItems={attentionItems} />
          <LabTrendsCard labs={labs} />
          <MilestoneTimelineCard milestones={milestones} />
        </div>

        <div className="lg:col-span-1 space-y-6">
          {qualityLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500 shadow-sm">
              Loading data quality checks…
            </div>
          ) : qualityIssues.length > 0 ? (
            <DataQualityCard
              issues={qualityIssues}
              onAction={handleMergeMetric}
              onSkip={handleSkipMetric}
            />
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500 shadow-sm">
              No data quality issues found right now.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}