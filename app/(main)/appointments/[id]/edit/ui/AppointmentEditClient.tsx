'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppointment } from 'app/(main)/appointments/hooks/useAppointment'
import { updateAppointment } from 'app/(main)/appointments/lib/api/appointments'
import { useQueryClient } from '@tanstack/react-query'
import { appointmentKeys } from '../../../hooks/useAppointments'

const schema = z.object({
  doctorName: z.string().min(1, 'Enter a doctor name'),
  doctorId: z.string().optional(),
  specialty: z.string().optional(),
  hospital: z.string().min(1, 'Enter hospital/clinic name'),
  date: z.string().min(1, 'Select a date'),
  time: z.string().min(1, 'Enter a time'),
  reason: z.string().optional(),
  bring: z.string().optional(),
  questions: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function AppointmentEditClient({ id }: { id: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: appt, isLoading } = useAppointment(id)
  const today = new Date().toISOString().split('T')[0]

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: appt
  ? {
      doctorName: appt.doctor?.name ?? appt.doctorNameSnapshot ?? '',
      doctorId: appt.doctor?.id,
      specialty: appt.doctor?.specialty ?? '',
      hospital: appt.hospital ?? '',
      date: appt.date.slice(0, 10),
      time: appt.time ?? '',
      reason: appt.reason ?? '',
      bring: appt.bring ?? '',
      questions: appt.questions ?? '',
    }
  : {
      doctorName: '',
      doctorId: undefined,
      specialty: '',
      hospital: '',
      date: '',
      time: '',
      reason: '',
      bring: '',
      questions: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    const updated = await updateAppointment(id, {
      doctorName: values.doctorName,
      doctorId: values.doctorId,
      specialty: values.specialty,
      hospital: values.hospital,
      date: values.date,
      time: values.time,
      reason: values.reason,
      bring: values.bring,
      questions: values.questions,
    })
    // Update detail cache immediately so detail page shows latest data
    queryClient.setQueryData(appointmentKeys.detail(id), updated)
    // Invalidate related caches so other screens refetch fresh data
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) }),
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all() }),
      queryClient.invalidateQueries({ queryKey: ['appointments', 'next'] }),
    ])

    router.push(`/appointments/${id}`) // go back to appointment detail
    // router.refresh()
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl">
        <div className="h-7 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="mt-6 h-64 bg-white rounded-2xl border border-gray-100 animate-pulse" />
      </div>
    )
  }

  if (appt?.status === 'completed') {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Appointment</h1>
          <p className="text-sm text-red-600 mt-3">
            Completed appointments cannot be edited.
          </p>
        </div>
      </div>
    )
  }

  if (appt?.status === 'cancelled') {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Appointment</h1>
          <p className="text-sm text-red-600 mt-3">
            Cancelled appointments cannot be edited.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Appointment</h1>
          <p className="text-sm text-gray-500 mt-1">Update the doctor, hospital, date, time, and visit details.</p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name
              </label>
              <input
                {...form.register('doctorName')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Enter doctor name"
              />
              {form.formState.errors.doctorName && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.doctorName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty
              </label>
              <input
                {...form.register('specialty')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Cardiology"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hospital / Clinic
            </label>
            <input
              {...form.register('hospital')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. City Heart Center"
            />
            {form.formState.errors.hospital && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.hospital.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                min={today}
                {...form.register('date')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              {form.formState.errors.date && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                {...form.register('time')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              {form.formState.errors.time && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.time.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <input
              {...form.register('reason')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Annual checkup"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What to bring
            </label>
            <textarea
              rows={3}
              {...form.register('bring')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Lab reports, prescription list, insurance card"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Questions to ask
            </label>
            <textarea
              rows={3}
              {...form.register('questions')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Side effects? Diet changes? Next follow-up?"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}