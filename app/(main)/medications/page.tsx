// app/dashboard/medications/page.tsx
// MEDICATIONS PAGE
// URL: /dashboard/medications
// Shows medication list and weekly adherence tracking
 
'use client';
 
import React, { useState } from 'react';
import { Plus, Pill, Check, Package, MoreVertical, Pencil, Trash2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/UI/button';
 
// TYPE DEFINITIONS
 
interface Medication {
  id: string;
  
  // Basic Info
  name: string;
  dosage: string;                    // "500mg"
  form: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'cream' | 'drops';
  
  // Schedule
  frequency: string;                 // "3x daily"
  times: string[];                   // ["08:00", "14:00", "20:00"]
  instructions: string;              // "Take with food"
  instructionsVerified: boolean;     // From database or user confirmed?
  
  // Duration
  startDate: string;
  endDate?: string;                  // Optional - undefined means ongoing
  isOngoing: boolean;
  
  // Inventory
  remainingQuantity: number;
  refillReminderDays: number;        // Alert X days before running out
  
  // Reference
  prescribedBy?: string;
}

interface ScheduledDose {
  id: string;
  medicationId: string;
  medication: Medication;            // Reference to full medication
  
  scheduledTime: string;             // "08:00"
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  takenAt?: string;                  // "08:15" - actual time taken
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
    dosage: '500mg',
    form: 'capsule',
    frequency: '3x daily',
    times: ['08:00', '14:00', '20:00'],
    instructions: 'Take with food',
    instructionsVerified: true,
    startDate: '2025-03-01',
    endDate: '2025-03-14',
    isOngoing: false,
    remainingQuantity: 12,
    refillReminderDays: 5,
    prescribedBy: 'Dr. Emily Chen',
  },
  {
    id: '2',
    name: 'Vitamin D',
    dosage: '1000IU',
    form: 'tablet',
    frequency: '1x daily',
    times: ['08:00'],
    instructions: 'Take with meal',
    instructionsVerified: true,
    startDate: '2025-01-01',
    isOngoing: true,
    remainingQuantity: 24,
    refillReminderDays: 7,
  },
  {
    id: '3',
    name: 'Lisinopril',
    dosage: '10mg',
    form: 'tablet',
    frequency: '1x daily',
    times: ['20:00'],
    instructions: 'Take at the same time each day',
    instructionsVerified: false,
    startDate: '2025-02-01',
    isOngoing: true,
    remainingQuantity: 8,
    refillReminderDays: 5,
    prescribedBy: 'Dr. Sarah Corner',
  },
];

// Today's scheduled doses (would come from backend based on current date)
const todaysDoses: ScheduledDose[] = [
  {
    id: 'd1',
    medicationId: '1',
    medication: medications[0],
    scheduledTime: '08:00',
    status: 'taken',
    takenAt: '08:05',
  },
  {
    id: 'd2',
    medicationId: '2',
    medication: medications[1],
    scheduledTime: '08:00',
    status: 'taken',
    takenAt: '08:05',
  },
  {
    id: 'd3',
    medicationId: '1',
    medication: medications[0],
    scheduledTime: '14:00',
    status: 'pending',
  },
  {
    id: 'd4',
    medicationId: '1',
    medication: medications[0],
    scheduledTime: '20:00',
    status: 'pending',
  },
  {
    id: 'd5',
    medicationId: '3',
    medication: medications[2],
    scheduledTime: '20:00',
    status: 'pending',
  },
];
 

// HELPER FUNCTIONS

// Group doses by scheduled time
function groupDosesByTime(doses: ScheduledDose[]): Map<string, ScheduledDose[]> {
  const grouped = new Map<string, ScheduledDose[]>();
  
  doses.forEach(dose => {
    const existing = grouped.get(dose.scheduledTime) || [];
    grouped.set(dose.scheduledTime, [...existing, dose]);
  });
  
  return grouped;
}

// Format time for display (08:00 → 8:00 AM)
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Check if a time slot is the next upcoming one
function isNextUpcoming(time: string, doses: ScheduledDose[]): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [hours, minutes] = time.split(':').map(Number);
  const slotMinutes = hours * 60 + minutes;
  
  // Check if this slot has any pending doses
  const hasPending = doses.some(d => d.status === 'pending');
  if (!hasPending) return false;
  
  // Check if this is the next upcoming slot
  return slotMinutes >= currentMinutes;
}
 
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
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-900">Weekly Adherence</h2>
        <span className={cn(
          'font-medium',
          percentage >= 80 ? 'text-green-600' : 
          percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
        )}>
          {percentage}% On Track
        </span>
      </div>

{/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div 
          className={cn(
            'h-full rounded-full transition-all duration-500',
            percentage >= 80 ? 'bg-green-500' : 
            percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
          )}
          style={{ width: `${percentage}%` }}
        />
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
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function MedicationCard({ medication, isMenuOpen, onToggleMenu, onEdit, onDelete }: MedicationCardProps) {
  const isLowStock = medication.remainingQuantity < 5;
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
            {medication.frequency} • {medication.remainingQuantity} left
          </p>

        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={onToggleMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>

          {/* Dropdown */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
              <button
                onClick={onEdit}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={onDelete}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 
// MAIN PAGE COMPONENT
 
export default function MedicationsPage() {
  // STATE
  const [weeklyAdherence, setWeeklyAdherence] = useState<DayAdherence[]>([
    { day: 'M', completed: true, isWeekend: false },
    { day: 'T', completed: true, isWeekend: false },
    { day: 'W', completed: true, isWeekend: false },
    { day: 'T', completed: true, isWeekend: false },
    { day: 'F', completed: true, isWeekend: false },
    { day: 'S', completed: false, isWeekend: true },
    { day: 'S', completed: false, isWeekend: true },
  ]);

  // CALCULATED VALUES
  const completedDays = weeklyAdherence.filter(d => d.completed).length;
  const adherencePercentage = Math.round((completedDays / weeklyAdherence.length) * 100);

  // HANDLERS
  const handleToggleDay = (index: number) => {
    setWeeklyAdherence(prev =>
      prev.map((day, i) =>
        i === index
          ? { ...day, completed: !day.completed }
          : day
      )
    );
  };

  // MENU STATE
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleEditMedication = (id: string) => {
    console.log('Edit medication:', id);
    // TODO: Open edit modal or navigate to edit page
    setOpenMenuId(null);
  };

  const handleDeleteMedication = (id: string) => {
    console.log('Delete medication:', id);
    // TODO: Show confirmation dialog, then delete
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader />

      <WeeklyAdherenceCard
        days={weeklyAdherence}
        percentage={adherencePercentage}
        onToggleDay={handleToggleDay}
      />
      
      <div className="space-y-4">
        {medications.length > 0 ? (
          medications.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              isMenuOpen={openMenuId === medication.id}
              onToggleMenu={() => setOpenMenuId(
                openMenuId === medication.id ? null : medication.id
              )}
              onEdit={() => handleEditMedication(medication.id)}
              onDelete={() => handleDeleteMedication(medication.id)}
            />
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