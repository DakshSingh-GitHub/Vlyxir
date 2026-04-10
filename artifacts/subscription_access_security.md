# Subscription Access Security Audit
## Code Analysis Feature — `plan === "pro"` Gate

> **Scope**: Routes `/code-analysis` and `/code-analysis-mde`, API endpoint `/api/code-analysis`, and auth flow.

---

## Executive Summary

The frontend plan-check implemented is a **UI-only gate** — it prevents the page from rendering for free users, but it does **not** protect the underlying API that actually performs the analysis. A technically-aware user can bypass the subscription check completely via the API, or through browser developer tools. The risk severity ranges from **Critical** (API bypass) to **Low** (React state manipulation).

---

## 🔴 Critical — API Endpoint Has No Auth or Plan Check

**File**: `app/api/code-analysis/route.ts`

```typescript
export async function POST(request: Request) {
    // ❌ NO session check. NO plan check.
    const body = await request.json();
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const analysis = await analyzeCodeWithGroq(code);
    return NextResponse.json({ ok: true, analysis });
}
```

**The bypass**: Any user — free, unauthenticated, or not even a registered user at all — can call the API directly from any HTTP client:

```bash
curl -X POST https://your-domain.com/api/code-analysis \
  -H "Content-Type: application/json" \
  -d '{"code": "print(1+1)"}'
```

This completely bypasses the React frontend gate. The Groq API key is consumed, AI credits are spent, and the full analysis result is returned — with zero subscription verification.

**Severity**: 🔴 **CRITICAL** — The core protection simply does not exist at the infrastructure level.

---

## 🔴 Critical — Dead Legacy Auth Route Still Accessible

**File**: `app/api/code-analysis/auth/route.ts`

The old username/password auth route (`/api/code-analysis/auth`) still exists in the codebase and is fully functional. While the frontend no longer uses it, it is still a live endpoint that:

1. Exposes the fact that a separate auth mechanism existed.
2. Could be probed or brute-forced since there is no rate limiting.
3. Creates confusion — two competing access models for the same resource.

**Severity**: 🔴 **HIGH** — Should be deleted or replaced immediately.

---

## 🟡 Medium — Client-Side `plan` State Can Be Manipulated

**Files**: Both `page.tsx` files

```typescript
const [plan, setPlan] = useState<string | null>(null);
```

The `plan` value is stored in React component state. A user with browser DevTools can:

1. Open React DevTools.
2. Find the `CodeAnalysisPage` component.
3. Change the `plan` state from `"free"` to `"pro"`.
4. The gate disappears and the UI renders.

This only grants access to the **UI shell** (the code editor and result panels). Submitting the form still calls the API (`/api/code-analysis`), which — per the Critical finding above — is unprotected regardless.

**Severity**: 🟡 **MEDIUM** — Grants UI access but is made redundant by the API bypass.

---

## 🟡 Medium — Supabase Plan Fetched with Publishable (Anon) Key

**File**: `app/lib/supabase/client.ts`

```typescript
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
```

The plan is fetched client-side using the public anon key. If Supabase RLS (Row-Level Security) policies are not correctly configured on the `profiles` table, a user could:

- Query any other user's `plan` field.
- Potentially update their own `plan` field to `"pro"` directly via the Supabase REST API.

```bash
# A free user potentially promoting themselves:
curl -X PATCH https://<project>.supabase.co/rest/v1/profiles?id=eq.<their-uuid> \
  -H "apikey: <anon-key>" \
  -H "Authorization: Bearer <their-jwt>" \
  -d '{"plan": "pro"}'
```

Whether this works depends entirely on your RLS policies. **If no write policy restricts the `plan` field, this is a direct database elevation attack.**

**Severity**: 🟡 **MEDIUM-HIGH** — Depends on RLS configuration.

---

## 🟢 Correct — `isFetchingPlan` Initial State Defaults to `true`

**Files**: Both `page.tsx` files

```typescript
const [isFetchingPlan, setIsFetchingPlan] = useState(true);
```

This correctly defaults to `true` (blocked) during hydration, which prevents a flash of the gated content before the plan is confirmed. No bypass is possible here.

**Severity**: ✅ **No issue — correct implementation.**

---

## Remediation Plan

### Priority 1 — Fix the API Route (Critical)
Add server-side session and plan verification to `/api/code-analysis/route.ts` before calling Groq:

```typescript
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { analyzeCodeWithGroq } from "@/app/lib/groq";

export async function POST(request: Request) {
    // 1. Get the user's auth token from the cookie
    const cookieStore = await cookies();
    const authToken = cookieStore.get("sb-access-token")?.value;

    // Use the service role key to bypass RLS for a trusted server-side check
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Verify the session from the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(authToken);
    if (userError || !user) {
        return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    // 3. Check the user's plan directly from the DB (cannot be spoofed)
    const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

    if (profile?.plan !== "pro") {
        return NextResponse.json({ ok: false, error: "Pro subscription required." }, { status: 403 });
    }

    // 4. Proceed with analysis
    const body = await request.json();
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const analysis = await analyzeCodeWithGroq(code);
    return NextResponse.json({ ok: true, analysis });
}
```

> [!IMPORTANT]
> You need `SUPABASE_SERVICE_ROLE_KEY` as a **server-only** (non-`NEXT_PUBLIC_`) environment variable. Never expose this to the client.

### Priority 2 — Delete the Dead Auth Route
Remove `app/api/code-analysis/auth/route.ts` and the entire `app/api/code-analysis/auth/` directory. It is no longer needed and is a security liability.

### Priority 3 — Lock Down Supabase RLS on `profiles.plan`
Ensure the `profiles` table has RLS policies that **prevent** users from writing to the `plan` column. Only a server-side admin/service role should be able to change plan values.

```sql
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Prevent users from self-upgrading: plan must stay unchanged on user updates
CREATE POLICY "Users cannot change their plan"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (plan = (SELECT plan FROM profiles WHERE id = auth.uid()));
```

### Priority 4 — (Optional) Add Rate Limiting
Even after the plan check is on the server, consider adding rate limiting to the API route to prevent a single pro user from abusing it. Use middleware-level limiting (Vercel Edge) or a library like `@upstash/ratelimit`.

---

## Summary Table

| # | Vulnerability | Severity | Requires Auth? | Fixed by Current Code? |
|---|---|---|---|---|
| 1 | API endpoint has no plan/session check | 🔴 Critical | ❌ No | ❌ No |
| 2 | Dead legacy `/api/code-analysis/auth` route still live | 🔴 High | ❌ No | ❌ No |
| 3 | React `plan` state manipulable via DevTools | 🟡 Medium | ✅ Yes | ❌ No (UI only) |
| 4 | Supabase anon key plan self-mutation (if RLS weak) | 🟡 Medium-High | ✅ Yes (JWT) | ⚠️ Depends on RLS |
| 5 | Hydration flash before plan resolves | ✅ None | — | ✅ Handled correctly |

> [!CAUTION]
> **Bottom line**: The frontend gate is a good UX measure, but it provides **zero real security**. All actual protection must live server-side: in the API route and in Supabase RLS policies. Without Priority 1 and 3 remediations, any technically-aware user can access this feature for free indefinitely.
