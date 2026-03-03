'use client'

import React from 'react'
import SnapshotCard from '@/components/insights/SnapshotCard'
import LabTrendsCard from '@/components/insights/LabTrendsCard'
import AppointmentBriefCard from '@/components/insights/AppointmentBriefCard'
import MilestoneTimelineCard from '@/components/insights/MilestoneTimelineCard'
import DataQualityCard from '@/components/insights/DataQualityCard'
import ConnectionsCard from '@/components/insights/ConnectionsCard'

import type {
  AttentionItem,
  Appointment,
  AppointmentPrep,
  DataQualityIssue,
  Milestone,
  SnapshotData,
  TrackedLab,
} from '@/components/insights/types'

export default function InsightsPage() {
  // Mock data (replace with API/DB)
  const patientName = 'John D.'
  const lastUpdated = '2026-03-02'

  const snapshot: SnapshotData = {
    lastUpload: { date: '2026-02-20', type: 'Prescription', facility: 'City Clinic' },
    trackedConditions: ['Type 2 Diabetes (suspected)', 'Hyperlipidemia (possible)'],
    coverage: { label: 'Good', detail: '6 lab reports + 4 prescriptions in the last 6 months' },
  }

  const attentionItems: AttentionItem[] = [
    {
      id: 'a1',
      type: 'abnormal',
      title: '2 lab values out of range',
      detail: 'LDL is high; Fasting glucose is high in the latest report.',
      severity: 'high',
    },
    {
      id: 'a2',
      type: 'trend',
      title: 'Fasting glucose is rising',
      detail: 'Increased across the last 3 lab reports.',
      severity: 'medium',
    },
    {
      id: 'a3',
      type: 'med_change',
      title: 'New medication detected',
      detail: 'Atorvastatin appears in the most recent prescription.',
      severity: 'low',
    },
  ]

  const labs: TrackedLab[] = [
    {
      key: 'fasting_glucose',
      displayName: 'Fasting Glucose',
      unit: 'mg/dL',
      refLow: 70,
      refHigh: 100,
      latestDate: '2026-02-12',
      latestValueText: '126',
      status: 'High',
      facility: 'Green Lab',
      series: [
        { date: '2025-12-05', value: 98 },
        { date: '2026-01-10', value: 110 },
        { date: '2026-02-12', value: 126 },
      ],
    },
    {
      key: 'ldl',
      displayName: 'LDL Cholesterol',
      unit: 'mg/dL',
      refLow: 0,
      refHigh: 100,
      latestDate: '2026-02-12',
      latestValueText: '142',
      status: 'High',
      facility: 'Green Lab',
      series: [
        { date: '2025-11-18', value: 118 },
        { date: '2026-01-10', value: 131 },
        { date: '2026-02-12', value: 142 },
      ],
    },
    {
      key: 'creatinine',
      displayName: 'Creatinine',
      unit: 'mg/dL',
      refLow: 0.6,
      refHigh: 1.2,
      latestDate: '2026-02-12',
      latestValueText: '1.0',
      status: 'Normal',
      facility: 'Green Lab',
      series: [
        { date: '2025-12-05', value: 1.0 },
        { date: '2026-01-10', value: 1.1 },
        { date: '2026-02-12', value: 1.0 },
      ],
    },
  ]

  const nextAppointment: Appointment = {
    id: 'ap1',
    title: 'Endocrinology Follow-up',
    dateTime: '2026-03-10T10:30:00',
    location: 'City Hospital, Room 12',
    note: 'Discuss glucose control and medication plan.',
  }

  const appointmentPrep: AppointmentPrep = {
    highlights: [
      'Latest Fasting Glucose: 126 mg/dL (High) on 2026-02-12',
      'Latest LDL: 142 mg/dL (High) on 2026-02-12',
      'Current meds (from latest prescription): Metformin, Atorvastatin',
    ],
    questionsToAsk: [
      'Do I need a repeat HbA1c test?',
      'Should we adjust Metformin dosage or add another medication?',
      'What LDL target should I aim for?',
    ],
  }

  const milestones: Milestone[] = [
    { id: 'm1', date: '2026-02-20', title: 'New medication detected', detail: 'Atorvastatin appears in latest prescription.', tag: 'Medication' },
    { id: 'm2', date: '2026-02-12', title: 'LDL recorded above range', detail: 'LDL increased compared to previous report.', tag: 'Lab' },
    { id: 'm3', date: '2026-01-10', title: 'Repeated glucose testing', detail: 'Fasting glucose tracked across multiple reports.', tag: 'Lab' },
  ]

  const dataQuality: DataQualityIssue[] = [
    { id: 'dq1', title: 'Reference range missing for 4 tests', detail: 'Some reports provide ranges in an image/table that wasn’t captured reliably.', actionLabel: 'Fix reference ranges' },
    { id: 'dq2', title: 'Possible duplicate test names', detail: '“FBS” and “Fasting Blood Sugar” may refer to the same test.', actionLabel: 'Merge test names' },
    { id: 'dq3', title: 'Patient name missing in 1 upload', detail: 'We can’t confirm ownership for one document.', actionLabel: 'Review document' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Health Insights</h1>
            <p className="text-sm text-gray-600">
              Patient: <span className="font-medium text-gray-900">{patientName}</span> · Last updated:{' '}
              <span className="font-medium text-gray-900">{lastUpdated}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">
              Generate doctor summary
            </button>
            <button className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
              Share with doctor
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SnapshotCard snapshot={snapshot} attentionItems={attentionItems} />
            <LabTrendsCard
              labs={labs}
              onViewReport={(labKey) => console.log('view report for', labKey)}
              onTrackTest={(labKey) => console.log('track test', labKey)}
            />
            <MilestoneTimelineCard
              milestones={milestones}
              onViewFullHistory={() => console.log('view full history')}
            />
          </div>

          <div className="space-y-6">
            <AppointmentBriefCard
              nextAppointment={nextAppointment}
              prep={appointmentPrep}
              onGenerateSummary={() => console.log('generate appt summary')}
              onAttachLabs={() => console.log('attach last 3 labs')}
            />
            <DataQualityCard
              issues={dataQuality}
              onAction={(issueId) => console.log('fix issue', issueId)}
            />
            <ConnectionsCard
              text="After the latest prescription update, LDL was still high. Consider tracking LDL in the next lab report."
              onSeeDocs={() => console.log('see supporting docs')}
            />
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          HealthApe Insights · Generated from uploaded documents · Not a diagnosis
        </div>
      </div>
    </div>
  )
}