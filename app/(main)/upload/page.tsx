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
  // shared
  doctorName: "",
  hospital: "",
  date: "",

  // doctor note
  symptoms: "",
  diagnosis: "",
  notes: "",

  // prescription
  medications: "",
  dosage: "",
  frequency: "",

  // lab
  testName: "",
  results: "",

  // imaging
  imagingType: "",
  bodyPart: "",
  findings: "",

  // insurance
  provider: "",
  policyNumber: "",
  claimNumber: "",
  coverageDetails: "",
});

  const handleDelete = () => setUploadedFile(null);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title (match dashboard style exactly) */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-gray-900">
            Upload Medical Files
          </h1>
          <p className="text-sm text-gray-500">
            Upload, validate with AI, and securely store your medical records.
          </p>
        </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Middle Panel (2 cols like RecentRecords area) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
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
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-6">
            <div className="p-5">
              <RightPanel uploadedFile={uploadedFile} onDelete={handleDelete} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}