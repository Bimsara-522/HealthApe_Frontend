
//URL: /dashboard/records

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, Plus, Activity, User, Pill, FileText  } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/UI/button';


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

//Helper function to get icon based on record type

function getRecordIcon(type: MedicalRecord['type']) {

  
  switch (type) {
    case 'LAB REPORT':
      return Activity;
    case 'IMAGING':
      return User;
    case 'REFERRAL':
      return FileText;
    case 'PRESCRIPTION':
      return Pill;
    default:
      return FileText;
  }
}


//Search bar component
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



//Filter dropdown component
interface FilterDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedFilter: string | null;
  onSelectFilter: (filter: string | null) => void;
}

function FilterDropdown({ 
  isOpen, 
  onToggle, 
  selectedFilter, 
  onSelectFilter 
}: FilterDropdownProps) {
  // Filter options matching your design
  const filterOptions = ['LAB REPORT', 'IMAGING', 'REFERRAL', 'PRESCRIPTION'];

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-2 px-6 py-3',
          'bg-white border border-gray-200 rounded-xl',
          'text-gray-700 font-medium',
          'hover:bg-gray-50 transition-colors',
          'min-w-[120px] justify-center'
        )}
      >
        <span>Filter</span>
        <ChevronDown 
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'  // Rotate arrow when open
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
          
          {/* "All Records" option */}
          <button
            onClick={() => {
              onSelectFilter(null);  // null = no filter
              onToggle();            // Close dropdown
            }}
            className={cn(
              'w-full px-4 py-2 text-left text-sm',
              'hover:bg-gray-50 transition-colors',
              selectedFilter === null && 'text-blue-600 font-medium bg-blue-50'
            )}
          >
            All Records
          </button>
          
          {/* Filter options */}
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelectFilter(option);
                onToggle();
              }}
              className={cn(
                'w-full px-4 py-2 text-left text-sm',
                'hover:bg-gray-50 transition-colors',
                selectedFilter === option && 'text-blue-600 font-medium bg-blue-50'
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

//Add record button component
interface AddRecordButtonProps {
  onClick: () => void;
}

function AddRecordButton({ onClick }: AddRecordButtonProps) {
  return (
    <Button 
      variant="primary" 
      onClick={onClick}
      className="flex items-center gap-2 whitespace-nowrap"
    >
      <Plus className="w-5 h-5" />
      <span>Add Record</span>
    </Button>
  );
}

//Record card component

interface RecordCardProps {
  record: MedicalRecord;
  isFirst: boolean;
  onViewDetails: (id: string) => void;
}

function RecordCard({ record, isFirst, onViewDetails }: RecordCardProps) {
  // Get the icon component based on record type
  const IconComponent = getRecordIcon(record.type);
  
  return (
    <div 
      className={cn(
        // Base styles
        'bg-white rounded-2xl border p-5',
        'flex items-center gap-4',
        'transition-all duration-200',
        'hover:shadow-md',
        'group',
        isFirst 
          ? 'border-l-4 border-l-blue-500 border-t-gray-100 border-r-gray-100 border-b-gray-100' 
          : 'border-gray-100'
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
        <IconComponent className="w-6 h-6 text-blue-500" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3 className="font-semibold text-gray-900">{record.title}</h3>
        
        {/* Date and Doctor */}
        <p className="text-sm text-gray-500 mt-0.5">
          {record.date} | {record.doctorName}
        </p>
        
        {/* Type Badge + Tags */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {/* Type Badge */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 uppercase">
            {record.type}
          </span>
          
          {/* Tags */}
          {record.tags.map((tag) => (
            <span key={tag} className="text-sm text-blue-600 font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* View Details Button - Always visible on first, hover on others */}
      <button
        onClick={() => onViewDetails(record.id)}
        className={cn(
          'flex-shrink-0 px-4 py-2 text-sm font-medium',
          'text-blue-600 border border-blue-600 rounded-lg',
          'hover:bg-blue-50 transition-all duration-200',
          //Show always on first card, show on hover for others
          isFirst 
            ? 'opacity-100' 
            : 'opacity-0 group-hover:opacity-100'
        )}
      >
        View Details
      </button>
    </div>
  );
}


//Main page component
export default function MedicalRecordsPage() {
  //state
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const router = useRouter();

  //Handler
  //Navigate to upload page
  const handleAddRecord = () => {
    router.push('/dashboard/upload');
  };

  //Navigate to record details page
  const handleViewDetails = (recordId: string) => {
    router.push(`/dashboard/records/${recordId}`);
  };

  //filtered records based on search query
   const filteredRecords = sampleRecords.filter((record) => {
    // Check search query
    const matchesSearch = 
      searchQuery === '' ||
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    //Check type filter
    const matchesFilter = 
      selectedFilter === null || 
      record.type === selectedFilter;
    
    //Must match BOTH search AND filter
    return matchesSearch && matchesFilter;
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
        
        {/* Filter dropdown*/}
        <FilterDropdown
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
        />
        {/* Add Record Button */}
        <AddRecordButton onClick={handleAddRecord} />
      </div>
        
      {/*Record Cards*/}
      <div className="space-y-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record, index) => (
            <RecordCard
              key={record.id}
              record={record}
              isFirst={index === 0}
              onViewDetails={handleViewDetails}
            />
          ))
        ) : (
          //Empty state when no records match
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No records found
            </h3>
            <p className="text-gray-500">
              {searchQuery || selectedFilter
                ? 'Try adjusting your search or filter'
                : 'Upload your first medical record to get started'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}