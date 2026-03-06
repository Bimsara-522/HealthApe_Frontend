// All appointment API calls (Client-safe version)
import api from 'lib/api/client' // Axios instance
import type { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from 'app/(main)/appointments/types/appointment'

// Fetch appointments list (for use in hooks/client components)
export async function getAppointments(params: { month: string | undefined }): Promise<Appointment[]> {
  const queryParams = params.month ? { month: params.month } : {}
  const { data } = await api.get<Appointment[]>('/appointments', { params: queryParams })  // ← Sends month: undefined
  console.log("appointments:", data);
  return data
}

// Get the next upcoming appointment
export async function getNextAppointment(): Promise<Appointment | null> {
  try {
    const { data } = await api.get<Appointment>('/appointments/next')
    return data
  } catch (error: any) {
    // Backend doesn't have /appointments/next endpoint (404), so fetch all and filter client-side
    console.log('Backend does not have /appointments/next endpoint, falling back to client-side filtering')
    const allAppointments = await getAppointments({ month: undefined })
    // const nextVisit = allAppointments
    //   .filter(a => new Date(a.date) > new Date())
    //   .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nextVisit = allAppointments
      .filter(a => {
        const d = new Date(a.date)
        d.setHours(0, 0, 0, 0)
        return d >= today
      })
      .sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime()
        if (dateCompare !== 0) return dateCompare
        return a.time.localeCompare(b.time)
      })[0]
    return nextVisit || null
  }
}

// Get a single appointment by its ID.
export async function getAppointmentById(id: string): Promise<Appointment> {
  const { data } = await api.get<Appointment>(`/appointments/${id}`)
  return data
}

// Sends dto as request body  (Client version - no cookies needed)
export async function createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
  const { data } = await api.post<Appointment>('/appointments/new', dto)  // await waits for backend response and returns backend response
  return data
}

export async function updateAppointment(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}`, dto)
  return data // Updates appointment on backend and returns updated appointment from backend
}

export async function cancelAppointment(id: string): Promise<void> {
  await api.patch(`/appointments/${id}/cancel`)
}
// export async function cancelAppointment(id: string): Promise<void> {
//   await api.patch(`/appointments/${id}`, { status: 'cancelled' }) // Sends PATCH request
//   // Only updates the status field to "cancelled"
// }