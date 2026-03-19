'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useCreateAppointment } from 'app/(main)/appointments/hooks/useAppointments'
import { useEffect, useRef, useState } from 'react'
import { DoctorSuggestion, searchDoctors } from '@/app/(main)/appointments/lib/api/doctors'
import Link from 'next/link'

// - doctorName is required (user can type anything)
// - doctorId is optional (only set if user selects a suggestion)
const schema = z.object({
  doctorName: z.string().min(1, 'Enter a doctor name'),
  doctorId: z.string().optional(),
  specialty: z.string().optional(),
  hospital: z.string().min(1, 'Enter hospital/clinic name'),
  date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')
      .refine((value) => {
        const selected = new Date(`${value}T00:00:00`)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return selected >= today
  }, 'Date cannot be earlier than today'),
  time: z.string().min(1, 'Enter a time'), // using <input type="time" />
  reason: z.string().optional(),
  bring: z.string().optional(),     // what to bring
  questions: z.string().optional(), // questions to ask
})

// Generates a TypeScript type from the schema
// It prevents mismatched fields and improves autocomplete
type FormValues = z.infer<typeof schema> 

export function BookingForm() {
  const router = useRouter()
  // mutateAsync(values) sends a POST request through API layer 
  // isPending becomes true while it is submitting (useful for disabling button / changing text)
  const { mutateAsync, isPending } = useCreateAppointment()

  // register connects inputs to the form state
  // handleSubmit runs validation and calls submit function if valid
  // errors contains validation error messages
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema), // React Hook Form automatically checks those schema rules when submitting
    defaultValues: {
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

  const today = new Date().toISOString().split('T')[0]
  const selectingSuggestionRef = useRef(false)

  // --- Autocomplete state ---
  const doctorName = watch('doctorName')
  const [suggestions, setSuggestions] = useState<DoctorSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    // If doctorName is empty, clear suggestions
    if (!doctorName?.trim()) {
      setSuggestions([])
      setOpen(false)
      // also clear doctorId because user is typing freely now
      setValue('doctorId', undefined, { shouldDirty: true })
      setValue('specialty', '', { shouldDirty: true })
      return
    }

    // if user is typing manually after selecting, clear doctorId
    if (!selectingSuggestionRef.current) {
      setValue('doctorId', undefined, { shouldDirty: true })
    }
    
    // Debounce so we don't search on every keystroke instantly
    if (debounceRef.current) window.clearTimeout(debounceRef.current)

    debounceRef.current = window.setTimeout(async () => {
      setLoading(true)
      try {
        const results = await searchDoctors(doctorName)
        setSuggestions(results)
        setOpen(results.length > 0)
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [doctorName, setValue])

  const selectDoctor = (d: DoctorSuggestion) => {
    selectingSuggestionRef.current = true
    setValue('doctorName', d.name, { shouldDirty: true, shouldValidate: true })
    setValue('doctorId', d.id, { shouldDirty: true })
    setValue('specialty', d.specialty ?? '', { shouldDirty: true })
    setOpen(false)
    // reset flag after this event cycle
    setTimeout(() => {
      selectingSuggestionRef.current = false
    }, 0)
  }

  const onSubmit = async (values: FormValues) => {
    try {
      // values.doctorId may be undefined if typed manually — that's OK.
      const appt = await mutateAsync(values as any) // mutateAsync(values) waits for a created appointment
      router.push(`/appointments/${appt.id}`) // backend is expected to return a new appointment object to frontend and then when it is returned, frontend navigates to that appointment details page
    } catch {
      // toast.error('Failed to book appointment')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Doctor name */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>

        <input
          {...register('doctorName')}
          placeholder="Type doctor name (search or enter manually)..."
          autoComplete="off"
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true)
          }}
          onBlur={() => {
            // small delay so clicking suggestion still works
            setTimeout(() => setOpen(false), 120)
          }}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />

        {errors.doctorName && (
          <p className="text-red-500 text-xs mt-1">{errors.doctorName.message}</p>
        )}

        {/* Suggestions dropdown */}
        {open && (
          <div className="absolute z-20 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
            ) : (
              <ul className="max-h-56 overflow-auto">
                {suggestions.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                      onClick={() => selectDoctor(d)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {d.name}
                        {d.specialty ? (
                          <span className="ml-2 text-gray-500 font-normal">({d.specialty})</span>
                        ) : null}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Optional hint */}
        <p className="text-xs text-gray-400 mt-1">
              Select an existing doctor or type a new one.
        </p>
      </div>

      {/* Specialty */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
        <input
          {...register('specialty')}
          placeholder="e.g. Cardiology"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">
          Autofills when you pick a doctor. You can also type it manually.
        </p>
      </div>
    </div>

      {/* Hospital / Clinic */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Clinic</label>
        <input
          {...register('hospital')}
          placeholder="e.g., City Heart Center"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        {errors.hospital && <p className="text-red-500 text-xs mt-1">{errors.hospital.message}</p>}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          min={today}
          {...register('date')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
      </div>

      {/* Time (no slot selection) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
        <input
          type="time"
          {...register('time')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
        <input
          {...register('reason')}
          placeholder="e.g., Annual checkup"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* What to bring */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">What to bring</label>
        <textarea
          rows={3}
          {...register('bring')}
          placeholder="e.g., Lab reports, prescription list, insurance card..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Questions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Questions to ask</label>
        <textarea
          rows={3}
          {...register('questions')}
          placeholder="e.g., Side effects? diet changes? next follow-up?"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
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