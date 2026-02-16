
//URL: /dashboard/records

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import{Search} from 'lucide-react';
import { cn } from '@/lib/utils';

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


// SEARCH BAR COMPONENT
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative flex-1">
      {/* Search Icon - positioned inside the input */}
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      
      {/* Input Field */}
      <input
        type="text"
        placeholder="Search records by name, doctor, or tag..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        
        className={cn(
          'w-full pl-12 pr-4 py-3',           // Padding (left extra for icon)
          'bg-white border border-gray-200',   // Background and border
          'rounded-xl',                        // Rounded corners
          'text-gray-900 placeholder-gray-400', // Text colors
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'transition-all duration-200'
        )}
      />
    </div>
  );
}

//Main page component
export default function MedicalRecordsPage() {
  //state
  const [searchQuery, setSearchQuery] = useState('');

  //filtered records based on search query
  const filteredRecords = sampleRecords.filter((record) => {
    //If no search query show all records
    if (searchQuery === '') return true;
    
    //Convert search to lowercase for case-insensitive search
    const query = searchQuery.toLowerCase();
    
    //Check if query matches title, doctor name, or any tag
    return (
      record.title.toLowerCase().includes(query) ||
      record.doctorName.toLowerCase().includes(query) ||
      record.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });


  return (
    <div className="space-y-6 animate-fade-in">

      {/* Top Bar: Search + Filter + Add Button */}  
        {/*Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery} 
        />
        
        {/* Filter and Add Button */}
      </div>
        
      {/*Record Cards*/}
      
      {/*Checking the page works */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Medical Records Page</h2>
      </div>
    </div>
  );
}