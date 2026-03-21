// All appointment API calls (Client-safe version)
import api from 'lib/api/client' // Axios instance
import type { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from 'app/(main)/appointments/types/appointment'

// Fetch appointments list (for use in hooks/client components)
export async function getAppointments(params: { month: string | undefined }): Promise<Appointment[]> {
  const queryParams = params.month ? { month: params.month } : {}
  // GET /appointments?month=YYYY-MM
  const { data } = await api.get<Appointment[]>('/appointments', { params: queryParams })  // ← Sends month: undefined
  console.log("appointments:", data);
  return data
}

// Get the next upcoming appointment
export async function getNextAppointment(): Promise<Appointment | null> {
  try {
    // ask backend for next appointment directly
    const { data } = await api.get<Appointment>('/appointments/next')
    return data
  } catch {
    // Backend doesn't have /appointments/next endpoint (404), so compute next appointment client-side
    console.log('Backend does not have /appointments/next endpoint, falling back to client-side filtering')
    const allAppointments = await getAppointments({ month: undefined })
  
    const today = new Date()
    today.setHours(0, 0, 0, 0)  // ignore time part for comparison
    const nextVisit = allAppointments
       // Keep only appointments today or in the future
      .filter(a => {
        const d = new Date(a.date)
        d.setHours(0, 0, 0, 0)
        return d >= today
      })
      // Sort by appointment date first, then by time
      .sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime()
        if (dateCompare !== 0) return dateCompare
        // If same date, compare time (string like "09:30")
        return a.time.localeCompare(b.time)
      })[0]
    return nextVisit || null
  }
}

// Get a single appointment by its ID
export async function getAppointmentById(id: string): Promise<Appointment> {
  // GET /appointments/:id
  const { data } = await api.get<Appointment>(`/appointments/${id}`) 
  return data
}

// Sends dto as request body  (Client version - no cookies needed)
export async function createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
  // await waits for backend response and returns backend response
  const { data } = await api.post<Appointment>('/appointments/new', dto) // passing a JavaScript object (dto) to Axios, Axios automatically serializes it to JSON
  return data
}

export async function updateAppointment(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}`, dto)
  return data // Updates appointment on backend and returns updated appointment from backend
}

// Only updates the status field to "cancelled"
export async function cancelAppointment(id: string): Promise<void> {
  await api.patch(`/appointments/${id}/cancel`)
}
