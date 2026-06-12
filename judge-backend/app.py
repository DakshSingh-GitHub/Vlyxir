import json
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import jwt
from runner import run_code_multiple, run_code_once, run_code_multi

app = FastAPI(title="Judge Backend", description="FastAPI migration of the Code Judge backend")

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

def get_current_user(authorization: Optional[str] = Header(None)):
    if not SUPABASE_JWT_SECRET:
        # If no secret is provided, we might be in dev mode,
        # but for security, we should ideally require it.
        # For now, let's just log a warning and allow if not set,
        # OR enforce it. Given this is a security fix, let's enforce it if not in dev.
        if os.getenv("ENV") == "production":
            raise HTTPException(status_code=500, detail="JWT secret not configured")
        return {"id": "dev-user"}

    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Configure CORS
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    # Handle the case where someone might put "*" in the env var,
    # but we want to encourage specific origins.
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]
else:
    # Default to localhost for development and the production domain
    allowed_origins = [
        "http://localhost:3000",
        "https://vlyxir.vercel.app"
    ]

# If we are in production, we should definitely NOT allow "*"
if os.getenv("ENV") == "production" and "*" in allowed_origins:
    # Force a more restrictive policy or log a critical warning
    # For now, let's just remove the wildcard if other origins are present
    allowed_origins = [o for o in allowed_origins if o != "*"]
    if not allowed_origins:
         allowed_origins = ["https://vlyxir.vercel.app"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    # Allow Vercel preview deployments (supports both vlyxir- and code-judge- prefixes)
    allow_origin_regex=r"https://(vlyxir|code-judge)-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["POST", "GET"], # Restrict to necessary methods
    allow_headers=["Content-Type", "Authorization"], # Restrict to necessary headers
)

PROBLEMS_DIR = "problems"

TAG_RULES = {
    "Array": ["array", "list", "permutation", "duplicate", "intersect", "subarray", "subsequence", "rotate", "vector", "wealth", "sorted_array", "squares_of", "move_zeroes", "remove_duplicates"],
    "String": ["string", "anagram", "palindrome", "word", "parenthes", "sentence", "text", "vowel", "consonant", "letter", "prefix", "suffix", "regex", "ip_address", "ip address", "defanging", "valid_parentheses"],
    "Hash Table": ["hash", "map", "dict", "two_sum", "two sum", "three_sum", "three sum", "four_sum", "four sum", "duplicate", "anagram", "frequency", "contains_duplicate", "contains duplicate", "jewels", "stones", "ransom", "isomorphic", "word_pattern"],
    "Math": ["math", "integer", "roman", "number", "digit", "prime", "factorial", "fibonacci", "gcd", "lcm", "pow", "power", "sqrt", "add", "sum", "sub", "multiply", "divide", "modulo", "calculator", "tax", "coin", "degree", "geometry", "leap", "wealth", "fizz", "buzz", "even", "odd", "plus_one", "complement", "self_dividing"],
    "Dynamic Programming": ["dp", "dynamic programming", "climb", "stairs", "robber", "coin", "change", "knapsack", "subsequence", "path", "ways", "decode", "ticket", "edit", "distance", "climbing_stairs"],
    "Binary Search": ["binary_search", "binary search", "search", "peak", "first_bad", "first bad", "koko", "bananas", "missing", "sorted_array", "rotated"],
    "Sorting": ["sort", "merge", "heap", "priority", "parity", "frequent", "kth", "colors"],
    "Greedy": ["greedy", "jump", "flower", "candy", "lemonade", "gas", "interval", "meeting", "room", "non_overlap", "non overlap"],
    "Depth-First Search (DFS)": ["dfs", "depth-first", "depth first", "depth_first", "tree", "island", "flood", "word_search", "word search", "graph", "path", "province"],
    "Breadth-First Search (BFS)": ["bfs", "breadth-first", "breadth first", "breadth_first", "tree", "island", "graph", "shortest", "ladder"],
    "Tree": ["tree", "bst", "binary_tree", "binary tree", "inorder", "preorder", "postorder", "lca", "ancestor", "invert", "depth", "validate_bst"],
    "Linked List": ["linked_list", "linked list", "node", "cycle", "pointer", "reverse_linked", "reverse linked"],
    "Two Pointers": ["two_pointer", "two pointer", "pointer", "palindrome", "reverse", "three_sum", "three sum", "four_sum", "four sum", "container", "rain", "water", "sorted"],
    "Sliding Window": ["window", "substring", "longest_substring", "longest substring", "character", "consecutive", "ones"],
    "Graph": ["graph", "network", "delay", "clone", "course", "schedule", "province", "component", "town", "judge"],
    "Bit Manipulation": ["bit", "xor", "binary_to", "binary to", "decimal", "complement", "hamming"],
    "Stack": ["stack", "parenthes", "reverse_polish", "reverse polish", "rpn", "polish"],
    "Queue": ["queue", "sliding", "window"],
    "Backtracking": ["backtrack", "queen", "sudoku", "combination", "subset", "permutation", "parentheses"],
    "Matrix": ["matrix", "grid", "diagonal", "transpose", "rotate_image", "rotate image", "island", "reshape"]
}

def get_problem_tags(problem: dict) -> List[str]:
    tags = set(problem.get("tags", []))
    title = str(problem.get("title", "")).lower()
    desc = str(problem.get("description", "")).lower()
    file_id = str(problem.get("id", "")).lower()

    for tag, keywords in TAG_RULES.items():
        for keyword in keywords:
            if keyword in title or keyword in desc or keyword in file_id:
                tags.add(tag)
                break

    if "two_sum" in file_id or "two sum" in title:
        tags.update(["Array", "Hash Table"])
    if "binary_search" in file_id or "binary search" in title:
        tags.update(["Binary Search", "Array"])
    if "climbing_stairs" in file_id or "climbing stairs" in title:
        tags.update(["Dynamic Programming", "Math"])

    if not tags:
        tags.add("General")

    return sorted(list(tags))

# Pydantic Models
class TestCase(BaseModel):
    input: str
    output: str

class ProblemBase(BaseModel):
    id: Optional[str] = ""
    title: Optional[str] = ""
    description: Optional[str] = ""
    difficulty: Optional[str] = "medium"
    tags: Optional[List[str]] = []

class ProblemDetail(ProblemBase):
    judge_mode: str = "ALL"
    sample_test_cases: List[TestCase] = []
    hidden_test_cases: List[TestCase] = []
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    constraints: Optional[str] = None

class SubmitRequest(BaseModel):
    problem_id: str
    code: str
    test_only: Optional[bool] = False

class FileInfo(BaseModel):
    path: str
    content: str

class RunRequest(BaseModel):
    code: Optional[str] = None
    files: Optional[List[FileInfo]] = None
    entrypoint: Optional[str] = None
    input: Optional[str] = ""


class RunResponse(BaseModel):
    stdout: str
    stderr: Optional[str] = None
    status: str
    duration: float

class TestCaseResult(BaseModel):
    test_case: int
    status: str
    input: Optional[str] = None
    actual_output: Optional[str] = None
    expected_output: Optional[str] = None
    error: Optional[str] = None
    duration: Optional[float] = None

class SubmitResponse(BaseModel):
    problem_id: str
    final_status: str
    total_duration: float
    summary: dict
    test_case_results: List[dict] # Modified slightly to handle visible results logic

class ProblemSummary(ProblemBase):
    sample_test_cases_count: Optional[int] = 0
    hidden_test_cases_count: Optional[int] = 0

class ProblemsListResponse(BaseModel):
    count: int
    problems: List[ProblemSummary]

# Helper Functions
def normalize_judge_mode(raw_mode: Optional[str]) -> str:
    mode = str(raw_mode or "").strip().upper()
    if mode in ["ALL", "FIRST_FAIL"]:
        return mode
    return "ALL"


def validate_problem_data(problem: dict) -> List[str]:
    errors = []
    required_fields = ["id", "title", "description"]
    
    for field in required_fields:
        if field not in problem:
            errors.append(f"Missing field: '{field}'")
            
    for tc_type in ["sample_test_cases", "hidden_test_cases"]:
        if tc_type in problem:
            if not isinstance(problem[tc_type], list):
                errors.append(f"'{tc_type}' must be a list")
                continue
            for idx, tc in enumerate(problem[tc_type], start=1):
                if not isinstance(tc, dict):
                    errors.append(f"{tc_type}[{idx}] must be an object")
                    continue
                if "input" not in tc or "output" not in tc:
                    errors.append(f"{tc_type}[{idx}] must contain 'input' and 'output'")
                    
    return errors

# Routes
@app.get("/")
def home():
    return {"message": "Hello from FastAPI on Vercel!"}

@app.get("/problems", response_model=ProblemsListResponse)
def list_problems():
    problems = []
    if not os.path.exists(PROBLEMS_DIR):
        return {"count": 0, "problems": []}

    for filename in os.listdir(PROBLEMS_DIR):
        if not filename.endswith(".json"):
            continue
        problem_path = os.path.join(PROBLEMS_DIR, filename)
        try:
            with open(problem_path, "r", encoding="utf-8") as f:
                problem = json.load(f)
            problems.append({
                "id": problem.get("id"),
                "title": problem.get("title"),
                "description": problem.get("description"),
                "difficulty": problem.get("difficulty", "medium"),
                "tags": get_problem_tags(problem),
                "sample_test_cases_count": len(problem.get("sample_test_cases", [])),
                "hidden_test_cases_count": len(problem.get("hidden_test_cases", []))
            })
        except Exception as e:
            print(f"Error loading problem {filename}: {e}")
            continue

    return {"count": len(problems), "problems": problems}

@app.get("/problems/{problem_id}")
def get_problem(problem_id: str):
    problem_path = os.path.join(PROBLEMS_DIR, f"{problem_id}.json")

    if not os.path.exists(problem_path):
        return {"error": "Problem not found"}
        
    try:
        with open(problem_path, "r", encoding="utf-8") as f:
            problem = json.load(f)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON format in problem file")
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to load problem")

    response = {
        "id": problem.get("id"),
        "title": problem.get("title"),
        "description": problem.get("description"),
        "difficulty": problem.get("difficulty", "medium"),
        "tags": get_problem_tags(problem),
        "sample_test_cases_count": len(problem.get("sample_test_cases", [])),
        "hidden_test_cases_count": len(problem.get("hidden_test_cases", []))
    }

    optional_fields = ["input_format", "output_format", "constraints", "sample_test_cases"]
    for field in optional_fields:
        if field in problem:
            response[field] = problem[field]

    return response

@app.post("/submit", response_model=SubmitResponse)
def submit(request_data: SubmitRequest, user: dict = Depends(get_current_user)):
    problem_id = request_data.problem_id
    code = request_data.code

    if not code:
        raise HTTPException(status_code=400, detail="No code provided")
    if not problem_id:
        raise HTTPException(status_code=400, detail="No problem provided")

    problem_path = os.path.join(PROBLEMS_DIR, f"{problem_id}.json")
    if not os.path.exists(problem_path):
        return {"error": "Problem not found"}

    try:
        with open(problem_path, "r", encoding="utf-8") as f:
            problem = json.load(f)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON format in problem file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load problem: {str(e)}")

    errors = validate_problem_data(problem)
    if errors:
        raise HTTPException(status_code=500, detail={"error": "Invalid problem definition", "details": errors})

    judge_mode = normalize_judge_mode(problem.get("judge_mode"))
    sample_tcs = problem.get("sample_test_cases", [])
    hidden_tcs = problem.get("hidden_test_cases", [])
    
    if request_data.test_only:
        test_cases = sample_tcs
        judge_mode = "ALL" # Force ALL mode for testing samples
    else:
        test_cases = sample_tcs + hidden_tcs

    if not test_cases:
        raise HTTPException(status_code=500, detail={"error": "Invalid problem definition", "details": ["No test cases configured for this problem"]})

    result = run_code_multiple(
        code=code,
        test_cases=test_cases,
        mode=judge_mode
    )

    visible_results = []
    for idx, tc_result in enumerate(result["test_case_results"]):
        if idx < len(sample_tcs):
            visible_results.append(tc_result)
        else:
            # Hide input/output for hidden test cases, but keep status
            # UNLESS it failed, per user request
            res = {
                "test_case": tc_result["test_case"],
                "status": tc_result["status"],
                "duration": tc_result.get("duration")
            }
            if tc_result["status"] != "Accepted":
                res["input"] = tc_result.get("input")
                # We might want to show error too if it crashed
                if tc_result.get("error"):
                    res["error"] = tc_result.get("error")
                # And actual output if it was a wrong answer
                if tc_result.get("actual_output"):
                    res["actual_output"] = tc_result.get("actual_output")
                
                # We probably shouldn't show expected output for hidden cases?
                # User said "the testcase which led to the breaking should also be visible"
                # Input is definitely "the testcase".
                # I'll stick to revealing input and actual output/error.
            
            visible_results.append(res)

    return {
        "problem_id": problem_id,
        "final_status": result["final_status"],
        "total_duration": result["total_duration"],
        "summary": result["summary"],
        "test_case_results": visible_results
    }

@app.post("/run", response_model=RunResponse)
def run_code_endpoint(request_data: RunRequest, user: dict = Depends(get_current_user)):
    user_input = request_data.input

    if request_data.files and request_data.entrypoint:
        files_dict = [{"path": f.path, "content": f.content} for f in request_data.files]
        result = run_code_multi(
            files=files_dict,
            entrypoint=request_data.entrypoint,
            user_input=user_input
        )
        return result

    # Use run_code_once for direct execution
    code = request_data.code
    if not code:
        raise HTTPException(status_code=400, detail="No code provided")

    result = run_code_once(
        code=code,
        user_input=user_input
    )

    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
