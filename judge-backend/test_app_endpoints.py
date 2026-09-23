import os
import sys
import unittest
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app import app, PROBLEMS_CACHE, PROBLEMS_LIST_CACHE

client = TestClient(app)

class TestAppEndpoints(unittest.TestCase):
    def test_home(self):
        res = client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("message", res.json())

    def test_list_problems_cache(self):
        res = client.get("/problems")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["count"], 400)
        self.assertEqual(len(data["problems"]), data["count"])

    def test_get_valid_problem(self):
        res = client.get("/problems/two_sum")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["id"], "two_sum")
        self.assertIn("tags", data)

    def test_get_missing_problem_404(self):
        res = client.get("/problems/non_existent_problem_xyz")
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()["detail"], "Problem not found")

    def test_get_invalid_id_format(self):
        res = client.get("/problems/invalid@id!")
        self.assertEqual(res.status_code, 400)
        self.assertIn("Invalid problem ID format", res.json()["detail"])

    def test_submit_missing_problem_404(self):
        res = client.post("/submit", json={
            "problem_id": "non_existent_prob_123",
            "code": "print('hello')"
        })
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()["detail"], "Problem not found")

    def test_submit_valid_code(self):
        code = """
import sys
lines = sys.stdin.read().split()
if lines:
    target = int(lines[0])
    nums = [int(x) for x in lines[1:]]
    seen = {}
    found = False
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            print(f"[{seen[diff]}, {i}]")
            found = True
            break
        seen[num] = i
"""
        res = client.post("/submit", json={
            "problem_id": "two_sum",
            "code": code,
            "test_only": True
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["problem_id"], "two_sum")
        self.assertIn(data["final_status"], ["Accepted", "Wrong Answer"])

    def test_submit_syntax_error(self):
        code = "def bad_syntax(\n  return 1"
        res = client.post("/submit", json={
            "problem_id": "two_sum",
            "code": code,
            "test_only": True
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["final_status"], "Compilation Error")

    def test_run_single_file(self):
        res = client.post("/run", json={
            "code": "print('Hello Vlyxir')",
            "input": ""
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["stdout"].strip(), "Hello Vlyxir")

    def test_run_multi_file(self):
        res = client.post("/run", json={
            "files": [
                {"path": "main.py", "content": "import helper\nprint(helper.MSG)"},
                {"path": "helper.py", "content": "MSG = 'Modular Vlyxir'"}
            ],
            "input": ""
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["stdout"].strip(), "Modular Vlyxir")

if __name__ == "__main__":
    unittest.main()
