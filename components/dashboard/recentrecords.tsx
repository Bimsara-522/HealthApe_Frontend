//RecentRecords Component
//It shows a list of recently uploaded medical records

import React from 'react';
import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/UI/badge';
import type { MedicalRecord } from '@/hooks/useMedicalRecords';

export type { MedicalRecord };

function formatRecordDate(dateStr: string | null, createdAt: string): string {
  const ref = dateStr ?? createdAt;
  if (!ref) return '—';
  const d = new Date(ref);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function RecordItem({ record }: { record: MedicalRecord }) {
  return (
    <Link
      href={`/records/${record.id}`}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors group"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
        <FileText className="w-6 h-6 text-blue-500" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{record.title}</h4>
        <p className="text-sm text-gray-500">
          {formatRecordDate(record.date, record.createdAt)} | {record.category}
        </p>
      </div>

      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        {record.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="default">#{tag}</Badge>
        ))}
      </div>

      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
    </Link>
  );
}

function RecordSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-3/5" />
        <div className="h-3 bg-gray-100 rounded w-2/5" />
      </div>
    </div>
  );
}

interface RecentRecordsProps {
  records: MedicalRecord[];
  loading?: boolean;
}

export function RecentRecords({ records, loading = false }: RecentRecordsProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Recent Medical Records</h3>
        <Link href="/records" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </Link>
      </div>

      <div className="divide-y divide-gray-50">
        {loading ? (
          <>
            <RecordSkeleton />
            <RecordSkeleton />
            <RecordSkeleton />
          </>
        ) : records.length > 0 ? (
          records.map((record) => (
            <RecordItem key={record.id} record={record} />
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">No records yet</h4>
            <p className="text-sm text-gray-400 mb-4 max-w-xs mx-auto">
              Upload your first medical document. Lab results, prescriptions, or scan reports and they&apos;ll appear here.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Upload a record
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}