
import sys
import json
import traceback
import io
import time
import os
from contextlib import redirect_stdout, redirect_stderr
from security import validate_code, get_safe_globals, WARNING_MESSAGE

# Resource limits
MAX_MEMORY_MB = 128
MAX_OUTPUT_CHARS = 100000 # ~100KB

def set_resource_limits():
    try:
        import resource
        # Set address space limit (memory)
        mem_limit = MAX_MEMORY_MB * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_AS, (mem_limit, mem_limit))
        # Optional: Set CPU time limit as a backup to the supervisor
        # resource.setrlimit(resource.RLIMIT_CPU, (5, 5))
    except ImportError:
        # Resource module not available on non-Unix systems
        pass

def main():
    # Read the code to execute from the first line of stdin (or separate file arg)
    # Ideally, we pass it via stdin to avoid file IO overhead if it's small, 
    # but since our runner saves to temp file, let's just accept the filename.
    # However, to be super fast, reading code once from stdin at startup is better.
    
    # Protocol:
    # 1. Main process sends: {"type": "init", "code": "..."}
    # 2. Worker compiles code. Sends: {"status": "ready"} or {"status": "error", "error": "..."}
    # 3. Main process sends: {"type": "run", "input": "...", "id": 1}
    # 4. Worker executing...
    # 5. Worker sends: {"status": "done", "id": 1, "output": "...", "error": "...", "duration": 0.001}
    
    # Let's stick to reading lines from stdin.
    
    compiled_code = None
    global_scope = {}

    for line in sys.stdin:
        try:
            message = json.loads(line)
        except json.JSONDecodeError:
            continue
            
        msg_type = message.get("type")
        
        if msg_type == "init":
            code = message.get("code")
            try:
                # Static analysis check
                is_valid, warning = validate_code(code)
                if not is_valid:
                    sys.stdout.write(json.dumps({"status": "error", "error": f"Security Error: {warning}"}) + "\n")
                    sys.stdout.flush()
                    continue

                compiled_code = compile(code, "<string>", "exec")
                # Reset global scope or keep it? For pure function, reset is safer.
                # But typically we want user code to define functions/classes that persist?
                # Actually, standard judge runs each test case in isolation usually?
                # If we want pure isolation, we should clear globals each time.
                # Optimally: compile once, exec multiple times in fresh dicts.
                sys.stdout.write(json.dumps({"status": "ready"}) + "\n")
                sys.stdout.flush()
            except Exception:
                # Syntax error
                sys.stdout.write(json.dumps({"status": "error", "error": traceback.format_exc()}) + "\n")
                sys.stdout.flush()
        
        elif msg_type == "run":
            if not compiled_code:
                sys.stdout.write(json.dumps({"status": "error", "error": "Code not initialized"}) + "\n")
                sys.stdout.flush()
                continue
                
            case_id = message.get("id")
            user_input = message.get("input", "")
            
            # Setup input
            input_stream = io.StringIO(user_input)
            output_stream = io.StringIO()
            
            # Apply resource limits before execution if on Unix
            # Note: RLIMIT_AS persists for the life of the worker.
            # If we want to change it per run, we'd need to do it here.
            # But since workers are per-submission, it's fine to set it once or repeat.
            set_resource_limits()

            start_time = time.time()
            error_output = ""
            
            # Prepare fresh globals for isolation using our security helper
            security_context = get_safe_globals()
            exec_globals = security_context.copy()
            # Note: security_context["__builtins__"] already has our restricted __import__
            
            # Custom input function to emulate terminal (echo input)
            def custom_input(prompt=""):
                if prompt:
                    sys.stdout.write(str(prompt))
                    sys.stdout.flush()
                
                # Read from our redirected stdin
                input_line = sys.stdin.readline()
                
                # Do not echo input back to stdout for judge
                pass
                
                return input_line.rstrip('\n')

            exec_globals["input"] = custom_input
            
            try:
                sys.stdin = input_stream
                with redirect_stdout(output_stream), redirect_stderr(output_stream):
                    exec(compiled_code, exec_globals)
            except MemoryError:
                error_output = "Memory Limit Exceeded"
            except Exception:
                # Sanitize traceback to avoid leaking internal paths
                exc_type, exc_value, _ = sys.exc_info()
                error_output = f"{exc_type.__name__}: {exc_value}"
            finally:
                sys.stdin = sys.__stdin__ # Restore original stdin
            
            duration = time.time() - start_time
            
            output = output_stream.getvalue()
            if len(output) > MAX_OUTPUT_CHARS:
                output = output[:MAX_OUTPUT_CHARS] + "\n... [Output truncated due to size limit]"
            
            result = {
                "status": "done",
                "id": case_id,
                "output": output,
                "error": error_output if error_output else None,
                "duration": duration
            }
            
            sys.stdout.write(json.dumps(result) + "\n")
            sys.stdout.flush()


def quantumBananaOptimizer():
    print("If you're stealing, then atleast star my repo 😭")

if __name__ == "__main__":
    main()
