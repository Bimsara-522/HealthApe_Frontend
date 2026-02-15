// app/upload-record/type/type.ts
export type UploadCategory = "Prescription" | "Lab Result" | "Report" | "Other";

export type UploadedFile = {
  id: string;
  file: File;
  category: UploadCategory;
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
  date?: string; // yyyy-mm-dd
};