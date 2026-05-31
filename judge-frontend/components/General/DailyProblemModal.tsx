"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, X, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../app/lib/auth/auth-context';

interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty?: string;
}

interface DailyProblemModalProps {
    isOpen: boolean;
    onClose: () => void;
    problem: Problem | null;
    isSolved: boolean;
    isDark: boolean;
    codeJudgePath: string;
}

function stripHtmlAndTruncate(htmlStr?: string): string {
    if (!htmlStr) return "";
    const clean = htmlStr.replace(/<\/?[^>]+(>|$)/g, "");
    if (clean.length <= 160) return clean;
    return clean.slice(0, 160) + "...";
}

export default function DailyProblemModal({
    isOpen,
    onClose,
    problem,
    isSolved,
    isDark,
    codeJudgePath
}: DailyProblemModalProps) {
    const { user } = useAuth();

    if (!isOpen || !problem || !user) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Ambient Blur Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#020408]/60 dark:bg-black/80 backdrop-blur-md cursor-pointer"
                />
                
                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.9, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 15, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className={`relative z-10 w-full max-w-2xl rounded-[32px] border overflow-hidden backdrop-blur-2xl shadow-2xl ${
                        isDark
                            ? "border-white/[0.08] bg-[#0B0C15]/90 text-white shadow-indigo-500/5"
                            : "border-slate-200/80 bg-white/95 text-slate-900 shadow-slate-200/50"
                    }`}
                >
                    {/* Top decorative glow gradient */}
                    <div className="absolute top-0 left-0 right-0 h-[120px] bg-gradient-to-b from-indigo-500/[0.08] to-transparent pointer-events-none" />

                    {/* Header Row */}
                    <div className="p-6 pb-0 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest bg-amber-500/10 border-amber-500/20 text-amber-500 flex items-center gap-1 animate-pulse">
                                <Flame className="w-2.5 h-2.5 fill-current text-amber-500" /> Daily Habit Challenge
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                isDark
                                    ? "border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-white"
                                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                            }`}
                            aria-label="Close daily challenge"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 relative z-10 space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-2xl font-black tracking-tight text-left">
                                    {problem.title}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                    problem.difficulty?.toLowerCase() === 'easy'
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        : problem.difficulty?.toLowerCase() === 'medium'
                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                }`}>
                                    {problem.difficulty || 'Easy'}
                                </span>
                            </div>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-650'} leading-relaxed text-left`}>
                                {stripHtmlAndTruncate(problem.description)}
                            </p>
                        </div>

                        {isSolved ? (
                            /* Solved Status Callout */
                            <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
                                isDark
                                    ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] animate-pulse"
                                    : "bg-gradient-to-r from-emerald-50 to-teal-50/50 border-emerald-200 shadow-sm"
                            }`}>
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/30 shrink-0">
                                    <Trophy className="w-5 h-5 fill-current text-emerald-500" />
                                </div>
                                <div className="text-left space-y-0.5">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                        Challenge Completed
                                    </span>
                                    <p className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                        You did today's part! 🎉
                                    </p>
                                    <p className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        +20 XP Habit Bonus has been credited to your profile.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Daily Reward Telemetry Callout */
                            <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
                                isDark
                                    ? "bg-gradient-to-r from-amber-500/5 to-indigo-500/5 border-amber-500/10"
                                    : "bg-gradient-to-r from-amber-50/50 to-indigo-50/50 border-amber-200/50"
                            }`}>
                                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
                                    <Trophy className="w-5 h-5 fill-current animate-bounce text-amber-500" />
                                </div>
                                <div className="text-left space-y-0.5">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-amber-500">
                                        Habit Builder Reward
                                    </span>
                                    <p className={`text-xs font-bold leading-relaxed ${isDark ? 'text-slate-350' : 'text-slate-700'}`}>
                                        Solve today to unlock a <strong className="text-indigo-500 dark:text-indigo-400">+20 XP Leaderboard Bonus (even on solved ones)</strong>!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className={`p-6 pt-4 border-t flex flex-col sm:flex-row gap-3 items-center justify-between ${
                        isDark ? "border-white/[0.06] bg-[#0B0C15]/50" : "border-slate-100 bg-slate-50/50"
                    }`}>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Recommended: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div className="flex gap-2.5 w-full sm:w-auto">
                            <button
                                onClick={onClose}
                                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-[10.5px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                                    isDark
                                        ? "border-white/5 bg-white/[0.01] hover:bg-white/[0.05] text-slate-450 hover:text-white"
                                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Close
                            </button>
                            {isSolved ? (
                                <div
                                    className={`px-5 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-emerald-500/30 ${
                                        isDark
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "bg-emerald-50 text-emerald-700"
                                    }`}
                                >
                                    <span>Completed</span>
                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <Link
                                    href={`${codeJudgePath}?problem=${problem.id}`}
                                    onClick={onClose}
                                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider shadow-lg shadow-indigo-650/15 hover:shadow-indigo-650/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 border border-indigo-500/20"
                                >
                                    <span>Solve Challenge</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
