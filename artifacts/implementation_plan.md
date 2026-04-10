# C++ Code Execution Integration Plan

## Background

CodeJudge currently supports **Python** execution through the `judge-backend` service. Python code runs via:
1. A persistent **JudgeWorker** process pool (`runner_worker.py`) — compiles once, runs many test cases via `exec()`.
2. A one-shot mode (`runner.py → run_code_once`) used by the `/run` endpoint (IDE-mode execution).

C++ fundamentally differs: it must be **compiled first** (`g++` → binary) before it can be executed. This requires a compile-then-execute pipeline. The plan is to house this logic in a new `cpp-engine/` folder inside `judge-backend/`.

---

## Architecture Overview

```
judge-backend/
├── app.py                   ← [MODIFY] Add language param to /submit and /run
├── runner.py                ← [MODIFY] Language dispatch → routes to cpp_runner
├── runner_worker.py         ← (unchanged, Python only)
├── security.py              ← [MODIFY] Add C++ security checks
└── cpp-engine/
    ├── __init__.py          ← [NEW] Package marker
    ├── cpp_runner.py        ← [NEW] Compile + run pipeline
    └── cpp_security.py      ← [NEW] C++ static analysis / safety checks
```

---

## Proposed Changes

### Backend — `judge-backend/`

---

#### [NEW] `cpp-engine/__init__.py`
Empty package init file.

---

#### [NEW] `cpp-engine/cpp_security.py`
Static analysis for C++ code before execution.

- **Banned patterns** (regex): `system(`, `popen(`, `fork(`, `exec*(`, `#include <sys/socket.h>`, `#include <netinet`, `#include <unistd.h>` (unless needed for simple I/O — can relax), `__asm__`, inline assembly indicators.
- Returns `(is_valid: bool, reason: str)`.
- Keeps it intentionally lightweight — no compiler-level sandboxing (that would need Docker/seccomp). The key goal is blocking obvious escape attempts on a local judge.

---

#### [NEW] `cpp-engine/cpp_runner.py`
The core compile-and-run loop. Key design decisions:

**`compile_cpp(code: str) → (success: bool, binary_path: str, error: str)`**
- Writes code to a temp `.cpp` file.
- Runs `g++ -O2 -o <binary> <source> -std=c++17` with a compile timeout (10s default).
- Returns the binary path on success, or the compiler error string on failure.
- Binary is written to a temp directory; caller is responsible for cleanup.

**`run_cpp_once(code, user_input, time_limit) → dict`**
- Security check → compile → run binary with `subprocess.run(input=..., timeout=...)`.
- Mirrors the same return shape as Python's `run_code_once`: `{stdout, stderr, status, duration}`.
- Used by `/run` endpoint (IDE scratch execution).

**`run_cpp_test_case(index, tc, binary_path, time_limit) → dict`**
- Runs a pre-compiled binary against one test case.
- Returns same shape as `run_single_test_case_sequential`.

**`run_cpp_multiple(code, test_cases, mode) → dict`**
- Compile once → run all test cases in a `ThreadPoolExecutor`.
- On TLE: kill subprocess via `psutil`.
- Returns same aggregate shape as `run_code_multiple`.
- Cleans up the binary in a `finally` block.

> [!NOTE]
> Unlike Python, C++ doesn't benefit from a persistent "init once, run many" worker because the binary is already native and startup cost is negligible (~1ms). A simpler compile-once/run-per-test-case model keeps the code clean.

---

#### [MODIFY] `security.py`
Add a `validate_cpp_code(code)` wrapper that delegates to `cpp_security.py`. This keeps the security API surface consistent.

---

#### [MODIFY] `runner.py`
Add a `language` parameter to `run_code_once` and `run_code_multiple`:

```python
def run_code_once(code, user_input, time_limit=TIME_LIMIT, language="python"):
    if language == "cpp":
        from cpp_engine.cpp_runner import run_cpp_once
        return run_cpp_once(code, user_input, time_limit)
    # ... existing Python path

def run_code_multiple(code, test_cases, mode="ALL", language="python"):
    if language == "cpp":
        from cpp_engine.cpp_runner import run_cpp_multiple
        return run_cpp_multiple(code, test_cases, mode)
    # ... existing Python path
```

This is a clean **strategy dispatch** — no existing Python logic is touched.

---

#### [MODIFY] `app.py`
Add `language` field to `SubmitRequest` and `RunRequest`:

```python
class SubmitRequest(BaseModel):
    problem_id: str
    code: str
    language: Optional[str] = "python"   # ← NEW
    test_only: Optional[bool] = False

class RunRequest(BaseModel):
    code: str
    input: Optional[str] = ""
    language: Optional[str] = "python"   # ← NEW
```

Pass `language` when calling `run_code_multiple` and `run_code_once`.

> [!IMPORTANT]
> This is **fully backward compatible**. All existing Python submissions without a `language` field default to `"python"`. No API contract is broken.

---

### Frontend — `judge-frontend/`

---

#### [MODIFY] `components/Editor/LanguageSelector.tsx`
Add C++ as a supported language option alongside Python and JavaScript.

```typescript
const languages = [
  { id: 'python',      label: 'Python',  icon: '🐍' },
  { id: 'cpp',         label: 'C++',     icon: '⚙️' },
  // JS only in experiment mode (existing behavior)
  ...(setLanguage ? [{ id: 'javascript', label: 'JavaScript', icon: 'js' }] : [])
]
```

---

#### [MODIFY] `app/(mde)/code-judge-mde/page.tsx`
- Add `language` state: `const [language, setLanguage] = useState("python")`.
- Pass `language` to `CodeEditor` (for syntax highlighting mode).
- Pass `language` into `submitCode(problemId, code, false, language)` and `handleTest`.
- Reset `language`-specific default stubs when switching problems (optional).

---

#### [MODIFY] `app/lib/api.ts`
- Add `language` param to `submitCode` and `runCode`:

```typescript
export async function submitCode(
  problemId: string,
  code: string,
  testOnly: boolean = false,
  language: string = "python"
): Promise<SubmitResponse>
```

- Include `language` in the POST body.

---

#### [MODIFY] `components/Editor/CodeEditor.tsx`
- Accept a `language` prop.
- Map `"cpp"` → Monaco/CodeMirror language mode `"cpp"` for syntax highlighting.
- Swap default starter code based on language (e.g., show a `#include <iostream>` stub for C++).

---

## User Review Required

> [!IMPORTANT]
> **g++ must be installed** on the server where `judge-backend` runs. On Vercel (serverless), running compiled binaries is not supported. If you're deploying to Vercel, C++ execution will only work locally unless you migrate to a VPS/container backend.

> [!WARNING]
> **Security note**: C++ binaries run natively on the host OS. The current Python sandbox (`restrict_import`, `exec globals`) does **not** apply to C++. The `cpp_security.py` static checker provides a first line of defense, but for production use, Docker-based sandboxing (e.g., `nsjail`, `firejail`, or a container per submission) is strongly recommended.

> [!NOTE]
> **No Docker required for local development**. For a private/club judge used locally, the static checker approach is reasonable. The plan is designed to be incrementally upgradeable to containerized execution later.

---

## Open Questions

> [!IMPORTANT]
> 1. **Deployment target**: Is this running only locally or also on Vercel? If Vercel, C++ execution needs a separate infrastructure decision (a long-running backend server, not serverless).
> 2. **Default C++ starter code**: Should the editor pre-fill `#include <iostream>\nusing namespace std;\nint main() { ... }` when C++ is selected?
> 3. **Problem-language coupling**: Should problems specify which languages are allowed (some algorithmic problems are Python-only)? Or is all languages for all problems fine for now?

---

## Verification Plan

### Automated
- Run `python -m pytest test_api.py` for existing Python tests after changes.
- Add a quick `test_cpp_runner.py` script that compiles and runs a hello-world C++ snippet to confirm the pipeline works end-to-end.

### Manual
1. Start `app.py` locally.
2. Select a problem, choose C++ in the language dropdown.
3. Write a simple `Hello World` C++ program → click **Test** → confirm output.
4. Submit a correct C++ solution → confirm `Accepted`.
5. Submit an infinite-loop C++ solution → confirm `Time Limit Exceeded` (not a hanging server).
6. Submit code with `system(` → confirm `Security Violation`.
