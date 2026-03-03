import type { TrackedLab } from './types'

export function statusTone(status: TrackedLab['status']) {
  if (status === 'High' || status === 'Low') return 'red'
  if (status === 'Normal') return 'green'
  return 'gray'
}

export function milestoneTone(tag: string) {
  if (tag === 'Lab') return 'blue'
  if (tag === 'Medication') return 'yellow'
  if (tag === 'Diagnosis') return 'red'
  return 'gray'
}