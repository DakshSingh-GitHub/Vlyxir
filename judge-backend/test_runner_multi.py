import unittest
from runner import run_code_multi

class TestMultiFileRunner(unittest.TestCase):
    def test_basic_multi_file(self):
        files = [
            {
                "path": "main.py",
                "content": "from utils.helper import greet\nprint(greet('Vlyxir'))"
            },
            {
                "path": "utils/helper.py",
                "content": "def greet(name):\n    return f'Hello, {name}!'"
            }
        ]
        result = run_code_multi(files, "main.py", "")
        self.assertEqual(result["status"], "Success")
        self.assertEqual(result["stdout"].strip(), "Hello, Vlyxir!")
        self.assertIsNone(result["stderr"])

    def test_directory_traversal_prevention(self):
        files = [
            {
                "path": "../evil.py",
                "content": "print('evil')"
            }
        ]
        result = run_code_multi(files, "main.py", "")
        self.assertEqual(result["status"], "Security Violation")
        self.assertIn("Security Error", result["stderr"])

    def test_missing_entrypoint(self):
        files = [
            {
                "path": "helper.py",
                "content": "print('helper')"
            }
        ]
        result = run_code_multi(files, "main.py", "")
        self.assertEqual(result["status"], "Runtime Error")
        self.assertIn("Entrypoint file 'main.py' not found", result["stderr"])

if __name__ == "__main__":
    unittest.main()
