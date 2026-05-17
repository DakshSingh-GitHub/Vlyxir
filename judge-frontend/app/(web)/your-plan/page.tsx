"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
    ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/auth-context";
import { checkForgeLimit, checkAiLimit } from "../../lib/api/forge-limits";

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
    const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPlan() {
            if (user) {
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
                setLoading(false);
            } else if (!authLoading) {
                setLoading(false);
            }
        }
        fetchPlan();
    }, [user, authLoading]);

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-[#0B0C15] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold animate-pulse">Initializing your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0B0C15] flex items-center justify-center p-6 text-center">
                <div className="max-w-md">
                    <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                        <Shield className="w-10 h-10 text-rose-500" />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-4">Access Restricted</h1>
                    <p className="text-slate-400 mb-8 font-medium">Please sign in to view your plan details and usage statistics.</p>
                    <button 
                        onClick={() => router.push('/login')}
                        className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black transition-all shadow-xl shadow-indigo-500/20"
                    >
                        Sign In Now
                    </button>
                </div>
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
        <div className="min-h-screen w-full bg-[#0B0C15] text-white p-4 sm:p-8 lg:p-12 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Back button */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold tracking-tight">Return to Previous</span>
                </button>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                Billing Overview
                            </div>
                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">vlyxir ecosystem</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                            Your <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-cyan-400">Vlyxir Plan</span>
                        </h1>
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-6 rounded-3xl border flex items-center gap-6 ${
                            isPro ? "border-amber-500/30 bg-amber-500/5" : "border-slate-800 bg-slate-800/20"
                        }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                            isPro ? "bg-amber-500/20" : "bg-slate-700/30"
                        }`}>
                            {isPro ? <Crown className="w-8 h-8 text-amber-500" /> : <Terminal className="w-8 h-8 text-slate-400" />}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Current Membership</p>
                            <h2 className="text-2xl font-black">
                                {isPro ? `Vlyxir Pro (${tierName})` : "Vlyxir Free"}
                            </h2>
                        </div>
                    </motion.div>
                </div>

                {/* Usage Stats Section */}
                <div className="grid grid-cols-1 gap-8 mb-12">
                    <div className="p-8 md:p-12 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
                        
                        <div className="space-y-16">
                            {/* Vlyxir Forge */}
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                            <Zap className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black">Vlyxir Forge</h3>
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Daily Execution Limit</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black">{planDetails?.count}</span>
                                        <span className="text-slate-500 text-sm font-bold"> / {planDetails?.limit === Infinity ? "∞" : planDetails?.limit}</span>
                                    </div>
                                </div>

                                <div className="h-4 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 mb-6">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${forgeUsagePercent}%` }}
                                        className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-400 rounded-full"
                                    />
                                </div>
                                <p className="text-slate-500 text-xs font-bold leading-relaxed max-w-2xl">
                                    Your forge quota resets every day at 00:00 UTC. Execution units are consumed each time you build or run code within the ecosystem.
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="h-px w-full bg-white/5" />

                            {/* Vlyxir Insights */}
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                            <BrainCircuit className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black">Vlyxir Insights</h3>
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Daily structural reports</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {planDetails?.aiLimit && planDetails.aiLimit > 0 ? (
                                            <>
                                                <span className="text-2xl font-black">{planDetails.aiCount}</span>
                                                <span className="text-slate-500 text-sm font-bold"> / {planDetails.aiLimit === Infinity ? "∞" : planDetails.aiLimit}</span>
                                            </>
                                        ) : (
                                            <span className="text-slate-600 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-white/5 border border-white/5">
                                                Locked
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {planDetails?.aiLimit && planDetails.aiLimit > 0 ? (
                                    <>
                                        <div className="h-4 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 mb-6">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${aiUsagePercent}%` }}
                                                className="h-full bg-linear-to-r from-purple-500 via-indigo-500 to-purple-400 rounded-full"
                                            />
                                        </div>
                                        {planDetails?.tier && planDetails.tier >= 3 && (
                                            <div className="flex flex-wrap gap-6">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                    Security vulnerability scans
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                    Logic optimization reports
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                                        <Shield className="w-8 h-8 text-slate-600 mb-3" />
                                        <p className="text-slate-500 font-bold text-sm">Vlyxir Insights is not included in your current plan.</p>
                                        <button 
                                            onClick={() => router.push('/upgrade-tiers')}
                                            className="mt-4 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:text-indigo-300 transition-colors"
                                        >
                                            Upgrade to unlock
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upsell / Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                    <div className="p-8 rounded-4xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            Looking for more?
                        </h4>
                        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                            Need higher limits or dedicated resources for your professional projects? Our tiered pro plans offer maximum flexibility.
                        </p>
                        <button 
                            onClick={() => router.push('/upgrade-tiers')}
                            className="flex items-center gap-2 text-indigo-400 font-black text-sm uppercase tracking-widest hover:gap-4 transition-all"
                        >
                            View Tier Comparisons
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer decoration */}
            <div className="mt-20 text-center opacity-20 pointer-events-none">
                <p className="text-[10px] font-black uppercase tracking-[1em] text-slate-500">VLYXIR PLATFORM INFRASTRUCTURE</p>
            </div>
        </div>
    );
}
