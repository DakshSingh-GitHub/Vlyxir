"use client";

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Zap, Shield, BarChart, BrainCircuit, TriangleAlert, Sparkles, Lock, User, KeyRound, ChevronDown, Code2 } from 'lucide-react';
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

interface AnalysisRecord {
    id: string;
    createdAt: string;
    code: string;
    result: AnalysisResult;
}

const ANALYSIS_RECORDS_KEY = "code-analysis-records-v1";
const MAX_ANALYSIS_RECORDS = 25;
const RECORDS_MODAL_ANIMATION_MS = 220;

export default function CodeAnalysisPage() {
    const { isDark, reduceMotion } = useAppContext();
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
    const [records, setRecords] = useState<AnalysisRecord[]>([]);
    const [isRecordsModalOpen, setIsRecordsModalOpen] = useState(false);
    const [isRecordsModalVisible, setIsRecordsModalVisible] = useState(false);
    const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
    const recordsModalCloseTimerRef = useRef<number | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileTab, setMobileTab] = useState<"code" | "analysis">("code");
    const [mobileSwipeDirection, setMobileSwipeDirection] = useState<"left" | "right" | null>(null);
    const codePanelRef = useRef<HTMLDivElement>(null);
    const analysisPanelRef = useRef<HTMLDivElement>(null);

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

        const stored = localStorage.getItem(ANALYSIS_RECORDS_KEY);
        const parsed = parseStoredRecords(stored);
        setRecords(parsed);

        const seededCode = sessionStorage.getItem("code-analysis-code");
        if (seededCode && seededCode.trim().length > 0) {
            setCode(seededCode);
            sessionStorage.removeItem("code-analysis-code");
        }

        setIsHydrated(true);
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 1023px)");
        const updateIsMobile = () => {
            setIsMobile(mediaQuery.matches);
            if (!mediaQuery.matches) {
                setMobileTab("code");
            }
        };

        updateIsMobile();
        mediaQuery.addEventListener("change", updateIsMobile);
        return () => {
            mediaQuery.removeEventListener("change", updateIsMobile);
        };
    }, []);

    useEffect(() => {
        if (!isMobile || reduceMotion || !mobileSwipeDirection) {
            return;
        }

        const target = mobileTab === "code" ? codePanelRef.current : analysisPanelRef.current;
        if (!target) {
            return;
        }

        const fromX = mobileSwipeDirection === "left" ? 36 : -36;
        target.animate(
            [
                { transform: `translateX(${fromX}px)`, opacity: 0.85 },
                { transform: "translateX(0px)", opacity: 1 }
            ],
            {
                duration: 280,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)"
            }
        );
    }, [mobileTab, isMobile, reduceMotion, mobileSwipeDirection]);

    const handleMobileTabChange = (nextTab: "code" | "analysis") => {
        if (nextTab === mobileTab) {
            return;
        }
        setMobileSwipeDirection(nextTab === "analysis" ? "left" : "right");
        setMobileTab(nextTab);
    };

    const openRecordsModal = () => {
        if (recordsModalCloseTimerRef.current) {
            window.clearTimeout(recordsModalCloseTimerRef.current);
            recordsModalCloseTimerRef.current = null;
        }
        setIsRecordsModalOpen(true);
        requestAnimationFrame(() => {
            setIsRecordsModalVisible(true);
        });
    };

    const closeRecordsModal = () => {
        setIsRecordsModalVisible(false);
        if (recordsModalCloseTimerRef.current) {
            window.clearTimeout(recordsModalCloseTimerRef.current);
        }
        recordsModalCloseTimerRef.current = window.setTimeout(() => {
            setIsRecordsModalOpen(false);
            setExpandedRecordId(null);
            recordsModalCloseTimerRef.current = null;
        }, RECORDS_MODAL_ANIMATION_MS);
    };

    useEffect(() => {
        return () => {
            if (recordsModalCloseTimerRef.current) {
                window.clearTimeout(recordsModalCloseTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const handleOpenRecords = () => openRecordsModal();
        window.addEventListener("open-code-analysis-records", handleOpenRecords);
        return () => {
            window.removeEventListener("open-code-analysis-records", handleOpenRecords);
        };
    }, []);

    useEffect(() => {
        if (!isRecordsModalOpen) {
            return;
        }
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeRecordsModal();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isRecordsModalOpen]);

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
        if (isMobile) {
            handleMobileTabChange("analysis");
        }
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

            const nextResult = payload.analysis as AnalysisResult;
            setAnalysisResult(nextResult);
            setRecords((prev) => {
                const nextRecords = [
                    {
                        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        createdAt: new Date().toISOString(),
                        code,
                        result: nextResult
                    },
                    ...prev
                ].slice(0, MAX_ANALYSIS_RECORDS);

                localStorage.setItem(ANALYSIS_RECORDS_KEY, JSON.stringify(nextRecords));
                return nextRecords;
            });
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
                <div className="absolute top-[-20%] left-[-10%] w-lg h-128 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-md h-112 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

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
        <div className="h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 pb-24 sm:pb-28 lg:pb-8 font-sans relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-15%] left-[-15%] w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[-15%] right-[-15%] w-80 h-80 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow delay-1000" />

            <div className="w-full z-10 flex flex-col flex-1 min-h-0">
                 
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
                    {/* Code Editor Panel */}
                    <div ref={codePanelRef} className={`bg-white/70 dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-6 flex-col ${isMobile && mobileTab !== "code" ? "hidden" : "flex"}`}>
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
                    <div ref={analysisPanelRef} className={`bg-white/70 dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-6 md:p-8 flex-col min-h-0 ${isMobile && mobileTab !== "analysis" ? "hidden" : "flex"}`}>
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

                {isMobile ? (
                    <div className="lg:hidden w-full flex-none h-8" />
                ) : null}
            </div>

            {isMobile ? (
                <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-out">
                    <div className="flex items-center gap-4 p-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/10 ring-1 ring-black/5">
                        <button
                            onClick={() => handleMobileTabChange("code")}
                            className={`relative px-4 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-18 ${mobileTab === "code"
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-500/50"
                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/30 dark:hover:bg-gray-800/30"
                                }`}
                        >
                            <Code2 className={`w-5 h-5 ${mobileTab === "code" ? "stroke-[2.5px]" : "stroke-2"}`} />
                            <span className="text-[10px] font-bold tracking-wide">Code</span>
                        </button>
                        <button
                            onClick={() => handleMobileTabChange("analysis")}
                            className={`relative px-4 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-18 ${mobileTab === "analysis"
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-500/50"
                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/30 dark:hover:bg-gray-800/30"
                                }`}
                        >
                            <BrainCircuit className={`w-5 h-5 ${mobileTab === "analysis" ? "stroke-[2.5px]" : "stroke-2"}`} />
                            <span className="text-[10px] font-bold tracking-wide">Analysis</span>
                        </button>
                    </div>
                </div>
            ) : null}

            {isRecordsModalOpen ? (
                <div
                    className={`fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm p-4 sm:p-6 transition-opacity duration-200 ${isRecordsModalVisible ? "opacity-100" : "opacity-0"}`}
                    onClick={closeRecordsModal}
                >
                    <div
                        className={`mx-auto h-full w-full max-w-7xl rounded-3xl border border-white/20 dark:border-gray-800/60 bg-white/95 dark:bg-gray-950/95 shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${isRecordsModalVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]"}`}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Code Analysis Records</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Latest {records.length} saved analyses</p>
                            </div>
                            <button
                                onClick={closeRecordsModal}
                                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
                            {records.length === 0 ? (
                                <div className="h-full flex items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                    <p className="text-base text-gray-600 dark:text-gray-400">No records yet. Run an analysis to save your first record.</p>
                                </div>
                            ) : (
                                records.map((record, index) => (
                                    <article key={record.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-sm">
                                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Record #{records.length - index}</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatRecordTime(record.createdAt)}</p>
                                                <button
                                                    onClick={() => setExpandedRecordId((prev) => prev === record.id ? null : record.id)}
                                                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    title={expandedRecordId === record.id ? "Collapse record" : "Expand record"}
                                                    aria-expanded={expandedRecordId === record.id}
                                                >
                                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedRecordId === record.id ? "rotate-180" : ""}`} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 xl:grid-cols-2 items-start gap-4 p-5">
                                            <section className="h-fit rounded-xl border border-cyan-200/60 dark:border-cyan-700/40 bg-cyan-50/50 dark:bg-cyan-950/20 overflow-hidden">
                                                <div className="px-4 py-2 border-b border-cyan-200/60 dark:border-cyan-700/40">
                                                    <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">Submitted Code</p>
                                                </div>
                                                <pre className="max-h-[420px] overflow-auto p-4 text-[13px] leading-relaxed font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                                                    {record.code}
                                                </pre>
                                            </section>

                                            <section className="rounded-xl border border-indigo-200/60 dark:border-indigo-700/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-3">
                                                <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Analysis Result</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{record.result.summary}</p>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="rounded-lg bg-white/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 px-3 py-2">
                                                        <p className="text-gray-500 dark:text-gray-400">Time</p>
                                                        <p className="font-semibold text-gray-800 dark:text-gray-100">{record.result.complexity.time}</p>
                                                    </div>
                                                    <div className="rounded-lg bg-white/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 px-3 py-2">
                                                        <p className="text-gray-500 dark:text-gray-400">Space</p>
                                                        <p className="font-semibold text-gray-800 dark:text-gray-100">{record.result.complexity.space}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{record.result.complexity.explanation}</p>

                                                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                                    <p>Static findings: {record.result.staticAnalysis.findings.length}</p>
                                                    <p>Security findings: {record.result.security.findings.length}</p>
                                                    <p>Suggestions: {record.result.suggestions.length}</p>
                                                </div>

                                                {expandedRecordId === record.id ? (
                                                    <>
                                                        <div className="rounded-lg border border-cyan-200/60 dark:border-cyan-700/40 bg-white/70 dark:bg-gray-900/60 p-3 space-y-2">
                                                            <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">Static Findings</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{record.result.staticAnalysis.overview}</p>
                                                            {record.result.staticAnalysis.findings.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {record.result.staticAnalysis.findings.map((finding, findingIndex) => (
                                                                        <div key={`static-${record.id}-${findingIndex}`} className="rounded-md border border-cyan-100 dark:border-cyan-900/50 bg-cyan-50/50 dark:bg-cyan-950/20 p-2.5">
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{finding.title}</p>
                                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${severityClasses(finding.severity)}`}>
                                                                                    {finding.severity}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">{finding.detail}</p>
                                                                            {finding.location ? (
                                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Location: {finding.location}</p>
                                                                            ) : null}
                                                                            {finding.suggestion ? (
                                                                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Suggestion: {finding.suggestion}</p>
                                                                            ) : null}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-gray-600 dark:text-gray-400">No static findings.</p>
                                                            )}
                                                        </div>

                                                        <div className="rounded-lg border border-rose-200/60 dark:border-rose-700/40 bg-white/70 dark:bg-gray-900/60 p-3 space-y-2">
                                                            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Security Vulnerabilities</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{record.result.security.overview}</p>
                                                            {record.result.security.findings.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {record.result.security.findings.map((finding, findingIndex) => (
                                                                        <div key={`security-${record.id}-${findingIndex}`} className="rounded-md border border-rose-100 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-2.5">
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{finding.title}</p>
                                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${severityClasses(finding.severity)}`}>
                                                                                    {finding.severity}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">{finding.detail}</p>
                                                                            {finding.location ? (
                                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Location: {finding.location}</p>
                                                                            ) : null}
                                                                            {finding.suggestion ? (
                                                                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Suggestion: {finding.suggestion}</p>
                                                                            ) : null}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-gray-600 dark:text-gray-400">No security findings.</p>
                                                            )}
                                                        </div>

                                                        <div className="rounded-lg border border-emerald-200/60 dark:border-emerald-700/40 bg-white/70 dark:bg-gray-900/60 p-3 space-y-2">
                                                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Suggestions</p>
                                                            {record.result.suggestions.length > 0 ? (
                                                                <div className="space-y-1.5">
                                                                    {record.result.suggestions.map((suggestion, suggestionIndex) => (
                                                                        <p key={`suggestion-${record.id}-${suggestionIndex}`} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                                                            {suggestionIndex + 1}. {suggestion}
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-gray-600 dark:text-gray-400">No suggestions.</p>
                                                            )}
                                                        </div>
                                                    </>
                                                ) : null}
                                            </section>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function parseStoredRecords(raw: string | null): AnalysisRecord[] {
    if (!raw) {
        return [];
    }
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed
            .filter((item) =>
                item
                && typeof item.id === "string"
                && typeof item.createdAt === "string"
                && typeof item.code === "string"
                && item.result
            )
            .slice(0, MAX_ANALYSIS_RECORDS) as AnalysisRecord[];
    } catch {
        return [];
    }
}

function formatRecordTime(isoString: string): string {
    const parsed = new Date(isoString);
    if (Number.isNaN(parsed.getTime())) {
        return "Unknown date";
    }
    return parsed.toLocaleString();
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
