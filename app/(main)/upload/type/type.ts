// app/upload-record/type/type.ts

export type UploadCategory =
  | "Prescription"
  | "Lab Report"
  | "Image/X-ray"
  | "Doctor Note"
  | "Insurance Document";

export type FileStatus = "queued" | "validating" | "valid" | "invalid" | "error";

export interface FormDataType {
  symptoms: string;
  medications: string;
  dosage: string;
  frequency: string;
  diagnosis: string;
  doctorName: string;
  notes: string;
  hospital: string;
  date: string; // yyyy-mm-dd
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