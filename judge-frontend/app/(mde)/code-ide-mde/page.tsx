"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { anime } from "../../lib/anime";
import { useAppContext } from "../../lib/context";
import { runCode } from "../../lib/api";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <h1 className={`text-3xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-linear-to-r ${isDark ? "from-white via-slate-300 to-slate-500" : "from-slate-900 via-slate-700 to-slate-500"}`}>
                Code <span className={isDark ? "text-indigo-400" : "text-indigo-600"}>IDE</span>
            </h1>
            <p className={`text-[10px] font-bold uppercase tracking-[0.25em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Think, build, and prototype</p>
        </div>
    );

    const editorPanel = (
        <div className={`h-full min-h-0 flex flex-col rounded-4xl border backdrop-blur-2xl overflow-hidden ${isDark
            ? "border-slate-700/70 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(24,33,50,0.9))] shadow-[0_18px_48px_rgba(2,6,23,0.32)]"
            : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
            }`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? "border-slate-700/70 bg-slate-900/40" : "border-slate-100 bg-slate-50/70"}`}>
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${isDark ? "bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.3)]" : "bg-rose-400 shadow-sm"}`} />
                        <div className={`w-2.5 h-2.5 rounded-full ${isDark ? "bg-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "bg-amber-400 shadow-sm"}`} />
                        <div className={`w-2.5 h-2.5 rounded-full ${isDark ? "bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-emerald-400 shadow-sm"}`} />
                    </div>
                    <div className={`h-4 w-px ${isDark ? "bg-slate-700/70" : "bg-slate-200"}`} />
                    <div className="flex items-center gap-2">
                        <div className={`p-1 px-2 rounded-md text-[10px] font-black border uppercase tracking-wider ${isDark ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}>PY</div>
                        <span className={`text-xs font-bold tracking-tight ${isDark ? "text-slate-300" : "text-slate-500"}`}>playground.py</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        disabled={isLoading}
                        title="Reset IDE"
                        className={`p-2 rounded-xl transition-all duration-200 active:scale-95 ${isDark
                            ? "bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30"
                            : "bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm"
                            }`}
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={isLoading || isAuthLoading || !user}
                        title="Run Code"
                        className={`group relative p-2.5 rounded-xl transition-all duration-200 overflow-hidden active:scale-95 ${isLoading
                            ? isDark
                                ? "bg-slate-700 text-slate-500"
                                : "bg-slate-100 text-slate-400"
                            : isAuthLoading || !user
                                ? isDark
                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] text-white hover:brightness-110 shadow-[0_8px_20px_rgba(79,70,229,0.25)]"
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
        <div className={`h-full min-h-0 flex flex-col rounded-4xl border backdrop-blur-2xl overflow-hidden transition-all duration-300 hover:shadow-indigo-500/10 ${isDark
            ? "border-slate-700/70 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(24,33,50,0.9))] shadow-[0_18px_48px_rgba(2,6,23,0.32)]"
            : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
            }`}>
            <div className={`px-6 py-4 border-b flex items-center gap-2 ${isDark ? "border-slate-700/70 bg-slate-900/40" : "border-slate-100 bg-slate-50/70"}`}>
                <MessageSquare className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-500"}`} />
                <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Input Stream</h2>
            </div>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={`flex-1 p-6 bg-transparent outline-none resize-none font-mono text-sm border-none ${isDark ? "text-slate-200 placeholder:text-slate-600 selection:bg-indigo-500/30" : "text-slate-700 placeholder:text-slate-400 selection:bg-indigo-500/20"}`}
                placeholder="Write input here..."
            />
        </div>
    );

    const outputPanel = (
        isAuthLoading ? (
            <div className={`h-full min-h-0 flex flex-col items-center justify-center rounded-4xl border ${isDark
                ? "border-slate-700/70 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(24,33,50,0.9))] text-slate-400"
                : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] text-slate-500"
                }`}>
                Checking login state...
            </div>
        ) : !user ? (
            <LoginPrompt
                title="Login to run code"
                description="Code execution is disabled until you sign in."
                nextPath={pathname}
            />
        ) : (
        <div className={`h-full min-h-0 flex flex-col rounded-4xl border backdrop-blur-2xl overflow-hidden transition-all duration-300 hover:shadow-purple-500/10 ${isDark
            ? "border-slate-700/70 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(24,33,50,0.9))] shadow-[0_18px_48px_rgba(2,6,23,0.32)]"
            : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
            }`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? "border-slate-700/70 bg-slate-900/40" : "border-slate-100 bg-slate-50/70"}`}>
                <div className="flex items-center gap-2">
                    <Cpu className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-500"}`} />
                    <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Output Sink</h2>
                </div>

                {output && (
                    <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${isDark ? "bg-slate-800/80 text-slate-400 border-slate-700/50" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
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

            <div className={`flex-1 p-6 relative flex flex-col min-h-0 ${isDark ? "bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.05),transparent_70%)]" : "bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.06),transparent_70%)]"}`}>
                {!output && !isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 overflow-hidden">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-slate-100 border-slate-200"}`}>
                            <Terminal className={`w-6 h-6 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                        </div>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Waiting for Run</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.2)]" />
                        <p className={`text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>Running...</p>
                    </div>
                ) : (
                    <div ref={outputRef} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className={`flex-1 overflow-auto rounded-2xl border p-5 font-mono text-sm leading-relaxed custom-scrollbar ${isDark ? "bg-slate-950/40 border-slate-700/30 text-slate-200" : "bg-slate-50 border-slate-100 text-slate-800"}`}>
                            {output?.stdout && (
                                <div className="whitespace-pre-wrap selection:bg-indigo-500/30">{output.stdout}</div>
                            )}
                            {output?.stderr && (
                                <div className={`whitespace-pre-wrap mt-2 p-4 rounded-xl border ${isDark ? "text-rose-400 bg-rose-500/5 border-rose-500/10 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]" : "text-rose-600 bg-rose-50 border-rose-100"}`}>
                                    <div className={`flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest ${isDark ? "text-rose-500/60" : "text-rose-500"}`}>
                                        <AlertCircle className="w-3 h-3" /> Error Stream
                                    </div>
                                    {output.stderr}
                                </div>
                            )}
                            {!output?.stdout && !output?.stderr && (
                                <div className={`italic text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>No output returned.</div>
                            )}
                        </div>
                    </div>
                )}

                <div className={`mt-4 pt-4 flex items-center justify-between opacity-50 flex-none ${isDark ? "border-t border-slate-800/50" : "border-t border-slate-100"}`}>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-emerald-500">➜</span>
                        <span className={isDark ? "text-slate-400" : "text-slate-500"}>{user ? "python runtime" : "login required"}</span>
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>UTF-8</div>
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
        <div className={`flex-1 flex flex-col min-h-0 relative overflow-hidden font-sans ${isDark
            ? "text-slate-100 selection:bg-slate-300/30"
            : "text-slate-900 selection:bg-indigo-500/20"
            }`}>
            <div className={`pointer-events-none absolute inset-0 ${isDark
                ? "bg-[radial-gradient(circle_at_top,rgba(51,65,85,0.32),transparent_38%),linear-gradient(135deg,rgba(2,6,23,0.18),transparent_35%,rgba(15,23,42,0.3)_100%)]"
                : "bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.55),transparent_36%,rgba(224,231,255,0.8)_100%)]"
                }`} />
            <div className={`pointer-events-none absolute left-[-8%] top-[12%] h-72 w-72 rounded-full blur-[130px] ${isDark ? "bg-indigo-900/20" : "bg-indigo-200/60"}`} />
            <div className={`pointer-events-none absolute bottom-[-6%] right-[-5%] h-80 w-80 rounded-full blur-[150px] ${isDark ? "bg-purple-900/20" : "bg-purple-200/60"}`} />
            <div className={`pointer-events-none absolute left-[35%] top-[22%] h-56 w-56 rounded-full blur-[140px] ${isDark ? "bg-slate-700/10" : "bg-slate-200/70"}`} />

            {!isMounted ? (
                <div className={`flex-1 flex flex-col items-center justify-center z-50 ${isDark ? "bg-slate-950/70" : "bg-white/80"}`}>
                    <div
                        ref={loaderTitleRef}
                        className={`text-2xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r ${isDark ? "from-white via-slate-300 to-slate-500" : "from-slate-900 via-slate-700 to-slate-500"}`}
                    >
                        {typeof TITLE === 'string' ? TITLE : "Code Judge"} IDE
                    </div>
                    <div
                        className={`h-1 rounded-full mt-4 overflow-hidden w-48 ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                    >
                        <div
                            ref={loaderBarRef}
                            className={`w-full h-full ${isDark ? "bg-white/30" : "bg-indigo-500/30"}`}
                        />
                    </div>
                </div>
            ) : (
                <>
                    <div className={`relative z-10 flex-1 flex flex-col p-4 md:p-6 lg:p-8 xl:p-10 ${isMobile && mobileTab === "output" ? "pb-20" : "pb-20"} md:pb-20 lg:pb-8 xl:pb-10 w-full min-h-0 h-full overflow-hidden`}>
                        <div className="lg:hidden flex flex-col gap-1 px-2 mb-4 shrink-0">
                            <h1 className={`text-2xl font-black tracking-tighter leading-none ${isDark ? "text-white" : "text-slate-900"}`}>
                                Code <span className={isDark ? "text-indigo-400" : "text-indigo-600"}>IDE</span>
                            </h1>
                            <p className={`text-[10px] font-bold uppercase tracking-[0.25em] ${isDark ? "text-slate-500" : "text-slate-500"}`}>Think, build, and prototype</p>
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
                            <div className={`flex items-center gap-2 p-1.5 rounded-full backdrop-blur-3xl border ${isDark ? "bg-[linear-gradient(135deg,rgba(8,12,20,0.98),rgba(15,23,42,0.92))] border-slate-700/70 shadow-[0_18px_42px_rgba(2,6,23,0.35)]" : "bg-white/90 border-slate-200 shadow-[0_18px_42px_rgba(15,23,42,0.12)]"}`}>
                                <button
                                    onClick={() => setMobileTab("code")}
                                    className={`relative px-4 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-16 ${mobileTab === "code"
                                        ? isDark
                                            ? "bg-slate-800/70 text-white"
                                            : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-500/50"
                                        : isDark
                                            ? "text-slate-400 hover:bg-slate-800/60"
                                            : "text-slate-500 hover:bg-slate-100"
                                        }`}
                                >
                                    <Code2 className={`w-5 h-5 ${mobileTab === "code" ? "stroke-[2.5px]" : "stroke-2"}`} />
                                    <span className="text-[10px] font-bold tracking-wide">Code</span>
                                </button>
                                <button
                                    onClick={() => setMobileTab("output")}
                                    className={`relative px-4 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-16 ${mobileTab === "output"
                                        ? isDark
                                            ? "bg-slate-800/70 text-white"
                                            : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-500/50"
                                        : isDark
                                            ? "text-slate-400 hover:bg-slate-800/60"
                                            : "text-slate-500 hover:bg-slate-100"
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
                                className={`absolute inset-0 backdrop-blur-sm ${isDark ? "bg-black/60" : "bg-black/40"}`}
                                aria-label="Close layout selector"
                            />
                            <div className={`relative z-10 w-full max-w-md rounded-4xl border backdrop-blur-2xl p-5 ${isDark
                                ? "border-slate-700/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.97),rgba(10,15,26,0.95))] shadow-[0_18px_48px_rgba(2,6,23,0.35)]"
                                : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] shadow-[0_18px_48px_rgba(15,23,42,0.14)]"
                                }`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Select UI Grid</h3>
                                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Choose a layout for the Code IDE workspace.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsLayoutModalOpen(false)}
                                        className={`p-2 rounded-full transition-colors ${isDark ? "hover:bg-slate-800/70" : "hover:bg-slate-100"}`}
                                        aria-label="Close"
                                    >
                                        <X className={`w-4 h-4 ${isDark ? "text-slate-300" : "text-slate-600"}`} />
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
                                                ? isDark
                                                    ? "border-slate-600/70 bg-slate-800/70"
                                                    : "border-indigo-500 bg-indigo-50"
                                                : isDark
                                                    ? "border-slate-700/70 hover:border-slate-500/70 hover:bg-slate-800/60"
                                                    : "border-slate-200 hover:border-indigo-400/60 hover:bg-slate-50"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{option.label}</span>
                                                {selectedLayout === option.id && <PanelTop className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />}
                                            </div>
                                            <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{option.description}</p>
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
