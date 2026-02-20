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

      return NextResponse.json({
        isMedical: true,
        reason: null,
        extractedText:
          "Medical Summary Report\nPatient: John Doe\nDiagnosis: Viral infection\nMedication: Paracetamol 500mg twice daily\nDoctor: Dr. Amanda Silva\nHospital: Asiri Hospital",
        extractedFields: {
          symptoms: "Fever, headache, fatigue",
          diagnosis: "Viral infection",
          medications: "Paracetamol",
          dosage: "500mg",
          frequency: "Twice daily",
          doctorName: "Dr. Amanda Silva",
          hospital: "Asiri Hospital",
          notes: "Mock AI mode: editable auto-fill values.",
          date: date || new Date().toISOString().slice(0, 10),
        },
      });
    }

    // =========================
    // 🔵 REAL OPENAI MODE
    // =========================

    const mime = file.type;
    const buf = Buffer.from(await file.arrayBuffer());
    const base64 = buf.toString("base64");

    const prompt = `
You are a medical document validator.

Return ONLY valid JSON:
{
  "isMedical": boolean,
  "reason": string | null,
  "extractedText": string | null,
  "extractedFields": {
    "symptoms": string | null,
    "diagnosis": string | null,
    "medications": string | null,
    "dosage": string | null,
    "frequency": string | null,
    "doctorName": string | null,
    "hospital": string | null,
    "notes": string | null,
    "date": string | null
  }
}
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