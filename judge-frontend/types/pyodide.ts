/**
 * Pyodide WebAssembly Worker Protocol & Execution Types
 * VLYXIR Forge Client-Side Python Engine
 */

export type WorkerAction =
    | "INIT"
    | "RUN"
    | "INSTALL_PACKAGE"
    | "RESET_FS"
    | "PING";

export interface VirtualFile {
    path: string;
    content: string;
}

export interface WorkerRunPayload {
    code: string;
    stdin?: string;
    files?: VirtualFile[];
    entrypoint?: string;
    autoLoadPackages?: boolean;
}

export interface WorkerIncomingMessage {
    id: string;
    action: WorkerAction;
    payload?: WorkerRunPayload | { packageName: string } | Record<string, unknown>;
}

export type WorkerResponseType =
    | "READY"
    | "STATUS"
    | "STDOUT"
    | "STDERR"
    | "PACKAGE_LOADING"
    | "PACKAGE_LOADED"
    | "SUCCESS"
    | "ERROR"
    | "PONG";

export interface WorkerOutgoingMessage {
    id?: string;
    type: WorkerResponseType;
    payload?: any;
    stdout?: string;
    stderr?: string;
    executionTimeMs?: number;
    error?: string;
    formattedTraceback?: string;
}

export interface ExecutionResult {
    stdout: string;
    stderr: string;
    executionTimeMs: number;
    status: "success" | "error" | "timeout" | "terminated";
    error?: string;
    formattedTraceback?: string;
    result?: string;
}

export interface PyodideWorkerHookState {
    isReady: boolean;
    isLoading: boolean;
    isRunning: boolean;
    statusMessage: string;
    lastResult: ExecutionResult | null;
    stdoutStream: string;
    stderrStream: string;
    error: string | null;
}
