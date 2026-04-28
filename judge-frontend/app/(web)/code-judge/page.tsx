"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { anime } from "../../lib/anime";
import { getProblemById, submitCode } from "../../lib/api";
import { saveSubmission, getSubmissionsByProblemId, deleteSubmission, Submission } from "../../lib/storage";
import { Problem, SubmitResponse } from "../../lib/types";
import { useAppContext } from "../../lib/context";
import { FileText, Code, History, Check, X, PanelTop, List } from "lucide-react";
import { layoutOptions, UiGridLayout } from "./layoutOptions";

import ClassicLayout from "./layouts/ClassicLayout";
import StackedLayout from "./layouts/StackedLayout";
import GroupedSwitchLayout from "./layouts/GroupedSwitchLayout";
import ProblemList from "../../../components/ProblemList";
import ProblemViewer from "../../../components/ProblemViewer";
import CodeEditor from "../../../components/Editor/CodeEditor";
import PastSubmissions from "../../../components/Editor/PastSubmissions";
import ResultModal from "./modals/resultModal";
import { useAuth } from "../../lib/auth-context";

const DEFAULT_CODE = "#Write your code here";
const LAYOUT_STORAGE_KEY = "codejudge_ui_grid_layout";

interface SubmissionResult extends SubmitResponse {
    error?: string;
}

export default function Home() {
    // State Variable Declarations
    const { isSidebarOpen, setIsSidebarOpen, TITLE, isDark, autoHideMobilePills, useNewUi } = useAppContext();
    const { user, isLoading: isAuthLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [problem, setProblem] = useState<Problem | null>(null);
    const [selectedProblemId, setSelectedProblemId] = useState<string>("");
    const [code, setCode] = useState(DEFAULT_CODE);
    const containerRef = useRef<HTMLDivElement>(null);
    const mainContentRef = useRef<HTMLDivElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<SubmissionResult | null>(null);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"editor" | "submissions">("editor");
    const [pastSubmissions, setPastSubmissions] = useState<Submission[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [isMobile, setIsMobile] = useState(false);
    const [mobileTab, setMobileTab] = useState<"problem" | "description" | "code" | "submissions">("problem");
    const [isMobilePillVisible, setIsMobilePillVisible] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedLayout, setSelectedLayout] = useState<UiGridLayout>("classic");
    const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [mainContentWidth, setMainContentWidth] = useState(50); // percentage
    const isResizingSidebar = useRef(false);
    const isResizingMain = useRef(false);
    const [isResizing, setIsResizing] = useState(false);
    const requestRef = useRef<number>(null);

    const loaderTitleRef = useRef<HTMLDivElement>(null);
    const loaderBarRef = useRef<HTMLDivElement>(null);
    const verdictRef = useRef<HTMLDivElement>(null);
    const mobileProblemListRef = useRef<HTMLDivElement>(null);
    const mobileDescriptionRef = useRef<HTMLDivElement>(null);
    const mobileCodeRef = useRef<HTMLDivElement>(null);
    const mobileSubmissionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (useNewUi && pathname === "/code-judge") {
            router.replace("/code-judge-mde");
        }
    }, [pathname, router, useNewUi]);

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
        if (result && verdictRef.current) {
            anime({
                targets: verdictRef.current,
                translateY: [10, 0],
                opacity: [0, 1],
                duration: 400,
                easing: 'easeOutQuad'
            });
        }
    }, [result]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (requestRef.current) return;

            requestRef.current = requestAnimationFrame(() => {
                if (isResizingSidebar.current) {
                    const newWidth = Math.max(200, Math.min(600, e.clientX - 16));
                    setSidebarWidth(newWidth);
                }
                if (isResizingMain.current && mainContentRef.current) {
                    const rect = mainContentRef.current.getBoundingClientRect();
                    const relativeX = e.clientX - rect.left;
                    const newPercentage = Math.max(20, Math.min(80, (relativeX / rect.width) * 100));
                    setMainContentWidth(newPercentage);
                }
                requestRef.current = null;
            });
        };

        const handleMouseUp = () => {
            isResizingSidebar.current = false;
            isResizingMain.current = false;
            setIsResizing(false);
            document.body.style.cursor = "default";
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
        };

        const checkScreenSize = () => {
            const width = window.innerWidth;
            const currentIsMobile = width <= 1024;
            if (isMobile !== currentIsMobile) {
                setIsSidebarOpen(!currentIsMobile);
            }
            setIsMobile(currentIsMobile);
        };

        if (!isMounted) {
            const width = window.innerWidth;
            const currentIsMobile = width <= 1024;
            setIsMobile(currentIsMobile);
            setIsSidebarOpen(!currentIsMobile);
            setIsMounted(true);
        }

        window.addEventListener("resize", checkScreenSize);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("resize", checkScreenSize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isMobile, isMounted, setIsSidebarOpen]);

    const handleMouseDownSidebar = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        isResizingSidebar.current = true;
        setIsResizing(true);
        document.body.style.cursor = "col-resize";
    }, []);

    const handleMouseDownMain = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        isResizingMain.current = true;
        setIsResizing(true);
        document.body.style.cursor = "col-resize";
    }, []);

    // Save code changes
    useEffect(() => {
        if (selectedProblemId) {
            sessionStorage.setItem(`draft_code_${selectedProblemId}`, code);
        }
    }, [code, selectedProblemId]);

    const handleSelect = useCallback(async (id: string) => {
        setSelectedProblemId(id);
        if (id) {
            sessionStorage.setItem("last_selected_problem_id", id);
        }
        if (isMobile) {
            setMobileTab("description");
            setIsSidebarOpen(false);
        }

        setSearchQuery("");
        if (!id) {
            setProblem(null);
            setPastSubmissions([]);
            return;
        }

        const savedCode = sessionStorage.getItem(`draft_code_${id}`);
        setCode(savedCode || DEFAULT_CODE);
        setResult(null);

        try {
            const data = await getProblemById(id, (newData) => {
                setProblem(newData);
            });
            setProblem(data);
            const subs = await getSubmissionsByProblemId(id);
            setPastSubmissions(subs);
        } catch (error) {
            console.error("Failed to fetch problem", error);
        }
    }, [isMobile, setIsSidebarOpen]);

    // State restoration on mount
    useEffect(() => {
        const lastProblemId = sessionStorage.getItem("last_selected_problem_id");
        if (lastProblemId && !selectedProblemId) {
            handleSelect(lastProblemId).catch(console.error);
        }
    }, [selectedProblemId, handleSelect]);

    const handleTest = useCallback(async () => {
        if (!selectedProblemId || !problem) return;

        setIsSubmitting(true);
        setResult(null);

        try {
            const data = await submitCode(selectedProblemId, code, true);

            const sampleCount = problem.sample_test_cases?.length || 0;
            if (data.test_case_results && data.test_case_results.length > sampleCount && sampleCount > 0) {
                const sampleResults = data.test_case_results.slice(0, sampleCount);
                const passedCount = sampleResults.filter(r => r.status === "Accepted").length;

                data.summary = {
                    passed: passedCount,
                    total: sampleCount
                };
                data.test_case_results = sampleResults;
                data.final_status = passedCount === sampleCount ? "Accepted" : "Failed";
            }

            setResult(data);
        } catch (error) {
            const err = error as Error;
            if (err.name === 'AbortError' || (err.message && err.message.toLowerCase().includes('cancel'))) {
                console.warn('Test request was canceled.');
                return;
            }
            setResult({ problem_id: selectedProblemId, final_status: "Error", summary: { passed: 0, total: 0 }, test_case_results: [], total_duration: 0, error: err.message || "Something went wrong" });
        } finally {
            setIsSubmitting(false);
        }
    }, [code, problem, selectedProblemId]);

    const handleSubmit = useCallback(async () => {
        if (!user || !selectedProblemId || !problem) return;

        setIsSubmitting(true);
        setResult(null);

        try {
            const data = await submitCode(selectedProblemId, code);
            setResult(data);

            const newSubmission = await saveSubmission({
                problemId: selectedProblemId,
                problemTitle: problem.title,
                code: code,
                final_status: data.final_status,
                summary: data.summary,
                total_duration: data.total_duration,
            });

            if (newSubmission) {
                setPastSubmissions(prev => [newSubmission, ...prev.slice(0, 49)]);
                window.dispatchEvent(new CustomEvent('submission-updated'));
            }
        } catch (error) {
            const err = error as Error;
            if (err.name === 'AbortError' || (err.message && err.message.toLowerCase().includes('cancel'))) {
                console.warn('Submission request was canceled.');
                return;
            }
            setResult({ problem_id: selectedProblemId, final_status: "Error", summary: { passed: 0, total: 0 }, test_case_results: [], total_duration: 0, error: err.message || "Something went wrong" });
        } finally {
            setIsSubmitting(false);
        }
    }, [code, problem, selectedProblemId, user]);

    const handleDeleteSubmission = useCallback(async (id: string) => {
        try {
            await deleteSubmission(id);
            setPastSubmissions(prev => prev.filter(sub => sub.id !== id));
            window.dispatchEvent(new CustomEvent('submission-updated'));
        } catch (error) {
            console.error("Failed to delete submission", error);
        }
    }, []);

    const handleMobileTabChange = useCallback((tab: "problem" | "description" | "code" | "submissions") => {
        setMobileTab(tab);
        setIsSidebarOpen(tab === "problem");
    }, [setIsSidebarOpen]);

    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(mobileTab === "problem");
        }
    }, [isMobile, mobileTab, setIsSidebarOpen]);

    useEffect(() => {
        if (!isMobile || !autoHideMobilePills) {
            setIsMobilePillVisible(true);
            return;
        }

        let scrollStopTimer: ReturnType<typeof setTimeout> | null = null;
        let ticking = false;

        const handleScroll = () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                setIsMobilePillVisible(false);
                if (scrollStopTimer) {
                    clearTimeout(scrollStopTimer);
                }
                scrollStopTimer = setTimeout(() => {
                    setIsMobilePillVisible(true);
                }, 500);
                ticking = false;
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true, capture: true });

        return () => {
            window.removeEventListener("scroll", handleScroll, true);
            if (scrollStopTimer) {
                clearTimeout(scrollStopTimer);
            }
        };
    }, [isMobile, autoHideMobilePills]);

    useEffect(() => {
        if (!isMobile) return;

        let target: HTMLDivElement | null = null;
        if (mobileTab === "problem") {
            target = isSidebarOpen ? mobileProblemListRef.current : null;
        } else if (mobileTab === "description") {
            target = mobileDescriptionRef.current;
        } else if (mobileTab === "code") {
            target = mobileCodeRef.current;
        } else if (mobileTab === "submissions") {
            target = mobileSubmissionsRef.current;
        }

        if (!target) return;

        const animation = anime({
            targets: target,
            opacity: [0, 1],
            translateY: [14, 0],
            scale: [0.995, 1],
            duration: 320,
            easing: "easeOutCubic"
        });

        const maybeThenable = animation as unknown as { catch?: (onRejected: () => void) => void };
        maybeThenable.catch?.(() => undefined);

        return () => {
            const maybeCancelable = animation as { cancel?: () => void };
            maybeCancelable.cancel?.();
        };
    }, [isMobile, mobileTab, isSidebarOpen]);

    useEffect(() => {
        if (isMobile && isLayoutModalOpen) {
            setIsLayoutModalOpen(false);
        }
    }, [isMobile, isLayoutModalOpen]);

    useEffect(() => {
        const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
        if (!savedLayout) return;
        if (savedLayout === "classic" || savedLayout === "stacked" || savedLayout === "grouped") {
            setSelectedLayout(savedLayout);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(LAYOUT_STORAGE_KEY, selectedLayout);
    }, [selectedLayout]);

    useEffect(() => {
        const handleOpenLayoutModal = () => {
            if (!isMobile) {
                setIsLayoutModalOpen(true);
            }
        };

        window.addEventListener("open-code-judge-ui-grid-modal", handleOpenLayoutModal);
        return () => {
            window.removeEventListener("open-code-judge-ui-grid-modal", handleOpenLayoutModal);
        };
    }, [isMobile]);

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

    const passedCount = Number(result?.summary?.passed ?? 0);
    const totalCount = Number(result?.summary?.total ?? 0);
    const progressPercent = totalCount > 0
        ? Math.max(0, Math.min(100, (passedCount / totalCount) * 100))
        : 0;
    const problemDescriptionPanel = (
        <div className={`h-full min-h-0 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-white/20 dark:border-gray-800/50 ${isMobile && mobileTab !== "description" ? "hidden" : "flex"}`}>
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">
                    Problem
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 pb-28 flex flex-col">
                <div className="mt-8 flex-1 flex flex-col">
                    <ProblemViewer problem={problem} />
                </div>
            </div>
        </div>
    );

    const editorAndSubmissionsPanel = (
        <div className={`h-full min-h-0 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-white/20 dark:border-gray-800/50 ${isMobile && (mobileTab === "problem" || mobileTab === "description") ? "hidden" : "flex"}`}>
            {/* Tabs Header - Modern Minimal Tabs */}
            <div className={`flex items-center justify-between px-5 py-2 border-b border-gray-100/50 dark:border-gray-800/50 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md ${isMobile ? "hidden" : "flex"}`}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-6">
                        {(["editor", "submissions"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative py-2 text-xs md:text-sm font-medium transition-colors duration-200 ${activeTab === tab
                                    ? "text-cyan-700 dark:text-cyan-400"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                {activeTab === tab && (
                                    <>
                                        <div
                                            className="absolute inset-0 -inset-x-3 bg-cyan-500/10 dark:bg-cyan-400/10 rounded-lg blur-sm"
                                        />
                                        <div
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-cyan-500 to-emerald-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"
                                        />
                                    </>
                                )}
                                <span className="relative z-10">
                                    {tab === "editor" ? "Code Editor" : "Past Submissions"}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500">
                    {activeTab === "editor" ? (
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Ready</span>
                    ) : (
                        <span>{pastSubmissions.length} records</span>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 p-4 pb-28 md:pb-4 flex flex-col gap-4">
                {/* Editor and Result Area - Kept mounted to avoid state loss and 'Canceled' errors */}
                <div
                    ref={mobileCodeRef}
                    className={`flex-1 min-h-0 flex flex-col gap-4 ${(activeTab === "editor" && !isMobile) || (isMobile && mobileTab === "code") ? "flex" : "hidden"}`}
                >
                    <div className="relative flex-1 min-h-0 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
                        <CodeEditor
                            code={code}
                            setCode={setCode}
                            isDisabled={
                                !selectedProblemId || isSubmitting
                            }
                            isDark={isDark}
                        />
                    </div>
                    <div className="flex-none h-40 md:h-32 flex flex-col md:flex-row w-full justify-between items-stretch gap-4 shrink-0">
                        <div className="flex flex-row md:flex-col w-full md:w-1/4 gap-2">

                            <button
                                onClick={handleTest}
                                disabled={
                                    isSubmitting || !selectedProblemId
                                }
                                className={`px-6 py-1.5 rounded-xl font-semibold flex-1 flex justify-center items-center transition-all duration-300 shadow-md hover:shadow-lg text-sm
                                                ${isSubmitting
                                        ? "bg-gray-500 cursor-not-allowed"
                                        : "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
                                    }
                                                text-white`}
                            >
                                {isSubmitting ? "Testing..." : "Test"}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={
                                    isSubmitting || !selectedProblemId || !user || isAuthLoading
                                }
                                className={`px-6 py-1.5 rounded-xl font-semibold flex-1 flex justify-center items-center transition-all duration-300 shadow-md hover:shadow-lg text-sm
                                                ${isSubmitting
                                        ? "bg-gray-500 cursor-not-allowed"
                                        : (!user || isAuthLoading)
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
                                    }
                                                text-white`}
                            >
                                {isSubmitting ? "Judging..." : (!user ? "Log in to Submit" : "Submit")}
                            </button>
                        </div>
                        <div className="relative w-full md:w-3/4 h-full">
                            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 h-full overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl custom-scrollbar transition-all duration-300">
                                {!result ? (
                                    <div
                                        className="flex flex-col items-center justify-center h-full space-y-2 animate-pulse"
                                    >
                                        <span className="text-2xl animate-bounce [animation-timing-function:cubic-bezier(.3,1.5,.7,1)]">😊</span>
                                        <p className="text-gray-500 dark:text-gray-400 italic text-center text-sm">
                                            Happy coding! Think carefully before submission.
                                            <br />
                                            <span className="text-amber-400 text-xs mt-1">⚠️ Don&apos;t add Prompts to Input ⚠️</span>
                                        </p>
                                    </div>
                                ) : result.error ? (
                                    <div
                                        className="flex items-center gap-2 text-red-400"
                                    >
                                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <p className="font-medium">{typeof result.error === 'string' ? result.error : JSON.stringify(result.error)}</p>
                                    </div>
                                ) : (
                                    <div
                                        ref={verdictRef}
                                        className="flex flex-col h-full justify-center"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Verdict:</span>
                                                <span
                                                    className={`px-4 py-1.5 rounded-lg text-sm font-black uppercase tracking-wider ${result.final_status === "Accepted"
                                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                                                        }`}
                                                >
                                                    {result.final_status === "Accepted" ? "ACCEPTED" : result.final_status}
                                                </span>
                                                {result.final_status === "Accepted" ? (
                                                    <div
                                                        className="p-1 bg-emerald-500 rounded-full"
                                                    >
                                                        <Check className="w-4 h-4 text-white stroke-[3px]" />
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="p-1 bg-red-500 rounded-full"
                                                    >
                                                        <X className="w-4 h-4 text-white stroke-[3px]" />
                                                    </div>
                                                )}
                                                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                                    ({result.total_duration ? result.total_duration.toFixed(1) : 0}s)
                                                </span>
                                            </div>

                                            <div
                                                className={`h-1.5 rounded-full transition-all duration-1000 ${result.final_status === "Accepted"
                                                    ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                                    : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                                                    }`}
                                                style={{ width: `${progressPercent}%` }}
                                            />

                                            <div className="flex items-center justify-between">
                                                <p className="text-base font-medium text-gray-700 dark:text-gray-200 tracking-tight">
                                                    Passed {String(result.summary.passed ?? 0)} / {String(result.summary.total ?? 0)} test cases
                                                </p>
                                                <button
                                                    onClick={() => setIsResultModalOpen(true)}
                                                    className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                                >
                                                    Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Past Submissions - Kept mounted to avoid state loss */}
                <div
                    ref={mobileSubmissionsRef}
                    className={`flex-1 overflow-y-auto ${(!isMobile && activeTab === "submissions") || (isMobile && mobileTab === "submissions") ? "block" : "hidden"}`}
                >
                    <PastSubmissions
                        submissions={pastSubmissions}
                        onLoadCode={(savedCode) => {
                            setCode(savedCode);
                            if (isMobile) {
                                setMobileTab("code");
                            } else {
                                setActiveTab("editor");
                            }
                        }}
                        onDelete={handleDeleteSubmission}
                    />
                </div>
            </div>
        </div>
    );

    const desktopLayoutProps = {
        mainContentRef,
        selectedProblemId,
        isSidebarOpen,
        isResizing,
        sidebarWidth,
        mainContentWidth,
        onMouseDownSidebar: handleMouseDownSidebar,
        onMouseDownMain: handleMouseDownMain,
        problemList: (
            <ProblemList
                onSelect={handleSelect}
                selectedId={selectedProblemId}
                setIsSidebarOpen={setIsSidebarOpen}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
        ),
        problemDescription: problemDescriptionPanel,
        editorPanel: editorAndSubmissionsPanel
    };

    return (
        <div className={`flex-1 flex flex-col min-h-0 text-gray-900 dark:text-gray-50 relative overflow-hidden font-sans selection:bg-indigo-500/30`}>
            {/* Ambient Background Glows - Refined for "Premium" feel */}
            <div className="absolute top-[-20%] right-[-10%] w-200 h-200 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />
            <div className="absolute bottom-[-20%] left-[-10%] w-150 h-150 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-pulse-slow delay-1000" />
            <div className="absolute top-[40%] left-[20%] w-100 h-100 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-pulse-slow delay-2000" />

            {!isMounted ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50">
                    <div
                        ref={loaderTitleRef}
                        className="text-2xl md:text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
                    >
                        {typeof TITLE === 'string' ? TITLE : JSON.stringify(TITLE || "Code Judge")}
                    </div>
                    <div
                        className="h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full mt-4 overflow-hidden w-50"
                    >
                        <div
                            ref={loaderBarRef}
                            className="w-full h-full bg-white/30"
                        />
                    </div>
                </div>
            ) : (
                <>
                    {isMobile ? (
                        <div
                            ref={containerRef}
                            className="flex flex-col md:flex-row flex-1 overflow-hidden gap-4 p-4 relative z-10"
                        >
                            <div
                                ref={mobileProblemListRef}
                                className={`flex flex-col md:flex-row h-full overflow-hidden shrink-0 transition-all duration-400 ease-[0.4,0,0.2,1] ${isSidebarOpen && mobileTab === "problem" ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                style={{
                                    width: !isSidebarOpen || mobileTab !== "problem" ? 0 : "100%",
                                    height: !isSidebarOpen || mobileTab !== "problem" ? 0 : "100%",
                                    transition: isResizing ? 'none' : undefined
                                }}
                            >
                                <aside className="h-full overflow-hidden shrink-0 w-full md:pr-4">
                                    <ProblemList
                                        onSelect={handleSelect}
                                        selectedId={selectedProblemId}
                                        setIsSidebarOpen={setIsSidebarOpen}
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                    />
                                </aside>
                            </div>

                            <div
                                ref={mainContentRef}
                                data-content-area
                                className="flex-1 min-h-0 overflow-hidden flex flex-col gap-4 transition-all duration-400 ease-[0.4,0,0.2,1]"
                                style={{ transition: isResizing ? 'none' : undefined }}
                            >
                                <div ref={mobileDescriptionRef} className={`${mobileTab === "description" ? "flex-1" : "hidden"} min-h-0 min-w-0`}>
                                    {problemDescriptionPanel}
                                </div>
                                <div className={`${mobileTab === "code" || mobileTab === "submissions" ? "flex-1" : "hidden"} min-h-0 min-w-0`}>
                                    {editorAndSubmissionsPanel}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {selectedLayout === "classic" && <ClassicLayout {...desktopLayoutProps} />}
                            {selectedLayout === "stacked" && <StackedLayout {...desktopLayoutProps} />}
                            {selectedLayout === "grouped" && <GroupedSwitchLayout {...desktopLayoutProps} />}
                        </>
                    )}

                    {isLayoutModalOpen && !isMobile && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                            <button
                                onClick={() => setIsLayoutModalOpen(false)}
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                aria-label="Close layout selector"
                            />
                            <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 dark:border-gray-700/60 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Select UI Grid</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Choose a layout for the Code Judge workspace.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsLayoutModalOpen(false)}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        aria-label="Close"
                                    >
                                        <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {layoutOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                if (isMobile) return;
                                                setSelectedLayout(option.id);
                                                setIsLayoutModalOpen(false);
                                            }}
                                            className={`w-full text-left rounded-xl border px-4 py-3 transition-all duration-200 ${selectedLayout === option.id
                                                ? "border-cyan-500 bg-cyan-500/10 dark:bg-cyan-400/10"
                                                : "border-gray-200 dark:border-gray-700 hover:border-cyan-400/60 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{option.label}</span>
                                                {selectedLayout === option.id && <PanelTop className="w-4 h-4 text-cyan-500" />}
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {isResultModalOpen && result && (
                        <ResultModal
                            result={result}
                            onClose={() => setIsResultModalOpen(false)}
                        />
                    )}

                    {/*If you're reading this in another repo… hi thief 👀
                        Original project: https://github.com/DakshSingh-GitHub/Vlyxir */}
                    {
                        isMobile && (
                            <div
                                className={`fixed bottom-6 left-1/2 z-50 transition-all duration-300 ease-out ${isMobilePillVisible
                                    ? "translate-x-[-50%] translate-y-0 opacity-100"
                                    : "translate-x-[-50%] translate-y-24 opacity-0 pointer-events-none"
                                    }`}
                            >
                                <div className="flex items-center gap-4 p-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/10 ring-1 ring-black/5">
                                    <button
                                        onClick={() => handleMobileTabChange("problem")}
                                        className={`relative px-3 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-16 ${mobileTab === "problem"
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-500/50"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/30 dark:hover:bg-gray-800/30"
                                            }`}
                                    >
                                        <List className={`w-5 h-5 ${mobileTab === "problem" ? "stroke-[2.5px]" : "stroke-2"}`} />
                                        <span className="text-[10px] font-bold tracking-wide">Problem</span>
                                    </button>
                                    <button
                                        onClick={() => handleMobileTabChange("description")}
                                        className={`relative px-3 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-16 ${mobileTab === "description"
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-500/50"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/30 dark:hover:bg-gray-800/30"
                                            }`}
                                    >
                                        <FileText className={`w-5 h-5 ${mobileTab === "description" ? "stroke-[2.5px]" : "stroke-2"}`} />
                                        <span className="text-[10px] font-bold tracking-wide">Description</span>
                                    </button>
                                    <button
                                        onClick={() => handleMobileTabChange("code")}
                                        className={`relative px-3 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-16 ${mobileTab === "code"
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-500/50"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/30 dark:hover:bg-gray-800/30"
                                            }`}
                                    >
                                        <Code className={`w-5 h-5 ${mobileTab === "code" ? "stroke-[2.5px]" : "stroke-2"}`} />
                                        <span className="text-[10px] font-bold tracking-wide">Code</span>
                                    </button>
                                    <button
                                        onClick={() => handleMobileTabChange("submissions")}
                                        className={`relative px-3 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-16 ${mobileTab === "submissions"
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-500/50"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/30 dark:hover:bg-gray-800/30"
                                            }`}
                                    >
                                        <History className={`w-5 h-5 ${mobileTab === "submissions" ? "stroke-[2.5px]" : "stroke-2"}`} />
                                        <span className="text-[9px] font-bold tracking-wide whitespace-nowrap">Past submissions</span>
                                    </button>
                                </div>
                            </div>
                        )
                    }
                </>
            )
            }
        </div >
    );
}
