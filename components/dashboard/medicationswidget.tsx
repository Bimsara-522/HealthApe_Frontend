
//Medications Widget Component
//It shows today's medications with toggles to mark as taken/not taken

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

//Type definition
export interface Medication {
  id: string;
  name: string;       // "Amoxicillin"
  dosage: string;     // "500g"
  schedule: string;   // "Morning" or "Evening"
  taken: boolean;     // Has it been taken?
}


//Single medication item
interface MedicationItemProps {
  medication: Medication;
  onToggle: (id: string) => void;
}

function MedicationItem({ medication, onToggle }: MedicationItemProps) {
  return (
    <div className="flex items-center justify-between py-2">
      {/* Toggle Switch */}
      <button
        onClick={() => onToggle(medication.id)}
        className={cn(
          // Base toggle styles
          'relative inline-flex h-6 w-11 items-center rounded-full',
          'transition-colors duration-200 flex-shrink-0',
          // Color based on state
          medication.taken ? 'bg-green-500' : 'bg-gray-200'
        )}
        role="switch"
        aria-checked={medication.taken}
      >
        {/* Toggle dot (the circle that moves) */}
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm',
            'transition-transform duration-200',
            // Move dot left or right based on state
            medication.taken ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>

      {/* Medication Name and Dosage */}
      <div className="flex-1 ml-3">
        <span 
          className={cn(
            'text-sm font-medium',
            // Strike through if taken
            medication.taken ? 'text-gray-400 line-through' : 'text-gray-900'
          )}
        >
          {medication.name} ({medication.dosage})
        </span>
      </div>
    </div>
  );
}


//Medication widget container
interface MedicationsWidgetProps {
  medications: Medication[];
}

export function MedicationsWidget({ medications: initialMedications }: MedicationsWidgetProps) {
  //useState hook - allows component to "remember" state
  //When we call setMedications, the component re-renders with new data
  const [medications, setMedications] = useState(initialMedications);

  //Calculate how many medications haven't been taken yet
  const remaining = medications.filter(m => !m.taken).length;

  //Handle toggle click
  const handleToggle = (id: string) => {
    setMedications(prev => 
      prev.map(med => 
        med.id === id 
          ? { ...med, taken: !med.taken }  //Toggle this medication
          : med                            //Keep others unchanged
      )
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Medications</h3>
        <span className="text-sm text-gray-500">{remaining} Remaining</span>
      </div>

      {/* Medications List */}
      <div className="space-y-1">
        {medications.length > 0 ? (
          medications.map((medication) => (
            <MedicationItem
              key={medication.id}
              medication={medication}
              onToggle={handleToggle}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No medications scheduled
          </p>
        )}
      </div>

      {/* View All Link */}
      {medications.length > 0 && (
        <Link 
          href="/dashboard/medications"
          className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium mt-3 pt-3 border-t border-gray-100"
        >
          View All Medications
        </Link>
      )}
    </div>
  );
}
