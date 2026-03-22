import type { Appointment } from 'app/(main)/appointments/types/appointment'
import type { Notification } from '@/components/notifications/types'
// This file contains the logic for converting appointment data into a reusable notification data
// This is where I use real DB-backed appointment data from existing /appointments API
export function appointmentToNotification(appointment: Appointment): Notification {
  const doctorName =
    appointment.doctor?.name ??
    appointment.doctorNameSnapshot ??
    'Doctor'

  const specialty = appointment.doctor?.specialty
    ? ` (${appointment.doctor.specialty})`
    : ''

  return {
    id: `appointment-${appointment.id}`,
    title: 'Appointment Reminder',
    message: `${doctorName}${specialty} at ${appointment.hospital} on ${formatAppointmentDate(
      appointment.date,
    )} at ${appointment.time}.`,
    type: 'appointment',
    isRead: false,
    createdAt: appointment.createdAt,
    href: `/appointments/${appointment.id}`,
  }
}

function formatAppointmentDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}