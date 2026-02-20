// Multi-step form: doctor → date/time → confirm. Controlled with useForm
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useCreateAppointment } from '@/hooks/useAppointments'

const schema = z.object({
  doctorId: z.string().min(1, 'Select a doctor'),
  clinic:   z.string().min(1),
  date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  time:     z.string().min(1, 'Select a time slot'),
  reason:   z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function BookingForm() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateAppointment()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const appt = await mutateAsync(values)
      router.push(`/dashboard/appointments/${appt.id}`)
    } catch {
      // toast.error('Failed to book appointment')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
        <input {...register('doctorId')} placeholder="Doctor ID or search..."
               className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        {errors.doctorId && <p className="text-red-500 text-xs mt-1">{errors.doctorId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input type="date" {...register('date')}
               className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
        <select {...register('time')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">Select a slot</option>
          {['08:00 AM', '09:00 AM', '10:00 AM', '02:00 PM', '03:00 PM'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium
                   hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Booking...' : 'Confirm Booking'}
      </button>
    </form>
  )
}