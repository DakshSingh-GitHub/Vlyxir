// Web Worker for Python IntelliSense using Pyodide and Jedi
console.log("[IntelWorker] Worker spawned and starting initialization.");

importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js");

let pyodide = null;
let jediReady = false;

async function initPyodide() {
    try {
        console.log("[IntelWorker] Loading Pyodide Wasm...");
        postMessage({ type: "status", status: "loading", message: "Loading Python Wasm VM..." });
        pyodide = await loadPyodide();
        
        console.log("[IntelWorker] Pyodide loaded. Mounting IndexedDB filesystem...");
        postMessage({ type: "status", status: "loading", message: "Mounting persistent cache..." });
        
        const FS = pyodide.FS;
        // Create a local directory for caching packages
        const cacheDir = "/jedi-cache";
        try {
            FS.mkdir(cacheDir);
        } catch (e) {
            // Directory might already exist
        }
        
        // Mount IndexedDB to the cache directory
        FS.mount(FS.filesystems.IDBFS, {}, cacheDir);
        
        // Sync IndexedDB files to the in-memory cache directory
        await new Promise((resolve, reject) => {
            FS.syncfs(true, (err) => {
                if (err) {
                    console.error("[IntelWorker] syncfs load error:", err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        
        console.log("[IntelWorker] IndexedDB synced. Checking for installed packages...");
        
        // Add the cache directory to sys.path so Python can find packages installed there
        pyodide.runPython(`
import sys
if "${cacheDir}" not in sys.path:
    sys.path.append("${cacheDir}")
`);

        let hasJedi = false;
        try {
            pyodide.runPython("import jedi");
            hasJedi = true;
            console.log("[IntelWorker] Jedi found in persistent cache!");
        } catch (e) {
            console.log("[IntelWorker] Jedi not found in cache. Proceeding to install.");
            hasJedi = false;
        }

        if (!hasJedi) {
            postMessage({ type: "status", status: "loading", message: "Downloading analysis library (only once)..." });
            console.log("[IntelWorker] Installing micropip...");
            await pyodide.loadPackage("micropip");
            
            console.log("[IntelWorker] Installing jedi to persistent cache...");
            const micropip = pyodide.pyimport("micropip");
            await micropip.install("jedi", { target: cacheDir });
            
            console.log("[IntelWorker] Installation complete. Syncing to IndexedDB...");
            // Sync memory files back to IndexedDB persistent storage
            await new Promise((resolve, reject) => {
                FS.syncfs(false, (err) => {
                    if (err) {
                        console.error("[IntelWorker] syncfs save error:", err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
            console.log("[IntelWorker] IndexedDB persistent sync complete!");
        }

        // Final import check
        pyodide.runPython("import jedi");
        jediReady = true;
        console.log("[IntelWorker] Jedi is ready to receive requests!");
        postMessage({ type: "status", status: "ready" });
    } catch (error) {
        console.error("[IntelWorker] Initialization failed:", error);
        postMessage({ type: "status", status: "error", message: error.message });
    }
}

initPyodide();

onmessage = async function(e) {
    if (!jediReady) {
        postMessage({ type: "error", message: "Jedi is not loaded yet.", requestId: e.data.requestId });
        return;
    }
    
    const { type, code, line, column, requestId } = e.data;
    
    try {
        if (type === "complete") {
            pyodide.globals.set("code_to_analyze", code);
            pyodide.globals.set("line_num", line);
            pyodide.globals.set("col_num", column);
            
            const resultJson = pyodide.runPython(`
import json
try:
    script = jedi.Script(code_to_analyze, path="main.py")
    completions = script.complete(line_num, col_num)
    completions_list = []
    for c in completions:
        completions_list.append({
            "name": c.name,
            "type": c.type,
            "description": c.description,
            "docstring": c.docstring(),
            "complete": c.complete
        })
    json.dumps(completions_list)
except Exception as ex:
    json.dumps({"error": str(ex)})
`);
            const completions = JSON.parse(resultJson);
            if (completions.error) {
                postMessage({ type: "error", message: completions.error, requestId });
            } else {
                postMessage({ type: "complete", completions, requestId });
            }
        } else if (type === "hover") {
            pyodide.globals.set("code_to_analyze", code);
            pyodide.globals.set("line_num", line);
            pyodide.globals.set("col_num", column);
            
            const resultJson = pyodide.runPython(`
import json
try:
    script = jedi.Script(code_to_analyze, path="main.py")
    help_targets = script.help(line_num, col_num)
    help_list = []
    for h in help_targets:
        help_list.append({
            "name": h.name,
            "docstring": h.docstring(),
            "description": h.description
        })
    json.dumps(help_list)
except Exception as ex:
    json.dumps({"error": str(ex)})
`);
            const hovers = JSON.parse(resultJson);
            if (hovers.error) {
                postMessage({ type: "error", message: hovers.error, requestId });
            } else {
                postMessage({ type: "hover", hovers, requestId });
            }
        } else if (type === "signature") {
            pyodide.globals.set("code_to_analyze", code);
            pyodide.globals.set("line_num", line);
            pyodide.globals.set("col_num", column);
            
            const resultJson = pyodide.runPython(`
import json
try:
    script = jedi.Script(code_to_analyze, path="main.py")
    signatures = script.get_signatures(line_num, col_num)
    sig_list = []
    for s in signatures:
        params = []
        for p in s.params:
            params.append({
                "name": p.name,
                "description": p.description
            })
        sig_list.append({
            "name": s.name,
            "docstring": s.docstring(),
            "description": s.description,
            "params": params
        })
    json.dumps(sig_list)
except Exception as ex:
    json.dumps({"error": str(ex)})
`);
            const signatures = JSON.parse(resultJson);
            if (signatures.error) {
                postMessage({ type: "error", message: signatures.error, requestId });
            } else {
                postMessage({ type: "signature", signatures, requestId });
            }
        }
    } catch (err) {
        postMessage({ type: "error", message: err.message, requestId });
    }
};
