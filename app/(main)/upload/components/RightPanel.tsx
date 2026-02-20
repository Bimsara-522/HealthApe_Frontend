// app/upload-record/components/RightPanel.tsx
"use client";

import type { UploadedFile } from "../type/type";
import {
  DocumentTextIcon,
  PhotoIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

type Props = {
  uploadedFile: UploadedFile | null;
  onDelete?: () => void;
  loading?: boolean;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const formatDate = (ts: number) => {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusConfig = {
  queued: { label: "Queued", bg: "bg-slate-100", text: "text-slate-600", icon: null as any },
  validating: { label: "Validating...", bg: "bg-blue-100", text: "text-blue-700", icon: null as any },
  valid: { label: "Valid ✓", bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircleIcon },
  invalid: { label: "Invalid", bg: "bg-red-100", text: "text-red-700", icon: XCircleIcon },
  error: { label: "Error", bg: "bg-red-100", text: "text-red-700", icon: XCircleIcon },
};

const categoryColors: Record<string, string> = {
  Prescription: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  "Lab Report": "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  "Image/X-ray": "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",
  "Doctor Note": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  "Insurance Document": "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
};

export default function RightPanel({ uploadedFile, onDelete, loading }: Props) {
  const openPreview = (file: File) => {
    const url = URL.createObjectURL(file);
    const w = window.open(url, "_blank", "noopener,noreferrer");
    const cleanup = () => URL.revokeObjectURL(url);

    if (w) {
      const t = setInterval(() => {
        if (w.closed) {
          clearInterval(t);
          cleanup();
        }
      }, 500);
      setTimeout(() => {
        clearInterval(t);
        cleanup();
      }, 60_000);
    } else {
      setTimeout(cleanup, 10_000);
    }
  };

  const fileIcon = uploadedFile?.file.type.includes("image") ? PhotoIcon : DocumentTextIcon;
  const FileIcon = fileIcon;

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900">Document Preview</h2>
          {uploadedFile && (
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-100">
              1 file
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-400">View, preview, or remove your uploaded file.</p>
      </div>

      {/* Loading skeleton */}
      {loading && !uploadedFile && (
        <div className="animate-pulse space-y-3">
          <div className="h-10 w-full rounded-xl bg-slate-100" />
          <div className="h-36 w-full rounded-2xl bg-slate-100" />
        </div>
      )}

      {/* Empty state */}
      {!uploadedFile && !loading && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <ArrowUpTrayIcon className="h-7 w-7 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">No file uploaded yet</p>
            <p className="mt-0.5 text-xs text-slate-400">Upload a file in the middle panel</p>
          </div>
        </div>
      )}

      {/* File card */}
      {uploadedFile && (
        <div
          className={`rounded-2xl border-2 transition-all duration-300 ${
            uploadedFile.status === "valid"
              ? "border-emerald-200 bg-emerald-50/30"
              : uploadedFile.status === "invalid" || uploadedFile.status === "error"
              ? "border-red-200 bg-red-50/20"
              : uploadedFile.status === "validating"
              ? "border-blue-200 bg-blue-50/20"
              : "border-slate-200 bg-white"
          }`}
        >
          {/* File header */}
          <div className="flex items-start justify-between gap-3 p-4 pb-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <FileIcon className="h-5 w-5 text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900" title={uploadedFile.file.name}>
                  {uploadedFile.file.name}
                </p>
                <p className="text-[11px] text-slate-400">{formatSize(uploadedFile.file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onDelete}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              aria-label="Delete file"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Metadata */}
          <div className="border-t border-dashed border-slate-200 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                  categoryColors[uploadedFile.category] || "bg-slate-100 text-slate-600"
                }`}
              >
                {uploadedFile.category}
              </span>

              {(() => {
                const s = statusConfig[uploadedFile.status];
                const StatusIcon = s.icon;
                return (
                  <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${s.bg} ${s.text}`}>
                    {uploadedFile.status === "validating" && (
                      <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    )}
                    {StatusIcon && <StatusIcon className="h-3 w-3" />}
                    {s.label}
                  </span>
                );
              })()}
            </div>

            <p className="mt-2 text-[10px] text-slate-400">Added {formatDate(uploadedFile.createdAt)}</p>
          </div>

          {/* OCR text preview */}
          {uploadedFile.ocrText && (
            <div className="border-t border-dashed border-slate-200 px-4 py-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Extracted Text Preview</p>
              <div className="max-h-32 overflow-y-auto rounded-xl border border-slate-100 bg-white p-2.5 text-[11px] leading-relaxed text-slate-600">
                {uploadedFile.ocrText.slice(0, 400)}
                {uploadedFile.ocrText.length > 400 ? "…" : ""}
              </div>
            </div>
          )}

          {/* Validation error reason */}
          {uploadedFile.validationError && (
            <div className="border-t border-red-200 bg-red-50 px-4 py-3">
              <p className="text-[11px] font-semibold text-red-600">❌ {uploadedFile.validationError}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="border-t border-dashed border-slate-200 p-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openPreview(uploadedFile.file)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <EyeIcon className="h-4 w-4" />
                Preview
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
              >
                <TrashIcon className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation guide */}
      <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Validation Guide</p>
        </div>
        <ul className="space-y-2">
          {[
            { step: "1", text: "Choose your document type" },
            { step: "2", text: "Upload a single file (PDF, JPG, PNG)" },
            { step: "3", text: "Click Validate — AI checks authenticity" },
            { step: "4", text: "Review auto-filled fields" },
            { step: "5", text: "Save to your medical records" },
          ].map((item) => (
            <li key={item.step} className="flex items-start gap-2 text-xs text-slate-500">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-blue-700">
                {item.step}
              </span>
              {item.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Accepted formats */}
      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Accepted Formats</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["PDF", "JPG / JPEG", "PNG"].map((f) => (
            <span key={f} className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
              {f}
            </span>
          ))}
          <span className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-200">
            Max 8MB
          </span>
        </div>
      </div>
    </div>
  );
}