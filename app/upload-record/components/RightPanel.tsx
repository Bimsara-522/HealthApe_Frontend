// app/upload-record/components/RightPanel.tsx
"use client";

import { useMemo } from "react";
import type { UploadedFile, UploadCategory } from "../type/type";
import { TrashIcon, EyeIcon } from "@heroicons/react/24/outline";

type Props = {
  uploadedFiles: UploadedFile[];
  onDelete?: (index: number, category: UploadCategory) => void;
};

const categories: UploadCategory[] = ["Prescription", "Lab Result", "Report", "Other"];

export default function RightPanel({ uploadedFiles, onDelete }: Props) {
  const grouped = useMemo(() => {
    const map: Record<UploadCategory, UploadedFile[]> = {
      "Prescription": [],
      "Lab Result": [],
      "Report": [],
      "Other": [],
    };
    uploadedFiles.forEach((f) => map[f.category].push(f));
    return map;
  }, [uploadedFiles]);

  const openPreview = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const formatKB = (bytes: number) => (bytes / 1024).toFixed(1) + " KB";

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 border h-full overflow-y-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Uploaded File Previews</h2>

      {uploadedFiles.length === 0 && (
        <p className="text-gray-400 text-sm">No files uploaded yet.</p>
      )}

      {categories.map((category) => {
        const files = grouped[category];
        if (!files.length) return null;

        return (
          <section key={category} className="mb-6">
            {/* Category heading with count badge */}
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-blue-600">{category}</h3>
              <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                {files.length}
              </span>
            </div>

            <div className="space-y-3">
              {files.map((item, i) => (
                <div
                  key={`${category}-${i}-${item.file.name}`}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {item.file.name}
                    </p>
                    <p className="text-xs text-gray-400">{formatKB(item.file.size)}</p>
                  </div>

                  {/* Preview + Delete actions with icons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openPreview(item.file)}
                      className="inline-flex items-center gap-1 text-blue-600 text-xs font-medium hover:underline"
                      type="button"
                      aria-label="Preview file"
                    >
                      <EyeIcon className="h-4 w-4" />
                      Preview
                    </button>

                    <button
                      onClick={() => onDelete?.(i, category)}
                      className="inline-flex items-center gap-1 text-red-600 text-xs font-medium hover:underline"
                      type="button"
                      aria-label="Delete file"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}