/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from 'react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, Shield, BarChart, BrainCircuit, TriangleAlert, Sparkles, Lock, User, KeyRound, ChevronDown, Code2, Construction, Trash2, AlertTriangle, Loader2, RotateCcw } from 'lucide-react';
import CodeEditor from '../../../components/Editor/CodeEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../lib/auth/context';
import { useAuth } from '../../lib/auth/auth-context';
import { supabase } from '../../lib/api/supabase/client';
import { checkForgeLimit, checkAiLimit, recordAiRun } from '../../lib/api/forge-limits';
import LimitFlash from '../../../components/General/LimitFlash';
import LoadingOverlay from '../../../components/General/LoadingOverlay';

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
    improvementRoadmap?: string[];
    recommendedCode?: string;
    whatsChanged?: string;
}

interface AnalysisRecord {
    id: string;
    createdAt: string;
    code: string;
    result: AnalysisResult;
}

const MAX_ANALYSIS_RECORDS = 25;
const RECORDS_MODAL_ANIMATION_MS = 220;

export default function CodeAnalysisPage() {
    const { isDark, reduceMotion, useNewUi, codeAnalysisPath } = useAppContext();
    const pathname = usePathname();
    const router = useRouter();
    const [code, setCode] = useState(DEFAULT_CODE);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const { session, user, isLoading: authLoading } = useAuth();
    const [plan, setPlan] = useState<string | null>(null);
    const [tier, setTier] = useState<number>(0);
    const [isFetchingPlan, setIsFetchingPlan] = useState(true);
    const [isLimitFlashVisible, setIsLimitFlashVisible] = useState(false);
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
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [recordIdToDelete, setRecordIdToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [provider, setProvider] = useState<"groq" | "gemini">("groq");
    const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const modelDropdownRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (useNewUi && pathname === "/code-analysis") {
            router.replace(codeAnalysisPath);
        }
    }, [pathname, router, useNewUi, codeAnalysisPath]);

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

    const userId = user?.id;

    useEffect(() => {
        const fetchRecords = async () => {
            if (!userId) return;
            try {
                const { data, error } = await supabase
                    .from("code_analysis_records")
                    .select("*")
                    .eq("user_id", userId)
                    .order("created_at", { ascending: false })
                    .limit(MAX_ANALYSIS_RECORDS);

                if (data) {
                    const formattedRecords: AnalysisRecord[] = data.map(dbRecord => ({
                        id: dbRecord.id,
                        createdAt: dbRecord.created_at,
                        code: dbRecord.code,
                        result: dbRecord.result as AnalysisResult
                    }));
                    setRecords(formattedRecords);
                }
            } catch (err) {
                console.error("Error fetching analysis records:", err);
            }
        };

        if (userId) {
            fetchRecords();
        }
    }, [userId]);

    useEffect(() => {
        if (authLoading) return;

        // Reset hydration state when userId changes to prevent saving old data to new user key
        setIsHydrated(false);

        const keySuffix = userId ? userId : "guest";
        const seededCodeKey = `code-analysis-code-${keySuffix}`;
        const seededCode = sessionStorage.getItem(seededCodeKey);
        
        if (seededCode && seededCode.trim().length > 0) {
            setCode(seededCode);
            sessionStorage.removeItem(seededCodeKey);
            setIsHydrated(true);
        } else {
            const key = `code-analysis-state-${keySuffix}`;
            const savedStateStr = localStorage.getItem(key);
            if (savedStateStr) {
                try {
                    const savedState = JSON.parse(savedStateStr);
                    if (savedState.code) setCode(savedState.code);
                    else setCode(DEFAULT_CODE);
                    
                    if (savedState.analysisResult !== undefined) setAnalysisResult(savedState.analysisResult);
                    else setAnalysisResult(null);
                    
                    if (savedState.error !== undefined) setError(savedState.error);
                    else setError(null);
                } catch (e) {
                    console.error("Error parsing saved state", e);
                    // On error, reset to defaults
                    setCode(DEFAULT_CODE);
                    setAnalysisResult(null);
                    setError(null);
                }
            } else {
                // No saved state for this user, use defaults
                setCode(DEFAULT_CODE);
                setAnalysisResult(null);
                setError(null);
            }
            setIsHydrated(true);
        }
    }, [userId, authLoading]);

    useEffect(() => {
        if (isHydrated && !authLoading) {
            const keySuffix = userId ? userId : "guest";
            const key = `code-analysis-state-${keySuffix}`;
            localStorage.setItem(key, JSON.stringify({
                code,
                analysisResult,
                error
            }));
        }
    }, [code, analysisResult, error, isHydrated, userId, authLoading]);

    useEffect(() => {
        if (authLoading) return;

        if (!userId) {
            setPlan(null);
            setTier(0);
            setProvider("groq");
            setIsFetchingPlan(false);
            return;
        }

        let mounted = true;
        setIsFetchingPlan(true);

        const fetchPlan = async () => {
            try {
                const details = await checkForgeLimit(userId);
                if (mounted) {
                    setPlan(details.plan);
                    setTier(details.tier);
                    if (details.tier < 3) {
                        setProvider("groq");
                    }
                }
            } catch (err) {
                console.error("Error fetching plan:", err);
                if (mounted) {
                    setPlan("free");
                    setTier(0);
                    setProvider("groq");
                }
            } finally {
                if (mounted) setIsFetchingPlan(false);
            }
        };

        fetchPlan();

        return () => {
            mounted = false;
        };
    }, [userId, authLoading]);

    useEffect(() => {
        if (tier < 3) {
            setProvider("groq");
        }
    }, [tier]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
                setIsModelDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
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
        if (!isRecordsModalOpen && !isDeleteConfirmOpen) {
            return;
        }
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                if (isDeleteConfirmOpen && !isDeleting) {
                    setIsDeleteConfirmOpen(false);
                    setRecordIdToDelete(null);
                } else if (isRecordsModalOpen) {
                    closeRecordsModal();
                }
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isRecordsModalOpen, isDeleteConfirmOpen, isDeleting]);



    const handleAnalyze = async () => {
        setError(null);
        setAnalysisResult(null);
        setIsLoading(true);
        if (isMobile) {
            handleMobileTabChange("analysis");
        }
        
        // 1. Check AI Limit
        if (user) {
            const limitCheck = await checkAiLimit(user.id);
            if (!limitCheck.allowed) {
                setIsLimitFlashVisible(true);
                setIsLoading(false);
                return;
            }
        }

        try {
            const response = await fetch("/api/code-analysis", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {})
                },
                body: JSON.stringify({ code, provider, model: provider === "gemini" ? selectedModel : undefined })
            });

            const payload = await response.json();

            if (!response.ok || !payload?.ok || !payload?.analysis) {
                throw new Error(payload?.error || "Analysis failed.");
            }

            const nextResult = payload.analysis as AnalysisResult;
            setAnalysisResult(nextResult);

            if (user) {
                try {
                    const { data: insertedData, error: insertError } = await supabase
                        .from("code_analysis_records")
                        .insert({
                            user_id: user.id,
                            code,
                            result: nextResult
                        })
                        .select()
                        .single();

                    if (insertedData) {
                        setRecords(prev => [
                            {
                                id: insertedData.id,
                                createdAt: insertedData.created_at,
                                code: insertedData.code,
                                result: insertedData.result as AnalysisResult
                            },
                            ...prev
                        ].slice(0, MAX_ANALYSIS_RECORDS));
                    }
                } catch (err) {
                    console.error("Error saving analysis record:", err);
                }

                // 3. Record AI Run for limits
                await recordAiRun(user.id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Analysis failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteRecord = (id: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setRecordIdToDelete(id);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!user || !recordIdToDelete) return;

        setIsDeleting(true);
        try {
            const { error: deleteError } = await supabase
                .from("code_analysis_records")
                .delete()
                .eq("id", recordIdToDelete)
                .eq("user_id", user.id);

            if (!deleteError) {
                setRecords(prev => prev.filter(r => r.id !== recordIdToDelete));
                if (expandedRecordId === recordIdToDelete) {
                    setExpandedRecordId(null);
                }
                setIsDeleteConfirmOpen(false);
                setRecordIdToDelete(null);
            } else {
                console.error("Error deleting record:", deleteError);
            }
        } catch (err) {
            console.error("Error deleting record:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <AnimatePresence mode="wait">
            {!isMounted || authLoading || isFetchingPlan || !isHydrated ? (
                <LoadingOverlay key="loader" />
            ) : plan !== "pro" || tier < 2 ? (
                <motion.div
                    key="premium-guard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden"
                >
                    <div className="absolute top-[-20%] left-[-10%] w-lg h-128 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-md h-112 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

                    <div className="z-10 flex-1 flex items-center justify-center">
                        <div className="w-full max-w-lg rounded-3xl border border-white/20 dark:border-gray-800/60 bg-white/75 dark:bg-gray-900/70 backdrop-blur-2xl shadow-2xl p-6 sm:p-8 text-center">
                            <div className="flex items-center justify-center mb-6">
                                <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/25">
                                    <Lock className="w-8 h-8 text-indigo-500" />
                                </div>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Premium Feature</h1>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-8">
                                Code Analysis is a premium feature exclusive to Pro Tier 2 and Tier 3 users. Please upgrade your plan to unlock deep AI structural insights, security audits, and more.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => router.push("/upgrade-tiers")}
                                    className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all active:scale-[0.99]"
                                >
                                    View Tiers
                                </button>
                                <button
                                    onClick={() => router.push("/")}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                >
                                    Home
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="main-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-screen w-full flex flex-col p-4 sm:p-6 lg:p-8 pb-24 sm:pb-28 lg:pb-8 font-sans relative overflow-hidden bg-white dark:bg-[#0a0a0a]"
                >
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
                                {tier >= 3 && (
                                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                                        {/* Model Dropdown Selection */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Model:</span>
                                            <div ref={modelDropdownRef} className="relative flex items-center">
                                                <div 
                                                    onClick={() => provider !== "groq" && setIsModelDropdownOpen(!isModelDropdownOpen)}
                                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all duration-300 ${
                                                        provider === "groq"
                                                            ? isDark
                                                                ? "bg-slate-900/40 border-slate-800/50 text-slate-500"
                                                                : "bg-gray-50 border-gray-150 text-gray-400"
                                                            : isDark 
                                                                ? "bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 text-indigo-400 cursor-pointer select-none" 
                                                                : "bg-gray-50 border-gray-200 hover:border-gray-300 text-indigo-650 cursor-pointer select-none"
                                                    }`}
                                                >
                                                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                        {provider === "groq" ? "None" : (selectedModel === "gemini-2.5-flash" ? "Gemini 2.5" : selectedModel === "gemini-3-flash" ? "Gemini 3" : "Gemini 3.1 Flash Lite")}
                                                        {provider !== "groq" && <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isModelDropdownOpen ? "rotate-180" : ""}`} />}
                                                    </span>
                                                </div>

                                                <AnimatePresence>
                                                    {isModelDropdownOpen && provider !== "groq" && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                            transition={{ duration: 0.15 }}
                                                            className={`absolute bottom-full mb-2 left-0 z-[100] w-48 rounded-xl border shadow-xl backdrop-blur-2xl p-1 flex flex-col gap-0.5 ${
                                                                isDark 
                                                                    ? "bg-slate-900/95 border-slate-700/70 shadow-black/40 text-slate-100" 
                                                                    : "bg-white/95 border-slate-200 shadow-slate-200/50 text-slate-900"
                                                            }`}
                                                        >
                                                            {[
                                                                { label: "Gemini 2.5", value: "gemini-2.5-flash" },
                                                                { label: "Gemini 3", value: "gemini-3-flash" },
                                                                { label: "Gemini 3.1 Flash Lite", value: "gemini-3.1-flash-lite" }
                                                            ].map((opt) => (
                                                                <button
                                                                    key={opt.value}
                                                                    onClick={() => {
                                                                        setSelectedModel(opt.value);
                                                                        setIsModelDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full px-3 py-2 rounded-lg text-left text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                                                                        selectedModel === opt.value
                                                                            ? isDark
                                                                                ? "bg-indigo-500/20 text-indigo-400"
                                                                                : "bg-indigo-50 text-indigo-600"
                                                                            : isDark
                                                                                ? "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                                                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                                    }`}
                                                                >
                                                                    {opt.label}
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        {/* Provider Selection */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Provider:</span>
                                            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                                <button
                                                    onClick={() => setProvider("groq")}
                                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${provider === "groq"
                                                            ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                        }`}
                                                >
                                                    Groq
                                                </button>
                                                <button
                                                    onClick={() => setProvider("gemini")}
                                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${provider === "gemini"
                                                            ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                        }`}
                                                >
                                                    Gemini
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isLoading}
                                    className="w-full mt-4 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
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

                                    {tier >= 3 && (
                                        <>
                                            <AnalysisSection
                                                icon={Shield}
                                                title="Security Vulnerabilities"
                                                overview={analysisResult.security.overview}
                                                findings={analysisResult.security.findings}
                                                color="rose"
                                            />

                                            <div className="p-5 rounded-2xl border border-blue-200/50 dark:border-blue-500/30 bg-blue-50/60 dark:bg-blue-900/20">
                                                <div className="flex items-center justify-between gap-3 mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recommended Code</h3>
                                                    </div>
                                                    {analysisResult.recommendedCode && analysisResult.recommendedCode !== "This code is optimized, no need for changes" && (
                                                        <button
                                                            onClick={() => setCode(analysisResult.recommendedCode || "")}
                                                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all active:scale-95"
                                                        >
                                                            Apply to editor
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="rounded-xl overflow-hidden border border-blue-200 dark:border-blue-800 shadow-sm">
                                                    <pre className="p-4 text-sm font-mono text-gray-800 dark:text-gray-200 bg-white/50 dark:bg-gray-950/50 overflow-x-auto custom-scrollbar">
                                                        {analysisResult.recommendedCode || "This code is optimized, no need for changes"}
                                                    </pre>
                                                </div>
                                            </div>

                                            {tier >= 3 && analysisResult.whatsChanged && (
                                                <div className="p-5 rounded-2xl border border-blue-200/50 dark:border-blue-500/30 bg-blue-50/60 dark:bg-blue-900/20">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">What's Changed?</h3>
                                                    </div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                                                        {analysisResult.whatsChanged}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="p-5 rounded-2xl border border-emerald-200/50 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-900/20">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Construction className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Improvement Roadmap</h3>
                                                </div>
                                                {analysisResult.improvementRoadmap && analysisResult.improvementRoadmap.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {analysisResult.improvementRoadmap.map((step, idx) => (
                                                            <div key={idx} className="flex gap-3">
                                                                <span className="flex-none w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                                                                    {idx + 1}
                                                                </span>
                                                                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                                                    {step}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-base text-gray-600 dark:text-gray-300">No roadmap steps provided.</p>
                                                )}
                                            </div>
                                        </>
                                    )}
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
                    className={`fixed inset-0 z-70 bg-black/50 backdrop-blur-sm p-4 sm:p-6 transition-opacity duration-200 ${isRecordsModalVisible ? "opacity-100" : "opacity-0"}`}
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
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setCode(record.code);
                                                            setAnalysisResult(record.result);
                                                            closeRecordsModal();
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-md border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                                        title="Refill submission"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        <span>Refill submission</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteRecord(record.id, e)}
                                                        className="inline-flex items-center gap-1 rounded-md border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 px-2 py-1 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                                                        title="Delete record"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
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
                                        </div>
                                        <div className="grid grid-cols-1 xl:grid-cols-2 items-start gap-4 p-5">
                                            <div className="flex flex-col gap-4">
                                                <section className="h-fit rounded-xl border border-cyan-200/60 dark:border-cyan-700/40 bg-cyan-50/50 dark:bg-cyan-950/20 overflow-hidden">
                                                    <div className="px-4 py-2 border-b border-cyan-200/60 dark:border-cyan-700/40">
                                                        <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">Submitted Code</p>
                                                    </div>
                                                    <pre className="max-h-105 overflow-auto p-4 text-[13px] leading-relaxed font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap wrap-break-word">
                                                        {record.code}
                                                    </pre>
                                                </section>

                                                {expandedRecordId === record.id && tier >= 3 && (
                                                    <>
                                                        <section className="h-fit rounded-xl border border-blue-200/60 dark:border-blue-700/40 bg-blue-50/50 dark:bg-blue-950/20 overflow-hidden">
                                                            <div className="px-4 py-2 border-b border-blue-200/60 dark:border-blue-700/40">
                                                                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Recommended Code</p>
                                                            </div>
                                                            <pre className="max-h-105 overflow-auto p-4 text-[13px] leading-relaxed font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap wrap-break-word">
                                                                {record.result.recommendedCode || "This code is optimized, no need for changes"}
                                                            </pre>
                                                        </section>

                                                        {record.result.whatsChanged && (
                                                            <section className="h-fit rounded-xl border border-indigo-200/60 dark:border-indigo-700/40 bg-indigo-50/50 dark:bg-indigo-950/20 overflow-hidden">
                                                                <div className="px-4 py-2 border-b border-indigo-200/60 dark:border-indigo-700/40">
                                                                    <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">What's Changed?</p>
                                                                </div>
                                                                <div className="p-4 text-[13px] leading-relaxed text-gray-800 dark:text-gray-200">
                                                                    {record.result.whatsChanged}
                                                                </div>
                                                            </section>
                                                        )}
                                                    </>
                                                )}
                                            </div>

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
                                                    {tier >= 3 && <p>Security findings: {record.result.security.findings.length}</p>}
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

                                                        {tier >= 3 && (
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
                                                        )}

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
                </motion.div>
            )}
            </AnimatePresence>
            {isDeleteConfirmOpen ? (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => !isDeleting && setIsDeleteConfirmOpen(false)}
                    onKeyDown={(e) => e.key === 'Escape' && !isDeleting && setIsDeleteConfirmOpen(false)}
                    tabIndex={-1}
                >
                    <div
                        className="w-full max-w-md rounded-3xl border border-white/20 dark:border-gray-800/60 bg-white dark:bg-gray-950 shadow-2xl p-8 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-center mb-6">
                            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/25">
                                <AlertTriangle className="w-8 h-8 text-rose-500" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Delete Record?</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                            This action cannot be undone. This will permanently delete this analysis record from your history.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteConfirmOpen(false);
                                    setRecordIdToDelete(null);
                                }}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3 rounded-xl bg-rose-600 text-white font-semibold shadow-lg shadow-rose-600/20 hover:bg-rose-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            <LimitFlash 
                isVisible={isLimitFlashVisible} 
                onClose={() => setIsLimitFlashVisible(false)} 
                message="You've reached your daily AI Insight limit. Please check back tomorrow or upgrade for higher quotas."
            />
        </>
    );
}

function parseStoredRecords(raw: string | null): AnalysisRecord[] {
    return [];
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
