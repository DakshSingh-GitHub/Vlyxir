"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link";
import { useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import { 
  ArrowLeft, 
  BadgeInfo, 
  CalendarDays, 
  LockKeyhole, 
  Mail, 
  Save, 
  ShieldCheck, 
  Sparkles, 
  User, 
  UserRound, 
  Trash2, 
  Pencil, 
  Zap, 
  Trophy,
  Globe,
  Camera,
  Cpu,
  Clock,
  KeyRound,
  Info,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppContext } from "../../lib/auth/context";
import { useAuth } from "../../lib/auth/auth-context";
import LoginPrompt from "../../../components/Auth/LoginPrompt";
import CountryDropdown from "../../../components/CountryDropdown";
import Image from "next/image";
import {
  EMPTY_PROFILE_VALUES,
  formatAccountDate,
  getAccountProfile,
  normalizeUsername,
  profileToFormValues,
  saveAccountProfile,
  uploadAvatar,
  deleteAvatar,
  getLeaderboardSettings,
  saveLeaderboardSettings,
  getUserIdentities,
  linkGoogleIdentity,
  unlinkGoogleIdentity,
  type ProfileRecord,
  type LeaderboardSettings,
} from "./helper/acc_helper";
import { checkProfanity } from "@/app/forum/forum-helper/helper";
import ProfanityModal from "@/app/forum/forum-helper/ProfanityModal";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";
import AvatarActionModal from "./AvatarActionModal";
import { checkForgeLimit, checkAiLimit, FORGE_FREE_LIMIT } from "../../lib/api/forge-limits";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { isDark } = useAppContext();
  const { user, isLoading: isAuthLoading, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [formValues, setFormValues] = useState(EMPTY_PROFILE_VALUES);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showProfanityModal, setShowProfanityModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showAvatarActionModal, setShowAvatarActionModal] = useState(false);
  const [successConfig, setSuccessConfig] = useState({ title: "Saved Successfully", message: "Your changes have been saved." });
  const [errorConfig, setErrorConfig] = useState({ title: "Linking Failed", message: "This email has already in use." });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
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
      console.log("Authentication error detected:", errorParam, errorDesc);
      
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

  const [forgeUsage, setForgeUsage] = useState(0);
  const [userRole, setUserRole] = useState("user");
  const [forgeLimit, setForgeLimit] = useState(FORGE_FREE_LIMIT);
  const [aiUsage, setAiUsage] = useState(0);
  const [aiLimit, setAiLimit] = useState(0);
  const [leaderboardSettings, setLeaderboardSettings] = useState<LeaderboardSettings | null>(null);
  const [isTogglingLeaderboard, setIsTogglingLeaderboard] = useState(false);
  const [identities, setIdentities] = useState<any[]>([]);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const compressedFile = await compressImage(file);
      const url = await uploadAvatar(user, compressedFile);
      setFormValues((prev) => ({ ...prev, avatar_url: url }));
      setSuccessConfig({
        title: "Image Uploaded",
        message: "Your new profile picture has been uploaded. Click 'Save changes' to apply it to your account."
      });
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleResetPicture = async (revertToProvider = false) => {
    if (!user) return;
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteAvatar(user);
      
      let targetAvatar = "";
      let message = "Your profile photo has been removed and reset to initials. Click 'Save changes' to apply.";
      let title = "Photo Removed";

      if (revertToProvider) {
        targetAvatar = user.user_metadata?.picture || user.user_metadata?.avatar_url || "";
        message = "Your profile picture has been reset to your default account image. Click 'Save changes' to apply.";
        title = "Picture Reset";
      }

      setFormValues((prev) => ({ ...prev, avatar_url: targetAvatar }));
      setSuccessConfig({ title, message });
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset image.");
    } finally {
      setIsUploading(false);
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Cap resolution to 800px for avatars
          const MAX_DIM = 800;
          if (width > MAX_DIM || height > MAX_DIM) {
            const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Iterative quality adjustment to hit ~150KB - 250KB range
          let quality = 0.7;
          
          const attemptCompression = (q: number) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const sizeKB = blob.size / 1024;
                  // Target range: 150KB - 250KB
                  if (sizeKB > 250 && q > 0.1) {
                    attemptCompression(q - 0.1);
                  } else if (sizeKB < 150 && q < 0.9) {
                    attemptCompression(q + 0.1);
                  } else {
                    resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
                  }
                } else {
                  reject(new Error("Canvas to Blob failed"));
                }
              },
              "image/jpeg",
              q
            );
          };

          attemptCompression(quality);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setFormValues(EMPTY_PROFILE_VALUES);
      setIsLoadingProfile(false);
      return;
    }

    if (profile?.id === user.id) {
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

  useEffect(() => {
    if (!user) return;
    
    checkForgeLimit(user.id).then((res) => {
      setForgeUsage(res.count || 0);
      setUserRole(res.role || "user");
      setForgeLimit(res.limit || FORGE_FREE_LIMIT);
    });

    checkAiLimit(user.id).then((res) => {
      setAiUsage(res.count || 0);
      setAiLimit(res.limit || 0);
    });

    getLeaderboardSettings(user.id).then((res) => {
      setLeaderboardSettings(res);
    });

    getUserIdentities().then((res) => {
      setIdentities(res);
    }).catch(err => {
      console.warn("Failed to fetch identities:", err);
    });
  }, [user]);

  const initials = useMemo(() => {
    const source = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email || "U";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join("") || "U";
  }, [profile, user]);

  const hasChanges = useMemo(() => {
    if (!profile) return false;
    const original = profileToFormValues(profile);
    return (
      formValues.full_name.trim() !== original.full_name.trim() ||
      normalizeUsername(formValues.username) !== normalizeUsername(original.username) ||
      formValues.bio.trim() !== original.bio.trim() ||
      formValues.country !== original.country ||
      formValues.avatar_url.trim() !== original.avatar_url.trim()
    );
  }, [formValues, profile]);

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
      setSuccessConfig({
        title: "Saved Successfully",
        message: "Your account settings have been updated successfully."
      });
      setShowSuccessModal(true);
      if (refreshProfile) {
        refreshProfile();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save account settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLeaderboardToggle = async () => {
    if (!user || !leaderboardSettings || isTogglingLeaderboard) return;

    if (leaderboardSettings.last_toggled) {
      const lastToggled = new Date(leaderboardSettings.last_toggled).getTime();
      const now = new Date().getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (now - lastToggled < twentyFourHours) {
        return;
      }
    }

    setIsTogglingLeaderboard(true);
    try {
      const newState = !leaderboardSettings.is_enabled;
      const updated = await saveLeaderboardSettings(user.id, newState);
      setLeaderboardSettings(updated);
      setSuccessConfig({
        title: newState ? "Joined Leaderboard" : "Left Leaderboard",
        message: newState 
          ? "You are now visible on the global leaderboard." 
          : "You have been hidden from the global leaderboard. You must wait 24 hours to change this again."
      });
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update leaderboard settings.");
    } finally {
      setIsTogglingLeaderboard(false);
    }
  };

  const handleLinkGoogle = async () => {
    if (!user || isLinkingGoogle) return;
    setIsLinkingGoogle(true);
    setError(null);
    try {
      await linkGoogleIdentity();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to link Google account.");
      setIsLinkingGoogle(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!user || isLinkingGoogle) return;

    const googleId = identities.find((id) => id.provider === "google");
    if (!googleId) return;

    if (identities.length < 2) {
      setError("For your security, you must have at least two login methods (e.g. Email and Google) to unlink your Google account.");
      return;
    }

    setIsLinkingGoogle(true);
    setError(null);
    try {
      await unlinkGoogleIdentity(googleId);
      const updated = await getUserIdentities();
      setIdentities(updated);
      setSuccessConfig({
        title: "Account Unlinked",
        message: "Your Google account has been successfully unlinked."
      });
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlink Google account.");
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const leaderboardCooldown = useMemo(() => {
    if (!leaderboardSettings?.last_toggled) return null;
    const lastToggled = new Date(leaderboardSettings.last_toggled).getTime();
    const now = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const diff = now - lastToggled;
    if (diff < twentyFourHours) {
      const remaining = twentyFourHours - diff;
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      return { hours, minutes };
    }
    return null;
  }, [leaderboardSettings]);

  const skeletonBar = isDark ? "bg-slate-800" : "bg-slate-200 animate-pulse";
  const skeletonCard = isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs";

  if (!isSafetyTimeoutReached && (isAuthLoading || (user && isLoadingProfile))) {
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
                  <div className={`h-12 w-32 rounded-2xl ${skeletonBar}`} />
                </div>
                <div className="h-px bg-slate-500/10 w-full" />
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className={`h-3 w-20 rounded-md ${skeletonBar}`} />
                      <div className={`h-12 w-full rounded-2xl ${skeletonBar}`} />
                    </div>
                    <div className="space-y-2">
                      <div className={`h-3 w-20 rounded-md ${skeletonBar}`} />
                      <div className={`h-12 w-full rounded-2xl ${skeletonBar}`} />
                    </div>
                  </div>
                  <div className={`w-36 h-36 rounded-[32px] ${skeletonBar} self-center md:self-auto`} />
                </div>
                <div className="space-y-2">
                  <div className={`h-3 w-20 rounded-md ${skeletonBar}`} />
                  <div className={`h-32 w-full rounded-2xl ${skeletonBar}`} />
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 space-y-6">
              <div className={`rounded-[36px] border p-6 ${skeletonCard} h-72 ${skeletonBar}`} />
              <div className={`rounded-[36px] border p-6 ${skeletonCard} h-60 ${skeletonBar}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 text-center transition-colors duration-500 relative overflow-hidden ${
        isDark ? "bg-[#0B0C15]" : "bg-slate-50"
      }`}>
        <div className="absolute top-[10%] left-[10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-xl w-full relative z-10">
          <LoginPrompt
            title="Access Developer Console"
            description="Your profile details, live telemetry metrics, and leaderboard visibilities reside inside Vlyxir auth cores. Authenticate to sync settings."
            nextPath="/account-settings"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 p-4 sm:p-8 lg:p-12 relative overflow-hidden ${
      isDark ? "bg-[#0B0C15] text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Visual background blurred light orbs */}
      <div className="absolute top-[-25%] right-[-10%] w-[70%] h-[70%] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-25%] left-[-10%] w-[70%] h-[70%] bg-purple-500/[0.04] dark:bg-purple-500/[0.08] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[35%] left-[25%] w-[50%] h-[50%] bg-cyan-500/[0.02] dark:bg-cyan-500/[0.04] rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Modern Interactive Navigation & Profile Title Header */}
        <div className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl border p-4 sm:p-5 backdrop-blur-2xl mb-8 ${
          isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white/90 shadow-sm"
        }`}>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.back()}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl border transition-all duration-300 group text-xs font-black uppercase tracking-wider ${
                isDark 
                  ? "text-slate-400 border-white/5 bg-white/[0.02] hover:text-white hover:border-white/10 hover:bg-white/[0.04]" 
                  : "text-slate-650 border-slate-200 bg-white hover:text-slate-900 hover:border-slate-300 shadow-xs"
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
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
                VLYXIR CREDENTIAL CORE
              </span>
              <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Manage Profile settings
              </h1>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${
            isDark ? "border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-400" : "border-emerald-250 bg-emerald-50 text-emerald-650"
          }`}>
            <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>authenticated connection</span>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border px-5 py-4 text-xs font-bold mb-6 flex items-center gap-3 ${
              isDark ? "border-rose-500/30 bg-rose-500/[0.06] text-rose-200" : "border-rose-200 bg-rose-50/80 text-rose-700"
            }`}
          >
            <Info className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form & Connectors */}
          <div className="lg:col-span-8 space-y-8">
            <div className={`rounded-[40px] border p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden ${
              isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white shadow-md"
            }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-500/10">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">
                    Telemetry settings Form
                  </span>
                  <h2 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    Edit Profile Details
                  </h2>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    form="account-settings-form"
                    disabled={isSaving || !hasChanges}
                    className={`flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all duration-300 shadow-xl cursor-pointer ${
                      isDark 
                        ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 active:scale-[0.98]" 
                        : "bg-indigo-750 hover:bg-indigo-850 shadow-indigo-650/15 active:scale-[0.98]"
                    } ${isSaving || !hasChanges ? "cursor-not-allowed opacity-40 grayscale-[0.6] hover:scale-100 active:scale-100" : "hover:scale-[1.02]"}`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "Syncing..." : "Save changes"}</span>
                  </button>
                  
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-black text-sm select-none ${
                    isDark ? "border-white/10 bg-white/5 text-indigo-400" : "border-slate-200 bg-slate-100 text-indigo-600"
                  }`}>
                    {initials}
                  </div>
                </div>
              </div>

              {/* Form content */}
              <form id="account-settings-form" className="space-y-6" onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Text Inputs */}
                  <div className="flex-1 space-y-6">
                    <label className="block space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                        Full Name
                      </span>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 pointer-events-none" />
                        <input
                          value={formValues.full_name}
                          onChange={(event) => setFormValues((prev) => ({ ...prev, full_name: event.target.value }))}
                          className={`w-full rounded-2xl border py-3.5 pl-12 pr-4 outline-none transition duration-300 font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 ${
                            isDark 
                              ? "border-white/5 bg-slate-950/70 text-white focus:border-indigo-500 focus:bg-slate-950" 
                              : "border-slate-200 bg-white text-slate-900 focus:border-indigo-500 shadow-xs"
                          }`}
                          placeholder="Daksh Singh"
                        />
                      </div>
                    </label>

                    <label className="block space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                        Username
                      </span>
                      <div className="relative">
                        <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 pointer-events-none" />
                        <input
                          value={formValues.username}
                          onChange={(event) => setFormValues((prev) => ({ ...prev, username: normalizeUsername(event.target.value) }))}
                          className={`w-full rounded-2xl border py-3.5 pl-12 pr-4 outline-none transition duration-300 font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 ${
                            isDark 
                              ? "border-white/5 bg-slate-950/70 text-white focus:border-indigo-500 focus:bg-slate-950" 
                              : "border-slate-200 bg-white text-slate-900 focus:border-indigo-500 shadow-xs"
                          }`}
                          placeholder="dakshsingh"
                        />
                      </div>
                    </label>
                  </div>

                  {/* Avatar Upload Frame */}
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 self-start md:self-center">
                      Profile Picture
                    </span>
                    
                    <div className={`group relative h-36 w-40 overflow-hidden rounded-[32px] border-2 transition-all duration-300 hover:scale-[1.02] ${
                      isDark ? "bg-slate-950/80 border-indigo-500/20 hover:border-indigo-500/40" : "bg-slate-50 border-slate-200 hover:border-indigo-400 shadow-sm"
                    }`}>
                      {formValues.avatar_url ? (
                        <Image
                          src={formValues.avatar_url}
                          alt="Profile picture"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-black text-3xl text-slate-400 select-none">
                          {initials}
                        </div>
                      )}
                      
                      {/* Avatar Edit Action Portal Button */}
                      <button
                        type="button"
                        onClick={() => setShowAvatarActionModal(true)}
                        className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/30 bg-slate-950/80 text-indigo-400 shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-indigo-500 hover:text-white hover:scale-110 active:scale-95 z-20 cursor-pointer"
                        title="Edit profile photo"
                      >
                        <Camera size={14} className="animate-pulse" />
                      </button>

                      {/* Cover overlay click trigger */}
                      <div 
                        onClick={() => setShowAvatarActionModal(true)}
                        className="absolute inset-0 cursor-pointer bg-black/10 dark:bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <label className="block space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Personal Biography
                  </span>
                  <textarea
                    value={formValues.bio}
                    onChange={(event) => setFormValues((prev) => ({ ...prev, bio: event.target.value }))}
                    className={`min-h-36 w-full rounded-2xl border px-4 py-3 outline-none transition duration-300 font-bold text-sm leading-relaxed focus:ring-4 focus:ring-indigo-500/10 ${
                      isDark 
                        ? "border-white/5 bg-slate-950/70 text-white focus:border-indigo-500 focus:bg-slate-950" 
                        : "border-slate-200 bg-white text-slate-900 focus:border-indigo-500 shadow-xs"
                    }`}
                    placeholder="Tell other developers about what systems you build or programming languages you practice..."
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Region/Country
                  </span>
                  <CountryDropdown
                    value={formValues.country}
                    onChange={(value) => setFormValues((prev) => ({ ...prev, country: value }))}
                    tone={isDark ? "dark" : "light"}
                    placeholder="Select active region"
                    searchPlaceholder="Search countries..."
                  />
                </label>

                {/* Read only sensitive account specifications */}
                <div className="grid gap-4 md:grid-cols-2 pt-4">
                  <div className={`rounded-2xl border p-4 transition-colors duration-300 ${
                    isDark ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-150 bg-slate-50/50"
                  }`}>
                    <div className="mb-1.5 flex items-center gap-2 text-slate-500">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Linked Email</span>
                    </div>
                    <p className={`text-sm font-black break-all ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                      {profile?.email || user.email}
                    </p>
                    <p className="mt-2 text-[9.5px] font-bold text-slate-500">
                      Read-only. Email configurations are managed externally.
                    </p>
                  </div>
                  
                  <div className={`rounded-2xl border p-4 transition-colors duration-300 ${
                    isDark ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-150 bg-slate-50/50"
                  }`}>
                    <div className="mb-1.5 flex items-center gap-2 text-slate-500">
                      <LockKeyhole className="h-4 w-4 shrink-0" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Password parameters</span>
                    </div>
                    <p className={`text-sm font-black ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                      ••••••••••••••••
                    </p>
                    <p className="mt-2 text-[9.5px] font-bold text-slate-500">
                      Managed through secure auth pools.
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Linked Accounts Portal */}
            <div className={`rounded-[36px] border p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden ${
              isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white shadow-md"
            }`}>
              <div className="mb-6 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-650"
                }`}>
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    Identity providers
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    OAUTH CREDENTIAL PORTAL CONNECTION
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Email primary identity */}
                <div className={`flex items-center justify-between rounded-2xl border p-4 transition-colors duration-300 ${
                  isDark ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-150 bg-slate-50/30"
                }`}>
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      isDark ? "bg-slate-800/80 border-slate-700/50 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
                    }`}>
                      <Mail className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className={`text-xs font-black tracking-wide ${isDark ? "text-white" : "text-slate-800"}`}>
                        Email login profile
                      </p>
                      <p className="text-[10px] font-bold text-slate-500">
                        {user?.email || "No email address registered"}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[8px] font-black uppercase text-emerald-555 dark:text-emerald-400 tracking-widest">
                    Primary
                  </span>
                </div>

                {/* Google identity provider */}
                <div className={`flex items-center justify-between rounded-2xl border p-4 transition-colors duration-300 ${
                  isDark ? "border-white/[0.04] bg-white/[0.01]" : "border-slate-150 bg-slate-50/30"
                }`}>
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-250/50 shrink-0">
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.25.81-.59z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <div>
                      <p className={`text-xs font-black tracking-wide ${isDark ? "text-white" : "text-slate-800"}`}>
                        Google Credentials
                      </p>
                      <p className="text-[10px] font-bold text-slate-500">
                        {identities.some((id) => id.provider === "google") ? "Linked successfully to profile" : "Authentication path disconnected"}
                      </p>
                    </div>
                  </div>
                  
                  {identities.some((id) => id.provider === "google") ? (
                    <button
                      type="button"
                      disabled={isLinkingGoogle}
                      onClick={handleUnlinkGoogle}
                      className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-[9px] font-black uppercase text-rose-500 tracking-widest hover:bg-rose-500/20 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Unlink
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isLinkingGoogle}
                      onClick={handleLinkGoogle}
                      className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-[9px] font-black uppercase text-indigo-500 tracking-widest hover:bg-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Link Account
                    </button>
                  )}
                </div>

                <p className="text-[10.5px] leading-relaxed text-slate-500">
                  Linking identity providers grants alternative Single Sign-On (SSO) channels while preserving all your scores, forum metrics, and developer parameters intact.
                </p>
              </div>
            </div>

            {/* Privacy & Global Leaderboard preferences (exclusive to pro users) */}
            {profile?.plan === 'pro' && (
              <div className={`rounded-[36px] border p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden ${
                isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white shadow-md"
              }`}>
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-500/10">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">
                      Leaderboard parameters
                    </span>
                    <h3 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      Global Rankings
                    </h3>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-wider text-slate-500`}>
                      {leaderboardSettings?.is_enabled ? "Visible on rankings" : "Rankings Hidden"}
                    </span>
                    
                    <button
                      type="button"
                      onClick={handleLeaderboardToggle}
                      disabled={isTogglingLeaderboard || !!leaderboardCooldown}
                      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed ${
                        leaderboardSettings?.is_enabled ? 'bg-indigo-500' : 'bg-slate-350 dark:bg-slate-800'
                      } ${leaderboardCooldown ? 'opacity-40' : ''} cursor-pointer`}
                    >
                      <motion.span
                        initial={false}
                        animate={{ x: leaderboardSettings?.is_enabled ? 24 : 4 }}
                        className="inline-block h-5 w-5 rounded-full bg-white shadow-md"
                      />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                      Participation permits your profile username, flag, and complete Arena telemetry points to be visible on public lists. Disabling this removes you immediately from public listings.
                    </p>
                    
                    {leaderboardCooldown && (
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                        <BadgeInfo size={13} className="shrink-0" />
                        <span>Toggle cooldown active: {leaderboardCooldown.hours}h {leaderboardCooldown.minutes}m remaining</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Summaries & Telemetry Gauges */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Live Profile Summary Preview Card */}
            <div className={`rounded-[36px] border p-6 backdrop-blur-2xl relative overflow-hidden ${
              isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
            }`}>
              <div className="mb-6 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-600"
                }`}>
                  <User className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className={`text-base font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    Live Preview
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    REALTIME SUMMARY RADAR
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Full Name</span>
                  <p className={`text-sm font-black mt-0.5 ${isDark ? "text-white" : "text-slate-800"}`}>
                    {profile?.full_name || <span className="text-slate-500 italic">Not specified</span>}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Developer Tag</span>
                  <p className={`text-sm font-black mt-0.5 text-indigo-500 dark:text-indigo-400`}>
                    @{profile?.username || "unknown"}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Biography</span>
                  <p className={`text-xs mt-0.5 leading-relaxed font-bold break-words whitespace-pre-wrap ${
                    isDark ? "text-slate-400" : "text-slate-650"
                  }`}>
                    {profile?.bio || <span className="text-slate-500 italic">No biography declared yet.</span>}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Country / Core Region</span>
                  <p className={`text-sm font-black mt-0.5 ${isDark ? "text-white" : "text-slate-800"}`}>
                    {profile?.country || <span className="text-slate-500 italic">Not set</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Activity Timeline Card */}
            <div className={`rounded-[36px] border p-6 backdrop-blur-2xl relative overflow-hidden ${
              isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white shadow-md"
            }`}>
              <div className="mb-6 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-600"
                }`}>
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    Activity logs
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    REGISTRATION TIMESTAMPS
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative pl-6 border-l-2 border-slate-500/10 py-1.5 space-y-1">
                  <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Node initialized</span>
                  <p className={`text-xs font-black ${isDark ? "text-slate-350" : "text-slate-700"}`}>
                    {formatAccountDate(profile?.created_at)}
                  </p>
                </div>
                
                <div className="relative pl-6 border-l-2 border-slate-500/10 py-1.5 space-y-1">
                  <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Last Telemetry update</span>
                  <p className={`text-xs font-black ${isDark ? "text-slate-350" : "text-slate-700"}`}>
                    {formatAccountDate(profile?.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Vlyxir Forge Runs Quota Gauge */}
            <div className={`rounded-[36px] border p-6 backdrop-blur-2xl relative overflow-hidden ${
              isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white shadow-md"
            }`}>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isDark ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-amber-50 border-amber-200 text-amber-600"
                  }`}>
                    <Zap className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className={`text-base font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      Forge runs
                    </h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      DAILY COMPILE POOL LIMIT
                    </p>
                  </div>
                </div>
                
                <span className="text-xs font-black">
                  {userRole === 'super' || forgeLimit === Infinity ? 'Unlimited (WASM)' : `${forgeUsage} / ${forgeLimit}`}
                </span>
              </div>

              <div className="space-y-3.5">
                {userRole !== 'super' && forgeLimit !== Infinity ? (
                  <div className={`h-2.5 w-full rounded-full overflow-hidden p-0.5 border ${
                    isDark ? "bg-slate-950/80 border-white/5" : "bg-slate-100 border-slate-200"
                  }`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (forgeUsage / forgeLimit) * 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                    />
                  </div>
                ) : (
                  <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 shadow-[0_0_15px_rgba(16,185,129,0.35)] border border-emerald-400/20" />
                )}
                
                <p className={`text-[10px] font-bold leading-relaxed ${isDark ? "text-slate-500" : "text-slate-550"}`}>
                  {userRole === 'super' 
                    ? "Sovereign admin clearance detected. Unlimited cloud compiler cores allocated. Welcome back, Daksh." 
                    : forgeLimit === Infinity
                    ? "Unlimited client-side WebAssembly Python execution (Pyodide Web Worker engine)."
                    : `Your allocation of ${forgeLimit} daily forge compilations resets strictly at 00:00 UTC.`}
                </p>
              </div>
            </div>

            {/* Vlyxir Insights Runs Quota Gauge (rendered if aiLimit > 0) */}
            {aiLimit > 0 && (
              <div className={`rounded-[36px] border p-6 backdrop-blur-2xl relative overflow-hidden ${
                isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white shadow-md"
              }`}>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-650"
                    }`}>
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className={`text-base font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                        Insights runs
                      </h3>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                        DAILY COGNITIVE CORES LIMIT
                      </p>
                    </div>
                  </div>
                  
                  <span className="text-xs font-black">
                    {userRole === 'super' ? 'Unlimited' : `${aiUsage} / ${aiLimit}`}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {userRole !== 'super' ? (
                    <div className={`h-2.5 w-full rounded-full overflow-hidden p-0.5 border ${
                      isDark ? "bg-slate-950/80 border-white/5" : "bg-slate-100 border-slate-200"
                    }`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (aiUsage / aiLimit) * 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(6,182,212,0.45)] border border-cyan-400/20 animate-pulse" />
                  )}
                  
                  <p className={`text-[10px] font-bold leading-relaxed ${isDark ? "text-slate-500" : "text-slate-550"}`}>
                    {userRole === 'super' 
                      ? "Unlimited structural audit quotas granted. Maintain analysis parameters as required." 
                      : `Your cognitive quota of ${aiLimit} structural analyses resets strictly at 00:00 UTC.`}
                  </p>
                </div>
              </div>
            )}

            {/* Technical spec edit details box */}
            <div className={`rounded-[36px] border p-6 backdrop-blur-2xl relative overflow-hidden ${
              isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white shadow-md"
            }`}>
              <div className="mb-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-600"
                }`}>
                  <Info className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className={`text-base font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    General Specifications
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    EDIT Clearance bounds
                  </p>
                </div>
              </div>
              
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                Vlyxir profiles permit local changes to public keys: <strong>Full Name</strong>, <strong>Username tag</strong>, <strong>Personal Bio</strong>, and <strong>Active Region</strong>. Modifying email registers or encryption parameters must go through secure SSO portals.
              </p>
            </div>

            {/* Danger Zone Section */}
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
                    IRREVERSIBLE PROCEDURES
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className={`text-xs leading-relaxed font-bold ${isDark ? "text-rose-200/60" : "text-rose-700/70"}`}>
                  Profile deletion completely purges all Arena submissions, scores, forum statistics, and credentials keys forever.
                </p>
                
                <button
                  type="button"
                  onClick={() => router.push('/account-controls')}
                  className="group flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-500 transition-colors hover:text-rose-650 cursor-pointer"
                >
                  <span>Go to account controls</span>
                  <ArrowLeft className="h-3 w-3 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Modals Portal */}
        <ProfanityModal isOpen={showProfanityModal} onClose={() => setShowProfanityModal(false)} />
        
        <SuccessModal 
          isOpen={showSuccessModal} 
          onClose={() => setShowSuccessModal(false)} 
          title={successConfig.title}
          message={successConfig.message}
        />
        
        <ErrorModal 
          isOpen={showErrorModal} 
          onClose={() => setShowErrorModal(false)} 
          title={errorConfig.title}
          message={errorConfig.message}
        />
        
        <AvatarActionModal 
          isOpen={showAvatarActionModal}
          onClose={() => setShowAvatarActionModal(false)}
          onUpload={() => fileInputRef.current?.click()}
          onDelete={() => handleResetPicture(false)}
          onResetToProvider={user?.app_metadata?.provider === "google" || user?.user_metadata?.picture ? () => handleResetPicture(true) : undefined}
          providerName={user?.app_metadata?.provider === "google" ? "Google" : "Provider"}
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
