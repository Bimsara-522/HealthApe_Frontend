// // All appointment API calls
// import api from './client' // Axios instance
// import type { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from '@/types/appointment'
// import { mockAppointments } from '@/lib/mock/appointments'

// /**
//  * Optional filters for fetching appointments.
//  * - month: "YYYY-MM" (e.g., "2026-02")
//  */
// export type GetAppointmentsParams = {
//   month?: string
// }
// /**
//  * Fetch appointments list.
//  *
//  * Current behavior (temporary):
//  * - Returns mock data because the backend isn't connected yet.
//  *
//  * Future behavior:
//  * - Replace the mock return with an API call (e.g., api.get('/appointments', { params }))
//  * - Keep the same function signature so the rest of the app doesn't need changes.
//  */
// export async function getAppointments(params: GetAppointmentsParams = {} ): Promise<Appointment[]> {
//   const { month } = params // Destructure filters for clarity (even if unused right now)
//   if (!month) {
//     return mockAppointments // No month filter provided → return all mock appointments
//   }
//   //  (works with mock data): Compare the "YYYY-MM" prefix of the date (which is "YYYY-MM-DD")
//   // Example: "2026-02-20".startsWith("2026-02") → true
//   const filtered = mockAppointments.filter((appt) =>
//     appt.date.slice(0, 7) === month
//   )
//   return filtered // Return filtered results.
// }

// // uncomment this code when you get real data from database
// // export async function getAppointments(params?: {
// //   month?: string       // "2025-12"
// //   status?: string
// //   page?: number
// //   limit?: number
// // }): Promise<Appointment[]> {
// //   console.log('API baseURL:', apiClient.defaults.baseURL)
// //   console.log('Calling:', `${apiClient.defaults.baseURL}/appointments`)

// //   const formatError = (e: any) => {
// //     try {
// //       if (typeof e?.toJSON === 'function') return e.toJSON()
// //       return {
// //         message: e?.message,
// //         code: e?.code,
// //         stack: e?.stack,
// //         response: e?.response && {
// //           status: e.response.status,
// //           data: e.response.data,
// //           headers: e.response.headers,
// //         },
// //         config: e?.config,
// //       }
// //     } catch {
// //       return String(e)
// //     }
// //   }

// //   try {
// //     const { data } = await apiClient.get<Appointment[]>('/appointments', { params })
// //     return data
// //   } catch (err: any) {
// //     if (err instanceof AggregateError && Array.isArray(err.errors)) {
// //       console.error('getAppointments AggregateError — inner errors:', err.errors.map(formatError))
// //     } else {
// //       console.error('getAppointments failed', formatError(err))
// //     }
// //     return []
// //   }
// // }

// /**
//  * Get a single appointment by its ID.
//  *
//  * Current behavior (temporary):
//  * - Reads from mockAppointments because the backend isn't connected yet.
//  *
//  * Future behavior:
//  * - Replace the mock lookup with an API call:
//  *   const { data } = await api.get<Appointment>(`/dashboard/appointments/${id}`)
//  *   return data
//  */
// export async function getAppointmentById(id: string): Promise<Appointment> {
//   if (!id || typeof id !== 'string') { // an empty/invalid id should fail 
//     throw new Error('Invalid appointment id')
//   }
//   // Finds appointment with matching id
//   const appointment = mockAppointments.find((a) => a.id === id)   // Array.find(...) returns the first match, or undefined if nothing matches
//   if (!appointment) { // If no appointment is found, throw an error
//     throw new Error(`Appointment not found (id: ${id})`)   // Return the appointment object
//   }
//   return appointment
// }

// // Sends dto as request body
// export async function createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
//   const { data } = await api.post<Appointment>('/appointments', dto) // await waits for backend response and returns backend response
//   return data
// }

// export async function updateAppointment(
//   id: string,
//   dto: UpdateAppointmentDto
// ): Promise<Appointment> {
//   const { data } = await api.patch<Appointment>(`/appointments/${id}`, dto)
//   return data // Updates appointment on backend and returns updated appointment from backend
// }

// export async function cancelAppointment(id: string): Promise<void> {
//   await api.patch(`/appointments/${id}`, { status: 'cancelled' }) // Sends PATCH request
//   // Only updates the status field to "cancelled"
// }