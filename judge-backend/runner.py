import subprocess
import os
import time
import json
import psutil
from concurrent.futures import ThreadPoolExecutor
from security import validate_code

TIME_LIMIT = 2  # seconds
ENABLE_OPTIMIZATION = True # Set to False to disable threading/persistent workers

def run_single_test_case_sequential(index, tc, code_str, time_limit):
    # This is the old, slower way (one process per test case)
    import tempfile
    user_input = tc.get("input", "")
    expected_output = tc.get("output", "")

    suffix = ".py"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False, mode="w") as temp:
        temp.write(code_str)
        filename = temp.name

    cmd = ["python", filename]

    try:
        result = subprocess.run(
            cmd,
            input=user_input,
            capture_output=True,
            text=True,
            timeout=time_limit
        )
        
        if result.returncode != 0:
            return {
                "test_case": index,
                "status": "Runtime Error",
                "error": result.stderr,
                "input": user_input
            }

        actual_output = normalize_output(result.stdout)
        expected_output = normalize_output(expected_output)

        if actual_output == expected_output:
            return {
                "test_case": index,
                "status": "Accepted",
                "actual_output": actual_output,
                "expected_output": expected_output
            }
        else:
            return {
                "test_case": index,
                "status": "Wrong Answer",
                "actual_output": actual_output,
                "expected_output": expected_output,
                "input": user_input
            }

    except subprocess.TimeoutExpired:
        return {
            "test_case": index,
            "status": "Time Limit Exceeded",
            "error": "Time Limit Exceeded",
            "input": user_input
        }
    except Exception as e:
        return {
            "test_case": index,
            "status": "Internal Error",
            "error": str(e),
            "input": user_input
        }
    finally:
        if os.path.exists(filename):
            os.remove(filename)

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

    # Wrap code to emulate terminal behavior (echo input)
    # We use a harness to avoid modifying user line numbers too much
    harness = f"""
import sys
import builtins

def custom_input(prompt=""):
    if prompt:
        sys.stdout.write(str(prompt))
        sys.stdout.flush()
    
    # Read from original stdin
    input_line = sys.stdin.readline()
    
    # Echo back to stdout
    if input_line:
        sys.stdout.write(input_line)
        if not input_line.endswith('\\n'):
            sys.stdout.write('\\n')
        sys.stdout.flush()
    
    return input_line.rstrip('\\n')

# Override the built-in input
builtins.input = custom_input

# User code follows
{code}
"""
    suffix = ".py"
    cmd = ["python"]

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False, mode="w", encoding="utf-8") as temp:
        temp.write(harness)
        filename = temp.name

    start_t = time.time()
    try:
        cmd.append(filename)
        result = subprocess.run(
            cmd,
            input=user_input,
            capture_output=True,
            text=True,
            timeout=time_limit
        )
        
        duration = time.time() - start_t
        
        if result.returncode != 0:
            # Basic sanitization for stderr if it's a runtime error
            sanitized_stderr = result.stderr
            if result.stderr and "File \"" in result.stderr:
                # Simple heuristic to keep only the last line (the error message)
                # and avoid leaking the full path in the traceback
                lines = result.stderr.strip().splitlines()
                if lines:
                    sanitized_stderr = lines[-1]

            return {
                "stdout": result.stdout,
                "stderr": sanitized_stderr,
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
            os.remove(filename)

def normalize_output(output: str) -> str:
    lines = output.strip().splitlines()
    normalized_lines = [" ".join(line.split()) for line in lines]
    return "\n".join(normalized_lines)


class JudgeWorker:
    def __init__(self, worker_script_path, code):
        self.worker_script_path = worker_script_path
        self.code = code
        self.process = None
        self.start_worker()

    def start_worker(self):
        cmd = ["python", self.worker_script_path]
        self.process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        init_msg = json.dumps({"type": "init", "code": self.code})
        self.process.stdin.write(init_msg + "\n")
        self.process.stdin.flush()
        
        try:
            resp_line = self.process.stdout.readline()
            if not resp_line:
                raise RuntimeError("Worker exited unexpectedly during initialization")
            resp = json.loads(resp_line)
            if resp.get("status") != "ready":
                raise RuntimeError(f"Worker init failed: {resp.get('error')}")
        except Exception as e:
            self.kill()
            raise e

    def run_case(self, case_id, user_input, timeout=TIME_LIMIT):
        if self.process.poll() is not None:
             # Process died, restart? Or just fail?
             # For a robust pool, we might want to restart, but for now lets assume it stays alive
             # If it died, it might be due to a previous crash?
             self.start_worker()

        msg = json.dumps({"type": "run", "id": case_id, "input": user_input})
        try:
            self.process.stdin.write(msg + "\n")
            self.process.stdin.flush()
        except BrokenPipeError:
            self.start_worker()
            self.process.stdin.write(msg + "\n")
            self.process.stdin.flush()

        # We must read with timeout. Implementation of read with timeout on pipe is tricky in cross-platform.
        # However, we can use a thread to read or select (linux). Windows select only works on sockets.
        # A simpler way for this proof of concept:
        # Since we are inside a ThreadPool in runner, we can just block on readline? 
        # No, because if user code infinite loops, we block forever.
        # We need to enforce timeout from the 'outside'.
        # But 'runner_worker' uses `exec` which is blocking. 
        # Wait, `runner_worker` doesn't enforce timeout on `exec` itself easily without signals (unix only) or another thread.
        # My `runner_worker` logic just runs `exec`. If it loops forever, the worker process hangs.
        # So the *Supervisor* (this class) needs to handle the timeout and KILL the worker.
        
        # To do this effectively:
        # We can use a polling approach or a separate thread that waits on the output.
        # Given we are already in a thread pool, we can't easily wait with timeout on a file object in a clean cross-platform way without libraries.
        # BUT, we can use the `run_single` passed to ThreadPoolExecutor to handle this wait?
        # Actually, `subprocess.communicate` has a timeout! But that waits for process exit usually? 
        # No, we want to read ONE line.
        
        # Best bet for stability:
        # We assume the worker handles the execution. 
        # BUT `runner_worker.py` as written does *NOT* handle timeout (it relies on `exec` finishing).
        # So if user code loops, worker hangs.
        # So WE MUST KILL the worker if it doesn't respond in time.
        
        start_t = time.time()
        while True:
            if time.time() - start_t > timeout:
                self.kill()
                self.start_worker()
                return {
                    "test_case": case_id,
                    "status": "Time Limit Exceeded",
                    "error": "Time Limit Exceeded"
                }
            
            # Non-blocking read is hard on windows pipes without win32api.
            # Workaround:
            # We can't do non-blocking read easily. 
            # We can use a trick: `peek`? No.
            # We accepted that we use `runner_worker`. 
            # If we want to support timeouts properly, `runner_worker` should spawn a thread for `exec` and join it with timeout.
            # Let's Modify `runner_worker`? 
            # To avoid context switching craziness, let's keep `runner_worker` simple and handle kill here.
            # But validation "takes 3 seconds".
            # The issue with proper timeout here is that `readline()` blocks.
            # If we block on `readline()`, we hang.
            
            # QUICK FIX: Use a Timer to kill the process?
            # Or just rely on the fact that for valid code it returns fast. 
            # For INVALID code (infinite loop), we do need to kill it.
            # Python `entry` point:
            pass 
            # Re-thinking: In a production judge, we use docker/cgroups etc.
            # Here: simple local judge.
            # Let's rely on `runner_worker` to return fast. 
            # If it's slow, we block? That's bad for the pool.
            
            # Let's trust `runner_worker` to return. 
            # Actually, `runner_worker` won't return if infinite loop.
            # So we NEED a timeout.
            # We can't do `readline(timeout)`.
            
            # Hack: Use a separate thread to read from stdout?
            # Or simply: don't use persistent worker for *UNTRUSTED* code if we can't control it?
            # Wait, `runner.py` previously used `subprocess.run(timeout=...)`.
            
            # Let's just implement a simple busy-wait check with `process.stdout`? No can't check if data is there easily.
            
            # Okay, let's proceed with blocking read for now, but wrapped in a future with timeout????
            # No, we are already in a thread pool.
            
            break

        try:
             # This blocks until worker replies. 
             # If worker hangs (infinite loop), this blocks forever.
             # We need to wrap THIS read in a timeout mechanism.
             # Since we are in a thread (from ThreadPoolExecutor in main), 
             # we can't easily timeout *this* specific blocking call unless the I/O supports it.
             
             # ALTERNATIVE:
             # The worker itself spawns a thread to run the user code.
             # If that thread times out, the worker kills it (hard in python) or just reports "TLE" and exits?
             # Python threads can't be killed.
             # So the WORKER process must be killed if TLE.
             
             # So the MANAGER (this code) is responsible.
             # We can use `subprocess.Popen`... but we are talking to an existing process.
             
             # Revised plan for stability:
             # We use `run_in_executor` to wait for line?
             pass
        except:  # noqa: E722
            pass
        
        result_container = {}
        def read_response():
            try:
                line = self.process.stdout.readline()
                if line:
                    result_container['data'] = json.loads(line)
            except:  # noqa: E722
                pass

        import threading
        t = threading.Thread(target=read_response)
        t.daemon = True
        t.start()
        t.join(timeout)
        
        if t.is_alive():
            # TIMEOUT!
            # We must kill the worker process because it is stuck in the loop
            self.kill()
            self.start_worker()
            return {
                "test_case": case_id,
                "status": "Time Limit Exceeded",
                "error": "Time Limit Exceeded"
            }
        
        if 'data' not in result_container:
            self.start_worker()
            return {
                "test_case": case_id,
                "status": "Runtime Error",
                "error": "Worker process died unexpectedly"
            }
            
        resp = result_container['data']
        
        if resp['status'] == 'done':
            actual = normalize_output(resp['output'])
            # We don't have expected output here
            # The method signature is `run_case(self, case_id, user_input, timeout)`
            # We return output and let the caller verify
            # Previous `run_single_test_case` did verification.
            return {
                "test_case": case_id,
                "status": "Done", # Intermediate status
                "actual_output": actual,
                "error": resp.get("error"),
                "duration": resp.get("duration")
            }
        else:
            return {
                "test_case": case_id,
                "status": "Runtime Error",
                "error": resp.get('error')
            }


    def kill(self):
        if self.process:
            try:
                parent = psutil.Process(self.process.pid)
                for child in parent.children(recursive=True):
                    child.kill()
                parent.kill()
            except:  # noqa: E722
                pass
            self.process = None

def run_code_multiple(code, test_cases, mode="ALL"):
    mode = (mode or "ALL").upper()
    
    if not ENABLE_OPTIMIZATION:
        # SLOW SEQUENTIAL MODE
        start_time = time.time()
        results = []
        passed_count = 0
        
        for index, tc in enumerate(test_cases, start=1):
            res = run_single_test_case_sequential(index, tc, code, TIME_LIMIT)
            results.append(res)
            if res["status"] == "Accepted":
                passed_count += 1
            if mode == "FIRST_FAIL" and res["status"] != "Accepted":
                break
        
        end_time = time.time()
        
        final_status = "Accepted"
        if results:
            for r in results:
                if r["status"] != "Accepted":
                    final_status = r["status"]
                    break

        return {
            "final_status": final_status,
            "mode": mode,
            "total_duration": end_time - start_time,
            "summary": {
                "passed": passed_count,
                "total": len(test_cases)
            },
            "test_case_results": results
        }
    
    num_workers = min(os.cpu_count() or 4, len(test_cases))
    # Cap at 8 to avoid memory explosion if many heavy workers
    num_workers = min(num_workers, 8)
    
    worker_script_name = "runner_worker.py"
    worker_script = os.path.join(os.path.dirname(__file__), worker_script_name)
    
    # Initialize workers
    workers = []  # noqa: F841
    import queue
    worker_queue = queue.Queue()
    
    try: # Parallel worker initialization
        def create_worker():
            try:
                w = JudgeWorker(worker_script, code)
                return w
            except Exception:
                return None

        with ThreadPoolExecutor(max_workers=num_workers) as starter:
            futures = [starter.submit(create_worker) for _ in range(num_workers)]
            for f in futures:
                w = f.result()
                if w:
                    worker_queue.put(w)
        
        if worker_queue.empty():
            return {
                "final_status": "Runtime Error",
                "mode": mode,
                "total_duration": 0,
                "summary": {"passed": 0, "total": len(test_cases)},
                "test_case_results": [{"test_case": 0, "status": "Runtime Error", "error": "Failed to initialize workers (Compilation Error?)"}]
            }

        start_time = time.time()
        
        results = []
        
        def process_test_case(tc_tuple):
            index, tc = tc_tuple
            worker = None
            try:
                worker = worker_queue.get(timeout=10) # Wait for a worker
            except queue.Empty:
                return {
                    "test_case": index,
                    "status": "Internal Error",
                    "error": "No workers available",
                    "input": tc.get("input", "")
                }
            
            try:
                # Run execution
                res = worker.run_case(index, tc.get("input", ""), TIME_LIMIT)
                expected = normalize_output(tc.get("output", ""))
                
                if res["status"] == "Time Limit Exceeded":
                    pass # Keep as is
                elif res["status"] == "Runtime Error":
                     pass
                elif res.get("error"):
                    res["status"] = "Runtime Error"
                else:
                    if res["actual_output"] == expected:
                        res["status"] = "Accepted"
                    else:
                        res["status"] = "Wrong Answer"
                        res["expected_output"] = expected
                
                if res["status"] != "Accepted":
                    res["input"] = tc.get("input", "")
                return res
            except Exception as e:
                return {
                    "test_case": index,
                    "status": "Internal Error",
                    "error": str(e),
                    "input": tc.get("input", "")
                }
            finally:
                # Return worker to queue
                worker_queue.put(worker)

        with ThreadPoolExecutor(max_workers=num_workers) as executor:
            # Enumerate test cases
            tc_tuples = list(enumerate(test_cases, start=1))
            futures = [executor.submit(process_test_case, t) for t in tc_tuples]
            results = [f.result() for f in futures]

        end_time = time.time()
        total_duration = end_time - start_time
        
        while not worker_queue.empty():
            w = worker_queue.get()
            w.kill()

        results.sort(key=lambda x: x["test_case"])
        
        passed_count = sum(1 for r in results if r["status"] == "Accepted")
        final_status = "Accepted"
        
        if mode == "FIRST_FAIL":
             fail_index = next((i for i, x in enumerate(results) if x["status"] != "Accepted"), -1)
             if fail_index != -1:
                 final_status = results[fail_index]["status"]
                 results = results[:fail_index+1]
        else:
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

    except Exception as e:
        # Emergency cleanup
        while not worker_queue.empty():
            try:
                w = worker_queue.get_nowait()
                w.kill()
            except:  # noqa: E722
                pass
        raise e
