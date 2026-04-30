import "server-only";
import Groq from "groq-sdk";

export interface AnalysisFinding {
    title: string;
    detail: string;
    severity: "low" | "medium" | "high" | "critical";
    location?: string;
    suggestion?: string;
}

export interface CodeAnalysisResult {
    summary: string;
    complexity: {
        time: string;
        space: string;
        explanation: string;
    };
    staticAnalysis: {
        overview: string;
        findings: AnalysisFinding[];
    };
    security: {
        overview: string;
        findings: AnalysisFinding[];
    };
    suggestions: string[];
}

function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("Missing GROQ_API_KEY. Set it in judge-frontend/.env.local and restart Next.js.");
    }

    return new Groq({ apiKey });
}

function parseAnalysisResult(raw: string): CodeAnalysisResult {
    const trimmed = raw.trim();
    let parsed: unknown;

    try {
        parsed = JSON.parse(trimmed);
    } catch {
        const first = trimmed.indexOf("{");
        const last = trimmed.lastIndexOf("}");
        if (first === -1 || last === -1 || last <= first) {
            throw new Error("AI did not return valid JSON.");
        }
        parsed = JSON.parse(trimmed.slice(first, last + 1));
    }

    const data = parsed as Partial<CodeAnalysisResult>;
    const toSeverity = (value: string | undefined): AnalysisFinding["severity"] => {
        const normalized = (value || "").toLowerCase();
        if (normalized === "critical" || normalized === "high" || normalized === "medium" || normalized === "low") {
            return normalized;
        }
        return "low";
    };

    return {
        summary: data.summary || "Analysis completed.",
        complexity: {
            time: data.complexity?.time || "Unknown",
            space: data.complexity?.space || "Unknown",
            explanation: data.complexity?.explanation || "No explanation provided."
        },
        staticAnalysis: {
            overview: data.staticAnalysis?.overview || "No static analysis overview provided.",
            findings: (data.staticAnalysis?.findings || []).map((f) => ({
                title: f.title || "Finding",
                detail: f.detail || "No details provided.",
                severity: toSeverity(f.severity),
                location: f.location || "",
                suggestion: f.suggestion || ""
            }))
        },
        security: {
            overview: data.security?.overview || "No security overview provided.",
            findings: (data.security?.findings || []).map((f) => ({
                title: f.title || "Finding",
                detail: f.detail || "No details provided.",
                severity: toSeverity(f.severity),
                location: f.location || "",
                suggestion: f.suggestion || ""
            }))
        },
        suggestions: (data.suggestions || []).filter((item): item is string => typeof item === "string")
    };
}

export async function analyzeCodeWithGroq(code: string): Promise<CodeAnalysisResult> {
    const groq = getGroqClient();
    const prompt = `
Return ONLY minified JSON (no markdown) for code review:
{
 "summary":"...",
 "complexity":{"time":"O(?)","space":"O(?)","explanation":"..."},
 "staticAnalysis":{"overview":"...","findings":[{"title":"...","detail":"...","severity":"low|medium|high|critical","location":"","suggestion":""}]},
 "security":{"overview":"...","findings":[{"title":"...","detail":"...","severity":"low|medium|high|critical","location":"","suggestion":""}]},
 "suggestions":["..."]
}
Rules: concise, actionable; infer only from code; use [] for no findings.
Code:
${code.trim()}
`;

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


