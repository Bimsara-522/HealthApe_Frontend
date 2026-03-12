
//Main Dashboard Page

'use client';

import React, { useEffect } from 'react';

// Import all dashboard components
import { WelcomeBanner } from '@/components/dashboard/welcomebanner';
import { HealthMetricsGrid } from '@/components/dashboard/healthmetriccard';
import { RecentRecords } from '@/components/dashboard/recentrecords';
import { UpcomingAppointment } from '@/components/dashboard/upcomingappointments';
import { MedicationsWidget } from '@/components/dashboard/medicationswidget';

// Import types
import { useNextAppointment, useUpcomingCount } from '@/hooks/useAppointment';
import type { Medication } from '@/components/dashboard/medicationswidget';
import { useAuth } from '@/context/AuthContext';
import { useRecentRecords } from '@/hooks/useMedicalRecords';
import { useRouter } from 'next/navigation';



const medications: Medication[] = [
  {
    id: '1',
    name: 'Amoxicillin',
    dosage: '500g',
    schedule: 'Morning',
    taken: true,   //Toggle is on (green)
  },
  {
    id: '2',
    name: 'Vitamin B',
    dosage: 'Evening',
    schedule: 'Evening',
    taken: false,  //Toggle is OFF (gray)
  },
];



//Dashboard page component

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { records: recentRecords, loading: recordsLoading } = useRecentRecords();
  const { appointment: nextAppointment, loading: appointmentLoading } = useNextAppointment();
  const { count: upcomingCount } = useUpcomingCount();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!loading && !user) {
  //     // console.log('User not authenticated, redirecting to login page...');
  //     router.push('/login');
  //   }
  // }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;
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
          <MedicationsWidget medications={medications} />
        </div>
        
      </div>
    </div>
  );
}
