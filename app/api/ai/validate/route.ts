// app/api/ai/validate/route.ts
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

function emptyDetails() {
  return {
    medicationItems: [],
    metrics: [],
  };
}

/* ============================================================
   MOCK DATA
============================================================ */

function mockByCategory(category: string, dateFromUser: string) {
  const date = dateFromUser || todayISO();

  switch (category) {
    case "Prescription":
      return {
        isMedical: true,
        reason: null,
        extractedText:
          "Prescription\nDoctor: Dr. Amanda Silva\nHospital: Asiri Hospital\nMedication: Paracetamol 500mg - 2 tablets twice daily until 2026-03-05\nDiagnosis: Viral infection",
        extractedFields: {
          ...emptyExtractedFields(date),
          medications: "Paracetamol",
          dosage: "500mg",
          frequency: "Twice daily",
          doctorName: "Dr. Amanda Silva",
          hospital: "Asiri Hospital",
          diagnosis: "Viral infection",
        },
        details: {
          ...emptyDetails(),
          medicationItems: [
            {
              name: "Paracetamol",
              strength: "500mg",
              doseQuantity: 2,
              doseUnit: "tablet",
              scheduleTimes: ["08:00", "20:00"],
              startDate: date,
              endDate: "2026-03-05",
              instructions: "After food",
            },
          ],
        },
      };

    case "Lab Report":
      return {
        isMedical: true,
        reason: null,
        extractedText:
          "Lab Report\nFBS 110 mg/dL\nHbA1c 6.2 %\nLab: Asiri Laboratory",
        extractedFields: {
          ...emptyExtractedFields(date),
          testName: "Diabetes Panel",
          results: "FBS 110 mg/dL\nHbA1c 6.2 %",
          hospital: "Asiri Laboratory",
        },
        details: {
          ...emptyDetails(),
          metrics: [
            {
              name: "FBS",
              value: 110,
              unit: "mg/dL",
              date,
              dateSource: "document", // ✅ NEW
              fasting: true,
              referenceRange: { low: 70, high: 110, text: "70-110" },
            },
            {
              name: "HbA1c",
              value: 6.2,
              unit: "%",
              date,
              dateSource: "document", // ✅ NEW
              referenceRange: { low: 4.0, high: 5.6, text: "4.0-5.6" },
            },
          ],
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
        details: emptyDetails(),
      };

    case "Doctor Note":
      return {
        isMedical: true,
        reason: null,
        extractedText:
          "Doctor Note\nSymptoms: Fever, headache\nDiagnosis: Viral infection\nBP 120/80 mmHg\nDoctor: Dr. Amanda Silva\nClinic: Asiri Hospital",
        extractedFields: {
          ...emptyExtractedFields(date),
          symptoms: "Fever, headache",
          diagnosis: "Viral infection",
          doctorName: "Dr. Amanda Silva",
          hospital: "Asiri Hospital",
        },
        details: {
          ...emptyDetails(),
          metrics: [
            {
              name: "BP_SYS",
              value: 120,
              unit: "mmHg",
              date,
              dateSource: "document", // ✅ NEW
              fasting: null,
              referenceRange: { low: 90, high: 120, text: "90-120" },
            },
            {
              name: "BP_DIA",
              value: 80,
              unit: "mmHg",
              date,
              dateSource: "document", // ✅ NEW
              fasting: null,
              referenceRange: { low: 60, high: 80, text: "60-80" },
            },
          ],
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
          coverageDetails: "Inpatient + Outpatient coverage. Claim under review.",
        },
        details: emptyDetails(),
      };

    default:
      return {
        isMedical: true,
        reason: null,
        extractedText: "Medical document (mock).",
        extractedFields: emptyExtractedFields(date),
        details: emptyDetails(),
      };
  }
}

/* ============================================================
   PDF TEXT EXTRACTOR (pdfjs-dist)
============================================================ */

async function extractTextFromPdf(buf: Buffer): Promise<string> {
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url
  ).toString();

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buf) });
  const pdf = await loadingTask.promise;

  const maxPages = Math.min(pdf.numPages, 3);
  let fullText = "";

  for (let pageNo = 1; pageNo <= maxPages; pageNo++) {
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();
    const strings = (content.items || [])
      .map((it: any) => (typeof it.str === "string" ? it.str : ""))
      .filter(Boolean);

    fullText += strings.join(" ") + "\n";
  }

  return fullText.trim();
}

/* ============================================================
   MAIN POST
============================================================ */

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const file = form.get("file") as File | null;
    const category = String(form.get("category") || "");
    const date = String(form.get("date") || "");

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const mime = file.type || "";
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(mime)) {
      return NextResponse.json(
        { message: `Unsupported file type: ${mime}` },
        { status: 400 }
      );
    }

    // MOCK
    if (AI_MODE === "mock") {
      if (file.name.toLowerCase().includes("notmedical")) {
        return NextResponse.json({
          isMedical: false,
          reason: "This file does not appear to be a medical document.",
          extractedText: null,
          extractedFields: null,
          details: null,
        });
      }
      return NextResponse.json(mockByCategory(category, date));
    }

    const buf = Buffer.from(await file.arrayBuffer());

    const prompt = `
You are a strict medical document validator and structured data extractor for the HealthApe application.

Your job is to analyze the uploaded document and return structured JSON according to the provided schema.

--------------------------------------------------
PRIMARY TASK
--------------------------------------------------

1) Decide if the document is medical-related.
   Valid categories:
   - Prescription
   - Lab Report
   - Image/X-ray
   - Doctor Note
   - Insurance Document

2) If NOT medical:
   - isMedical = false
   - Provide a short reason
   - extractedText = null
   - extractedFields = null
   - details = null

3) If medical:
   - isMedical = true
   - Extract readable text summary into extractedText
   - Populate extractedFields (strings or null only)
   - Populate structured details for app features

Selected category: "${category}"
User provided date (optional): "${date}"

--------------------------------------------------
IMPORTANT EXTRACTION RULES
--------------------------------------------------

GENERAL:
- extractedFields values MUST be strings or null only.
- Never return numbers inside extractedFields.
- Unknown or missing values must be null.
- details.medicationItems and details.metrics must always be arrays (can be empty).
- Do not invent information.
- If unsure, use null.

--------------------------------------------------
CATEGORY-SPECIFIC RULES
--------------------------------------------------

Prescription:
- Fill medicationItems[] for reminder system.
Each item must include:
  name (string)
  strength (string or null)
  doseQuantity (number or null)
  doseUnit (string or null)
  scheduleTimes (array of "HH:mm" strings)
  startDate (YYYY-MM-DD or null)
  endDate (YYYY-MM-DD or null)
  instructions (string or null)

Lab Report:
- Fill details.metrics[] for insights graphs.

Doctor Note:
- If vitals (BP, sugar, Hb, etc.) are present, also populate details.metrics[].

Insurance Document:
- Fill provider, policyNumber, claimNumber, coverageDetails in extractedFields.

Image/X-ray:
- Fill imagingType, bodyPart, findings in extractedFields.

--------------------------------------------------
DETAILS.METRICS STRICT RULES
--------------------------------------------------

Each metric object must include:

- name (string)
- value (number or null)
- unit (string or null)
- date (YYYY-MM-DD string or null)
- fasting (boolean or null)
- referenceRange (object or null)

REFERENCE RANGE RULES:
- Always include referenceRange.
- If known, use:
  { low: number|null, high: number|null, text: string|null }
- If unknown, set referenceRange = null.

FASTING RULES:
- Always include fasting.
- true  → if document clearly says "Fasting"
- false → if clearly says "Non-fasting" or "Random"
- null  → if not mentioned

For sugar tests:
- FBS → usually fasting=true (unless stated otherwise)
- RBS → fasting=false
- PPBS → fasting=false
- If unclear → fasting=null

If reference ranges are visible in the report, extract them.
If not visible, set referenceRange=null.

--------------------------------------------------
DATE RULES (STRICT)
--------------------------------------------------

Document-level date:
- If user provided date is present → treat it as document date.
- Else if document shows a clear report/visit/issued date → use it as document date.
- Else → document date is null.

For each metric in details.metrics[]:

1) If the metric line has an explicit date in the report → use that date.
   Set dateSource = "explicit"

2) Else if document-level date exists → use document-level date.
   Set dateSource = "document"

3) Else:
   date = null
   dateSource = "unknown"

--------------------------------------------------
STRICT OUTPUT REQUIREMENTS
--------------------------------------------------

- Follow the JSON schema exactly.
- Do not add extra properties.
- Do not omit required properties.
- Use null instead of undefined.
- Ensure arrays exist even if empty.
`;

    const content: any[] = [{ type: "input_text", text: prompt }];

    if (mime === "application/pdf") {
      const extracted = await extractTextFromPdf(buf);

      if (extracted.length < 50) {
        return NextResponse.json({
          isMedical: false,
          reason:
            "This PDF appears to be scanned (no readable text). PDF OCR is not enabled yet. Please upload a JPG/PNG or a text-based PDF.",
          extractedText: "Scanned PDF detected (no readable text)",
          extractedFields: null,
          details: null,
        });
      }

      const snippet = extracted.slice(0, 12000);
      content.push({
        type: "input_text",
        text: `\n\n---\nPDF EXTRACTED TEXT (truncated):\n${snippet}\n---\n`,
      });
    } else {
      const base64 = buf.toString("base64");
      content.push({
        type: "input_image",
        image_url: `data:${mime};base64,${base64}`,
        detail: "auto",
      });
    }

    const resp = await client.responses.create({
      model: process.env.OPENAI_VALIDATE_MODEL || "gpt-4o-2024-11-20",
      input: [{ role: "user", content }],
      text: {
        format: {
          type: "json_schema",
          name: "healthape_validate_result",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["isMedical", "reason", "extractedText", "extractedFields", "details"],
            properties: {
              isMedical: { type: "boolean" },
              reason: { type: ["string", "null"] },
              extractedText: { type: ["string", "null"] },

              extractedFields: {
                type: ["object", "null"],
                additionalProperties: false,
                required: Object.keys(emptyExtractedFields(null)),
                properties: Object.fromEntries(
                  Object.keys(emptyExtractedFields(null)).map((key) => [
                    key,
                    { type: ["string", "null"] },
                  ])
                ),
              },

              details: {
                type: ["object", "null"],
                additionalProperties: false,
                required: ["medicationItems", "metrics"],
                properties: {
                  medicationItems: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: [
                        "name",
                        "strength",
                        "doseQuantity",
                        "doseUnit",
                        "scheduleTimes",
                        "startDate",
                        "endDate",
                        "instructions",
                      ],
                      properties: {
                        name: { type: "string" },
                        strength: { type: ["string", "null"] },
                        doseQuantity: { type: ["number", "null"] },
                        doseUnit: { type: ["string", "null"] },
                        scheduleTimes: { type: "array", items: { type: "string" } },
                        startDate: { type: ["string", "null"] },
                        endDate: { type: ["string", "null"] },
                        instructions: { type: ["string", "null"] },
                      },
                    },
                  },

                  metrics: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["name", "value", "unit", "date", "referenceRange", "fasting", "dateSource"],
                      properties: {
                        name: { type: "string" },
                        value: { type: ["number", "null"] },
                        unit: { type: ["string", "null"] },
                        date: { type: ["string", "null"] },

                        // ✅ ADD THIS
                          dateSource: {
                            type: "string",
                            enum: ["explicit", "document", "unknown"],
                          },

                        // ✅ NEW
                        fasting: { type: ["boolean", "null"] },

                        // ✅ NEW
                        referenceRange: {
                          type: ["object", "null"],
                          additionalProperties: false,
                          required: ["low", "high", "text"],
                          properties: {
                            low: { type: ["number", "null"] },
                            high: { type: ["number", "null"] },
                            text: { type: ["string", "null"] },
                          },
                      },
                    },
                  },
                },
                },
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

    // Ensure defaults
    if (data.isMedical && data.details == null) data.details = emptyDetails();

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("AI ERROR:", err);
    return NextResponse.json(
      { message: "Validation failed", detail: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}