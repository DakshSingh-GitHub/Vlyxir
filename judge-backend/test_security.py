import json
import os
import sys

# Ensure we are in the right directory to import runner
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from runner import run_code_once
from security import WARNING_MESSAGE

def test_security():
    test_cases = [
        {
            "name": "Direct import socket",
            "code": "import socket\nprint(socket.gethostname())",
            "expected_violation": True
        },
        {
            "name": "From import socket",
            "code": "from socket import socket\nprint('imported')",
            "expected_violation": True
        },
        {
            "name": "Dynamic import __import__",
            "code": "s = __import__('socket')\nprint(s)",
            "expected_violation": True
        },
        {
            "name": "OS system call",
            "code": "import os\nos.system('ping 8.8.8.8')",
            "expected_violation": True
        },
        {
            "name": "Subprocess call",
            "code": "import subprocess\nsubprocess.run(['ping', '8.8.8.8'])",
            "expected_violation": True
        },
        {
            "name": "Normal code (math)",
            "code": "import math\nprint(math.sqrt(16))",
            "expected_violation": False
        },
        {
            "name": "Normal code (fibonacci)",
            "code": "def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)\nprint(fib(5))",
            "expected_violation": False
        },
        {
            "name": "Attempt to use open()",
            "code": "print(open('/etc/passwd').read())",
            "expected_violation": True
        },
        {
            "name": "Attempt to use getattr()",
            "code": "g = getattr; print(g(str, 'upper'))",
            "expected_violation": True
        },
        {
            "name": "Attempt to use sys.modules",
            "code": "import sys; print(sys.modules)",
            "expected_violation": True
        },
        {
            "name": "Subclasses sandbox escape",
            "code": "print(().__class__.__base__.__subclasses__())",
            "expected_violation": True
        },
        {
            "name": "Global introspection escape",
            "code": "def f(): pass\nprint(f.__globals__)",
            "expected_violation": True
        },
        {
            "name": "Legitimate variable with 'getattr'",
            "code": "target_attribute = 42\nreset_attribute = 10\nprint(target_attribute + reset_attribute)",
            "expected_violation": False
        },
        {
            "name": "Legitimate method named open",
            "code": "class Door:\n    def open(self):\n        return 'opened'\nd = Door()\nprint(d.open())",
            "expected_violation": False
        },
        {
            "name": "Standard CP sys.stdin usage",
            "code": "import sys\nline = sys.stdin.readline()\nprint('read:', line)",
            "expected_violation": False
        }
    ]

    print(f"{'Test Name':<35} | {'Status':<10} | {'Result'}")
    print("-" * 65)

    all_passed = True
    for tc in test_cases:
        result = run_code_once(tc["code"], "test input\n")
        stderr = result.get("stderr", "") or ""
        status = result.get("status", "")
        
        # Check if violation was detected either by status or stderr message
        violation_detected = bool("Security" in status or "Security" in stderr or WARNING_MESSAGE in stderr)
        
        if violation_detected == tc["expected_violation"]:
            print(f"{tc['name']:<35} | PASSED  | (Violation: {str(violation_detected)})")
        else:
            all_passed = False
            print(f"{tc['name']:<35} | FAILED  | Expected: {tc['expected_violation']}, Got: {violation_detected}")
            print(f"  Status: {status}")
            print(f"  Stderr: {stderr}")

    if not all_passed:
        sys.exit(1)
    print("\nAll security tests passed successfully!")

if __name__ == "__main__":
    test_security()
