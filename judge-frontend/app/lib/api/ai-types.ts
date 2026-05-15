export type Severity = "low" | "medium" | "high" | "critical";

export interface AnalysisFinding {
    title: string;
    detail: string;
    severity: Severity;
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
    improvementRoadmap?: string[];
    recommendedCode?: string;
}

export type AIProvider = "groq" | "gemini";
