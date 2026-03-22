export default function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout wraps:
  // /appointments
  // /appointments/new
  // /appointments/all
  // /appointments/[id]
  // /appointments/[id]/edit
  return <>{children}</>
}