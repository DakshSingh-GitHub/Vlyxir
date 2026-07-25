"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LEARN_CATEGORIES, LearnCategory, LearnTopic } from "../../../lib/data/learnData";
import { Search, ChevronDown, ChevronRight, Layers, Cpu, Terminal, CheckCircle2, Bookmark, BookOpen } from "lucide-react";
import { useAppContext } from "../../../lib/auth/context";

const ICON_MAP: Record<string, React.ReactNode> = {
    Layers: <Layers className="w-4 h-4" />,
    Cpu: <Cpu className="w-4 h-4" />,
    Terminal: <Terminal className="w-4 h-4" />
};

interface TopicSidebarProps {
    completedTopics: Set<string>;
    bookmarkedTopics: Set<string>;
    toggleBookmark: (topicId: string, e: React.MouseEvent) => void;
    onSelectTopicMobile?: () => void;
}

export default function TopicSidebar({
    completedTopics,
    bookmarkedTopics,
    toggleBookmark,
    onSelectTopicMobile
}: TopicSidebarProps) {
    const pathname = usePathname();
    const { isDark } = useAppContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        "data-structures": true,
        "algorithms": true,
        "cs-core": true
    });

    const toggleCategory = (slug: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [slug]: !prev[slug]
        }));
    };

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return LEARN_CATEGORIES;

        const q = searchQuery.toLowerCase();
        return LEARN_CATEGORIES.map(cat => ({
            ...cat,
            topics: cat.topics.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.summary.toLowerCase().includes(q) ||
                t.keyConcepts.some(k => k.toLowerCase().includes(q))
            )
        })).filter(cat => cat.topics.length > 0);
    }, [searchQuery]);

    const totalTopicsCount = useMemo(() => {
        return LEARN_CATEGORIES.reduce((acc, cat) => acc + cat.topics.length, 0);
    }, []);

    const completionPercentage = Math.round((completedTopics.size / totalTopicsCount) * 100) || 0;

    const getDifficultyBadge = (difficulty: LearnTopic["difficulty"]) => {
        switch (difficulty) {
            case "Beginner":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
            case "Intermediate":
                return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
            case "Advanced":
                return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
        }
    };

    return (
        <aside className={`h-full flex flex-col overflow-hidden rounded-3xl border backdrop-blur-xl transition-all duration-300 ${isDark
            ? "border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(10,15,26,0.92))] shadow-[0_16px_36px_rgba(2,6,23,0.24)]"
            : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
            }`}>
            {/* Header & Search */}
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                                Learner&apos;s Arena
                            </h2>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                                Theory & Concepts
                            </p>
                        </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {completedTopics.size}/{totalTopicsCount} Done
                    </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Search Box */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search concepts, algorithms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    />
                </div>
            </div>

            {/* Scrollable Curriculum List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {filteredCategories.map((category) => {
                    const isExpanded = expandedCategories[category.slug] ?? true;
                    return (
                        <div key={category.id} className="space-y-1">
                            {/* Category Header */}
                            <button
                                onClick={() => toggleCategory(category.slug)}
                                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-indigo-500">
                                        {ICON_MAP[category.icon] || <Layers className="w-4 h-4" />}
                                    </span>
                                    <span>{category.title}</span>
                                </div>
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>

                            {/* Topics under category */}
                            {isExpanded && (
                                <ul className="space-y-1 pt-1">
                                    {category.topics.map((topic) => {
                                        const href = `/learn/${topic.categorySlug}/${topic.slug}`;
                                        const isActive = pathname === href;
                                        const isCompleted = completedTopics.has(topic.id);
                                        const isBookmarked = bookmarkedTopics.has(topic.id);

                                        return (
                                            <li key={topic.id}>
                                                <Link
                                                    href={href}
                                                    onClick={() => onSelectTopicMobile && onSelectTopicMobile()}
                                                    className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 border ${isActive
                                                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30 shadow-md shadow-indigo-500/5 translate-x-1"
                                                        : "border-transparent hover:bg-slate-100/70 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:translate-x-0.5"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                                        {isCompleted ? (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                        ) : (
                                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"}`} />
                                                        )}
                                                        <span className="truncate font-semibold">{topic.title}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <button
                                                            onClick={(e) => toggleBookmark(topic.id, e)}
                                                            className={`p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors ${isBookmarked ? "text-amber-500" : "text-slate-400 opacity-0 group-hover:opacity-100"}`}
                                                            title={isBookmarked ? "Remove Bookmark" : "Bookmark Topic"}
                                                        >
                                                            <Bookmark className={`w-3 h-3 ${isBookmarked ? "fill-amber-500" : ""}`} />
                                                        </button>

                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getDifficultyBadge(topic.difficulty)}`}>
                                                            {topic.difficulty.slice(0, 3)}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}
