"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Zap, 
    Shield, 
    Sparkles, 
    Crown, 
    Check, 
    X, 
    Construction, 
    ArrowLeft,
    Cpu,
    BrainCircuit,
    Terminal,
    Globe,
    ChevronRight,
    HelpCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../../lib/auth/context";
import { useAuth } from "../../lib/auth/auth-context";
import { checkForgeLimit } from "../../lib/api/forge-limits";

const TIERS = [
    {
        id: "free",
        name: "Free",
        description: "Unlimited client-side Python execution powered by WebAssembly.",
        forgeSubmissions: "Unlimited",
        aiInsights: null,
        features: [
            "Unlimited Forge Execution (WASM)",
            "Auto Package Loading (numpy, pandas)",
            "Sub-Millisecond Client Execution",
            "Single-File Playground Workspace",
            "Problems on Arena",
            "Public Forums Access",
            "1v1 Duel & Join Interviews",
            "Community Support"
        ],
        icon: Terminal,
        color: "text-slate-400 dark:text-slate-350",
        borderGlow: "group-hover:border-slate-500/30",
        bgGlow: "bg-slate-500/[0.03]",
        accentBg: "bg-slate-500/10 border-slate-500/20"
    },
    {
        id: "tier1",
        name: "Pro Tier 1",
        description: "Boost your developer workflow with unlimited WASM and early features.",
        forgeSubmissions: "Unlimited",
        aiInsights: null,
        features: [
            "Unlimited Forge Execution (WASM)",
            "Auto Package Loading (numpy, pandas)",
            "Extended Timeout Watchdog",
            "Private Leaderboard & Stats",
            "Early Access Features & New UIs",
            "1v1 Duel & Join Interviews",
            "Priority Community Badge"
        ],
        icon: Zap,
        color: "text-blue-500 dark:text-blue-400",
        borderGlow: "group-hover:border-blue-500/30",
        bgGlow: "bg-blue-500/[0.03]",
        accentBg: "bg-blue-500/10 border-blue-500/20",
        recommended: false
    },
    {
        id: "tier2",
        name: "Pro Tier 2",
        description: "Unleash the power of AI-assisted coding and multi-file projects.",
        forgeSubmissions: "Unlimited",
        aiInsights: 10,
        features: [
            "Unlimited Forge Execution (WASM)",
            "Multi-File Project Workspace Tree",
            "10 Daily AI Insights",
            "Static Findings & Complexity Analysis",
            "Early Access Features & New UIs",
            "Host & Conduct Technical Interviews",
            "Priority Support"
        ],
        icon: BrainCircuit,
        color: "text-indigo-500 dark:text-indigo-400",
        borderGlow: "group-hover:border-indigo-500/40",
        bgGlow: "bg-indigo-500/[0.04]",
        accentBg: "bg-indigo-500/10 border-indigo-500/20",
        recommended: true
    },
    {
        id: "tier3",
        name: "Pro Tier 3",
        description: "The ultimate platform for professional developers and power users.",
        forgeSubmissions: "Unlimited",
        aiInsights: 20,
        features: [
            "Unlimited Forge Execution (WASM)",
            "Multi-File Project Workspace Tree",
            "20 Daily AI Insights",
            "Model Selection Choice & Priority AI",
            "Security Vulnerability Scans",
            "Logic Optimization Reports",
            "Improvement Roadmap & Reference Code",
            "Direct Technical Priority Support",
            "Host & Conduct Technical Interviews"
        ],
        icon: Crown,
        color: "text-amber-500 dark:text-amber-400",
        borderGlow: "group-hover:border-amber-500/40",
        bgGlow: "bg-amber-500/[0.04]",
        accentBg: "bg-amber-500/10 border-amber-500/20"
    }
];

const COMPARISON_FEATURES = [
    { name: "Problems on Arena", free: true, tier1: true, tier2: true, tier3: true },
    { name: "Test Cases on problems", free: true, tier1: true, tier2: true, tier3: true },  
    { name: "Test Cases / problem", free: "80-160", tier1: "80-160", tier2: "80-160", tier3: "80-160" }, 
    { name: "Vlyxir Forge Engine", free: "Client WASM", tier1: "Client WASM", tier2: "Client WASM", tier3: "Client WASM" },
    { name: "Forge Python Executions", free: "Unlimited", tier1: "Unlimited", tier2: "Unlimited", tier3: "Unlimited" },
    { name: "Zero-Latency Client Compute", free: true, tier1: true, tier2: true, tier3: true },
    { name: "Auto Package Loading (numpy, etc.)", free: true, tier1: true, tier2: true, tier3: true },
    { name: "Public Forums Access", free: true, tier1: true, tier2: true, tier3: true },
    { name: "Community Support", free: true, tier1: true, tier2: true, tier3: true },
    { name: "1v1 Duel", free: true, tier1: true, tier2: true, tier3: true },
    { name: "Join Interviews", free: true, tier1: true, tier2: true, tier3: true },
    { name: "Private Leaderboard", free: false, tier1: true, tier2: true, tier3: true },
    { name: "Early Access to new UIs", free: false, tier1: true, tier2: true, tier3: true },
    { name: "Early Access Features", free: false, tier1: true, tier2: true, tier3: true },
    { name: "Multi-File Project Workspace", free: false, tier1: false, tier2: true, tier3: true },
    { name: "Host Interview", free: false, tier1: false, tier2: true, tier3: true },
    { name: "Vlyxir Insights", free: false, tier1: false, tier2: true, tier3: true },
    { name: "AI Insights / day", free: "N/A", tier1: "N/A", tier2: "10", tier3: "20" },
    { name: "Complexity Analysis", free: false, tier1: false, tier2: true, tier3: true },
    { name: "Static Findings", free: false, tier1: false, tier2: true, tier3: true },
    { name: "Security Audit", free: false, tier1: false, tier2: false, tier3: true },
    { name: "Logic Optimization", free: false, tier1: false, tier2: false, tier3: true },
    { name: "Improvement Roadmap", free: false, tier1: false, tier2: false, tier3: true },
    { name: "Model Selection choice", free: false, tier1: false, tier2: false, tier3: true },
    { name: "Direct Technical Support", free: false, tier1: false, tier2: false, tier3: true },
    { name: "Priority Support", free: false, tier1: false, tier2: true, tier3: true },
];

export default function UpgradeTiersPage() {
    const router = useRouter();
    const { isDark } = useAppContext();
    const { user } = useAuth();
    const [currentTierId, setCurrentTierId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserTier = async () => {
            if (user) {
                try {
                    const details = await checkForgeLimit(user.id);
                    if (details.plan === 'pro') {
                        setCurrentTierId(`tier${details.tier}`);
                    } else {
                        setCurrentTierId('free');
                    }
                } catch (err) {
                    console.error("Error fetching user tier:", err);
                    setCurrentTierId('free');
                }
            }
        };
        fetchUserTier();
    }, [user]);

    return (
        <div className={`min-h-screen w-full transition-colors duration-500 ${
            isDark ? "bg-[#0B0C15] text-white" : "bg-slate-50 text-slate-900"
        } p-4 sm:p-8 lg:p-12 font-sans relative overflow-hidden`}>
            
            {/* Ambient visual background lighting */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.07] rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/[0.04] dark:bg-purple-500/[0.07] rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-[40%] right-[30%] w-[40%] h-[40%] bg-cyan-500/[0.02] dark:bg-cyan-500/[0.03] rounded-full blur-[180px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                    <div>
                        <button 
                            onClick={() => router.back()}
                            className={`flex items-center gap-2 py-2 px-4 rounded-xl border transition-all duration-300 group text-xs font-black uppercase tracking-wider mb-6 ${
                                isDark 
                                    ? "text-slate-400 border-white/5 bg-white/[0.02] hover:text-white hover:border-white/10 hover:bg-white/[0.04]" 
                                    : "text-slate-650 border-slate-200 bg-white hover:text-slate-900 hover:border-slate-300 shadow-xs"
                            }`}
                        >
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                            <span>Back to Plan</span>
                        </button>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-4">
                            Elevate your <span className={`text-transparent bg-clip-text bg-linear-to-r ${
                                isDark ? "from-indigo-400 via-purple-400 to-cyan-400" : "from-indigo-600 via-purple-600 to-cyan-600"
                            }`}>Vlyxir Power</span>
                        </h1>
                        <p className={`text-sm sm:text-base font-bold leading-relaxed max-w-2xl ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                            Unlock dedicated server pools, expand compile thresholds, and deploy state-of-the-art cognitive AI logic audit engines.
                        </p>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-black uppercase tracking-wider animate-pulse self-start md:self-auto ${
                        isDark ? "border-indigo-500/20 bg-indigo-500/5 text-indigo-400" : "border-indigo-200 bg-indigo-50 text-indigo-600"
                    }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>pricing updates pending release</span>
                    </div>
                </div>

                {/* Tier Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                    {TIERS.map((tier, idx) => {
                        const isCurrentTier = currentTierId === tier.id;
                        return (
                            <motion.div
                                key={tier.id}
                                initial={{ opacity: 0, y: 25 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.4 }}
                                whileHover={{ y: -6 }}
                                className={`relative group p-6 sm:p-7 rounded-[36px] border transition-all duration-300 flex flex-col justify-between ${
                                    tier.recommended 
                                    ? "border-indigo-500/50 dark:border-indigo-500/70 bg-gradient-to-br from-indigo-500/[0.08] via-transparent to-transparent dark:from-indigo-500/[0.05] shadow-2xl shadow-indigo-500/10 dark:shadow-none scale-105 z-10" 
                                    : isDark
                                        ? "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                                        : "border-slate-200 bg-white hover:shadow-xl shadow-md"
                                } ${tier.borderGlow}`}
                            >
                                {tier.recommended && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-650 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
                                        Recommended
                                    </div>
                                )}

                                {/* Outer Ambient card glow */}
                                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] pointer-events-none opacity-40 transition-opacity duration-300 group-hover:opacity-80 ${tier.bgGlow}`} />

                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${tier.accentBg}`}>
                                            <tier.icon className={`w-6 h-6 ${tier.color}`} />
                                        </div>
                                        <div>
                                            {isCurrentTier ? (
                                                <span className="text-[9px] px-2.5 py-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-black uppercase tracking-wider block text-center">
                                                    Active Plan
                                                </span>
                                            ) : (
                                                <span className={`text-[8px] px-2 py-0.5 rounded-md border font-black uppercase tracking-wider block text-center ${
                                                    isDark ? "border-white/5 bg-white/5 text-slate-500" : "border-slate-200 bg-slate-100/80 text-slate-500"
                                                }`}>
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                            {tier.name}
                                        </h3>
                                        <p className={`text-xs leading-relaxed min-h-12 ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                                            {tier.description}
                                        </p>
                                    </div>

                                    <div className="h-px bg-linear-to-r from-transparent via-slate-500/10 to-transparent" />

                                    {/* Features Checklist */}
                                    <div className="space-y-3.5">
                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
                                            Clearance features
                                        </span>
                                        <div className="space-y-3 min-h-64">
                                            {tier.features.map((feature, fIdx) => (
                                                <div key={fIdx} className="flex items-start gap-2.5 text-xs font-bold">
                                                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-0.5">
                                                        <Check className="w-2.5 h-2.5 text-emerald-555 dark:text-emerald-450" />
                                                    </div>
                                                    <span className={isDark ? "text-slate-350" : "text-slate-700"}>
                                                        {feature}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 relative z-10">
                                    {isCurrentTier ? (
                                        <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
                                            <Check className="w-4 h-4" />
                                            Active System Alloc
                                        </div>
                                    ) : (
                                        <div className={`flex items-center justify-center gap-2 py-3 rounded-2xl border font-black text-xs uppercase tracking-wider cursor-not-allowed transition-all duration-300 ${
                                            isDark 
                                                ? "bg-white/[0.03] border-white/5 text-slate-500 group-hover:bg-white/[0.06] group-hover:text-slate-400" 
                                                : "bg-slate-100 border-slate-200 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500 shadow-sm"
                                        }`}>
                                            <Construction className="w-4 h-4" />
                                            Coming Soon
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Telemetry Spec Matrix Console */}
                <div className="mb-24">
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                            isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-600"
                        }`}>
                            <Shield className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                Specifications Console
                            </h2>
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">
                                COMPLETE COGNITIVE & EXECUTION MATRIX
                            </p>
                        </div>
                    </div>

                    <div className={`overflow-x-auto rounded-[32px] border backdrop-blur-xl shadow-2xl dark:shadow-none ${
                        isDark ? "border-white/[0.07] bg-white/[0.03]" : "border-slate-200 bg-white"
                    }`}>
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className={`border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
                                    <th className={`p-6 font-black uppercase tracking-widest text-[10px] ${isDark ? "text-slate-500" : "text-slate-450"}`}>
                                        Developer Specification Parameters
                                    </th>
                                    <th className={`p-6 text-center font-black text-xs uppercase tracking-wider ${isDark ? "text-slate-350" : "text-slate-700"}`}>
                                        Free
                                    </th>
                                    <th className={`p-6 text-center font-black text-xs uppercase tracking-wider ${isDark ? "text-blue-400" : "text-blue-650"}`}>
                                        Tier 1
                                    </th>
                                    <th className={`p-6 text-center font-black text-xs uppercase tracking-wider bg-slate-100/30 dark:bg-white/[0.01] ${isDark ? "text-indigo-400" : "text-indigo-650"}`}>
                                        Tier 2
                                    </th>
                                    <th className={`p-6 text-center font-black text-xs uppercase tracking-wider ${isDark ? "text-amber-400" : "text-amber-650"}`}>
                                        Tier 3
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARISON_FEATURES.map((feature, idx) => (
                                    <tr key={idx} className={`border-b transition-colors ${
                                        isDark 
                                            ? "border-white/[0.04] hover:bg-white/[0.03]" 
                                            : "border-slate-100 hover:bg-slate-50"
                                    }`}>
                                        <td className={`p-6 text-xs font-black tracking-wide ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                                            {feature.name}
                                        </td>
                                        
                                        {/* Free Column */}
                                        <td className="p-6 text-center">
                                            {typeof feature.free === 'boolean' ? (
                                                feature.free 
                                                    ? <Check className="w-4.5 h-4.5 text-emerald-500 dark:text-emerald-400 mx-auto drop-shadow-[0_2px_8px_rgba(16,185,129,0.2)]" /> 
                                                    : <X className={`w-4.5 h-4.5 mx-auto opacity-30 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
                                            ) : (
                                                <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-550"}`}>{feature.free}</span>
                                            )}
                                        </td>

                                        {/* Tier 1 Column */}
                                        <td className="p-6 text-center">
                                            {typeof feature.tier1 === 'boolean' ? (
                                                feature.tier1 
                                                    ? <Check className="w-4.5 h-4.5 text-blue-500 dark:text-blue-400 mx-auto drop-shadow-[0_2px_8px_rgba(59,130,246,0.2)]" /> 
                                                    : <X className={`w-4.5 h-4.5 mx-auto opacity-30 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
                                            ) : (
                                                <span className={`text-xs font-black ${isDark ? "text-blue-400" : "text-blue-650"}`}>{feature.tier1}</span>
                                            )}
                                        </td>

                                        {/* Tier 2 Column */}
                                        <td className="p-6 text-center bg-slate-100/[0.15] dark:bg-white/[0.01]">
                                            {typeof feature.tier2 === 'boolean' ? (
                                                feature.tier2 
                                                    ? <Check className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400 mx-auto drop-shadow-[0_2px_8px_rgba(99,102,241,0.2)]" /> 
                                                    : <X className={`w-4.5 h-4.5 mx-auto opacity-30 ${isDark ? "text-slate-650" : "text-slate-400"}`} />
                                            ) : (
                                                <span className={`text-xs font-black ${isDark ? "text-indigo-400" : "text-indigo-650"}`}>{feature.tier2}</span>
                                            )}
                                        </td>

                                        {/* Tier 3 Column */}
                                        <td className="p-6 text-center">
                                            {typeof feature.tier3 === 'boolean' ? (
                                                feature.tier3 
                                                    ? <Check className="w-4.5 h-4.5 text-amber-500 dark:text-amber-400 mx-auto drop-shadow-[0_2px_8px_rgba(245,158,11,0.2)]" /> 
                                                    : <X className={`w-4.5 h-4.5 mx-auto opacity-30 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
                                            ) : (
                                                <span className={`text-xs font-black ${isDark ? "text-amber-400" : "text-amber-650"}`}>{feature.tier3}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cyber FAQs / Tech Specs */}
                <div className="space-y-6 mb-16">
                    <div className="flex items-center gap-2">
                        <HelpCircle className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-650"}`} />
                        <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                            Technical Spec details
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div 
                            whileHover={{ y: -3 }}
                            className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 border-l-4 ${
                                isDark 
                                    ? "bg-linear-to-br from-indigo-500/[0.05] to-transparent border-indigo-500/20 text-white border-l-indigo-500" 
                                    : "bg-linear-to-br from-indigo-50/50 to-transparent border-indigo-200 text-slate-900 border-l-indigo-600 shadow-sm"
                            }`}
                        >
                            <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                                <Zap className="w-4.5 h-4.5" />
                                How does Vlyxir Forge execution work?
                            </h3>
                            <p className={`text-xs sm:text-sm leading-relaxed font-medium ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                                Vlyxir Forge is powered by an in-browser WebAssembly Python runtime (Pyodide in dedicated Web Workers). All tiers, including Free, enjoy unlimited, zero-latency code execution without queueing or server roundtrips. Higher tiers unlock full multi-file project workspace trees, AI code intelligence, and collaborative interview hosting.
                            </p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -3 }}
                            className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 border-l-4 ${
                                isDark 
                                    ? "bg-linear-to-br from-purple-500/[0.05] to-transparent border-purple-500/20 text-white border-l-purple-500" 
                                    : "bg-linear-to-br from-purple-50/50 to-transparent border-purple-200 text-slate-900 border-l-purple-600 shadow-sm"
                            }`}
                        >
                            <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                                <BrainCircuit className="w-4.5 h-4.5" />
                                What are AI Insights?
                            </h3>
                            <p className={`text-xs sm:text-sm leading-relaxed font-medium ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                                AI Insights provide deep structural, security, and complexity reports on your submitted code. Using advanced models, Vlyxir scans logic paths, exposes bugs, and suggests logic patches in real time. T2 and T3 tiers include dedicated daily limits.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Footer Telemetry */}
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
