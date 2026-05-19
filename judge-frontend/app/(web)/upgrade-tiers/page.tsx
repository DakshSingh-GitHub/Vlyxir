"use client";

import React from "react";
import { motion } from "framer-motion";
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
    Terminal
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../../lib/auth/context";
import { useAuth } from "../../lib/auth/auth-context";
import { checkForgeLimit } from "../../lib/api/forge-limits";
import { useState, useEffect } from "react";

const TIERS = [
    {
        id: "free",
        name: "Free",
        description: "Perfect for students and hobbyists getting started.",
        forgeSubmissions: 10,
        aiInsights: null,
        features: [
            "Standard Code Execution",
            "Problems on Arena",
            "Public Forums Access",
            "Vlyxir Forge",
            "Community Support"
        ],
        icon: Terminal,
        color: "text-slate-400",
        glow: "bg-slate-500/10"
    },
    {
        id: "tier1",
        name: "Pro Tier 1",
        description: "Boost your productivity with higher limits.",
        forgeSubmissions: 25,
        aiInsights: null,
        features: [
            "Increased Forge Quota",
            "Private Leaderboard",
            "Early Access Features",
            "Early Access to new UIs",
        ],
        icon: Zap,
        color: "text-blue-400",
        glow: "bg-blue-500/10",
        recommended: false
    },
    {
        id: "tier2",
        name: "Pro Tier 2",
        description: "Unleash the power of AI-assisted coding.",
        forgeSubmissions: 40,
        aiInsights: 10,
        features: [
            "Higher Execution Quota",
            "10 Daily AI Insights",
            "Static Findings",
            "Code Complexity Analysis",
            "Early Access Features",
            "Early Access to new UIs",
        ],
        icon: BrainCircuit,
        color: "text-indigo-400",
        glow: "bg-indigo-500/10",
        recommended: true
    },
    {
        id: "tier3",
        name: "Pro Tier 3",
        description: "The ultimate platform for professional developers.",
        forgeSubmissions: 100,
        aiInsights: 20,
        features: [
            "Maximum Forge Quota",
            "20 Daily AI Insights",
            "Model Selection choice between Gemini and Groq models",
            "Direct Technical Support",
            "Security Vulnerability Scans",
            "Logic Optimization Reports",
            "Early Access Features",
            "Improvement Roadmap",
            "Recommended Reference Code",
            "Priority Support"
        ],
        icon: Crown,
        color: "text-amber-400",
        glow: "bg-amber-500/10"
    }
];

const COMPARISON_FEATURES = [
    { name: "Problems on Arena", free: true, tier1: true, tier2: true, tier3: true },
    { name: "Test Cases on problems", free:true, tier1:true, tier2:true, tier3:true },  
    { name: "Test Cases / problem", free: "80-160", tier1:"80-160", tier2:"80-160", tier3:"80-160" }, 
    { name: "Vlyxir Forge", free: true, tier1: true, tier2: true, tier3: true },
    { name: "Forge Submissions / day", free: "10", tier1: "25", tier2: "40", tier3: "100" },
    { name: "Public Forums Access", free: true, tier1: true, tier2: true, tier3: true },
    { name: "Community Support", free:true, tier1:true, tier2:true, tier3:true },
    { name: "Private Leaderboard", free:false, tier1:true, tier2:true, tier3:true },
    { name: "Early Access to new UIs", free: false, tier1: true, tier2: true, tier3: true },
    { name: "Early Access Features", free: false, tier1: true, tier2: true, tier3: true },
    { name: "Vlyxir Insights", free: false, tier1: false, tier2: true, tier3: true },
    { name: "AI Insights / day", free: "N/A", tier1: "N/A", tier2: "10", tier3: "20" },
    { name: "Complexity Analysis", free: false, tier1:false, tier2:true, tier3:true },
    { name: "Static Findings", free: false, tier1:false, tier2:true, tier3:true },
    { name: "Security Audit", free: false, tier1: false, tier2:false, tier3:true },
    { name: "Logic Optimization", free: false, tier1: false, tier2:false, tier3:true },
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
        <div className={`min-h-screen w-full transition-colors duration-500 ${isDark ? "bg-[#0B0C15] text-white" : "bg-slate-50 text-slate-900"} p-4 sm:p-8 lg:p-12 font-sans relative overflow-hidden`}>
            {/* Ambient background effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <button 
                            onClick={() => router.back()}
                            className={`flex items-center gap-2 transition-colors mb-4 group ${
                                isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
                            }`}
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to settings
                        </button>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                            Upgrade your <span className={`text-transparent bg-clip-text bg-linear-to-r ${
                                isDark ? "from-indigo-400 via-purple-400 to-cyan-400" : "from-indigo-600 via-purple-600 to-cyan-600"
                            }`}>Vlyxir experience</span>
                        </h1>
                        <p className={`text-lg max-w-2xl ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            Select the plan that fits your coding workflow. Unlock higher execution limits and powerful AI insights.
                        </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold animate-pulse ${
                        isDark ? "border-indigo-500/20 bg-indigo-500/5 text-indigo-400" : "border-indigo-200 bg-indigo-50 text-indigo-600"
                    }`}>
                        <Sparkles className="w-4 h-4" />
                        Yet to be disclosed in all pricings
                    </div>
                </div>

                {/* Tier Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {TIERS.map((tier, idx) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative group p-6 rounded-3xl border transition-all duration-500 flex flex-col ${
                                tier.recommended 
                                ? "border-indigo-500/50 bg-indigo-500/10 dark:bg-indigo-500/5 shadow-2xl shadow-indigo-500/10 dark:shadow-none scale-105 z-10" 
                                : isDark
                                    ? "border-white/10 bg-white/5 hover:border-white/20"
                                    : "border-slate-200 bg-white hover:border-slate-350 shadow-md hover:shadow-lg"
                            }`}
                        >
                            {tier.recommended && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    Recommended
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-2xl ${tier.glow} border flex items-center justify-center mb-6 ${
                                isDark ? "border-white/10" : "border-slate-200"
                            }`}>
                                <tier.icon className={`w-6 h-6 ${tier.color}`} />
                            </div>

                            <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{tier.name}</h3>
                            <div className="mb-4">
                                {currentTierId === tier.id ? (
                                    <span className="text-[10px] px-2 py-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-wider">
                                        Active Plan
                                    </span>
                                ) : (
                                    <span className={`text-[10px] px-2 py-1 rounded-md border font-bold uppercase tracking-wider ${
                                        isDark ? "border-white/10 bg-white/5 text-slate-400" : "border-slate-200 bg-slate-100 text-slate-500"
                                    }`}>
                                        Price to be disclosed
                                    </span>
                                )}
                            </div>
                            <p className={`text-sm mb-6 min-h-10 ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                                {tier.description}
                            </p>

                            <div className="space-y-3 mb-8">
                                {tier.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-center gap-3 text-sm">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-emerald-550 dark:text-emerald-400" />
                                        </div>
                                        <span className={isDark ? "text-slate-300" : "text-slate-700"}>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                {currentTierId === tier.id ? (
                                    <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 font-bold text-sm">
                                        <Check className="w-4 h-4" />
                                        Your Current Plan
                                    </div>
                                ) : (
                                    <div className={`flex items-center justify-center gap-2 py-3 rounded-2xl border font-bold text-sm cursor-not-allowed transition-colors ${
                                        isDark 
                                            ? "bg-white/5 border-white/10 text-slate-500 group-hover:bg-white/10" 
                                            : "bg-slate-100 border-slate-200 text-slate-400 group-hover:bg-slate-200"
                                    }`}>
                                        <Construction className="w-4 h-4" />
                                        Coming Soon
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Comparison Table */}
                <div className="mb-20">
                    <h2 className={`text-3xl font-bold mb-8 flex items-center gap-3 ${isDark ? "text-white" : "text-slate-900"}`}>
                        <Shield className={`w-8 h-8 ${isDark ? "text-indigo-500" : "text-indigo-650"}`} />
                        Detailed Comparison
                    </h2>

                    <div className={`overflow-x-auto rounded-3xl border backdrop-blur-xl shadow-2xl dark:shadow-none ${
                        isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
                    }`}>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
                                    <th className={`p-6 font-bold uppercase tracking-widest text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Features</th>
                                    <th className={`p-6 text-center font-black ${isDark ? "text-slate-300" : "text-slate-700"}`}>Free</th>
                                    <th className={`p-6 text-center font-black ${isDark ? "text-blue-400" : "text-blue-650"}`}>Tier 1</th>
                                    <th className={`p-6 text-center font-black bg-slate-100/50 dark:bg-white/5 ${isDark ? "text-indigo-400" : "text-indigo-650"}`}>Tier 2</th>
                                    <th className={`p-6 text-center font-black ${isDark ? "text-amber-400" : "text-amber-650"}`}>Tier 3</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARISON_FEATURES.map((feature, idx) => (
                                    <tr key={idx} className={`border-b transition-colors ${
                                        isDark 
                                            ? "border-white/5 hover:bg-white/5" 
                                            : "border-slate-100 hover:bg-slate-50"
                                    }`}>
                                        <td className={`p-6 font-bold ${isDark ? "text-slate-300" : "text-slate-800"}`}>{feature.name}</td>
                                        <td className="p-6 text-center">
                                            {typeof feature.free === 'boolean' ? (
                                                feature.free 
                                                    ? <Check className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mx-auto" /> 
                                                    : <X className={`w-5 h-5 mx-auto ${isDark ? "text-slate-650" : "text-slate-400"}`} />
                                            ) : (
                                                <span className={`font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{feature.free}</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-center">
                                            {typeof feature.tier1 === 'boolean' ? (
                                                feature.tier1 
                                                    ? <Check className="w-5 h-5 text-blue-500 dark:text-blue-400 mx-auto" /> 
                                                    : <X className={`w-5 h-5 mx-auto ${isDark ? "text-slate-650" : "text-slate-400"}`} />
                                            ) : (
                                                <span className={`font-bold ${isDark ? "text-blue-400" : "text-blue-650"}`}>{feature.tier1}</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-center bg-slate-100/30 dark:bg-white/5">
                                            {typeof feature.tier2 === 'boolean' ? (
                                                feature.tier2 
                                                    ? <Check className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mx-auto" /> 
                                                    : <X className={`w-5 h-5 mx-auto ${isDark ? "text-slate-650" : "text-slate-400"}`} />
                                            ) : (
                                                <span className={`font-bold ${isDark ? "text-indigo-400" : "text-indigo-650"}`}>{feature.tier2}</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-center">
                                            {typeof feature.tier3 === 'boolean' ? (
                                                feature.tier3 
                                                    ? <Check className="w-5 h-5 text-amber-500 dark:text-amber-400 mx-auto" /> 
                                                    : <X className={`w-5 h-5 mx-auto ${isDark ? "text-slate-650" : "text-slate-400"}`} />
                                            ) : (
                                                <span className={`font-bold ${isDark ? "text-amber-400" : "text-amber-650"}`}>{feature.tier3}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ / Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-20">
                    <div className={`p-8 rounded-3xl border transition-all ${
                        isDark 
                            ? "bg-linear-to-br from-indigo-500/10 to-transparent border-indigo-500/20 text-white" 
                            : "bg-linear-to-br from-indigo-50/50 to-transparent border-indigo-200 text-slate-900 shadow-sm"
                    }`}>
                        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                            <Zap className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                            How do Forge Submissions work?
                        </h3>
                        <p className={`leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            Forge submissions represent your daily quota for code execution on the Vlyxir cloud. Your quota resets every day at 00:00 UTC. Higher tiers allow for more intensive development sessions without interruption.
                        </p>
                    </div>
                    <div className={`p-8 rounded-3xl border transition-all ${
                        isDark 
                            ? "bg-linear-to-br from-purple-500/10 to-transparent border-purple-500/20 text-white" 
                            : "bg-linear-to-br from-purple-50/50 to-transparent border-purple-200 text-slate-900 shadow-sm"
                    }`}>
                        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                            <BrainCircuit className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                            What are AI Insights?
                        </h3>
                        <p className={`leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            AI Insights provide deep structural and security analysis of your code. Using advanced models, Vlyxir helps you find bugs, optimize performance, and ensure best practices. Tier 2 and Tier 3 users get a dedicated daily quota for these reports.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
