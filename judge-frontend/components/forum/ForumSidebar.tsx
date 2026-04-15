"use client";

import { LayoutList, TrendingUp, Sparkles, Zap, Globe, Home, PenSquare } from 'lucide-react';
import { useAppContext } from '../../app/lib/context';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchChannels, ForumChannel } from '../../app/forum/forum-helper/helper';
import React from 'react';

interface ForumSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    activeChannelId: string | null;
    setActiveChannelId: (id: string | null) => void;
}

export default function ForumSidebar({ 
    activeTab, 
    setActiveTab, 
    activeChannelId, 
    setActiveChannelId 
}: ForumSidebarProps) {

    const { isDark } = useAppContext();
    const [channels, setChannels] = useState<ForumChannel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadChannels() {
            setIsLoading(true);
            const data = await fetchChannels();
            setChannels(data);
            setIsLoading(false);
        }
        loadChannels();
    }, []);

    const navItems = [
        { icon: <LayoutList className="w-4 h-4" />, label: "All Posts", href: "/forum" },
        { icon: <TrendingUp className="w-4 h-4" />, label: "Trending", href: "/forum" },
        { icon: <Sparkles className="w-4 h-4" />, label: "New", href: "/forum" },
        { icon: <Zap className="w-4 h-4" />, label: "Fast Growing", href: "/forum" },
        { icon: <PenSquare className="w-4 h-4" />, label: "Your Content", href: "/forum/your-content" },
    ];

    return (
        <aside className={`w-64 flex-shrink-0 border-r hidden md:flex flex-col ${isDark ? 'border-slate-800 bg-[#0f172a]' : 'border-slate-200 bg-slate-50'} py-6 px-4`}>
            <div className="flex items-center gap-3 px-3 mb-8">
                <div className="w-8 h-8 relative rounded-xl overflow-hidden bg-indigo-600 flex items-center justify-center p-1.5 shadow-lg shadow-indigo-500/20">
                    <Image
                        src="/icons/icon-192x192.png"
                        alt="CodeJudge Logo"
                        width={32}
                        height={32}
                        className="object-contain"
                    />
                </div>
                <span className={`font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    VLY<span className="text-indigo-500">XIR</span>
                </span>
            </div>

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
                    {navItems.map((item, idx) => {
                        const isActive = activeTab === item.label && !activeChannelId;
                        const content = (
                            <button
                                onClick={() => {
                                    setActiveTab(item.label);
                                    setActiveChannelId(null);
                                }}
                                className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isActive
                                        ? (isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                                        : (isDark ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        );

                        if (item.href) {
                            return (
                                <Link key={idx} href={item.href} className="block">
                                    {content}
                                </Link>
                            );
                        }

                        return <React.Fragment key={idx}>{content}</React.Fragment>;
                    })}
                </nav>

                <div className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Channels</div>
                <div className="space-y-1">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className={`h-9 w-full rounded-xl animate-pulse ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`} />
                        ))
                    ) : (
                        channels.map((channel) => {
                            const isActive = activeTab === channel.name;
                            return (
                                <button 
                                    key={channel.id}
                                    onClick={() => {
                                        setActiveTab(channel.name);
                                        setActiveChannelId(channel.id);
                                    }}
                                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all ${activeChannelId === channel.id
                                        ? (isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                                        : (isDark ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                                    }`}
                                >
                                    <Globe className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-indigo-500'}`} />
                                    {channel.name}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </aside>
    );
}
