"use client";

import { FormEvent, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { anime } from '../../lib/anime';
import { Zap, Shield, BarChart, BrainCircuit, TriangleAlert, Sparkles, Lock, User, KeyRound, ChevronDown, Code2, Loader2, X, History, Terminal, Cpu, Construction, Trash2, AlertTriangle } from 'lucide-react';
import CodeEditor from '../../../components/Editor/CodeEditor';
import { useAppContext } from '../../lib/context';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase/client';

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

const MAX_ANALYSIS_RECORDS = 25;
const RECORDS_MODAL_ANIMATION_MS = 220;

export default function CodeAnalysisPage() {
    const { isDark, reduceMotion, TITLE, useNewUi, codeAnalysisPath } = useAppContext();
    const pathname = usePathname();
    const router = useRouter();
    const [code, setCode] = useState(DEFAULT_CODE);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { session, user, isLoading: authLoading } = useAuth();
    const [plan, setPlan] = useState<string | null>(null);
    const [isFetchingPlan, setIsFetchingPlan] = useState(true);
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

    const loaderTitleRef = useRef<HTMLDivElement>(null);
    const loaderBarRef = useRef<HTMLDivElement>(null);

    const shellClass = isDark
        ? "flex-1 flex flex-col min-h-0 bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] text-slate-100 relative overflow-hidden font-sans selection:bg-slate-300/30"
        : "flex-1 flex flex-col min-h-0 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900 relative overflow-hidden font-sans selection:bg-indigo-500/20";
    const shellBaseClass = isDark
        ? "bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] text-slate-100"
        : "bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900";
    const ambientClass = isDark
        ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(51,65,85,0.32),transparent_38%),linear-gradient(135deg,rgba(2,6,23,0.18),transparent_35%,rgba(15,23,42,0.3)_100%)]"
        : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.6),transparent_35%,rgba(224,231,255,0.85)_100%)]";
    const glowLeftClass = isDark ? "bg-indigo-900/20" : "bg-indigo-200/60";
    const glowRightClass = isDark ? "bg-purple-900/20" : "bg-purple-200/60";
    const glowCenterClass = isDark ? "bg-slate-700/10" : "bg-slate-200/70";
    const surfaceClass = isDark
        ? "border-slate-700/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.97),rgba(10,15,26,0.95))] shadow-[0_18px_48px_rgba(2,6,23,0.35)]"
        : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] shadow-[0_18px_48px_rgba(15,23,42,0.12)]";
    const panelSurfaceClass = isDark
        ? "border-slate-700/70 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(24,33,50,0.9))] shadow-[0_18px_48px_rgba(2,6,23,0.32)]"
        : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] shadow-[0_18px_48px_rgba(15,23,42,0.08)]";
    const panelHeaderClass = isDark
        ? "px-6 py-4 border-b border-slate-700/70 flex items-center justify-between bg-slate-900/40"
        : "px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70";
    const titleClass = isDark ? "text-white" : "text-slate-900";
    const mutedClass = isDark ? "text-slate-400" : "text-slate-500";
    const lighterMutedClass = isDark ? "text-slate-500" : "text-slate-600";
    const pillBarClass = isDark ? "bg-slate-700" : "bg-slate-200";
    const pillTrackClass = isDark
        ? "flex items-center gap-2 p-1.5 rounded-full bg-[linear-gradient(135deg,rgba(8,12,20,0.98),rgba(15,23,42,0.92))] backdrop-blur-3xl border border-slate-700/70 shadow-[0_18px_42px_rgba(2,6,23,0.35)]"
        : "flex items-center gap-2 p-1.5 rounded-full bg-white/90 backdrop-blur-3xl border border-slate-200 shadow-[0_18px_42px_rgba(15,23,42,0.12)]";
    const pillActiveClass = isDark
        ? "bg-slate-800/70 text-white"
        : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-500/50";
    const pillIdleClass = isDark
        ? "text-slate-400 hover:bg-slate-800/60"
        : "text-slate-500 hover:bg-slate-100";
    const modalBackdropClass = isDark ? "bg-black/60" : "bg-black/40";
    const recordsModalClass = isDark
        ? "relative z-10 w-full max-w-7xl h-full flex flex-col rounded-[2.5rem] border border-slate-700/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(10,15,26,0.96))] backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300"
        : "relative z-10 w-full max-w-7xl h-full flex flex-col rounded-[2.5rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] backdrop-blur-2xl shadow-[0_32px_64px_rgba(15,23,42,0.14)] overflow-hidden transition-all duration-300";
    const recordsHeaderClass = isDark
        ? "px-8 py-6 border-b border-slate-700/70 flex items-center justify-between bg-slate-900/40 shrink-0"
        : "px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0";
    const recordsBodyClass = isDark
        ? "flex-1 min-h-0 overflow-y-auto p-6 lg:p-8 space-y-6 custom-scrollbar"
        : "flex-1 min-h-0 overflow-y-auto p-6 lg:p-8 space-y-6 custom-scrollbar";
    const recordsEmptyClass = isDark
        ? "h-full flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-800/50 bg-slate-900/20 opacity-40"
        : "h-full flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/70 opacity-60";
    const recordCardClass = isDark
        ? "group relative rounded-[2rem] border border-slate-700/50 bg-slate-900/40 overflow-hidden hover:border-slate-500/50 transition-all duration-300"
        : "group relative rounded-[2rem] border border-slate-200 bg-white/90 overflow-hidden hover:border-indigo-300/70 transition-all duration-300 shadow-[0_12px_30px_rgba(15,23,42,0.06)]";
    const recordHeaderClass = isDark
        ? "px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/20"
        : "px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70";
    const recordTextClass = isDark ? "text-slate-300" : "text-slate-700";
    const recordMutedClass = isDark ? "text-slate-400" : "text-slate-500";
    const recordCodeClass = isDark
        ? "h-fit rounded-2xl border border-slate-700/50 bg-slate-950/50 overflow-hidden shadow-inner"
        : "h-fit rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-inner";
    const recordCodePreClass = isDark
        ? "max-h-[320px] overflow-auto p-5 text-xs leading-relaxed font-mono text-slate-300 whitespace-pre-wrap break-words custom-scrollbar"
        : "max-h-[320px] overflow-auto p-5 text-xs leading-relaxed font-mono text-slate-700 whitespace-pre-wrap break-words custom-scrollbar";
    const insightCardClass = isDark
        ? "p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5"
        : "p-5 rounded-2xl border border-indigo-200 bg-indigo-50/70";
    const analysisSummaryTextClass = isDark ? "text-xs text-slate-300 leading-relaxed font-medium" : "text-xs text-slate-700 leading-relaxed font-medium";
    const analysisEmptyTextClass = isDark ? "text-xs text-slate-400" : "text-xs text-slate-600";

    useEffect(() => {
        if (!useNewUi && pathname === "/code-analysis-mde") {
            router.replace(codeAnalysisPath);
        }
    }, [pathname, router, useNewUi, codeAnalysisPath]);

    useEffect(() => {
        setIsMounted(true);
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
        if (!isMounted && loaderTitleRef.current && loaderBarRef.current) {
            anime({
                targets: loaderTitleRef.current,
                scale: [0.8, 1],
                opacity: [0, 1],
                duration: 500,
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutQuad'
            });

            anime({
                targets: loaderBarRef.current,
                translateX: ['-100%', '100%'],
                duration: 1500,
                loop: true,
                easing: 'linear'
            });
        }
    }, [isMounted]);

    useEffect(() => {
        const fetchRecords = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from("code_analysis_records")
                    .select("*")
                    .eq("user_id", user.id)
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

        if (user) {
            fetchRecords();
        }

        const seededCode = sessionStorage.getItem("code-analysis-code");
        if (seededCode && seededCode.trim().length > 0) {
            setCode(seededCode);
            sessionStorage.removeItem("code-analysis-code");
        }

        setIsHydrated(true);
    }, [user]);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setPlan(null);
            setIsFetchingPlan(false);
            return;
        }

        let mounted = true;
        setIsFetchingPlan(true);

        const fetchPlan = async () => {
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("plan")
                    .eq("id", user.id)
                    .single();

                if (mounted) {
                    if (data && data.plan) {
                        setPlan(data.plan);
                    } else {
                        setPlan("free");
                    }
                }
            } catch (err) {
                console.error("Error fetching plan:", err);
                if (mounted) setPlan("free");
            } finally {
                if (mounted) setIsFetchingPlan(false);
            }
        };

        fetchPlan();

        return () => {
            mounted = false;
        };
    }, [user, authLoading]);

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
        try {
            const response = await fetch("/api/code-analysis", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {})
                },
                body: JSON.stringify({ code })
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

    if (!isHydrated || authLoading || isFetchingPlan) {
        return (
            <div className={shellBaseClass} />
        );
    }

    if (plan !== "pro") {
        return (
            <div className={shellClass}>
                <div className={ambientClass} />
                <div className={`pointer-events-none absolute left-[-8%] top-[12%] h-72 w-72 rounded-full blur-[130px] ${glowLeftClass}`} />
                <div className={`pointer-events-none absolute bottom-[-6%] right-[-5%] h-80 w-80 rounded-full blur-[150px] ${glowRightClass}`} />

                <div className="relative z-10 flex-1 flex items-center justify-center p-4">
                    <div className={`w-full max-w-md rounded-[2.5rem] border backdrop-blur-2xl p-8 text-center ${surfaceClass}`}>
                        <div className="flex items-center justify-center mb-6">
                            <div className={`p-4 rounded-2xl border ${isDark ? "bg-indigo-500/10 border-indigo-500/20" : "bg-indigo-50 border-indigo-100"}`}>
                                <Construction className="w-8 h-8 text-indigo-400" />
                            </div>
                        </div>
                        <h1 className={`text-2xl font-black tracking-tight mb-3 ${titleClass}`}>Feature Under Development</h1>
                        <p className={`text-sm leading-relaxed mb-8 ${mutedClass}`}>
                            Code Analysis is currently under development and works exclusively for Pro users. Please upgrade your plan to unlock AI-powered analysis, performance insights, and more.
                        </p>
                        <button
                            onClick={() => router.push("/")}
                            className="w-full py-4 rounded-2xl bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_12px_24px_rgba(79,70,229,0.3)] hover:brightness-110 active:scale-[0.98] transition-all"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={shellClass}>
            <div className={ambientClass} />
            <div className={`pointer-events-none absolute left-[-8%] top-[12%] h-72 w-72 rounded-full blur-[130px] ${glowLeftClass}`} />
            <div className={`pointer-events-none absolute bottom-[-6%] right-[-5%] h-80 w-80 rounded-full blur-[150px] ${glowRightClass}`} />
            <div className={`pointer-events-none absolute left-[35%] top-[22%] h-56 w-56 rounded-full blur-[140px] ${glowCenterClass}`} />

            {!isMounted ? (
                <div className={`flex-1 flex flex-col items-center justify-center z-50 ${isDark ? "bg-slate-950/70" : "bg-white/80"}`}>
                    <div
                        ref={loaderTitleRef}
                        className={`text-2xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r ${isDark ? "from-white via-slate-300 to-slate-500" : "from-slate-900 via-slate-700 to-slate-500"}`}
                    >
                        {typeof TITLE === 'string' ? TITLE : "Code Judge"} Analysis
                    </div>
                    <div className={`h-1 rounded-full mt-4 overflow-hidden w-48 ${isDark ? "bg-slate-700" : "bg-slate-200"}`}>
                        <div ref={loaderBarRef} className={`w-full h-full ${isDark ? "bg-white/30" : "bg-indigo-500/30"}`} />
                    </div>
                </div>
            ) : (
                <>
                    <div className={`relative z-10 flex-1 flex flex-col p-4 md:p-6 lg:p-8 xl:p-10 ${isMobile && mobileTab === "analysis" ? "pb-20" : "pb-20"} md:pb-20 lg:pb-8 xl:pb-10 w-full min-h-0 h-full overflow-hidden`}>
                        <div className="lg:hidden flex flex-col gap-1 px-2 mb-4 shrink-0">
                            <h1 className={`text-2xl font-black tracking-tighter leading-none ${isDark ? "text-white" : "text-slate-900"}`}>
                                Code <span className={isDark ? "text-indigo-400" : "text-indigo-600"}>Analysis</span>
                            </h1>
                            <p className={`text-[10px] font-bold uppercase tracking-[0.25em] ${mutedClass}`}>AI-Powered Insights</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 flex-1 min-h-0">
                            {/* Code Editor Panel */}
                            <div
                                ref={codePanelRef}
                                className={`h-full min-h-0 flex-col rounded-[2.5rem] border backdrop-blur-2xl overflow-hidden ${panelSurfaceClass} ${isMobile && mobileTab !== "code" ? "hidden" : "flex"}`}
                            >
                                <div className={panelHeaderClass}>
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-1.5">
                                            <div className={`w-2.5 h-2.5 rounded-full ${isDark ? "bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.3)]" : "bg-rose-400 shadow-sm"}`} />
                                            <div className={`w-2.5 h-2.5 rounded-full ${isDark ? "bg-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "bg-amber-400 shadow-sm"}`} />
                                            <div className={`w-2.5 h-2.5 rounded-full ${isDark ? "bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-emerald-400 shadow-sm"}`} />
                                        </div>
                                        <div className={`h-4 w-px ${isDark ? "bg-slate-700/70" : "bg-slate-200"}`} />
                                        <div className="flex items-center gap-2">
                                            <Code2 className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${mutedClass}`}>Source Analysis</span>
                                        </div>
                                    </div>
                                    <div className="hidden lg:flex items-center gap-2">
                                        <div className={`p-1 px-2 rounded-md text-[10px] font-black border uppercase tracking-wider ${isDark ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}>PRO</div>
                                        <span className={`text-xs font-bold tracking-tight ${isDark ? "text-slate-300" : "text-slate-500"}`}>AI Inspector</span>
                                    </div>
                                </div>

                                <div className="flex-1 relative min-h-0">
                                    <CodeEditor
                                        code={code}
                                        setCode={setCode}
                                        isDisabled={isLoading}
                                        isDark={isDark}
                                    />
                                </div>

                                <div className={`p-6 border-t ${isDark ? "border-slate-700/70 bg-slate-900/40" : "border-slate-100 bg-slate-50/70"}`}>
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isLoading}
                                        className={`w-full group relative py-4 rounded-[1.25rem] transition-all duration-300 shadow-[0_8px_24px_rgba(79,70,229,0.22)] overflow-hidden active:scale-[0.98] ${isLoading
                                            ? isDark
                                                ? "bg-slate-800 text-slate-500"
                                                : "bg-slate-100 text-slate-400"
                                            : "bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] text-white hover:brightness-110"
                                            }`}
                                    >
                                        <div className="relative z-10 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.25em]">
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Inspecting Code...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4 fill-current animate-pulse" />
                                                    <span>Analyze with AI</span>
                                                </>
                                            )}
                                        </div>
                                        {!isLoading && (
                                            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Analysis Results Panel */}
                            <div
                                ref={analysisPanelRef}
                                className={`h-full min-h-0 flex-col rounded-[2.5rem] border backdrop-blur-2xl overflow-hidden transition-all duration-300 hover:shadow-indigo-500/10 ${panelSurfaceClass} ${isMobile && mobileTab !== "analysis" ? "hidden" : "flex"}`}
                            >
                                <div className={panelHeaderClass}>
                                    <div className="flex items-center gap-2">
                                        <BrainCircuit className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                                        <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] ${mutedClass}`}>Intelligence Sink</h2>
                                    </div>
                                    <div className="flex items-center gap-2 font-mono text-[10px] opacity-50">
                                        <span className="text-emerald-500">➜</span>
                                        <span className={`uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>Analysis Ready</span>
                                    </div>
                                </div>

                                <div className={`flex-1 p-6 lg:p-8 relative flex flex-col min-h-0 overflow-y-auto custom-scrollbar ${isDark ? "bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.05),transparent_70%)]" : "bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.06),transparent_70%)]"}`}>
                                    {isLoading ? (
                                        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                                            <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_20px_rgba(99,102,241,0.2)]" />
                                            <div className="text-center space-y-2">
                                                <p className={`text-[10px] font-black uppercase tracking-[0.4em] animate-pulse ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>Deep Inspection</p>
                                                <p className={`text-xs font-medium tracking-tight ${mutedClass}`}>AI is identifying patterns and complexities...</p>
                                            </div>
                                        </div>
                                    ) : error ? (
                                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-4 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                                                <TriangleAlert className="w-8 h-8 text-rose-400" />
                                            </div>
                                            <h3 className={`text-xl font-black mb-2 ${titleClass}`}>Analysis Failed</h3>
                                            <p className={`text-sm leading-relaxed max-w-xs ${mutedClass}`}>{error}</p>
                                            <button onClick={handleAnalyze} className={`mt-6 px-6 py-2 rounded-full border text-xs font-black uppercase tracking-widest transition-colors ${isDark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"}`}>Retry Analysis</button>
                                        </div>
                                    ) : analysisResult ? (
                                        <div className="space-y-8 pb-4">
                                            <div className={`relative p-6 rounded-[1.75rem] border ${isDark ? "border-indigo-500/20 bg-indigo-500/5 shadow-[inset_0_0_30px_rgba(99,102,241,0.05)]" : "border-indigo-200 bg-indigo-50/70"}`}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Sparkles className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>Summary Overview</p>
                                                </div>
                                                <p className={`text-sm leading-relaxed font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>{analysisResult.summary}</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <BarChart className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                                                    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${mutedClass}`}>Computational Complexity</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <MetricPill label="Time" value={analysisResult.complexity.time} isDark={isDark} />
                                                    <MetricPill label="Space" value={analysisResult.complexity.space} isDark={isDark} />
                                                </div>
                                                <p className={`text-xs leading-relaxed font-medium p-4 rounded-2xl border ${isDark ? "text-slate-400 bg-slate-900/30 border-slate-800/50" : "text-slate-600 bg-slate-50 border-slate-200"}`}>
                                                    {analysisResult.complexity.explanation}
                                                </p>
                                            </div>

                                            <AnalysisSection
                                                icon={Zap}
                                                title="Static Analysis"
                                                overview={analysisResult.staticAnalysis.overview}
                                                findings={analysisResult.staticAnalysis.findings}
                                                color="cyan"
                                                isDark={isDark}
                                            />

                                            <AnalysisSection
                                                icon={Shield}
                                                title="Security Audit"
                                                overview={analysisResult.security.overview}
                                                findings={analysisResult.security.findings}
                                                color="rose"
                                                isDark={isDark}
                                            />

                                            <div className={`p-6 rounded-[1.75rem] border ${isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50/70"}`}>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Sparkles className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                                                    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>Improvement Roadmap</h3>
                                                </div>
                                                <div className="space-y-3">
                                                    {analysisResult.suggestions.map((suggestion, idx) => (
                                                        <div key={idx} className={`flex gap-3 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                                            <span className="flex-none w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] border border-emerald-500/20">{idx + 1}</span>
                                                            <p className="leading-relaxed">{suggestion}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border ${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-slate-100 border-slate-200"}`}>
                                                <Terminal className={`w-8 h-8 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                                            </div>
                                            <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 ${mutedClass}`}>Awaiting Stream</p>
                                            <p className={`text-xs max-w-[180px] ${lighterMutedClass}`}>AI insights will materialize once you start analysis.</p>
                                        </div>
                                    )}
                                </div>

                                <div className={`px-6 py-4 border-t flex items-center justify-between shrink-0 ${isDark ? "border-slate-700/70 bg-slate-900/40" : "border-slate-100 bg-slate-50/70"}`}>
                                    <div className="flex items-center gap-2 font-mono text-[10px] opacity-50">
                                        <Cpu className="w-3 h-3" />
                                        <span className={`uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>Neural Runtime V4</span>
                                    </div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>UTF-8</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isMobile && (
                        <div className="fixed bottom-6 left-1/2 z-50 transition-all duration-300 ease-out translate-x-[-50%]">
                            <div className={pillTrackClass}>
                                <button
                                    onClick={() => handleMobileTabChange("code")}
                                    className={`relative px-4 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-16 ${mobileTab === "code"
                                        ? pillActiveClass
                                        : pillIdleClass
                                        }`}
                                >
                                    <Code2 className={`w-5 h-5 ${mobileTab === "code" ? "stroke-[2.5px]" : "stroke-2"}`} />
                                    <span className="text-[10px] font-bold tracking-wide">Code</span>
                                </button>
                                <button
                                    onClick={() => handleMobileTabChange("analysis")}
                                    className={`relative px-4 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-16 ${mobileTab === "analysis"
                                        ? pillActiveClass
                                        : pillIdleClass
                                        }`}
                                >
                                    <BrainCircuit className={`w-5 h-5 ${mobileTab === "analysis" ? "stroke-[2.5px]" : "stroke-2"}`} />
                                    <span className="text-[10px] font-bold tracking-wide">Insights</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {isRecordsModalOpen && (
                        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 lg:p-10">
                            <button
                                onClick={closeRecordsModal}
                                className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ${modalBackdropClass} ${isRecordsModalVisible ? "opacity-100" : "opacity-0"}`}
                                aria-label="Close records"
                            />
                            <div className={`${recordsModalClass} ${isRecordsModalVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}>
                                <div className={recordsHeaderClass}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl border ${isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-100 text-indigo-600"}`}>
                                            <History className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className={`text-2xl font-black tracking-tight ${titleClass}`}>Analysis Vault</h3>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${mutedClass}`}>Latest {records.length} Cached Inspections</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeRecordsModal}
                                        className={`p-2.5 rounded-full border transition-all active:scale-95 ${isDark ? "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-500" : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"}`}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className={recordsBodyClass}>
                                    {records.length === 0 ? (
                                        <div className={recordsEmptyClass}>
                                            <History className={`w-16 h-16 mb-4 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
                                            <p className={`text-sm font-bold uppercase tracking-widest ${mutedClass}`}>Archive Empty</p>
                                        </div>
                                    ) : (
                                        records.map((record, index) => (
                                            <article key={record.id} className={recordCardClass}>
                                                <div className={recordHeaderClass}>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${isDark ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" : "text-indigo-600 bg-indigo-50 border-indigo-100"}`}>IDX #{records.length - index}</span>
                                                        <div className={`h-3 w-px ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
                                                        <p className={`text-xs font-bold tracking-tight uppercase ${recordMutedClass}`}>{formatRecordTime(record.createdAt)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => handleDeleteRecord(record.id, e)}
                                                            className={`flex items-center justify-center p-1.5 rounded-full border transition-all active:scale-95 ${isDark ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20" : "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100"}`}
                                                            title="Delete record"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setExpandedRecordId((prev) => prev === record.id ? null : record.id)}
                                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${isDark ? "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/30" : "bg-white border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"}`}
                                                        >
                                                            {expandedRecordId === record.id ? "Hide Details" : "View Details"}
                                                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${expandedRecordId === record.id ? "rotate-180" : ""}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 xl:grid-cols-2 items-start gap-6 p-6">
                                                    <section className={recordCodeClass}>
                                                        <div className={`px-4 py-2 border-b ${isDark ? "border-slate-700/50 bg-slate-900/40" : "border-slate-200 bg-slate-50/70"}`}>
                                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>Analysis Target</p>
                                                        </div>
                                                        <pre className={recordCodePreClass}>
                                                            {record.code}
                                                        </pre>
                                                    </section>

                                                    <section className="space-y-4">
                                                        <div className={insightCardClass}>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Sparkles className={`w-3.5 h-3.5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                                                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>Inspection Outcome</p>
                                                            </div>
                                                            <p className={analysisSummaryTextClass}>{record.result.summary}</p>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <MetricPill label="Time Complexity" value={record.result.complexity.time} isDark={isDark} />
                                                            <MetricPill label="Space Complexity" value={record.result.complexity.space} isDark={isDark} />
                                                        </div>

                                                        {expandedRecordId === record.id && (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                                                <AnalysisSection
                                                                    icon={Zap}
                                                                    title="Static Patterns"
                                                                    overview={record.result.staticAnalysis.overview}
                                                                    findings={record.result.staticAnalysis.findings}
                                                                    color="cyan"
                                                                    isDark={isDark}
                                                                />
                                                                <AnalysisSection
                                                                    icon={Shield}
                                                                    title="Security Integrity"
                                                                    overview={record.result.security.overview}
                                                                    findings={record.result.security.findings}
                                                                    color="rose"
                                                                    isDark={isDark}
                                                                />
                                                            </div>
                                                        )}
                                                    </section>
                                                </div>
                                            </article>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Deletion Confirmation Modal */}
                    {isDeleteConfirmOpen && (
                        <div
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
                            onClick={() => !isDeleting && setIsDeleteConfirmOpen(false)}
                        >
                            <div
                                className={`w-full max-w-sm rounded-[2rem] border p-8 animate-in zoom-in-95 duration-200 ${surfaceClass}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-center mb-6">
                                    <div className={`p-4 rounded-2xl border ${isDark ? "bg-rose-500/10 border-rose-500/20" : "bg-rose-50 border-rose-100"}`}>
                                        <AlertTriangle className="w-8 h-8 text-rose-500" />
                                    </div>
                                </div>

                                <h3 className={`text-xl font-black tracking-tight text-center mb-2 ${titleClass}`}>Delete Record?</h3>
                                <p className={`text-xs leading-relaxed text-center mb-8 ${mutedClass}`}>
                                    This action cannot be undone. This inspection will be permanently removed from your vault.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => {
                                            setIsDeleteConfirmOpen(false);
                                            setRecordIdToDelete(null);
                                        }}
                                        disabled={isDeleting}
                                        className={`flex-1 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 ${isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={isDeleting}
                                        className="flex-1 px-6 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:bg-rose-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Deleting...</span>
                                            </>
                                        ) : (
                                            "Delete"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
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
    isDark: boolean;
}

function MetricPill({ label, value, isDark }: MetricPillProps) {
    return (
        <div className={`rounded-xl border p-3 ${isDark ? "border-slate-700/70 bg-slate-900/40" : "border-slate-200 bg-white/80"}`}>
            <p className={`text-sm font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
            <p className={`text-base font-bold mt-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>{value}</p>
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

function AnalysisSection({ icon: Icon, title, overview, findings, color, isDark }: AnalysisCardProps) {
    const colorClasses = {
        cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
        rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    };

    return (
        <div className={`p-5 rounded-2xl border ${isDark ? colorClasses[color] : color === "cyan" ? "bg-cyan-50 text-cyan-700 border-cyan-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
            <div className="flex items-center gap-3 mb-3">
                <Icon className={`w-6 h-6 ${isDark ? colorClasses[color].split(' ')[1] : color === "cyan" ? "text-cyan-600" : "text-rose-600"}`} />
                <h3 className={`text-xl font-semibold ${isDark ? "text-gray-100" : "text-slate-900"}`}>{title}</h3>
            </div>
            <p className={`text-base leading-relaxed mb-4 ${isDark ? "text-gray-300" : "text-slate-700"}`}>{overview}</p>
            {findings.length > 0 ? (
                <div className="space-y-3">
                    {findings.map((finding, idx) => (
                        <div key={`${finding.title}-${idx}`} className={`rounded-xl border p-4 ${isDark ? "border-gray-700/70 bg-gray-900/40" : "border-gray-200 bg-white/80"}`}>
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <p className={`text-base font-semibold ${isDark ? "text-gray-100" : "text-slate-900"}`}>{finding.title}</p>
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${severityClasses(finding.severity)}`}>
                                    {finding.severity}
                                </span>
                            </div>
                            <p className={`text-base leading-relaxed ${isDark ? "text-gray-300" : "text-slate-700"}`}>{finding.detail}</p>
                            {finding.location ? (
                                <p className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                                    Location: {finding.location}
                                </p>
                            ) : null}
                            {finding.suggestion ? (
                                <p className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-slate-600"}`}>
                                    Suggestion: {finding.suggestion}
                                </p>
                            ) : null}
                        </div>
                    ))}
                </div>
            ) : (
                <p className={`text-base ${isDark ? "text-gray-300" : "text-slate-600"}`}>No major findings.</p>
            )}
        </div>
    );
}

interface AnalysisCardProps {
    icon: React.ElementType;
    title: string;
    overview: string;
    findings: AnalysisFinding[];
    color: 'cyan' | 'rose' | 'amber';
    isDark: boolean;
}
