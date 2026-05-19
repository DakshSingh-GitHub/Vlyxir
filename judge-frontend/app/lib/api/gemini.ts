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

function getResponseSchema(tier: number): any {
    const baseSchema: any = {
      type: "object",
      properties: {
        summary: { type: "string" },
        complexity: {
          type: "object",
          properties: {
            time: { type: "string" },
            space: { type: "string" },
            explanation: { type: "string" }
          },
          required: ["time", "space", "explanation"]
        },
        staticAnalysis: {
          type: "object",
          properties: {
            overview: { type: "string" },
            findings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  detail: { type: "string" },
                  severity: { type: "string" },
                  location: { type: "string" },
                  suggestion: { type: "string" }
                },
                required: ["title", "detail", "severity", "location", "suggestion"]
              }
            }
          },
          required: ["overview", "findings"]
        },
        suggestions: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["summary", "complexity", "staticAnalysis", "suggestions"]
    };

    if (tier >= 3) {
        baseSchema.properties.security = {
          type: "object",
          properties: {
            overview: { type: "string" },
            findings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  detail: { type: "string" },
                  severity: { type: "string" },
                  location: { type: "string" },
                  suggestion: { type: "string" }
                },
                required: ["title", "detail", "severity", "location", "suggestion"]
              }
            }
          },
          required: ["overview", "findings"]
        };
        baseSchema.properties.improvementRoadmap = {
          type: "array",
          items: { type: "string" }
        };
        baseSchema.properties.recommendedCode = { type: "string" };
        baseSchema.properties.whatsChanged = { type: "string" };
        
        baseSchema.required.push("security", "improvementRoadmap", "recommendedCode", "whatsChanged");
    }

    return baseSchema;
}

export async function analyzeCodeWithGemini(code: string, tier: number, modelName?: string): Promise<CodeAnalysisResult> {
    const genAI = getGeminiClient();
    
    // Normalize and prepare fallback models for maximum API compatibility
    let primaryModel = modelName || "gemini-2.5-flash";
    let fallbackModel = "gemini-2.5-flash";

    if (primaryModel === "gemini-3-flash") {
        primaryModel = "gemini-3-flash-preview";
        fallbackModel = "gemini-3-flash";
    } else if (primaryModel === "gemini-3.1-flash-lite") {
        primaryModel = "gemini-3.1-flash-lite-preview";
        fallbackModel = "gemini-3.1-flash-lite";
    }

    const prompt = getAnalysisPrompt(tier) + code.trim();
    const responseSchema = getResponseSchema(tier);

    try {
        const model = genAI.getGenerativeModel({ 
            model: primaryModel,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema
            }
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return parseAnalysisResult(text);
    } catch (error) {
        // Self-healing fallback attempt: if preview or specific model string 404s, try fallback model
        const errorMessage = error instanceof Error ? error.message : "";
        if (primaryModel !== fallbackModel && (errorMessage.includes("404") || errorMessage.includes("not found"))) {
            try {
                console.warn(`Primary model ${primaryModel} failed with 404, attempting fallback model ${fallbackModel}`);
                const model = genAI.getGenerativeModel({ 
                    model: fallbackModel,
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema
                    }
                });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                return parseAnalysisResult(text);
            } catch (fallbackError) {
                console.error("Gemini fallback analysis error:", fallbackError);
            }
        }
        
        console.error("Gemini analysis error:", error);
        throw new Error(error instanceof Error ? error.message : "Gemini analysis failed.");
    }
}
