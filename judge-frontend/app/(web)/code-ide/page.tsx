"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { anime } from "../../lib/anime";
import { useAppContext } from "../../lib/context";
import { runCode } from "../../lib/api";
import { Play, Terminal, Cpu, AlertCircle, Loader2, MessageSquare, RotateCcw, X, PanelTop, Code2 } from "lucide-react";

import CodeEditor from "../../../components/Editor/CodeEditor";
import { ideLayoutOptions, IdeUiLayout } from "./layoutOptions";
import ClassicIdeLayout from "./layouts/ClassicIdeLayout";
import WideIdeLayout from "./layouts/WideIdeLayout";
import { useAuth } from "../../lib/auth-context";
import LoginPrompt from "../../../components/Auth/LoginPrompt";

const IDE_LAYOUT_STORAGE_KEY = "codeide_ui_grid_layout";

export default function CodeTestPage() {
    const { isDark, autoHideMobilePills, useNewUi } = useAppContext();
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

    const mainContentRef = useRef<HTMLDivElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);
    const mobileCodeRef = useRef<HTMLDivElement>(null);
    const mobileOutputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (useNewUi && pathname === "/code-ide") {
            router.replace("/code-ide-mde");
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
        const onResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

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
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Think, build, and prototype</p>
        </div>
    );

    const editorPanel = (
        <div className="h-full min-h-0 flex flex-col bg-white dark:bg-gray-900 shadow-2xl shadow-gray-200/50 dark:shadow-none rounded-4xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/80 dark:bg-gray-800/50 border border-red-500/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80 dark:bg-gray-800/50 border border-amber-500/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/80 dark:bg-gray-800/50 border border-green-500/10" />
                    </div>
                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-800" />
                    <div className="flex items-center gap-2">
                        <div className="p-1 px-2 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-black text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 uppercase tracking-wider">PY</div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-tight">playground.py</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        disabled={isLoading}
                        title="Reset IDE"
                        className="p-2 rounded-xl transition-[background-color,color,border-color,box-shadow,transform] duration-200 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-100 dark:hover:border-blue-900/50 hover:shadow-sm active:scale-95"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={isLoading || isAuthLoading || !user}
                        title="Run Code"
                        className={`group relative p-2.5 rounded-xl transition-[background-color,transform] duration-200 shadow-lg overflow-hidden active:scale-95 ${isLoading
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400"
                            : isAuthLoading || !user
                            ? "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                            : "bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700"
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
        <div className="h-full min-h-0 flex flex-col bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-none rounded-4xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-shadow duration-300 hover:shadow-2xl hover:shadow-indigo-500/5">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Input Stream</h2>
            </div>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-6 bg-transparent outline-none resize-none font-mono text-sm placeholder:text-gray-300 dark:placeholder:text-gray-700 border-none"
                placeholder="Write input here..."
            />
        </div>
    );

    const outputPanel = (
        isAuthLoading ? (
            <div className="h-full min-h-0 flex flex-col items-center justify-center rounded-4xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Checking login state...
            </div>
        ) : !user ? (
            <LoginPrompt
                title="Login to run code"
                description="Code execution is disabled until you sign in."
                nextPath={pathname}
            />
        ) : (
        <div className="h-full min-h-0 flex flex-col bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-none rounded-4xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-shadow duration-300 hover:shadow-2xl hover:shadow-purple-500/5">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-500" />
                    <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Output Sink</h2>
                </div>

                {output && (
                    <div className="flex items-center gap-2">
                        <div className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500">
                            {output.duration < 1 ? `${(output.duration * 1000).toFixed(0)}ms` : `${output.duration.toFixed(2)}s`}
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${output.status === "Success"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}>
                            {output.status}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 p-6 relative flex flex-col min-h-0 bg-[radial-gradient(circle_at_bottom_right,var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent">
                {!output && !isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 overflow-hidden">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                            <Terminal className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Waiting for Run</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest animate-pulse">Running...</p>
                    </div>
                ) : (
                    <div ref={outputRef} className="flex-1 flex flex-col min-h-0 overflow-hidden opacity-0">
                        <div className="flex-1 overflow-auto rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800/50 p-5 font-mono text-sm leading-relaxed custom-scrollbar">
                            {output?.stdout && (
                                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{output.stdout}</div>
                            )}
                            {output?.stderr && (
                                <div className="text-red-500 dark:text-red-400 whitespace-pre-wrap mt-2 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase text-red-500 opacity-60">
                                        <AlertCircle className="w-3 h-3" /> Error Stream
                                    </div>
                                    {output.stderr}
                                </div>
                            )}
                            {!output?.stdout && !output?.stderr && (
                                <div className="text-gray-400 italic text-xs">No output returned.</div>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between opacity-50 flex-none">
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-green-500">➜</span>
                        <span className="text-gray-500 dark:text-gray-400">{user ? "python runtime" : "login required"}</span>
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">UTF-8</div>
                </div>
            </div>
        </div>
        )
    );

    const desktopLayoutProps = {
        mainContentRef,
        titlePanel,
        editorPanel,
        inputPanel,
        outputPanel
    };

    return (
        <div className={`flex-1 flex flex-col min-h-0 text-gray-900 dark:text-gray-50 relative overflow-x-hidden ${(isMobile && mobileTab === "output") ? "overflow-y-hidden" : "overflow-y-auto"} lg:overflow-hidden font-sans transition-colors duration-200`}>
            <div className="absolute top-0 right-[-10%] w-125 h-125 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-100 h-100 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/4 w-75 h-75 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className={`relative z-10 flex-1 flex flex-col p-4 md:p-6 lg:p-8 xl:p-12 ${isMobile && mobileTab === "output" ? "pb-16" : "pb-16"} md:pb-16 lg:pb-8 xl:pb-12 max-w-450 mx-auto w-full gap-4 md:gap-6 lg:gap-8 min-h-0 lg:h-full`}>
                <div className="lg:hidden flex flex-col gap-1 px-2 mb-2">
                    <h1 className="text-2xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Code <span className="text-indigo-600 dark:text-indigo-400">IDE</span>
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Think, build, and prototype</p>
                </div>

                {isMobile ? (
                    <div className="flex-1 flex flex-col gap-4 min-h-0">
                        <div
                            ref={mobileCodeRef}
                            className={`${mobileTab === "code" ? "flex" : "hidden"} flex-1 min-h-0 flex-col gap-3`}
                        >
                            <div className="flex-1 min-h-0">{editorPanel}</div>
                            <div className="h-44 shrink-0">{inputPanel}</div>
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

                <div className={`lg:hidden w-full flex-none ${isMobile && mobileTab === "code" ? "h-8" : "h-6"}`} />
            </div>

            {isMobile && (
                <div
                    className={`fixed bottom-6 left-1/2 z-50 transition-all duration-300 ease-out ${isMobilePillVisible
                        ? "translate-x-[-50%] translate-y-0 opacity-100"
                        : "translate-x-[-50%] translate-y-24 opacity-0 pointer-events-none"
                        }`}
                >
                    <div className="flex items-center gap-4 p-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/10 ring-1 ring-black/5">
                        <button
                            onClick={() => setMobileTab("code")}
                            className={`relative px-4 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-18 ${mobileTab === "code"
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-500/50"
                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/30 dark:hover:bg-gray-800/30"
                                }`}
                        >
                            <Code2 className={`w-5 h-5 ${mobileTab === "code" ? "stroke-[2.5px]" : "stroke-2"}`} />
                            <span className="text-[10px] font-bold tracking-wide">Code</span>
                        </button>
                        <button
                            onClick={() => setMobileTab("output")}
                            className={`relative px-4 py-2 rounded-full transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 min-w-18 ${mobileTab === "output"
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-500/50"
                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/30 dark:hover:bg-gray-800/30"
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
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        aria-label="Close layout selector"
                    />
                    <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 dark:border-gray-700/60 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Select UI Grid</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Choose a layout for the Code IDE workspace.</p>
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
                            {ideLayoutOptions.map((option) => (
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
        </div>
    );
}
