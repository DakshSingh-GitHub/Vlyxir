"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
    ExecutionResult,
    WorkerIncomingMessage,
    WorkerOutgoingMessage,
    VirtualFile,
} from "../types/pyodide";

export interface RunCodeOptions {
    stdin?: string;
    files?: VirtualFile[];
    timeoutMs?: number;
    autoLoadPackages?: boolean;
}

export interface UsePyodideWorkerReturn {
    runCode: (
        code: string,
        stdinOrOptions?: string | RunCodeOptions,
        optionalOptions?: RunCodeOptions
    ) => Promise<ExecutionResult>;
    init: () => Promise<void>;
    terminate: () => void;
    clearOutput: () => void;
    installPackage: (packageName: string) => Promise<void>;
    isLoading: boolean;
    isRunning: boolean;
    isReady: boolean;
    statusMessage: string;
    stdout: string;
    stderr: string;
    error: string | null;
    lastResult: ExecutionResult | null;
}

const DEFAULT_TIMEOUT_MS = 20000; // 20s default timeout protection

export function usePyodideWorker(): UsePyodideWorkerReturn {
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string>("Engine idle");
    const [stdout, setStdout] = useState<string>("");
    const [stderr, setStderr] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);

    const workerRef = useRef<Worker | null>(null);
    const pendingRunRef = useRef<{
        resolve: (val: ExecutionResult) => void;
        reject: (reason: any) => void;
        timeoutId: ReturnType<typeof setTimeout> | null;
        startTime: number;
        id: string;
    } | null>(null);

    const pendingInitRef = useRef<{
        resolve: () => void;
        reject: (err: any) => void;
    } | null>(null);

    /**
     * Initializes or respawns the Web Worker
     */
    const spawnWorker = useCallback((): Worker | null => {
        if (typeof window === "undefined") return null;

        try {
            // Clean up existing worker if any
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }

            const worker = new Worker(
                new URL("../workers/pyodide.worker.ts", import.meta.url),
                { type: "module" }
            );

            worker.onmessage = (event: MessageEvent<WorkerOutgoingMessage>) => {
                const { type, payload, stdout: msgStdout, stderr: msgStderr, executionTimeMs, error: msgError, formattedTraceback, id } = event.data || {};

                switch (type) {
                    case "STATUS":
                    case "PACKAGE_LOADING":
                        if (payload) setStatusMessage(String(payload));
                        break;

                    case "PACKAGE_LOADED":
                        if (payload) setStatusMessage(String(payload));
                        break;

                    case "STDOUT":
                        if (msgStdout) {
                            setStdout((prev) => prev + msgStdout);
                        }
                        break;

                    case "STDERR":
                        if (msgStderr) {
                            setStderr((prev) => prev + msgStderr);
                        }
                        break;

                    case "READY":
                        setIsReady(true);
                        setIsLoading(false);
                        setStatusMessage("Pyodide Engine Ready (WASM)");
                        if (pendingInitRef.current) {
                            pendingInitRef.current.resolve();
                            pendingInitRef.current = null;
                        }
                        break;

                    case "SUCCESS": {
                        const duration = executionTimeMs || (pendingRunRef.current ? Math.round(performance.now() - pendingRunRef.current.startTime) : 0);
                        const resultObj: ExecutionResult = {
                            stdout: payload?.stdout ?? msgStdout ?? "",
                            stderr: payload?.stderr ?? msgStderr ?? "",
                            executionTimeMs: duration,
                            status: "success",
                            result: payload?.result,
                        };

                        if (pendingRunRef.current?.timeoutId) {
                            clearTimeout(pendingRunRef.current.timeoutId);
                        }

                        setIsRunning(false);
                        setStatusMessage(`Execution finished in ${duration}ms`);
                        setLastResult(resultObj);

                        if (pendingRunRef.current) {
                            pendingRunRef.current.resolve(resultObj);
                            pendingRunRef.current = null;
                        }
                        break;
                    }

                    case "ERROR": {
                        const duration = executionTimeMs || (pendingRunRef.current ? Math.round(performance.now() - pendingRunRef.current.startTime) : 0);
                        const errorText = msgError || formattedTraceback || "Execution error";
                        const resultObj: ExecutionResult = {
                            stdout: payload?.stdout ?? msgStdout ?? "",
                            stderr: payload?.stderr ?? msgStderr ?? errorText,
                            executionTimeMs: duration,
                            status: "error",
                            error: errorText,
                            formattedTraceback,
                        };

                        if (pendingRunRef.current?.timeoutId) {
                            clearTimeout(pendingRunRef.current.timeoutId);
                        }

                        if (isLoading) {
                            setIsLoading(false);
                            setError(errorText);
                            if (pendingInitRef.current) {
                                pendingInitRef.current.reject(new Error(errorText));
                                pendingInitRef.current = null;
                            }
                        }

                        setIsRunning(false);
                        setStatusMessage(`Execution failed: ${errorText.slice(0, 45)}...`);
                        setLastResult(resultObj);
                        setError(errorText);

                        if (pendingRunRef.current) {
                            pendingRunRef.current.resolve(resultObj);
                            pendingRunRef.current = null;
                        }
                        break;
                    }

                    default:
                        break;
                }
            };

            worker.onerror = (errEvent) => {
                console.error("[usePyodideWorker] Worker error event:", errEvent);
                setIsLoading(false);
                setIsRunning(false);
                const errMsg = errEvent.message || "Pyodide worker encountered an unexpected error.";
                setError(errMsg);

                if (pendingRunRef.current) {
                    if (pendingRunRef.current.timeoutId) {
                        clearTimeout(pendingRunRef.current.timeoutId);
                    }
                    pendingRunRef.current.reject(new Error(errMsg));
                    pendingRunRef.current = null;
                }

                if (pendingInitRef.current) {
                    pendingInitRef.current.reject(new Error(errMsg));
                    pendingInitRef.current = null;
                }
            };

            workerRef.current = worker;
            return worker;
        } catch (err: any) {
            console.error("[usePyodideWorker] Failed to create Worker:", err);
            setError(err?.message || "Failed to initialize worker");
            setIsLoading(false);
            return null;
        }
    }, [isLoading]);

    /**
     * Initializes Pyodide explicitly (lazy initialization is also supported)
     */
    const init = useCallback(async (): Promise<void> => {
        if (isReady && workerRef.current) return;

        setIsLoading(true);
        setStatusMessage("Initializing Pyodide WebAssembly runtime...");

        let worker = workerRef.current;
        if (!worker) {
            worker = spawnWorker();
        }

        if (!worker) {
            setIsLoading(false);
            throw new Error("Web Workers are not supported in this environment.");
        }

        return new Promise<void>((resolve, reject) => {
            pendingInitRef.current = { resolve, reject };
            const msg: WorkerIncomingMessage = {
                id: `init-${Date.now()}`,
                action: "INIT",
            };
            worker!.postMessage(msg);
        });
    }, [isReady, spawnWorker]);

    /**
     * Force terminates stuck execution and respawns a clean worker
     */
    const terminate = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
        }

        if (pendingRunRef.current?.timeoutId) {
            clearTimeout(pendingRunRef.current.timeoutId);
        }

        const terminationResult: ExecutionResult = {
            stdout,
            stderr: (stderr ? stderr + "\n" : "") + "⚠️ Process terminated by user or watchdog.",
            executionTimeMs: pendingRunRef.current ? Math.round(performance.now() - pendingRunRef.current.startTime) : 0,
            status: "terminated",
            error: "Process terminated.",
        };

        if (pendingRunRef.current) {
            pendingRunRef.current.resolve(terminationResult);
            pendingRunRef.current = null;
        }

        setIsRunning(false);
        setIsReady(false);
        setStatusMessage("Execution stopped. Runtime reset.");
        setLastResult(terminationResult);

        // Lazily spawn a fresh worker ready for the next run
        spawnWorker();
    }, [stdout, stderr, spawnWorker]);

    /**
     * Clears console output buffers
     */
    const clearOutput = useCallback(() => {
        setStdout("");
        setStderr("");
        setError(null);
        setLastResult(null);
        setStatusMessage(isReady ? "Pyodide Engine Ready (WASM)" : "Engine idle");
    }, [isReady]);

    /**
     * Executes Python code inside the Web Worker
     */
    const runCode = useCallback(
        async (
            code: string,
            stdinOrOptions?: string | RunCodeOptions,
            optionalOptions?: RunCodeOptions
        ): Promise<ExecutionResult> => {
            // Parse flexible arguments
            let stdin = "";
            let options: RunCodeOptions = {};

            if (typeof stdinOrOptions === "string") {
                stdin = stdinOrOptions;
                if (optionalOptions) options = optionalOptions;
            } else if (stdinOrOptions && typeof stdinOrOptions === "object") {
                options = stdinOrOptions;
                stdin = options.stdin || "";
            }

            const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
            const files = options.files || [];
            const autoLoadPackages = options.autoLoadPackages !== false;

            // Reset streams for new run
            setStdout("");
            setStderr("");
            setError(null);
            setIsRunning(true);
            setStatusMessage("Starting Python execution...");

            let worker = workerRef.current;
            if (!worker) {
                worker = spawnWorker();
            }

            if (!worker) {
                setIsRunning(false);
                const failRes: ExecutionResult = {
                    stdout: "",
                    stderr: "Web Workers are not available.",
                    executionTimeMs: 0,
                    status: "error",
                    error: "Web Workers not available",
                };
                setLastResult(failRes);
                return failRes;
            }

            const runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const startTime = performance.now();

            return new Promise<ExecutionResult>((resolve, reject) => {
                // Watchdog timeout to kill infinite loops
                const timeoutId = setTimeout(() => {
                    if (workerRef.current) {
                        workerRef.current.terminate();
                        workerRef.current = null;
                    }

                    const timeoutResult: ExecutionResult = {
                        stdout,
                        stderr:
                            (stderr ? stderr + "\n" : "") +
                            `\n⚠️ Timeout Error: Execution exceeded ${timeoutMs / 1000}s limit (infinite loop protection triggered).`,
                        executionTimeMs: timeoutMs,
                        status: "timeout",
                        error: `Execution timed out after ${timeoutMs}ms`,
                    };

                    setIsRunning(false);
                    setIsReady(false);
                    setStatusMessage(`Execution timed out after ${timeoutMs / 1000}s`);
                    setLastResult(timeoutResult);

                    if (pendingRunRef.current) {
                        pendingRunRef.current.resolve(timeoutResult);
                        pendingRunRef.current = null;
                    }

                    // Respawn a fresh worker for subsequent runs
                    spawnWorker();
                }, timeoutMs);

                pendingRunRef.current = {
                    resolve,
                    reject,
                    timeoutId,
                    startTime,
                    id: runId,
                };

                const runMsg: WorkerIncomingMessage = {
                    id: runId,
                    action: "RUN",
                    payload: {
                        code,
                        stdin,
                        files,
                        autoLoadPackages,
                    },
                };

                worker!.postMessage(runMsg);
            });
        },
        [stdout, stderr, spawnWorker]
    );

    /**
     * Explicitly installs a package into the Pyodide environment
     */
    const installPackage = useCallback(
        async (packageName: string): Promise<void> => {
            let worker = workerRef.current;
            if (!worker) {
                worker = spawnWorker();
            }
            if (!worker) throw new Error("Worker unavailable");

            setStatusMessage(`Installing ${packageName}...`);
            const msg: WorkerIncomingMessage = {
                id: `pkg-${Date.now()}`,
                action: "INSTALL_PACKAGE",
                payload: { packageName },
            };
            worker.postMessage(msg);
        },
        [spawnWorker]
    );

    // Clean up worker on component unmount
    useEffect(() => {
        return () => {
            if (pendingRunRef.current?.timeoutId) {
                clearTimeout(pendingRunRef.current.timeoutId);
            }
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);

    return {
        runCode,
        init,
        terminate,
        clearOutput,
        installPackage,
        isLoading,
        isRunning,
        isReady,
        statusMessage,
        stdout,
        stderr,
        error,
        lastResult,
    };
}
