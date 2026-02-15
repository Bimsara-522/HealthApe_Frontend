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
    <div className="grid grid-cols-12 min-h-screen bg-gray-100">
      <aside className="col-span-12 md:col-span-2 bg-white border-r">
        <LeftPanel active="Upload Medical Files" />
      </aside>

      <main className="col-span-12 md:col-span-6 p-8 space-y-6">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md">
          <h1 className="text-2xl font-semibold">Upload Medical Records</h1>
          <p className="text-blue-100 text-sm mt-1">
            Securely upload and manage your health documents
          </p>
        </div>

        <MiddlePanel
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          setLoading={setLoading}
        />
      </main>

      <aside className="col-span-12 md:col-span-4 bg-white border-l p-6">
        <RightPanel uploadedFiles={uploadedFiles} onDelete={handleDelete} />
      </aside>
    </div>
  );
}
