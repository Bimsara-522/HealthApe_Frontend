// app/upload-record/page.tsx
"use client";

import { useState } from "react";
import LeftPanel from "./components/LeftPanel";
import MiddlePanel from "./components/MiddlePanel";
import RightPanel from "./components/RightPanel";
import type { UploadedFile, FormDataType } from "./type/type";

export default function UploadRecordPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    symptoms: "",
    medications: "",
    dosage: "",
    frequency: "",
    diagnosis: "",
    doctorName: "",
    notes: "",
    hospital: "",
    date: "",
  });

  const handleDelete = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Mobile top bar */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
          <div>
            <p className="text-sm font-semibold text-slate-900">HealthApe</p>
            <p className="text-xs text-slate-500">Upload Medical Files</p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Feature Page
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left Panel */}
          <aside className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="p-4 sm:p-6">
                <LeftPanel active="Upload Medical Files" />
              </div>
            </div>
          </aside>

          {/* Middle Panel */}
          <main className="lg:col-span-6">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="p-4 sm:p-6">
                <MiddlePanel
                  uploadedFiles={uploadedFiles}
                  setUploadedFiles={setUploadedFiles}
                  formData={formData}
                  setFormData={setFormData}
                  loading={loading}
                  setLoading={setLoading}
                  onDeleteFile={handleDelete}
                  isLoading={loading}
                />
              </div>
            </div>
          </main>

          {/* Right Panel */}
          <aside className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="p-4 sm:p-6">
                <RightPanel
                  uploadedFiles={uploadedFiles}
                  onDelete={handleDelete}
                  loading={loading}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
