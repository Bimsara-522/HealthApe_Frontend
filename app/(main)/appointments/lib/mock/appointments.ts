import type { Appointment } from 'app/(main)/appointments/types/appointment'

export const mockAppointments: Appointment[] = [
  {
    id: 'a1',
    doctor: { id: 'd1', name: 'Dr. Sarah Connor', specialty: 'Cardiologist' },
    clinic: 'City Heart Center',
    date: '2026-02-20',
    time: '09:00 AM',
    status: 'confirmed',
    reason: 'Annual Checkup',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'a2',
    doctor: { id: 'd2', name: 'Dr. John Smith', specialty: 'Dermatologist' },
    clinic: 'SkinCare Clinic',
    date: '2026-02-28',
    time: '02:00 PM',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
