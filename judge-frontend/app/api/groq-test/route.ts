import { NextResponse } from "next/server";
import { getGroqChatCompletions } from "@/app/lib/groq";

export async function GET() {
    try {
        const completion = await getGroqChatCompletions();
        return NextResponse.json({
            ok: true,
            message: completion.choices[0]?.message?.content ?? null,
        });
    } catch (error) {
        return NextResponse.json(
            { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
