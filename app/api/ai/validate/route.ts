// app/api/ai/validate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const AI_MODE = process.env.AI_MODE || "mock";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* ============================================================
   Types
============================================================ */

type NullableString = string | null;

type ExtractedFields = {
  date: NullableString;

  doctorName: NullableString;
  hospital: NullableString;

  symptoms: NullableString;
  diagnosis: NullableString;
  notes: NullableString;

  medications: NullableString;
  dosage: NullableString;
  frequency: NullableString;

  testName: NullableString;
  results: NullableString;

  imagingType: NullableString;
  bodyPart: NullableString;
  findings: NullableString;

  provider: NullableString;
  policyNumber: NullableString;
  claimNumber: NullableString;
  coverageDetails: NullableString;
};

type MedicationItem = {
  name: string;
  strength: NullableString;
  doseQuantity: number | null;
  doseUnit: NullableString;
  scheduleTimes: string[];
  startDate: NullableString;
  endDate: NullableString;
  instructions: NullableString;
};

type ReferenceRange = {
  low: number | null;
  high: number | null;
  text: NullableString;
};

type MetricItem = {
  name: string;
  value: number | null;
  unit: NullableString;
  date: NullableString;
  dateSource: "explicit" | "document" | "unknown";
  fasting: boolean | null;
  referenceRange: ReferenceRange | null;
};

type Details = {
  medicationItems: MedicationItem[];
  metrics: MetricItem[];
};

type ValidateResult = {
  isMedical: boolean;
  reason: NullableString;
  extractedText: NullableString;
  extractedFields: ExtractedFields | null;
  details: Details | null;
};

/* ============================================================
   Basic Helpers
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

function emptyExtractedFields(date: string | null): ExtractedFields {
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

function emptyDetails(): Details {
  return {
    medicationItems: [],
    metrics: [],
  };
}

/* ============================================================
   Normalization Helpers
============================================================ */

function normalizeNullableString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return String(value).trim() || null;

  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;

  const lower = cleaned.toLowerCase();
  if (["null", "undefined", "n/a", "na", "unknown", "-"].includes(lower)) {
    return null;
  }

  return cleaned;
}

function normalizeMultilineString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return normalizeNullableString(value);

  const cleaned = value
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");

  return cleaned || null;
}

function normalizeDateString(value: unknown): string | null {
  const s = normalizeNullableString(value);
  if (!s) return null;

  // Accept only YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // Try Date parsing as fallback, then convert to YYYY-MM-DD
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return null;
}

function normalizeNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizeScheduleTimes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter((v) => /^\d{2}:\d{2}$/.test(v))
    )
  );
}

function normalizeMedicationItem(item: any, documentDate: string | null): MedicationItem | null {
  const name = normalizeNullableString(item?.name);
  if (!name) return null;

  let startDate = normalizeDateString(item?.startDate);
  const endDate = normalizeDateString(item?.endDate);

  if (!startDate && documentDate) {
    startDate = documentDate;
  }

  return {
    name,
    strength: normalizeNullableString(item?.strength),
    doseQuantity: normalizeNumber(item?.doseQuantity),
    doseUnit: normalizeNullableString(item?.doseUnit),
    scheduleTimes: normalizeScheduleTimes(item?.scheduleTimes),
    startDate,
    endDate,
    instructions: normalizeNullableString(item?.instructions),
  };
}

function normalizeReferenceRange(value: any): ReferenceRange | null {
  if (!value || typeof value !== "object") return null;

  const low = normalizeNumber(value.low);
  const high = normalizeNumber(value.high);
  const text = normalizeNullableString(value.text);

  if (low == null && high == null && text == null) return null;

  return { low, high, text };
}

function inferFastingFromMetricName(name: string | null): boolean | null {
  if (!name) return null;
  const n = name.trim().toUpperCase();

  if (n === "FBS" || n.includes("FASTING")) return true;
  if (n === "RBS" || n === "PPBS" || n.includes("RANDOM")) return false;

  return null;
}

function normalizeMetricItem(item: any, documentDate: string | null): MetricItem | null {
  const name = normalizeNullableString(item?.name);
  if (!name) return null;

  let date = normalizeDateString(item?.date);

  let dateSource: "explicit" | "document" | "unknown" =
    item?.dateSource === "explicit" ||
    item?.dateSource === "document" ||
    item?.dateSource === "unknown"
      ? item.dateSource
      : "unknown";

  if (date) {
    if (dateSource === "unknown") dateSource = "explicit";
  } else if (documentDate) {
    date = documentDate;
    dateSource = "document";
  } else {
    date = null;
    dateSource = "unknown";
  }

  let fasting: boolean | null =
    typeof item?.fasting === "boolean" ? item.fasting : null;

  if (fasting == null) {
    fasting = inferFastingFromMetricName(name);
  }

  return {
    name,
    value: normalizeNumber(item?.value),
    unit: normalizeNullableString(item?.unit),
    date,
    dateSource,
    fasting,
    referenceRange: normalizeReferenceRange(item?.referenceRange),
  };
}

function normalizeExtractedFields(fields: any): ExtractedFields {
  return {
    date: normalizeDateString(fields?.date),

    doctorName: normalizeNullableString(fields?.doctorName),
    hospital: normalizeNullableString(fields?.hospital),

    symptoms: normalizeMultilineString(fields?.symptoms),
    diagnosis: normalizeMultilineString(fields?.diagnosis),
    notes: normalizeMultilineString(fields?.notes),

    medications: normalizeMultilineString(fields?.medications),
    dosage: normalizeMultilineString(fields?.dosage),
    frequency: normalizeMultilineString(fields?.frequency),

    testName: normalizeNullableString(fields?.testName),
    results: normalizeMultilineString(fields?.results),

    imagingType: normalizeNullableString(fields?.imagingType),
    bodyPart: normalizeNullableString(fields?.bodyPart),
    findings: normalizeMultilineString(fields?.findings),

    provider: normalizeNullableString(fields?.provider),
    policyNumber: normalizeNullableString(fields?.policyNumber),
    claimNumber: normalizeNullableString(fields?.claimNumber),
    coverageDetails: normalizeMultilineString(fields?.coverageDetails),
  };
}

function buildMedicationSummary(items: MedicationItem[]): string | null {
  const names = Array.from(
    new Set(
      items
        .map((m) => normalizeNullableString(m.name))
        .filter(Boolean) as string[]
    )
  );
  return names.length ? names.join(", ") : null;
}

function buildDosageSummary(items: MedicationItem[]): string | null {
  const lines = items
    .map((m) => {
      const left = [m.name, m.strength].filter(Boolean).join(" ");
      const dose =
        m.doseQuantity != null || m.doseUnit
          ? `${m.doseQuantity != null ? m.doseQuantity : ""}${m.doseUnit ? ` ${m.doseUnit}` : ""}`.trim()
          : null;

      if (!left && !dose) return null;
      if (left && dose) return `${left} - ${dose}`;
      return left || dose;
    })
    .filter(Boolean) as string[];

  return lines.length ? lines.join("\n") : null;
}

function buildFrequencySummary(items: MedicationItem[]): string | null {
  const lines = items
    .map((m) => {
      let freq: string | null = null;

      if (m.scheduleTimes.length === 3) freq = "TDS";
      else if (m.scheduleTimes.length === 2) freq = "BD";
      else if (m.scheduleTimes.length === 1) freq = "OD";

      if (!freq && m.instructions) {
        const ins = m.instructions.toUpperCase();
        if (ins.includes("Q6H")) freq = "Q6H";
        else if (ins.includes("SOS")) freq = "SOS";
      }

      const parts: string[] = [];
      if (freq) parts.push(freq);

      if (m.startDate && m.endDate) {
        const start = new Date(m.startDate);
        const end = new Date(m.endDate);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
          const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
          if (days > 0) parts.push(`(${days} days)`);
        }
      }

      if (!parts.length) return null;
      return `${m.name} - ${parts.join(" ")}`;
    })
    .filter(Boolean) as string[];

  return lines.length ? lines.join("\n") : null;
}

function buildResultsSummary(metrics: MetricItem[]): string | null {
  const lines = metrics
    .map((m) => {
      const valuePart = m.value != null ? `${m.value}` : null;
      const unitPart = m.unit || null;
      const base = [m.name + ":", valuePart, unitPart].filter(Boolean).join(" ").trim();

      if (!base) return null;

      const refText = m.referenceRange?.text;
      return refText ? `${base} (Ref: ${refText})` : base;
    })
    .filter(Boolean) as string[];

  return lines.length ? lines.join("\n") : null;
}

function dedupeMedicationItems(items: MedicationItem[]): MedicationItem[] {
  const seen = new Set<string>();
  const result: MedicationItem[] = [];

  for (const item of items) {
    const key = JSON.stringify({
      name: item.name.toLowerCase(),
      strength: item.strength?.toLowerCase() ?? null,
      doseQuantity: item.doseQuantity,
      doseUnit: item.doseUnit?.toLowerCase() ?? null,
      scheduleTimes: item.scheduleTimes,
      startDate: item.startDate,
      endDate: item.endDate,
      instructions: item.instructions?.toLowerCase() ?? null,
    });

    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

function dedupeMetrics(items: MetricItem[]): MetricItem[] {
  const seen = new Set<string>();
  const result: MetricItem[] = [];

  for (const item of items) {
    const key = JSON.stringify({
      name: item.name.toLowerCase(),
      value: item.value,
      unit: item.unit?.toLowerCase() ?? null,
      date: item.date,
      dateSource: item.dateSource,
    });

    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

function normalizeFinalData(raw: any, category: string): ValidateResult {
  const isMedical = Boolean(raw?.isMedical);
  const reason = normalizeNullableString(raw?.reason);
  const extractedText = normalizeMultilineString(raw?.extractedText);

  if (!isMedical) {
    return {
      isMedical: false,
      reason: reason || "This file does not appear to be a medical document.",
      extractedText: null,
      extractedFields: null,
      details: null,
    };
  }

  const extractedFields = normalizeExtractedFields(raw?.extractedFields ?? {});
  const documentDate = extractedFields.date;

  const medicationItems = Array.isArray(raw?.details?.medicationItems)
    ? raw.details.medicationItems
        .map((m: any) => normalizeMedicationItem(m, documentDate))
        .filter(Boolean)
    : [];

  const metrics = Array.isArray(raw?.details?.metrics)
    ? raw.details.metrics
        .map((m: any) => normalizeMetricItem(m, documentDate))
        .filter(Boolean)
    : [];

  const details: Details = {
    medicationItems: dedupeMedicationItems(medicationItems as MedicationItem[]),
    metrics: dedupeMetrics(metrics as MetricItem[]),
  };

  /* --------------------------------------------
     Repair extractedFields from structured details
  -------------------------------------------- */

  if (category === "Prescription") {
    if (!extractedFields.medications && details.medicationItems.length) {
      extractedFields.medications = buildMedicationSummary(details.medicationItems);
    }

    if (!extractedFields.dosage && details.medicationItems.length) {
      extractedFields.dosage = buildDosageSummary(details.medicationItems);
    }

    if (!extractedFields.frequency && details.medicationItems.length) {
      extractedFields.frequency = buildFrequencySummary(details.medicationItems);
    }
  }

  if ((category === "Lab Report" || category === "Doctor Note") && !extractedFields.results && details.metrics.length) {
    extractedFields.results = buildResultsSummary(details.metrics);
  }

  return {
    isMedical: true,
    reason: null,
    extractedText,
    extractedFields,
    details,
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
          dosage: "Paracetamol 500mg - 2 tablet",
          frequency: "Paracetamol - BD",
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
          results: "FBS: 110 mg/dL (Ref: 70-110)\nHbA1c: 6.2 % (Ref: 4.0-5.6)",
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
              dateSource: "document",
              fasting: true,
              referenceRange: { low: 70, high: 110, text: "70-110" },
            },
            {
              name: "HbA1c",
              value: 6.2,
              unit: "%",
              date,
              dateSource: "document",
              fasting: null,
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
          results: "BP_SYS: 120 mmHg (Ref: 90-120)\nBP_DIA: 80 mmHg (Ref: 60-80)",
        },
        details: {
          ...emptyDetails(),
          metrics: [
            {
              name: "BP_SYS",
              value: 120,
              unit: "mmHg",
              date,
              dateSource: "document",
              fasting: null,
              referenceRange: { low: 90, high: 120, text: "90-120" },
            },
            {
              name: "BP_DIA",
              value: 80,
              unit: "mmHg",
              date,
              dateSource: "document",
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

      const mocked = mockByCategory(category, date);
      const normalizedMock = normalizeFinalData(mocked, category);
      return NextResponse.json(normalizedMock);
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
- extractedFields.results must reflect the document table, not interpretation.

--------------------------------------------------
CATEGORY-SPECIFIC RULES
--------------------------------------------------

Prescription:

You MUST populate BOTH:
A) extractedFields (for UI auto-fill)
B) details.medicationItems[] (for reminders)

--------------------------------------------------
PRESCRIPTION AUTO-FILL MAPPING RULES
--------------------------------------------------

1) extractedFields.medications:
- Comma-separated UNIQUE medicine names.
- Example: "CALPOL, DELCON, LEVOLIN, MEFTAL-P"
- If none found → null

2) extractedFields.dosage:
- Multi-line format:
  "<Drug> <strength if visible> - <doseQuantity><doseUnit>"
- Example:
  "CALPOL 250/5 - 4 ml
   DELCON - 3 ml"
- If unclear → null

3) extractedFields.frequency:
- Multi-line format:
  "<Drug> - <frequency text> (<duration if visible>)"
- Example:
  "CALPOL - Q6H (3 days)
   DELCON - TDS (5 days)"
- If unclear → null

4) extractedFields.diagnosis:
- Use only if explicitly written (Clinical Description / Dx / Impression)
- If unclear → null

5) extractedFields.doctorName / hospital:
- Only if clearly visible in header or stamp
- If unclear → null (DO NOT GUESS)

--------------------------------------------------
MEDICATIONITEMS STRICT RULES
--------------------------------------------------

For each medication line create one item:

- name (string)
- strength (string or null)
- doseQuantity (number or null)
- doseUnit (string or null)
- scheduleTimes (array of "HH:mm")
- startDate (YYYY-MM-DD or null)
- endDate (YYYY-MM-DD or null)
- instructions (string or null)

ABBREVIATION RULES:
- TDS = 3 times daily
- BD = 2 times daily
- OD = once daily
- Q6H = every 6 hours
- SOS = as needed
- x 3 d / x 5 d = duration days

SCHEDULE TIMES:
- TDS → ["08:00","14:00","20:00"]
- BD → ["08:00","20:00"]
- OD → ["08:00"]
- Q6H → scheduleTimes = [] (put "Q6H" in instructions)
- SOS → scheduleTimes = []

DATE RULE:
- If explicit start date → use it
- Else if document-level date exists → startDate = document date
- Else → null
- If no end date → endDate = null

Lab Report:
- extractedFields.testName MUST be the panel name (e.g., "Full Blood Count (FBC)" / "Complete Blood Count (CBC)").
- extractedFields.hospital MUST be the lab name from the report header (e.g., "ASIRI MEDICAL LABORATORY").
- extractedFields.results MUST be a multi-line structured list of results in this format:

"Hemoglobin (Hb): 14.1 g/dL (Ref: 13.0–17.0)
White Blood Cells (WBC): 6.8 x10^9/L (Ref: 4.0–10.0)
Platelets: 240 x10^9/L (Ref: 150–400)"

RULES:
- One line per visible parameter.
- Include reference range if visible.
- If reference range not visible, omit the "(Ref: ...)" part.
- Do NOT write generic summaries like "low values" or "borderline" unless the report literally states it.

Also populate details.metrics[]:
- Create ONE metric per parameter clearly visible.
- Do NOT invent rows.

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
        detail: "high",
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
                        scheduleTimes: {
                          type: "array",
                          items: { type: "string" },
                        },
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
                      required: [
                        "name",
                        "value",
                        "unit",
                        "date",
                        "referenceRange",
                        "fasting",
                        "dateSource",
                      ],
                      properties: {
                        name: { type: "string" },
                        value: { type: ["number", "null"] },
                        unit: { type: ["string", "null"] },
                        date: { type: ["string", "null"] },
                        dateSource: {
                          type: "string",
                          enum: ["explicit", "document", "unknown"],
                        },
                        fasting: { type: ["boolean", "null"] },
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

    const normalized = normalizeFinalData(data, category);

    return NextResponse.json(normalized);
  } catch (err: any) {
    console.error("AI ERROR:", err);
    return NextResponse.json(
      { message: "Validation failed", detail: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}