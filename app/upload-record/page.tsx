// app/upload-record/page.tsx
"use client";

import { useState } from "react";
import LeftPanel from "./components/LeftPanel";
import MiddlePanel from "./components/MiddlePanel";
import RightPanel from "./components/RightPanel";
import type { UploadedFile, FormDataType, UploadCategory } from "./type/type";

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

  const handleDelete = (index: number, category: UploadCategory) => {
    setUploadedFiles((prev) => {
      let seen = -1;
      return prev.filter((f) => {
        if (f.category !== category) return true;
        seen += 1;
        return seen !== index;
      });
    });
  };

  return (
    <div className="grid grid-cols-12 min-h-screen bg-gray-100">
      <aside className="col-span-12 md:col-span-2 bg-white border-r">
        <LeftPanel active="Upload Medical Files" />
      </aside>

      <main className="col-span-12 md:col-span-6 p-8">
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