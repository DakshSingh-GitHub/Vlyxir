import sys
import json
import traceback
import io
import time
import os
from contextlib import redirect_stdout, redirect_stderr
from security import validate_code, get_safe_globals, WARNING_MESSAGE

# Resource limits (increased to 256MB to avoid premature 64-bit CPython address space crashes)
MAX_MEMORY_MB = 256
MAX_OUTPUT_CHARS = 100000 # ~100KB

def set_resource_limits():
    try:
        import resource
        mem_limit = MAX_MEMORY_MB * 1024 * 1024
        # Set address space limit (memory) safely
        try:
            resource.setrlimit(resource.RLIMIT_AS, (mem_limit, mem_limit))
        except (ValueError, OSError):
            pass
    except ImportError:
        pass

def main():
    compiled_code = None

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            message = json.loads(line)
        except json.JSONDecodeError:
            continue
            
        msg_type = message.get("type")
        
        if msg_type == "init":
            code = message.get("code", "")
            try:
                # Static analysis check
                is_valid, warning = validate_code(code)
                if not is_valid:
                    sys.stdout.write(json.dumps({"status": "error", "error": f"Security Error: {warning}", "error_type": "Security Violation"}) + "\n")
                    sys.stdout.flush()
                    continue

                compiled_code = compile(code, "<submission>", "exec")
                sys.stdout.write(json.dumps({"status": "ready"}) + "\n")
                sys.stdout.flush()
            except SyntaxError as e:
                err_msg = f"SyntaxError: {e.msg} (line {e.lineno})"
                sys.stdout.write(json.dumps({"status": "error", "error": err_msg, "error_type": "Compilation Error"}) + "\n")
                sys.stdout.flush()
            except Exception as e:
                sys.stdout.write(json.dumps({"status": "error", "error": str(e), "error_type": "Compilation Error"}) + "\n")
                sys.stdout.flush()
        
        elif msg_type == "run":
            if not compiled_code:
                sys.stdout.write(json.dumps({"status": "error", "error": "Code not initialized", "error_type": "Internal Error"}) + "\n")
                sys.stdout.flush()
                continue
                
            case_id = message.get("id")
            user_input = message.get("input", "")
            
            # Setup input/output
            input_stream = io.StringIO(user_input)
            output_stream = io.StringIO()
            
            set_resource_limits()

            start_time = time.time()
            error_output = ""
            
            # Fresh globals for isolation
            security_context = get_safe_globals()
            exec_globals = security_context.copy()
            
            # Custom input function
            def custom_input(prompt=""):
                if prompt:
                    sys.stdout.write(str(prompt))
                    sys.stdout.flush()
                input_line = sys.stdin.readline()
                return input_line.rstrip('\n')

            exec_globals["input"] = custom_input
            
            try:
                sys.stdin = input_stream
                with redirect_stdout(output_stream), redirect_stderr(output_stream):
                    exec(compiled_code, exec_globals)
            except MemoryError:
                error_output = "Memory Limit Exceeded"
            except Exception:
                exc_type, exc_value, tb = sys.exc_info()
                # Clean traceback to preserve user code frames while omitting internal runner frames
                frames = traceback.extract_tb(tb)
                user_frames = [f for f in frames if "<submission>" in f.filename or "<string>" in f.filename]
                if user_frames:
                    tb_str = "".join(traceback.format_list(user_frames)).strip()
                    error_output = f"{tb_str}\n{exc_type.__name__}: {exc_value}"
                else:
                    error_output = f"{exc_type.__name__}: {exc_value}"
            finally:
                sys.stdin = sys.__stdin__
            
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
