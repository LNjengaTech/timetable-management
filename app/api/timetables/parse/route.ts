import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const maxDuration = 60;

// ── helpers ──────────────────────────────────────────────────────────────────

async function extractFromXlsx(buffer: Buffer): Promise<string> {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const lines: string[] = [];
    workbook.SheetNames.forEach((name) => {
        const ws = workbook.Sheets[name];
        const csv = XLSX.utils.sheet_to_csv(ws);
        lines.push(`[Sheet: ${name}]\n${csv}`);
    });
    return lines.join("\n\n");
}


async function extractFromPdf(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  //directly imported the library logic to bypass the buggy debug mode check
  const pdfParse = require("pdf-parse/lib/pdf-parse.js");
  try {
    //no DOM-matrix needed
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF Parsing failed:", error);
    throw new Error("Failed to parse PDF content.");
  }
}


async function extractFromImageOrScannedPdf(
    buffer: Buffer,
    mimeType: string
): Promise<string> {
    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) throw new Error("OCR_SPACE_API_KEY not set in environment");

    const form = new FormData();
    form.append("language", "eng");
    form.append("isOverlayRequired", "false");
    form.append("detectOrientation", "true");
    form.append("scale", "true");
    form.append("OCREngine", "2"); // Engine 2 is better for tables
    // Cast to Uint8Array so TS accepts it as a valid BlobPart
    form.append(
        "file",
        new Blob([new Uint8Array(buffer)], { type: mimeType }),
        "upload"
    );

    const res = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: { apikey: apiKey },
        body: form,
    });

    if (!res.ok) throw new Error(`OCR.space request failed: ${res.status}`);
    const json: any = await res.json();

    if (json.IsErroredOnProcessing) {
        throw new Error(json.ErrorMessage?.[0] || "OCR failed");
    }

    return (json.ParsedResults ?? [])
        .map((r: any) => r.ParsedText)
        .join("\n");
}

async function structureWithGemini(rawText: string): Promise<any[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set in environment");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a timetable parser. The following is raw text extracted from a student timetable document. 

Convert it into a valid JSON array of class slots. Each object must have exactly these keys:
- subject (string) — course name
- day (string) — one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- time (string) — 24-hour format HH:MM e.g. "09:00"
- location (string) — room or venue, use "TBA" if unknown
- lecturer (string) — instructor name, use "TBA" if unknown

Rules:
- If a class repeats on multiple days, create one entry per day.
- Omit any rows that are clearly not a class (headers, footers, totals).
- Return ONLY a raw JSON array, no markdown fences, no explanation.

Raw text:
---
${rawText.slice(0, 12000)}
---`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip any accidental markdown fences
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    return JSON.parse(cleaned);
}

// ── handler ───────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ message: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const mime = file.type || "";
        const name = file.name.toLowerCase();

        let rawText = "";

        if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
            rawText = await extractFromXlsx(buffer);
        } else if (name.endsWith(".pdf")) {
            // Try native text first; fall back to OCR if empty
            rawText = await extractFromPdf(buffer);
            if (rawText.trim().length < 50) {
                // Scanned PDF — hand to OCR.space
                rawText = await extractFromImageOrScannedPdf(buffer, "application/pdf");
            }
        } else if (mime.startsWith("image/")) {
            rawText = await extractFromImageOrScannedPdf(buffer, mime);
        } else {
            return NextResponse.json(
                { message: "Unsupported file type. Please upload PDF, XLSX, CSV, JPG, or PNG." },
                { status: 415 }
            );
        }

        if (!rawText || rawText.trim().length < 10) {
            return NextResponse.json(
                { message: "Could not extract any text from the file. Is the file empty or corrupted?" },
                { status: 422 }
            );
        }

        const slots = await structureWithGemini(rawText);

        if (!Array.isArray(slots) || slots.length === 0) {
            return NextResponse.json(
                { message: "AI could not find any class slots in this file. Please try manual entry." },
                { status: 422 }
            );
        }

        return NextResponse.json({ slots }, { status: 200 });
    } catch (err: any) {
        console.error("Parse API Error:", err);
        const message = err?.message || "Internal Server Error";
        // Surface config issues clearly
        if (message.includes("API_KEY") || message.includes("api key")) {
            return NextResponse.json({ message: `Missing API key: ${message}` }, { status: 500 });
        }
        return NextResponse.json({ message }, { status: 500 });
    }
}
