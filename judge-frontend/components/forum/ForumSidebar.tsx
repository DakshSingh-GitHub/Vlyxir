"use client";

import { LayoutList, TrendingUp, Sparkles, Zap, Globe, Home } from 'lucide-react';
import { useAppContext } from '../../app/lib/context';
import Link from 'next/link';

interface ForumSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function ForumSidebar({ activeTab, setActiveTab }: ForumSidebarProps) {
    const { isDark } = useAppContext();

    const navItems = [
        { icon: <LayoutList className="w-4 h-4" />, label: "All Posts" },
        { icon: <TrendingUp className="w-4 h-4" />, label: "Trending" },
        { icon: <Sparkles className="w-4 h-4" />, label: "New" },
        { icon: <Zap className="w-4 h-4" />, label: "Fast Growing" },
    ];

    return (
        <aside className={`w-64 flex-shrink-0 border-r hidden md:flex flex-col ${isDark ? 'border-slate-800 bg-[#0f172a]' : 'border-slate-200 bg-slate-50'} py-6 px-4`}>
            <Link 
                href="/"
                className={`flex items-center gap-3 px-3 py-2 rounded-xl mb-6 text-sm font-medium transition-all ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
                <Home className="w-4 h-4" />
                Back to Home
            </Link>

            <div className="font-bold text-lg mb-6 tracking-tight px-2">Forums</div>
            <div className="flex-1 overflow-y-auto">
                <div className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Navigation</div>
                <nav className="space-y-1 mb-8">
                    {navItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveTab(item.label)}
                            className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                activeTab === item.label
                                ? (isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                                : (isDark ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>
                
                <div className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Channels</div>
                <div className="space-y-1">
                    <button className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium ${isDark ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                        <Globe className="w-4 h-4 text-indigo-500" />
                        Public
                    </button>
                </div>
            </div>
        </aside>
    );
}
