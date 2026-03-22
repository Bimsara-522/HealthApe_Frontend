//Medications Widget Component
//Shows today's active medications on the dashboard

'use client';

import React from 'react';
import Link from 'next/link';
import { Pill, Clock } from 'lucide-react';
import type { DashboardMedication } from '@/hooks/useMedications';

//Formats "08:00" → "8:00 AM"
function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

//Find the next upcoming time from a medication's times[]
function getNextTime(times: string[]): string | null {
  if (!times || times.length === 0) return null;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const sorted = [...times].sort();
  const next = sorted.find((t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m >= currentMinutes;
  });

  return next ?? sorted[0]; //wrap to first dose tomorrow if all passed
}

//Single medication row
function MedicationItem({ medication }: { medication: DashboardMedication }) {
  const nextTime = getNextTime(medication.times);

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      {/* Pill icon */}
      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
        <Pill className="w-4 h-4 text-purple-500" />
      </div>

      {/* Name + dose */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {medication.name}
          {medication.dosage && (
            <span className="text-gray-400 font-normal"> {medication.dosage}</span>
          )}
        </p>
        {medication.frequency && (
          <p className="text-xs text-gray-400">{medication.frequency}</p>
        )}
      </div>

      {/* Next time badge */}
      {nextTime && (
        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg flex-shrink-0">
          <Clock className="w-3 h-3" />
          {formatTime(nextTime)}
        </div>
      )}
    </div>
  );
}

//Skeleton row
function MedicationSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2.5 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  );
}

interface MedicationsWidgetProps {
  medications: DashboardMedication[];
  loading?: boolean;
}

export function MedicationsWidget({ medications, loading = false }: MedicationsWidgetProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">Medications</h3>
        {!loading && medications.length > 0 && (
          <span className="text-xs text-gray-400">{medications.length} active</span>
        )}
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <>
            <MedicationSkeleton />
            <MedicationSkeleton />
            <MedicationSkeleton />
          </>
        ) : medications.length > 0 ? (
          <>
            {medications.map((med) => (
              <MedicationItem key={med.id} medication={med} />
            ))}
            <Link
              href="/medications"
              className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium mt-3 pt-3 border-t border-gray-100"
            >
              View All Medications
            </Link>
          </>
        ) : (
          // Empty state
          <div className="text-center py-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
              <Pill className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">No active medications</p>
            <p className="text-xs text-gray-400 mb-3">
              Upload a prescription and medications will appear here automatically.
            </p>
            <Link
              href="/upload?category=Prescription"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Upload Prescription
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}