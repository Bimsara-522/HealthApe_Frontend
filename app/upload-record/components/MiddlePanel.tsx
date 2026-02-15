// app/upload-record/components/MiddlePanel.tsx
"use client";

import { useState } from "react";
import type { UploadedFile, UploadCategory, FormDataType } from "../type/type";
import { ALLOWED_TYPES, MAX_FILE_MB } from "@/lib/constants";
import { PaperClipIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

type Props = {
  uploadedFiles: UploadedFile[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const inferCategory = (file: File): UploadCategory => {
  const name = file.name.toLowerCase();
  if (name.includes("prescription")) return "Prescription";
  if (name.includes("lab")) return "Lab Result";
  if (name.includes("report")) return "Report";
  return "Other";
};

export default function MiddlePanel({
  uploadedFiles,
  setUploadedFiles,
  formData,
  setFormData,
  loading,
  setLoading,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    const accepted: File[] = [];

    fileArray.forEach((file) => {
      const tooBig = file.size > MAX_FILE_MB * 1024 * 1024;
      const typeOk = ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number]);

      if (!typeOk) newErrors.push(`Blocked: ${file.name} (type ${file.type || "unknown"} not allowed)`);
      else if (tooBig) newErrors.push(`Blocked: ${file.name} (exceeds ${MAX_FILE_MB} MB)`);
      else accepted.push(file);
    });

    if (newErrors.length) setErrors((prev) => [...prev, ...newErrors]);

    const newFiles: UploadedFile[] = accepted.map((file) => ({
      file,
      category: inferCategory(file),
      createdAt: Date.now(),
    }));

    if (newFiles.length) setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // temporary AI simulation
  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        symptoms: prev.symptoms || "Fever, Headache",
        diagnosis: prev.diagnosis || "Viral Infection",
        doctorName: prev.doctorName || "Dr. Silva",
        hospital: prev.hospital || "City Hospital",
      }));
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800">Upload Medical Files</h1>

      {/* Upload section */}
      <div className="bg-white shadow-md rounded-2xl p-6 border space-y-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
          }`}
        >
          <p className="text-gray-600 font-medium">Drag &amp; Drop medical files here</p>
          <p className="text-sm text-gray-400 mt-2">or click below to browse</p>

          <input
            type="file"
            multiple
            id="fileUpload"
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />

          <label
            htmlFor="fileUpload"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition"
          >
            <PaperClipIcon className="h-4 w-4" />
            Browse Files
          </label>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="visitDate" className="text-sm text-gray-600">
            Visit/Report Date
          </label>
          <input
            id="visitDate"
            name="date"
            type="date"
            value={formData.date ?? ""}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            <ul className="list-disc pl-5 space-y-1">
              {errors.map((e, i) => (
                <li key={`err-${i}`}>{e}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setErrors([])}
              className="mt-2 text-xs text-red-600 underline"
              aria-label="Clear errors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Auto fill form */}
      <div className="bg-white shadow-md rounded-2xl p-6 border space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Medical Record Details</h2>

        <input
          name="symptoms"
          value={formData.symptoms}
          onChange={handleChange}
          placeholder="Symptoms"
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          name="medications"
          value={formData.medications}
          onChange={handleChange}
          placeholder="Medications"
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          name="dosage"
          value={formData.dosage}
          onChange={handleChange}
          placeholder="Dosage"
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          name="frequency"
          value={formData.frequency}
          onChange={handleChange}
          placeholder="Frequency"
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          name="diagnosis"
          value={formData.diagnosis}
          onChange={handleChange}
          placeholder="Diagnosis"
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          name="doctorName"
          value={formData.doctorName}
          onChange={handleChange}
          placeholder="Doctor Name"
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          name="hospital"
          value={formData.hospital}
          onChange={handleChange}
          placeholder="Hospital / Clinic"
          className="w-full border rounded-lg px-3 py-2"
        />
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional Notes"
          className="w-full border rounded-lg px-3 py-2"
          rows={3}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-60"
          type="button"
        >
          <CheckCircleIcon className="h-5 w-5" />
          {loading ? "Processing with AI..." : "Submit for AI Processing"}
        </button>
      </div>
    </div>
  );
}