import Link from "next/link";
import { MailCheck, ArrowRight } from "lucide-react";

export default function RegistrationConfirmationPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email;

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[linear-gradient(180deg,#050816_0%,#0b1220_100%)] px-4 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.2),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.16),transparent_28%)]" />
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-[2.5rem] border border-slate-800/70 bg-[linear-gradient(180deg,rgba(8,12,20,0.96),rgba(15,23,42,0.92))] p-8 text-center shadow-[0_28px_80px_rgba(2,6,23,0.45)] md:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
            <MailCheck className="h-8 w-8" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300">Almost done</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
            Click the confirmation link sent to your mail
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
            {email ? (
              <>
                We have sent a confirmation link to <span className="font-semibold text-slate-200">{email}</span>.
                Open that email, click the link, and then come back to sign in.
              </>
            ) : (
              "We have sent a confirmation link to your email. Open that email, click the link, and then come back to sign in."
            )}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-500"
            >
              Go to Login
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-900/70 px-5 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
