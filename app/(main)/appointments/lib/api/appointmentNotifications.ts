// import type { Appointment } from 'app/(main)/appointments/types/appointment'
// import type { Notification } from '@/components/notifications/types'

// export function appointmentToNotification(appointment: Appointment): Notification {
//   const doctorName =
//     appointment.doctor?.name ??
//     appointment.doctorNameSnapshot ??
//     'Doctor'

//   const specialty = appointment.doctor?.specialty
//     ? ` (${appointment.doctor.specialty})`
//     : ''

//   return {
//     id: `appointment-${appointment.id}`,
//     title: 'Appointment Reminder',
//     message: `${doctorName}${specialty} at ${appointment.hospital} on ${formatAppointmentDate(
//       appointment.date,
//     )} at ${appointment.time}.`,
//     type: 'appointment',
//     isRead: false,
//     createdAt: appointment.createdAt,
//     href: `/appointments/${appointment.id}`,
//   }
// }

// function formatAppointmentDate(dateString: string) {
//   const date = new Date(dateString)
//   return date.toLocaleDateString('en-US', {
//     month: 'short',
//     day: 'numeric',
//     year: 'numeric',
//   })
// }