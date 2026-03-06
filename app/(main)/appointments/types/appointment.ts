// Shared TypeScript types
export type AppointmentStatus =
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'completed'

export interface Doctor {
  id: string
  name: string     // "Dr. Sarah Conner"
  specialty: string     // "Cardiologist"
  avatarUrl?: string
}

export interface Appointment {
  id: string
  doctor: Doctor
  hospital: string           // "City Heart Center"
  date: string           // ISO date "2025-12-16"
  time: string           // "09:00 AM"
  status: AppointmentStatus
  reason?: string           // "Annual Checkup"
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentDto {
  doctorName: string
  doctorId?: string
  hospital: string
  date: string        // "YYYY-MM-DD"
  time: string        // "HH:MM" recommended
  reason?: string
  bring?: string
  questions?: string
  notes?: string
}

export interface UpdateAppointmentDto {
  date?: string
  time?: string
  status?: AppointmentStatus
  notes?: string
}