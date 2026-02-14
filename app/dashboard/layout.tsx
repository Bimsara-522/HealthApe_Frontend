export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-gray-100 text-black">
      {/* Dashboard navbar could go here */}
      {children}
    </section>
  );
}
