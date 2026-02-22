
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
import type { HealthMetric } from '@/components/dashboard/healthmetriccard';
import type { MedicalRecord } from '@/components/dashboard/recentrecords';
import type { Appointment } from '@/components/dashboard/upcomingappointments';
import type { Medication } from '@/components/dashboard/medicationswidget';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';


//Sample data for the dashboard (replace with real API data in production)
const healthMetrics: HealthMetric[] = [
  {
    id: '1',
    label: 'Heart Rate',
    value: '72',
    unit: 'bpm',
    status: 'normal',
  },
  {
    id: '2',
    label: 'Blood Pressure',
    value: '120/80',
    status: 'normal',
  },
  {
    id: '3',
    label: 'Glucose',
    value: '95',
    unit: 'mg/dL',
    status: 'optimal',
  },
  {
    id: '4',
    label: 'Weight',
    value: '78',
    unit: 'kg',
    status: 'normal',
    change: '-2 kg',
  },
];

const recentRecords: MedicalRecord[] = [
  {
    id: '1',
    title: 'Blood Test Report',
    date: 'Today',
    time: '10:23 AM',
    type: 'Lab Report',
    tags: ['Blood', 'Routine'],
  },
  {
    id: '2',
    title: 'Cardiologist Prescription',
    date: 'Yesterday',
    type: 'Prescription',
    tags: ['Heart', 'DrSmith'],
  },
  {
    id: '3',
    title: 'X-Ray Right Knee',
    date: 'Oct 24, 2025',
    type: 'Scan',
    tags: ['Ortho'],
  },
];

const upcomingAppointment: Appointment = {
  id: '1',
  doctorName: 'Dr. Sarah Conner',
  specialty: 'Cardiologist',
  date: new Date(2025, 11, 16), 
  time: '9:00 AM',
};

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
      <WelcomeBanner 
        userName={user?.name ?? ''} 
        upcomingAppointments={1} 
      />
      {/* ROW 2: Health Metrics */}
      <section>
        <HealthMetricsGrid metrics={healthMetrics} />
      </section>

      {/* ROW 3: Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Recent Records (takes 2 columns) */}
        <div className="lg:col-span-2">
          <RecentRecords records={recentRecords} />
        </div>

        {/* Right Column - Upcoming & Medications */}
        <div className="space-y-6">
          <UpcomingAppointment appointment={upcomingAppointment} />
          <MedicationsWidget medications={medications} />
        </div>
        
      </div>
    </div>
  );
}
