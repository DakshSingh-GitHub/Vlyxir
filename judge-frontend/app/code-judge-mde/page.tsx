"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { anime } from "../lib/anime";
import { getProblemById, submitCode } from "../lib/api";
import { saveSubmission, getSubmissionsByProblemId, deleteSubmission, Submission } from "../lib/storage";
import { Problem, SubmitResponse } from "../lib/types";
import { useAppContext } from "../lib/context";
import { FileText, Code, History, Check, X, PanelTop, List } from "lucide-react";
import { layoutOptions, UiGridLayout } from "./layoutOptions";

import ClassicLayout from "./layouts/ClassicLayout";
import StackedLayout from "./layouts/StackedLayout";
import GroupedSwitchLayout from "./layouts/GroupedSwitchLayout";
import ProblemList from "../../components/ProblemList";
import ProblemViewer from "../../components/ProblemViewer";
import CodeEditor from "../../components/Editor/CodeEditor";
import PastSubmissions from "../../components/Editor/PastSubmissions";
import ResultModal from "./modals/resultModal";

const DEFAULT_CODE = "#Write your code here";
const LAYOUT_STORAGE_KEY = "codejudge_ui_grid_layout";

interface SubmissionResult extends SubmitResponse {
    error?: string;
}

export default function Home() {
    // State Variable Declarations
    const { isSidebarOpen, setIsSidebarOpen, TITLE, isDark, autoHideMobilePills, useNewUi } = useAppContext();
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
        if (!useNewUi && pathname === "/code-judge-mde") {
            router.replace("/code-judge");
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
            const data = await getProblemById(id);
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
        if (!selectedProblemId || !problem) return;

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
    }, [code, problem, selectedProblemId]);

    const handleDeleteSubmission = useCallback(async (id: string) => {
        try {
            await deleteSubmission(id);
            setPastSubmissions(prev => prev.filter(sub => sub.id !== id));
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
        <div className={`h-full min-h-0 overflow-hidden flex flex-col rounded-[2rem] border border-slate-300/70 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(24,33,50,0.9))] backdrop-blur-2xl shadow-[0_18px_48px_rgba(2,6,23,0.32)] dark:border-slate-700/70 dark:bg-[linear-gradient(180deg,rgba(12,18,30,0.95),rgba(10,15,26,0.9))] dark:shadow-[0_18px_48px_rgba(2,6,23,0.4)] ${isMobile && mobileTab !== "description" ? "hidden" : "flex"}`}>
            <div className="flex items-center justify-between border-b border-slate-700/70 px-6 py-5">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Challenge brief</p>
                    <h2 className="mt-1 text-base md:text-lg font-semibold text-white dark:text-gray-50">
                        Problem
                    </h2>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 pb-28 flex flex-col">
                <div className="mt-2 flex-1 flex flex-col">
                    <ProblemViewer problem={problem} />
                </div>
            </div>
        </div>
    );

    const editorAndSubmissionsPanel = (
        <div className={`h-full min-h-0 overflow-hidden flex flex-col rounded-[2rem] border border-slate-300/70 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(24,33,50,0.9))] backdrop-blur-2xl shadow-[0_18px_48px_rgba(2,6,23,0.32)] dark:border-slate-700/70 dark:bg-[linear-gradient(180deg,rgba(12,18,30,0.95),rgba(10,15,26,0.9))] dark:shadow-[0_18px_48px_rgba(2,6,23,0.4)] ${isMobile && (mobileTab === "problem" || mobileTab === "description") ? "hidden" : "flex"}`}>
            <div className={`flex items-center justify-between px-5 py-3 border-b border-slate-700/70 ${isMobile ? "hidden" : "flex"}`}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        {(["editor", "submissions"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative rounded-full px-4 py-2 text-xs md:text-sm font-medium uppercase tracking-[0.18em] transition-colors duration-200 ${activeTab === tab
                                    ? "text-white dark:text-white"
                                    : "text-slate-400 dark:text-gray-400 hover:text-white dark:hover:text-gray-300"
                                    }`}
                            >
                                {activeTab === tab && (
                                    <>
                                        <div
                                            className="absolute inset-0 rounded-full border border-slate-600/50 bg-slate-800/60 dark:border-slate-600/40 dark:bg-slate-800/50"
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

                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-400 dark:text-gray-500">
                    {activeTab === "editor" ? (
                        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Ready</span>
                    ) : (
                        <span>{pastSubmissions.length} records</span>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 p-4 pb-28 md:pb-4 flex flex-col gap-4">
                <div
                    ref={mobileCodeRef}
                    className={`flex-1 min-h-0 flex flex-col gap-4 ${(activeTab === "editor" && !isMobile) || (isMobile && mobileTab === "code") ? "flex" : "hidden"}`}
                >
                    <div className="flex-1 min-h-0 w-full overflow-hidden rounded-[1.75rem] border border-slate-700/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(10,15,26,0.94))] shadow-[0_16px_36px_rgba(2,6,23,0.22)]">
                        <CodeEditor
                            code={code}
                            setCode={setCode}
                            isDisabled={
                                !selectedProblemId || isSubmitting
                            }
                            isDark={isDark}
                        />
                    </div>
                    <div className="flex-none h-56 md:h-36 flex flex-col md:flex-row w-full justify-between items-stretch gap-4 shrink-0">
                        <div className="flex flex-row md:flex-col w-full md:w-1/4 gap-2">
                            <button
                                onClick={handleSubmit}
                                disabled={
                                    isSubmitting || !selectedProblemId
                                }
                                className={`px-6 py-3 rounded-[1.25rem] font-semibold uppercase tracking-[0.16em] flex-1 flex justify-center items-center transition-all duration-300 shadow-[0_14px_30px_rgba(2,6,23,0.18)] hover:shadow-[0_18px_36px_rgba(2,6,23,0.24)] text-sm
                                                ${isSubmitting
                                        ? "bg-slate-400 cursor-not-allowed"
                                        : "bg-[linear-gradient(135deg,#0f172a,#1e293b)] hover:brightness-110 active:scale-[0.98]"
                                    }
                                                text-white`}
                            >
                                {isSubmitting ? "Judging..." : "Submit"}
                            </button>
                            <button
                                onClick={handleTest}
                                disabled={
                                    isSubmitting || !selectedProblemId
                                }
                                className={`px-6 py-3 rounded-[1.25rem] font-semibold uppercase tracking-[0.16em] flex-1 flex justify-center items-center transition-all duration-300 shadow-[0_14px_30px_rgba(2,6,23,0.18)] hover:shadow-[0_18px_36px_rgba(2,6,23,0.24)] text-sm
                                                ${isSubmitting
                                        ? "bg-slate-400 cursor-not-allowed"
                                        : "bg-[linear-gradient(135deg,#0f766e,#1d4ed8)] hover:brightness-110 active:scale-[0.98]"
                                    }
                                                text-white`}
                            >
                                {isSubmitting ? "Testing..." : "Test"}
                            </button>
                        </div>
                        <div className="w-full md:w-3/4 h-full">
                            <div className="p-4 rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(10,15,26,0.94))] text-slate-100 h-full overflow-y-auto border border-slate-700/70 shadow-[0_16px_36px_rgba(2,6,23,0.22)] transition-all duration-300">
                                {!result ? (
                                    <div
                                        className="flex flex-col items-center justify-center h-full space-y-3"
                                    >
                                        <div className="rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-300">
                                            Execution
                                        </div>
                                        <p className="text-slate-400 italic text-center text-sm">
                                            Quiet workspace. Run a dry test or send the final submission when ready.
                                            <br />
                                            <span className="text-slate-500 text-xs mt-1 inline-block">Do not add prompts to input.</span>
                                        </p>
                                    </div>
                                ) : result.error ? (
                                    <div
                                        className="flex items-center gap-2 text-rose-300"
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
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl font-semibold text-white">Verdict:</span>
                                                <span
                                                    className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-[0.25em] ${result.final_status === "Accepted"
                                                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                                        : "bg-red-500/10 text-red-300 border border-red-500/20"
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
                                                <span className="text-slate-400 text-sm font-medium">
                                                    ({result.total_duration ? result.total_duration.toFixed(1) : 0}s)
                                                </span>
                                            </div>

                                            <div className="h-2 rounded-full bg-slate-800/80 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${result.final_status === "Accepted"
                                                        ? "bg-emerald-500"
                                                        : "bg-red-500"
                                                        }`}
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <p className="text-base font-medium text-slate-300 tracking-tight">
                                                    Passed {String(result.summary.passed ?? 0)} / {String(result.summary.total ?? 0)} test cases
                                                </p>
                                                <button
                                                    onClick={() => setIsResultModalOpen(true)}
                                                    className="text-sm font-semibold text-slate-200 hover:underline"
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
        <div className={`flex-1 flex flex-col min-h-0 bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] dark:bg-[#07111d] text-gray-100 dark:text-gray-50 relative overflow-hidden font-sans selection:bg-slate-300/30`}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(51,65,85,0.32),transparent_38%),linear-gradient(135deg,rgba(2,6,23,0.18),transparent_35%,rgba(15,23,42,0.3)_100%)]" />
            <div className="pointer-events-none absolute left-[-8%] top-[12%] h-72 w-72 rounded-full bg-slate-900/40 blur-[130px]" />
            <div className="pointer-events-none absolute bottom-[-6%] right-[-5%] h-80 w-80 rounded-full bg-slate-800/40 blur-[150px]" />
            <div className="pointer-events-none absolute left-[35%] top-[22%] h-56 w-56 rounded-full bg-slate-700/20 blur-[140px]" />

            {!isMounted ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/70 dark:bg-[#07111d] z-50">
                    <div
                        ref={loaderTitleRef}
                        className="text-2xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white via-slate-300 to-slate-500"
                    >
                        {typeof TITLE === 'string' ? TITLE : JSON.stringify(TITLE || "Code Judge")}
                    </div>
                    <div
                        className="h-1 bg-slate-700 rounded-full mt-4 overflow-hidden w-50"
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
                            className="flex flex-col md:flex-row flex-1 overflow-hidden gap-4 p-4 md:p-5 relative z-10"
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
                            <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-slate-700/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.97),rgba(10,15,26,0.95))] backdrop-blur-2xl shadow-[0_18px_48px_rgba(2,6,23,0.35)] p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Select UI Grid</h3>
                                        <p className="text-sm text-slate-400">Choose a layout for the Code Judge workspace.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsLayoutModalOpen(false)}
                                        className="p-2 rounded-full hover:bg-slate-800/70 transition-colors"
                                        aria-label="Close"
                                    >
                                        <X className="w-4 h-4 text-slate-300" />
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
                                            className={`w-full text-left rounded-[1.35rem] border px-4 py-3 transition-all duration-200 ${selectedLayout === option.id
                                                ? "border-slate-600/70 bg-slate-800/70"
                                                : "border-slate-700/70 hover:border-slate-500/70 hover:bg-slate-800/60"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-sm text-white">{option.label}</span>
                                                {selectedLayout === option.id && <PanelTop className="w-4 h-4 text-slate-300" />}
                                            </div>
                                            <p className="mt-1 text-xs text-slate-400">{option.description}</p>
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
                        Original project: https://github.com/DakshSingh-GitHub/CodeJudge */}
                    {
                        isMobile && (
                            <div
                                className={`fixed bottom-6 left-1/2 z-50 transition-all duration-300 ease-out ${isMobilePillVisible
                                    ? "translate-x-[-50%] translate-y-0 opacity-100"
                                    : "translate-x-[-50%] translate-y-24 opacity-0 pointer-events-none"
                                    }`}
                            >
                                <div className="flex items-center gap-2 p-1.5 rounded-full bg-[linear-gradient(135deg,rgba(8,12,20,0.98),rgba(15,23,42,0.92))] backdrop-blur-3xl border border-slate-700/70 shadow-[0_18px_42px_rgba(2,6,23,0.35)]">
                                    <button
                                        onClick={() => handleMobileTabChange("problem")}
                                        className={`relative px-3 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-16 ${mobileTab === "problem"
                                            ? "bg-slate-800/70 text-white"
                                            : "text-slate-400 hover:bg-slate-800/60"
                                            }`}
                                    >
                                        <List className={`w-5 h-5 ${mobileTab === "problem" ? "stroke-[2.5px]" : "stroke-2"}`} />
                                        <span className="text-[10px] font-bold tracking-wide">Problem</span>
                                    </button>
                                    <button
                                        onClick={() => handleMobileTabChange("description")}
                                        className={`relative px-3 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-16 ${mobileTab === "description"
                                            ? "bg-slate-800/70 text-white"
                                            : "text-slate-400 hover:bg-slate-800/60"
                                            }`}
                                    >
                                        <FileText className={`w-5 h-5 ${mobileTab === "description" ? "stroke-[2.5px]" : "stroke-2"}`} />
                                        <span className="text-[10px] font-bold tracking-wide">Description</span>
                                    </button>
                                    <button
                                        onClick={() => handleMobileTabChange("code")}
                                        className={`relative px-3 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-16 ${mobileTab === "code"
                                            ? "bg-slate-800/70 text-white"
                                            : "text-slate-400 hover:bg-slate-800/60"
                                            }`}
                                    >
                                        <Code className={`w-5 h-5 ${mobileTab === "code" ? "stroke-[2.5px]" : "stroke-2"}`} />
                                        <span className="text-[10px] font-bold tracking-wide">Code</span>
                                    </button>
                                    <button
                                        onClick={() => handleMobileTabChange("submissions")}
                                        className={`relative px-3 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-16 ${mobileTab === "submissions"
                                            ? "bg-slate-800/70 text-white"
                                            : "text-slate-400 hover:bg-slate-800/60"
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
