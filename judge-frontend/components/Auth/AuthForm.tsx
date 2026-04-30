"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, CircleAlert, Eye, EyeOff, Home, Loader2, Lock, Mail, User, UserPlus, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { supabase } from "../../app/lib/api/supabase/client";
import { useAuth } from "../../app/lib/auth/auth-context";
import CountryDropdown from "../CountryDropdown";

type AuthMode = "login" | "register";

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const reduceMotion = useReducedMotion();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState<"idle" | "available" | "taken" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const nextPath = searchParams.get("next") || "/";

  useEffect(() => {
    if (!isLoading && user) router.replace(nextPath);
  }, [isLoading, nextPath, router, user]);

  const passwordStrength = (() => {
    if (!password) {
      return { score: 0, label: "", colorClass: "bg-slate-700", widthClass: "w-0" };
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) {
      return { score, label: "Weak", colorClass: "bg-rose-500", widthClass: "w-1/4" };
    }

    if (score === 2) {
      return { score, label: "Fair", colorClass: "bg-amber-500", widthClass: "w-1/2" };
    }

    if (score === 3 || score === 4) {
      return { score, label: "Good", colorClass: "bg-indigo-500", widthClass: "w-3/4" };
    }

    return { score, label: "Strong", colorClass: "bg-emerald-500", widthClass: "w-full" };
  })();

  const normalizeUsername = (value: string) => value.toLowerCase().replace(/[^a-z0-9_-]/g, "");

  const checkUsernameAvailability = async (value: string) => {
    const normalized = normalizeUsername(value);
    if (!normalized) {
      return "idle" as const;
    }

    const { data, error } = await supabase.rpc("get_email_by_username", {
      input_username: normalized,
    });

    if (error) {
      throw error;
    }

    return typeof data === "string" && data.length > 0 ? ("taken" as const) : ("available" as const);
  };

  const lookupEmailByUsername = async (value: string) => {
    const { data, error } = await supabase.rpc("get_email_by_username", {
      input_username: normalizeUsername(value),
    });

    if (error) throw error;
    return typeof data === "string" ? data : null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (mode === "login") {
      if (!username || !password) {
        setError("Enter your username and password.");
        return;
      }
    } else {
      if (!fullName || !username || !email || !country || !password || !confirmPassword) {
        setError("Complete all fields to register.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!/^[a-z0-9_-]+$/.test(username)) {
        setError("Username can only contain lowercase letters, numbers, hyphens, and underscores.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const loginEmail = await lookupEmailByUsername(username);
        if (!loginEmail) {
          setError("Username not found.");
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });

        if (signInError) throw signInError;

        router.replace(nextPath);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            username: normalizeUsername(username),
            country,
          },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/register/confirmation?email=${encodeURIComponent(email.trim())}`
              : undefined,
        },
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        router.replace(nextPath);
        return;
      }

      router.replace(`/register/confirmation?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (mode !== "register") return;

    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername) {
      setUsernameAvailability("idle");
      setIsCheckingUsername(false);
      return;
    }

    setUsernameAvailability("idle");

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      setIsCheckingUsername(true);

      checkUsernameAvailability(normalizedUsername)
        .then((availability) => {
          if (cancelled) return;
          setUsernameAvailability(availability);
        })
        .catch(() => {
          if (cancelled) return;
          setUsernameAvailability("error");
        })
        .finally(() => {
          if (cancelled) return;
          setIsCheckingUsername(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      setIsCheckingUsername(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, username]);

  const handlePasswordReset = async () => {
    setError(null);
    setMessage(null);

    if (!username) {
      setError("Enter your username first.");
      return;
    }

    const resetEmail = await lookupEmailByUsername(username);
    if (!resetEmail) {
      setError("Username not found.");
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/login?next=${encodeURIComponent(nextPath)}`
          : undefined,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Password reset email sent.");
  };

  const pageTitle = mode === "login" ? "Login" : "Register";
  const pageDescription =
    mode === "login"
      ? "Sign in with your username to unlock submissions, IDE execution, and your saved work."
      : "Create a unique username and confirm your email to activate your account.";
  const isRegisterBlocked = mode === "register" && usernameAvailability === "taken";

  const shellVariants = {
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : 24,
      scale: reduceMotion ? 1 : 0.985,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: reduceMotion ? 0.01 : 0.5,
        ease: "easeOut" as const,
        when: "beforeChildren" as const,
        staggerChildren: reduceMotion ? 0 : 0.08,
      },
    },
  } satisfies Variants;

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : 14,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0.01 : 0.32,
        ease: "easeOut" as const,
      },
    },
  } satisfies Variants;

  const floatVariants: Variants = {
    animate: {
      y: reduceMotion ? 0 : [0, -12, 0],
      x: reduceMotion ? 0 : [0, 8, 0],
      transition: {
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <div className="relative isolate flex h-dvh w-full overflow-hidden bg-[linear-gradient(180deg,#050816_0%,#0b1220_100%)] px-4 py-4 text-slate-100 md:py-6">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.16),transparent_30%)]"
        animate={reduceMotion ? undefined : { opacity: [0.75, 1, 0.75] }}
        transition={reduceMotion ? undefined : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 top-24 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl"
        variants={floatVariants}
        animate="animate"
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 right-0 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl"
        variants={floatVariants}
        animate="animate"
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-3xl items-center">
        <motion.div
          className="relative w-full rounded-[2.5rem] border border-slate-800/70 bg-[linear-gradient(180deg,rgba(8,12,20,0.96),rgba(15,23,42,0.92))] p-7 shadow-[0_28px_80px_rgba(2,6,23,0.45)] md:p-10"
          variants={shellVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="absolute right-5 top-5 md:right-6 md:top-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-950/50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-300 transition hover:border-slate-500 hover:bg-slate-900 hover:text-white"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
          </motion.div>

          <motion.div className="mb-8" variants={itemVariants}>
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-slate-300"
              whileHover={reduceMotion ? undefined : { scale: 1.03, y: -1 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
            >
              <UserPlus className="h-3.5 w-3.5 text-indigo-400" />
              Join Us!
            </motion.div>
            <motion.h1 className="text-4xl font-black tracking-tight text-white md:text-5xl" variants={itemVariants}>
              {pageTitle}
            </motion.h1>
            <motion.p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base" variants={itemVariants}>
              {pageDescription}
            </motion.p>
          </motion.div>

          <motion.form className="space-y-4" onSubmit={handleSubmit} variants={itemVariants}>
            {mode === "register" && (
              <motion.label className="block" variants={itemVariants}>
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-400">Full Name</span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-2xl border border-slate-700/70 bg-slate-950/70 py-3.5 pl-12 pr-4 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                    autoComplete="name"
                    required
                  />
                </div>
              </motion.label>
            )}

            <motion.label className="block" variants={itemVariants}>
              <span className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                <span>Username</span>
                {mode === "register" && (
                  <span className="text-[9px] font-medium normal-case tracking-normal text-slate-500">
                    a-z, 0-9, - and _ only
                  </span>
                )}
              </span>
              {mode === "register" ? (
                <div className="grid grid-cols-[minmax(0,9fr)_minmax(52px,1fr)] gap-3">
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(normalizeUsername(event.target.value))}
                      placeholder="yourusername"
                      className="w-full rounded-2xl border border-slate-700/70 bg-slate-950/70 py-3.5 pl-12 pr-4 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-center">
                    <div
                      title={
                        isCheckingUsername
                          ? "Checking username availability"
                          : usernameAvailability === "available"
                            ? "Username available"
                            : usernameAvailability === "taken"
                              ? "Username taken"
                              : usernameAvailability === "error"
                                ? "Could not verify username availability"
                                : "Username availability"
                      }
                      className={`flex h-14 w-full items-center justify-center rounded-2xl border transition ${
                        isCheckingUsername
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                          : usernameAvailability === "available"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : usernameAvailability === "taken"
                              ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                              : "border-slate-700/70 bg-slate-950/70 text-slate-500"
                      }`}
                    >
                      {isCheckingUsername ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : usernameAvailability === "available" ? (
                        <Check className="h-4 w-4" />
                      ) : usernameAvailability === "taken" ? (
                        <X className="h-4 w-4" />
                      ) : usernameAvailability === "error" ? (
                        <CircleAlert className="h-4 w-4" />
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Check</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(normalizeUsername(event.target.value))}
                    placeholder="yourusername"
                    className="w-full rounded-2xl border border-slate-700/70 bg-slate-950/70 py-3.5 pl-12 pr-4 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                    autoComplete="username"
                    required
                  />
                </div>
              )}
            </motion.label>

            {mode === "register" && (
              <motion.div className="grid gap-4 md:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]" variants={itemVariants}>
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-400">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-slate-700/70 bg-slate-950/70 py-3.5 pl-12 pr-4 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>

                <div className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-400">Country</span>
                  <CountryDropdown
                    value={country}
                    onChange={setCountry}
                    tone="dark"
                    placeholder="Select your country"
                    searchPlaceholder="Search countries"
                  />
                </div>
              </motion.div>
            )}

            <motion.label className="block" variants={itemVariants}>
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-400">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-700/70 bg-slate-950/70 py-3.5 pl-12 pr-12 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                </div>
                {mode === "register" && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                      <span>Password strength</span>
                      <span className={password ? "text-slate-300" : "text-slate-500"}>
                        {passwordStrength.label || "Start typing"}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.colorClass} ${passwordStrength.widthClass}`}
                      />
                    </div>
                  </div>
                )}
            </motion.label>

            {mode === "register" && (
              <motion.label className="block" variants={itemVariants}>
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-400">Confirm Password</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-700/70 bg-slate-950/70 py-3.5 pl-12 pr-4 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </motion.label>
            )}

            <AnimatePresence mode="popLayout">
              {error && (
                <motion.div
                  key="error"
                  className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
                  initial={{ opacity: 0, y: reduceMotion ? 0 : -8, scale: reduceMotion ? 1 : 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -6, scale: reduceMotion ? 1 : 0.98 }}
                  transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
                >
                  {error}
                </motion.div>
              )}

              {message && (
                <motion.div
                  key="message"
                  className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
                  initial={{ opacity: 0, y: reduceMotion ? 0 : -8, scale: reduceMotion ? 1 : 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -6, scale: reduceMotion ? 1 : 0.98 }}
                  transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isSubmitting || isRegisterBlocked}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-base font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              whileHover={reduceMotion || isSubmitting || isRegisterBlocked ? undefined : { scale: 1.015, y: -1 }}
              whileTap={reduceMotion || isSubmitting || isRegisterBlocked ? undefined : { scale: 0.985 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Login" : "Create account"}
            </motion.button>
          </motion.form>

          <motion.div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-400" variants={itemVariants}>
            {mode === "login" ? (
              <button
                type="button"
                onClick={handlePasswordReset}
                className="font-semibold text-indigo-300 transition hover:text-indigo-200"
              >
                Forgot Password?
              </button>
            ) : (
              <span />
            )}

            <Link href={mode === "login" ? "/register" : "/login"} className="inline-flex items-center gap-2 font-semibold text-slate-300 transition hover:text-white">
              {mode === "login" ? "Create Account" : "Already have an account?"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
