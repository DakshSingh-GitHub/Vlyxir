/**
 * VLYXIR Forge - High-Performance Pyodide Web Worker Engine
 * Isolated WebAssembly execution environment for Python scripts
 */

import type {
    WorkerIncomingMessage,
    WorkerOutgoingMessage,
    VirtualFile
} from "../types/pyodide";

// Declare Worker scope context
// @ts-ignore
const ctx: Worker = (typeof self !== "undefined" ? self : {}) as unknown as Worker;

const PYODIDE_CDN_VERSION = "v0.26.1";
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_CDN_VERSION}/full/`;
const PYODIDE_MJS_URL = `${PYODIDE_BASE_URL}pyodide.mjs`;
const PYODIDE_JS_URL = `${PYODIDE_BASE_URL}pyodide.js`;

let pyodideInstance: any = null;
let isInitializing = false;
let initPromise: Promise<any> | null = null;

// Post typed message back to main thread
function postReply(msg: WorkerOutgoingMessage) {
    ctx.postMessage(msg);
}

// Stream output helpers
function streamStdout(text: string, id?: string) {
    if (!text) return;
    postReply({
        id,
        type: "STDOUT",
        stdout: text,
        payload: text
    });
}

function streamStderr(text: string, id?: string) {
    if (!text) return;
    postReply({
        id,
        type: "STDERR",
        stderr: text,
        payload: text
    });
}

/**
 * Loads Pyodide runtime from CDN with fallback strategies
 */
async function getPyodide(): Promise<any> {
    if (pyodideInstance) {
        return pyodideInstance;
    }

    if (initPromise) {
        return initPromise;
    }

    isInitializing = true;
    postReply({
        type: "STATUS",
        payload: "Downloading Pyodide WebAssembly runtime..."
    });

    initPromise = (async () => {
        try {
            let loadPyodideFn: any = null;

            // Strategy 1: Dynamic ESM import (Standard for module workers)
            try {
                // @ts-ignore - dynamic CDN import
                const pyodideModule = await import(/* webpackIgnore: true */ PYODIDE_MJS_URL);
                loadPyodideFn = pyodideModule.loadPyodide;
            } catch (esmErr) {
                console.warn("[VLYXIR Pyodide Worker] ESM dynamic import failed, trying fallback:", esmErr);
            }

            // Strategy 2: Classic Worker importScripts fallback
            if (!loadPyodideFn && typeof (self as any).importScripts === "function") {
                try {
                    (self as any).importScripts(PYODIDE_JS_URL);
                    // @ts-ignore
                    loadPyodideFn = (self as any).loadPyodide;
                } catch (scriptErr) {
                    console.error("[VLYXIR Pyodide Worker] importScripts failed:", scriptErr);
                }
            }

            if (!loadPyodideFn) {
                throw new Error("Unable to load Pyodide loader from CDN. Please check your internet connection.");
            }

            postReply({
                type: "STATUS",
                payload: "Initializing WebAssembly Python environment..."
            });

            // Initialize Pyodide with stdout/stderr hooks
            const pyodide = await loadPyodideFn({
                indexURL: PYODIDE_BASE_URL,
                stdout: (text: string) => {
                    streamStdout(text + "\n");
                },
                stderr: (text: string) => {
                    streamStderr(text + "\n");
                }
            });

            postReply({
                type: "STATUS",
                payload: "Configuring standard library & system streams..."
            });

            // Set up custom Python execution helper & system stream redirects
            await pyodide.runPythonAsync(`
import sys
import io
import os
import traceback

class _StreamCapture:
    def __init__(self, is_stderr=False):
        self.is_stderr = is_stderr
        self.buffer = []

    def write(self, s):
        if s:
            self.buffer.append(s)

    def flush(self):
        pass

    def getvalue(self):
        return "".join(self.buffer)
`);

            pyodideInstance = pyodide;
            isInitializing = false;

            postReply({
                type: "READY",
                payload: {
                    version: PYODIDE_CDN_VERSION,
                    pythonVersion: pyodide.runPython("sys.version")
                }
            });

            return pyodide;
        } catch (err: any) {
            isInitializing = false;
            initPromise = null;
            const errorMsg = err?.message || String(err);
            postReply({
                type: "ERROR",
                error: `Failed to initialize Pyodide: ${errorMsg}`
            });
            throw err;
        }
    })();

    return initPromise;
}

/**
 * Setup virtual files in Pyodide Emscripten FS
 */
function setupVirtualFileSystem(pyodide: any, files: VirtualFile[] = []) {
    if (!files || files.length === 0) return;

    try {
        const FS = pyodide.FS;
        const rootDir = "/vlyxir_workspace";

        try {
            FS.mkdirTree(rootDir);
        } catch (_) {
            // Directory might already exist
        }

        for (const file of files) {
            if (!file.path) continue;
            // Clean path
            const normalizedPath = file.path.startsWith("/") ? file.path : `${rootDir}/${file.path}`;
            const dir = normalizedPath.substring(0, normalizedPath.lastIndexOf("/"));

            if (dir) {
                try {
                    FS.mkdirTree(dir);
                } catch (_) {}
            }

            FS.writeFile(normalizedPath, file.content || "");
        }

        // Add root workspace to sys.path if not present
        pyodide.runPython(`
if "${rootDir}" not in sys.path:
    sys.path.insert(0, "${rootDir}")
os.chdir("${rootDir}")
`);
    } catch (fsErr: any) {
        console.warn("[VLYXIR Pyodide Worker] FS Setup warning:", fsErr);
    }
}

/**
 * Executes Python code safely and records execution metrics
 */
async function executePythonCode(
    id: string,
    code: string,
    stdin: string = "",
    files: VirtualFile[] = [],
    autoLoadPackages: boolean = true
) {
    const pyodide = await getPyodide();

    let capturedStdout = "";
    let capturedStderr = "";

    // Hook Pyodide stdout/stderr for this specific run ID
    pyodide.setStdout({
        batched: (text: string) => {
            const line = text + "\n";
            capturedStdout += line;
            streamStdout(line, id);
        }
    });

    pyodide.setStderr({
        batched: (text: string) => {
            const line = text + "\n";
            capturedStderr += line;
            streamStderr(line, id);
        }
    });

    // Write multi-file project workspace if provided
    if (files && files.length > 0) {
        setupVirtualFileSystem(pyodide, files);
    }

    // Auto-detect and download imported packages from CDN
    if (autoLoadPackages) {
        try {
            postReply({
                id,
                type: "PACKAGE_LOADING",
                payload: "Analyzing dependencies and loading packages..."
            });
            await pyodide.loadPackagesFromImports(code, {
                messageCallback: (msg: string) => {
                    postReply({
                        id,
                        type: "PACKAGE_LOADING",
                        payload: msg
                    });
                }
            });
            postReply({
                id,
                type: "PACKAGE_LOADED",
                payload: "All packages loaded."
            });
        } catch (pkgErr: any) {
            console.warn("[VLYXIR Pyodide Worker] Package autoload warning:", pkgErr);
        }
    }

    // Set standard input (stdin)
    try {
        pyodide.globals.set("__vlyxir_stdin_data__", stdin || "");
        pyodide.runPython(`
import sys
import io

# Setup stdin buffer
sys.stdin = io.StringIO(__vlyxir_stdin_data__)
`);
    } catch (stdinErr: any) {
        console.warn("[VLYXIR Pyodide Worker] Stdin configuration error:", stdinErr);
    }

    const startTime = performance.now();
    let executionTimeMs = 0;
    let evalResult: any = undefined;

    try {
        postReply({
            id,
            type: "STATUS",
            payload: "Executing Python script..."
        });

        // Run python code asynchronously
        evalResult = await pyodide.runPythonAsync(code);
        executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

        let resultStr = "";
        if (evalResult !== undefined && evalResult !== null) {
            try {
                resultStr = typeof evalResult.toString === "function" ? evalResult.toString() : String(evalResult);
                if (typeof evalResult.destroy === "function") {
                    evalResult.destroy();
                }
            } catch (_) {
                resultStr = String(evalResult);
            }
        }

        postReply({
            id,
            type: "SUCCESS",
            stdout: capturedStdout,
            stderr: capturedStderr,
            executionTimeMs,
            payload: {
                result: resultStr,
                stdout: capturedStdout,
                stderr: capturedStderr,
                executionTimeMs
            }
        });
    } catch (execErr: any) {
        executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
        
        let errorMessage = execErr?.message || String(execErr);
        let formattedTraceback = errorMessage;

        // Clean up internal Pyodide/Emscripten wrapper tracebacks if present
        if (errorMessage.includes("Traceback (most recent call last):")) {
            formattedTraceback = errorMessage;
        }

        postReply({
            id,
            type: "ERROR",
            error: errorMessage,
            formattedTraceback,
            stdout: capturedStdout,
            stderr: capturedStderr || errorMessage,
            executionTimeMs,
            payload: {
                error: errorMessage,
                formattedTraceback,
                stdout: capturedStdout,
                stderr: capturedStderr || errorMessage,
                executionTimeMs
            }
        });
    }
}

/**
 * Worker message router
 */
ctx.onmessage = async (event: MessageEvent<WorkerIncomingMessage>) => {
    const { id, action, payload } = event.data || {};

    switch (action) {
        case "INIT": {
            try {
                await getPyodide();
            } catch (err: any) {
                // Handled in getPyodide
            }
            break;
        }

        case "RUN": {
            const runPayload = (payload as any) || {};
            const code = runPayload.code || "";
            const stdin = runPayload.stdin || "";
            const files = runPayload.files || [];
            const autoLoad = runPayload.autoLoadPackages !== false;

            await executePythonCode(id, code, stdin, files, autoLoad);
            break;
        }

        case "INSTALL_PACKAGE": {
            const pkgName = (payload as any)?.packageName;
            if (!pkgName) return;

            try {
                const pyodide = await getPyodide();
                postReply({
                    id,
                    type: "PACKAGE_LOADING",
                    payload: `Installing package: ${pkgName}...`
                });

                if (pyodide.loadPackage) {
                    await pyodide.loadPackage(pkgName);
                }

                postReply({
                    id,
                    type: "PACKAGE_LOADED",
                    payload: `Package ${pkgName} successfully installed.`
                });
            } catch (pkgErr: any) {
                postReply({
                    id,
                    type: "ERROR",
                    error: `Failed to install package ${pkgName}: ${pkgErr?.message || String(pkgErr)}`
                });
            }
            break;
        }

        case "PING": {
            postReply({
                id,
                type: "PONG",
                payload: {
                    isReady: !!pyodideInstance,
                    isInitializing
                }
            });
            break;
        }

        default: {
            console.warn("[VLYXIR Pyodide Worker] Unknown action received:", action);
        }
    }
};

export {};
