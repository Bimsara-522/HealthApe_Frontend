'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppointment } from 'app/(main)/appointments/hooks/useAppointment'
import { useCancelAppointment } from 'app/(main)/appointments/hooks/useAppointments'
import { AppointmentStatusBadge } from '@/components/appointments/AppointmentStatusBadge'
import { formatAppointmentDate } from 'app/(main)/appointments/lib/utils/date'

export default function AppointmentDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const { data: appt, isLoading, isError, error } = useAppointment(id)
  const cancelMutation = useCancelAppointment()

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl">
        <div className="h-7 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="mt-6 h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />
      </div>
    )
  }

  if (isError || !appt) {
    return (
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-bold">Appointment</h1>
        <p className="mt-2 text-sm text-red-600">  {(error as any)?.message ?? 'Failed to load appointment'} </p>
        <Link className="inline-block mt-4 text-blue-600 hover:underline" href="/appointments">  ← Back to appointments </Link>
      </div>
    )
  }

  const isCompleted = appt.status === 'completed'
  const isCancelled = appt.status === 'cancelled'
  const isLocked = isCompleted || isCancelled

  const onCancel = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this appointment?'
    )
    if (!confirmed) return

    await cancelMutation.mutateAsync(appt.id)
    router.refresh()
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
            <p className="text-sm text-gray-500 mt-1"> View, edit, or cancel your booking. </p>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted && !isCancelled && (
              <Link
                href={`/appointments/${appt.id}/edit`}
                className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:opacity-90"
              >
                Edit
              </Link>
            )}

            {/* {!isCompleted && ( */}
            {!isCompleted && !isCancelled && (  
              <button
                onClick={onCancel}
                disabled={cancelMutation.isPending || isCancelled}
                className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isCancelled ? 'Cancelled' : cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
              </button>
            )}
          </div>   
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {appt.doctor?.avatarUrl ? (
                <img src={appt.doctor.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">👤</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-gray-900 truncate">
                  {/* {appt.doctor?.name || 'Doctor'} */}
                  {appt.doctor?.name ?? appt.doctorNameSnapshot ?? 'Doctor'}
                </p>
                <AppointmentStatusBadge status={appt.status} />
              </div>

              <p className="text-sm text-gray-500 mt-1 truncate">
                {appt.doctor?.specialty ?? 'Specialist'} · {appt.hospital}
                {/* {appt.doctor?.specialty || 'Specialist'} · {appt.hospital} */}
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{formatAppointmentDate(appt.date)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">{appt.time}</p>
                </div>
              </div>

              {appt.reason && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="text-sm text-gray-900 mt-1">{appt.reason}</p>
                </div>
              )}

              {appt.bring && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">What to bring</p>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{appt.bring}</p>
                </div>
              )}

              {appt.questions && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Questions to ask</p>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{appt.questions}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Link className="text-blue-600 hover:underline text-sm" href="/appointments">
          ← Back to appointments
        </Link>
      </div>
    </div>
  )
}
