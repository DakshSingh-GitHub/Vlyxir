"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
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
  Trash2,
  Globe,
  KeyRound,
  Info,
  CalendarDays,
  ShieldCheck,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoginPrompt from "../../../components/Auth/LoginPrompt";
import { useAppContext } from "../../lib/auth/context";
import { useAuth } from "../../lib/auth/auth-context";
import { formatAccountDate } from "../account-settings/helper/acc_helper";
import DeleteAccountModal from "../../../components/Account/DeleteAccountModal";
import ErrorModal from "../account-settings/ErrorModal";
import { supabase } from "../../lib/api/supabase/client";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [identities, setIdentities] = useState<any[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorConfig, setErrorConfig] = useState({ title: "Linking Failed", message: "This email has already in use." });
  const [isSafetyTimeoutReached, setIsSafetyTimeoutReached] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSafetyTimeoutReached(true);
    }, 1500); // 1.5 seconds safety valve to avoid infinite loading skeletons
    return () => clearTimeout(timer);
  }, []);

  // Check for linking/authentication errors in URL hash or query params
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    const search = window.location.search;

    const params = new URLSearchParams(
      hash.startsWith("#") ? hash.substring(1) : search
    );

    const errorParam = params.get("error") || new URLSearchParams(search).get("error");
    const errorDesc = params.get("error_description") || new URLSearchParams(search).get("error_description");

    if (errorParam) {
      console.log("Authentication error detected in controls:", errorParam, errorDesc);
      
      const isAlreadyLinked = 
        errorParam.includes("identity_already_linked") || 
        errorParam.includes("email_exists") || 
        errorParam.includes("email_already_in_use") ||
        errorDesc?.toLowerCase().includes("already linked") ||
        errorDesc?.toLowerCase().includes("already in use") ||
        errorDesc?.toLowerCase().includes("already exists");

      if (isAlreadyLinked) {
        setErrorConfig({
          title: "Email Already in Use",
          message: "This email has already in use. It is associated with another account and cannot be linked."
        });
      } else {
        setErrorConfig({
          title: "Linking Failed",
          message: errorDesc || "An error occurred while linking your account."
        });
      }
      setShowErrorModal(true);

      // Clean up the URL hash/search to prevent the modal from re-triggering on reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.auth.getUserIdentities().then((res) => {
      setIdentities(res.data?.identities || []);
    }).catch(err => {
      console.warn("Failed to fetch identities:", err);
    });
  }, [user]);

  const handleLinkGoogle = async () => {
    if (!user || isLinkingGoogle) return;
    setIsLinkingGoogle(true);
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/account-controls`,
        },
      });
      if (error) {
        alert(error.message);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to link Google account.");
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!user || isLinkingGoogle) return;

    const googleId = identities.find((id) => id.provider === "google");
    if (!googleId) {
      alert("No linked Google account found to unlink.");
      return;
    }

    if (identities.length < 2) {
      alert("For your security, you must have at least two login methods (e.g. Email and Google) to unlink your Google account.");
      return;
    }

    setIsLinkingGoogle(true);
    try {
      const { error } = await supabase.auth.unlinkIdentity(googleId);
      if (error) {
        alert(error.message);
      } else {
        const res = await supabase.auth.getUserIdentities();
        setIdentities(res.data?.identities || []);
        alert("Google account unlinked successfully!");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to unlink Google account.");
    } finally {
      setIsLinkingGoogle(false);
    }
  };

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

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      // 1. Delete associated data first to avoid foreign key violations
      const tables = [
        { name: "forum_comment_likes", col: "user_id" },
        { name: "forum_post_upvotes", col: "user_id" },
        { name: "forum_comments", col: "author_id" },
        { name: "forum_posts", col: "author_id" },
        { name: "submissions", col: "user_id" }
      ];

      for (const table of tables) {
        const { error } = await supabase.from(table.name).delete().eq(table.col, user.id);
        if (error) {
          console.warn(`Could not delete from ${table.name}:`, error.message);
        }
      }

      // 2. Delete the profile record last
      const { error: profileError } = await supabase.from("profiles").delete().eq("id", user.id);
      
      if (profileError) {
        throw new Error(`Profile deletion failed: ${profileError.message}`);
      }

      // 3. Only sign out if deletion was successful
      await signOut();
      router.replace("/");
    } catch (err) {
      console.error("Deletion error:", err);
      throw err;
    }
  };

  const skeletonBar = isDark ? "bg-slate-800" : "bg-slate-200 animate-pulse";
  const skeletonCard = isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs";

  if (!isSafetyTimeoutReached && isAuthLoading) {
    return (
      <div className={`min-h-screen w-full transition-colors duration-500 p-4 sm:p-8 lg:p-12 relative overflow-hidden ${
        isDark ? "bg-[#0B0C15]" : "bg-slate-50"
      }`}>
        <div className="absolute top-[-25%] right-[-10%] w-[70%] h-[70%] bg-indigo-500/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-25%] left-[-10%] w-[70%] h-[70%] bg-purple-500/[0.04] rounded-full blur-[150px]" />

        <div className="max-w-7xl mx-auto space-y-8 relative z-10 animate-pulse">
          {/* Header Skeleton */}
          <div className={`rounded-3xl border p-5 flex items-center justify-between ${skeletonCard}`}>
            <div className="flex items-center gap-4">
              <div className={`h-10 w-24 rounded-2xl ${skeletonBar}`} />
              <div className="space-y-2">
                <div className={`h-3.5 w-48 rounded-md ${skeletonBar}`} />
                <div className={`h-3 w-32 rounded-md ${skeletonBar}`} />
              </div>
            </div>
            <div className={`h-10 w-32 rounded-full ${skeletonBar}`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className={`rounded-[36px] border p-6 sm:p-8 space-y-6 ${skeletonCard}`}>
                <div className="flex items-center justify-between">
                  <div className={`h-6 w-48 rounded-md ${skeletonBar}`} />
                  <div className={`h-12 w-12 rounded-2xl ${skeletonBar}`} />
                </div>
                <div className="h-px bg-slate-500/10 w-full" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`h-24 rounded-2xl ${skeletonBar}`} />
                  <div className={`h-24 rounded-2xl ${skeletonBar}`} />
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 space-y-6">
              <div className={`rounded-[36px] border p-6 ${skeletonCard} h-72 ${skeletonBar}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen w-full transition-colors duration-500 p-4 sm:p-8 lg:p-12 relative overflow-hidden ${
        isDark ? "bg-[#0B0C15]" : "bg-slate-50"
      }`}>
        {/* Glow meshes */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/[0.04] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          {/* Header */}
          <div className={`flex flex-wrap items-center justify-between gap-3 rounded-3xl border p-4 backdrop-blur-2xl ${
            isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white/90 shadow-sm"
          }`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className={`flex items-center gap-2 py-2 px-4 rounded-xl border transition-all duration-300 group text-xs font-black uppercase tracking-wider ${
                  isDark 
                    ? "text-slate-400 border-white/5 bg-white/[0.02] hover:text-white hover:border-white/10 hover:bg-white/[0.04]" 
                    : "text-slate-650 border-slate-200 bg-white hover:text-slate-900 hover:border-slate-300 shadow-xs"
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>Home</span>
              </button>
              <div>
                <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                  SESSION OVERRIDES
                </span>
                <h1 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  Account Session
                </h1>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${
              isDark ? "border-white/10 bg-white/5 text-slate-400" : "border-slate-200 bg-white text-slate-500"
            }`}>
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>guest clearance</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className={`rounded-[40px] border p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden ${
                isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white shadow-md"
              }`}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Welcome Developer</span>
                      <h2 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                        Authenticate to unlock session controls
                      </h2>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${
                      isDark ? "border-white/10 bg-white/5 text-indigo-400" : "border-slate-200 bg-slate-50 text-indigo-600"
                    }`}>
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>
                  <p className={`text-xs sm:text-sm leading-relaxed font-bold ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                    To review active profiles, credentials parameters, unlinking portals, and Danger Zone settings, please sign in.
                  </p>
                  
                  <div className="max-w-xl pt-4">
                    <LoginPrompt
                      title="Login to manage your account"
                      description="Sign in to open your account controls, review your session, and jump back into profile settings."
                      nextPath="/account-controls"
                      compact
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className={`rounded-[36px] border p-6 backdrop-blur-2xl relative overflow-hidden ${
                isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white shadow-md"
              }`}>
                <div className="mb-6 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-600"
                  }`}>
                    <LockKeyhole className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className={`text-base font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      Locked clearance
                    </h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      SECURED CREDENTIAL WIDGETS
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs font-bold">
                  <div className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-150 bg-slate-50/50"}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Session</span>
                    <p className={`mt-1 ${isDark ? "text-slate-400" : "text-slate-650"}`}>Identify signed-in users and terminate active cookies securely.</p>
                  </div>
                  
                  <div className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-150 bg-slate-50/50"}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Profile</span>
                    <p className={`mt-1 ${isDark ? "text-slate-400" : "text-slate-650"}`}>Jump directly to customizable profile elements including avatar uploads.</p>
                  </div>

                  <div className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-150 bg-slate-50/50"}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Security Controls</span>
                    <p className={`mt-1 ${isDark ? "text-slate-400" : "text-slate-650"}`}>Review linked Google identity connections and primary parameters.</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-[36px] border p-6 backdrop-blur-2xl relative overflow-hidden ${
                isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
              }`}>
                <div className="mb-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-650"
                  }`}>
                    <ExternalLink className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className={`text-base font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      Direct SSO Shortcut
                    </h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      BYPASS TO AUTH OVERRIDE
                    </p>
                  </div>
                </div>
                
                <p className={`text-xs leading-relaxed mb-6 font-bold ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                  Jump directly to the primary login console to link or authenticate your active developer ID.
                </p>

                <Link
                  href="/login?next=%2Faccount-controls"
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all duration-300 shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    isDark 
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20" 
                      : "bg-indigo-750 hover:bg-indigo-850 shadow-indigo-650/15"
                  }`}
                >
                  <span>Go to Login flow</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 p-4 sm:p-8 lg:p-12 relative overflow-hidden ${
      isDark ? "bg-[#0B0C15] text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Blurred glow backdrops */}
      <div className="absolute top-[-25%] right-[-10%] w-[70%] h-[70%] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-25%] left-[-10%] w-[70%] h-[70%] bg-purple-500/[0.04] dark:bg-purple-500/[0.08] rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Navigation & Header Portal */}
        <div className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl border p-4 sm:p-5 backdrop-blur-2xl ${
          isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white/90 shadow-sm"
        }`}>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push("/account-settings")}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl border transition-all duration-300 group text-xs font-black uppercase tracking-wider ${
                isDark 
                  ? "text-slate-400 border-white/5 bg-white/[0.02] hover:text-white hover:border-white/10 hover:bg-white/[0.04]" 
                  : "text-slate-650 border-slate-200 bg-white hover:text-slate-900 hover:border-slate-300 shadow-xs"
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => router.push("/")}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl border transition-all duration-300 group text-xs font-black uppercase tracking-wider ${
                isDark 
                  ? "text-slate-400 border-white/5 bg-white/[0.02] hover:text-white hover:border-white/10" 
                  : "text-slate-650 border-slate-200 bg-white hover:text-slate-900 hover:border-slate-300 shadow-xs"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Home</span>
            </button>
            
            <div className="hidden sm:block w-px h-8 bg-slate-500/10 mx-2" />

            <div>
              <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                SESSION CONSOLE MANAGER
              </span>
              <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Manage Session overrides
              </h1>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${
            isDark ? "border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-400" : "border-emerald-250 bg-emerald-50 text-emerald-650"
          }`}>
            <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Session Secured</span>
          </div>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Details & Connectors */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Session console details card */}
            <div className={`rounded-[40px] border p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden ${
              isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white shadow-md"
            }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex items-center justify-between pb-6 border-b border-slate-500/10 mb-6">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">
                    Session Telemetry
                  </span>
                  <h2 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    Inspect active connection parameters
                  </h2>
                </div>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-indigo-500 ${
                  isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                }`}>
                  <Fingerprint className="w-6 h-6" />
                </div>
              </div>

              {/* Grid matrix of telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`rounded-2xl border p-4 transition-all duration-300 ${
                  isDark ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-150 bg-slate-50/40 shadow-xs"
                }`}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Display Profile</span>
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase border ${
                      isDark ? "border-white/5 bg-white/5 text-indigo-400" : "border-slate-200 bg-slate-100 text-indigo-650"
                    }`}>
                      {displayName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-0.5 max-w-[calc(100%-3rem)]">
                      <p className={`text-xs font-black truncate ${isDark ? "text-white" : "text-slate-800"}`}>{displayName}</p>
                      <p className="text-[10px] font-bold text-slate-500 truncate">{user.email || "No email bound"}</p>
                    </div>
                  </div>
                </div>

                <div className={`rounded-2xl border p-4 transition-all duration-300 ${
                  isDark ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-150 bg-slate-50/40 shadow-xs"
                }`}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Session state</span>
                  <p className={`mt-2.5 text-sm font-black tracking-wide uppercase ${isDark ? "text-white" : "text-slate-800"}`}>
                    Active connection
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">Provider pool: {provider.toUpperCase()}</p>
                </div>

                <div className={`rounded-2xl border p-4 transition-all duration-300 ${
                  isDark ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-150 bg-slate-50/40 shadow-xs"
                }`}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Sovereign registration</span>
                  <p className={`mt-2.5 text-sm font-black ${isDark ? "text-white" : "text-slate-800"}`}>
                    {memberSince}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">Based on cloud auth record.</p>
                </div>

                <div className={`rounded-2xl border p-4 transition-all duration-300 ${
                  isDark ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-150 bg-slate-50/40 shadow-xs"
                }`}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Telemetry account id</span>
                  <p className={`mt-2.5 font-mono text-[9px] font-black truncate select-all px-2.5 py-1.5 rounded-lg border ${
                    isDark ? "bg-slate-950/80 border-white/5 text-indigo-400" : "bg-slate-100 border-slate-200 text-indigo-650"
                  }`}>
                    {user.id}
                  </p>
                  <p className="text-[9.5px] font-bold text-slate-500 mt-1">Direct system identifier.</p>
                </div>
              </div>

              {/* Commands panel */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-500/10 pt-6">
                <Link
                  href="/account-settings"
                  className={`group rounded-2xl border p-4 flex flex-col justify-between min-h-36 transition-all duration-300 ${
                    isDark 
                      ? "border-white/[0.04] bg-white/[0.01] hover:border-indigo-500/20 hover:bg-white/[0.03]" 
                      : "border-slate-200 bg-slate-100/20 hover:border-indigo-300 hover:bg-white shadow-xs hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Settings className="w-5 h-5 text-indigo-500" />
                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 text-slate-500`} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Settings page</h4>
                    <p className="text-[10.5px] font-bold text-slate-500 mt-1 leading-relaxed">Update bio, username, country details.</p>
                  </div>
                </Link>

                <Link
                  href="/"
                  className={`group rounded-2xl border p-4 flex flex-col justify-between min-h-36 transition-all duration-300 ${
                    isDark 
                      ? "border-white/[0.04] bg-white/[0.01] hover:border-indigo-500/20 hover:bg-white/[0.03]" 
                      : "border-slate-200 bg-slate-100/20 hover:border-indigo-300 hover:bg-white shadow-xs hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 text-slate-500`} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Home Portal</h4>
                    <p className="text-[10.5px] font-bold text-slate-500 mt-1 leading-relaxed">Return to Vlyxir workspace tools.</p>
                  </div>
                </Link>

                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className={`group rounded-2xl border p-4 text-left flex flex-col justify-between min-h-36 transition-all duration-300 active:scale-[0.99] cursor-pointer ${
                    isDark 
                      ? "border-rose-500/10 bg-rose-500/[0.02] hover:border-rose-500/30 hover:bg-rose-500/[0.05]" 
                      : "border-rose-200 bg-rose-50/30 hover:border-rose-300 hover:bg-white shadow-xs hover:shadow-md"
                  } ${isSigningOut ? "cursor-not-allowed opacity-60 active:scale-100" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <LogOut className="w-5 h-5 text-rose-500" />
                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isDark ? "text-rose-300" : "text-rose-550"}`} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500">Sign Out</h4>
                    <p className={`text-[10.5px] font-bold mt-1 leading-relaxed ${isDark ? "text-rose-200/60" : "text-rose-700/65"}`}>
                      Terminate current active browser session safely.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Google Connectivity card */}
            <div className={`rounded-[36px] border p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden ${
              isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white shadow-md"
            }`}>
              <div className="mb-6 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-650"
                }`}>
                  <Shield className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    Backup Identity Portal
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    SSO GOOGLE CONNECTIVITY MANAGEMENT
                  </p>
                </div>
              </div>
              
              <p className={`text-xs leading-relaxed font-bold mb-6 ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                Establish single-click sign-in to recover your data pools in the event of credential losses.
              </p>

              <div className="space-y-4">
                <div className={`flex items-center justify-between rounded-2xl border p-4 ${
                  isDark ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-150 bg-slate-50/50"
                }`}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Google link status</span>
                  {identities.some((id) => id.provider === "google") ? (
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[8px] font-black uppercase text-emerald-500 tracking-widest animate-pulse">Linked</span>
                  ) : (
                    <span className="rounded-full bg-slate-500/10 border border-slate-200 px-3 py-1 text-[8px] font-black uppercase text-slate-400 tracking-widest">Disconnected</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleLinkGoogle}
                    disabled={isLinkingGoogle || identities.some((id) => id.provider === "google")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all duration-300 shadow-xl cursor-pointer ${
                      isDark 
                        ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20" 
                        : "bg-indigo-750 hover:bg-indigo-850 shadow-indigo-650/15"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Link Google
                  </button>

                  <button
                    onClick={handleUnlinkGoogle}
                    disabled={isLinkingGoogle || !identities.some((id) => id.provider === "google")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                      isDark 
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20" 
                        : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100/70"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Unlink Google
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Timelines & Safety Checklists */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Session Checklist before departure */}
            <div className={`rounded-[36px] border p-6 backdrop-blur-2xl relative overflow-hidden ${
              isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white shadow-md"
            }`}>
              <div className="mb-5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-650"
                }`}>
                  <Clock3 className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className={`text-base font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    Console Checklist
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    departure safety rules
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs font-bold leading-relaxed">
                <div className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-150 bg-slate-50/50"}`}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Unsaved updates</span>
                  <p className={`mt-1 ${isDark ? "text-slate-400" : "text-slate-650"}`}>Ensure to submit profile parameters before ending session logs.</p>
                </div>
                
                <div className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-150 bg-slate-50/50"}`}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Password overrides</span>
                  <p className={`mt-1 ${isDark ? "text-slate-400" : "text-slate-650"}`}>Password configurations live inside auth portals for safety clearance.</p>
                </div>
                
                <div className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-150 bg-slate-50/50"}`}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Session safety</span>
                  <p className={`mt-1 ${isDark ? "text-slate-400" : "text-slate-650"}`}>Sign out securely when developing on public or shared terminals.</p>
                </div>
              </div>
            </div>

            {/* Quick settings shortcut box */}
            <div className={`rounded-[36px] border p-6 backdrop-blur-2xl relative overflow-hidden ${
              isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
            }`}>
              <div className="mb-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-650"
                }`}>
                  <ExternalLink className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className={`text-base font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    Profile Shortcut
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    QUICK ACCESS TO PROFILE
                  </p>
                </div>
              </div>
              
              <p className={`text-xs leading-relaxed mb-6 font-bold ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                Jump directly back into the Profile settings to customize bio updates, region flags, or username parameters.
              </p>

              <Link
                href="/account-settings"
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all duration-300 shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  isDark 
                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20" 
                    : "bg-indigo-750 hover:bg-indigo-850 shadow-indigo-650/15"
                }`}
              >
                <span>Edit profile</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* IRREVERSIBLE DANGER ZONE CORE */}
            <div className={`rounded-[36px] border p-6 backdrop-blur-2xl relative overflow-hidden transition-all duration-300 ${
              isDark 
                ? "border-rose-500/20 bg-rose-500/[0.03] hover:bg-rose-500/[0.05]" 
                : "border-rose-200 bg-rose-50/30 hover:shadow-md shadow-xs"
            }`}>
              <div className="mb-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  isDark ? "bg-rose-500/25 border-rose-500/30 text-rose-400 animate-pulse" : "bg-rose-100 border-rose-200 text-rose-650"
                }`}>
                  <Trash2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-rose-500">
                    Danger Zone
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-rose-500/60">
                    IRREVERSIBLE SYSTEM COMMAND
                  </p>
                </div>
              </div>
              
              <p className={`text-xs leading-relaxed font-bold mb-6 ${isDark ? "text-rose-200/60" : "text-rose-700/70"}`}>
                Profile purging deletes all submissions, scores, comments, upvotes, and credentials keys forever. Proceed with absolute caution.
              </p>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all duration-300 shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  isDark 
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20 animate-pulse" 
                    : "bg-rose-700 hover:bg-rose-800 shadow-rose-650/15"
                }`}
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Delete Account</span>
              </button>
            </div>

          </div>
        </div>

        {/* Dynamic Modals Portal */}
        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteAccount}
          currentUsername={user?.user_metadata?.username || "confirm"}
          isDark={isDark}
        />
        
        <ErrorModal 
          isOpen={showErrorModal} 
          onClose={() => setShowErrorModal(false)} 
          title={errorConfig.title}
          message={errorConfig.message}
        />

        {/* Global Footer Details */}
        <div className="mt-20 mb-8 text-center opacity-30 select-none pointer-events-none space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.6em] text-slate-500">
            <Globe className="w-3.5 h-3.5" />
            <span>Vlyxir Sovereign Cloud Environment</span>
          </div>
          <p className="text-[8px] font-bold tracking-widest text-slate-500 opacity-60">
            SYS-BUILD: 7.3.20 // REGION: GLOBAL-EAST // SECURITY VERIFIED
          </p>
        </div>

      </div>
    </div>
  );
}
