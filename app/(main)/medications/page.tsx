// app/dashboard/medications/page.tsx
// MEDICATIONS PAGE
// URL: /dashboard/medications
// Shows medication list and weekly adherence tracking
 
'use client';
 
import React from 'react';
import { Plus, Pill, Check, Package } from 'lucide-react';
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

// WEEKLY ADHERENCE CARD

function WeeklyAdherenceCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Weekly Adherence</h2>
        <span className="text-green-600 font-medium">{adherencePercentage}% On Track</span>
      </div>
      <div className="flex items-center justify-between sm:justify-start sm:gap-8">
        {weeklyAdherence.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div
              className={cn(
                'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center',
                day.completed
                  ? 'bg-green-100'
                  : 'bg-gray-100'
              )}
            >
              {day.completed && (
                <Check className="w-5 h-5 text-green-600" />
              )}
            </div>
            
            <span
              className={cn(
                'text-sm font-medium',
                day.completed ? 'text-gray-900' : 'text-gray-400'
              )}
            >
              {day.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


// MEDICATION CARD COMPONENT

interface MedicationCardProps {
  medication: Medication;
}

function MedicationCard({ medication }: MedicationCardProps) {
  const isLowStock = medication.daysRemaining < 5;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <Pill className="w-6 h-6 text-purple-500" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{medication.name}</h3>
            
            {isLowStock && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                Low Stock
              </span>
            )}
          </div>
          
          <p className={cn(
            'text-sm mt-0.5',
            isLowStock ? 'text-red-600' : 'text-gray-500'
          )}>
            {medication.frequency} • {medication.daysRemaining} days remaining
          </p>

        </div>
      </div>
    </div>
  );
}
 
// MAIN PAGE COMPONENT
 
export default function MedicationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader />
      <WeeklyAdherenceCard />

      <div className="space-y-4">
        {medications.map((medication) => (
          <MedicationCard key={medication.id} medication={medication} />
        ))}
      </div>
    </div>
  );
}