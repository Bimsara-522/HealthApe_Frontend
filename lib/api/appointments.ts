// All appointment API calls
import api from './client'
import type { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from '@/types/appointment'
import { mockAppointments } from '@/lib/mock/appointments'

export async function getAppointments(p0: { month: string | undefined }): Promise<Appointment[]> {
  return mockAppointments
}

// uncomment this code when you get real data from database
// export async function getAppointments(params?: {
//   month?: string       // "2025-12"
//   status?: string
//   page?: number
//   limit?: number
// }): Promise<Appointment[]> {
//   console.log('API baseURL:', apiClient.defaults.baseURL)
//   console.log('Calling:', `${apiClient.defaults.baseURL}/appointments`)

//   const formatError = (e: any) => {
//     try {
//       if (typeof e?.toJSON === 'function') return e.toJSON()
//       return {
//         message: e?.message,
//         code: e?.code,
//         stack: e?.stack,
//         response: e?.response && {
//           status: e.response.status,
//           data: e.response.data,
//           headers: e.response.headers,
//         },
//         config: e?.config,
//       }
//     } catch {
//       return String(e)
//     }
//   }

//   try {
//     const { data } = await apiClient.get<Appointment[]>('/appointments', { params })
//     return data
//   } catch (err: any) {
//     if (err instanceof AggregateError && Array.isArray(err.errors)) {
//       console.error('getAppointments AggregateError — inner errors:', err.errors.map(formatError))
//     } else {
//       console.error('getAppointments failed', formatError(err))
//     }
//     return []
//   }
// }

export async function getAppointmentById(id: string): Promise<Appointment> {
  // uncomment this code when you get real data from database
  // const { data } = await api.get<Appointment>(`/dashboard/appointments/${id}`)
  // return data
  const found = mockAppointments.find(a => a.id === id)
  if (!found) throw new Error('Appointment not found')
  return found
}

export async function createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
  const { data } = await api.post<Appointment>('/appointments', dto)
  return data
}

export async function updateAppointment(
  id: string,
  dto: UpdateAppointmentDto
): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}`, dto)
  return data
}

export async function cancelAppointment(id: string): Promise<void> {
  await api.patch(`/appointments/${id}`, { status: 'cancelled' })
}