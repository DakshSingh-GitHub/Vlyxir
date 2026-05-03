# Vlyxir Security Vulnerability Report

This report summarizes the security vulnerabilities identified in the Vlyxir codebase, categorized by level, exploit difficulty, and frequency.

| Vulnerability | Level | Exploit Difficulty | Frequency | Description |
| :--- | :---: | :---: | :---: | :--- |
| **Remote Code Execution (RCE) & Arbitrary File Read (AFR)** | Critical | Easy | High | The Python judge environment lacks robust isolation. Bypasses for the static analysis regex exist, and sensitive built-ins like `open()` are completely unrestricted, allowing an attacker to read any file on the server. |
| **Missing Backend Authentication** | High | Very Easy | High | The `judge-backend` API (FastAPI) does not implement any authentication or API key checks. This allows any user (authenticated or not) to send code for execution or query problem data. |
| **Stored Cross-Site Scripting (XSS)** | High | Medium | Medium | The forum's custom markdown renderer uses `dangerouslySetInnerHTML` with insufficient sanitization. Maliciously crafted markdown can be used to execute arbitrary JavaScript in the context of other users' browsers. |
| **Resource Exhaustion (Denial of Service)** | Medium | Easy | High | While a time limit is enforced, there are no strict memory or output size limits. Concurrent submissions of resource-intensive code (e.g., large memory allocations or infinite loops) can lead to a Denial of Service. |
| **Overly Permissive CORS Policy** | Medium | Easy | High | The backend is configured with `allow_origins=["*"]`, permitting any domain to make requests to the judge. This increases the risk of Cross-Site Request forgery or exploitation from third-party sites. |
| **Information Disclosure via Stack Traces** | Low | Easy | High | The judge returns full Python stack traces on runtime errors. This leaks internal file paths and server environment details to the client. |

## Detailed Findings

### 1. RCE & AFR (Critical)
The `security.py` file attempts to block dangerous imports and keywords using regex. However:
- **`open()` is not blocked**: A user can simply run `print(open('/etc/passwd').read())`.
- **`sys` is not blocked**: This allows accessing `sys.modules['os']` which can then be used to execute system commands via `getattr` tricks to bypass regex.
- **Regex Bypasses**: Keywords like `exec` are only blocked if followed by a parenthesis (e.g., `exec(`). Users can bypass this using `e = exec; e(...)`.

### 2. Missing Authentication (High)
The backend routes in `app.py` do not have any middleware or dependency injections to verify the identity of the requester. This means anyone who knows the URL of the backend can use it as a free compute resource.

### 3. Stored XSS (High)
In `judge-frontend/app/forum/new-post/page.tsx`, the `renderSimpleMarkdown` function manually replaces certain characters and patterns. Because it doesn't use a battle-tested sanitization library, it's susceptible to bypasses that can lead to script injection.

### 4. DoS (Medium)
The persistent worker pool (`JudgeWorker`) is a great optimization but can be abused. Multiple simultaneous requests with `while True: pass` will tie up all available workers for the duration of the timeout, effectively blocking legitimate users.

## Recommendations
1. **Containerization**: Use Docker to isolate the code execution environment (as noted in the roadmap).
2. **Robust Sandboxing**: Instead of regex, use a more secure sandboxing approach like `gVisor` or `NSJail`, or at least a restricted Python environment like `restrictedpython`.
3. **API Authentication**: Implement JWT-based authentication for backend endpoints, verifying the user's Supabase session.
4. **Sanitize Frontend Content**: Use a library like `DOMPurify` before rendering any user-provided HTML or Markdown.
5. **Rate Limiting**: Implement rate limiting on both the frontend and backend to prevent abuse.
