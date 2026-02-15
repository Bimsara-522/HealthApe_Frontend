// app/dashboard/medications/page.tsx
// MEDICATIONS PAGE
// URL: /dashboard/medications
// Shows medication list and weekly adherence tracking
 
'use client';
 
import React from 'react';
import { Plus, Pill, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/UI/button';
 
// TYPE DEFINITIONS
 
interface Medication {
  id: string;
  name: string;
  frequency: string;
  daysRemaining: number;
}
 
interface DayAdherence {
  day: string;
  completed: boolean;
  isWeekend: boolean;
}
 
// SAMPLE DATA
 
const medications: Medication[] = [
  {
    id: '1',
    name: 'Amoxicillin',
    frequency: '3x daily',
    daysRemaining: 4,
  },
  {
    id: '2',
    name: 'Vitamin D',
    frequency: '1x daily',
    daysRemaining: 24,
  },
  {
    id: '3',
    name: 'Lisinopril',
    frequency: '1x daily',
    daysRemaining: 8,
  },
];
 
const weeklyAdherence: DayAdherence[] = [
  { day: 'M', completed: true, isWeekend: false },
  { day: 'T', completed: true, isWeekend: false },
  { day: 'W', completed: true, isWeekend: false },
  { day: 'T', completed: true, isWeekend: false },
  { day: 'F', completed: true, isWeekend: false },
  { day: 'S', completed: false, isWeekend: true },
  { day: 'S', completed: false, isWeekend: true },
];
 
// Calculate adherence percentage
const completedDays = weeklyAdherence.filter(d => d.completed).length;
const totalDays = weeklyAdherence.length;
const adherencePercentage = Math.round((completedDays / totalDays) * 100);
 
 
// PAGE HEADER COMPONENT
 
function PageHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Medications</h1>
        <p className="text-gray-500 mt-1">Track adherence and refills.</p>
      </div>
      
      <Button variant="primary" className="flex items-center gap-2 self-start sm:self-center">
        <Plus className="w-5 h-5" />
        <span>Add Med</span>
      </Button>
    </div>
  );
}
 
// MAIN PAGE COMPONENT
 
export default function MedicationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader />
    </div>
  );
}