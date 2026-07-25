"use client";

import Link from "next/link";
import { LEARN_CATEGORIES } from "../../lib/data/learnData";
import { BookOpen, Layers, Cpu, Terminal, Sparkles, ArrowRight, CheckCircle2, Bookmark } from "lucide-react";
import { useAppContext } from "../../lib/auth/context";

const ICON_MAP: Record<string, React.ReactNode> = {
    Layers: <Layers className="w-6 h-6" />,
    Cpu: <Cpu className="w-6 h-6" />,
    Terminal: <Terminal className="w-6 h-6" />
};

export default function LearnOverviewPage() {
    const { isDark } = useAppContext();

    return (
        <div className={`h-full min-h-0 flex flex-col rounded-3xl border backdrop-blur-xl transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-8 ${isDark
            ? "border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(10,15,26,0.92))] shadow-[0_16px_36px_rgba(2,6,23,0.24)]"
            : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
            }`}>
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-2xl space-y-4">
                <div className="absolute right-[-4rem] top-[-4rem] w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Theoretical Informatics & Mastery</span>
                </div>

                <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight max-w-2xl">
                    Welcome to the Learner&apos;s Arena
                </h1>

                <p className="text-sm md:text-base text-indigo-100 max-w-2xl leading-relaxed font-medium">
                    Master theoretical Computer Science concepts, algorithm complexity, data structure invariants, and core system architectures through structured informatics—without distraction.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                        href="/learn/data-structures/arrays"
                        className="px-5 py-3 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all active:scale-95"
                    >
                        <span>Start Learning</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Curriculum Categories */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        Curriculum Modules
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                        Explore foundational computer science domains with in-depth theoretical breakdowns.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {LEARN_CATEGORIES.map((category) => (
                        <div
                            key={category.id}
                            className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 group ${isDark
                                ? "border-slate-800 bg-slate-900/60 hover:border-indigo-500/50 hover:bg-slate-900/90"
                                : "border-slate-200 bg-white/70 hover:border-indigo-300 hover:bg-white shadow-sm"
                                }`}
                        >
                            <div className="space-y-3">
                                <div className="p-3 w-fit rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                    {ICON_MAP[category.icon] || <BookOpen className="w-6 h-6" />}
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {category.title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {category.description}
                                </p>
                            </div>

                            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">
                                    {category.topics.length} Topics
                                </span>
                                <Link
                                    href={`/learn/${category.slug}/${category.topics[0]?.slug}`}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                                >
                                    <span>Explore</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}