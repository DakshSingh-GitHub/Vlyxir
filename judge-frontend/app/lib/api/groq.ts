import "server-only";
import Groq from "groq-sdk";
import { CodeAnalysisResult } from "./ai-types";
import { parseAnalysisResult, ANALYSIS_PROMPT } from "./ai-utils";

function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("Missing GROQ_API_KEY. Set it in judge-frontend/.env.local and restart Next.js.");
    }

    return new Groq({ apiKey });
}

export async function analyzeCodeWithGroq(code: string): Promise<CodeAnalysisResult> {
    const groq = getGroqClient();
    const prompt = ANALYSIS_PROMPT + code.trim();

    const completion = await groq.chat.completions.create({
        model: "qwen/qwen3-32b",
        temperature: 0.2,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });

    const content = completion.choices[0]?.message?.content || "";
    return parseAnalysisResult(content);
}



