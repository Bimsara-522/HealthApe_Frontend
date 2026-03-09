// Shared TypeScript types
export type AppointmentStatus =
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export interface Doctor {
  id: string
  name: string
  specialty?: string | null
  avatarUrl?: string | null
}

export interface Appointment {
  id: string
  doctor: Doctor | null
  doctorNameSnapshot?: string | null
  hospital: string
  date: string           // ISO date "2025-12-16"
  time: string           // "09:00 AM"
  status: AppointmentStatus
  reason?: string | null          // "Annual Checkup"
  bring?: string | null
  questions?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentDto {
  doctorName: string
  doctorId?: string
  specialty?: string
  hospital: string
  date: string        // "YYYY-MM-DD"
  time: string        // "HH:MM" recommended
  reason?: string
  bring?: string
  questions?: string
}

export interface UpdateAppointmentDto {
  doctorName?: string
  doctorId?: string
  specialty?: string
  hospital?: string
  date?: string
  time?: string
  reason?: string
  bring?: string
  questions?: string
  status?: AppointmentStatus
}