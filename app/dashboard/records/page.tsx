
//URL: /dashboard/records

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

//type definitions

interface MedicalRecord {
  id: string;
  title: string;
  date: string;
  doctorName: string;
  type: 'LAB REPORT' | 'IMAGING' | 'REFERRAL' | 'PRESCRIPTION';
  tags: string[];
}


//sample data

const sampleRecords: MedicalRecord[] = [
  {
    id: '1',
    title: 'Annual Physical Results',
    date: '2025-11-10',
    doctorName: 'Dr. Emily Chen',
    type: 'LAB REPORT',
    tags: ['Routine', 'BloodWork'],
  },
  {
    id: '2',
    title: 'Chest X-Ray',
    date: '2025-10-24',
    doctorName: 'Dr. Sarah Corner',
    type: 'IMAGING',
    tags: ['Cardiology', 'Chest'],
  },
  {
    id: '3',
    title: 'Dermatology Referral',
    date: '2025-09-15',
    doctorName: 'Dr. Smith',
    type: 'REFERRAL',
    tags: ['Skin', 'Referral'],
  },
  {
    id: '4',
    title: 'Prescription: Antibiotics',
    date: '2025-08-02',
    doctorName: 'Dr. Alan Grant',
    type: 'PRESCRIPTION',
    tags: ['Infection', 'Meds'],
  },
];


//Msin page component


export default function MedicalRecordsPage() {
  // We'll add state and components here step by step
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/*Search Bar */}
      
      {/*Filter*/}
      
      {/*Add Record Button*/}
      
      {/*Record Cards*/}
      
      {/*Checking the page works */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Medical Records Page</h2>
      </div>
    </div>
  );
}