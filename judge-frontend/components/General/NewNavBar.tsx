"use client";

import React, { memo, useEffect, useRef, useState } from 'react';
import { anime } from '../../app/lib/anime';
import { History, LayoutGrid, User, Settings, LogOut, Shield, ChevronDown } from 'lucide-react';
import NewNavDropdown from './NewNavDropdown';
import { usePathname, useRouter } from 'next/navigation';
import { isCodeJudgePath } from '../../app/lib/paths';
import { useAuth } from '../../app/lib/auth-context';
import { useAppContext } from '../../app/lib/context';

interface NavBarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    setIsSubmissionsModalOpen: (isOpen: boolean) => void;
    onOpenSettings: () => void;
}

const NavBar: React.FC<NavBarProps> = memo(({ isSidebarOpen, setIsSidebarOpen, setIsSubmissionsModalOpen, onOpenSettings }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading, signOut } = useAuth();
    const { isDark } = useAppContext();
    const displayName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.username ||
        user?.email?.split("@")[0] ||
        "Login";
    const isHomeRoute = pathname === '/';
    const isCodeIDE = pathname === '/code-ide' || pathname === '/code-ide-mde';
    const isCodeJudge = isCodeJudgePath(pathname);
    const isCodeAnalysis = pathname === '/code-analysis' || pathname === '/code-analysis-mde';
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
            className="sticky top-0 z-50 shrink-0 px-3 pt-4 pb-2 opacity-0 md:px-6 md:pt-5 md:pb-3"
        >
            <div className="mx-auto flex max-w-400 justify-center">
                <div className={`relative w-[90vw] max-w-[90vw] rounded-full px-4 py-3 backdrop-blur-3xl before:pointer-events-none before:absolute before:inset-px before:rounded-full before:content-[''] ${isDark
                    ? "border border-slate-700/60 bg-[linear-gradient(135deg,rgba(8,12,20,0.98),rgba(15,23,42,0.9))] shadow-[0_22px_60px_rgba(2,6,23,0.5)] before:border before:border-slate-600/40"
                    : "border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(241,245,249,0.94))] shadow-[0_22px_60px_rgba(15,23,42,0.12)] before:border before:border-slate-200/70"
                    }`}>
                    <div className={`pointer-events-none absolute inset-x-[22%] top-0 h-px bg-linear-to-r from-transparent via-current to-transparent ${isDark ? "text-slate-500/20" : "text-slate-300/80"}`} />
                    <div className="relative flex items-center justify-between gap-3">
                        <div
                            ref={navItemsRef}
                            className="flex items-center gap-4 opacity-0"
                        >
                            <NewNavDropdown />
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                            {isCodeAnalysis && (
                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent("open-code-analysis-records"))}
                                    className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium transition-all duration-200 hover:shadow-[0_14px_28px_rgba(2,6,23,0.28)] ${isDark
                                        ? "border-slate-600/50 bg-slate-900/50 text-slate-200 hover:border-slate-500/60 hover:bg-slate-800/70 hover:text-white"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    title="Show analysis records"
                                >
                                    <span>Show records</span>
                                </button>
                            )}

                            {user && !isHomeRoute && !isCodeIDE && !isCodeAnalysis && (
                                <button
                                    onClick={() => setIsSubmissionsModalOpen(true)}
                                    className={`group flex items-center justify-center rounded-full border p-2.5 transition-all duration-200 hover:shadow-[0_14px_28px_rgba(2,6,23,0.28)] ${isDark
                                        ? "border-slate-600/50 bg-slate-900/50 text-slate-300 hover:border-slate-500/60 hover:bg-slate-800/70 hover:text-white"
                                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    title="See Submissions"
                                >
                                    <History className="w-5 h-5 transition-transform group-hover:rotate-[-20deg]" />
                                </button>
                            )}

                            {(isCodeJudge || isCodeIDE) && (
                                <button
                                    onClick={() => {
                                        const eventName = isCodeJudge
                                            ? "open-code-judge-ui-grid-modal"
                                            : "open-code-ide-ui-grid-modal";
                                        window.dispatchEvent(new CustomEvent(eventName));
                                    }}
                                    className={`hidden items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium transition-all duration-200 hover:shadow-[0_14px_28px_rgba(2,6,23,0.28)] lg:flex ${isDark
                                        ? "border-slate-600/50 bg-slate-900/50 text-slate-200 hover:border-slate-500/60 hover:bg-slate-800/70 hover:text-white"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    title="Select UI Grid"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    <span>UI Grid</span>
                                </button>
                            )}

                            {!isHomeRoute && !isCodeIDE && !isCodeAnalysis && (
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className={`${isCodeJudge ? "hidden lg:flex" : "flex"} items-center justify-center rounded-full border p-2.5 transition-all duration-200 hover:shadow-[0_14px_28px_rgba(2,6,23,0.28)] ${isDark
                                        ? "border-slate-600/50 bg-slate-900/50 text-slate-300 hover:border-slate-500/60 hover:bg-slate-800/70 hover:text-white"
                                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
                                >
                                    {isSidebarOpen ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    )}
                                </button>
                            )}

                            {!isHomeRoute && !isCodeIDE && !isCodeAnalysis && (
                                <div className={`hidden h-8 w-px md:block ${isDark ? "bg-slate-600/50" : "bg-slate-200"}`} />
                            )}

                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className={`group flex items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-3 transition-all duration-200 hover:shadow-[0_14px_28px_rgba(2,6,23,0.28)] active:scale-95 ${isDark
                                        ? "border-slate-600/50 bg-slate-900/50 text-slate-100 hover:border-slate-500/60 hover:bg-slate-800/70"
                                        : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                    title="Profile"
                                    aria-label="Profile"
                                >
                                    <div className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-transform group-hover:scale-105 ${isDark
                                        ? "border-slate-600/50 bg-linear-to-br from-slate-700 via-slate-800 to-slate-900"
                                        : "border-slate-200 bg-linear-to-br from-slate-50 via-white to-slate-100"
                                        }`}>
                                        <User className={`w-4.5 h-4.5 ${isDark ? "text-cyan-100" : "text-slate-600"}`} />
                                    </div>
                                    <span className={`hidden text-sm font-medium tracking-[0.18em] md:block ${isDark ? "text-slate-100/90" : "text-slate-700"}`}>
                                        {isLoading ? "LOADING..." : user ? `HEY, ${displayName.toUpperCase()}` : "LOGIN"}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDark ? "text-slate-400" : "text-slate-500"} ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <div className={`absolute right-0 z-50 mt-3 w-60 overflow-hidden rounded-[1.75rem] border shadow-[0_20px_48px_rgba(2,6,23,0.38)] backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-200 ${isDark
                                        ? "border-slate-700/60 bg-[linear-gradient(180deg,rgba(8,12,20,0.98),rgba(15,23,42,0.92))]"
                                        : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))]"
                                        }`}>
                                        <div className="space-y-1 p-2">
                                            <button
                                                onClick={() => { onOpenSettings(); setIsProfileOpen(false); }}
                                                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${isDark ? "text-slate-200 hover:bg-slate-800/80" : "text-slate-700 hover:bg-slate-100"}`}
                                            >
                                                <Settings className={`w-4 h-4 ${isDark ? "text-slate-400 group-hover:text-cyan-200" : "text-slate-400 group-hover:text-indigo-500"}`} />
                                                General settings
                                            </button>
                                            {user ? (
                                                <>
                                                    <button
                                                        onClick={() => { router.push('/account-settings'); setIsProfileOpen(false); }}
                                                        className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${isDark ? "text-slate-200 hover:bg-slate-800/80" : "text-slate-700 hover:bg-slate-100"}`}
                                                    >
                                                        <User className={`w-4 h-4 ${isDark ? "text-slate-400 group-hover:text-cyan-200" : "text-slate-400 group-hover:text-indigo-500"}`} />
                                                        Account settings
                                                    </button>

                                                    <div className={`mx-2 my-1 h-px ${isDark ? "bg-slate-600/50" : "bg-slate-200"}`} />

                                                    <button
                                                        onClick={() => { router.push('/account-controls'); setIsProfileOpen(false); }}
                                                        className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${isDark ? "text-slate-200 hover:bg-slate-800/80" : "text-slate-700 hover:bg-slate-100"}`}
                                                    >
                                                        <Shield className={`w-4 h-4 ${isDark ? "text-slate-400 group-hover:text-cyan-200" : "text-slate-400 group-hover:text-indigo-500"}`} />
                                                        Account controls
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            await signOut();
                                                            setIsProfileOpen(false);
                                                            router.push('/login');
                                                        }}
                                                        className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${isDark ? "text-rose-300 hover:bg-rose-500/10" : "text-rose-600 hover:bg-rose-50"}`}
                                                    >
                                                        <LogOut className={`w-4 h-4 ${isDark ? "text-rose-300 group-hover:text-rose-200" : "text-rose-500 group-hover:text-rose-600"}`} />
                                                        Logout
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => { router.push('/login'); setIsProfileOpen(false); }}
                                                    className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${isDark ? "text-slate-200 hover:bg-slate-800/80" : "text-slate-700 hover:bg-slate-100"}`}
                                                >
                                                    <User className={`w-4 h-4 ${isDark ? "text-slate-400 group-hover:text-cyan-200" : "text-slate-400 group-hover:text-indigo-500"}`} />
                                                    Login
                                                </button>
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
