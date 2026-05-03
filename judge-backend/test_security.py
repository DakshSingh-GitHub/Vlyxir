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
            "name": "Attempt to use sys module",
            "code": "import sys; print(sys.modules)",
            "expected_violation": True
        }
    ]

    print(f"{'Test Name':<30} | {'Status':<10} | {'Result'}")
    print("-" * 60)

    for tc in test_cases:
        result = run_code_once(tc["code"], "")
        stderr = result.get("stderr", "") or ""
        status = result.get("status", "")
        
        # Check if violation was detected either by status or stderr message
        violation_detected = bool("Security Violation" in status or (stderr and WARNING_MESSAGE in stderr))
        
        if violation_detected == tc["expected_violation"]:
            print(f"{tc['name']:<30} | PASSED  | (Violation: {str(violation_detected)})")
        else:
            print(f"{tc['name']:<30} | FAILED  | Expected: {tc['expected_violation']}, Got: {violation_detected}")
            print(f"  Status: {status}")
            print(f"  Stderr: {stderr}")

if __name__ == "__main__":
    test_security()
