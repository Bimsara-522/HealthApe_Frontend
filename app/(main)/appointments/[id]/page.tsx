// /appointments/[id] (detail view)
import AppointmentDetailClient from './ui/AppointmentDetailClient'

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <AppointmentDetailClient id={id} />
}
