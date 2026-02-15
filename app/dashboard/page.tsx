// app/dashboard/page.tsx
// ============================================
// MAIN DASHBOARD PAGE
// ============================================
// This is the content shown at /dashboard
// It combines all the dashboard components

'use client';

import React from 'react';

// Import all dashboard components
import { WelcomeBanner } from '@/components/dashboard/welcomebanner';
import { HealthMetricsGrid } from '@/components/dashboard/healthmetriccard';
import { RecentRecords } from '@/components/dashboard/recentrecords';
import { UpcomingAppointment } from '@/components/dashboard/upcomingappointments';
//import { MedicationsWidget } from '@/components/dashboard/MedicationsWidget';

// Import types
import type { HealthMetric } from '@/components/dashboard/healthmetriccard';
import type { MedicalRecord } from '@/components/dashboard/recentrecords';
import type { Appointment } from '@/components/dashboard/upcomingappointments';
//import type { Medication } from '@/components/dashboard/MedicationsWidget';

// ============================================
// SAMPLE DATA (Matches your design exactly)
// ============================================
// In a real app, this data would come from your backend API

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
  date: new Date(2025, 11, 16),  // December 16, 2025
  time: '9:00 AM',
};


// ============================================
// DASHBOARD PAGE COMPONENT
// ============================================
export default function DashboardPage() {
  return (
    // Main container with vertical spacing between sections
    <div className="space-y-6 animate-fade-in">
      
      {/* ================================
          ROW 1: WELCOME BANNER
          ================================ */}
      <WelcomeBanner 
        userName="John" 
        upcomingAppointments={1} 
      />
      {/* ================================
          ROW 2: HEALTH METRICS
          ================================ */}
      <section>
        <HealthMetricsGrid metrics={healthMetrics} />
      </section>

      {/* ================================
          ROW 3: MAIN CONTENT GRID
          ================================
          - Left (2/3): Recent Medical Records
          - Right (1/3): Upcoming + Medications
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Recent Records (takes 2 columns) */}
        <div className="lg:col-span-2">
          <RecentRecords records={recentRecords} />
        </div>

        {/* Right Column - Upcoming & Medications */}
        <div className="space-y-6">
          <UpcomingAppointment appointment={upcomingAppointment} />
        </div>

      </div>
    </div>
  );
}
