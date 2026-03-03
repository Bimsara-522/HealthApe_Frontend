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


// TIME SLOT COMPONENT

interface TimeSlotProps {
  time: string;
  doses: ScheduledDose[];
  isNext: boolean;
  onMarkTaken: (doseId: string) => void;
  onMarkSkipped: (doseId: string) => void;
}

function TimeSlot({ time, doses, isNext, onMarkTaken, onMarkSkipped }: TimeSlotProps) {
  // Check if all doses in this slot are completed
  const allCompleted = doses.every(d => d.status === 'taken' || d.status === 'skipped');
  
  return (
    <div className={cn(
      'bg-white rounded-2xl border p-4',
      isNext ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100'
    )}>
      {/* Time Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className={cn(
            'w-5 h-5',
            allCompleted ? 'text-green-500' : isNext ? 'text-blue-500' : 'text-gray-400'
          )} />
          <span className={cn(
            'font-semibold',
            allCompleted ? 'text-green-600' : isNext ? 'text-blue-600' : 'text-gray-700'
          )}>
            {formatTime(time)}
          </span>
        </div>
        
        {isNext && !allCompleted && (
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            NEXT
          </span>
        )}
        
        {allCompleted && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            DONE
          </span>
        )}
      </div>
      
      {/* Doses List */}
      <div className="space-y-2">
        {doses.map(dose => (
          <DoseItem 
            key={dose.id} 
            dose={dose} 
            onMarkTaken={() => onMarkTaken(dose.id)}
            onMarkSkipped={() => onMarkSkipped(dose.id)}
          />
        ))}
      </div>
    </div>
  );
}


// DOSE ITEM COMPONENT

interface DoseItemProps {
  dose: ScheduledDose;
  onMarkTaken: () => void;
  onMarkSkipped: () => void;
}

function DoseItem({ dose, onMarkTaken, onMarkSkipped }: DoseItemProps) {
  const { medication, status, takenAt } = dose;
  
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl',
      status === 'taken' ? 'bg-green-50' :
      status === 'skipped' ? 'bg-gray-50' :
      status === 'missed' ? 'bg-red-50' :
      'bg-gray-50'
    )}>
      {/* Status Icon */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        status === 'taken' ? 'bg-green-100' :
        status === 'skipped' ? 'bg-gray-200' :
        status === 'missed' ? 'bg-red-100' :
        'bg-white border-2 border-gray-200'
      )}>
        {status === 'taken' && <Check className="w-4 h-4 text-green-600" />}
        {status === 'skipped' && <span className="text-gray-400 text-xs">—</span>}
        {status === 'missed' && <AlertCircle className="w-4 h-4 text-red-500" />}
      </div>
      
      {/* Medication Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-medium',
            status === 'taken' ? 'text-green-700' :
            status === 'skipped' ? 'text-gray-500 line-through' :
            'text-gray-900'
          )}>
            {medication.name} {medication.dosage}
          </span>
          
          {!medication.instructionsVerified && (
            <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              ⚠️ Verify
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-500">
          {medication.instructions}
          {status === 'taken' && takenAt && (
            <span className="text-green-600"> · Taken at {formatTime(takenAt)}</span>
          )}
        </p>
      </div>
      
      {/* Action Buttons - Only show for pending */}
      {status === 'pending' && (
        <div className="flex items-center gap-2">
          <button
            onClick={onMarkSkipped}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onMarkTaken}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            Take
          </button>
        </div>
      )}
    </div>
  );
}

// TODAY'S SCHEDULE COMPONENT

interface TodaysScheduleProps {
  doses: ScheduledDose[];
  onMarkTaken: (doseId: string) => void;
  onMarkSkipped: (doseId: string) => void;
}

function TodaysSchedule({ doses, onMarkTaken, onMarkSkipped }: TodaysScheduleProps) {
  // Group doses by time
  const groupedDoses = groupDosesByTime(doses);
  
  // Sort times chronologically
  const sortedTimes = Array.from(groupedDoses.keys()).sort();
  
  // Find the first upcoming time slot with pending doses
  let foundNext = false;
  
  // Get today's date formatted
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  // Calculate today's progress
  const completedCount = doses.filter(d => d.status === 'taken').length;
  const totalCount = doses.length;
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
          <p className="text-sm text-gray-500">{today}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600">{completedCount}/{totalCount}</span>
          <p className="text-sm text-gray-500">doses taken</p>
        </div>
      </div>
      
      {/* Time Slots */}
      <div className="space-y-3">
        {sortedTimes.map(time => {
          const timeDoses = groupedDoses.get(time) || [];
          const hasPending = timeDoses.some(d => d.status === 'pending');
          const isNext = !foundNext && hasPending && isNextUpcoming(time, timeDoses);
          
          if (isNext) foundNext = true;
          
          return (
            <TimeSlot
              key={time}
              time={time}
              doses={timeDoses}
              isNext={isNext}
              onMarkTaken={onMarkTaken}
              onMarkSkipped={onMarkSkipped}
            />
          );
        })}
      </div>
    </div>
  );
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

  // TODAY'S DOSES STATE
  const [todaysSchedule, setTodaysSchedule] = useState<ScheduledDose[]>(todaysDoses);

  // HANDLERS FOR DOSES
  const handleMarkTaken = (doseId: string) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    setTodaysSchedule(prev =>
      prev.map(dose =>
        dose.id === doseId
          ? { ...dose, status: 'taken' as const, takenAt: timeString }
          : dose
      )
    );
  };

  const handleMarkSkipped = (doseId: string) => {
    setTodaysSchedule(prev =>
      prev.map(dose =>
        dose.id === doseId
          ? { ...dose, status: 'skipped' as const }
          : dose
      )
    );
  };

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