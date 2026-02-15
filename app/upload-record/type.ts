// types/upload.ts
export type UploadCategory = "Prescription" | "Lab Result" | "Report" | "Other";

export type UploadedFile = {
  file: File;
  category: UploadCategory;
  // optional: createdAt for sorting
  createdAt?: number;
};

export type FormDataType = {
  symptoms: string;
  medications: string;
  dosage: string;
  frequency: string;
  diagnosis: string;
  doctorName: string;
  hospital: string;
  notes: string;
  date?: string; // ISO yyyy-mm-dd
};