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
  onDeleteFile?: (id: string) => void;
  isLoading: boolean;
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
  onDeleteFile,
  isLoading,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    const accepted: File[] = [];

    fileArray.forEach((file) => {
      const tooBig = file.size > MAX_FILE_MB * 1024 * 1024;
      const typeOk = ALLOWED_TYPES.includes(
        file.type as (typeof ALLOWED_TYPES)[number]
      );

      if (!typeOk) {
        newErrors.push(
          `Blocked: ${file.name} (type ${file.type || "unknown"} not allowed)`
        );
      } else if (tooBig) {
        newErrors.push(`Blocked: ${file.name} (exceeds ${MAX_FILE_MB} MB)`);
      } else {
        accepted.push(file);
      }
    });

    if (newErrors.length) {
      setErrorMessages((prev) => [...prev, ...newErrors]);
    }

    const newFiles: UploadedFile[] = accepted.map((file) => ({
      id: crypto.randomUUID(),
      file,
      category: inferCategory(file),
      createdAt: Date.now(),
    }));

    if (newFiles.length) {
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setErrorMessages([]);
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
        }/medical-record`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symptoms: formData.symptoms || null,
            medications: formData.medications || null,
            dosage: formData.dosage || null,
            frequency: formData.frequency || null,
            diagnosis: formData.diagnosis || null,
            doctorName: formData.doctorName || null,
            hospital: formData.hospital || null,
            notes: formData.notes || null,
            date: formData.date || null,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save record");
      }

      await res.json();

      setFormData({
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

      setUploadedFiles([]);
      setSuccessMessage("Record saved successfully!");
    } catch (err: any) {
      setErrorMessages([
        err?.message ? `❌ ${err.message}` : "❌ Something went wrong",
      ]);
    } finally {
      setLoading(false);
    }
  };

  const hasAnyField =
    !!formData.symptoms ||
    !!formData.medications ||
    !!formData.dosage ||
    !!formData.frequency ||
    !!formData.diagnosis ||
    !!formData.doctorName ||
    !!formData.hospital ||
    !!formData.notes ||
    !!formData.date;

  const canSubmit = uploadedFiles.length > 0 || hasAnyField;

  const totalBytes = uploadedFiles.reduce((acc, f) => acc + f.file.size, 0);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Upload Medical Files
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Add prescriptions, lab results, or reports. Then fill the visit
            details and submit.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 sm:flex">
          <span className="font-medium">{uploadedFiles.length}</span>
          <span>files selected</span>
        </div>
      </div>

      {/* Upload section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Upload area</h2>
            <p className="text-xs text-slate-500">
              JPG, PNG, PDF up to {MAX_FILE_MB}MB
            </p>
          </div>

          {uploadedFiles.length > 0 && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              Ready to submit
            </span>
          )}
        </div>

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
          className={`mt-4 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 sm:p-10 ${
            isDragging
              ? "border-blue-500 bg-blue-50/60 scale-[1.01] shadow-sm"
              : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-slate-50/70"
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="rounded-full bg-blue-100 p-3 text-blue-700">
              <PaperClipIcon className="h-6 w-6" />
            </div>

            <p className="font-medium text-slate-800">
              Drag &amp; drop your medical files here
            </p>

            <p className="text-xs text-slate-500">
              Or choose files from your device
            </p>
          </div>

          <input
            id="fileUpload"
            type="file"
            multiple
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />

          <label
            htmlFor="fileUpload"
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <PaperClipIcon className="h-4 w-4" />
            Browse files
          </label>
        </div>

        {/* Date */}
        <div className="mt-5 grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label
              htmlFor="visitDate"
              className="block text-xs font-medium text-slate-600"
            >
              Visit / Report date
            </label>

            <input
              id="visitDate"
              name="date"
              type="date"
              value={formData.date ?? ""}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span className="font-medium text-slate-800">
                {uploadedFiles.length}
              </span>{" "}
              file(s) selected. Add details below to complete the record.
            </div>
          </div>
        </div>

        {/* Selected file chips */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-slate-700">
                Selected files
              </p>
              <p className="text-xs text-slate-500">
                Total: {uploadedFiles.length} • {formatSize(totalBytes)}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {uploadedFiles.map((f) => (
                <div
                  key={f.id}
                  title={f.file.name}
                  className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700"
                >
                  <span className="max-w-[160px] truncate font-medium">
                    {f.file.name}
                  </span>

                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    {f.category}
                  </span>

                  <button
                    type="button"
                    onClick={() => onDeleteFile?.(f.id)}
                    className="ml-1 rounded-full px-2 py-0.5 text-[11px] text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                    aria-label="Remove file"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {successMessage && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <div className="flex items-start justify-between gap-3">
              <p>✅ {successMessage}</p>
              <button
                type="button"
                onClick={() => setSuccessMessage("")}
                className="text-xs underline"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {errorMessages.length > 0 && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <ul className="list-disc space-y-1 pl-5">
              {errorMessages.map((e, i) => (
                <li key={`err-${i}`}>{e}</li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setErrorMessages([])}
              className="mt-2 text-xs underline"
            >
              Clear
            </button>
          </div>
        )}
      </section>

      {/* Medical Record Details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Medical record details
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Fill what you know. You can leave fields empty.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Symptoms
            </label>
            <input
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="e.g., Fever, headache..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              Diagnosis
            </label>
            <input
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="e.g., Viral infection..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              Medications
            </label>
            <input
              name="medications"
              value={formData.medications}
              onChange={handleChange}
              placeholder="e.g., Paracetamol..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Dosage
              </label>
              <input
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="e.g., 500mg"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                Frequency
              </label>
              <input
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                placeholder="e.g., Twice daily"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              Doctor name
            </label>
            <input
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              placeholder="e.g., Dr. Silva"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              Hospital / Clinic
            </label>
            <input
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
              placeholder="e.g., Asiri Hospital"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-600">
              Additional notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any extra info (optional)"
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Tip: Upload files first, then submit for processing.
          </p>

          <div className="w-full sm:w-auto">
            {loading && (
              <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 sm:w-64">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-500" />
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !canSubmit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <CheckCircleIcon className="h-5 w-5" />
              {loading ? "Processing..." : "Submit for AI Processing"}
            </button>

            {!canSubmit && (
              <p className="mt-2 text-[11px] text-slate-500">
                Add at least one file or fill any field to enable submit.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Mobile sticky submit bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/90 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900">
                Ready to submit
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {uploadedFiles.length} file(s) •{" "}
                {formData.date ? `Date: ${formData.date}` : "No date"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !canSubmit}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircleIcon className="h-5 w-5" />
              {isLoading ? "Processing..." : "Submit"}
            </button>
          </div>

          {!canSubmit && (
            <p className="mt-2 text-[11px] text-slate-500">
              Add at least one file or fill any field to enable submit.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
