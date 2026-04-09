# CodeJudge Details

This document is a long-form project map for CodeJudge. It is written to help a human or AI agent understand the system quickly, trace the main user flows, and make safe edits without guessing how the app fits together.

## 1. What CodeJudge Is

CodeJudge is a coding platform with three major experiences:

1. A problem-solving judge where users pick a problem, write Python, and submit against test cases.
2. A standalone code IDE where users can run Python snippets against custom input.
3. A code analysis workspace where users can send code to an LLM-based analyzer for complexity, static, and security feedback.

The repository is split into two large parts:

1. `judge-frontend` - the Next.js application.
2. `judge-backend` - the Python FastAPI judge service that serves problems and runs code.

The frontend is the primary UI surface. The backend provides problem data and execution APIs. Some features also depend on Supabase for authentication and persistence.

## 2. High-Level Architecture

The app uses a layered design:

1. The frontend renders route-based workspaces and handles most UI state.
2. The frontend talks to the backend for problem lists, code execution, and submissions.
3. The frontend talks to Supabase for auth, profile data, and submission history.
4. The code analysis workspace talks to a Next.js server route that forwards the code to Groq.

Important architectural choice:

1. Several UX settings are stored in browser storage, not on the server.
2. User-facing auth state is Supabase-based, but some pages also use lightweight browser flags for local unlocks and UI state.
3. The backend judge only understands Python execution, problem JSON files, and submit/run requests.

## 3. Repository Layout

### Root

1. `README.md` - broad project intro, but it is somewhat marketing-style and not fully up to date.
2. `DETAILS.md` - this document.
3. `judge-backend` - Python judge service.
4. `judge-frontend` - Next.js app.

### Frontend

1. `judge-frontend/app` - route files, API routes, global layout, and client-side shell context.
2. `judge-frontend/components` - shared UI components and route workspaces.
3. `judge-frontend/public` - static assets, icons, and logos.
4. `judge-frontend/supabase` - SQL migrations for auth/profile helpers.

### Backend

1. `judge-backend/app.py` - FastAPI app and request handlers.
2. `judge-backend/runner.py` - execution engine and test case orchestration.
3. `judge-backend/runner_worker.py` - worker process that executes user code.
4. `judge-backend/security.py` - static restriction checks and safe import helpers.
5. `judge-backend/problems` - JSON problem definitions.

## 4. Frontend Shell and Route Structure

The main frontend shell lives in `judge-frontend/app/layout.tsx`.

Key responsibilities:

1. Sets metadata, favicon links, and viewport behavior.
2. Applies theme initialization before hydration using a small inline script.
3. Wraps the app in `AppWrapper` for UI settings.
4. Wraps the app in `AuthProvider` for Supabase auth.
5. Wraps the app in `ClientLayout` for shared navigation and modals.

`ClientLayout` decides whether to show the navbar based on the current pathname. It excludes routes like:

1. `/docs`
2. `/docs-int`
3. `/admin`
4. `/visuals`
5. `/meet-developer`
6. `/login`
7. `/register`

The workspace routes are organized by route groups:

1. `(web)` - the main user-facing app.
2. `(mde)` - the newer “MDE” UI variants for some workspaces.
3. `(high_admin)` - admin and internal tooling routes.

## 5. Global App State

`judge-frontend/app/lib/context.tsx` is the global UI state provider.

It manages:

1. Sidebar open/closed state.
2. Submissions modal open/closed state.
3. Theme mode and resolved dark mode.
4. App-wide font scaling.
5. Editor font size.
6. Reduce motion setting.
7. Hardware-accelerated theme animations.
8. Mobile pill auto-hide behavior.
9. Old/new UI toggle.
10. Derived paths for code judge, code IDE, and code analysis.

This context persists many settings into `localStorage`. Notable keys include:

1. `theme_mode`
2. `app_font_scale`
3. `editor_font_size`
4. `reduce_motion`
5. `hardware_accel_theme_animations`
6. `autohide_mobile_pills`
7. `use_new_ui`

If you are changing UI behavior, this is one of the first places to inspect.

## 6. Authentication Flow

The auth system lives in `judge-frontend/app/lib/auth-context.tsx`.

It provides:

1. `session`
2. `user`
3. `isLoading`
4. `signOut()`

Auth behavior:

1. On mount, the app loads the Supabase session with `getSession()`.
2. It subscribes to auth state changes with `onAuthStateChange()`.
3. `signOut()` calls `supabase.auth.signOut()`.

Supabase client setup is in `judge-frontend/app/lib/supabase/client.ts`.

Supabase config details:

1. It expects `NEXT_PUBLIC_SUPABASE_URL`.
2. It expects `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`.
3. It persists sessions.
4. It auto-refreshes tokens.
5. It detects sessions in the URL.

### Important auth pages

1. `judge-frontend/components/Auth/AuthForm.tsx` handles login and registration.
2. `judge-frontend/app/(web)/login/page.tsx` wraps the login form.
3. `judge-frontend/app/(web)/register/page.tsx` wraps the register form.
4. `judge-frontend/app/(web)/register/confirmation/page.tsx` tells the user to confirm email.
5. `judge-frontend/app/(web)/account-settings/page.tsx` edits profile data.
6. `judge-frontend/app/(web)/account-controls/page.tsx` handles session-level controls.

### Login behavior

1. Login uses a username-to-email lookup through a Supabase RPC named `get_email_by_username`.
2. The form then signs in with Supabase email/password.
3. Successful login redirects to the `next` query parameter, or `/` by default.

### Register behavior

1. Registration collects full name, username, email, country, and password.
2. Username availability is checked live through the same RPC helper.
3. On success, the user is redirected to a confirmation page if email verification is required.

### Working on a different account

If you need to work on another account, the safest approach is:

1. Sign out through the profile menu or the account-controls page.
2. Use the login page to sign into the other account.
3. If stale UI state appears, clear browser storage for this site.
4. If you are switching between multiple Supabase users in the same browser, remember that drafts and some settings are stored in `sessionStorage` and `localStorage`, not tied to the auth account.

Useful browser state to know about:

1. Supabase auth session is persisted by the Supabase client.
2. Code IDE draft code is stored per browser session.
3. Problem judge drafts are stored in `sessionStorage`.
4. Code analysis unlock state is stored in `sessionStorage`.

## 7. Account Settings Flow

`judge-frontend/app/(web)/account-settings/helper/acc_helper.ts` contains the profile logic.

Profile data model:

1. `id`
2. `full_name`
3. `username`
4. `email`
5. `created_at`
6. `updated_at`
7. `bio`
8. `country`

Key helper behavior:

1. `normalizeUsername()` lowercases and strips whitespace.
2. `buildFallbackProfile()` reconstructs a profile from Supabase auth metadata when no DB row exists.
3. `getAccountProfile()` loads the profile row from the `profiles` table and falls back gracefully.
4. `saveAccountProfile()` upserts the profile row and also syncs auth metadata.
5. `formatAccountDate()` pretty-prints account timestamps.

Important constraints:

1. Username uniqueness is validated with the `get_email_by_username` RPC.
2. The profile table is treated as the main durable profile record.
3. Auth metadata sync is best-effort; a warning is logged if that part fails.

## 8. Account Controls Page

`judge-frontend/app/(web)/account-controls/page.tsx` is the page for session and account actions.

It is intentionally a safe control hub rather than a destructive admin page.

The page has three states:

1. Loading state while auth is resolving.
2. Guest state when no user is signed in.
3. Signed-in state when the session exists.

### Guest state

The guest view shows:

1. A compact login prompt.
2. A short explanation of what the page unlocks after login.
3. A direct login shortcut.

### Signed-in state

The signed-in view shows:

1. Current display name.
2. Current email.
3. Auth provider.
4. Member-since timestamp.
5. Auth user ID.
6. Navigation cards back to profile settings and home.
7. A sign-out action that ends the session.

This page does not delete accounts or modify credentials directly. It is for session control and navigation only.

## 9. Code Judge Flow

The main judge workspace is `judge-frontend/app/(web)/code-judge/page.tsx`.

This page is the core “solve problems” experience.

### Main behaviors

1. Loads the problem list from the backend.
2. Loads the selected problem detail from the backend.
3. Lets the user edit Python code in the shared code editor.
4. Runs test-only submissions or full submissions.
5. Saves submission results to Supabase.
6. Restores draft code and selected problem from browser session state.
7. Supports desktop and mobile layouts.
8. Supports old/new UI switching.

### Important state

1. `problem`
2. `selectedProblemId`
3. `code`
4. `isSubmitting`
5. `result`
6. `isResultModalOpen`
7. `pastSubmissions`
8. `searchQuery`
9. `isMobile`
10. `mobileTab`
11. `selectedLayout`

### Storage keys

1. `draft_code_{problemId}` - per-problem code draft.
2. `last_selected_problem_id` - the most recent selected problem.
3. `codejudge_ui_grid_layout` - desktop layout choice.

### Submission flow

1. User clicks submit or test.
2. The page calls `submitCode()` from `app/lib/api.ts`.
3. The backend returns verdict data.
4. The frontend optionally trims sample-only results for test-only mode.
5. For authenticated users, the result is stored in Supabase via `saveSubmission()`.
6. The submissions list is updated in memory and a browser event is dispatched.

### Authentication rule

1. The judge can still load problems for everyone.
2. Final submissions require the user to be signed in.
3. The UI can redirect to login if submission is attempted while unauthenticated.

## 10. Code IDE Flow

The standalone IDE is `judge-frontend/app/(web)/code-ide/page.tsx`.

This page is for quick execution, not problem judging.

### Main behaviors

1. Edits Python in Monaco-based editor UI.
2. Accepts custom stdin.
3. Runs code via the backend `/run` endpoint.
4. Shows stdout, stderr, duration, and status.
5. On mobile, splits the interface into tabs for code and output.
6. Supports two UI layouts, classic and wide.

### Storage keys

1. `code-ide-code`
2. `code-ide-input`
3. `code-ide-output`
4. `code_ide_ui_grid_layout`

### Auth dependency

1. The IDE requires login to run code.
2. When unauthenticated, the page shows a login prompt.
3. The run button redirects to login if needed.

## 11. Code Analysis Flow

The analysis workspace is `judge-frontend/app/(web)/code-analysis/page.tsx`.

This page is more locked down than the others.

### Access model

1. The page uses a local username/password gate.
2. Credentials are checked by the server route `app/api/code-analysis/auth/route.ts`.
3. If unlocked, the user can use the analysis editor.
4. The unlocked state is stored in `sessionStorage`.

### Analysis flow

1. User writes or pastes code.
2. The client POSTs to `app/api/code-analysis/route.ts`.
3. The server route calls `analyzeCodeWithGroq()` in `app/lib/groq.ts`.
4. Groq is asked to return strict JSON.
5. The frontend parses and displays:
   1. Summary
   2. Time complexity
   3. Space complexity
   4. Static analysis findings
   5. Security findings
   6. Suggestions
6. The analysis result is stored in local browser records.

### Local storage

1. `code-analysis-records-v1` holds recent analyses.
2. `code-analysis-unlocked` in session storage controls the local unlock state.

### Important implementation detail

1. The analysis page is not using Supabase auth for access control.
2. The auth lock is a lightweight workspace gate, not a real security boundary.
3. Server-side environment variables still matter because the actual Groq call happens on the server.

## 12. API Routes in the Frontend

There are two Next.js API routes used by the analysis workspace:

1. `POST /api/code-analysis`
2. `POST /api/code-analysis/auth`

`POST /api/code-analysis`:

1. Validates that code is present.
2. Calls the Groq analysis function.
3. Returns `{ ok: true, analysis }` or a failure response.

`POST /api/code-analysis/auth`:

1. Reads a username and password from the body.
2. Compares them against `CODE_ANALYSIS_USERNAME` and `CODE_ANALYSIS_PASSWORD`.
3. Returns an error if the env vars are missing or the credentials do not match.

## 13. Shared Backend API Contract

The frontend API helper is `judge-frontend/app/lib/api.ts`.

It does three important jobs:

1. Chooses between local and remote backend URLs.
2. Caches problems in browser storage.
3. Sends run/submit requests to the judge backend.

### Base URL logic

1. It first pings `http://localhost:5000/`.
2. If local backend is reachable, it uses localhost.
3. Otherwise it falls back to the deployed remote URL.

### Problem APIs

1. `GET /problems`
2. `GET /problems/{problemId}`

### Execution APIs

1. `POST /submit`
2. `POST /run`

### Maintenance guard

1. `submitCode()` and `runCode()` check `maintenanceMode` from browser system config first.
2. If maintenance is enabled, the frontend throws before calling the backend.

## 14. Problem Data Model

Problems live in `judge-backend/problems/*.json`.

The backend expects each problem to have at minimum:

1. `id`
2. `title`
3. `description`

Optional but commonly used fields:

1. `difficulty`
2. `judge_mode`
3. `sample_test_cases`
4. `hidden_test_cases`
5. `input_format`
6. `output_format`
7. `constraints`

Each test case has:

1. `input`
2. `output`

The backend validates that the problem JSON is structurally usable before running submissions.

## 15. Backend Execution Pipeline

The execution pipeline is split between `app.py`, `runner.py`, and `runner_worker.py`.

### `/run`

1. Receives code and stdin.
2. Calls `run_code_once()`.
3. Returns stdout, stderr, status, and duration.

### `/submit`

1. Receives code and a problem ID.
2. Loads the problem JSON file.
3. Validates the problem structure.
4. Builds the test case set.
5. Runs the code across all cases via `run_code_multiple()`.
6. Hides or reveals hidden test details selectively.
7. Returns verdict summary and per-test-case results.

### Runner behavior

`runner.py` handles both sequential and optimized execution modes.

Important points:

1. There is a time limit constant set to 2 seconds.
2. The code is validated before execution with `validate_code()`.
3. There is a sequential fallback path.
4. The optimized path uses worker processes and threads.
5. Results are normalized before comparison.
6. The final verdict is one of the familiar judge statuses, such as Accepted, Wrong Answer, Runtime Error, Time Limit Exceeded, or Security Violation.

### Worker behavior

`runner_worker.py` is the subprocess that actually `exec`s user code.

It:

1. Receives an init message with source code.
2. Compiles the code once.
3. Executes the compiled code for each test case in an isolated global scope.
4. Captures stdout and stderr.
5. Returns a JSON response back to the supervisor.

### Security behavior

`security.py` uses static pattern checks and restricted imports.

It blocks or warns on patterns involving:

1. Networking modules.
2. Subprocess/system access.
3. `exec()` and `eval()`.
4. Obvious import patterns for restricted modules.

This is not a perfect sandbox. It is a best-effort safety layer intended for a controlled judge environment.

## 16. Submission Persistence

The frontend stores submission records in Supabase through `judge-frontend/app/lib/storage.ts`.

Main submission behavior:

1. The authenticated user ID is read from Supabase.
2. Duplicate code for the same problem is skipped locally.
3. New submissions are inserted into the `submissions` table.
4. The result is returned in a frontend-friendly format.

The `submissions` table is treated as a user-scoped history log.

There is also browser-side admin/system persistence for the high admin tooling:

1. `code_judge_system_logs`
2. `admin_stats`
3. `system_config`

## 17. Admin and Internal Tooling

The admin area lives in `judge-frontend/app/(high_admin)/admin`.

It appears to be a browser-side admin dashboard backed by local storage and helper modals.

Related components and modals include:

1. `CreateUserModal`
2. `EditUserModal`
3. `ConfirmPermissionModal`
4. `ProblemInventoryModal`
5. `SystemLogsModal`

There is also a docs-int route for internal documentation. This indicates the repo is meant to support both user-facing and internal workflows.

## 18. UI Systems and Navigation

The app has two shared nav implementations:

1. `components/General/NavBar.tsx`
2. `components/General/NewNavBar.tsx`

They both expose profile actions and route to:

1. General settings
2. Account settings
3. Account controls
4. Logout

The old/new UI toggle decides whether the app uses the classic or MDE variants for certain pages.

Relevant route helpers are in `judge-frontend/app/lib/paths.ts`.

## 19. Important Browser Storage

Many workflows are partly browser-based. If an agent is debugging stale state, these are the first places to check:

1. `sessionStorage` for code drafts and temporary unlocks.
2. `localStorage` for theme, UI settings, cached problems, and admin config.
3. Supabase auth session persistence.

Known browser state keys include:

1. `code-ide-code`
2. `code-ide-input`
3. `code-ide-output`
4. `codejudge_ui_grid_layout`
5. `code_ide_ui_grid_layout`
6. `draft_code_{problemId}`
7. `last_selected_problem_id`
8. `code-analysis-unlocked`
9. `code-analysis-records-v1`
10. `theme_mode`
11. `use_new_ui`

## 20. Environment Variables

Frontend expected environment variables:

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
3. `GROQ_API_KEY`
4. `CODE_ANALYSIS_USERNAME`
5. `CODE_ANALYSIS_PASSWORD`

Backend runtime is mostly Python-based and does not depend on the same frontend env vars, but the deployment setup may differ by environment.

## 21. Suggested Editing Strategy for Agents

When making changes, follow this order:

1. Identify the route and the data it needs.
2. Trace the shared context or API helper that powers it.
3. Check whether the page is old UI, new UI, or route-group specific.
4. Check if state is stored in sessionStorage, localStorage, Supabase, or the backend.
5. Update the smallest shared component possible before duplicating logic.
6. Run lint on the edited files.

Things to be careful about:

1. Do not assume all pages use Supabase auth.
2. Do not assume browser state is account-specific.
3. Do not assume the backend is a full security sandbox.
4. Do not change both old and new UI variants without verifying route parity.

## 22. Useful Mental Model

If you are navigating the app quickly, keep this mental map in mind:

1. `code-judge` = solve problems.
2. `code-ide` = run snippets with stdin.
3. `code-analysis` = unlock analysis workspace and get LLM review.
4. `account-settings` = edit profile data.
5. `account-controls` = session and navigation control hub.
6. `admin` = internal browser-side management tools.

## 23. Notes On Current Project State

The repository appears to be in active development with a mix of polished and experimental pieces.

Observations that matter:

1. Some docs are older than the current codebase.
2. There are duplicate or evolving UI paths for certain workspaces.
3. The backend contains both optimized and commented proof-of-concept logic.
4. The judge is functional, but the execution and security model is intentionally lightweight compared with a production-grade sandbox.

## 24. When Working On Another Account

If the task involves another user account or you need to validate account-specific behavior, use this process:

1. Sign out of the current session.
2. Optionally clear site storage if you need a clean slate.
3. Sign in with the alternate account.
4. Re-check profile, submission history, and account settings.
5. Remember that browser drafts and cached UI settings can survive sign-out, so stale page state can look like an account mix-up even when auth is correct.

This is especially important for:

1. Draft code in the judge or IDE.
2. Cached submissions.
3. Account settings form values.
4. Local unlock states in analysis pages.

## 25. Short Version

CodeJudge is a Next.js + Supabase frontend backed by a Python FastAPI judge service. The judge backend loads problem JSON files, executes Python code in worker processes, and returns verdicts. The frontend contains a route-based UI shell with shared navigation, auth-aware workspaces, local persistence, and a Groq-powered code analysis tool. Account controls now live on their own page and should be treated as a safe session-management hub rather than a destructive account page.

