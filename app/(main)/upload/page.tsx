// app/upload-record/page.tsx
"use client";

import { useState } from "react";
import MiddlePanel from "./components/MiddlePanel";
import RightPanel from "./components/RightPanel";
import type { UploadedFile, FormDataType, UploadCategory } from "./type/type";

export default function UploadRecordPage() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<UploadCategory | null>(null);

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

  const handleDelete = () => {
    setUploadedFile(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Mobile top bar */}
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/80 bg-white/70 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
              <span className="text-xs font-bold text-white">H</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">HealthApe</p>
              <p className="text-xs text-slate-400">Upload Medical Files</p>
            </div>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
            EMR
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

          {/* Middle Panel */}
          <main className="lg:col-span-6">
            <div className="rounded-2xl border border-white bg-white shadow-sm">
              <div className="p-5 sm:p-6">
                <MiddlePanel
                  uploadedFile={uploadedFile}
                  setUploadedFile={setUploadedFile}
                  formData={formData}
                  setFormData={setFormData}
                  loading={loading}
                  setLoading={setLoading}
                  onDeleteFile={handleDelete}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              </div>
            </div>
          </main>

          {/* Right Panel */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6 rounded-2xl border border-white bg-white shadow-sm">
              <div className="p-5">
                <RightPanel uploadedFile={uploadedFile} onDelete={handleDelete} loading={loading} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}