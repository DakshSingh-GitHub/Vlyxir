"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Fingerprint,
  LockKeyhole,
  LogOut,
  Shield,
  Sparkles,
  Settings,
  UserRound,
} from "lucide-react";
import LoginPrompt from "../../../components/Auth/LoginPrompt";
import { useAppContext } from "../../lib/context";
import { useAuth } from "../../lib/auth-context";
import { formatAccountDate } from "../account-settings/helper/acc_helper";

function getDisplayName(user: ReturnType<typeof useAuth>["user"]) {
  return (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "Guest"
  );
}

export default function AccountControlsPage() {
  const router = useRouter();
  const { isDark } = useAppContext();
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const shellClass = isDark
    ? "relative h-full min-h-0 flex-1 overflow-y-auto overflow-x-hidden font-sans bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] text-slate-100"
    : "relative h-full min-h-0 flex-1 overflow-y-auto overflow-x-hidden font-sans bg-[linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] text-slate-900";
  const ambientClass = isDark
    ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(51,65,85,0.32),transparent_38%),linear-gradient(135deg,rgba(2,6,23,0.18),transparent_35%,rgba(15,23,42,0.3)_100%)]"
    : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),transparent_38%),linear-gradient(135deg,rgba(241,245,249,0.8),transparent_35%,rgba(226,232,240,0.8)_100%)]";
  const glowTopClass = isDark ? "bg-slate-900/40" : "bg-white/60";
  const glowBottomClass = isDark ? "bg-slate-800/40" : "bg-sky-200/40";
  const surfaceClass = isDark
    ? "border-slate-700/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.97),rgba(10,15,26,0.95))] text-slate-100 shadow-[0_18px_48px_rgba(2,6,23,0.35)]"
    : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] text-slate-900 shadow-[0_18px_48px_rgba(15,23,42,0.12)]";
  const mutedClass = isDark ? "text-slate-400" : "text-slate-500";
  const labelClass = isDark ? "text-slate-300" : "text-slate-600";
  const softCardClass = isDark
    ? "border-slate-700/70 bg-slate-950/55"
    : "border-slate-200 bg-white/90";

  const displayName = useMemo(() => getDisplayName(user), [user]);
  const memberSince = formatAccountDate(user?.created_at);
  const provider = user?.app_metadata?.provider || "auth";

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace("/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className={shellClass}>
        <div className={ambientClass} />
        <div className={`pointer-events-none absolute left-[-8%] top-[12%] h-72 w-72 rounded-full blur-[130px] ${glowTopClass}`} />
        <div className={`pointer-events-none absolute bottom-[-6%] right-[-5%] h-80 w-80 rounded-full blur-[150px] ${glowBottomClass}`} />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
          <div className={`rounded-4xl border p-6 backdrop-blur-2xl ${surfaceClass}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-3">
                <div className={`h-3 w-28 rounded-full ${isDark ? "bg-slate-700/80" : "bg-slate-200"} animate-pulse`} />
                <div className={`h-7 w-64 rounded-full ${isDark ? "bg-slate-700/80" : "bg-slate-200"} animate-pulse`} />
                <div className={`h-4 w-96 max-w-full rounded-full ${isDark ? "bg-slate-700/60" : "bg-slate-200"} animate-pulse`} />
              </div>
              <div className={`h-11 w-36 rounded-full ${isDark ? "bg-slate-700/80" : "bg-slate-200"} animate-pulse`} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
            <div className={`rounded-4xl border p-6 md:p-8 backdrop-blur-2xl ${surfaceClass}`}>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className={`h-3 w-36 rounded-full ${isDark ? "bg-slate-700/80" : "bg-slate-200"} animate-pulse`} />
                  <div className={`h-6 w-44 rounded-full ${isDark ? "bg-slate-700/80" : "bg-slate-200"} animate-pulse`} />
                </div>
                <div className={`h-14 w-14 rounded-2xl ${isDark ? "bg-slate-700/80" : "bg-slate-200"} animate-pulse`} />
              </div>
              <div className="space-y-5">
                <div className={`h-20 rounded-3xl border ${softCardClass} animate-pulse`} />
                <div className={`h-20 rounded-3xl border ${softCardClass} animate-pulse`} />
                <div className={`h-20 rounded-3xl border ${softCardClass} animate-pulse`} />
                <div className={`h-12 rounded-2xl border ${softCardClass} animate-pulse`} />
              </div>
            </div>
            <div className="space-y-6">
              <div className={`h-52 rounded-4xl border ${softCardClass} animate-pulse`} />
              <div className={`h-40 rounded-4xl border ${softCardClass} animate-pulse`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={shellClass}>
        <div className={ambientClass} />
        <div className={`pointer-events-none absolute left-[-8%] top-[12%] h-72 w-72 rounded-full blur-[130px] ${glowTopClass}`} />
        <div className={`pointer-events-none absolute bottom-[-6%] right-[-5%] h-80 w-80 rounded-full blur-[150px] ${glowBottomClass}`} />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
          <div className={`flex flex-wrap items-center justify-between gap-3 rounded-4xl border px-5 py-4 backdrop-blur-2xl ${surfaceClass}`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${isDark ? "border-slate-700/70 bg-slate-900/70 hover:bg-slate-800/80" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <ArrowLeft className="h-4 w-4" />
                Home
              </button>
              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Account controls</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">Manage your session</h1>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${isDark ? "border-slate-700/70 bg-slate-900/70 text-slate-300" : "border-slate-200 bg-white text-slate-500"}`}>
              <Shield className="h-4 w-4 text-indigo-500" />
              Guest mode
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className={`rounded-4xl border p-6 md:p-8 backdrop-blur-2xl ${surfaceClass}`}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Welcome back</p>
                  <h2 className="text-2xl font-black tracking-tight md:text-3xl">Sign in to unlock account tools</h2>
                  <p className={`max-w-2xl text-sm leading-relaxed ${mutedClass}`}>
                    Account controls live behind authentication so you can safely review your session, jump to profile settings,
                    and sign out when you are done.
                  </p>
                </div>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${isDark ? "border-slate-700/70 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                  <Sparkles className="h-6 w-6 text-indigo-500" />
                </div>
              </div>

              <div className="max-w-xl">
                <LoginPrompt
                  title="Login to manage your account"
                  description="Sign in to open your account controls, review your session, and jump back into profile settings."
                  nextPath="/account-controls"
                  compact
                />
              </div>
            </div>

            <div className="grid gap-6 self-start">
              <div className={`rounded-4xl border p-6 backdrop-blur-2xl ${surfaceClass}`}>
                <div className="mb-5 flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark ? "border-slate-700/70 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                    <LockKeyhole className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Access</p>
                    <h2 className="text-lg font-bold">What you get after login</h2>
                  </div>
                </div>
                <div className="space-y-4 text-sm leading-relaxed">
                  <div className={`rounded-2xl border p-4 ${softCardClass}`}>
                    <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Session</p>
                    <p className={`mt-1 ${mutedClass}`}>See who is signed in and quickly end the browser session.</p>
                  </div>
                  <div className={`rounded-2xl border p-4 ${softCardClass}`}>
                    <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Profile</p>
                    <p className={`mt-1 ${mutedClass}`}>Jump to account settings to update your name, username, bio, and country.</p>
                  </div>
                  <div className={`rounded-2xl border p-4 ${softCardClass}`}>
                    <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Security</p>
                    <p className={`mt-1 ${mutedClass}`}>Authentication, email, and password management stay in the login flow.</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-4xl border p-6 backdrop-blur-2xl ${surfaceClass}`}>
                <div className="mb-3 flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark ? "border-slate-700/70 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                    <ExternalLink className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Shortcut</p>
                    <h2 className="text-lg font-bold">Jump straight to sign in</h2>
                  </div>
                </div>
                <Link
                  href="/login?next=%2Faccount-controls"
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.98] ${isDark ? "bg-[linear-gradient(135deg,#2563eb,#7c3aed)] shadow-lg shadow-indigo-500/25 hover:brightness-110" : "bg-[linear-gradient(135deg,#1d4ed8,#7c3aed)] shadow-lg shadow-indigo-500/20 hover:brightness-110"}`}
                >
                  Go to login
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <div className={ambientClass} />
      <div className={`pointer-events-none absolute left-[-8%] top-[12%] h-72 w-72 rounded-full blur-[130px] ${glowTopClass}`} />
      <div className={`pointer-events-none absolute bottom-[-6%] right-[-5%] h-80 w-80 rounded-full blur-[150px] ${glowBottomClass}`} />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <div className={`flex flex-wrap items-center justify-between gap-3 rounded-4xl border px-5 py-4 backdrop-blur-2xl ${surfaceClass}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/account-settings")}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${isDark ? "border-slate-700/70 bg-slate-900/70 hover:bg-slate-800/80" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <ArrowLeft className="h-4 w-4" />
              Account settings
            </button>
            <div>
              <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Account controls</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">Manage your session</h1>
            </div>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${isDark ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            <Shield className="h-4 w-4" />
            Signed in
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className={`rounded-4xl border p-6 md:p-8 backdrop-blur-2xl ${surfaceClass}`}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Session overview</p>
                <h2 className="text-2xl font-black tracking-tight md:text-3xl">Keep your account in hand</h2>
                <p className={`max-w-2xl text-sm leading-relaxed ${mutedClass}`}>
                  This page keeps the high-level controls close by so you can inspect the current session, jump back to profile
                  edits, or sign out with one click.
                </p>
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${isDark ? "border-slate-700/70 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                <Fingerprint className="h-6 w-6 text-indigo-500" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className={`rounded-3xl border p-4 ${softCardClass}`}>
                <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Profile</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark ? "border-slate-700/70 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                    <UserRound className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-base font-bold">{displayName}</p>
                    <p className={`text-sm ${mutedClass}`}>{user.email || "No email available"}</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-3xl border p-4 ${softCardClass}`}>
                <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Session state</p>
                <p className="mt-2 text-base font-bold">Active in this browser</p>
                <p className={`mt-1 text-sm ${mutedClass}`}>Provider: {provider.toUpperCase()}</p>
              </div>

              <div className={`rounded-3xl border p-4 ${softCardClass}`}>
                <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Member since</p>
                <p className="mt-2 text-base font-bold">{memberSince}</p>
                <p className={`mt-1 text-sm ${mutedClass}`}>Based on your current authentication record.</p>
              </div>

              <div className={`rounded-3xl border p-4 ${softCardClass}`}>
                <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Account ID</p>
                <p className="mt-2 break-all text-base font-bold">{user.id}</p>
                <p className={`mt-1 text-sm ${mutedClass}`}>Useful when debugging or reporting account issues.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Link
                href="/account-settings"
                className={`group rounded-3xl border p-4 transition ${isDark ? "border-slate-700/70 bg-slate-950/55 hover:border-indigo-500/30 hover:bg-slate-900/70" : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <Settings className="h-5 w-5 text-indigo-500" />
                  <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${mutedClass}`} />
                </div>
                <p className="mt-4 text-sm font-black uppercase tracking-[0.2em]">Profile settings</p>
                <p className={`mt-2 text-sm leading-relaxed ${mutedClass}`}>Update your name, username, bio, and country.</p>
              </Link>

              <Link
                href="/"
                className={`group rounded-3xl border p-4 transition ${isDark ? "border-slate-700/70 bg-slate-950/55 hover:border-indigo-500/30 hover:bg-slate-900/70" : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${mutedClass}`} />
                </div>
                <p className="mt-4 text-sm font-black uppercase tracking-[0.2em]">Home</p>
                <p className={`mt-2 text-sm leading-relaxed ${mutedClass}`}>Return to the main workspace and recent tools.</p>
              </Link>

              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className={`group rounded-3xl border p-4 text-left transition active:scale-[0.99] ${isDark ? "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/35 hover:bg-rose-500/10" : "border-rose-200 bg-rose-50 hover:border-rose-300 hover:bg-rose-100/70"} ${isSigningOut ? "cursor-not-allowed opacity-70" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <LogOut className="h-5 w-5 text-rose-500" />
                  <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${isDark ? "text-rose-300" : "text-rose-500"}`} />
                </div>
                <p className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-rose-600">Sign out</p>
                <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-rose-200/80" : "text-rose-700/80"}`}>
                  End this browser session and return to the login screen.
                </p>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`rounded-4xl border p-6 backdrop-blur-2xl ${surfaceClass}`}>
              <div className="mb-5 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark ? "border-slate-700/70 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                  <Clock3 className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Checklist</p>
                  <h2 className="text-lg font-bold">Before you leave</h2>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed">
                <div className={`rounded-2xl border p-4 ${softCardClass}`}>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Profile updates</p>
                  <p className={`mt-1 ${mutedClass}`}>Use account settings if you need to change your public profile details.</p>
                </div>
                <div className={`rounded-2xl border p-4 ${softCardClass}`}>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Password changes</p>
                  <p className={`mt-1 ${mutedClass}`}>Password and email actions remain in the authentication flow.</p>
                </div>
                <div className={`rounded-2xl border p-4 ${softCardClass}`}>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Session safety</p>
                  <p className={`mt-1 ${mutedClass}`}>Sign out when using a shared device or before switching accounts.</p>
                </div>
              </div>
            </div>

            <div className={`rounded-4xl border p-6 backdrop-blur-2xl ${surfaceClass}`}>
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark ? "border-slate-700/70 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                  <ExternalLink className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Quick link</p>
                  <h2 className="text-lg font-bold">Open profile settings</h2>
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${mutedClass}`}>
                If you came here to change your profile, jump into the settings screen and keep the account card in sync.
              </p>
              <Link
                href="/account-settings"
                className={`mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.98] ${isDark ? "bg-[linear-gradient(135deg,#2563eb,#7c3aed)] shadow-lg shadow-indigo-500/25 hover:brightness-110" : "bg-[linear-gradient(135deg,#1d4ed8,#7c3aed)] shadow-lg shadow-indigo-500/20 hover:brightness-110"}`}
              >
                Edit profile
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className={`rounded-4xl border p-6 backdrop-blur-2xl ${surfaceClass}`}>
              <div className="mb-3 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark ? "border-slate-700/70 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                  <LockKeyhole className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Note</p>
                  <h2 className="text-lg font-bold">What this page does not do</h2>
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${mutedClass}`}>
                This page intentionally keeps to safe session controls. It does not delete accounts or modify authentication
                credentials directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
