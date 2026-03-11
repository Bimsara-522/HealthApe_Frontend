// app/upload-record/components/RightPanel.tsx
"use client";

import type { UploadedFile } from "../type/type";
import type { ElementType } from "react";

import {
  DocumentTextIcon,
  PhotoIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  ArrowUpTrayIcon,
  InformationCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

type Props = {
  uploadedFile: UploadedFile | null;
  onDelete?: () => void;
  loading?: boolean;
};

// ===============================
// utils
// ===============================
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

// ===============================
// types
// ===============================
type UploadStatus = NonNullable<UploadedFile["status"]>;

type StatusEntry = {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon?: ElementType;
};

const statusConfig: Record<UploadStatus, StatusEntry> = {
  queued: {
    label: "Queued",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  },
  validating: {
    label: "Validating...",
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  valid: {
    label: "Valid ✓",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircleIcon,
  },
  invalid: {
    label: "Invalid",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircleIcon,
  },
  error: {
    label: "Error",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircleIcon,
  },
};

const categoryColors: Record<string, string> = {
  Prescription: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  "Lab Report": "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  "Image/X-ray": "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",
  "Doctor Note": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  "Insurance Document": "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
};

export default function RightPanel({ uploadedFile, onDelete, loading }: Props) {
  const handleDelete = onDelete ?? (() => {});

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

  const isImage = uploadedFile?.file?.type?.startsWith("image/");
  const FileIcon = isImage ? PhotoIcon : DocumentTextIcon;

  const status: UploadStatus = uploadedFile?.status ?? "queued";
  const s = statusConfig[status];

  return (
    <div className="space-y-4">
      {/* ===============================
          UPDATED: header card
      =============================== */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100">
                <SparklesIcon className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Document Preview</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Review upload status, preview file, and remove if needed.
                </p>
              </div>
            </div>
          </div>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
            {uploadedFile ? "1 file selected" : "No file"}
          </span>
        </div>
      </div>

      {/* ===============================
          loading skeleton
      =============================== */}
      {loading && !uploadedFile && (
        <div className="animate-pulse space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
          <div className="h-10 w-full rounded-2xl bg-slate-100" />
          <div className="h-40 w-full rounded-3xl bg-slate-100" />
          <div className="h-20 w-full rounded-2xl bg-slate-100" />
        </div>
      )}

      {/* ===============================
          UPDATED: empty state
      =============================== */}
      {!uploadedFile && !loading && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
            <ArrowUpTrayIcon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-700">No file uploaded yet</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Choose a document type and upload your file from the middle panel.
          </p>

          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-slate-200">PDF</span>
            <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-slate-200">JPG</span>
            <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-slate-200">PNG</span>
            <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-slate-200">Max 8MB</span>
          </div>
        </div>
      )}

      {/* ===============================
          UPDATED: main file card
      =============================== */}
      {uploadedFile && (
        <div
          className={`overflow-hidden rounded-3xl border bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition-all duration-300 ${
            status === "valid"
              ? "border-emerald-200"
              : status === "invalid" || status === "error"
              ? "border-red-200"
              : status === "validating"
              ? "border-blue-200"
              : "border-slate-200"
          }`}
        >
          {/* top accent */}
          <div
            className={`h-1.5 w-full ${
              status === "valid"
                ? "bg-emerald-500"
                : status === "invalid" || status === "error"
                ? "bg-red-500"
                : status === "validating"
                ? "bg-blue-500"
                : "bg-slate-200"
            }`}
          />

          {/* file header */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    isImage ? "bg-cyan-50" : "bg-slate-100"
                  }`}
                >
                  <FileIcon className={`h-6 w-6 ${isImage ? "text-cyan-700" : "text-slate-600"}`} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900" title={uploadedFile.file.name}>
                    {uploadedFile.file.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {formatSize(uploadedFile.file.size)} • Added {formatDate(uploadedFile.createdAt)}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        categoryColors[uploadedFile.category] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {uploadedFile.category}
                    </span>

                    <span
                      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${s.bg} ${s.text} ${s.border}`}
                    >
                      {status === "validating" && (
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      )}
                      {s.icon && <s.icon className="h-3.5 w-3.5" />}
                      {s.label}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDelete}
                disabled={!onDelete || loading}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                aria-label="Delete file"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* status summary */}
          <div className="border-t border-dashed border-slate-200 bg-slate-50/70 px-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">File Type</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">{uploadedFile.file.type || "Unknown"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Status</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">{s.label}</p>
              </div>
            </div>
          </div>

          {/* OCR preview */}
          {uploadedFile.ocrText && (
            <div className="border-t border-dashed border-slate-200 px-4 py-4">
              <div className="mb-2 flex items-center gap-2">
                <InformationCircleIcon className="h-4 w-4 text-slate-400" />
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Extracted Text Preview
                </p>
              </div>

              <div className="max-h-36 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
                {uploadedFile.ocrText.slice(0, 500)}
                {uploadedFile.ocrText.length > 500 ? "…" : ""}
              </div>
            </div>
          )}

          {/* validation error */}
          {uploadedFile.validationError && (
            <div className="border-t border-red-200 bg-red-50 px-4 py-3">
              <p className="text-[11px] font-semibold text-red-700">❌ {uploadedFile.validationError}</p>
            </div>
          )}

          {/* actions */}
          <div className="border-t border-dashed border-slate-200 p-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openPreview(uploadedFile.file)}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
              >
                <EyeIcon className="h-4 w-4" />
                Preview
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={!onDelete || loading}
                className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-100 disabled:opacity-40"
              >
                <TrashIcon className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===============================
          UPDATED: validation guide
      =============================== */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Validation Guide</p>
        </div>

        <ul className="space-y-2.5">
          {[
            { step: "1", text: "Choose the correct medical document type" },
            { step: "2", text: "Upload one PDF, JPG, or PNG file" },
            { step: "3", text: "Run AI validation to check the document" },
            { step: "4", text: "Review the auto-filled fields carefully" },
            { step: "5", text: "Save the verified record to your system" },
          ].map((item) => (
            <li key={item.step} className="flex items-start gap-2.5 text-xs text-slate-500">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                {item.step}
              </span>
              <span className="leading-relaxed">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* accepted formats */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Accepted Formats</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["PDF", "JPG / JPEG", "PNG", "Max 8MB"].map((f) => (
            <span
              key={f}
              className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}