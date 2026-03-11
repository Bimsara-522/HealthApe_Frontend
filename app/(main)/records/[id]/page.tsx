//URL: /records/[id]
//Shows full details for a single medical record

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, Calendar, User, Building2,
  Tag, Trash2,
} from 'lucide-react';
import { EyeIcon } from '@heroicons/react/24/outline';
import { useMedicalRecord, useMedicalRecords } from '@/hooks/useMedicalRecords';
import { Button } from '@/components/UI/button';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Not recorded';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

//Detail Row

function DetailRow({
  icon: Icon, label, value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-blue-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

//Main Page

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { record, loading, error } = useMedicalRecord(id);
  const { deleteRecord } = useMedicalRecords();
  const [deleteMessage, setDeleteMessage] = useState<'success' | 'error' | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    const success = await deleteRecord(id);
    if (success) {
      setDeleteMessage('success');
      setTimeout(() => router.push('/records'), 2000);
    } else {
      setDeleteMessage('error');
      setTimeout(() => setDeleteMessage(null), 3000);
    }
    setConfirmDelete(false);
  };

  // Loading
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  // Error
  if (error || !record) {
    return (
      <div className="text-center py-16">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Record not found</h2>
        <p className="text-gray-500 mb-6">
          This record may have been deleted or you don&apos;t have access to it.
        </p>
        <Button variant="primary" onClick={() => router.push('/records')}>
          Back to Records
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

      {/* Delete message banner */}
      {deleteMessage === 'success' && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
          <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Record deleted successfully. Redirecting...
        </div>
      )}
      {deleteMessage === 'error' && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Failed to delete. Please try again.
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Records
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{record.title}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 uppercase">
                  {record.category}
                </span>
                {record.tags.map((tag) => (
                  <span key={tag} className="text-sm text-blue-600 font-medium">#{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {record.fileUrl && (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}${record.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                title="Open document"
              >
                <EyeIcon className="w-5 h-5" />
              </a>
            )}
            {confirmDelete ? (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          Confirm
        </button>
        <button
          onClick={() => setConfirmDelete(false)}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
        <Trash2 className="w-5 h-5" />
  </button>
)}
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Record Details</h2>
        <DetailRow icon={Calendar}  label="Record Date"       value={formatDate(record.date)} />
        <DetailRow icon={User}      label="Doctor"            value={record.doctorName} />
        <DetailRow icon={Building2} label="Hospital / Clinic" value={record.hospital} />
        <DetailRow icon={FileText}  label="File"
          value={record.fileName
            ? `${record.fileName} (${formatFileSize(record.fileSize)})`
            : null}
        />
        <DetailRow icon={Tag}       label="Uploaded"          value={formatDate(record.createdAt)} />

        {!record.date && !record.doctorName && !record.hospital && !record.fileName && (
          <p className="text-gray-400 text-sm text-center py-4">No additional details recorded.</p>
        )}
      </div>

      {/* Extracted Text Card */}
      {record.extractedText && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Extracted Text (OCR)</h2>
          <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 rounded-xl p-4">
            {record.extractedText}
          </pre>
        </div>
      )}

      {/* Extra Details Card */}
      {Object.keys(record.details).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div className="space-y-2">
            {Object.entries(record.details)
              .filter(([, val]) => val !== null && val !== '' && val !== undefined)
              .map(([key, val]) => (
                <div key={key} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400 uppercase tracking-wide w-36 flex-shrink-0 pt-0.5">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm text-gray-700">{String(val)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
}