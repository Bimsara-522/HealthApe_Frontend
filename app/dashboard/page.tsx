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
//import { RecentRecords } from '@/components/dashboard/RecentRecords';
//import { UpcomingAppointment } from '@/components/dashboard/UpcomingAppointment';
//import { MedicationsWidget } from '@/components/dashboard/MedicationsWidget';

// Import types
import type { HealthMetric } from '@/components/dashboard/healthmetriccard';
//import type { MedicalRecord } from '@/components/dashboard/RecentRecords';
//import type { Appointment } from '@/components/dashboard/UpcomingAppointment';
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

    </div>
  );
}
