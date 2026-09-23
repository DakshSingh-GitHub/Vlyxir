import runner
import time

def verify_tle():
    print("Verifying TLE...")
    code = """
import time
while True:
    pass
"""
    tcs = [{"input": "1", "output": "1"}]
    start = time.time()
    res = runner.run_code_multiple(code, tcs)
    dur = time.time() - start
    print(f"TLE Duration: {dur:.4f}s")
    print(f"Status: {res['final_status']}")
    print(f"Results: {res['test_case_results'][0]['status']}")
    assert res['test_case_results'][0]['status'] == "Time Limit Exceeded"

def verify_error():
    print("\nVerifying Runtime Error...")
    code = """
print(1/0)
"""
    tcs = [{"input": "1", "output": "1"}]
    res = runner.run_code_multiple(code, tcs)
    print(f"Status: {res['final_status']}")
    print(f"Results: {res['test_case_results'][0]['status']}")
    assert res['test_case_results'][0]['status'] == "Runtime Error"

def verify_compilation_error():
    print("\nVerifying Compilation Error Propagation...")
    code = """
def broken_syntax(
    return 42
"""
    tcs = [{"input": "1", "output": "1"}]
    res = runner.run_code_multiple(code, tcs)
    print(f"Status: {res['final_status']}")
    print(f"Error: {res['test_case_results'][0].get('error')}")
    assert res['final_status'] == "Compilation Error"
    assert "SyntaxError" in res['test_case_results'][0].get('error', '')

def verify_first_fail():
    print("\nVerifying FIRST_FAIL Short-Circuiting...")
    code = """
val = int(input())
if val == 1:
    print(1)
else:
    print(999)
"""
    tcs = [
        {"input": "2", "output": "2"}, # Fails
        {"input": "3", "output": "3"}, # Should not be run
        {"input": "4", "output": "4"}
    ]
    res = runner.run_code_multiple(code, tcs, mode="FIRST_FAIL")
    print(f"Status: {res['final_status']}")
    print(f"Num results returned: {len(res['test_case_results'])}")
    assert res['final_status'] == "Wrong Answer"
    assert len(res['test_case_results']) == 1

if __name__ == "__main__":
    verify_tle()
    verify_error()
    verify_compilation_error()
    verify_first_fail()
    print("\nRobustness verification passed.")
