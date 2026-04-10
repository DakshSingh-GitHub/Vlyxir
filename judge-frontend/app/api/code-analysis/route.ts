import { NextResponse } from "next/server";
import { analyzeCodeWithGroq } from "@/app/lib/groq";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        // Extract Authorization header
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
        }
        const authToken = authHeader.replace("Bearer ", "");

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify the session from the token
        const { data: { user }, error: userError } = await supabase.auth.getUser(authToken);
        if (userError || !user) {
            return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
        }

        // Check the user's plan directly from the DB
        const { data: profile } = await supabase
            .from("profiles")
            .select("plan")
            .eq("id", user.id)
            .single();

        if (profile?.plan !== "pro") {
            return NextResponse.json({ ok: false, error: "Pro subscription required." }, { status: 403 });
        }

        const body = await request.json();
        const code = typeof body?.code === "string" ? body.code.trim() : "";

        if (!code) {
            return NextResponse.json(
                { ok: false, error: "Code is required." },
                { status: 400 }
            );
        }

        const analysis = await analyzeCodeWithGroq(code);
        return NextResponse.json({ ok: true, analysis });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                error: error instanceof Error ? error.message : "Failed to analyze code."
            },
            { status: 500 }
        );
    }
}
