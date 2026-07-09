/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Editor, { OnMount, useMonaco } from "@monaco-editor/react";
import { useState, useEffect, useRef, memo } from "react";
import Toolbar from "./Toolbar";
import { DEEP_SPACE_THEME, PYTHON_SNIPPETS } from "../../app/lib/utils/editor-config";
import { anime } from "../../app/lib/utils/anime";
import { useAppContext } from "../../app/lib/auth/context";

interface CodeEditorProps {
    code: string;
    setCode: (code: string) => void;
    isDisabled?: boolean;
    isDark?: boolean;
    language?: string;
    setLanguage?: (lang: string) => void;
    flat?: boolean;
}

// Module-level worker singleton & registration disposables
let globalWorker: Worker | null = null;
let globalIntelStatus: "idle" | "loading" | "ready" | "error" = "idle";
let globalIntelMessage = "";
const globalRequests = new Map<string, (res: any) => void>();
const statusListeners = new Set<(status: "idle" | "loading" | "ready" | "error", message: string) => void>();

let pythonCompletionsDisposable: any = null;
let pythonHoverDisposable: any = null;
let pythonSignatureDisposable: any = null;

function notifyListeners() {
    statusListeners.forEach(listener => listener(globalIntelStatus, globalIntelMessage));
}

function initGlobalWorker() {
    if (globalWorker) return;

    globalIntelStatus = "loading";
    globalIntelMessage = "Booting Wasm...";
    notifyListeners();

    try {
        const worker = new Worker("/workers/python-intel-worker.js");
        globalWorker = worker;

        worker.onmessage = (e) => {
            const { type, status, message, completions, hovers, signatures, requestId } = e.data;
            if (type === "status") {
                if (status === "loading") {
                    globalIntelStatus = "loading";
                    globalIntelMessage = message || "Loading...";
                } else if (status === "ready") {
                    globalIntelStatus = "ready";
                    globalIntelMessage = "";
                } else if (status === "error") {
                    globalIntelStatus = "error";
                    globalIntelMessage = message || "Failed";
                }
                notifyListeners();
            } else if (requestId && globalRequests.has(requestId)) {
                const resolve = globalRequests.get(requestId);
                if (resolve) {
                    if (type === "complete") resolve(completions);
                    else if (type === "hover") resolve(hovers);
                    else if (type === "signature") resolve(signatures);
                    else if (type === "error") resolve(null);
                }
                globalRequests.delete(requestId);
            }
        };

        worker.onerror = (err) => {
            console.error("[GlobalWorker] Error:", err);
            globalIntelStatus = "error";
            globalIntelMessage = "Failed to start";
            notifyListeners();
        };
    } catch (err) {
        console.error("[GlobalWorker] Spawn failed:", err);
        globalIntelStatus = "error";
        globalIntelMessage = "Worker blocked";
        notifyListeners();
    }
}

const CodeEditor = memo(function CodeEditor({
    code,
    setCode,
    isDisabled = false,
    isDark = false,
    language = "python",
    setLanguage,
    flat = false,
}: CodeEditorProps) {
    const [showMinimap, setShowMinimap] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<unknown>(null);
    const { editorFontSize, setEditorFontSize } = useAppContext();
    const monaco = useMonaco();

    const [intelStatus, setIntelStatusState] = useState<"idle" | "loading" | "ready" | "error">(globalIntelStatus);
    const [intelMessage, setIntelMessage] = useState(globalIntelMessage);
    const intelStatusRef = useRef<"idle" | "loading" | "ready" | "error">(globalIntelStatus);

    const setIntelStatus = (status: "idle" | "loading" | "ready" | "error") => {
        intelStatusRef.current = status;
        setIntelStatusState(status);
    };

    const triggerWorkerRequestRef = useRef<any>(null);
    triggerWorkerRequestRef.current = (type: string, code: string, line: number, column: number) => {
        return new Promise((resolve) => {
            if (!globalWorker || intelStatusRef.current !== "ready") {
                resolve(null);
                return;
            }
            const requestId = Math.random().toString(36).substring(2, 15);
            globalRequests.set(requestId, resolve);
            globalWorker.postMessage({ type, code, line, column, requestId });
            
            setTimeout(() => {
                if (globalRequests.has(requestId)) {
                    globalRequests.delete(requestId);
                    resolve(null);
                }
            }, 3000);
        });
    };

    useEffect(() => {
        const checkScreenSize = () => {
            setShowMinimap(window.innerWidth >= 768);
        };
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    useEffect(() => {
        if (language !== "python") {
            setIntelStatus("idle");
            return;
        }

        initGlobalWorker();

        const handleStatusChange = (status: "idle" | "loading" | "ready" | "error", message: string) => {
            setIntelStatus(status);
            setIntelMessage(message);
        };

        statusListeners.add(handleStatusChange);

        // Sync initial state
        setIntelStatus(globalIntelStatus);
        setIntelMessage(globalIntelMessage);

        return () => {
            statusListeners.delete(handleStatusChange);
        };
    }, [language]);

    // Dynamically register and dispose of Monaco providers to prevent memory leaks and duplicate suggestions
    useEffect(() => {
        if (!monaco || language !== "python") return;

        console.log("[CodeEditor] Registering Monaco Python providers...");

        // Clean up any existing global registrations first
        if (pythonCompletionsDisposable) pythonCompletionsDisposable.dispose();
        if (pythonHoverDisposable) pythonHoverDisposable.dispose();
        if (pythonSignatureDisposable) pythonSignatureDisposable.dispose();

        // Register completions provider
        pythonCompletionsDisposable = monaco.languages.registerCompletionItemProvider("python", {
            provideCompletionItems: async function (model: any, position: any) {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                const staticSuggestions = PYTHON_SNIPPETS.map(snippet => ({
                    label: snippet.label,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: snippet.insertText,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: snippet.documentation,
                    range: range,
                }));

                const codeValue = model.getValue();
                const workerResult = await triggerWorkerRequestRef.current("complete", codeValue, position.lineNumber, position.column);

                if (!workerResult || !Array.isArray(workerResult) || workerResult.length === 0) {
                    return { suggestions: staticSuggestions };
                }

                const jediSuggestions = workerResult.map((c: any) => {
                    let kind = monaco.languages.CompletionItemKind.Variable;
                    if (c.type === "function" || c.type === "def") kind = monaco.languages.CompletionItemKind.Function;
                    else if (c.type === "class") kind = monaco.languages.CompletionItemKind.Class;
                    else if (c.type === "module" || c.type === "import") kind = monaco.languages.CompletionItemKind.Module;
                    else if (c.type === "keyword") kind = monaco.languages.CompletionItemKind.Keyword;
                    else if (c.type === "statement") kind = monaco.languages.CompletionItemKind.Snippet;

                    return {
                        label: c.name,
                        kind: kind,
                        insertText: c.complete || c.name,
                        detail: c.description,
                        documentation: c.docstring ? { value: c.docstring } : undefined,
                        range: range
                    };
                });

                // De-duplicate and merge Jedi suggestions with static templates
                const mergedSuggestions: any[] = [];
                const staticMap = new Map<string, any>();
                staticSuggestions.forEach(s => staticMap.set(s.label, s));

                const seenLabels = new Set<string>();

                jediSuggestions.forEach((jediItem: any) => {
                    seenLabels.add(jediItem.label);
                    const staticMatch = staticMap.get(jediItem.label);
                    if (staticMatch) {
                        mergedSuggestions.push({
                            ...jediItem,
                            insertText: staticMatch.insertText,
                            insertTextRules: staticMatch.insertTextRules,
                            kind: staticMatch.kind
                        });
                    } else {
                        mergedSuggestions.push(jediItem);
                    }
                });

                staticSuggestions.forEach((staticItem: any) => {
                    if (!seenLabels.has(staticItem.label)) {
                        mergedSuggestions.push(staticItem);
                    }
                });

                return { suggestions: mergedSuggestions };
            },
        });

        // Register Hover Provider
        pythonHoverDisposable = monaco.languages.registerHoverProvider("python", {
            provideHover: async function (model: any, position: any) {
                const codeValue = model.getValue();
                const workerResult = await triggerWorkerRequestRef.current("hover", codeValue, position.lineNumber, position.column);

                if (!workerResult || !Array.isArray(workerResult) || workerResult.length === 0) {
                    return null;
                }

                const contents = workerResult.map((h: any) => ({
                    value: `**${h.name}**\n\n\`\`\`python\n${h.description}\n\`\`\`\n\n${h.docstring || ""}`
                }));

                return { contents };
            }
        });

        // Register Signature Help Provider
        pythonSignatureDisposable = monaco.languages.registerSignatureHelpProvider("python", {
            signatureHelpTriggerCharacters: ["(", ","],
            provideSignatureHelp: async function (model: any, position: any) {
                const codeValue = model.getValue();
                const workerResult = await triggerWorkerRequestRef.current("signature", codeValue, position.lineNumber, position.column);

                if (!workerResult || !Array.isArray(workerResult) || workerResult.length === 0) {
                    return null;
                }

                const signatures = workerResult.map((s: any) => {
                    const parameters = s.params.map((p: any) => ({
                        label: p.name,
                        documentation: p.description
                    }));

                    return {
                        label: s.description || s.name,
                        documentation: s.docstring,
                        parameters: parameters,
                        activeParameter: 0
                    };
                });

                return {
                    value: {
                        signatures: signatures,
                        activeSignature: 0,
                        activeParameter: 0
                    },
                    dispose: () => {}
                };
            }
        });

        return () => {
            console.log("[CodeEditor] Disposing Monaco Python providers...");
            if (pythonCompletionsDisposable) {
                pythonCompletionsDisposable.dispose();
                pythonCompletionsDisposable = null;
            }
            if (pythonHoverDisposable) {
                pythonHoverDisposable.dispose();
                pythonHoverDisposable = null;
            }
            if (pythonSignatureDisposable) {
                pythonSignatureDisposable.dispose();
                pythonSignatureDisposable = null;
            }
        };
    }, [monaco, language]);

    useEffect(() => {
        if (!rootRef.current) return;
        anime({
            targets: rootRef.current,
            opacity: [0, 1],
            translateY: [12, 0],
            scale: [0.99, 1],
            duration: 460,
            easing: "easeOutCubic"
        });
    }, []);

    useEffect(() => {
        if (!rootRef.current) return;
        anime({
            targets: rootRef.current,
            opacity: isDisabled ? 0.72 : 1,
            duration: 220,
            easing: "easeOutQuad"
        });
    }, [isDisabled]);

    function handleEditorWillMount(monaco: any) {
        monaco.editor.defineTheme("deep-space", DEEP_SPACE_THEME);

        monaco.languages.registerCompletionItemProvider("javascript", {
            provideCompletionItems: function (model: any, position: any) {
                return { suggestions: [] };
            }
        });
    }

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
    };

    return (
        <div
            ref={rootRef}
            className={flat 
                ? `h-full w-full relative flex flex-col bg-white dark:bg-gray-900 ${isDisabled ? "opacity-60 grayscale" : ""}`
                : `h-full w-full rounded-xl overflow-hidden relative flex flex-col bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 shadow-inner ${isDisabled ? "opacity-60 grayscale" : ""}`
            }
        >
            {isDisabled && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900 bg-opacity-50 cursor-not-allowed">
                    <p className="text-white text-lg font-semibold">
                        Select a problem to start coding
                    </p>
                </div>
            )}
            <div className="grow h-0">
                <Editor
                    height="100%"
                    defaultLanguage={language}
                    language={language}
                    theme={isDark ? "deep-space" : "vs"}
                    value={code}
                    beforeMount={handleEditorWillMount}
                    onMount={handleEditorDidMount}
                    onChange={(value) => setCode(value || "")}
                    options={{
                        fontSize: editorFontSize,
                        minimap: { enabled: showMinimap },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: isDisabled,
                        cursorBlinking: "expand",
                        fontFamily: "Jetbrains Mono, monospace",
                        fontLigatures: true,
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: {
                            other: true,
                            comments: true,
                            strings: true,
                        },
                        parameterHints: { enabled: true },
                        tabCompletion: "on",
                        smoothScrolling: true,
                        cursorSmoothCaretAnimation: "on",
                        formatOnPaste: true,
                        formatOnType: true,
                        renderLineHighlight: "all",
                        scrollbar: {
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8,
                            useShadows: false
                        }
                    }}
                />
            </div>
            {!isDisabled && (
                <div data-tour="editor-toolbar">
                    <Toolbar code={code} fontSize={editorFontSize} setFontSize={setEditorFontSize} language={language} setLanguage={setLanguage} intelStatus={intelStatus} intelMessage={intelMessage} />
                </div>
            )}
        </div>
    );
});
CodeEditor.displayName = "CodeEditor";

export default CodeEditor;
