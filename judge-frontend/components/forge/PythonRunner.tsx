"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Play,
    Square,
    Terminal,
    Cpu,
    Clock,
    RotateCcw,
    Copy,
    Check,
    AlertCircle,
    Loader2,
    Sparkles,
    Code2,
    Boxes,
    ChevronDown,
    ChevronRight,
    Zap,
    HelpCircle
} from "lucide-react";
import { usePyodideWorker, type RunCodeOptions } from "../../hooks/usePyodideWorker";
import type { VirtualFile } from "../../types/pyodide";

export interface PythonRunnerProps {
    code: string;
    files?: VirtualFile[];
    activeFilePath?: string;
    onExecutionComplete?: (result: {
        stdout: string;
        stderr: string;
        executionTimeMs: number;
        status: string;
    }) => void;
    className?: string;
    theme?: "dark" | "light";
}

export default function PythonRunner({
    code,
    files = [],
    activeFilePath = "main.py",
    onExecutionComplete,
    className = "",
    theme = "dark"
}: PythonRunnerProps) {
    const {
        runCode,
        terminate,
        clearOutput,
        init,
        isLoading,
        isRunning,
        isReady,
        statusMessage,
        stdout,
        stderr,
        error,
        lastResult
    } = usePyodideWorker();

    const [stdin, setStdin] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"output" | "stdin" | "packages">("output");
    const [copied, setCopied] = useState(false);
    const [customTimeout, setCustomTimeout] = useState<number>(20);
    const [showSettings, setShowSettings] = useState(false);
    const [autoInstallPackages, setAutoInstallPackages] = useState(true);

    const outputEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll output console during streaming
    useEffect(() => {
        if (outputEndRef.current) {
            outputEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [stdout, stderr, statusMessage]);

    // Handle Copy to clipboard
    const handleCopyOutput = () => {
        const textToCopy = [stdout, stderr].filter(Boolean).join("\n");
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Trigger Code Execution
    const handleRun = async () => {
        if (isRunning) return;

        try {
            const options: RunCodeOptions = {
                stdin,
                files: files.length > 0 ? files : [{ path: activeFilePath, content: code }],
                timeoutMs: customTimeout * 1000,
                autoLoadPackages: autoInstallPackages
            };

            const result = await runCode(code, options);

            if (onExecutionComplete) {
                onExecutionComplete({
                    stdout: result.stdout,
                    stderr: result.stderr,
                    executionTimeMs: result.executionTimeMs,
                    status: result.status
                });
            }
        } catch (err: any) {
            console.error("[PythonRunner] Execution failed:", err);
        }
    };

    // Keyboard shortcut (Ctrl/Cmd + Enter)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handleRun();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [code, stdin, files, customTimeout, autoInstallPackages, isRunning]);

    const hasOutput = Boolean(stdout || stderr || lastResult);

    return (
        <div
            className={`flex flex-col h-full bg-[#0B0C15] text-gray-100 rounded-xl border border-gray-800/80 shadow-2xl overflow-hidden font-sans ${className}`}
        >
            {/* Header Control Toolbar */}
            <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#121324]/90 backdrop-blur-md border-b border-gray-800/70 gap-2">
                {/* Engine Info & Badges */}
                <div className="flex items-center space-x-2.5">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                        <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span>Client WASM</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Pyodide v0.26</span>
                    </div>

                    {/* Runtime Status Pill */}
                    <div className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700/50">
                        <span
                            className={`w-2 h-2 rounded-full ${
                                isRunning
                                    ? "bg-amber-400 animate-ping"
                                    : isReady
                                    ? "bg-emerald-400"
                                    : isLoading
                                    ? "bg-sky-400 animate-pulse"
                                    : "bg-gray-500"
                            }`}
                        />
                        <span className="text-gray-300 capitalize text-[11px]">
                            {isRunning ? "Running" : isReady ? "Ready" : isLoading ? "Loading..." : "Idle"}
                        </span>
                    </div>

                    {lastResult && (
                        <div className="hidden md:flex items-center gap-1 text-xs text-gray-400 px-2 py-0.5 rounded bg-gray-800/40">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <span>{lastResult.executionTimeMs}ms</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                    {/* Clear Button */}
                    <button
                        onClick={clearOutput}
                        disabled={!hasOutput || isRunning}
                        title="Clear console output"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 disabled:opacity-40 disabled:hover:bg-transparent transition"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Copy Button */}
                    <button
                        onClick={handleCopyOutput}
                        disabled={!hasOutput}
                        title="Copy output to clipboard"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 disabled:opacity-40 disabled:hover:bg-transparent transition"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    {/* Stop / Kill Process Button */}
                    {isRunning ? (
                        <button
                            onClick={terminate}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition animate-pulse"
                            title="Force kill Python execution process"
                        >
                            <Square className="w-3.5 h-3.5 fill-current" />
                            <span>Stop</span>
                        </button>
                    ) : null}

                    {/* Run Code Button */}
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold shadow-lg transition select-none ${
                            isRunning
                                ? "bg-indigo-600/50 text-indigo-200 cursor-not-allowed"
                                : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-indigo-500/20 active:scale-95"
                        }`}
                    >
                        {isRunning ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Running...</span>
                            </>
                        ) : isLoading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Loading WASM...</span>
                            </>
                        ) : (
                            <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Run Code</span>
                                <span className="hidden lg:inline text-[10px] text-white/70 font-mono bg-white/10 px-1 rounded">
                                    ⌘↵
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between px-3 bg-[#0d0e1c] border-b border-gray-800/60">
                <div className="flex space-x-1">
                    <button
                        onClick={() => setActiveTab("output")}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition ${
                            activeTab === "output"
                                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                                : "border-transparent text-gray-400 hover:text-gray-200"
                        }`}
                    >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Terminal Output</span>
                        {(stdout || stderr) && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab("stdin")}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition ${
                            activeTab === "stdin"
                                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                                : "border-transparent text-gray-400 hover:text-gray-200"
                        }`}
                    >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Standard Input (stdin)</span>
                        {stdin && (
                            <span className="text-[10px] bg-gray-800 text-gray-400 px-1 rounded font-mono">
                                active
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab("packages")}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition ${
                            activeTab === "packages"
                                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                                : "border-transparent text-gray-400 hover:text-gray-200"
                        }`}
                    >
                        <Boxes className="w-3.5 h-3.5" />
                        <span>Packages & Runtime</span>
                    </button>
                </div>

                {/* Status message ticker */}
                <div className="hidden sm:flex items-center text-[11px] text-gray-400 truncate max-w-xs px-2">
                    <span className="truncate">{statusMessage}</span>
                </div>
            </div>

            {/* Main Console Content Body */}
            <div className="flex-1 overflow-auto p-4 bg-[#080911] font-mono text-xs leading-relaxed select-text">
                {activeTab === "output" && (
                    <div className="h-full flex flex-col justify-between space-y-2">
                        <div>
                            {/* Terminal Greeting & Command Echo */}
                            <div className="text-gray-500 flex items-center gap-2 pb-2 select-none border-b border-gray-800/40 mb-2">
                                <span className="text-emerald-500 font-bold">❯</span>
                                <span className="text-gray-400">python {activeFilePath}</span>
                                <span className="text-[10px] text-gray-600 ml-auto">Pyodide WASM Engine</span>
                            </div>

                            {/* Real-time Status Notice */}
                            {isRunning && (
                                <div className="flex items-center gap-2 text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg my-2">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                                    <span>{statusMessage || "Executing script..."}</span>
                                </div>
                            )}

                            {/* Standard Output (stdout) */}
                            {stdout && (
                                <pre className="text-emerald-300 whitespace-pre-wrap break-words selection:bg-emerald-500/30">
                                    {stdout}
                                </pre>
                            )}

                            {/* Standard Error (stderr / Traceback) */}
                            {stderr && (
                                <div className="mt-2 text-rose-400 bg-rose-950/30 border border-rose-800/40 p-3 rounded-lg">
                                    <div className="flex items-center gap-1.5 text-rose-300 font-semibold mb-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>Runtime / Error Output:</span>
                                    </div>
                                    <pre className="whitespace-pre-wrap break-words text-rose-200 selection:bg-rose-500/30">
                                        {stderr}
                                    </pre>
                                </div>
                            )}

                            {/* Empty State */}
                            {!stdout && !stderr && !isRunning && (
                                <div className="h-48 flex flex-col items-center justify-center text-gray-500 space-y-2 select-none">
                                    <Terminal className="w-8 h-8 text-gray-700" />
                                    <p className="text-xs">No execution output yet.</p>
                                    <p className="text-[11px] text-gray-600">
                                        Click <span className="text-indigo-400 font-semibold">Run Code</span> or press{" "}
                                        <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-mono text-[10px]">
                                            Cmd/Ctrl + Enter
                                        </kbd>
                                    </p>
                                </div>
                            )}

                            <div ref={outputEndRef} />
                        </div>

                        {/* Bottom Metric Bar */}
                        {lastResult && (
                            <div className="pt-3 border-t border-gray-800/40 flex items-center justify-between text-[11px] text-gray-500 select-none">
                                <div className="flex items-center gap-3">
                                    <span>Status: <span className={lastResult.status === "success" ? "text-emerald-400" : "text-rose-400 font-semibold"}>{lastResult.status}</span></span>
                                    <span>Duration: <span className="text-gray-300">{lastResult.executionTimeMs} ms</span></span>
                                </div>
                                <div className="flex items-center gap-1 text-emerald-400/80">
                                    <Sparkles className="w-3 h-3" />
                                    <span>0 Server Cost • Client Compute</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "stdin" && (
                    <div className="h-full flex flex-col space-y-3">
                        <div className="flex items-center justify-between text-gray-400 text-xs">
                            <span className="font-medium text-gray-300">Custom Standard Input (`sys.stdin`)</span>
                            <span className="text-[11px] text-gray-500">Passed line-by-line to `input()`</span>
                        </div>
                        <textarea
                            value={stdin}
                            onChange={(e) => setStdin(e.target.value)}
                            placeholder="Enter test inputs here (e.g. multi-line numbers, text, test cases)..."
                            className="flex-1 w-full p-3 rounded-lg bg-[#121324] border border-gray-800 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 font-mono text-xs resize-none"
                        />
                    </div>
                )}

                {activeTab === "packages" && (
                    <div className="space-y-4 text-xs">
                        <div className="p-3.5 rounded-lg bg-[#121324] border border-gray-800">
                            <h4 className="font-semibold text-gray-200 mb-1 flex items-center gap-2">
                                <Boxes className="w-4 h-4 text-indigo-400" />
                                <span>Zero-Config Package Autoloading</span>
                            </h4>
                            <p className="text-gray-400 text-[11px] mb-3">
                                Any imports such as <code className="text-indigo-300">numpy</code>, <code className="text-indigo-300">pandas</code>, <code className="text-indigo-300">scipy</code>, <code className="text-indigo-300">matplotlib</code>, <code className="text-indigo-300">sympy</code> are automatically downloaded on-demand from the Pyodide CDN.
                            </p>
                            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoInstallPackages}
                                    onChange={(e) => setAutoInstallPackages(e.target.checked)}
                                    className="rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>Auto-detect and download packages on import</span>
                            </label>
                        </div>

                        <div className="p-3.5 rounded-lg bg-[#121324] border border-gray-800">
                            <h4 className="font-semibold text-gray-200 mb-1 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-400" />
                                <span>Execution Watchdog & Safety Limit</span>
                            </h4>
                            <p className="text-gray-400 text-[11px] mb-3">
                                Web Workers are terminated automatically if execution exceeds this threshold to guard against infinite loops.
                            </p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min={5}
                                    max={60}
                                    value={customTimeout}
                                    onChange={(e) => setCustomTimeout(Number(e.target.value))}
                                    className="w-48 accent-indigo-500"
                                />
                                <span className="font-mono text-indigo-400 font-semibold">{customTimeout} seconds</span>
                            </div>
                        </div>

                        {!isReady && !isLoading && (
                            <button
                                onClick={() => init()}
                                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
                            >
                                Preload Pyodide WebAssembly Engine Now
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
