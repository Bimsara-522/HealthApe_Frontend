
//Main Dashboard Page

'use client';

// Import all dashboard components
import { WelcomeBanner } from '@/components/dashboard/welcomebanner';
import { RecentRecords } from '@/components/dashboard/recentrecords';
import { UpcomingAppointment } from '@/components/dashboard/upcomingappointments';
import { MedicationsWidget } from '@/components/dashboard/medicationswidget';

// Import types
import { useNextAppointment, useUpcomingCount } from 'app/(main)/appointments/hooks/useAppointment';
import { useAuth } from '@/context/AuthContext';
import { useRecentRecords } from '@/hooks/useMedicalRecords';
import { useDashboardMedications } from '@/hooks/useMedications';
import { useEffect, useState } from 'react';
import { getNotificationSettings, NotificationSettingsDto } from '../settings/lib/api/settings';

//Dashboard page component

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { records: recentRecords, loading: recordsLoading } = useRecentRecords();
  const { appointment: nextAppointment, loading: appointmentLoading } = useNextAppointment();
  const { count: upcomingCount } = useUpcomingCount();
  const { medications, loading: medsLoading } = useDashboardMedications();

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsDto | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // const router = useRouter();

  // useEffect(() => {
  //   if (!loading && !user) {
  //     // console.log('User not authenticated, redirecting to login page...');
  //     router.push('/login');
  //   }
  // }, [user, loading, router]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getNotificationSettings();
        setNotificationSettings(settings);
      } catch {
        setNotificationSettings(null);
      } finally {
        setSettingsLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (loading || settingsLoading) return <p>Loading...</p>;
  // if (loading) return <p>Loading...</p>;

  return (
    // Main container with vertical spacing between sections
    <div className="space-y-6 animate-fade-in">
      
      {/* ROW 1: Welcome Banner */}
      <WelcomeBanner userName={user?.name ?? ''} upcomingAppointments={upcomingCount} />

      {/* ROW 2: Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Recent Records (takes 2 columns) */}
        <div className="lg:col-span-2">
          <RecentRecords records={recentRecords} loading={recordsLoading} />
        </div>

        {/* Right Column - Upcoming & Medications */}
        <div className="space-y-6">
          <UpcomingAppointment appointment={nextAppointment} loading={appointmentLoading} />
          {/* <MedicationsWidget medications={medications} loading={medsLoading} /> */}
          {notificationSettings?.medicationReminders && (
            <MedicationsWidget medications={medications} loading={medsLoading} />
          )}
        </div>
        
      </div>
    </div>
  );
}
