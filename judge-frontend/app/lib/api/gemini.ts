import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CodeAnalysisResult } from "./ai-types";
import { parseAnalysisResult, getAnalysisPrompt } from "./ai-utils";

function getGeminiClient() {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        throw new Error("Missing GOOGLE_API_KEY. Set it in judge-frontend/.env.local and restart Next.js.");
    }

    return new GoogleGenerativeAI(apiKey);
}

export async function analyzeCodeWithGemini(code: string, tier: number): Promise<CodeAnalysisResult> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = getAnalysisPrompt(tier) + code.trim();

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return parseAnalysisResult(text);
    } catch (error) {
        console.error("Gemini analysis error:", error);
        throw new Error(error instanceof Error ? error.message : "Gemini analysis failed.");
    }
}
