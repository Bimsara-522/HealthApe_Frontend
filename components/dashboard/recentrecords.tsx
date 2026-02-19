
//RecentRecords Component
//It shows a list of recently uploaded medical records

import React from 'react';
import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/UI/badge';

//Type definition
export interface MedicalRecord {
  id: string;
  title: string;      // "Blood Test Report"
  date: string;       // "Today" or "Oct 24, 2025"
  time?: string;      // "10:23 AM" (optional)
  type: string;       // "Lab Report", "Prescription", "Scan"
  tags: string[];     // ["Blood", "Routine"]
}


//Single record item
interface RecordItemProps {
  record: MedicalRecord;
}

function RecordItem({ record }: RecordItemProps) {
  return (
    <Link 
      href={`/dashboard/records/${record.id}`}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors group"
    >
      {/* Document Icon */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
        <FileText className="w-6 h-6 text-blue-500" />
      </div>

      {/* Record Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{record.title}</h4>
        <p className="text-sm text-gray-500">
          {record.date}
          {record.time && `, ${record.time}`} | {record.type}
        </p>
      </div>

      {/* Tags - Hidden on small screens */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        {record.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="default">
            #{tag}
          </Badge>
        ))}
      </div>

      {/* Arrow icon - shows on hover */}
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
    </Link>
  );
}


//RecentRecords container
interface RecentRecordsProps {
  records: MedicalRecord[];
}

export function RecentRecords({ records }: RecentRecordsProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Recent Medical Records</h3>
        <Link 
          href="/dashboard/records"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </Link>
      </div>

      {/* Records List */}
      <div className="divide-y divide-gray-50">
        {records.length > 0 ? (
          records.map((record) => (
            <RecordItem key={record.id} record={record} />
          ))
        ) : (
          // Empty state
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No medical records yet</p>
            <Link 
              href="/dashboard/upload"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
            >
              Upload your first record
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
