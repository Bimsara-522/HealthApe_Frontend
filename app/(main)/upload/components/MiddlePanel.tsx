// app/upload-record/components/MiddlePanel.tsx
"use client";

import React, { useState, useRef } from "react";
import type { UploadedFile, UploadCategory, FormDataType } from "../type/type";
import {
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  BeakerIcon,
  PhotoIcon,
  ClipboardDocumentIcon,
  CreditCardIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckSolid } from "@heroicons/react/24/solid";

const MAX_FILE_MB = 8;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

type Props = {
  uploadedFile: UploadedFile | null;
  setUploadedFile: React.Dispatch<React.SetStateAction<UploadedFile | null>>;
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onDeleteFile: () => void;
  selectedCategory: UploadCategory | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<UploadCategory | null>>;
};

interface UploadTypeCard {
  category: UploadCategory;
  icon: React.ElementType;
  description: string;
  color: string;
  bg: string;
  ring: string;
}

const uploadTypes: UploadTypeCard[] = [
  {
    category: "Prescription",
    icon: DocumentTextIcon,
    description: "Doctor-issued prescriptions",
    color: "text-blue-700",
    bg: "bg-blue-50",
    ring: "ring-blue-500",
  },
  {
    category: "Lab Report",
    icon: BeakerIcon,
    description: "Blood tests, urine analysis",
    color: "text-violet-700",
    bg: "bg-violet-50",
    ring: "ring-violet-500",
  },
  {
    category: "Image/X-ray",
    icon: PhotoIcon,
    description: "X-rays, MRI, CT scans",
    color: "text-cyan-700",
    bg: "bg-cyan-50",
    ring: "ring-cyan-500",
  },
  {
    category: "Doctor Note",
    icon: ClipboardDocumentIcon,
    description: "Consultation notes & referrals",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    ring: "ring-emerald-500",
  },
  {
    category: "Insurance Document",
    icon: CreditCardIcon,
    description: "Claims, policy documents",
    color: "text-orange-700",
    bg: "bg-orange-50",
    ring: "ring-orange-500",
  },
];

export default function MiddlePanel({
  uploadedFile,
  setUploadedFile,
  formData,
  setFormData,
  loading,
  setLoading,
  onDeleteFile,
  selectedCategory,
  setSelectedCategory,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const resetForm = () => {
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
  };

  const handleFile = (file: File) => {
    setErrorMessage("");
    setValidated(false);

    // ✅ Same as HTML: must select category first
    if (!selectedCategory) {
      setErrorMessage("Please select a document type before uploading.");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      setErrorMessage(`File type not allowed. Please upload a PDF, JPG, or PNG.`);
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setErrorMessage(`File exceeds ${MAX_FILE_MB}MB limit. Please compress and retry.`);
      return;
    }

    setUploadedFile({
      id: crypto.randomUUID(),
      file,
      category: selectedCategory, // ✅ always match selected type
      createdAt: Date.now(),
      status: "queued",
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateDocument = async () => {
    if (!uploadedFile || !selectedCategory) return;

    setErrorMessage("");
    setValidating(true);
    setLoading(true);

    // Mark as validating
    setUploadedFile((prev) => (prev ? { ...prev, status: "validating" } : null));

    try {
      const fd = new FormData();
      fd.append("file", uploadedFile.file);
      fd.append("category", selectedCategory);
      if (formData.date) fd.append("date", formData.date);

      const res = await fetch(`/api/ai/validate`, {
        method: "POST",
        body: fd,
      });

      const raw = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }

        if (!res.ok) {
          // show detail from your route.ts (it returns detail/ocrBody/etc.)
          const msg =
            data?.message ||
            data?.detail ||
            data?.ocrBody ||
            raw ||
            "Validation failed. Please try again.";
          throw new Error(msg);
        }

      if (!data.isMedical) {
        setUploadedFile((prev) =>
          prev
            ? {
                ...prev,
                status: "invalid",
                validationError:
                  data.reason || "This does not appear to be a valid medical document.",
                ocrText: data.extractedText || undefined,
                extractedFields: undefined,
              }
            : null
        );
        setValidated(false);
        setErrorMessage(
          data.reason ||
            "This does not appear to be a valid medical document. Please upload a valid medical file."
        );
        return;
      }

      // Valid — auto-fill form
      setUploadedFile((prev) =>
        prev
          ? {
              ...prev,
              status: "valid",
              ocrText: data.extractedText,
              extractedFields: data.extractedFields,
              validationError: undefined,
            }
          : null
      );

      if (data.extractedFields) {
        setFormData((prev) => ({
          symptoms: data.extractedFields?.symptoms ?? prev.symptoms ?? "",
          medications: data.extractedFields?.medications ?? prev.medications ?? "",
          dosage: data.extractedFields?.dosage ?? prev.dosage ?? "",
          frequency: data.extractedFields?.frequency ?? prev.frequency ?? "",
          diagnosis: data.extractedFields?.diagnosis ?? prev.diagnosis ?? "",
          doctorName: data.extractedFields?.doctorName ?? prev.doctorName ?? "",
          hospital: data.extractedFields?.hospital ?? prev.hospital ?? "",
          notes: data.extractedFields?.notes ?? prev.notes ?? "",
          date: data.extractedFields?.date ?? prev.date ?? "",
        }));
      }

      setValidated(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Something went wrong. Please try again.");
      setUploadedFile((prev) => (prev ? { ...prev, status: "error" } : null));
      setValidated(false);
    } finally {
      setValidating(false);
      setLoading(false);
    }
  };

const saveRecord = async () => {
  if (!uploadedFile) {
    setErrorMessage("No file to save.");
    return;
  }

  setErrorMessage("");
  setSaving(true);

  try {
    const fd = new FormData();
    fd.append("file", uploadedFile.file);

    fd.append("category", selectedCategory || "");
    if (formData.date) fd.append("date", formData.date);

    fd.append("symptoms", formData.symptoms || "");
    fd.append("diagnosis", formData.diagnosis || "");
    fd.append("medications", formData.medications || "");
    fd.append("dosage", formData.dosage || "");
    fd.append("frequency", formData.frequency || "");
    fd.append("doctorName", formData.doctorName || "");
    fd.append("hospital", formData.hospital || "");
    fd.append("notes", formData.notes || "");

    const res = await fetch(`${API_BASE}/medical-record`, {
      method: "POST",
      body: fd, // ✅ multipart
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to save record");
    }

    setSaveSuccess(true);

    setTimeout(() => {
      resetForm();
      setUploadedFile(null);
      setSelectedCategory(null);
      setValidated(false);
      setSaveSuccess(false);
      setErrorMessage("");
    }, 1500);
  } catch (err: any) {
    setErrorMessage(err?.message || "Failed to save record. Please try again.");
  } finally {
    setSaving(false);
  }
};

  const busy = loading || validating || saving;

  // ✅ canValidate allows retry (valid/invalid/error), only block while validating
  const canValidate = !!uploadedFile && !!selectedCategory && uploadedFile.status !== "validating";

  // ✅ save enabled only after validated
  const canSave = validated;

  return (
    <div className="space-y-6 pb-28 lg:pb-0">

      {/* Step 1: Upload Type */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            1
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Choose Document Type</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {uploadTypes.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedCategory === t.category;
            return (
              <button
                key={t.category}
                type="button"
                onClick={() => {
                  setSelectedCategory(t.category);
                  // ✅ keep file category in sync if already chosen
                  if (uploadedFile) {
                    setUploadedFile((prev) => (prev ? { ...prev, category: t.category } : null));
                  }
                }}
                className={`group relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all duration-150 ${
                  isSelected
                    ? `border-blue-500 ${t.bg} ring-2 ${t.ring} ring-offset-1`
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    isSelected ? t.bg : "bg-slate-100 group-hover:bg-slate-200"
                  } transition`}
                >
                  <Icon className={`h-5 w-5 ${isSelected ? t.color : "text-slate-500"}`} />
                </div>
                <span className={`text-[10px] font-semibold leading-tight ${isSelected ? t.color : "text-slate-600"}`}>
                  {t.category}
                </span>

                {isSelected && (
                  <span className="absolute right-1.5 top-1.5">
                    <CheckSolid className="h-3.5 w-3.5 text-blue-600" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {!selectedCategory && (
          <p className="mt-2 text-[11px] text-amber-600">⚠ Please select a document type before uploading.</p>
        )}
      </section>

      {/* Step 2: Upload */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            2
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upload File</h2>
          <span className="ml-auto text-[10px] text-slate-400">PDF · JPG · PNG · Max {MAX_FILE_MB}MB</span>
        </div>

        {!uploadedFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!selectedCategory) return;
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => {
              if (!selectedCategory) {
                setErrorMessage("Please select a document type before uploading.");
                return;
              }
              fileInputRef.current?.click();
            }}
            className={`rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
              isDragging
                ? "scale-[1.01] border-blue-500 bg-blue-50/60 shadow-md"
                : selectedCategory
                ? "cursor-pointer border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/30"
                : "cursor-not-allowed border-slate-200 bg-slate-50/60 opacity-60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
              disabled={!selectedCategory}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />

            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100">
                <ArrowUpTrayIcon className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Drop your file here</p>
                <p className="mt-1 text-xs text-slate-400">or click to browse from your device</p>
              </div>
              <span className="mt-1 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div
            className={`flex items-center justify-between gap-3 rounded-2xl border-2 p-4 ${
              uploadedFile.status === "valid"
                ? "border-emerald-300 bg-emerald-50"
                : uploadedFile.status === "invalid" || uploadedFile.status === "error"
                ? "border-red-300 bg-red-50"
                : uploadedFile.status === "validating"
                ? "border-blue-300 bg-blue-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <DocumentTextIcon className="h-5 w-5 text-slate-600" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{uploadedFile.file.name}</p>
                <p className="text-xs text-slate-400">
                  {formatSize(uploadedFile.file.size)} · {uploadedFile.category}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {uploadedFile.status === "valid" && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <CheckSolid className="h-3.5 w-3.5" /> Valid
                </span>
              )}
              {uploadedFile.status === "validating" && (
                <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  Checking...
                </span>
              )}
              {(uploadedFile.status === "invalid" || uploadedFile.status === "error") && (
                <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                  <XCircleIcon className="h-3.5 w-3.5" /> Invalid
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  onDeleteFile();
                  setValidated(false);
                  setErrorMessage("");
                }}
                disabled={busy}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
                aria-label="Remove file"
              >
                <XCircleIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Date picker */}
        <div className="mt-3">
          <label className="block text-[11px] font-medium text-slate-500">Visit / Report Date (optional)</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:max-w-[220px]"
          />
        </div>
      </section>

      {/* Step 3: Validate */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            3
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Validate Document</h2>
        </div>

        <button
          type="button"
          onClick={validateDocument}
          disabled={busy || !canValidate}
          className={`flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-sm transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
            uploadedFile?.status === "valid"
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95"
          }`}
        >
          {validating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Validating with AI...
            </>
          ) : uploadedFile?.status === "valid" ? (
            <>
              <CheckCircleIcon className="h-5 w-5" />
              Document Validated ✓
            </>
          ) : (
            <>
              <ShieldCheckIcon className="h-5 w-5" />
              Validate Document
            </>
          )}
        </button>

        {!uploadedFile && (
          <p className="mt-2 text-center text-[11px] text-slate-400">Upload a file first to enable validation.</p>
        )}
        {uploadedFile && !selectedCategory && (
          <p className="mt-2 text-center text-[11px] text-amber-500">Select a document type to enable validation.</p>
        )}

        {/* Validation error */}
        {errorMessage && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5">
            <ExclamationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">Document Rejected</p>
              <p className="mt-0.5 text-xs text-red-600">{errorMessage}</p>
            </div>
            <button type="button" onClick={() => setErrorMessage("")} className="shrink-0 text-red-400 hover:text-red-600">
              <XCircleIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Validation success */}
        {validated && uploadedFile?.status === "valid" && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-700">Validated ✅</p>
              <p className="mt-0.5 text-xs text-emerald-600">
                Medical document confirmed. Fields auto-filled below — review and save.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Step 4: Review Form (✅ EXACT like HTML: disabled until validated) */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            4
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review & Edit Details</h2>
          {validated && (
            <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              Auto-filled by AI
            </span>
          )}
        </div>

        <div className={`rounded-2xl border p-4 transition-all duration-300 sm:p-5 ${validated ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-white opacity-60"}`}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[
              { name: "symptoms", label: "Symptoms", placeholder: "e.g., Fever, headache, fatigue..." },
              { name: "diagnosis", label: "Diagnosis", placeholder: "e.g., Viral infection..." },
              { name: "medications", label: "Medications", placeholder: "e.g., Paracetamol, Amoxicillin..." },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-[11px] font-medium text-slate-500">{field.label}</label>
                <input
                  name={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  disabled={!validated}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500">Dosage</label>
                <input
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  placeholder="e.g., 500mg"
                  disabled={!validated}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500">Frequency</label>
                <input
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  placeholder="e.g., Twice daily"
                  disabled={!validated}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500">Doctor Name</label>
              <input
                name="doctorName"
                value={formData.doctorName}
                onChange={handleInputChange}
                placeholder="e.g., Dr. Amanda Silva"
                disabled={!validated}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500">Hospital / Clinic</label>
              <input
                name="hospital"
                value={formData.hospital}
                onChange={handleInputChange}
                placeholder="e.g., Asiri Hospital"
                disabled={!validated}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[11px] font-medium text-slate-500">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any extra info, raw OCR text, or remarks..."
                rows={3}
                disabled={!validated}
                className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>

          {!validated && (
            <p className="mt-3 text-center text-[11px] text-slate-400">Fields will be enabled after successful validation.</p>
          )}
        </div>
      </section>

      {/* Step 5: Save */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            5
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Save Record</h2>
        </div>

        <button
          type="button"
          onClick={saveRecord}
          disabled={busy || !canSave}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving to Records...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircleIcon className="h-5 w-5" />
              Saved Successfully!
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5" />
              Save Medical Record
            </>
          )}
        </button>

        {!canSave && (
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Validate the document first to enable saving.
          </p>
        )}
      </section>

      {/* Mobile sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-900">
              {uploadedFile ? uploadedFile.file.name : "No file selected"}
            </p>
            <p className="text-[10px] text-slate-400">
              {uploadedFile?.status === "valid" ? "✅ Validated · Ready to save" : "Upload → Validate → Save"}
            </p>
          </div>
          <button
            type="button"
            onClick={canSave ? saveRecord : validateDocument}
            disabled={busy || (canSave ? false : !canValidate)}
            className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-40"
          >
            {canSave ? "Save" : "Validate"}
          </button>
        </div>
      </div>
    </div>
  );
}