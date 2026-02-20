// app/upload-record/type/type.ts

export type UploadCategory =
  | "Prescription"
  | "Lab Report"
  | "Image/X-ray"
  | "Doctor Note"
  | "Insurance Document";

export type FileStatus = "queued" | "validating" | "valid" | "invalid" | "error";

export interface FormDataType {
  // Shared/common
  date?: string; // yyyy-mm-dd
  doctorName: string;
  hospital: string;

  // Doctor Note
  symptoms: string;
  diagnosis: string;
  notes: string;

  // Prescription
  medications: string;
  dosage: string;
  frequency: string;

  // Lab Report
  testName: string;
  results: string;

  // Image/X-ray
  imagingType: string;
  bodyPart: string;
  findings: string;

  // Insurance
  provider: string;
  policyNumber: string;
  claimNumber: string;
  coverageDetails: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  category: UploadCategory;
  createdAt: number;
  status: FileStatus;
  ocrText?: string;
  validationError?: string;
  extractedFields?: Partial<FormDataType>;
}

export interface ValidateResponse {
  isMedical: boolean;
  reason: string;
  extractedText: string;
  extractedFields?: Partial<FormDataType>;
}