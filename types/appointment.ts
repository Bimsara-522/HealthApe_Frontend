// Shared TypeScript types
export type AppointmentStatus =
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'completed'

export interface Doctor {
  id:         string
  name:       string     // "Dr. Sarah Conner"
  specialty:  string     // "Cardiologist"
  avatarUrl?: string
}

export interface Appointment {
  id:        string
  doctor:    Doctor
  clinic:    string           // "City Heart Center"
  date:      string           // ISO date "2025-12-16"
  time:      string           // "09:00 AM"
  status:    AppointmentStatus
  reason?:   string           // "Annual Checkup"
  notes?:    string
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentDto {
  doctorId: string
  clinic:   string
  date:     string
  time:     string
  reason?:  string
  notes?:   string
}

export interface UpdateAppointmentDto {
  date?:   string
  time?:   string
  status?: AppointmentStatus
  notes?:  string
}