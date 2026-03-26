"use client";

import { FormEvent, useEffect, useState } from 'react';
import { Zap, Shield, BarChart, BrainCircuit, TriangleAlert, Sparkles, Lock, User, KeyRound } from 'lucide-react';
import CodeEditor from '../../components/Editor/CodeEditor';
import { useAppContext } from '../lib/context';

const DEFAULT_CODE = `def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

# Example:
# print(factorial(5))
`;

type Severity = 'low' | 'medium' | 'high' | 'critical';

interface AnalysisFinding {
    title: string;
    detail: string;
    severity: Severity;
    location?: string;
    suggestion?: string;
}

interface AnalysisResult {
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

export default function CodeAnalysisPage() {
    const { isDark } = useAppContext();
    const [code, setCode] = useState(DEFAULT_CODE);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState<string | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    useEffect(() => {
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const reason = event.reason as { msg?: string; message?: string; type?: string } | undefined;
            const type = (reason?.type || "").toLowerCase();
            const msg = (reason?.msg || reason?.message || "").toLowerCase();
            if (type.includes("cancel") || msg.includes("manually canceled")) {
                event.preventDefault();
            }
        };

        window.addEventListener("unhandledrejection", handleUnhandledRejection);
        return () => {
            window.removeEventListener("unhandledrejection", handleUnhandledRejection);
        };
    }, []);

    useEffect(() => {
        const unlocked = sessionStorage.getItem("code-analysis-unlocked") === "1";
        if (unlocked) {
            setIsAuthorized(true);
        }
        setIsHydrated(true);
    }, []);

    const handleUnlock = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAuthError(null);
        setIsAuthenticating(true);

        try {
            const response = await fetch("/api/code-analysis/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const payload = await response.json();
            if (!response.ok || !payload?.ok) {
                throw new Error(payload?.error || "Access denied.");
            }

            sessionStorage.setItem("code-analysis-unlocked", "1");
            setIsAuthorized(true);
            setPassword("");
        } catch (err) {
            setAuthError(err instanceof Error ? err.message : "Authentication failed.");
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleAnalyze = async () => {
        setError(null);
        setAnalysisResult(null);
        setIsLoading(true);
        try {
            const response = await fetch("/api/code-analysis", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ code })
            });

            const payload = await response.json();

            if (!response.ok || !payload?.ok || !payload?.analysis) {
                throw new Error(payload?.error || "Analysis failed.");
            }

            setAnalysisResult(payload.analysis as AnalysisResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Analysis failed.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isHydrated) {
        return (
            <div className="h-screen w-full bg-gray-50 dark:bg-gray-950" />
        );
    }

    if (!isAuthorized) {
        return (
            <div className="h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[32rem] h-[32rem] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[28rem] h-[28rem] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="z-10 flex-1 flex items-center justify-center">
                    <div className="w-full max-w-lg rounded-3xl border border-white/20 dark:border-gray-800/60 bg-white/75 dark:bg-gray-900/70 backdrop-blur-2xl shadow-2xl p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/25">
                                <Lock className="w-5 h-5 text-indigo-500" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Secure Code Analysis</h1>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
                            Enter your credentials to access the AI analysis workspace.
                        </p>

                        <form onSubmit={handleUnlock} className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5 block">Username</label>
                                <div className="relative">
                                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        autoComplete="username"
                                        required
                                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-950/50 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                                        placeholder="Enter username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5 block">Password</label>
                                <div className="relative">
                                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        required
                                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-950/50 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                                        placeholder="Enter password"
                                    />
                                </div>
                            </div>

                            {authError ? (
                                <div className="rounded-xl border border-rose-300/50 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-900/15 p-3">
                                    <p className="text-sm text-rose-700 dark:text-rose-300">{authError}</p>
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={isAuthenticating}
                                className="w-full mt-2 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isAuthenticating ? "Checking..." : "Unlock Analysis"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-15%] left-[-15%] w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[-15%] right-[-15%] w-80 h-80 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow delay-1000" />

            <div className="w-full z-10 flex flex-col flex-1 min-h-0">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
                    {/* Code Editor Panel */}
                    <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-6 flex flex-col">
                        <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
                            <CodeEditor code={code} setCode={setCode} isDark={isDark} isDisabled={false} />
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            className="w-full mt-6 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                    Analyzing...
                                </div>
                            ) : (
                                "Analyze Code"
                            )}
                        </button>
                    </div>

                    {/* Analysis Results Panel */}
                    <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-6 md:p-8 flex flex-col min-h-0">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 shrink-0">
                            <BrainCircuit className="w-7 h-7 text-indigo-500" />
                            Analysis Report
                        </h2>
                        
                        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
                            {isLoading ? (
                                <div className="space-y-6 animate-pulse">
                                    <div className="h-24 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl" />
                                    <div className="h-24 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl" />
                                    <div className="h-24 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl" />
                                </div>
                            ) : error ? (
                                <div className="rounded-2xl border border-rose-300/50 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-900/15 p-5">
                                    <div className="flex items-start gap-3">
                                        <TriangleAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-base font-semibold text-rose-800 dark:text-rose-300">Analysis failed</p>
                                            <p className="text-base text-rose-700 dark:text-rose-200/90 mt-1">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : analysisResult ? (
                                <div className="space-y-6">
                                    <div className="p-5 rounded-2xl border border-indigo-200/50 dark:border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-900/20">
                                        <p className="text-base font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Summary</p>
                                        <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">{analysisResult.summary}</p>
                                    </div>

                                    <div className="p-5 rounded-2xl border border-purple-200/50 dark:border-purple-500/30 bg-purple-50/60 dark:bg-purple-900/20">
                                        <div className="flex items-center gap-3 mb-4">
                                            <BarChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Complexity Analysis</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                            <MetricPill label="Time" value={analysisResult.complexity.time} />
                                            <MetricPill label="Space" value={analysisResult.complexity.space} />
                                        </div>
                                        <p className="text-base text-gray-700 dark:text-gray-300">{analysisResult.complexity.explanation}</p>
                                    </div>

                                    <AnalysisSection
                                        icon={Zap}
                                        title="Static Analysis"
                                        overview={analysisResult.staticAnalysis.overview}
                                        findings={analysisResult.staticAnalysis.findings}
                                        color="cyan"
                                    />

                                    <AnalysisSection
                                        icon={Shield}
                                        title="Security Vulnerabilities"
                                        overview={analysisResult.security.overview}
                                        findings={analysisResult.security.findings}
                                        color="rose"
                                    />

                                    <div className="p-5 rounded-2xl border border-emerald-200/50 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-900/20">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Suggestions</h3>
                                        </div>
                                        {analysisResult.suggestions.length > 0 ? (
                                            <div className="space-y-2">
                                                {analysisResult.suggestions.map((suggestion, idx) => (
                                                    <p key={idx} className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                                        {idx + 1}. {suggestion}
                                                    </p>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-base text-gray-600 dark:text-gray-300">No additional suggestions.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                                    <BrainCircuit className="w-16 h-16 mb-4 opacity-30" />
                                    <p className="text-xl font-medium">Your analysis report will appear here.</p>
                                    <p className="text-base">Click &#34;Analyze Code&#34; to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


interface MetricPillProps {
    label: string;
    value: string;
}

function MetricPill({ label, value }: MetricPillProps) {
    return (
        <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-white/70 dark:bg-gray-900/40 p-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-base font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</p>
        </div>
    );
}

function severityClasses(severity: Severity) {
    switch (severity) {
        case "critical":
            return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
        case "high":
            return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";
        case "medium":
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
        default:
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    }
}

function AnalysisSection({ icon: Icon, title, overview, findings, color }: AnalysisCardProps) {
    const colorClasses = {
        cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
        rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    };

    return (
        <div className={`p-5 rounded-2xl border ${colorClasses[color]}`}>
            <div className="flex items-center gap-3 mb-3">
                <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[1]}`} />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            </div>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{overview}</p>
            {findings.length > 0 ? (
                <div className="space-y-3">
                    {findings.map((finding, idx) => (
                        <div key={`${finding.title}-${idx}`} className="rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-white/70 dark:bg-gray-900/40 p-4">
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{finding.title}</p>
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${severityClasses(finding.severity)}`}>
                                    {finding.severity}
                                </span>
                            </div>
                            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{finding.detail}</p>
                            {finding.location ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Location: {finding.location}
                                </p>
                            ) : null}
                            {finding.suggestion ? (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    Suggestion: {finding.suggestion}
                                </p>
                            ) : null}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-base text-gray-600 dark:text-gray-300">No major findings.</p>
            )}
        </div>
    );
}

interface AnalysisCardProps {
    icon: React.ElementType;
    title: string;
    overview: string;
    findings: AnalysisFinding[];
    color: 'cyan' | 'rose';
}
