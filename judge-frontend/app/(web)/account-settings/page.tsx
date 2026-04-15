"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, BadgeInfo, CalendarDays, LockKeyhole, Mail, Save, ShieldCheck, Sparkles, User, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../../lib/context";
import { useAuth } from "../../lib/auth-context";
import LoginPrompt from "../../../components/Auth/LoginPrompt";
import CountryDropdown from "../../../components/CountryDropdown";
import {
  EMPTY_PROFILE_VALUES,
  formatAccountDate,
  getAccountProfile,
  normalizeUsername,
  profileToFormValues,
  saveAccountProfile,
  type ProfileRecord,
} from "./helper/acc_helper";
import { checkProfanity } from "@/app/forum/forum-helper/helper";
import ProfanityModal from "@/app/forum/forum-helper/ProfanityModal";


export default function AccountSettingsPage() {
  const router = useRouter();
  const { isDark } = useAppContext();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [formValues, setFormValues] = useState(EMPTY_PROFILE_VALUES);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showProfanityModal, setShowProfanityModal] = useState(false);


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
  const inputClass = isDark
    ? "border-slate-700/70 bg-slate-950/70 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500"
    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500";
  const readOnlyClass = isDark
    ? "border-slate-700/70 bg-slate-900/60 text-slate-200"
    : "border-slate-200 bg-slate-50 text-slate-700";
  const skeletonBar = isDark ? "bg-slate-700/80" : "bg-slate-200";
  const skeletonCard = isDark ? "border-slate-700/70 bg-slate-950/60" : "border-slate-200 bg-white/90";

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setFormValues(EMPTY_PROFILE_VALUES);
      setIsLoadingProfile(false);
      return;
    }

    let mounted = true;

    setIsLoadingProfile(true);
    setError(null);
    setSuccess(null);

    getAccountProfile(user)
      .then((data) => {
        if (!mounted) return;
        setProfile(data);
        setFormValues(profileToFormValues(data));
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load account details.");
      })
      .finally(() => {
        if (mounted) setIsLoadingProfile(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  const initials = useMemo(() => {
    const source = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email || "U";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string[]) => part[0]?.toUpperCase())
      .join("") || "U";
  }, [profile, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !profile) return;

    if (checkProfanity(`${formValues.full_name} ${formValues.username} ${formValues.bio}`)) {
      setShowProfanityModal(true);
      return;
    }

    setError(null);

    setSuccess(null);
    setIsSaving(true);

    try {
      const updated = await saveAccountProfile(user, {
        ...formValues,
        username: normalizeUsername(formValues.username),
      });
      setProfile(updated);
      setFormValues(profileToFormValues(updated));
      setSuccess("Account settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save account settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading || (user && isLoadingProfile)) {
    return (
      <div className={shellClass}>
        <div className={ambientClass} />
        <div className={`pointer-events-none absolute left-[-8%] top-[12%] h-72 w-72 rounded-full blur-[130px] ${glowTopClass}`} />
        <div className={`pointer-events-none absolute bottom-[-6%] right-[-5%] h-80 w-80 rounded-full blur-[150px] ${glowBottomClass}`} />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
          <div className={`rounded-4xl border p-5 md:p-6 backdrop-blur-2xl ${surfaceClass}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`h-10 w-24 rounded-2xl ${skeletonBar} animate-pulse`} />
                <div className="space-y-2">
                  <div className={`h-3 w-32 rounded-full ${skeletonBar} animate-pulse`} />
                  <div className={`h-5 w-52 rounded-full ${skeletonBar} animate-pulse`} />
                </div>
              </div>
              <div className={`h-9 w-28 rounded-full ${skeletonBar} animate-pulse`} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <div className={`rounded-4xl border p-6 md:p-8 backdrop-blur-2xl ${surfaceClass}`}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className={`h-3 w-36 rounded-full ${skeletonBar} animate-pulse`} />
                  <div className={`h-6 w-48 rounded-full ${skeletonBar} animate-pulse`} />
                </div>
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-36 rounded-2xl ${skeletonBar} animate-pulse`} />
                  <div className={`h-14 w-14 rounded-2xl ${skeletonBar} animate-pulse`} />
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className={`h-3 w-24 rounded-full ${skeletonBar} animate-pulse`} />
                    <div className={`h-12 rounded-2xl ${skeletonCard} border ${skeletonBar} animate-pulse`} />
                  </div>
                  <div className="space-y-2">
                    <div className={`h-3 w-20 rounded-full ${skeletonBar} animate-pulse`} />
                    <div className={`h-12 rounded-2xl ${skeletonCard} border ${skeletonBar} animate-pulse`} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className={`h-3 w-14 rounded-full ${skeletonBar} animate-pulse`} />
                  <div className={`min-h-40 rounded-2xl ${skeletonCard} border ${skeletonBar} animate-pulse`} />
                </div>

                <div className="space-y-2">
                  <div className={`h-3 w-16 rounded-full ${skeletonBar} animate-pulse`} />
                  <div className={`h-12 rounded-2xl ${skeletonCard} border ${skeletonBar} animate-pulse`} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className={`rounded-2xl border p-4 ${skeletonCard}`}>
                    <div className="mb-3 flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full ${skeletonBar} animate-pulse`} />
                      <div className={`h-3 w-14 rounded-full ${skeletonBar} animate-pulse`} />
                    </div>
                    <div className={`h-4 w-full rounded-full ${skeletonBar} animate-pulse`} />
                    <div className={`mt-3 h-3 w-4/5 rounded-full ${skeletonBar} animate-pulse`} />
                  </div>
                  <div className={`rounded-2xl border p-4 ${skeletonCard}`}>
                    <div className="mb-3 flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full ${skeletonBar} animate-pulse`} />
                      <div className={`h-3 w-20 rounded-full ${skeletonBar} animate-pulse`} />
                    </div>
                    <div className={`h-4 w-2/3 rounded-full ${skeletonBar} animate-pulse`} />
                    <div className={`mt-3 h-3 w-11/12 rounded-full ${skeletonBar} animate-pulse`} />
                  </div>
                </div>

                <div className={`h-4 w-72 rounded-full ${skeletonBar} animate-pulse`} />
              </div>
            </div>

            <div className="space-y-6">
              <div className={`rounded-4xl border p-6 backdrop-blur-2xl ${surfaceClass}`}>
                <div className="mb-5 flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-2xl ${skeletonBar} animate-pulse`} />
                  <div className="space-y-2">
                    <div className={`h-3 w-24 rounded-full ${skeletonBar} animate-pulse`} />
                    <div className={`h-5 w-28 rounded-full ${skeletonBar} animate-pulse`} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className={`h-3 w-12 rounded-full ${skeletonBar} animate-pulse`} />
                    <div className={`h-4 w-36 rounded-full ${skeletonBar} animate-pulse`} />
                  </div>
                  <div className="space-y-2">
                    <div className={`h-3 w-20 rounded-full ${skeletonBar} animate-pulse`} />
                    <div className={`h-4 w-40 rounded-full ${skeletonBar} animate-pulse`} />
                  </div>
                  <div className="space-y-2">
                    <div className={`h-3 w-8 rounded-full ${skeletonBar} animate-pulse`} />
                    <div className={`h-4 w-48 rounded-full ${skeletonBar} animate-pulse`} />
                  </div>
                  <div className="space-y-2">
                    <div className={`h-3 w-16 rounded-full ${skeletonBar} animate-pulse`} />
                    <div className={`h-4 w-32 rounded-full ${skeletonBar} animate-pulse`} />
                  </div>
                </div>
              </div>

              <div className={`rounded-4xl border p-6 backdrop-blur-2xl ${surfaceClass}`}>
                <div className="mb-4 flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-2xl ${skeletonBar} animate-pulse`} />
                  <div className="space-y-2">
                    <div className={`h-3 w-20 rounded-full ${skeletonBar} animate-pulse`} />
                    <div className={`h-5 w-28 rounded-full ${skeletonBar} animate-pulse`} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className={`h-3 w-24 rounded-full ${skeletonBar} animate-pulse`} />
                    <div className={`h-4 w-28 rounded-full ${skeletonBar} animate-pulse`} />
                  </div>
                  <div className="space-y-2">
                    <div className={`h-3 w-24 rounded-full ${skeletonBar} animate-pulse`} />
                    <div className={`h-4 w-28 rounded-full ${skeletonBar} animate-pulse`} />
                  </div>
                </div>
              </div>

              <div className={`rounded-4xl border p-6 backdrop-blur-2xl ${surfaceClass}`}>
                <div className="mb-3 flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-2xl ${skeletonBar} animate-pulse`} />
                  <div className="space-y-2">
                    <div className={`h-3 w-16 rounded-full ${skeletonBar} animate-pulse`} />
                    <div className={`h-5 w-28 rounded-full ${skeletonBar} animate-pulse`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className={`h-4 w-full rounded-full ${skeletonBar} animate-pulse`} />
                  <div className={`h-4 w-11/12 rounded-full ${skeletonBar} animate-pulse`} />
                  <div className={`h-4 w-5/6 rounded-full ${skeletonBar} animate-pulse`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`flex min-h-0 flex-1 items-center justify-center px-4 py-10 ${isDark ? "bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] text-slate-100" : "bg-[linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] text-slate-900"}`}>
        <div className="w-full max-w-xl">
          <LoginPrompt
            title="Login to manage your account"
            description="Your profile details live in your account. Sign in to update your name, username, bio, and country."
            nextPath="/account-settings"
          />
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
              onClick={() => router.back()}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${isDark ? "border-slate-700/70 bg-slate-900/70 hover:bg-slate-800/80" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={() => router.push("/")}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${isDark ? "border-slate-700/70 bg-slate-900/70 hover:bg-slate-800/80" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <Sparkles className="h-4 w-4" />
              Home
            </button>
            <div>
              <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Account settings</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">Manage your profile</h1>
            </div>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${isDark ? "border-slate-700/70 bg-slate-900/70 text-slate-300" : "border-slate-200 bg-white text-slate-500"}`}>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Signed in
          </div>
        </div>

        {error && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${isDark ? "border-rose-500/30 bg-rose-500/10 text-rose-200" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {error}
          </div>
        )}
        {success && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${isDark ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className={`rounded-4xl border p-6 md:p-8 backdrop-blur-2xl ${surfaceClass}`}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Profile details</p>
                  <h2 className="mt-1 text-xl font-bold">Edit your account</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition active:scale-[0.98] ${isDark ? "border border-slate-700/70 bg-slate-900/70 text-slate-200 hover:bg-slate-800/80" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                  >
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    Home
                  </button>
                  <button
                    type="submit"
                    form="account-settings-form"
                    disabled={isSaving}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.98] ${isDark ? "bg-[linear-gradient(135deg,#2563eb,#7c3aed)] shadow-lg shadow-indigo-500/25 hover:brightness-110" : "bg-[linear-gradient(135deg,#1d4ed8,#7c3aed)] shadow-lg shadow-indigo-500/20 hover:brightness-110"} ${isSaving ? "cursor-not-allowed opacity-70" : ""}`}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${isDark ? "border-slate-700/70 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                  <span className="text-lg font-black">{initials}</span>
                </div>
              </div>
            </div>

            <form id="account-settings-form" className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className={`mb-2 block text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Full name</span>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      value={formValues.full_name}
                      onChange={(event) => setFormValues((prev) => ({ ...prev, full_name: event.target.value }))}
                      className={`w-full rounded-2xl border py-3.5 pl-12 pr-4 outline-none transition placeholder:text-slate-500 focus:ring-4 focus:ring-indigo-500/10 ${inputClass}`}
                      placeholder="Your full name"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className={`mb-2 block text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Username</span>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      value={formValues.username}
                      onChange={(event) => setFormValues((prev) => ({ ...prev, username: normalizeUsername(event.target.value) }))}
                      className={`w-full rounded-2xl border py-3.5 pl-12 pr-4 outline-none transition placeholder:text-slate-500 focus:ring-4 focus:ring-indigo-500/10 ${inputClass}`}
                      placeholder="yourusername"
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <span className={`mb-2 block text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Bio</span>
                <textarea
                  value={formValues.bio}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, bio: event.target.value }))}
                  className={`min-h-40 w-full rounded-2xl border px-4 py-3 outline-none transition placeholder:text-slate-500 focus:ring-4 focus:ring-indigo-500/10 ${inputClass}`}
                  placeholder="Tell people a little about what you build, learn, or care about."
                />
              </label>

              <label className="block">
                <span className={`mb-2 block text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Country</span>
                <CountryDropdown
                  value={formValues.country}
                  onChange={(value) => setFormValues((prev) => ({ ...prev, country: value }))}
                  tone={isDark ? "dark" : "light"}
                  placeholder="Select your country"
                  searchPlaceholder="Search countries"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <div className={`rounded-2xl border p-4 ${readOnlyClass}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Email</span>
                  </div>
                  <p className="break-all text-sm font-medium">{profile?.email || user.email}</p>
                  <p className={`mt-2 text-xs ${mutedClass}`}>Read-only. Email changes are handled outside this page.</p>
                </div>
                <div className={`rounded-2xl border p-4 ${readOnlyClass}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <LockKeyhole className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Password</span>
                  </div>
                  <p className="text-sm font-medium">Managed through authentication.</p>
                  <p className={`mt-2 text-xs ${mutedClass}`}>Use the login flow to reset or change your password.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 text-xs">
                <BadgeInfo className="h-4 w-4" />
                <span className={mutedClass}>Full name, username, bio, and country can be updated here.</span>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.98] ${isDark ? "bg-[linear-gradient(135deg,#2563eb,#7c3aed)] shadow-lg shadow-indigo-500/25 hover:brightness-110" : "bg-[linear-gradient(135deg,#1d4ed8,#7c3aed)] shadow-lg shadow-indigo-500/20 hover:brightness-110"}`}
                >
                  <Sparkles className="h-4 w-4" />
                  Go Home
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className={`rounded-4xl border p-6 backdrop-blur-2xl ${surfaceClass}`}>
              <div className="mb-5 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark ? "border-slate-700/70 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Account card</p>
                  <h2 className="text-lg font-bold">Profile summary</h2>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Name</p>
                  <p className="mt-1 text-sm font-semibold">{profile?.full_name || "Not set"}</p>
                </div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Username</p>
                  <p className="mt-1 text-sm font-semibold">@{profile?.username || "unknown"}</p>
                </div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Bio</p>
                  <p className={`mt-1 whitespace-pre-wrap text-sm leading-relaxed ${mutedClass}`}>{profile?.bio || "No bio yet."}</p>
                </div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Country</p>
                  <p className="mt-1 text-sm font-semibold">{profile?.country || "Not set"}</p>
                </div>
              </div>
            </div>

            <div className={`rounded-4xl border p-6 backdrop-blur-2xl ${surfaceClass}`}>
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark ? "border-slate-700/70 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                  <CalendarDays className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Timestamps</p>
                  <h2 className="text-lg font-bold">Account activity</h2>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Created at</p>
                  <p className={`mt-1 text-sm ${mutedClass}`}>{formatAccountDate(profile?.created_at)}</p>
                </div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Updated at</p>
                  <p className={`mt-1 text-sm ${mutedClass}`}>{formatAccountDate(profile?.updated_at)}</p>
                </div>
              </div>
            </div>

            <div className={`rounded-4xl border p-6 backdrop-blur-2xl ${surfaceClass}`}>
              <div className="mb-3 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark ? "border-slate-700/70 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                  <Mail className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Notes</p>
                  <h2 className="text-lg font-bold">What you can edit</h2>
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${mutedClass}`}>
              </p>
            </div>
          </div>
        </div>
        <ProfanityModal isOpen={showProfanityModal} onClose={() => setShowProfanityModal(false)} />
      </div>
    </div>
  );
}

