'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppointment } from 'app/(main)/appointments/hooks/useAppointment'
import { updateAppointment } from 'app/(main)/appointments/lib/api/appointments'

const schema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function AppointmentEditClient({ id }: { id: string }) {
  const router = useRouter()
  const { data: appt, isLoading } = useAppointment(id)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: appt
      ? { date: appt.date.slice(0, 10), time: appt.time, notes: appt.notes ?? '' }
      : { date: '', time: '', notes: '' },
  })

  const onSubmit = async (values: FormValues) => {
    await updateAppointment(id, {
      date: values.date,
      time: values.time,
      notes: values.notes,
    })
    // router.push(`/appointments/${id}/edit`)
    router.push(`/appointments/${id}`) // go back to appointment detail
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl">
        <div className="h-7 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="mt-6 h-64 bg-white rounded-2xl border border-gray-100 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Appointment</h1>
        <p className="text-sm text-gray-500 mt-1">Update the date, time, or notes.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            {...form.register('date')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          {form.formState.errors.date && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <select
            {...form.register('time')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select a slot</option>
            {['08:00 AM', '09:00 AM', '10:00 AM', '02:00 PM', '03:00 PM'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {form.formState.errors.time && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.time.message}</p>
          )}
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
                rows={4}
                {...form.register('notes')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Add any notes for this appointment..."
            />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50"
          > Cancel </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          > Save Changes </button>
        </div>
      </form>
    </div>
  )
}
