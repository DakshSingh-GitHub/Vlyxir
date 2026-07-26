"use client";

import React, { memo, useEffect, useRef, useState } from 'react';
import { anime } from '../../app/lib/utils/anime';
import { History, LayoutGrid, User, Settings, LogOut, Shield, ChevronDown, Trophy, BarChart2, Users, Plus, X, Mail, Crown, Flame, Check, LayoutTemplate, FolderOpen, Info } from 'lucide-react';
import NewNavDropdown from './NewNavDropdown';
import { usePathname, useRouter } from 'next/navigation';
import { isCodeJudgePath, isCodeIdePath, isCodeAnalysisPath } from '../../app/lib/utils/paths';
import { useAuth } from '../../app/lib/auth/auth-context';
import { useAppContext } from '../../app/lib/auth/context';
import Image from 'next/image';

interface NavBarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    setIsSubmissionsModalOpen: (isOpen: boolean) => void;
    onOpenSettings: () => void;
}

const NavBar: React.FC<NavBarProps> = memo(({ isSidebarOpen, setIsSidebarOpen, setIsSubmissionsModalOpen, onOpenSettings }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading, signOut, savedAccounts, switchAccount, removeAccount, dbProfile } = useAuth();
    const { isDark, isDailyModalOpen, setIsDailyModalOpen, dailyProblemEnabled, dailyProblemSolved } = useAppContext();
    const [imageError, setImageError] = useState(false);

    const [interviewState, setInterviewState] = useState({
        isHost: false,
        isExecutionLocked: false,
        leftSidebarOpen: true,
        rightSidebarOpen: true
    });

    const isInterviewRoom = pathname.startsWith('/interview/') && pathname.split('/').length > 2 && pathname.split('/')[2] !== 'page';
    const sessionId = isInterviewRoom ? pathname.split('/')[2] : '';

    useEffect(() => {
        if (!isInterviewRoom) return;

        const handleUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail) {
                setInterviewState(prev => ({ ...prev, ...customEvent.detail }));
            }
        };

        window.addEventListener('vlyxir-interview-state-update', handleUpdate);
        window.dispatchEvent(new CustomEvent('vlyxir-interview-request-state'));

        return () => window.removeEventListener('vlyxir-interview-state-update', handleUpdate);
    }, [isInterviewRoom, pathname]);

    const displayName =
        dbProfile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.username ||
        user?.email?.split("@")[0] ||
        "Login";
    const avatarUrl = dbProfile?.avatar_url || user?.user_metadata?.avatar_url;

    useEffect(() => {
        setImageError(false);
    }, [avatarUrl]);
    const isHomeRoute = pathname === '/';
    const isCodeIDE = isCodeIdePath(pathname);
    const isCodeJudge = isCodeJudgePath(pathname);
    const isCodeAnalysis = isCodeAnalysisPath(pathname);
    const headerRef = useRef<HTMLElement>(null);
    const navItemsRef = useRef<HTMLDivElement>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (headerRef.current) {
            anime({
                targets: headerRef.current,
                translateY: [-50, 0],
                opacity: [0, 1],
                duration: 600,
                easing: 'easeOutQuad'
            });
        }
        if (navItemsRef.current) {
            anime({
                targets: navItemsRef.current,
                translateX: [-20, 0],
                opacity: [0, 1],
                delay: 200,
                duration: 600,
                easing: 'easeOutQuad'
            });
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header
            ref={headerRef}
            className="relative z-50 shrink-0 px-3 pt-3 pb-2 opacity-0 md:px-6 md:pt-4 md:pb-3"
        >
            <div className="mx-auto flex max-w-400 justify-center">
                <div className={`relative w-[92vw] max-w-[92vw] rounded-full px-5 py-3.5 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${isDark
                    ? "bg-[#0A0F1A]/40 ring-1 ring-white/10 backdrop-blur-3xl hover:bg-[#0A0F1A]/60 hover:ring-white/20"
                    : "bg-white/60 ring-1 ring-slate-900/10 backdrop-blur-3xl hover:bg-white/80 hover:ring-slate-900/20 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
                    }`}>
                    {/* Inner highlight for 3D effect */}
                    <div className={`pointer-events-none absolute inset-0 rounded-full border-[0.5px] ${isDark ? 'border-white/10' : 'border-white/60'}`} />
                    
                    {/* Top glow */}
                    <div className={`pointer-events-none absolute inset-x-[20%] top-0 h-px bg-linear-to-r from-transparent via-current to-transparent transition-opacity duration-500 ${isDark ? "text-cyan-400/30 group-hover:text-cyan-400/50" : "text-indigo-500/20"}`} />
                    
                    {/* Bottom subtle glow */}
                    <div className={`pointer-events-none absolute inset-x-[15%] bottom-0 h-px bg-linear-to-r from-transparent via-current to-transparent ${isDark ? "text-indigo-400/20" : "text-purple-500/10"}`} />
                    
                    <div className="relative flex items-center justify-between gap-4">
                        <div
                            ref={navItemsRef}
                            className="flex items-center gap-4 opacity-0"
                        >
                            <NewNavDropdown />
                            {isInterviewRoom && interviewState.isHost && (
                                <>
                                    <div className={`h-6 w-px ${isDark ? "bg-white/10" : "bg-slate-900/10"}`} />
                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('vlyxir-interview-action', { detail: { action: 'toggle-lock' } }))}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                            interviewState.isExecutionLocked
                                                ? "bg-rose-500/20 text-rose-450 border border-rose-500/30"
                                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                        }`}
                                    >
                                        {interviewState.isExecutionLocked ? "🔒 Execution Locked" : "🔓 Execution Allowed"}
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            {isCodeAnalysis && (
                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent("open-code-analysis-records"))}
                                    className={`flex items-center gap-2 rounded-full border px-3 py-2 md:px-5 md:py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap ${isDark
                                        ? "border-white/10 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/15 hover:text-white backdrop-blur-md shadow-lg shadow-black/20"
                                        : "border-slate-900/10 bg-slate-900/5 text-slate-700 hover:border-slate-900/20 hover:bg-slate-900/10 hover:text-slate-900 backdrop-blur-md"
                                        }`}
                                    title="Show analysis records"
                                >
                                    <History className="h-4 w-4 md:hidden" />
                                    <span className="hidden md:inline">Show records</span>
                                </button>
                            )}

                            {user && !isHomeRoute && !isCodeIDE && !isCodeAnalysis && !isInterviewRoom && (
                                <button
                                    onClick={() => setIsSubmissionsModalOpen(true)}
                                    className={`group flex items-center justify-center rounded-full border p-2.5 transition-all duration-300 hover:scale-110 active:scale-90 ${isDark
                                        ? "border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/15 hover:text-white backdrop-blur-md shadow-lg shadow-black/20"
                                        : "border-slate-900/10 bg-slate-900/5 text-slate-500 hover:border-slate-900/20 hover:bg-slate-900/10 hover:text-slate-900 backdrop-blur-md"
                                        }`}
                                    title="See Submissions"
                                >
                                    <History className="h-5 w-5 transition-transform duration-500 group-hover:rotate-[-20deg]" />
                                </button>
                            )}

                            {(isCodeJudge || isCodeIDE) && !isInterviewRoom && (
                                <button
                                    onClick={() => {
                                        const eventName = isCodeJudge
                                            ? "open-code-judge-ui-grid-modal"
                                            : "open-code-ide-ui-grid-modal";
                                        window.dispatchEvent(new CustomEvent(eventName));
                                    }}
                                    className={`hidden items-center gap-2 rounded-full border px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 lg:flex ${isDark
                                        ? "border-white/10 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/15 hover:text-white backdrop-blur-md shadow-lg shadow-black/20"
                                        : "border-slate-900/10 bg-slate-900/5 text-slate-700 hover:border-slate-900/20 hover:bg-slate-900/10 hover:text-slate-900 backdrop-blur-md"
                                        }`}
                                    title="Select UI Grid"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                    <span>UI Grid</span>
                                </button>
                            )}

                            {!isHomeRoute && !isCodeIDE && !isCodeAnalysis && !isInterviewRoom && (
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className={`${isCodeJudge ? "hidden lg:flex" : "flex"} items-center justify-center rounded-full border p-2.5 transition-all duration-300 hover:scale-110 active:scale-90 ${isDark
                                        ? "border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/15 hover:text-white backdrop-blur-md shadow-lg shadow-black/20"
                                        : "border-slate-900/10 bg-slate-900/5 text-slate-500 hover:border-slate-900/20 hover:bg-slate-900/10 hover:text-slate-900 backdrop-blur-md"
                                        }`}
                                    title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
                                >
                                    {isSidebarOpen ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    )}
                                </button>
                            )}

                            {isInterviewRoom && (
                                <>
                                    {interviewState.isHost ? (
                                        <button
                                            onClick={() => window.dispatchEvent(new CustomEvent('vlyxir-interview-action', { detail: { action: 'end' } }))}
                                            className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                                        >
                                            End Session
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => window.dispatchEvent(new CustomEvent('vlyxir-interview-action', { detail: { action: 'leave' } }))}
                                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                                                isDark ? "bg-slate-900 border border-slate-800 text-slate-355 hover:bg-slate-850" : "bg-slate-100 text-slate-650 hover:bg-slate-200"
                                            }`}
                                        >
                                            Leave
                                        </button>
                                    )}

                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('vlyxir-interview-action', { detail: { action: 'info' } }))}
                                        className={`p-2 rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                                            isDark ? "border-white/10 bg-white/5 text-slate-300 hover:border-white/30" : "border-slate-900/10 bg-slate-900/5 text-slate-500 hover:border-slate-900/20"
                                        }`}
                                        title="Meeting Details"
                                    >
                                        <Info className="h-5 w-5" />
                                    </button>

                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('vlyxir-interview-action', { detail: { action: 'toggle-left-sidebar' } }))}
                                        className={`p-2 rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                                            interviewState.leftSidebarOpen
                                                ? isDark ? "bg-indigo-500/25 border-indigo-500/40 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-650"
                                                : isDark ? "border-white/10 bg-white/5 text-slate-300 hover:border-white/30" : "border-slate-900/10 bg-slate-900/5 text-slate-500 hover:border-slate-900/20"
                                        }`}
                                        title="Toggle Left Toolpane"
                                    >
                                        <FolderOpen className="h-5 w-5" />
                                    </button>

                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('vlyxir-interview-action', { detail: { action: 'toggle-sidebar' } }))}
                                        className={`p-2 rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                                            interviewState.rightSidebarOpen
                                                ? isDark ? "bg-indigo-500/25 border-indigo-500/40 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-650"
                                                : isDark ? "border-white/10 bg-white/5 text-slate-300 hover:border-white/30" : "border-slate-900/10 bg-slate-900/5 text-slate-500 hover:border-slate-900/20"
                                        }`}
                                        title="Toggle Communications"
                                    >
                                        <LayoutTemplate className="h-5 w-5" />
                                    </button>
                                </>
                            )}

                            {!isHomeRoute && !isCodeIDE && !isCodeAnalysis && !isInterviewRoom && (
                                <div className={`hidden h-8 w-px md:block ${isDark ? "bg-white/10" : "bg-slate-900/10"}`} />
                            )}

                            {dailyProblemEnabled && (
                                <button
                                    onClick={() => setIsDailyModalOpen(!isDailyModalOpen)}
                                    className={`hidden sm:flex items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer ${
                                        dailyProblemSolved
                                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 p-2"
                                            : isDailyModalOpen
                                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 px-3.5 py-2 text-[9px] font-black uppercase tracking-widest gap-1.5"
                                            : isDark
                                            ? "border-amber-500/20 bg-amber-500/5 text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10 shadow-sm px-3.5 py-2 text-[9px] font-black uppercase tracking-widest gap-1.5"
                                            : "border-amber-200 bg-amber-50/50 text-amber-700 hover:border-amber-300 hover:bg-amber-100/60 shadow-sm px-3.5 py-2 text-[9px] font-black uppercase tracking-widest gap-1.5"
                                    }`}
                                    title={dailyProblemSolved ? "Daily Challenge Completed!" : "Open Today's Challenge"}
                                >
                                    {dailyProblemSolved ? (
                                        <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3px]" />
                                    ) : (
                                        <>
                                            <Flame className={`h-3.5 w-3.5 fill-current text-amber-500 ${isDailyModalOpen ? '' : 'animate-pulse'}`} />
                                            <span>Today's challenge</span>
                                        </>
                                    )}
                                </button>
                            )}

                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className={`group flex items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-3.5 transition-all duration-300 hover:scale-[1.02] active:scale-95 ${isDark
                                        ? "border-white/10 bg-white/5 text-slate-100 hover:border-white/30 hover:bg-white/10 backdrop-blur-md shadow-lg shadow-black/30"
                                        : "border-slate-900/10 bg-slate-900/5 text-slate-900 hover:border-slate-900/20 hover:bg-slate-900/10 backdrop-blur-md shadow-md"
                                        }`}
                                    title="Profile"
                                    aria-label="Profile"
                                >
                                    <div className={`relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${isDark
                                        ? "border-white/20 bg-linear-to-br from-indigo-500 via-purple-600 to-pink-600"
                                        : "border-slate-200 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500"
                                        }`}>
                                        {avatarUrl && !imageError ? (
                                            <Image src={avatarUrl} alt="Profile" fill sizes="32px" className="object-cover" unoptimized onError={() => setImageError(true)} />
                                        ) : (
                                            <User className={`h-4.5 w-4.5 text-white`} />
                                        )}
                                        {/* Current provider badge */}
                                        {user?.app_metadata?.provider === 'google' && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-xs">
                                                <svg viewBox="0 0 24 24" className="w-2 h-2">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.25.81-.59z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <span className={`hidden text-[11px] font-black tracking-[0.2em] md:block ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                                        {user ? `HEY, ${displayName.toUpperCase()}` : isLoading ? "LOADING..." : "LOGIN"}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-500 ${isDark ? "text-slate-400" : "text-slate-500"} ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <div className={`absolute right-0 z-50 mt-4 w-[22rem] overflow-hidden rounded-4xl border p-2 shadow-[0_30px_70px_rgba(0,0,0,0.5)] backdrop-blur-3xl animate-in fade-in slide-in-from-top-4 duration-300 ${isDark
                                        ? "border-white/10 bg-[#0A0F1A]/95"
                                        : "border-slate-200 bg-white/95"
                                        }`}>
                                        <div className="space-y-1">
                                            <div className={`mb-2 px-4 py-3 border-b ${isDark ? "border-white/5" : "border-slate-100"}`}>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>Logged in as</p>
                                                <p className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{user?.email || "Guest"}</p>
                                            </div>
                                            {user ? (
                                                <>
                                                    <button
                                                        onClick={() => { router.push('/your-profile'); setIsProfileOpen(false); }}
                                                        className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isDark ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
                                                    >
                                                        <User className={`h-4 w-4 transition-transform group-hover:scale-110 ${isDark ? "text-slate-400 group-hover:text-indigo-400" : "text-slate-400 group-hover:text-indigo-600"}`} />
                                                        Your profile
                                                    </button>
                                                    <button
                                                        onClick={() => { router.push('/leaderboard'); setIsProfileOpen(false); }}
                                                        className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isDark ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
                                                    >
                                                        <Trophy className={`h-4 w-4 transition-transform group-hover:scale-110 ${isDark ? "text-slate-400 group-hover:text-amber-400" : "text-slate-400 group-hover:text-amber-500"}`} />
                                                        Leaderboard
                                                    </button>
                                                    <button
                                                        onClick={() => { router.push('/your-plan'); setIsProfileOpen(false); }}
                                                        className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isDark ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
                                                    >
                                                        <Crown className={`h-4 w-4 transition-transform group-hover:scale-110 ${isDark ? "text-slate-400 group-hover:text-indigo-400" : "text-slate-400 group-hover:text-indigo-600"}`} />
                                                        Your plan
                                                    </button>
                                                    <button
                                                        onClick={() => { router.push('/forum/your-content'); setIsProfileOpen(false); }}
                                                        className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isDark ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
                                                    >
                                                        <BarChart2 className={`h-4 w-4 transition-transform group-hover:scale-110 ${isDark ? "text-slate-400 group-hover:text-cyan-400" : "text-slate-400 group-hover:text-indigo-600"}`} />
                                                        Community posts
                                                    </button>

                                                    <div className={`mx-4 my-2 h-px ${isDark ? "bg-white/5" : "bg-slate-100"}`} />

                                                    <button
                                                        onClick={() => { onOpenSettings(); setIsProfileOpen(false); }}
                                                        className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isDark ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
                                                    >
                                                        <Settings className={`h-4 w-4 transition-transform group-hover:rotate-90 ${isDark ? "text-slate-400 group-hover:text-cyan-400" : "text-slate-400 group-hover:text-indigo-600"}`} />
                                                        General settings
                                                    </button>
                                                    <button
                                                        onClick={() => { router.push('/account-settings'); setIsProfileOpen(false); }}
                                                        className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isDark ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
                                                    >
                                                        <User className={`h-4 w-4 transition-transform group-hover:scale-110 ${isDark ? "text-slate-400 group-hover:text-cyan-400" : "text-slate-400 group-hover:text-indigo-600"}`} />
                                                        Account settings
                                                    </button>
                                                    <button
                                                        onClick={() => { router.push('/account-controls'); setIsProfileOpen(false); }}
                                                        className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isDark ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
                                                    >
                                                        <Shield className={`h-4 w-4 transition-transform group-hover:scale-110 ${isDark ? "text-slate-400 group-hover:text-cyan-400" : "text-slate-400 group-hover:text-indigo-600"}`} />
                                                        Account controls
                                                    </button>

                                                    <div className={`mx-4 my-2 h-px ${isDark ? "bg-white/5" : "bg-slate-100"}`} />

                                                    {/* Switch Accounts Section */}
                                                    <div className="px-4 py-2">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <Users className={`w-3.5 h-3.5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>Switch Accounts</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => { 
                                                                    router.push('/login?add_account=true'); 
                                                                    setIsProfileOpen(false); 
                                                                }}
                                                                className={`p-1 rounded-lg transition-colors ${isDark
                                                                    ? "hover:bg-white/5 text-slate-400 hover:text-indigo-400"
                                                                    : "hover:bg-slate-100 text-slate-500 hover:text-indigo-500"
                                                                    }`}
                                                                title="Add Account"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                            <div className="space-y-1 max-h-48 overflow-y-auto overflow-x-hidden no-scrollbar custom-scrollbar">
                                                            {savedAccounts.filter(acc => acc.userId !== user?.id).length > 0 ? (
                                                                savedAccounts.filter(acc => acc.userId !== user?.id).map((acc) => (
                                                                    <div key={acc.userId} className="flex items-center gap-2 group/acc">
                                                                        <button
                                                                            onClick={() => { switchAccount(acc.userId); setIsProfileOpen(false); }}
                                                                            className={`flex-1 flex items-center gap-2.5 p-2 rounded-xl transition-all duration-200 text-left ${isDark ? "hover:bg-white/5 text-slate-300 hover:text-white" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}`}
                                                                        >
                                                                            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
                                                                                {acc.avatarUrl ? (
                                                                                    <Image src={acc.avatarUrl} alt={acc.username} fill sizes="24px" className="object-cover" />
                                                                                ) : (
                                                                                    <div className="w-full h-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white">
                                                                                        {acc.username.charAt(0).toUpperCase()}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                                                <p className="text-[11px] font-bold truncate" title={acc.username}>
                                                                                    {acc.username}
                                                                                </p>
                                                                            </div>
                                                                        </button>
                                                                        <div className="flex items-center gap-1 shrink-0 px-1">
                                                                            {/* Google Provider Icon */}
                                                                            {(acc.providers ? acc.providers.includes('google') : acc.provider === 'google') && (
                                                                                <div className={`p-1 rounded-lg ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                                                                                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5">
                                                                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.25.81-.59z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                                                                    </svg>
                                                                                </div>
                                                                            )}
                                                                            {/* Email Provider Icon */}
                                                                            {(acc.providers ? acc.providers.includes('email') : acc.provider !== 'google') && (
                                                                                <Mail className={`w-2.5 h-2.5 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
                                                                            )}
                                                                            <button 
                                                                                onClick={(e) => { e.stopPropagation(); removeAccount(acc.userId); }}
                                                                                className={`p-1.5 rounded-lg transition-all ${isDark ? "hover:bg-red-500/10 text-slate-500 hover:text-red-400" : "hover:bg-red-50 text-slate-400 hover:text-red-500"}`}
                                                                                title="Remove Account"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className={`text-[10px] text-center py-2 ${isDark ? "text-slate-600" : "text-slate-400"}`}>No other accounts saved</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className={`mx-4 my-2 h-px ${isDark ? "bg-white/5" : "bg-slate-100"}`} />

                                                    <button
                                                        onClick={async () => {
                                                            await signOut();
                                                            setIsProfileOpen(false);
                                                            router.push('/login');
                                                        }}
                                                        className={`group mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isDark ? "text-rose-400 hover:bg-rose-500/20" : "text-rose-600 hover:bg-rose-50"}`}
                                                    >
                                                        <LogOut className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isDark ? "text-rose-400" : "text-rose-500"}`} />
                                                        Logout
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => { onOpenSettings(); setIsProfileOpen(false); }}
                                                        className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isDark ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
                                                    >
                                                        <Settings className={`h-4 w-4 transition-transform group-hover:rotate-90 ${isDark ? "text-slate-400 group-hover:text-cyan-400" : "text-slate-400 group-hover:text-indigo-600"}`} />
                                                        General settings
                                                    </button>
                                                    <button
                                                        onClick={() => { router.push('/login'); setIsProfileOpen(false); }}
                                                        className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isDark ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
                                                    >
                                                        <User className={`h-4 w-4 transition-transform group-hover:scale-110 ${isDark ? "text-slate-400 group-hover:text-cyan-400" : "text-slate-400 group-hover:text-indigo-600"}`} />
                                                        Login
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
});
NavBar.displayName = "NavBar";

export default NavBar;
