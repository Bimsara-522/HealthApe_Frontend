import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const AI_MODE = process.env.AI_MODE || "mock";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* ============================================================
   Helpers
============================================================ */

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

function emptyExtractedFields(date: string | null) {
  return {
    date,

    doctorName: null,
    hospital: null,

    symptoms: null,
    diagnosis: null,
    notes: null,

    medications: null,
    dosage: null,
    frequency: null,

    testName: null,
    results: null,

    imagingType: null,
    bodyPart: null,
    findings: null,

    provider: null,
    policyNumber: null,
    claimNumber: null,
    coverageDetails: null,
  };
}

/* ============================================================
   MOCK MODE GENERATOR
============================================================ */

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
          ...emptyExtractedFields(date),
          medications: "Paracetamol",
          dosage: "500mg",
          frequency: "Twice daily",
          doctorName: "Dr. Amanda Silva",
          hospital: "Asiri Hospital",
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
          ...emptyExtractedFields(date),
          testName: "Full Blood Count (FBC)",
          results: "Hb 13.5 g/dL\nWBC 7.2 x10^9/L\nPlatelets 250 x10^9/L",
          hospital: "Asiri Laboratory",
        },
      };

    case "Image/X-ray":
      return {
        isMedical: true,
        reason: null,
        extractedText:
          "Imaging Report\nType: X-ray\nBody Part: Chest\nFindings: No acute abnormality detected\nCenter: Asiri Imaging",
        extractedFields: {
          ...emptyExtractedFields(date),
          imagingType: "X-ray",
          bodyPart: "Chest",
          findings: "No acute abnormality detected.",
          hospital: "Asiri Imaging",
        },
      };

    case "Doctor Note":
      return {
        isMedical: true,
        reason: null,
        extractedText:
          "Doctor Note\nSymptoms: Fever, headache\nDiagnosis: Viral infection\nDoctor: Dr. Amanda Silva\nClinic: Asiri Hospital",
        extractedFields: {
          ...emptyExtractedFields(date),
          symptoms: "Fever, headache",
          diagnosis: "Viral infection",
          doctorName: "Dr. Amanda Silva",
          hospital: "Asiri Hospital",
        },
      };

    case "Insurance Document":
      return {
        isMedical: true,
        reason: null,
        extractedText:
          "Insurance Document\nProvider: Allianz\nPolicy: POL-12345\nClaim: CLM-77889\nCoverage: Inpatient + Outpatient",
        extractedFields: {
          ...emptyExtractedFields(date),
          provider: "Allianz",
          policyNumber: "POL-12345",
          claimNumber: "CLM-77889",
          coverageDetails:
            "Inpatient + Outpatient coverage. Claim under review.",
        },
      };

    default:
      return {
        isMedical: true,
        reason: null,
        extractedText: "Medical document (mock).",
        extractedFields: emptyExtractedFields(date),
      };
  }
}

/* ============================================================
   MAIN POST HANDLER
============================================================ */

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const file = form.get("file") as File | null;
    const category = String(form.get("category") || "");
    const date = String(form.get("date") || "");

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    /* ============================================================
       MOCK MODE
    ============================================================ */

    if (AI_MODE === "mock") {
      console.log("Running in MOCK mode");

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

    /* ============================================================
       REAL OPENAI MODE (STRICT JSON SCHEMA)
    ============================================================ */

    const mime = file.type;
    const buf = Buffer.from(await file.arrayBuffer());
    const base64 = buf.toString("base64");

    const prompt = `
You are a strict medical document validator for HealthApe.

Task:
1) Decide if the document is medical-related (Prescription, Lab Report, Image/X-ray, Doctor Note, Insurance Document).
2) If medical, extract relevant fields for the selected category.
3) Return JSON that matches the schema exactly.

Selected category: "${category}"
User date (optional): "${date}"

Rules:
- If NOT medical: isMedical=false and give short reason.
- If medical: fill only what you can; unknowns must be null.
`;

    const resp = await client.responses.create({
      model: process.env.OPENAI_VALIDATE_MODEL || "gpt-4o-2024-11-20",
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
      text: {
        format: {
          type: "json_schema",
          name: "healthape_validate_result",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "isMedical",
              "reason",
              "extractedText",
              "extractedFields",
            ],
            properties: {
              isMedical: { type: "boolean" },
              reason: { type: ["string", "null"] },
              extractedText: { type: ["string", "null"] },
              extractedFields: {
                type: "object",
                additionalProperties: false,
                required: Object.keys(emptyExtractedFields(null)),
                properties: Object.fromEntries(
                  Object.keys(emptyExtractedFields(null)).map((key) => [
                    key,
                    { type: ["string", "null"] },
                  ])
                ),
              },
            },
          },
        },
      },
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