"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { anime } from "../../lib/anime";
import { useAppContext } from "../../lib/context";
import { runCode } from "../../lib/api";
import { Play, Terminal, Cpu, AlertCircle, Loader2, MessageSquare, RotateCcw, X, PanelTop, Code2, History } from "lucide-react";

import CodeEditor from "../../../components/Editor/CodeEditor";
import { ideLayoutOptions, IdeUiLayout } from "./layoutOptions";
import ClassicIdeLayout from "./layouts/ClassicIdeLayout";
import WideIdeLayout from "./layouts/WideIdeLayout";
import { useAuth } from "../../lib/auth-context";
import LoginPrompt from "../../../components/Auth/LoginPrompt";

const IDE_LAYOUT_STORAGE_KEY = "codeide_ui_grid_layout";

export default function CodeTestPage() {
    const { isDark, autoHideMobilePills, TITLE, useNewUi } = useAppContext();
    const { user, isLoading: isAuthLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [code, setCode] = useState("# Write your code here to test\nprint('Hello, CodeJudge!')");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState<{
        stdout: string;
        stderr: string | null;
        status: string;
        duration: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileTab, setMobileTab] = useState<"code" | "output">("code");
    const [isMobilePillVisible, setIsMobilePillVisible] = useState(true);
    const [selectedLayout, setSelectedLayout] = useState<IdeUiLayout>("classic");
    const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

    const [mainContentWidth, setMainContentWidth] = useState(65); // percentage for editor
    const [secondaryContentWidth, setSecondaryContentWidth] = useState(45); // percentage for input/output in wide
    const isResizingMain = useRef(false);
    const isResizingSecondary = useRef(false);
    const [isResizing, setIsResizing] = useState(false);
    const requestRef = useRef<number>(null);

    const mainContentRef = useRef<HTMLDivElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);
    const mobileCodeRef = useRef<HTMLDivElement>(null);
    const mobileOutputRef = useRef<HTMLDivElement>(null);

    const loaderTitleRef = useRef<HTMLDivElement>(null);
    const loaderBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!useNewUi && pathname === "/code-ide-mde") {
            router.replace("/code-ide");
        }
    }, [pathname, router, useNewUi]);

    useEffect(() => {
        setIsMounted(true);
        setIsMobile(window.innerWidth <= 1024);

        const savedCode = sessionStorage.getItem("code-ide-code");
        if (savedCode) setCode(savedCode);

        const savedInput = sessionStorage.getItem("code-ide-input");
        if (savedInput) setInput(savedInput);

        const savedOutput = sessionStorage.getItem("code-ide-output");
        if (savedOutput) {
            try {
                setOutput(JSON.parse(savedOutput));
            } catch (e) {
                console.error("Failed to parse saved output", e);
            }
        }

        const savedLayout = localStorage.getItem(IDE_LAYOUT_STORAGE_KEY);
        if (savedLayout === "classic" || savedLayout === "wide") {
            setSelectedLayout(savedLayout);
        }
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
        const handleMouseMove = (e: MouseEvent) => {
            if (requestRef.current) return;

            requestRef.current = requestAnimationFrame(() => {
                if (isResizingMain.current && mainContentRef.current) {
                    const rect = mainContentRef.current.getBoundingClientRect();
                    if (selectedLayout === "classic") {
                        // Horizontal split: Editor vs Tools
                        const relativeX = e.clientX - rect.left;
                        const newPercentage = Math.max(20, Math.min(80, (relativeX / rect.width) * 100));
                        setMainContentWidth(newPercentage);
                    } else {
                        // Vertical split: Editor vs Bottom Tools
                        const relativeY = e.clientY - rect.top;
                        const newPercentage = Math.max(20, Math.min(80, (relativeY / rect.height) * 100));
                        setMainContentWidth(newPercentage);
                    }
                }
                if (isResizingSecondary.current && mainContentRef.current) {
                    const rect = mainContentRef.current.getBoundingClientRect();
                    if (selectedLayout === "wide") {
                        // Horizontal split at bottom: Input vs Output
                        const relativeX = e.clientX - rect.left;
                        const newPercentage = Math.max(20, Math.min(80, (relativeX / rect.width) * 100));
                        setSecondaryContentWidth(newPercentage);
                    }
                }
                requestRef.current = null;
            });
        };

        const handleMouseUp = () => {
            isResizingMain.current = false;
            isResizingSecondary.current = false;
            setIsResizing(false);
            document.body.style.cursor = "default";
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
        };

        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 1024);
        };

        window.addEventListener("resize", checkScreenSize);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("resize", checkScreenSize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const handleMouseDownMain = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        isResizingMain.current = true;
        setIsResizing(true);
        document.body.style.cursor = "col-resize";
    }, []);

    const handleMouseDownSecondary = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        isResizingSecondary.current = true;
        setIsResizing(true);
        document.body.style.cursor = selectedLayout === "classic" ? "row-resize" : "col-resize";
    }, [selectedLayout]);

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
        const target = mobileTab === "code" ? mobileCodeRef.current : mobileOutputRef.current;
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
    }, [isMobile, mobileTab]);

    useEffect(() => {
        if (isMounted) sessionStorage.setItem("code-ide-code", code);
    }, [code, isMounted]);

    useEffect(() => {
        if (isMounted) sessionStorage.setItem("code-ide-input", input);
    }, [input, isMounted]);

    useEffect(() => {
        localStorage.setItem(IDE_LAYOUT_STORAGE_KEY, selectedLayout);
    }, [selectedLayout]);

    useEffect(() => {
        if (isMobile && isLayoutModalOpen) {
            setIsLayoutModalOpen(false);
        }
    }, [isMobile, isLayoutModalOpen]);

    useEffect(() => {
        const handleOpenLayoutModal = () => {
            if (!isMobile) setIsLayoutModalOpen(true);
        };

        window.addEventListener("open-code-ide-ui-grid-modal", handleOpenLayoutModal);
        return () => window.removeEventListener("open-code-ide-ui-grid-modal", handleOpenLayoutModal);
    }, [isMobile]);

    useEffect(() => {
        if (!isMounted) return;
        if (output) {
            sessionStorage.setItem("code-ide-output", JSON.stringify(output));
            if (outputRef.current) {
                anime({
                    targets: outputRef.current,
                    opacity: [0, 1],
                    translateY: [10, 0],
                    duration: 400,
                    easing: "easeOutQuad"
                });
            }
        } else {
            sessionStorage.removeItem("code-ide-output");
        }
    }, [output, isMounted]);

    const handleRun = async () => {
        if (!user) {
            router.push(`/login?next=${encodeURIComponent(pathname)}`);
            return;
        }
        if (isLoading) return;
        if (isMobile) {
            setMobileTab("output");
        }
        setIsLoading(true);
        setOutput(null);
        try {
            const res = await runCode(code, input);
            setOutput(res);
        } catch (error: unknown) {
            const err = error as Error;
            setOutput({
                stdout: "",
                stderr: err.message || "Something went wrong",
                status: "Internal Error",
                duration: 0
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setInput("");
        setOutput(null);
        sessionStorage.removeItem("code-ide-input");
        sessionStorage.removeItem("code-ide-output");
    };

    if (!isMounted) return null;

    const titlePanel = (
        <div className="flex flex-col gap-1 px-4">
            <h1 className="text-3xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                Code <span className="text-indigo-600 dark:text-indigo-400">IDE</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em]">Think, build, and prototype</p>
        </div>
    );

    const editorPanel = (
        <div className="h-full min-h-0 flex flex-col rounded-[2rem] border border-slate-300/70 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(24,33,50,0.9))] backdrop-blur-2xl shadow-[0_18px_48px_rgba(2,6,23,0.32)] dark:border-slate-700/70 dark:bg-[linear-gradient(180deg,rgba(12,18,30,0.95),rgba(10,15,26,0.9))] dark:shadow-[0_18px_48px_rgba(2,6,23,0.4)] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/70 flex items-center justify-between bg-slate-900/40">
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.3)]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                    </div>
                    <div className="h-4 w-px bg-slate-700/70" />
                    <div className="flex items-center gap-2">
                        <div className="p-1 px-2 rounded-md bg-indigo-500/10 text-[10px] font-black text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">PY</div>
                        <span className="text-xs font-bold text-slate-300 tracking-tight">playground.py</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        disabled={isLoading}
                        title="Reset IDE"
                        className="p-2 rounded-xl transition-all duration-200 bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 active:scale-95"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={isLoading || isAuthLoading || !user}
                        title="Run Code"
                        className={`group relative p-2.5 rounded-xl transition-all duration-200 shadow-[0_8px_20px_rgba(0,0,0,0.3)] overflow-hidden active:scale-95 ${isLoading
                            ? "bg-slate-700 text-slate-500"
                            : isAuthLoading || !user
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                            : "bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] text-white hover:brightness-110"
                            }`}
                    >
                        <div className="relative z-10 flex items-center justify-center">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className={`w-4 h-4 fill-current ${isAuthLoading || !user ? "opacity-50" : ""}`} />}
                        </div>
                        {!isLoading && (
                            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        )}
                    </button>
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
        </div>
    );

    const inputPanel = (
        <div className="h-full min-h-0 flex flex-col rounded-[2rem] border border-slate-300/70 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(24,33,50,0.9))] backdrop-blur-2xl shadow-[0_18px_48px_rgba(2,6,23,0.32)] dark:border-slate-700/70 dark:bg-[linear-gradient(180deg,rgba(12,18,30,0.95),rgba(10,15,26,0.9))] dark:shadow-[0_18px_48px_rgba(2,6,23,0.4)] overflow-hidden transition-all duration-300 hover:shadow-indigo-500/10">
            <div className="px-6 py-4 border-b border-slate-700/70 flex items-center gap-2 bg-slate-900/40">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Input Stream</h2>
            </div>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-6 bg-transparent outline-none resize-none font-mono text-sm text-slate-200 placeholder:text-slate-600 border-none selection:bg-indigo-500/30"
                placeholder="Write input here..."
            />
        </div>
    );

    const outputPanel = (
        isAuthLoading ? (
            <div className="h-full min-h-0 flex flex-col items-center justify-center rounded-[2rem] border border-slate-300/70 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(24,33,50,0.9))] text-slate-400">
                Checking login state...
            </div>
        ) : !user ? (
            <LoginPrompt
                title="Login to run code"
                description="Code execution is disabled until you sign in."
                nextPath={pathname}
            />
        ) : (
        <div className="h-full min-h-0 flex flex-col rounded-[2rem] border border-slate-300/70 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(24,33,50,0.9))] backdrop-blur-2xl shadow-[0_18px_48px_rgba(2,6,23,0.32)] dark:border-slate-700/70 dark:bg-[linear-gradient(180deg,rgba(12,18,30,0.95),rgba(10,15,26,0.9))] dark:shadow-[0_18px_48px_rgba(2,6,23,0.4)] overflow-hidden transition-all duration-300 hover:shadow-purple-500/10">
            <div className="px-6 py-4 border-b border-slate-700/70 flex items-center justify-between bg-slate-900/40">
                <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Output Sink</h2>
                </div>

                {output && (
                    <div className="flex items-center gap-2">
                        <div className="px-2 py-1 rounded-lg bg-slate-800/80 text-[10px] font-bold text-slate-400 border border-slate-700/50">
                            {output.duration < 1 ? `${(output.duration * 1000).toFixed(0)}ms` : `${output.duration.toFixed(2)}s`}
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${output.status === "Success"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}>
                            {output.status}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 p-6 relative flex flex-col min-h-0 bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.05),transparent_70%)]">
                {!output && !isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 overflow-hidden">
                        <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700/50">
                            <Terminal className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Waiting for Run</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.2)]" />
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] animate-pulse">Running...</p>
                    </div>
                ) : (
                    <div ref={outputRef} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="flex-1 overflow-auto rounded-2xl bg-slate-950/40 border border-slate-700/30 p-5 font-mono text-sm leading-relaxed text-slate-200 custom-scrollbar">
                            {output?.stdout && (
                                <div className="whitespace-pre-wrap selection:bg-indigo-500/30">{output.stdout}</div>
                            )}
                            {output?.stderr && (
                                <div className="text-rose-400 whitespace-pre-wrap mt-2 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]">
                                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase text-rose-500/60 tracking-widest">
                                        <AlertCircle className="w-3 h-3" /> Error Stream
                                    </div>
                                    {output.stderr}
                                </div>
                            )}
                            {!output?.stdout && !output?.stderr && (
                                <div className="text-slate-500 italic text-xs">No output returned.</div>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between opacity-50 flex-none">
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-emerald-500">➜</span>
                        <span className="text-slate-400">{user ? "python runtime" : "login required"}</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">UTF-8</div>
                </div>
            </div>
        </div>
        )
    );

    const desktopLayoutProps = {
        mainContentRef,
        isResizing,
        mainContentWidth,
        secondaryContentWidth,
        onMouseDownMain: handleMouseDownMain,
        onMouseDownSecondary: handleMouseDownSecondary,
        titlePanel,
        editorPanel,
        inputPanel,
        outputPanel
    };

    return (
        <div className={`flex-1 flex flex-col min-h-0 bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] dark:bg-[#07111d] text-slate-100 relative overflow-hidden font-sans selection:bg-slate-300/30`}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(51,65,85,0.32),transparent_38%),linear-gradient(135deg,rgba(2,6,23,0.18),transparent_35%,rgba(15,23,42,0.3)_100%)]" />
            <div className="pointer-events-none absolute left-[-8%] top-[12%] h-72 w-72 rounded-full bg-indigo-900/20 blur-[130px]" />
            <div className="pointer-events-none absolute bottom-[-6%] right-[-5%] h-80 w-80 rounded-full bg-purple-900/20 blur-[150px]" />
            <div className="pointer-events-none absolute left-[35%] top-[22%] h-56 w-56 rounded-full bg-slate-700/10 blur-[140px]" />

            {!isMounted ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/70 dark:bg-[#07111d] z-50">
                    <div
                        ref={loaderTitleRef}
                        className="text-2xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white via-slate-300 to-slate-500"
                    >
                        {typeof TITLE === 'string' ? TITLE : "Code Judge"} IDE
                    </div>
                    <div
                        className="h-1 bg-slate-700 rounded-full mt-4 overflow-hidden w-48"
                    >
                        <div
                            ref={loaderBarRef}
                            className="w-full h-full bg-white/30"
                        />
                    </div>
                </div>
            ) : (
                <>
                    <div className={`relative z-10 flex-1 flex flex-col p-4 md:p-6 lg:p-8 xl:p-10 ${isMobile && mobileTab === "output" ? "pb-20" : "pb-20"} md:pb-20 lg:pb-8 xl:pb-10 w-full min-h-0 h-full overflow-hidden`}>
                        <div className="lg:hidden flex flex-col gap-1 px-2 mb-4 shrink-0">
                            <h1 className="text-2xl font-black tracking-tighter leading-none text-white">
                                Code <span className="text-indigo-400">IDE</span>
                            </h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em]">Think, build, and prototype</p>
                        </div>

                        {isMobile ? (
                            <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
                                <div
                                    ref={mobileCodeRef}
                                    className={`${mobileTab === "code" ? "flex" : "hidden"} flex-1 min-h-0 flex-col gap-4`}
                                >
                                    <div className="flex-1 min-h-0">{editorPanel}</div>
                                    <div className="h-48 shrink-0">{inputPanel}</div>
                                </div>
                                <div
                                    ref={mobileOutputRef}
                                    className={`${mobileTab === "output" ? "flex" : "hidden"} flex-1 min-h-0`}
                                >
                                    <div className="flex-1 min-h-0">{outputPanel}</div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {selectedLayout === "classic" && <ClassicIdeLayout key="classic" {...desktopLayoutProps} />}
                                {selectedLayout === "wide" && <WideIdeLayout key="wide" {...desktopLayoutProps} />}
                            </>
                        )}
                    </div>

                    {isMobile && (
                        <div
                            className={`fixed bottom-6 left-1/2 z-50 transition-all duration-300 ease-out ${isMobilePillVisible
                                ? "translate-x-[-50%] translate-y-0 opacity-100"
                                : "translate-x-[-50%] translate-y-24 opacity-0 pointer-events-none"
                                }`}
                        >
                            <div className="flex items-center gap-2 p-1.5 rounded-full bg-[linear-gradient(135deg,rgba(8,12,20,0.98),rgba(15,23,42,0.92))] backdrop-blur-3xl border border-slate-700/70 shadow-[0_18px_42px_rgba(2,6,23,0.35)]">
                                <button
                                    onClick={() => setMobileTab("code")}
                                    className={`relative px-4 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-16 ${mobileTab === "code"
                                        ? "bg-slate-800/70 text-white"
                                        : "text-slate-400 hover:bg-slate-800/60"
                                        }`}
                                >
                                    <Code2 className={`w-5 h-5 ${mobileTab === "code" ? "stroke-[2.5px]" : "stroke-2"}`} />
                                    <span className="text-[10px] font-bold tracking-wide">Code</span>
                                </button>
                                <button
                                    onClick={() => setMobileTab("output")}
                                    className={`relative px-4 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-16 ${mobileTab === "output"
                                        ? "bg-slate-800/70 text-white"
                                        : "text-slate-400 hover:bg-slate-800/60"
                                        }`}
                                >
                                    <Terminal className={`w-5 h-5 ${mobileTab === "output" ? "stroke-[2.5px]" : "stroke-2"}`} />
                                    <span className="text-[10px] font-bold tracking-wide">Output</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {isLayoutModalOpen && !isMobile && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                            <button
                                onClick={() => setIsLayoutModalOpen(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                aria-label="Close layout selector"
                            />
                            <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-slate-700/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.97),rgba(10,15,26,0.95))] backdrop-blur-2xl shadow-[0_18px_48px_rgba(2,6,23,0.35)] p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Select UI Grid</h3>
                                        <p className="text-sm text-slate-400">Choose a layout for the Code IDE workspace.</p>
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
                                    {ideLayoutOptions.map((option) => (
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
                                                {selectedLayout === option.id && <PanelTop className="w-4 h-4 text-indigo-400" />}
                                            </div>
                                            <p className="mt-1 text-xs text-slate-400">{option.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
