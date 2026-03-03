// app/upload-record/type/type.ts

export type UploadCategory =
  | "Prescription"
  | "Lab Report"
  | "Image/X-ray"
  | "Doctor Note"
  | "Insurance Document";

export type MedicationItem = {
  name: string;
  strength?: string | null;
  doseQuantity?: number | null;
  doseUnit?: string | null;
  scheduleTimes?: string[]; // ["08:00", "20:00"]
  startDate?: string | null; // YYYY-MM-DD
  endDate?: string | null;   // YYYY-MM-DD
  instructions?: string | null;
};

export type ReferenceRange = {
  low?: number | null;    // 70
  high?: number | null;   // 110
  text?: string | null;   // "70-110" or "Negative"
};

export type MetricItem = {
  name: string; // "FBS", "HbA1c", "BP_SYS", ...
  value: number | null;
  unit: string | null;
  date: string | null; // YYYY-MM-DD

  // ✅ NEW (Recommended)
  referenceRange?: ReferenceRange | null;

  // ✅ NEW (Recommended) mainly for glucose tests
  fasting?: boolean | null; // true=fasting, false=non-fasting, null=unknown

  // ✅ ADD THIS
  dateSource?: "explicit" | "document" | "unknown";
};

export type ExtractedDetails = {
  medicationItems: MedicationItem[];
  metrics: MetricItem[];
};

export type UploadedFile = {
  id: string;
  file: File;
  category: UploadCategory;
  createdAt: number;

  status?: "queued" | "validating" | "valid" | "invalid" | "error";
  ocrText?: string;
  validationError?: string;

  extractedFields?: Partial<FormDataType>;
  details?: ExtractedDetails; // ✅ NEW
};

export type FormDataType = {
  // shared
  date: string;
  doctorName: string;
  hospital: string;

  // doctor note
  symptoms: string;
  diagnosis: string;
  notes: string;

  // prescription
  medications: string;
  dosage: string;
  frequency: string;

  // lab
  testName: string;
  results: string;

  // imaging
  imagingType: string;
  bodyPart: string;
  findings: string;

  // insurance
  provider: string;
  policyNumber: string;
  claimNumber: string;
  coverageDetails: string;
};