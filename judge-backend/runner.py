import subprocess
import os
import sys
import time
import json
import re
import queue
import threading
import platform
import select
from concurrent.futures import ThreadPoolExecutor

try:
    import psutil
except ImportError:
    psutil = None

from security import validate_code

TIME_LIMIT = 2  # seconds
ENABLE_OPTIMIZATION = True # Set to False to disable threading/persistent workers

def normalize_output(output: str) -> str:
    lines = (output or "").strip().splitlines()
    normalized_lines = [" ".join(line.split()) for line in lines]
    return "\n".join(normalized_lines)

def sanitize_traceback(raw_stderr: str, temp_path: str, line_offset: int = 0) -> str:
    if not raw_stderr:
        return ""
    
    # Replace internal temp file paths with friendly name
    clean = raw_stderr.replace(temp_path, "solution.py")
    
    if line_offset > 0:
        def adjust_line(match):
            orig_line = int(match.group(1))
            new_line = max(1, orig_line - line_offset)
            return f"line {new_line}"
        clean = re.sub(r'line (\d+)', adjust_line, clean)
        
    return clean.strip()

def run_code_once(code: str, user_input: str, time_limit: int = TIME_LIMIT):
    """Executes code once in isolation and returns stdout, stderr, status, and duration."""
    import tempfile
    
    # Static analysis security check
    is_valid, warning = validate_code(code)
    if not is_valid:
        return {
            "stdout": "",
            "stderr": f"Security Error: {warning}",
            "status": "Security Violation",
            "duration": 0
        }

    harness_prefix = """import sys
import builtins

def custom_input(prompt=""):
    if prompt:
        sys.stdout.write(str(prompt))
        sys.stdout.flush()
    input_line = sys.stdin.readline()
    if input_line:
        sys.stdout.write(input_line)
        if not input_line.endswith('\\n'):
            sys.stdout.write('\\n')
        sys.stdout.flush()
    return input_line.rstrip('\\n')

builtins.input = custom_input
"""
    harness_line_count = harness_prefix.count("\n")
    harness = harness_prefix + code

    with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode="w", encoding="utf-8") as temp:
        temp.write(harness)
        filename = temp.name

    cmd = [sys.executable, filename]
    start_t = time.time()
    try:
        result = subprocess.run(
            cmd,
            input=user_input,
            capture_output=True,
            text=True,
            timeout=time_limit
        )
        duration = time.time() - start_t
        
        if result.returncode != 0:
            clean_stderr = sanitize_traceback(result.stderr, filename, harness_line_count)
            return {
                "stdout": result.stdout,
                "stderr": clean_stderr,
                "status": "Runtime Error",
                "duration": duration
            }

        return {
            "stdout": result.stdout,
            "stderr": None,
            "status": "Success",
            "duration": duration
        }

    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "Time Limit Exceeded",
            "status": "Time Limit Exceeded",
            "duration": time.time() - start_t
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": str(e),
            "status": "Internal Error",
            "duration": time.time() - start_t
        }
    finally:
        if os.path.exists(filename):
            try:
                os.remove(filename)
            except OSError:
                pass

def run_code_multi(files: list, entrypoint: str, user_input: str, time_limit: int = TIME_LIMIT):
    """Executes multi-file workspace code in isolation and returns stdout, stderr, status, and duration."""
    import tempfile
    
    # Static analysis security checks on all Python files
    for file_info in files:
        path = file_info.get("path", "")
        content = file_info.get("content", "")
        if path.endswith(".py"):
            is_valid, warning = validate_code(content)
            if not is_valid:
                return {
                    "stdout": "",
                    "stderr": f"Security Error in {path}: {warning}",
                    "status": "Security Violation",
                    "duration": 0
                }

    start_t = time.time()
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            real_temp_dir = os.path.realpath(temp_dir)
            
            # Write all files to temp directory safely
            for file_info in files:
                path = file_info.get("path", "")
                content = file_info.get("content", "")
                
                # Prevent directory traversal
                target_path = os.path.realpath(os.path.join(real_temp_dir, path))
                if not target_path.startswith(real_temp_dir):
                    return {
                        "stdout": "",
                        "stderr": "Security Error: Directory traversal detected.",
                        "status": "Security Violation",
                        "duration": 0
                    }
                
                os.makedirs(os.path.dirname(target_path), exist_ok=True)
                with open(target_path, "w", encoding="utf-8") as f:
                    f.write(content)
            
            # Validate entrypoint exists
            target_entrypoint = os.path.realpath(os.path.join(real_temp_dir, entrypoint))
            if not target_entrypoint.startswith(real_temp_dir) or not os.path.exists(target_entrypoint):
                return {
                    "stdout": "",
                    "stderr": f"Runtime Error: Entrypoint file '{entrypoint}' not found.",
                    "status": "Runtime Error",
                    "duration": 0
                }
            
            harness = f"""import sys
import builtins
import importlib.util
import os

def custom_input(prompt=""):
    if prompt:
        sys.stdout.write(str(prompt))
        sys.stdout.flush()
    input_line = sys.stdin.readline()
    if input_line:
        sys.stdout.write(input_line)
        if not input_line.endswith('\\n'):
            sys.stdout.write('\\n')
        sys.stdout.flush()
    return input_line.rstrip('\\n')

builtins.input = custom_input
sys.path.insert(0, os.getcwd())

spec = importlib.util.spec_from_file_location("__main__", {repr(target_entrypoint)})
module = importlib.util.module_from_spec(spec)
sys.modules["__main__"] = module
spec.loader.exec_module(module)
"""
            harness_path = os.path.join(real_temp_dir, "__harness__.py")
            with open(harness_path, "w", encoding="utf-8") as f:
                f.write(harness)

            cmd = [sys.executable, "__harness__.py"]
            result = subprocess.run(
                cmd,
                input=user_input,
                capture_output=True,
                text=True,
                timeout=time_limit,
                cwd=real_temp_dir
            )
            
            duration = time.time() - start_t
            
            if result.returncode != 0:
                clean_stderr = result.stderr.replace(real_temp_dir + os.sep, "")
                return {
                    "stdout": result.stdout,
                    "stderr": clean_stderr.strip(),
                    "status": "Runtime Error",
                    "duration": duration
                }
                
            return {
                "stdout": result.stdout,
                "stderr": None,
                "status": "Success",
                "duration": duration
            }
            
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "Time Limit Exceeded",
            "status": "Time Limit Exceeded",
            "duration": time.time() - start_t
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": str(e),
            "status": "Internal Error",
            "duration": time.time() - start_t
        }

def read_line_with_timeout(stream, timeout: float) -> str:
    """Non-blocking readline on POSIX (pipes), thread fallback on Windows."""
    if platform.system() != "Windows":
        r, _, _ = select.select([stream], [], [], timeout)
        if r:
            return stream.readline()
        return None
    else:
        q = queue.Queue()
        def reader():
            try:
                line = stream.readline()
                q.put(line)
            except Exception:
                q.put(None)
        t = threading.Thread(target=reader, daemon=True)
        t.start()
        t.join(timeout)
        if t.is_alive():
            return None
        return q.get_nowait()

class JudgeWorker:
    def __init__(self, worker_script_path, code):
        self.worker_script_path = worker_script_path
        self.code = code
        self.process = None
        self.init_error = None
        self.init_error_type = None
        self.start_worker()

    def start_worker(self):
        cmd = [sys.executable, self.worker_script_path]
        self.process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        init_msg = json.dumps({"type": "init", "code": self.code})
        try:
            self.process.stdin.write(init_msg + "\n")
            self.process.stdin.flush()
        except Exception as e:
            self.kill()
            raise RuntimeError(f"Failed to communicate with worker: {e}")
        
        try:
            resp_line = self.process.stdout.readline()
            if not resp_line:
                raise RuntimeError("Worker process terminated unexpectedly during initialization")
            resp = json.loads(resp_line)
            if resp.get("status") != "ready":
                self.init_error = resp.get("error", "Unknown compilation error")
                self.init_error_type = resp.get("error_type", "Compilation Error")
                raise RuntimeError(self.init_error)
        except Exception as e:
            self.kill()
            raise e

    def run_case(self, case_id, user_input, timeout=TIME_LIMIT):
        if not self.process or self.process.poll() is not None:
            self.start_worker()

        msg = json.dumps({"type": "run", "id": case_id, "input": user_input})
        try:
            self.process.stdin.write(msg + "\n")
            self.process.stdin.flush()
        except (BrokenPipeError, OSError):
            self.start_worker()
            self.process.stdin.write(msg + "\n")
            self.process.stdin.flush()

        resp_line = read_line_with_timeout(self.process.stdout, timeout)
        
        if resp_line is None:
            # Timed out! Kill process immediately to eliminate hang
            self.kill()
            self.start_worker()
            return {
                "test_case": case_id,
                "status": "Time Limit Exceeded",
                "error": "Time Limit Exceeded",
                "duration": timeout
            }
        
        try:
            resp = json.loads(resp_line)
        except Exception:
            self.kill()
            self.start_worker()
            return {
                "test_case": case_id,
                "status": "Runtime Error",
                "error": "Invalid response from worker process"
            }
            
        if resp.get("status") == "done":
            actual = normalize_output(resp.get("output", ""))
            return {
                "test_case": case_id,
                "status": "Done",
                "actual_output": actual,
                "error": resp.get("error"),
                "duration": resp.get("duration")
            }
        else:
            return {
                "test_case": case_id,
                "status": resp.get("error_type", "Runtime Error"),
                "error": resp.get("error")
            }

    def kill(self):
        if self.process:
            try:
                for stream in (self.process.stdin, self.process.stdout, self.process.stderr):
                    if stream:
                        try:
                            stream.close()
                        except Exception:
                            pass
                if psutil:
                    try:
                        parent = psutil.Process(self.process.pid)
                        for child in parent.children(recursive=True):
                            try:
                                child.kill()
                            except Exception:
                                pass
                        parent.kill()
                    except Exception:
                        pass
                else:
                    self.process.kill()
                self.process.wait(timeout=1)
            except Exception:
                try:
                    self.process.kill()
                except Exception:
                    pass
            finally:
                self.process = None

def run_code_multiple(code: str, test_cases: list, mode="ALL"):
    mode = (mode or "ALL").upper()
    if not test_cases:
        return {
            "final_status": "Accepted",
            "mode": mode,
            "total_duration": 0,
            "summary": {"passed": 0, "total": 0},
            "test_case_results": []
        }

    # Cap worker pool conservatively for serverless/local environments
    max_cores = os.cpu_count() or 2
    num_workers = min(max_cores, 4, len(test_cases))
    
    worker_script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "runner_worker.py")
    
    all_workers = []
    worker_queue = queue.Queue()
    init_errors = []
    
    try:
        def create_worker():
            try:
                w = JudgeWorker(worker_script, code)
                return w, None, None
            except Exception as e:
                err_type = getattr(w, "init_error_type", "Compilation Error") if 'w' in locals() else "Compilation Error"
                return None, str(e), err_type

        with ThreadPoolExecutor(max_workers=num_workers) as starter:
            futures = [starter.submit(create_worker) for _ in range(num_workers)]
            for f in futures:
                w, err, err_type = f.result()
                if w:
                    worker_queue.put(w)
                    all_workers.append(w)
                else:
                    init_errors.append((err, err_type))
        
        if worker_queue.empty():
            err_msg, err_type = init_errors[0] if init_errors else ("Compilation failed", "Compilation Error")
            return {
                "final_status": err_type,
                "mode": mode,
                "total_duration": 0,
                "summary": {"passed": 0, "total": len(test_cases)},
                "test_case_results": [{
                    "test_case": 0,
                    "status": err_type,
                    "error": err_msg
                }]
            }

        start_time = time.time()
        results = []
        abort_event = threading.Event()
        
        def process_test_case(tc_tuple):
            index, tc = tc_tuple
            if mode == "FIRST_FAIL" and abort_event.is_set():
                return None

            worker = None
            try:
                worker = worker_queue.get(timeout=10)
            except queue.Empty:
                return {
                    "test_case": index,
                    "status": "Internal Error",
                    "error": "Execution timeout waiting for worker",
                    "input": tc.get("input", "")
                }
            
            try:
                res = worker.run_case(index, tc.get("input", ""), TIME_LIMIT)
                expected = normalize_output(tc.get("output", ""))
                
                if res["status"] == "Time Limit Exceeded":
                    pass
                elif res["status"] in ("Runtime Error", "Compilation Error", "Security Violation"):
                    pass
                elif res.get("error"):
                    res["status"] = "Runtime Error"
                else:
                    if res.get("actual_output") == expected:
                        res["status"] = "Accepted"
                    else:
                        res["status"] = "Wrong Answer"
                        res["expected_output"] = expected
                
                if res["status"] != "Accepted":
                    res["input"] = tc.get("input", "")
                    if mode == "FIRST_FAIL":
                        abort_event.set()
                return res
            except Exception as e:
                return {
                    "test_case": index,
                    "status": "Internal Error",
                    "error": str(e),
                    "input": tc.get("input", "")
                }
            finally:
                worker_queue.put(worker)

        # For FIRST_FAIL, process in sequential order or small chunks to prevent wasted execution
        if mode == "FIRST_FAIL":
            for index, tc in enumerate(test_cases, start=1):
                res = process_test_case((index, tc))
                if res:
                    results.append(res)
                    if res["status"] != "Accepted":
                        break
        else:
            with ThreadPoolExecutor(max_workers=num_workers) as executor:
                tc_tuples = list(enumerate(test_cases, start=1))
                futures = [executor.submit(process_test_case, t) for t in tc_tuples]
                results = [f.result() for f in futures if f.result() is not None]

        end_time = time.time()
        total_duration = end_time - start_time
        
        results.sort(key=lambda x: x["test_case"])
        
        passed_count = sum(1 for r in results if r["status"] == "Accepted")
        final_status = "Accepted"
        
        if results:
            for r in results:
                if r["status"] != "Accepted":
                    final_status = r["status"]
                    break

        return {
            "final_status": final_status,
            "mode": mode,
            "total_duration": total_duration,
            "summary": {
                "passed": passed_count,
                "total": len(test_cases)
            },
            "test_case_results": results
        }

    finally:
        # Guarantee all spawned worker processes are cleaned up
        for w in all_workers:
            w.kill()
