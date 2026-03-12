// app/dashboard/medications/page.tsx
// MEDICATIONS PAGE
// URL: /dashboard/medications
// Shows medication list and weekly adherence tracking
 
'use client';
 
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

// Check if a time slot is within the 2 hour grace period
function isInGracePeriod(time: string, doses: ScheduledDose[]): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [hours, minutes] = time.split(':').map(Number);
  const slotMinutes = hours * 60 + minutes;

  // Only applies to slots that have passed but within 2 hours
  const minutesPassed = currentMinutes - slotMinutes;
  const hasPending = doses.some(d => d.status === 'pending');

  return hasPending && minutesPassed > 0 && minutesPassed <= 120;
}


// TIME SLOT COMPONENT

interface TimeSlotProps {
  time: string;
  doses: ScheduledDose[];
  isNext: boolean;
  isGrace: boolean;
  onMarkTaken: (doseId: string) => void;
  onMarkSkipped: (doseId: string) => void;
}

function TimeSlot({ time, doses, isNext, isGrace, onMarkTaken, onMarkSkipped }: TimeSlotProps) {  // Check if all doses in this slot are completed
  const allCompleted = doses.every(d => d.status === 'taken' || d.status === 'skipped');
  
  return (
    <div className={cn(
      'bg-white rounded-2xl border p-4',
      isNext ? 'border-blue-300 ring-2 ring-blue-100' :
      isGrace ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-100'
    )}>
      {/* Time Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className={cn(
            'w-5 h-5',
            allCompleted ? 'text-green-500' : 
            isNext ? 'text-blue-500' : 
            isGrace ? 'text-amber-500' :
            'text-gray-400'
          )} />
          
          <span className={cn(
            'font-semibold',
            allCompleted ? 'text-green-600' : 
            isNext ? 'text-blue-600' : 
            isGrace ? 'text-amber-600' :
            'text-gray-700'
          )}>
            {formatTime(time)}
          </span>
        </div>
        
        {isNext && !allCompleted && (
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            NEXT
          </span>
        )}

        {isGrace && !allCompleted && (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full animate-pulse">
            Take Soon!
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
             isGrace={!foundNext && !isNext && isInGracePeriod(time, timeDoses)}
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
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Medications</h1>
        <p className="text-gray-500 mt-1">Track adherence and refills.</p>
      </div>
      
      <Button
        variant="primary"
        className="flex items-center gap-2 self-start sm:self-center"
        onClick={() => router.push('/upload?category=Prescription')}
      >
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
 
  // Calculate days until end (if not ongoing)
  const daysUntilEnd = medication.endDate 
    ? Math.ceil((new Date(medication.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Pill Icon */}
        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <Pill className="w-6 h-6 text-purple-500" />
        </div>

        {/* Medication Info */}
        <div className="flex-1 min-w-0">
          {/* Name + Dosage + Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">
              {medication.name} <span className="text-gray-500 font-normal">{medication.dosage}</span>
            </h3>
            
            {/* Form badge */}
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full capitalize">
              {medication.form}
            </span>
            
  
            
            {/* Unverified instructions warning */}
            {!medication.instructionsVerified && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                ⚠️ Verify instructions
              </span>
            )}
          </div>
          
          {/* Frequency + Times */}
          <p className="text-sm text-gray-600 mt-1">
            {medication.frequency} · {medication.times.map(t => formatTime(t)).join(', ')}
          </p>
          
          {/* Instructions */}
          <p className="text-sm text-gray-500 mt-1">
            📋 {medication.instructions}
          </p>
          
          {/* Bottom row: Duration + Stock + Doctor */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
            {/* Duration */}
            {medication.isOngoing ? (
              <span className="flex items-center gap-1">
                🔄 Ongoing
              </span>
            ) : (
              <span className={cn(
                'flex items-center gap-1',
                daysUntilEnd !== null && daysUntilEnd <= 3 ? 'text-amber-600' : ''
              )}>
                📅 {daysUntilEnd !== null && daysUntilEnd > 0 
                  ? `${daysUntilEnd} days left` 
                  : 'Ended'}
              </span>
            )}
            
    
            
            {/* Doctor */}
            {medication.prescribedBy && (
              <span className="flex items-center gap-1">
                👨‍⚕️ {medication.prescribedBy}
              </span>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative flex-shrink-0">
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
 
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export default function MedicationsPage() {
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  // Edit modal state
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [editInstructions, setEditInstructions] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // API STATE
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todaysSchedule, setTodaysSchedule] = useState<ScheduledDose[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(true);

  // Fetch medications from API
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const res = await fetch(`${API_BASE}/medication`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data: Medication[] = await res.json();
        setMedications(data);

        // Build today's doses from fetched medications
        const today = new Date().toISOString().slice(0, 10);
        const doses: ScheduledDose[] = [];
        data.forEach((med) => {
        // Skip medications that have already ended
           if (med.endDate && new Date(med.endDate) < new Date()) return;
           (med.times ?? []).forEach((time, index) => {
            doses.push({
            
              id: `${med.id}-${index}`,
              medicationId: med.id,
              medication: med,
              scheduledTime: time,
              status: 'pending',
            });
          });
        });

       // Fetch today's logs and match status
       try {
        const logRes = await fetch(`${API_BASE}/dose-log/today`, {
          credentials: 'include',
        });
        if (logRes.ok) {
          const logs = await logRes.json();
          doses.forEach(dose => {
            const match = logs.find(
              (l: any) =>
                l.medicationId === dose.medicationId &&
              l.scheduledTime === dose.scheduledTime &&
              l.scheduledDate === today
            );
            if (match) {
              dose.status = match.status;
              if (match.takenAt) {
                const t = new Date(match.takenAt);
                dose.takenAt = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
              }
            }
          });
        }
      } catch (err) {
        console.error('Failed to fetch today logs:', err);
      }
      
      setTodaysSchedule(doses);
      } catch (err) {
        console.error('Failed to load medications:', err);
      } finally {
        setLoadingMeds(false);
      }
    };

    fetchMedications();
    fetchWeekAdherence();
  }, []);

  // Background checker — runs every minute to mark missed doses
  useEffect(() => {
   const checkMissedDoses = async () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const today = now.toISOString().slice(0, 10);

    setTodaysSchedule(prev => {
      const updated = [...prev];
      let anyMissed = false;

      updated.forEach(dose => {
        if (dose.status !== 'pending') return;

        const [hours, minutes] = dose.scheduledTime.split(':').map(Number);
        const slotMinutes = hours * 60 + minutes;
        const minutesPassed = currentMinutes - slotMinutes;

        // Mark missed if grace period (2 hours) has passed
        if (minutesPassed > 120) {
          dose.status = 'missed';
          anyMissed = true;

          // Log to backend
          fetch(`${API_BASE}/dose-log`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              medicationId: dose.medicationId,
              scheduledDate: today,
              scheduledTime: dose.scheduledTime,
              status: 'missed',
            }),
          }).catch(err => console.error('Failed to log missed dose:', err));
        }
      });

      return anyMissed ? updated : prev;
    });

    // Refresh adherence bar if any doses were missed
    fetchWeekAdherence();
  };

  // Run immediately on mount
  checkMissedDoses();

  // Then run every minute
  const interval = setInterval(checkMissedDoses, 60000);

  // Cleanup on unmount
  return () => clearInterval(interval);
}, []);

  // STATE
  const [weeklyAdherence, setWeeklyAdherence] = useState<DayAdherence[]>([
    { day: 'M', completed: false, isWeekend: false },
    { day: 'T', completed: false, isWeekend: false },
    { day: 'W', completed: false, isWeekend: false },
    { day: 'T', completed: false, isWeekend: false },
    { day: 'F', completed: false, isWeekend: false },
    { day: 'S', completed: false, isWeekend: true },
    { day: 'S', completed: false, isWeekend: true },
  ]);

  // Fetch weekly adherence from API
  const fetchWeekAdherence = async () => {
    try {
      const res = await fetch(`${API_BASE}/dose-log/week`, {
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();

      // Map API response to DayAdherence format
      const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      setWeeklyAdherence(
        data.map((d: any, i: number) => ({
          day: days[i],
          completed: d.completed,
          isWeekend: d.isWeekend,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch week adherence:', err);
    }
  };

  // CALCULATED VALUES
  const completedDays = weeklyAdherence.filter(d => d.completed).length;
  const adherencePercentage = Math.round((completedDays / weeklyAdherence.length) * 100);

  // HANDLERS
  const handleToggleDay = (_index: number) => {};

  // Show a toast message and auto-hide after 3 seconds
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // MENU STATE
  const handleMarkTaken = async (doseId: string) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const today = now.toISOString().slice(0, 10);

    // Find the dose to get medicationId and scheduledTime
    const dose = todaysSchedule.find(d => d.id === doseId);
    if (!dose) return;

    // Update UI instantly
    setTodaysSchedule(prev =>
      prev.map(d =>
        d.id === doseId
          ? { ...d, status: 'taken' as const, takenAt: timeString }
          : d
      )
    );

    // Log to backend
    try {
      await fetch(`${API_BASE}/dose-log`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: dose.medicationId,
          scheduledDate: today,
          scheduledTime: dose.scheduledTime,
          status: 'taken',
        }),
      });

      // Refresh weekly adherence bar
      fetchWeekAdherence();
    } catch (err) {
      console.error('Failed to log dose:', err);
    }
  };

  const handleMarkSkipped = async (doseId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    
    const dose = todaysSchedule.find(d => d.id === doseId);
    if (!dose) return;

    // Update UI instantly
    setTodaysSchedule(prev =>
      prev.map(d =>
        d.id === doseId
          ? { ...d, status: 'skipped' as const }
          : d
      )
    );

    // Log to backend
    try {
      await fetch(`${API_BASE}/dose-log`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: dose.medicationId,
          scheduledDate: today,
          scheduledTime: dose.scheduledTime,
          status: 'skipped',
        }),
      });

      // Refresh weekly adherence bar
      fetchWeekAdherence();
    } catch (err) {
      console.error('Failed to log dose:', err);
    }
  };
      

  const handleEditMedication = (id: string) => {
    const med = medications.find(m => m.id === id);
    if (!med) return;
    setEditingMedication(med);
    setEditInstructions(med.instructions ?? '');
    setEditEndDate(med.endDate ? new Date(med.endDate).toISOString().slice(0, 10) : '');
    setOpenMenuId(null);
  };
  
  const handleSaveEdit = async () => {
    if (!editingMedication) return;
    setEditSaving(true);
    
    try {
      const res = await fetch(`${API_BASE}/medication/${editingMedication.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructions: editInstructions,
          endDate: editEndDate || null,
          isOngoing: !editEndDate,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to update');
      
      const updated = await res.json();

      // Update local state instantly
      setMedications(prev =>
        prev.map(m => m.id === updated.id ? updated : m)
      );

      // Also update today's schedule references
      setTodaysSchedule(prev =>
        prev.map(d =>
          d.medicationId === updated.id
            ? { ...d, medication: updated }
            : d
        )
      );
      
      setEditingMedication(null);
      showToast('success', 'Instructions updated and verified successfully!');
    } catch (err) {
      console.error('Failed to save edit:', err);
      showToast('error', 'Failed to update instructions. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  // Step 1 — open confirmation modal
const handleDeleteMedication = (id: string) => {
  setDeletingId(id);
  setDeleteConfirmOpen(true);
  setOpenMenuId(null);
};

// Step 2 — actually delete after confirmation
const confirmDelete = async () => {
  if (!deletingId) return;
  try {
    const res = await fetch(`${API_BASE}/medication/${deletingId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Failed to delete');

    setMedications(prev => prev.filter(m => m.id !== deletingId));
    setTodaysSchedule(prev => prev.filter(d => d.medicationId !== deletingId));
    setDeleteConfirmOpen(false);
    setDeletingId(null);
    showToast('success', 'Medication deleted successfully!');
  } catch (err) {
    console.error('Failed to delete medication:', err);
    showToast('error', 'Failed to delete medication. Please try again.');
  }
};

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader />

      {/* Today's Schedule - The Main Feature! */}
      <TodaysSchedule
        doses={todaysSchedule}
        onMarkTaken={handleMarkTaken}
        onMarkSkipped={handleMarkSkipped}
      />

      {/* Weekly Adherence */}
      <WeeklyAdherenceCard
        days={weeklyAdherence}
        percentage={adherencePercentage}
        onToggleDay={handleToggleDay}
      />

      {/* All Medications */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">All Medications</h2>
        {loadingMeds ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">Loading medications...</p>
          </div>
        ) : medications.length > 0 ? (
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
            <Button
            variant="primary"
            className="inline-flex items-center gap-2"onClick={() => router.push('/upload?category=Prescription')}
            >
              <Plus className="w-5 h-5" />
              <span>Add Medication</span>
            </Button>
          </div>
        )}
      </div>


      {/* Toast Notification — matches login style */}
{toast && (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[520px] max-w-[92vw]">
    <div className={`flex items-start gap-3 rounded-xl border ${
      toast.type === 'success' ? 'border-green-200' : 'border-red-200'
    } bg-white shadow-xl px-4 py-3`}>
      <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full font-bold ${
        toast.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-600'
          : 'bg-red-50 border border-red-200 text-red-600'
      }`}>
        {toast.type === 'success' ? '✓' : '!'}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{toast.message}</p>
      </div>
      <button
        onClick={() => setToast(null)}
        className="ml-2 rounded-md px-2 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-50"
      >
        OK
      </button>
    </div>
  </div>
)}

{/* Delete Confirmation Modal — matches logout confirm style */}
{deleteConfirmOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      onClick={() => setDeleteConfirmOpen(false)}
    />
    <div className="relative w-[420px] max-w-[92vw] rounded-2xl bg-white shadow-2xl border border-gray-200 p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 border border-red-100 text-red-600 font-bold">
          !
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900">
            Delete Medication
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Are you sure? This will remove the medication and all its dose history permanently.
          </p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setDeleteConfirmOpen(false)}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 border border-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={confirmDelete}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

      {/* Edit Instructions Modal */}
      {editingMedication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setEditingMedication(null)}
          />
          
          {/* Modal */}
          <div className="relative w-[420px] max-w-[92vw] rounded-2xl bg-white shadow-2xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Edit Instructions
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {editingMedication.name} {editingMedication.dosage}
            </p>

            <label className="block text-xs font-medium text-gray-500 mb-1">
              Instructions
            </label>
            <textarea
              value={editInstructions}
              onChange={(e) => setEditInstructions(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              placeholder="e.g. Take with food"
            />

            <label className="block text-xs font-medium text-gray-500 mb-1 mt-4">
              End Date <span className="text-gray-400">(leave empty if ongoing)</span>
            </label>
            <input
             type="date"
             value={editEndDate}
             onChange={(e) => setEditEndDate(e.target.value)}
             className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            <p className="text-xs text-emerald-600 mt-2">
              ✅ Saving will mark instructions as verified and remove the warning badge.
            </p>
            
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setEditingMedication(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200"
                >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {editSaving ? 'Saving...' : 'Save & Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}