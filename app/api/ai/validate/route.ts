import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const AI_MODE = process.env.AI_MODE || "mock";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function mockByCategory(category: string, dateFromUser: string) {
  const date = dateFromUser || todayISO();

  switch (category) {
    case "Prescription":
      return {
        isMedical: true,
        reason: null,
        extractedText:
          "Prescription\nDoctor: Dr. Amanda Silva\nHospital: Asiri Hospital\nMedication: Paracetamol 500mg twice daily\nDiagnosis: Viral infection",
        extractedFields: {
          medications: "Paracetamol",
          dosage: "500mg",
          frequency: "Twice daily",
          doctorName: "Dr. Amanda Silva",
          hospital: "Asiri Hospital",
          date,
          diagnosis: "Viral infection",
        },
      };

    case "Lab Report":
      return {
        isMedical: true,
        reason: null,
        extractedText:
          "Lab Report\nTest: Full Blood Count (FBC)\nResult: Hb 13.5 g/dL, WBC 7.2 x10^9/L\nLab: Asiri Laboratory",
        extractedFields: {
          testName: "Full Blood Count (FBC)",
          results: "Hb 13.5 g/dL\nWBC 7.2 x10^9/L\nPlatelets 250 x10^9/L",
          hospital: "Asiri Laboratory",
          date,
        },
      };

    case "Image/X-ray":
      return {
        isMedical: true,
        reason: null,
        extractedText:
          "Imaging Report\nType: X-ray\nBody Part: Chest\nFindings: No acute abnormality detected\nCenter: Asiri Imaging",
        extractedFields: {
          imagingType: "X-ray",
          bodyPart: "Chest",
          findings: "No acute abnormality detected.",
          hospital: "Asiri Imaging",
          date,
        },
      };

    case "Doctor Note":
      return {
        isMedical: true,
        reason: null,
        extractedText:
          "Doctor Note\nSymptoms: Fever, headache\nDiagnosis: Viral infection\nDoctor: Dr. Amanda Silva\nClinic: Asiri Hospital",
        extractedFields: {
          symptoms: "Fever, headache",
          diagnosis: "Viral infection",
          doctorName: "Dr. Amanda Silva",
          hospital: "Asiri Hospital",
          date,
        },
      };

    case "Insurance Document":
      return {
        isMedical: true,
        reason: null,
        extractedText:
          "Insurance Document\nProvider: Allianz\nPolicy: POL-12345\nClaim: CLM-77889\nCoverage: Inpatient + Outpatient",
        extractedFields: {
          provider: "Allianz",
          policyNumber: "POL-12345",
          claimNumber: "CLM-77889",
          coverageDetails: "Inpatient + Outpatient coverage. Claim under review.",
          date,
        },
      };

    default:
      // Unknown category - still return medical true but minimal fields
      return {
        isMedical: true,
        reason: null,
        extractedText: "Medical document (mock).",
        extractedFields: { date },
      };
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const file = form.get("file") as File | null;
    const category = String(form.get("category") || "");
    const date = String(form.get("date") || "");

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // =========================
    // ✅ MOCK MODE
    // =========================
    if (AI_MODE === "mock") {
      console.log("Running in MOCK mode");

      // Optional: simulate rejection
      if (file.name.toLowerCase().includes("notmedical")) {
        return NextResponse.json({
          isMedical: false,
          reason: "This file does not appear to be a medical document.",
          extractedText: null,
          extractedFields: null,
        });
      }

      return NextResponse.json(mockByCategory(category, date));
    }

    // =========================
    // 🔵 REAL OPENAI MODE
    // =========================

    const mime = file.type;
    const buf = Buffer.from(await file.arrayBuffer());
    const base64 = buf.toString("base64");

    // Updated prompt includes ALL possible fields
    const prompt = `
You are a strict medical document validator for HealthApe.

Task:
1) Decide if the document is medical-related (Prescription, Lab Report, Image/X-ray, Doctor Note, Insurance Document).
2) If medical, extract relevant fields for the selected category.
3) Return ONLY valid JSON (no markdown, no extra text).

Selected category: "${category}"
User date (optional): "${date}"

Return JSON EXACTLY:
{
  "isMedical": boolean,
  "reason": string | null,
  "extractedText": string | null,
  "extractedFields": {
    "date": string | null,

    "doctorName": string | null,
    "hospital": string | null,

    "symptoms": string | null,
    "diagnosis": string | null,
    "notes": string | null,

    "medications": string | null,
    "dosage": string | null,
    "frequency": string | null,

    "testName": string | null,
    "results": string | null,

    "imagingType": string | null,
    "bodyPart": string | null,
    "findings": string | null,

    "provider": string | null,
    "policyNumber": string | null,
    "claimNumber": string | null,
    "coverageDetails": string | null
  }
}

Rules:
- If NOT medical: isMedical=false and give short reason.
- If medical: fill only what you can; unknowns must be null.
`;

    const resp = await client.responses.create({
      model: process.env.OPENAI_VALIDATE_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image",
              image_url: `data:${mime};base64,${base64}`,
              detail: "auto",
            },
          ],
        },
      ],
    });

    const outText = resp.output_text || "";
    const data = safeJsonParse(outText);

    if (!data) {
      return NextResponse.json(
        { message: "AI returned invalid JSON", detail: outText },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("AI ERROR:", err);
    return NextResponse.json(
      { message: "Validation failed", detail: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}