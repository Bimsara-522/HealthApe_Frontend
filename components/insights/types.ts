export type AttentionItem = {
  id: string
  type: 'abnormal' | 'trend' | 'missing' | 'med_change' | 'general'
  title: string
  detail: string
  severity: 'low' | 'medium' | 'high'
}

export type LabPoint = {
  date: string // YYYY-MM-DD
  value: number
}

export type TrackedLab = {
  key: string
  displayName: string
  unit: string
  refLow?: number
  refHigh?: number
  latestDate: string
  latestValueText: string
  status: 'Low' | 'Normal' | 'High' | 'Unknown'
  facility?: string
  isTracked: boolean
  series: {
    date: string
    value: number
    docId: string
    docCategory?: string
    hospital?: string | null
  }[]
  sourceReports: {
    docId: string
    date: string
    value: number
    unit?: string | null
    docCategory?: string
    hospital?: string | null
  }[]
}

export type Appointment = {
  id: string
  title: string
  dateTime: string // ISO-ish
  location?: string
  note?: string
}

export type Milestone = {
  id: string
  date: string
  title: string
  detail: string
  tag: 'Lab' | 'Medication' | 'Diagnosis' | 'Upload'
}

export type DataQualityIssue = {
  id: string
  title: string
  detail: string
  actionLabel: string
  skipLabel?: string
  rawName?: string
  compareName?: string
  suggestedCanonicalName?: string
  similarity?: number
}

export type SnapshotData = {
  lastUpload: { date: string; type: string; facility?: string }
  trackedConditions: string[]
  coverage: { label: 'Good' | 'Partial'; detail: string }
}

export type AppointmentPrep = {
  highlights: string[]
  questionsToAsk: string[]
}