'use client'

import React, { useEffect, useState } from 'react'
import SnapshotCard from '@/components/insights/SnapshotCard'
import LabTrendsCard from '@/components/insights/LabTrendsCard'
import MilestoneTimelineCard from '@/components/insights/MilestoneTimelineCard'
import api from '@/lib/api/client'


export default function InsightsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setErr(null)
        const res = await api.get(`/insights/getDetails`)
        setData(await res.data)
      } catch (e: any) {
        setErr(e?.message || 'Failed to load insights')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div className="text-sm text-gray-500">Loading insights…</div>
  if (err) return <div className="text-sm text-red-600">{err}</div>
  if (!data) return null

  // Adapt backend DTO to your existing SnapshotCard props
  const snapshot = {
    lastUpload: data.snapshot?.lastUpload
      ? { ...data.snapshot.lastUpload }
      : { date: '-', type: '-', facility: null },
    trackedConditions: [], // you can add later when you store diagnoses cleanly
    coverage: data.snapshot?.coverage ?? { label: 'Partial', detail: '' },
  }

  const attentionItems = data.attentionItems ?? []

  // Adapt labs to LabTrendsCard expected shape
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

        {/* Right column intentionally empty for now (Appointment/DataQuality later) */}
        <div className="lg:col-span-1" />
      </div>
    </div>
  )
}