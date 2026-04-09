"use client";

import Link from "next/link";
import { LockKeyhole, LogIn } from "lucide-react";

type LoginPromptProps = {
  title: string;
  description: string;
  nextPath?: string;
  compact?: boolean;
};

export default function LoginPrompt({ title, description, nextPath = "/", compact = false }: LoginPromptProps) {
  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;
  const registerHref = `/register?next=${encodeURIComponent(nextPath)}`;
  const shellClass = compact
    ? "flex flex-col items-center justify-center rounded-3xl border border-slate-700/70 bg-[linear-gradient(180deg,rgba(8,12,20,0.96),rgba(15,23,42,0.92))] px-5 py-6 text-center shadow-[0_18px_48px_rgba(2,6,23,0.35)]"
    : "flex h-full min-h-[320px] flex-col items-center justify-center rounded-4xl border border-slate-700/70 bg-[linear-gradient(180deg,rgba(8,12,20,0.96),rgba(15,23,42,0.92))] px-6 py-10 text-center shadow-[0_18px_48px_rgba(2,6,23,0.35)]";

  return (
    <div className={shellClass}>
      <div className={`flex items-center justify-center rounded-2xl border border-slate-600/60 bg-slate-900/80 text-indigo-300 ${compact ? "mb-3 h-12 w-12" : "mb-4 h-14 w-14"}`}>
        <LockKeyhole className={compact ? "h-5 w-5" : "h-6 w-6"} />
      </div>
      <h3 className={`${compact ? "text-lg" : "text-xl"} font-black tracking-tight text-white`}>{title}</h3>
      <p className={`mt-2 ${compact ? "max-w-xs text-xs sm:text-sm" : "max-w-sm text-sm"} leading-relaxed text-slate-400`}>{description}</p>

      <div className={`mt-5 flex flex-col gap-3 sm:flex-row ${compact ? "w-full sm:w-auto sm:justify-center" : ""}`}>
        <Link
          href={loginHref}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 ${compact ? "w-full sm:w-auto" : ""}`}
        >
          <LogIn className="h-4 w-4" />
          Login
        </Link>
        <Link
          href={registerHref}
          className={`inline-flex items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 ${compact ? "w-full sm:w-auto" : ""}`}
        >
          Register
        </Link>
      </div>
    </div>
  );
}

