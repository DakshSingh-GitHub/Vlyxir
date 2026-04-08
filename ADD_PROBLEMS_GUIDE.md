# How to Add New Problems to CodeJudge

This document provides instructions on how to add new programming problems to the CodeJudge backend.

## 1. Problem File Location
All problems are stored as JSON files in the following directory:
`judge-backend/problems/`

Each file name should be the lowercase `id` of the problem followed by `.json` (e.g., `two_sum.json`).

## 2. JSON Structure
A problem file must follow this structure:

```json
{
    "id": "problem_id",
    "title": "Problem Title",
    "description": "Full description of the problem.",
    "input_format": "Description of the input format.",
    "output_format": "Description of the output format.",
    "constraints": {
        "constraint_1": "Description",
        "constraint_2": "Description"
    },
    "difficulty": "easy",
    "judge_mode": "str_compare_strip",
    "time_limit": 1,
    "sample_test_cases": [
        {
            "input": "sample_input",
            "output": "sample_output"
        }
    ],
    "hidden_test_cases": [
        {
            "input": "hidden_input_1",
            "output": "hidden_output_1"
        },
        ...
    ]
}
```

### Key Fields:
- **`judge_mode`**: Usually `str_compare_strip` (compares output strings after stripping whitespace).
- **`time_limit`**: Maximum execution time in seconds.
- **`hidden_test_cases`**: Ideally 100-120 cases for robust testing.

## 3. Adding 20 Problems Automatically
To add problems in bulk (like the recent addition), follow these steps:

### Step 1: Create a Generation Script
Create a temporary Python script (e.g., `populate_more.py`) in `judge-backend/problems/`.

### Step 2: Implement Generators
For each problem, write a function that:
1.  Defines the metadata.
2.  Generates random valid inputs.
3.  Computes the correct output using a reference implementation.
4.  Saves the resulting dictionary as a JSON file using `json.dump`.

Example Generator:
```python
def gen_example_problem():
    samples = [{"input": "5", "output": "25"}]
    hidden = []
    for _ in range(100):
        n = random.randint(1, 100)
        hidden.append({"input": str(n), "output": str(n * n)})
    
    save_problem("square_number", {
        "id": "square_number",
        "title": "Square of a Number",
        "description": "Return the square of the given integer.",
        # ... other fields ...
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })
```

### Step 3: Run the Script
```bash
python populate_more.py
```

> [!IMPORTANT]
> **Windows Security**: If you encounter `OSError: [Errno 22]` or `PermissionError`, ensure that **Windows Controlled Folder Access** is disabled or the Python executable is added as an allowed app.

### Step 4: Verify
List the files to ensure they were created:
```bash
ls judge-backend/problems/
```

### Step 5: Cleanup
Delete the temporary generation script after the JSON files are created.

## 4. Troubleshooting
- **JSON Errors**: Ensure all test case inputs/outputs are strings (use `str()` or `json.dumps()` for complex types).
- **Path Issues**: Use `os.path.join` to handle cross-platform path differences.

## 5. Recently Added Problems (20 Unique Problems)

The following problems were recently added to the platform:

1.  **Min Stack**: Design a stack with constant-time minimum retrieval.
2.  **Implement Queue using Stacks**: FIFO queue using two stacks.
3.  **Backspace String Compare**: String equality with backspace characters.
4.  **Longest Continuous Increasing Subsequence**: Max length of continuous increasing subarray.
5.  **Degree of an Array**: Shortest subarray with the same degree.
6.  **Unique Email Addresses**: Email normalization and uniqueness count.
7.  **Steps to Reduce to Zero**: Count steps dividing by 2 or subtracting 1.
8.  **Decompress Run-Length List**: Expanding RLE compressed arrays.
9.  **Product and Sum Difference**: Difference between product and sum of digits.
10. **Even Number of Digits**: Count integers in an array with even digit counts.
11. **Create Target Array**: Insert logic for array construction.
12. **Matches in Tournament**: Count total matches in a knockout tournament.
13. **Decode XORed Array**: Reconstruct original array from XORed sequence.
14. **GCD of Min and Max**: Find GCD of the smallest and largest array elements.
15. **Words with Prefix**: Count strings starting with a given prefix.
16. **Min Bit Flips**: Number of bits to flip to convert one integer to another.
17. **Root Equals Sum of Children**: Check if a 3-node tree satisfies root = left + right.
18. **Amount Paid in Taxes**: Calculate tax based on progressive brackets.
19. **Percentage of Letter**: Rounded percentage of a character in a string.
20. **Equal Digit Count and Value**: Validate digit frequency matches its value in a string.
