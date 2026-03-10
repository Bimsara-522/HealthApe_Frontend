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
  SparklesIcon,
  CloudArrowUpIcon,
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
  softBg: string;
  ring: string;
}

const uploadTypes: UploadTypeCard[] = [
  {
    category: "Prescription",
    icon: DocumentTextIcon,
    description: "Doctor-issued prescriptions",
    color: "text-blue-700",
    bg: "bg-blue-600",
    softBg: "bg-blue-50",
    ring: "ring-blue-500",
  },
  {
    category: "Lab Report",
    icon: BeakerIcon,
    description: "Blood tests, urine analysis",
    color: "text-violet-700",
    bg: "bg-violet-600",
    softBg: "bg-violet-50",
    ring: "ring-violet-500",
  },
  {
    category: "Image/X-ray",
    icon: PhotoIcon,
    description: "X-rays, MRI, CT scans",
    color: "text-cyan-700",
    bg: "bg-cyan-600",
    softBg: "bg-cyan-50",
    ring: "ring-cyan-500",
  },
  {
    category: "Doctor Note",
    icon: ClipboardDocumentIcon,
    description: "Consultation notes & referrals",
    color: "text-emerald-700",
    bg: "bg-emerald-600",
    softBg: "bg-emerald-50",
    ring: "ring-emerald-500",
  },
  {
    category: "Insurance Document",
    icon: CreditCardIcon,
    description: "Claims, policy documents",
    color: "text-orange-700",
    bg: "bg-orange-600",
    softBg: "bg-orange-50",
    ring: "ring-orange-500",
  },
];

type FieldKey = keyof FormDataType;

const fieldsByCategory: Record<UploadCategory, FieldKey[]> = {
  Prescription: ["medications", "dosage", "frequency", "doctorName", "hospital", "date", "diagnosis"],
  "Lab Report": ["testName", "results", "hospital", "date"],
  "Image/X-ray": ["imagingType", "bodyPart", "findings", "hospital", "date"],
  "Doctor Note": ["symptoms", "diagnosis", "doctorName", "hospital", "date", "notes"],
  "Insurance Document": ["provider", "policyNumber", "claimNumber", "coverageDetails", "date"],
};

const fieldMeta: Record<FieldKey, { label: string; placeholder?: string; type?: "text" | "textarea" | "date" }> = {
  date: { label: "Date", type: "date" },
  doctorName: { label: "Doctor Name", placeholder: "e.g., Dr. Amanda Silva", type: "text" },
  hospital: { label: "Hospital / Clinic", placeholder: "e.g., Asiri Hospital", type: "text" },

  symptoms: { label: "Symptoms", placeholder: "e.g., Fever, headache", type: "text" },
  diagnosis: { label: "Diagnosis", placeholder: "e.g., Viral infection", type: "text" },
  notes: { label: "Additional Notes", placeholder: "Optional notes...", type: "textarea" },

  medications: { label: "Medications", placeholder: "e.g., Paracetamol, Amoxicillin", type: "text" },
  dosage: { label: "Dosage", placeholder: "e.g., 500mg", type: "text" },
  frequency: { label: "Frequency", placeholder: "e.g., Twice daily", type: "text" },

  testName: { label: "Test Name", placeholder: "e.g., FBC, Lipid Profile", type: "text" },
  results: { label: "Results", placeholder: "e.g., Hb 13.5, WBC 7.2...", type: "textarea" },

  imagingType: { label: "Imaging Type", placeholder: "e.g., X-ray / MRI / CT", type: "text" },
  bodyPart: { label: "Body Part", placeholder: "e.g., Chest, Right Knee", type: "text" },
  findings: { label: "Findings / Impression", placeholder: "e.g., No fracture seen", type: "textarea" },

  provider: { label: "Provider", placeholder: "e.g., AIA / Allianz", type: "text" },
  policyNumber: { label: "Policy Number", placeholder: "e.g., POL-12345", type: "text" },
  claimNumber: { label: "Claim Number", placeholder: "e.g., CLM-7890", type: "text" },
  coverageDetails: { label: "Coverage Details", placeholder: "e.g., Amounts / coverage notes", type: "textarea" },
};

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

  const [toast, setToast] = useState<null | {
    type: "success" | "error" | "loading";
    title: string;
    message?: string;
  }>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const todayDate = new Date().toISOString().slice(0, 10);

  const isFutureDate = (dateStr: string) => {
    if (!dateStr) return false;
    return dateStr > todayDate;
  };

  const resetForm = () => {
    setFormData({
      doctorName: "",
      hospital: "",
      date: "",

      symptoms: "",
      diagnosis: "",
      notes: "",

      medications: "",
      dosage: "",
      frequency: "",

      testName: "",
      results: "",

      imagingType: "",
      bodyPart: "",
      findings: "",

      provider: "",
      policyNumber: "",
      claimNumber: "",
      coverageDetails: "",
    });
  };

  const handleFile = (file: File) => {
    setErrorMessage("");
    setValidated(false);

    if (!selectedCategory) {
      setErrorMessage("Please select a document type before uploading.");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      setErrorMessage("File type not allowed. Please upload a PDF, JPG, or PNG.");
      return;
    }

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setErrorMessage(`File exceeds ${MAX_FILE_MB}MB limit. Please compress and retry.`);
      return;
    }

    setUploadedFile({
      id: crypto.randomUUID(),
      file,
      category: selectedCategory,
      createdAt: Date.now(),
      status: "queued",
      details: { medicationItems: [], metrics: [] },
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

    if (name === "date") {
      if (isFutureDate(value)) {
        setErrorMessage("Future dates are not allowed. Please select today or a past date.");
        return;
      } else {
        if (errorMessage.toLowerCase().includes("future date")) {
          setErrorMessage("");
        }
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateDocument = async () => {
    if (!uploadedFile || !selectedCategory) return;

    if (formData.date && isFutureDate(formData.date)) {
      setErrorMessage("Future dates are not allowed. Please select today or a past date.");
      return;
    }

    setErrorMessage("");
    setValidating(true);
    setLoading(true);

    setUploadedFile((prev) =>
      prev
        ? {
            ...prev,
            status: "validating",
            validationError: undefined,
          }
        : null
    );

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
      console.log("AI RAW:", raw);

      let data: any = {};
      try {
        data = JSON.parse(raw);
      } catch {
        data = { message: raw };
      }

      console.log("AI PARSED extractedFields:", data?.extractedFields);
      console.log("AI PARSED details:", data?.details);

      if (!res.ok) {
        const msg = data?.message || data?.detail || raw || "Validation failed. Please try again.";
        throw new Error(msg);
      }

      if (!data.isMedical) {
        setUploadedFile((prev) =>
          prev
            ? {
                ...prev,
                status: "invalid",
                validationError: data.reason || "This does not appear to be a valid medical document.",
                ocrText: data.extractedText || undefined,
                extractedFields: undefined,
                details: { medicationItems: [], metrics: [] },
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

      setUploadedFile((prev) =>
        prev
          ? {
              ...prev,
              status: "valid",
              ocrText: data.extractedText,
              extractedFields: data.extractedFields,
              details: data.details || { medicationItems: [], metrics: [] },
              validationError: undefined,
            }
          : null
      );

      if (data.extractedFields) {
        setFormData((prev) => {
          const next = { ...prev };
          const allowed = selectedCategory ? fieldsByCategory[selectedCategory] : [];
          for (const k of allowed) {
            const v = data.extractedFields?.[k];
            if (typeof v === "string") next[k] = v as any;
          }
          return next;
        });
      }

      setValidated(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Something went wrong. Please try again.");
      setUploadedFile((prev) =>
        prev ? { ...prev, status: "error", validationError: err?.message } : null
      );
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

    if (formData.date && isFutureDate(formData.date)) {
      setErrorMessage("Future dates are not allowed. Please select today or a past date.");
      return;
    }

    setErrorMessage("");
    setSaving(true);

    setToast({
      type: "loading",
      title: "Saving record...",
      message: "Please wait while we store your medical record.",
    });

    try {
      const fd = new FormData();
      fd.append("file", uploadedFile.file);
      fd.append("category", selectedCategory || "");

      const allowed = selectedCategory ? fieldsByCategory[selectedCategory] : [];
      for (const k of allowed) {
        fd.append(String(k), (formData[k] ?? "") as string);
      }

      fd.append(
        "detailsJson",
        JSON.stringify(uploadedFile?.details ?? { medicationItems: [], metrics: [] })
      );

      const res = await fetch(`${API_BASE}/medical-record`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save record");
      }

      setSaveSuccess(true);
      setToast({
        type: "success",
        title: "Saved successfully",
        message: "Your medical record was added to Records.",
      });
      setTimeout(() => setToast(null), 4000);

      setTimeout(() => {
        resetForm();
        setUploadedFile(null);
        setSelectedCategory(null);
        setValidated(false);
        setSaveSuccess(false);
        setErrorMessage("");
      }, 1500);
    } catch (err: any) {
      const msg = err?.message || "Failed to save record. Please try again.";
      setErrorMessage(msg);

      setToast({
        type: "error",
        title: "Save failed",
        message: msg,
      });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const busy = loading || validating || saving;

  const canValidate = !!uploadedFile && !!selectedCategory && uploadedFile.status !== "validating";
  const canSave = validated;

  const activeFields = selectedCategory ? fieldsByCategory[selectedCategory] : [];

  const completedSteps = [
    !!selectedCategory,
    !!uploadedFile,
    validated,
    validated,
    canSave,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 pb-28 lg:pb-0">
      {/* ===============================
          UPDATED: modern toast
      =============================== */}
      {toast && (
        <div className="pointer-events-none fixed right-4 top-4 z-[100] w-full max-w-sm animate-[toastIn_0.25s_ease-out]">
          <div
            className={`pointer-events-auto overflow-hidden rounded-3xl border shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all duration-300 ${
              toast.type === "success"
                ? "border-emerald-200 bg-white/95"
                : toast.type === "error"
                ? "border-red-200 bg-white/95"
                : "border-blue-200 bg-white/95"
            }`}
          >
            <div className="flex items-start gap-3 p-4">
              <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                  toast.type === "success"
                    ? "bg-emerald-100 text-emerald-600"
                    : toast.type === "error"
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : toast.type === "error" ? (
                  <ExclamationCircleIcon className="h-5 w-5" />
                ) : (
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold ${
                    toast.type === "success"
                      ? "text-emerald-800"
                      : toast.type === "error"
                      ? "text-red-800"
                      : "text-blue-800"
                  }`}
                >
                  {toast.title}
                </p>
                {toast.message && (
                  <p
                    className={`mt-1 text-xs leading-relaxed ${
                      toast.type === "success"
                        ? "text-emerald-700"
                        : toast.type === "error"
                        ? "text-red-700"
                        : "text-blue-700"
                    }`}
                  >
                    {toast.message}
                  </p>
                )}
              </div>

              {toast.type !== "loading" && (
                <button
                  type="button"
                  onClick={() => setToast(null)}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {toast.type !== "loading" && (
              <div className="h-1 w-full overflow-hidden bg-slate-100">
                <div
                  className={`h-full animate-[toastShrink_4s_linear_forwards] ${
                    toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===============================
          UPDATED: top progress summary
      =============================== */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100">
                <SparklesIcon className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900">Upload Medical Record</h1>
                <p className="text-xs text-slate-400">Complete the steps below to validate and save the record.</p>
              </div>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Progress</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{completedSteps}/5 steps completed</p>
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
            style={{ width: `${(completedSteps / 5) * 100}%` }}
          />
        </div>
      </section>

      {/* Step 1 */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            1
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Choose Document Type</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {uploadTypes.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedCategory === t.category;

            return (
              <button
                key={t.category}
                type="button"
                onClick={() => {
                  setSelectedCategory(t.category);
                  if (uploadedFile) {
                    setUploadedFile((prev) => (prev ? { ...prev, category: t.category } : null));
                  }
                }}
                className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 ${
                  isSelected
                    ? `border-transparent ${t.softBg} ring-2 ${t.ring} shadow-[0_12px_25px_rgba(15,23,42,0.06)]`
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                      isSelected ? `${t.bg} text-white` : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {isSelected && <CheckSolid className="h-4 w-4 text-blue-600" />}
                </div>

                <div className="mt-3">
                  <p className={`text-xs font-semibold ${isSelected ? t.color : "text-slate-700"}`}>{t.category}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{t.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {!selectedCategory && (
          <p className="mt-3 text-[11px] text-amber-600">⚠ Please select a document type before uploading.</p>
        )}
      </section>

      {/* Step 2 */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            2
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upload File</h2>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
            PDF · JPG · PNG · Max {MAX_FILE_MB}MB
          </span>
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
            className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
              isDragging
                ? "scale-[1.01] border-blue-500 bg-blue-50/70 shadow-md"
                : selectedCategory
                ? "cursor-pointer border-slate-300 bg-gradient-to-b from-slate-50 to-white hover:border-blue-400 hover:bg-blue-50/30"
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
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-sm">
                <CloudArrowUpIcon className="h-8 w-8 text-blue-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">Drop your file here</p>
                <p className="mt-1 text-xs text-slate-400">or click to browse from your device</p>
              </div>

              <span className="mt-1 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95">
                <ArrowUpTrayIcon className="h-4 w-4" />
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-3xl border-2 p-4 transition-all ${
              uploadedFile.status === "valid"
                ? "border-emerald-300 bg-emerald-50"
                : uploadedFile.status === "invalid" || uploadedFile.status === "error"
                ? "border-red-300 bg-red-50"
                : uploadedFile.status === "validating"
                ? "border-blue-300 bg-blue-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <DocumentTextIcon className="h-5 w-5 text-slate-600" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{uploadedFile.file.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
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
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-40"
                  aria-label="Remove file"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* UPDATED: date card */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <label className="block text-[11px] font-medium text-slate-500">Visit / Report Date (optional)</label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              max={todayDate}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:max-w-[220px]"
            />
            <p className="text-[11px] text-slate-400">Future dates are blocked to keep records accurate.</p>
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            3
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Validate Document</h2>
        </div>

        <button
          type="button"
          onClick={validateDocument}
          disabled={busy || !canValidate}
          className={`flex w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm font-semibold shadow-sm transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
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

        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5">
            <ExclamationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">Document Rejected</p>
              <p className="mt-0.5 text-xs text-red-600">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="shrink-0 text-red-400 hover:text-red-600"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {validated && uploadedFile?.status === "valid" && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-700">Validated ✅</p>
              <p className="mt-0.5 text-xs text-emerald-600">
                Medical document confirmed. Fields below were auto-filled — review before saving.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Step 4 */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            4
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review Auto-filled Fields</h2>
        </div>

        {!selectedCategory ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm font-medium text-slate-500">Select a document type first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {activeFields.map((key) => {
              const meta = fieldMeta[key];
              const value = (formData[key] ?? "") as string;
              const wide = meta.type === "textarea";

              if (meta.type === "date") {
                return (
                  <div key={String(key)} className={wide ? "lg:col-span-2" : ""}>
                    <label className="block text-[11px] font-medium text-slate-500">{meta.label}</label>
                    <input
                      type="date"
                      name={String(key)}
                      value={value}
                      onChange={handleInputChange}
                      max={todayDate}
                      disabled={!validated}
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                );
              }

              if (meta.type === "textarea") {
                return (
                  <div key={String(key)} className="lg:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-500">{meta.label}</label>
                    <textarea
                      name={String(key)}
                      value={value}
                      onChange={handleInputChange}
                      placeholder={meta.placeholder}
                      rows={3}
                      disabled={!validated}
                      className="mt-1 w-full resize-none rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                );
              }

              return (
                <div key={String(key)} className={wide ? "lg:col-span-2" : ""}>
                  <label className="block text-[11px] font-medium text-slate-500">{meta.label}</label>
                  <input
                    name={String(key)}
                    value={value}
                    onChange={handleInputChange}
                    placeholder={meta.placeholder}
                    disabled={!validated}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Step 5 */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            5
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Save Record</h2>
        </div>

        <button
          type="button"
          onClick={saveRecord}
          disabled={busy || !canSave}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
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

      {/* ===============================
          UPDATED: mobile sticky footer
      =============================== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.06)] backdrop-blur lg:hidden">
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
            className={`shrink-0 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-40 ${
              canSave
                ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                : "bg-gradient-to-r from-blue-600 to-indigo-600"
            }`}
          >
            {canSave ? "Save" : "Validate"}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(-10px) translateX(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(0) scale(1);
          }
        }

        @keyframes toastShrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}