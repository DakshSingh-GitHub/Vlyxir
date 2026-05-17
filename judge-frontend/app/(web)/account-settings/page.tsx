"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link";
import { useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import { ArrowLeft, BadgeInfo, CalendarDays, LockKeyhole, Mail, Save, ShieldCheck, Sparkles, User, UserRound, Trash2, Pencil, Zap, Trophy } from "lucide-react";
import { motion } from "framer-motion";
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
                    // Too large, decrease quality
                    attemptCompression(q - 0.1);
                  } else if (sizeKB < 150 && q < 0.9) {
                    // Too small, increase quality
                    attemptCompression(q + 0.1);
                  } else {
                    // Range met or quality limits reached
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


  const shellClass = "relative flex-1 font-sans";
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

    // Prevent re-fetching if we already have the correct profile loaded
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

    // Cooldown check
    if (leaderboardSettings.last_toggled) {
      const lastToggled = new Date(leaderboardSettings.last_toggled).getTime();
      const now = new Date().getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (now - lastToggled < twentyFourHours) {
        return; // UI should have disabled it anyway
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

  if (!isSafetyTimeoutReached && (isAuthLoading || (user && isLoadingProfile))) {
    return (
      <div className={shellClass}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className={ambientClass} />
          <div className={`pointer-events-none absolute left-[-8%] top-[12%] h-72 w-72 rounded-full blur-[130px] ${glowTopClass}`} />
          <div className={`pointer-events-none absolute bottom-[-6%] right-[-5%] h-80 w-80 rounded-full blur-[150px] ${glowBottomClass}`} />
        </div>

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
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-5">
                    <div className="space-y-2">
                      <div className={`h-3 w-24 rounded-full ${skeletonBar} animate-pulse`} />
                      <div className={`h-12 rounded-2xl ${skeletonCard} border ${skeletonBar} animate-pulse`} />
                    </div>
                    <div className="space-y-2">
                      <div className={`h-3 w-20 rounded-full ${skeletonBar} animate-pulse`} />
                      <div className={`h-12 rounded-2xl ${skeletonCard} border ${skeletonBar} animate-pulse`} />
                    </div>
                  </div>
                  <div className={`h-40 w-40 shrink-0 rounded-4xl border ${skeletonBar} animate-pulse`} />
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
      <div className="flex flex-1 items-center justify-center px-4 py-10">
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={ambientClass} />
        <div className={`pointer-events-none absolute left-[-8%] top-[12%] h-72 w-72 rounded-full blur-[130px] ${glowTopClass}`} />
        <div className={`pointer-events-none absolute bottom-[-6%] right-[-5%] h-80 w-80 rounded-full blur-[150px] ${glowBottomClass}`} />
      </div>

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
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${isDark ? "border-slate-700/70 bg-slate-900/70 text-emerald-400" : "border-slate-200 bg-white text-emerald-600"}`}>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Signed in
          </div>
        </div>

        {error && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${isDark ? "border-rose-500/30 bg-rose-500/10 text-rose-200" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {error}
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
                    disabled={isSaving || !hasChanges}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.98] ${isDark ? "bg-[linear-gradient(135deg,#2563eb,#7c3aed)] shadow-lg shadow-indigo-500/25 enabled:hover:brightness-110" : "bg-[linear-gradient(135deg,#1d4ed8,#7c3aed)] shadow-lg shadow-indigo-500/20 enabled:hover:brightness-110"} ${isSaving || !hasChanges ? "cursor-not-allowed opacity-40 grayscale-[0.5]" : ""}`}
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
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-5">
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

                <div className="flex flex-col items-center gap-4">
                  <div className="flex w-40 items-center justify-between pl-1">
                    <span className={`block text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Profile Image</span>
                  </div>
                  <div className={`group relative h-36 w-40 overflow-hidden rounded-4xl border-2 border-indigo-500/40 transition-all hover:border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)] ${isDark ? "bg-slate-900/70" : "bg-slate-50"}`}>
                    {formValues.avatar_url ? (
                      <Image
                        src={formValues.avatar_url}
                        alt="Profile"
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-4xl font-black text-slate-400">{initials}</span>
                      </div>
                    )}
                    
                    {/* Action Button (Pencil) */}
                    <button
                      type="button"
                      onClick={() => setShowAvatarActionModal(true)}
                      className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/50 bg-slate-950/80 text-indigo-400 shadow-xl backdrop-blur-md transition-all hover:bg-indigo-600 hover:text-white hover:scale-110 active:scale-95 z-20"
                      title="Edit profile picture"
                    >
                      <Pencil size={14} />
                    </button>

                    {/* Simple hover overlay */}
                    <div 
                      onClick={() => setShowAvatarActionModal(true)}
                      className="absolute inset-0 cursor-pointer bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"
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

            </form>

            <div className="mt-12 space-y-8 pt-10 border-t border-slate-700/30">
              {/* Linked Accounts Section */}
              <div className={`rounded-3xl border p-6 ${isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50/50"}`}>
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isDark ? "border-slate-700/70 bg-slate-900/70" : "border-slate-200 bg-white"}`}>
                    <ShieldCheck className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="font-bold">Linked Accounts</h3>
                    <p className={`text-[10px] font-medium uppercase tracking-wider ${mutedClass}`}>Connectivity</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Email Account */}
                  <div className={`flex items-center justify-between rounded-2xl border p-3 ${isDark ? "border-slate-800/50 bg-slate-900/30" : "border-slate-200/50 bg-white"}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Email Account</p>
                        <p className={`text-[10px] font-medium ${mutedClass}`}>{user?.email || "Email address"}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-black uppercase text-emerald-500 tracking-widest">Primary</span>
                  </div>

                  {/* Google Account */}
                  <div className={`flex items-center justify-between rounded-2xl border p-3 ${isDark ? "border-slate-800/50 bg-slate-900/30" : "border-slate-200/50 bg-white"}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                        <svg viewBox="0 0 24 24" className="h-4 w-4">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.25.81-.59z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold">Google Account</p>
                        <p className={`text-[10px] font-medium ${mutedClass}`}>
                          {identities.some((id) => id.provider === "google") ? "Linked" : "Not Linked"}
                        </p>
                      </div>
                    </div>
                    {identities.some((id) => id.provider === "google") ? (
                      <button
                        type="button"
                        disabled={isLinkingGoogle}
                        onClick={handleUnlinkGoogle}
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-[9px] font-black uppercase text-rose-500 tracking-widest hover:bg-rose-500/20 transition-all disabled:opacity-50"
                      >
                        Unlink
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isLinkingGoogle}
                        onClick={handleLinkGoogle}
                        className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-[9px] font-black uppercase text-indigo-500 tracking-widest hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                      >
                        Link
                      </button>
                    )}
                  </div>

                  <p className={`text-[10px] leading-relaxed ${mutedClass}`}>
                    Link a Google account to log in with a single click and ensure your progress is always safe.
                  </p>
                </div>
              </div>
            </div>

              {/* Preferences Section */}
              {profile?.plan === 'pro' && (
                <div className={`mt-8 rounded-4xl border p-6 md:p-8 backdrop-blur-2xl ${surfaceClass}`}>
                  <div className="mb-6">
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Privacy & Preferences</p>
                    <h2 className="mt-1 text-xl font-bold">Leaderboard Participation</h2>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-indigo-500" />
                        <h3 className="font-bold">Join the leaderboard</h3>
                      </div>
                      <p className={`text-sm leading-relaxed ${mutedClass}`}>
                        When enabled, your profile and total score will be visible on the global leaderboard. 
                        Disabling this will hide you from public rankings.
                      </p>
                      {leaderboardCooldown && (
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-3 py-1.5 rounded-lg w-fit border border-amber-500/20">
                          <BadgeInfo size={12} />
                          Cooldown active: {leaderboardCooldown.hours}h {leaderboardCooldown.minutes}m remaining
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={handleLeaderboardToggle}
                        disabled={isTogglingLeaderboard || !!leaderboardCooldown}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed ${
                          leaderboardSettings?.is_enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        } ${leaderboardCooldown ? 'opacity-50 grayscale-[0.5]' : ''}`}
                      >
                        <motion.span
                          initial={false}
                          animate={{ x: leaderboardSettings?.is_enabled ? 24 : 4 }}
                          className="inline-block h-5 w-5 rounded-full bg-white shadow-md"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-6">
                <div className="flex items-center gap-2 text-[10px] font-medium">
                  <BadgeInfo className="h-3.5 w-3.5 text-indigo-500" />
                  <span className={mutedClass}>Vlyxir ID: <span className="font-mono text-[9px]">{user.id}</span></span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.98] ${isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-200 text-slate-900 hover:bg-slate-300"}`}
                >
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Go Home
                </button>
              </div>
            </div>


          <div className="flex flex-col gap-6">
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
              <div className="mb-5 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark ? "border-slate-700/70 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                  <Zap className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Daily Quota</p>
                  <h2 className="text-lg font-bold">Forge runs</h2>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black uppercase tracking-widest ${labelClass}`}>Usage</span>
                  <span className="text-xs font-bold">{userRole === 'super' ? 'Unlimited' : `${forgeUsage}/${forgeLimit}`}</span>
                </div>
                {userRole !== 'super' ? (
                  <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (forgeUsage / forgeLimit) * 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500"
                    />
                  </div>
                ) : (
                  <div className="h-2 w-full rounded-full bg-linear-to-r from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
                )}
                <p className={`text-[10px] font-medium leading-relaxed ${mutedClass}`}>
                  {userRole === 'super' 
                    ? "You have granted unlimited access to Vlyxir Forge. Happy coding, Daksh." 
                    : `Your daily quota of ${forgeLimit} runs resets every day at 00:00 UTC.`}
                </p>
              </div>
            </div>

            {aiLimit > 0 && (
              <div className={`rounded-4xl border p-6 backdrop-blur-2xl ${surfaceClass}`}>
                <div className="mb-5 flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark ? "border-slate-700/70 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${mutedClass}`}>Daily Quota</p>
                    <h2 className="text-lg font-bold">Insights runs</h2>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black uppercase tracking-widest ${labelClass}`}>Usage</span>
                    <span className="text-xs font-bold">{userRole === 'super' ? 'Unlimited' : `${aiUsage}/${aiLimit}`}</span>
                  </div>
                  {userRole !== 'super' ? (
                    <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (aiUsage / aiLimit) * 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-500"
                      />
                    </div>
                  ) : (
                    <div className="h-2 w-full rounded-full bg-linear-to-r from-cyan-400 via-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]" />
                  )}
                  <p className={`text-[10px] font-medium leading-relaxed ${mutedClass}`}>
                    {userRole === 'super' 
                      ? "You have granted unlimited access to Vlyxir Insights. Analyze as much as you want." 
                      : `Your daily quota of ${aiLimit} analysis runs resets every day at 00:00 UTC.`}
                  </p>
                </div>
              </div>
            )}

            <div className={`flex-1 rounded-4xl border p-6 backdrop-blur-2xl ${surfaceClass}`}>
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
                On this page, you can customize your public profile information. This includes your 
                <span className="font-bold text-indigo-500"> full name</span>, 
                <span className="font-bold text-indigo-500"> username</span>, 
                <span className="font-bold text-indigo-500"> bio</span>, and 
                <span className="font-bold text-indigo-500"> country</span>.
                <br /><br />
                Sensitive account details like your registered email and password are managed 
                through our secure authentication flow and cannot be modified directly here.
              </p>
            </div>

            {/* Danger Zone Section */}
            <div className={`rounded-4xl border p-6 backdrop-blur-2xl ${isDark ? "border-rose-950 bg-rose-950/15" : "border-rose-100 bg-rose-50/20"}`}>
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark ? "border-rose-800/40 bg-rose-900/20" : "border-rose-200 bg-white"}`}>
                  <Trash2 className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] text-rose-500/60`}>Danger Zone</p>
                  <h2 className="text-lg font-bold text-rose-500">Danger Zone</h2>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className={`text-sm leading-relaxed ${isDark ? "text-rose-200/60" : "text-rose-700/70"}`}>
                  Deleting your account is permanent. All your progress, submissions, and profile data will be removed forever.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/account-controls')}
                  className="group flex items-center gap-2 text-xs font-bold text-rose-500 transition-colors hover:text-rose-600"
                >
                  <span>Go to account controls</span>
                  <ArrowLeft className="h-3 w-3 rotate-180 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
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
      </div>
    </div>
  );
}
