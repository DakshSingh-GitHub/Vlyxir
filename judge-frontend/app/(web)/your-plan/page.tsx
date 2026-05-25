"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Crown, 
    Zap, 
    BrainCircuit, 
    Shield, 
    ArrowRight, 
    CheckCircle2, 
    Sparkles,
    Terminal,
    LayoutGrid,
    History,
    ChevronRight,
    ArrowLeft,
    Cpu,
    Lock,
    Globe,
    Info,
    RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/auth-context";
import { checkForgeLimit, checkAiLimit } from "../../lib/api/forge-limits";
import { useAppContext } from "../../lib/auth/context";

interface PlanDetails {
    plan: string;
    tier: number;
    limit: number;
    aiLimit: number;
    count: number;
    aiCount: number;
}

export default function YourPlanPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { isDark } = useAppContext();
    const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchPlan = async () => {
        if (user) {
            try {
                const [details, aiDetails] = await Promise.all([
                    checkForgeLimit(user.id),
                    checkAiLimit(user.id)
                ]);
                
                setPlanDetails({
                    plan: details.plan || 'free',
                    tier: details.tier || 0,
                    limit: details.limit,
                    aiLimit: details.aiLimit,
                    count: details.count || 0,
                    aiCount: aiDetails.count || 0
                });
            } catch (error) {
                console.error("Failed to fetch plan stats:", error);
            } finally {
                setLoading(false);
                setIsRefreshing(false);
            }
        } else if (!authLoading) {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPlan();
    }, [user, authLoading]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchPlan();
    };

    if (loading || authLoading) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 relative overflow-hidden ${
                isDark ? "bg-[#0B0C15]" : "bg-slate-50"
            }`}>
                {/* Background Blobs */}
                <div className="absolute top-[25%] left-[25%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[25%] right-[25%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />
                
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="relative flex items-center justify-center">
                        <div className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                        <div className="absolute w-12 h-12 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin animate-reverse" />
                        <Cpu className={`absolute w-6 h-6 ${isDark ? "text-indigo-400" : "text-indigo-600"} animate-pulse`} />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className={`text-lg font-black tracking-wider uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
                            Syncing Telemetry
                        </h3>
                        <p className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"} animate-pulse`}>
                            Querying Vlyxir Cloud Infrastructure...
                        </p>
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
                {/* Cyber backdrop */}
                <div className="absolute top-[10%] left-[10%] w-[60%] h-[60%] bg-rose-500/5 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute bottom-[10%] right-[10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`max-w-md w-full p-8 md:p-10 rounded-[32px] border backdrop-blur-2xl shadow-2xl relative z-10 ${
                        isDark ? "border-rose-500/20 bg-black/40" : "border-slate-200 bg-white/90"
                    }`}
                >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 ring-4 ring-rose-500/10">
                            <Shield className="w-8 h-8 text-white animate-pulse" />
                        </div>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                        <span className="text-[10px] tracking-widest font-black uppercase text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                            Security Core AccessDenied
                        </span>
                        <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                            Access Restricted
                        </h1>
                        <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            Your developer telemetry, active forge limit counters, and logic insights reports are locked behind terminal clearance.
                        </p>
                    </div>

                    <div className="h-px bg-linear-to-r from-transparent via-slate-500/20 to-transparent my-8" />

                    <button 
                        onClick={() => router.push('/login')}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-black text-sm tracking-widest uppercase transition-all duration-300 shadow-xl shadow-indigo-650/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                        Sign In to Access Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    const isPro = planDetails?.plan === 'pro';
    const tierName = planDetails?.tier === 3 ? "Tier 3" : planDetails?.tier === 2 ? "Tier 2" : "Tier 1";
    const forgeUsagePercent = planDetails ? Math.min((planDetails.count / planDetails.limit) * 100, 100) : 0;
    const aiUsagePercent = planDetails && planDetails.aiLimit > 0 
        ? Math.min((planDetails.aiCount / planDetails.aiLimit) * 100, 100) 
        : 0;

    return (
        <div className={`min-h-screen w-full transition-colors duration-500 p-4 sm:p-8 lg:p-12 relative overflow-hidden ${
            isDark ? "bg-[#0B0C15] text-white" : "bg-slate-50 text-slate-900"
        }`}>
            {/* Immersive mesh backgrounds */}
            <div className="absolute top-[-25%] right-[-10%] w-[70%] h-[70%] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08] rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-25%] left-[-10%] w-[70%] h-[70%] bg-purple-500/[0.04] dark:bg-purple-500/[0.08] rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute top-[30%] left-[20%] w-[50%] h-[50%] bg-cyan-500/[0.02] dark:bg-cyan-500/[0.04] rounded-full blur-[180px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Navigation and Actions Row */}
                <div className="flex items-center justify-between mb-10">
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
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`flex items-center gap-2 py-2 px-4 rounded-xl border transition-all duration-300 text-xs font-black uppercase tracking-wider ${
                            isRefreshing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        } ${
                            isDark 
                                ? "text-indigo-400 border-indigo-500/10 bg-indigo-500/[0.03] hover:text-indigo-300 hover:border-indigo-500/20 hover:bg-indigo-500/[0.06]" 
                                : "text-indigo-600 border-indigo-200 bg-indigo-50 hover:text-indigo-700 hover:border-indigo-350 shadow-xs"
                        }`}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform"}`} />
                        <span>{isRefreshing ? "Refreshing..." : "Sync Cloud"}</span>
                    </button>
                </div>

                {/* Cyber Header & Badge Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-center">
                    <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                                isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-650"
                            }`}>
                                Infrastructure Telemetry
                            </span>
                            <div className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-350"}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-550"}`}>
                                node.vlyxir-us-east
                            </span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
                            System <span className={`text-transparent bg-clip-text bg-linear-to-r ${
                                isDark ? "from-indigo-400 via-purple-400 to-cyan-400" : "from-indigo-600 via-purple-600 to-cyan-600"
                            }`}>Allocation</span>
                        </h1>
                        <p className={`text-sm sm:text-base font-bold leading-relaxed max-w-xl ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                            Review active server allocations, compiler execution pools, daily execution quotas, and AI-powered logic optimization capabilities.
                        </p>
                    </div>
                    
                    <div className="lg:col-span-5">
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className={`p-6 rounded-[32px] border relative overflow-hidden backdrop-blur-xl group ${
                                isPro 
                                    ? "border-amber-500/30 bg-gradient-to-br from-amber-500/[0.08] to-transparent dark:from-amber-500/[0.04]" 
                                    : isDark 
                                        ? "border-slate-800 bg-slate-900/40" 
                                        : "border-slate-200 bg-white shadow-md hover:shadow-lg"
                            }`}
                        >
                            {/* Inner ambient glows */}
                            {isPro && (
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none animate-pulse" />
                            )}

                            <div className="flex items-center gap-5 relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                                    isPro 
                                        ? "bg-amber-500/20 border-amber-400/30 text-amber-500 dark:text-amber-400 shadow-lg shadow-amber-500/10" 
                                        : isDark 
                                            ? "bg-slate-800/80 border-slate-700/50 text-slate-400" 
                                            : "bg-slate-100 border-slate-200 text-slate-650"
                                }`}>
                                    {isPro ? (
                                        <Crown className="w-7 h-7 text-amber-500 dark:text-amber-400 animate-pulse" />
                                    ) : (
                                        <Terminal className="w-7 h-7" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isPro ? "text-amber-500 dark:text-amber-400" : "text-slate-500"}`}>
                                        Active Clearance Level
                                    </span>
                                    <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {isPro ? `Vlyxir Pro (${tierName})` : "Vlyxir Free"}
                                    </h2>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Dashboard Metrics Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    
                    {/* Forge Telemetry Card */}
                    <motion.div 
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`p-6 sm:p-8 rounded-[40px] border backdrop-blur-2xl relative overflow-hidden transition-shadow duration-300 ${
                            isDark ? "border-white/[0.07] bg-white/[0.03]" : "border-slate-200 bg-white hover:shadow-xl shadow-md"
                        }`}
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
                        
                        <div className="flex flex-col h-full justify-between gap-8 relative z-10">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                                            isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-600"
                                        }`}>
                                            <Zap className="w-6 h-6 animate-pulse" />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                                Vlyxir Forge
                                            </h3>
                                            <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? "text-indigo-400" : "text-indigo-650"}`}>
                                                DAILY EXECUTION CORES
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <span className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                            {planDetails?.count}
                                        </span>
                                        <span className={`text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                            {" "}/ {planDetails?.limit === Infinity ? "∞" : planDetails?.limit}
                                        </span>
                                    </div>
                                </div>

                                {/* Custom Glowing Gauge Track */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        <span>Submissions Quota</span>
                                        <span className={isDark ? "text-indigo-400" : "text-indigo-650"}>
                                            {Math.round(forgeUsagePercent)}% Consumed
                                        </span>
                                    </div>
                                    <div className={`h-3 w-full rounded-full overflow-hidden border p-0.5 ${
                                        isDark ? "bg-slate-950/80 border-white/5" : "bg-slate-100 border-slate-200"
                                    }`}>
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${forgeUsagePercent}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full shadow-lg shadow-indigo-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Features list */}
                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                                    ACTIVE ALLOCATIONS
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? "text-slate-350" : "text-slate-700"}`}>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span>Daily Reset 00:00 UTC</span>
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? "text-slate-350" : "text-slate-700"}`}>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span>Isolated Execution Core</span>
                                    </div>
                                    {isPro ? (
                                        <>
                                            <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? "text-slate-350" : "text-slate-700"}`}>
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                <span>Priority Compilation</span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? "text-slate-350" : "text-slate-700"}`}>
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                <span>Custom Compiler Flags</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className={`flex items-center gap-2 text-xs font-bold opacity-60 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                                                <Lock className="w-3.5 h-3.5 shrink-0" />
                                                <span>Standard Compilation</span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-xs font-bold opacity-60 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                                                <Lock className="w-3.5 h-3.5 shrink-0" />
                                                <span>Shared Execution Core</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Insights Telemetry Card */}
                    <motion.div 
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`p-6 sm:p-8 rounded-[40px] border backdrop-blur-2xl relative overflow-hidden transition-shadow duration-300 ${
                            isDark ? "border-white/[0.07] bg-white/[0.03]" : "border-slate-200 bg-white hover:shadow-xl shadow-md"
                        }`}
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
                        
                        <div className="flex flex-col h-full justify-between gap-8 relative z-10">
                            {planDetails?.aiLimit && planDetails.aiLimit > 0 ? (
                                <>
                                    {/* Unlocked Interface */}
                                    <div className="flex flex-col h-full justify-between gap-8">
                                        <div>
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                                                        isDark ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "bg-purple-50 border-purple-100 text-purple-600"
                                                    }`}>
                                                        <BrainCircuit className="w-6 h-6 animate-pulse" />
                                                    </div>
                                                    <div>
                                                        <h3 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                                            Vlyxir Insights
                                                        </h3>
                                                        <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? "text-purple-400" : "text-purple-650"}`}>
                                                            COGNITIVE STRUCTURAL SANITY
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right">
                                                    <span className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                                        {planDetails.aiCount}
                                                    </span>
                                                    <span className={`text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                                        {" "}/ {planDetails.aiLimit === Infinity ? "∞" : planDetails.aiLimit}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* AI Progress Bar */}
                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
                                                    <span>Reports Quota</span>
                                                    <span className={isDark ? "text-purple-400" : "text-purple-650"}>
                                                        {Math.round(aiUsagePercent)}% Consumed
                                                    </span>
                                                </div>
                                                <div className={`h-3 w-full rounded-full overflow-hidden border p-0.5 ${
                                                    isDark ? "bg-slate-950/80 border-white/5" : "bg-slate-100 border-slate-200"
                                                }`}>
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${aiUsagePercent}%` }}
                                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-400 rounded-full shadow-lg shadow-purple-500/20"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Subsystems */}
                                        <div className="space-y-4">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                                                ACTIVE COGNITIVE MODULES
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? "text-slate-350" : "text-slate-700"}`}>
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    <span>Static Findings Engine</span>
                                                </div>
                                                <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? "text-slate-350" : "text-slate-700"}`}>
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    <span>Code Complexity Review</span>
                                                </div>
                                                {planDetails.tier >= 3 ? (
                                                    <>
                                                        <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? "text-slate-350" : "text-slate-700"}`}>
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                            <span>Vulnerability Scanners</span>
                                                        </div>
                                                        <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? "text-slate-350" : "text-slate-700"}`}>
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                            <span>Logic Refactor Reports</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className={`flex items-center gap-2 text-xs font-bold opacity-60 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                                                            <Lock className="w-3.5 h-3.5 shrink-0" />
                                                            <span>Vulnerability Scanners</span>
                                                        </div>
                                                        <div className={`flex items-center gap-2 text-xs font-bold opacity-60 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                                                            <Lock className="w-3.5 h-3.5 shrink-0" />
                                                            <span>Refactor Engine (T3 Only)</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Locked Interface */}
                                    <div className="flex flex-col justify-between h-full gap-8">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                                                isDark ? "bg-slate-800/80 border-slate-700/50 text-slate-550" : "bg-slate-100 border-slate-200 text-slate-400"
                                            }`}>
                                                <BrainCircuit className="w-6 h-6 opacity-40" />
                                            </div>
                                            <div>
                                                <h3 className={`text-lg font-black tracking-tight opacity-40 ${isDark ? "text-white" : "text-slate-900"}`}>
                                                    Vlyxir Insights
                                                </h3>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                    COGNITIVE MODULE OFFLINE
                                                </p>
                                            </div>
                                        </div>

                                        <div className={`p-6 rounded-3xl border border-dashed text-center flex flex-col items-center justify-center gap-3 ${
                                            isDark ? "bg-black/[0.15] border-white/5" : "bg-slate-50/50 border-slate-200"
                                        }`}>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                isDark ? "bg-white/[0.02] text-slate-500" : "bg-slate-100 text-slate-400"
                                            }`}>
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className={`text-sm font-bold ${isDark ? "text-slate-350" : "text-slate-800"}`}>
                                                    Insights Capabilities Locked
                                                </h4>
                                                <p className={`text-xs leading-relaxed max-w-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                                                    Activate neural code insights, security scans, and optimal runtime analysis by upgrading your server clearance.
                                                </p>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => router.push('/upgrade-tiers')}
                                            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                                                isDark 
                                                    ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/[0.05] hover:bg-indigo-500/[0.08] hover:border-indigo-500/30" 
                                                    : "text-indigo-650 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 shadow-sm"
                                            }`}
                                        >
                                            Unlock Cognitive Telemetry
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>

                </div>

                {/* Cyber Action Center */}
                <div className="space-y-6 mb-12">
                    <div className="flex items-center gap-2">
                        <Sparkles className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-650"}`} />
                        <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                            Telemetry Action Center
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Action 1: Upgrade */}
                        <motion.div 
                            whileHover={{ y: -3 }}
                            onClick={() => router.push('/upgrade-tiers')}
                            className={`p-6 rounded-3xl border transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-52 ${
                                isDark 
                                    ? "border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] hover:border-indigo-500/20" 
                                    : "border-slate-200 bg-slate-100/30 hover:bg-white hover:border-indigo-300 shadow-xs hover:shadow-md"
                            }`}
                        >
                            <div className="space-y-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                                    isDark 
                                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/20" 
                                        : "bg-indigo-50 border-indigo-150 text-indigo-650 group-hover:bg-indigo-100"
                                }`}>
                                    <Cpu className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h5 className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                        Elevate Infrastructure
                                    </h5>
                                    <p className={`text-xs leading-relaxed ${isDark ? "text-slate-500" : "text-slate-550"}`}>
                                        View professional tiers comparisons to unlock dedicated memory and execution parameters.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest mt-6 text-indigo-500 dark:text-indigo-400">
                                <span>Upgrade Tiers</span>
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>

                        {/* Action 2: Documentation */}
                        <motion.div 
                            whileHover={{ y: -3 }}
                            onClick={() => router.push('/docs')}
                            className={`p-6 rounded-3xl border transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-52 ${
                                isDark 
                                    ? "border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] hover:border-purple-500/20" 
                                    : "border-slate-200 bg-slate-100/30 hover:bg-white hover:border-purple-300 shadow-xs hover:shadow-md"
                            }`}
                        >
                            <div className="space-y-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                                    isDark 
                                        ? "bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20" 
                                        : "bg-purple-50 border-purple-150 text-purple-650 group-hover:bg-purple-100"
                                }`}>
                                    <Terminal className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h5 className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                        Technical Guidelines
                                    </h5>
                                    <p className={`text-xs leading-relaxed ${isDark ? "text-slate-500" : "text-slate-550"}`}>
                                        Review technical boundaries, API structures, compile limits, and runtime requirements.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest mt-6 text-purple-500 dark:text-purple-400">
                                <span>Read Specs</span>
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>

                        {/* Action 3: Forums */}
                        <motion.div 
                            whileHover={{ y: -3 }}
                            onClick={() => router.push('/forum')}
                            className={`p-6 rounded-3xl border transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-52 ${
                                isDark 
                                    ? "border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-500/20" 
                                    : "border-slate-200 bg-slate-100/30 hover:bg-white hover:border-cyan-300 shadow-xs hover:shadow-md"
                            }`}
                        >
                            <div className="space-y-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                                    isDark 
                                        ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/20" 
                                        : "bg-cyan-50 border-cyan-150 text-cyan-650 group-hover:bg-cyan-100"
                                }`}>
                                    <LayoutGrid className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h5 className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                        Developer Alliance
                                    </h5>
                                    <p className={`text-xs leading-relaxed ${isDark ? "text-slate-500" : "text-slate-550"}`}>
                                        Engage with other developers, share benchmarks, and solve high-performance challenges.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest mt-6 text-cyan-500 dark:text-cyan-400">
                                <span>Enter Portal</span>
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>

                    </div>
                </div>

                {/* Telemetry Information Box */}
                <div className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-4 ${
                    isDark ? "bg-indigo-500/[0.02] border-indigo-500/10" : "bg-indigo-50/30 border-indigo-100/80"
                }`}>
                    <Info className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                    <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                        Execution units represent computation limits optimized to prevent server overload. Daily allocations reset strictly at <strong>00:00 UTC</strong>. High priority and heavy workload requests may require scaling up execution memory cores. For assistance or enterprise queries, contact tech support directly.
                    </p>
                </div>
            </div>

            {/* Footer Telemetry Decoration */}
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
    );
}
