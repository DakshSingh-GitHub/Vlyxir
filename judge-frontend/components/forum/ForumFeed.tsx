"use client";

import { Search } from "lucide-react";
import { useAppContext } from "@/app/lib/context";
import { useEffect, useState } from "react";

interface ForumFeedProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function ForumFeed({ activeTab, setActiveTab }: ForumFeedProps) {
    const { isDark } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);

    const tabs = ['All Posts', 'Trending', 'New', 'Fast Growing'];

    // Simulate loading when tab changes
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 350);
        return () => clearTimeout(timer);
    }, [activeTab]);

    // Determine skeleton count based on tab to "show" change
    const getSkeletonCount = () => {
        const normalizedTab = activeTab?.trim();
        if (normalizedTab === 'All Posts') return 4;
        if (normalizedTab === 'Trending') return 3;
        if (normalizedTab === 'New') return 5;
        if (normalizedTab === 'Fast Growing') return 2;
        return 3;
    };

    const skeletonCount = getSkeletonCount();

    return (
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto px-4 py-6 md:px-8">
            {/* Search Bar */}
            <div className="relative w-full mb-8 px-2">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className={`h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <input
                    type="text"
                    placeholder="Search posts..."
                    className={`w-full py-2.5 px-10 rounded-2xl text-sm transition-all text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] ${
                        isDark 
                        ? 'bg-slate-800/50 text-slate-200 border-slate-700 placeholder:text-slate-400' 
                        : 'bg-white text-slate-800 border-slate-200 placeholder:text-slate-500 border'
                    }`}
                />
            </div>

            {/* Tabs Header - Always Visible */}
            <div className={`flex gap-6 mb-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} overflow-x-auto no-scrollbar min-h-[48px]`}>
                {tabs.map((tab) => {
                    const isActive = activeTab?.trim() === tab.trim();
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 px-1 text-sm font-bold transition-all relative whitespace-nowrap min-w-fit flex items-center justify-center ${
                                isActive
                                ? (isDark ? 'text-indigo-400' : 'text-indigo-600')
                                : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')
                            }`}
                        >
                            {tab}
                            {isActive && (
                                <div className="absolute -bottom-[1px] left-0 right-0 h-[2.5px] bg-indigo-500 rounded-full z-20" />
                            )}
                        </button>
                    );
                })}
            </div>
            
            {/* Feed Content */}
            <div className="space-y-4">
                {isLoading ? (
                    // Quick loading skeleton
                    <div className="animate-pulse space-y-4">
                        <div className={`h-32 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`} />
                        <div className={`h-32 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`} />
                    </div>
                ) : (
                    // Skeleton Cards
                    Array.from({ length: skeletonCount }).map((_, i) => (
                        <div key={i} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm transition-all duration-300`}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} animate-pulse`} />
                                <div className={`h-4 w-24 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'} animate-pulse`} />
                            </div>
                            <div className={`h-6 w-3/4 rounded mb-2 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} animate-pulse`} />
                            <div className={`h-4 w-full rounded mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} animate-pulse`} />
                            <div className="flex gap-2">
                                <div className={`h-4 w-12 rounded ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'} animate-pulse`} />
                                <div className={`h-4 w-12 rounded ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'} animate-pulse`} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}

