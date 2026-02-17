"use client";

import { useMemo } from "react";
import type { UploadedFile, UploadCategory } from "../type/type";
import {
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  PhotoIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

type Props = {
  uploadedFiles: UploadedFile[];
  onDelete?: (id: string) => void;
  loading?: boolean;
};

const categories: UploadCategory[] = [
  "Prescription",
  "Lab Result",
  "Report",
  "Other",
];

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;

  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const getFileIcon = (file: File) => {
  const type = file.type.toLowerCase();

  if (type.includes("pdf")) return DocumentTextIcon;
  if (type.includes("image")) return PhotoIcon;

  return ClipboardDocumentListIcon;
};

export default function RightPanel({
  uploadedFiles,
  onDelete,
  loading,
}: Props) {
  const grouped = useMemo(() => {
    const map: Record<UploadCategory, UploadedFile[]> = {
      Prescription: [],
      "Lab Result": [],
      Report: [],
      Other: [],
    };

    uploadedFiles.forEach((f) => map[f.category].push(f));
    return map;
  }, [uploadedFiles]);

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

  const totalCount = uploadedFiles.length;

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Uploaded files
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Preview, review, or remove files before submitting.
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
          {totalCount} file{totalCount === 1 ? "" : "s"}
        </span>
      </div>

      {loading && (
        <div className="mt-4 space-y-3">
          <div className="h-10 w-full rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-20 w-full rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-20 w-full rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-20 w-full rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      )}

      {!loading && (
        <>
          {/* Empty state */}
          {uploadedFiles.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                <DocumentTextIcon className="h-6 w-6 text-slate-600" />
              </div>

              <p className="mt-3 text-sm font-medium text-slate-800">
                No files uploaded yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Add files in the upload area to see them here.
              </p>
            </div>
          )}

          {/* List */}
          <div className="space-y-5">
            {categories.map((category) => {
              const files = grouped[category];
              if (!files.length) return null;

              return (
                <section
                  key={category}
                  className="rounded-2xl border border-slate-200 bg-white"
                >
                  {/* Category header */}
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-blue-700">
                        {category}
                      </p>

                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                        {files.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 p-3">
                    {files.map((item) => {
                      const Icon = getFileIcon(item.file);

                      return (
                        <div
                          key={item.id}
                          className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                        >
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                              <Icon className="h-5 w-5 text-slate-700" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {item.file.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatSize(item.file.size)}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              aria-label="Preview file"
                              onClick={() => openPreview(item.file)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <EyeIcon className="h-4 w-4" />
                              Preview
                            </button>

                            <button
                              type="button"
                              aria-label="Delete file"
                              onClick={() => onDelete?.(item.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                            >
                              <TrashIcon className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
