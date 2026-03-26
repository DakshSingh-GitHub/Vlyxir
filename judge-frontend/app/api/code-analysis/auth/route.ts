import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const username = typeof body?.username === "string" ? body.username : "";
        const password = typeof body?.password === "string" ? body.password : "";

        const allowedUsername = process.env.CODE_ANALYSIS_USERNAME;
        const allowedPassword = process.env.CODE_ANALYSIS_PASSWORD;

        if (!allowedUsername || !allowedPassword) {
            return NextResponse.json(
                { ok: false, error: "Code analysis auth is not configured." },
                { status: 500 }
            );
        }

        if (username === allowedUsername && password === allowedPassword) {
            return NextResponse.json({ ok: true });
        }

        return NextResponse.json(
            { ok: false, error: "Invalid username or password." },
            { status: 401 }
        );
    } catch {
        return NextResponse.json(
            { ok: false, error: "Invalid request." },
            { status: 400 }
        );
    }
}
