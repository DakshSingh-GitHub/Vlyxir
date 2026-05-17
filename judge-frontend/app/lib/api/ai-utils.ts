import { CodeAnalysisResult, AnalysisFinding } from "./ai-types";

export function parseAnalysisResult(raw: string): CodeAnalysisResult {
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
        try {
            parsed = JSON.parse(trimmed.slice(first, last + 1));
        } catch {
            throw new Error("AI did not return valid JSON structure.");
        }
    }

    const data = parsed as Partial<CodeAnalysisResult>;
    const toSeverity = (value: string | undefined): AnalysisFinding["severity"] => {
        const normalized = (value || "").toLowerCase();
        if (normalized === "critical" || normalized === "high" || normalized === "medium" || normalized === "low") {
            return normalized as AnalysisFinding["severity"];
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
        suggestions: (data.suggestions || []).filter((item): item is string => typeof item === "string"),
        improvementRoadmap: (data.improvementRoadmap || []).filter((item): item is string => typeof item === "string"),
        recommendedCode: data.recommendedCode || ""
    };
}

export function getAnalysisPrompt(tier: number): string {
    let jsonStructure = `{
  "summary":"...",
  "complexity":{"time":"O(?)","space":"O(?)","explanation":"..."},
  "staticAnalysis":{"overview":"...","findings":[{"title":"...","detail":"...","severity":"low|medium|high|critical","location":"","suggestion":""}]}`;

    let tierRules = "";
    if (tier >= 3) {
        jsonStructure += `,
  "security":{"overview":"...","findings":[{"title":"...","detail":"...","severity":"low|medium|high|critical","location":"","suggestion":""}]},
  "improvementRoadmap":["..."],
  "recommendedCode":"..."`;
        tierRules = " For recommendedCode, you MUST always provide the optimized/corrected version of the submitted code. If the code is already optimal and requires no changes, you MUST return the exact message: \"This code is optimized, no need for changes\".";
    }

    jsonStructure += `\n}`;

    return `Return ONLY minified JSON (no markdown) for code review:
${jsonStructure}
Rules: concise, actionable; infer only from code; use [] for no findings.${tierRules}
Code:
`;
}
