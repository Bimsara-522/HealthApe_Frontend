// URL: /records
// Medical Records page — connected to real backend API
// Supports: search, category filter, sort, empty states, delete

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, ChevronDown, Plus, Activity, User,
  Pill, FileText, ArrowUpDown, Trash2, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/UI/button';
import { useMedicalRecords, MedicalRecord } from '@/hooks/useMedicalRecords';

//Constants

//These match the category values saved during upload
const CATEGORIES = ['Prescription', 'Lab Report', 'Image/X-ray', 'Doctor Note', 'Insurance Document'];

//Helpers

function getRecordIcon(category: string) {
  switch (category?.toUpperCase()) {
    case 'LAB REPORT': return Activity;
    case 'IMAGING':    return User;
    case 'REFERRAL':   return FileText;
    case 'PRESCRIPTION': return Pill;
    default:           return FileText;
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No date';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

//Search Bar

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search records by name, doctor, or tag..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full pl-12 pr-4 py-3',
          'bg-white border border-gray-200 rounded-xl',
          'text-gray-900 placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'transition-all duration-200',
        )}
      />
    </div>
  );
}

//Filter Dropdown

function FilterDropdown({
  isOpen, onToggle, selectedFilter, onSelectFilter,
}: {
  isOpen: boolean;
  onToggle: () => void;
  selectedFilter: string | null;
  onSelectFilter: (filter: string | null) => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-2 px-6 py-3',
          'bg-white border border-gray-200 rounded-xl',
          'text-gray-700 font-medium hover:bg-gray-50 transition-colors',
          'min-w-[120px] justify-center',
          selectedFilter && 'border-blue-400 text-blue-600',
        )}
      >
        <span>{selectedFilter ?? 'Filter'}</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
          <button
            onClick={() => { onSelectFilter(null); onToggle(); }}
            className={cn(
              'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors',
              selectedFilter === null && 'text-blue-600 font-medium bg-blue-50',
            )}
          >
            All Records
          </button>
          {CATEGORIES.map((option) => (
            <button
              key={option}
              onClick={() => { onSelectFilter(option); onToggle(); }}
              className={cn(
                'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors',
                selectedFilter === option && 'text-blue-600 font-medium bg-blue-50',
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

//Sort Dropdown

function SortDropdown({
  sortBy, sortOrder, onChange,
}: {
  sortBy: string;
  sortOrder: string;
  onChange: (sortBy: 'date' | 'createdAt', sortOrder: 'asc' | 'desc') => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { label: 'Newest first',  sortBy: 'createdAt' as const, sortOrder: 'desc' as const },
    { label: 'Oldest first',  sortBy: 'createdAt' as const, sortOrder: 'asc' as const  },
    { label: 'Date (newest)', sortBy: 'date' as const,      sortOrder: 'desc' as const },
    { label: 'Date (oldest)', sortBy: 'date' as const,      sortOrder: 'asc' as const  },
  ];

  const currentLabel = options.find(
    (o) => o.sortBy === sortBy && o.sortOrder === sortOrder
  )?.label ?? 'Sort';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-3',
          'bg-white border border-gray-200 rounded-xl',
          'text-gray-700 font-medium hover:bg-gray-50 transition-colors',
        )}
      >
        <ArrowUpDown className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => { onChange(opt.sortBy, opt.sortOrder); setIsOpen(false); }}
              className={cn(
                'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors',
                opt.sortBy === sortBy && opt.sortOrder === sortOrder && 'text-blue-600 font-medium bg-blue-50',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

//Record Card
function RecordCard({
  record, isFirst, onViewDetails, onDelete,
}: {
  record: MedicalRecord;
  isFirst: boolean;
  onViewDetails: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const IconComponent = getRecordIcon(record.category);

  return (
    <div className={cn(
      'bg-white rounded-2xl border p-5',
      'flex items-center gap-4',
      'transition-all duration-200 hover:shadow-md group',
      isFirst
        ? 'border-l-4 border-l-blue-500 border-t-gray-100 border-r-gray-100 border-b-gray-100'
        : 'border-gray-100',
    )}>
      {/* Icon */}
      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
        <IconComponent className="w-6 h-6 text-blue-500" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{record.title}</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          {formatDate(record.date)}
          {record.doctorName && ` | ${record.doctorName}`}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {/* Category badge */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 uppercase">
            {record.category}
          </span>
          {/* Tags */}
          {record.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-sm text-blue-600 font-medium">#{tag}</span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className={cn(
        'flex-shrink-0 flex items-center gap-2',
        isFirst ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        'transition-opacity duration-200',
      )}>
        <button
          onClick={() => onViewDetails(record.id)}
          className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          View Details
        </button>

        {/* Delete button */}
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(record.id)}
              className="px-3 py-2 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

//Empty States

function NoRecordsYet({ onAddRecord }: { onAddRecord: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <FileText className="w-10 h-10 text-blue-300" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No medical records yet</h3>
      <p className="text-gray-500 max-w-sm mx-auto mb-6">
        Upload your first medical document, prescriptions, lab results, scans and we&apos;ll
        organise everything for you automatically.
      </p>
      <Button variant="primary" onClick={onAddRecord} className="inline-flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Upload your first record
      </Button>
    </div>
  );
}

function NoSearchResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
      <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No records found</h3>
      <p className="text-gray-500 mb-4">Try adjusting your search or filter</p>
      <button onClick={onClear} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
        Clear filters
      </button>
    </div>
  );
}

//Main Page
export default function MedicalRecordsPage() {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    records, loading, error, deleteRecord, refetch,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
  } = useMedicalRecords();

  const handleAddRecord = () => router.push('/upload');
  const handleViewDetails = (id: string) => router.push(`/records/${id}`);

  const handleDelete = async (id: string) => {
    const success = await deleteRecord(id);
    if (!success) alert('Failed to delete. Please try again.');
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter(null);
  };

  const hasActiveFilters = search.length > 0 || categoryFilter !== null;

  //Loading
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Toolbar skeleton */}
        <div className="flex gap-4">
          <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
          <div className="w-28 h-12 bg-gray-200 rounded-xl animate-pulse" />
          <div className="w-32 h-12 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        {/* Card skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  // Error 
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-500 mb-4">{error}</p>
        <Button variant="primary" onClick={refetch}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar value={search} onChange={setSearch} />
        <SortDropdown
          sortBy={sortBy}
          sortOrder={sortOrder}
          onChange={(sb, so) => { setSortBy(sb); setSortOrder(so); }}
        />
        <FilterDropdown
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
          selectedFilter={categoryFilter}
          onSelectFilter={setCategoryFilter}
        />
        <Button
          variant="primary"
          onClick={handleAddRecord}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>Add Record</span>
        </Button>
      </div>

      {/* Active filter chip*/}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Filtering by:</span>
          {search && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              &quot;{search}&quot;
            </span>
          )}
          {categoryFilter && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              {categoryFilter}
            </span>
          )}
          <button onClick={clearFilters} className="text-gray-400 hover:text-gray-600 ml-1">
            Clear ×
          </button>
        </div>
      )}

      {/* Record Count */}
      {records.length > 0 && (
        <p className="text-sm text-gray-500">
          {records.length} record{records.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/*  Records List*/}
      <div className="space-y-4">
        {records.length === 0 ? (
          hasActiveFilters ? (
            <NoSearchResults onClear={clearFilters} />
          ) : (
            <NoRecordsYet onAddRecord={handleAddRecord} />
          )
        ) : (
          records.map((record, index) => (
            <RecordCard
              key={record.id}
              record={record}
              isFirst={index === 0}
              onViewDetails={handleViewDetails}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}