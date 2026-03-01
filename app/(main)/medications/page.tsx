// app/dashboard/medications/page.tsx
// MEDICATIONS PAGE
// URL: /dashboard/medications
// Shows medication list and weekly adherence tracking
 
'use client';
 
import React, { useState } from 'react';
import { Plus, Pill, Check, Package, MoreVertical, Pencil, Trash2 } from 'lucide-react';
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

interface WeeklyAdherenceCardProps {
  days: DayAdherence[];
  percentage: number;
  onToggleDay: (index: number) => void;
}

function WeeklyAdherenceCard({ days, percentage, onToggleDay }: WeeklyAdherenceCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Weekly Adherence</h2>
        <span className="text-green-600 font-medium">{percentage}% On Track</span>
      </div>
      <div className="flex items-center justify-between sm:justify-start sm:gap-8">
        {days.map((day: DayAdherence, index: number) => (
          <button
            key={index}
            onClick={() => onToggleDay(index)}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={cn(
                'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center',
                'transition-all duration-200',
                'group-hover:scale-110',
                day.completed
                  ? 'bg-green-100 group-hover:bg-green-200'
                  : 'bg-gray-100 group-hover:bg-gray-200'
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
          </button>
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
      

      <div className="space-y-4">
        {medications.length > 0 ? (
          medications.map((medication) => (
            <MedicationCard key={medication.id} medication={medication} />
          ))
        ) : (
          // Empty State
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No medications yet
            </h3>
            <p className="text-gray-500 mb-4">
              Add your first medication to start tracking adherence
            </p>
            <Button variant="primary" className="inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Add Medication</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}