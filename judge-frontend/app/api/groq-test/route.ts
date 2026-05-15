import { NextResponse } from "next/server";
import { analyzeCodeWithGroq } from "@/app/lib/api/groq";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get("code") || "def add(a, b):\n    return a + b";
        const tier = parseInt(searchParams.get("tier") || "1");

        const analysis = await analyzeCodeWithGroq(code, tier);
        return NextResponse.json({
            ok: true,
            analysis
        });
    } catch (error) {
        return NextResponse.json(
            { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
