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
            className="sticky top-0 z-50 shrink-0 px-3 pt-4 pb-2 opacity-0 md:px-6 md:pt-6 md:pb-4"
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
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            {isCodeAnalysis && (
                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent("open-code-analysis-records"))}
                                    className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${isDark
                                        ? "border-white/10 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/15 hover:text-white backdrop-blur-md shadow-lg shadow-black/20"
                                        : "border-slate-900/10 bg-slate-900/5 text-slate-700 hover:border-slate-900/20 hover:bg-slate-900/10 hover:text-slate-900 backdrop-blur-md"
                                        }`}
                                    title="Show analysis records"
                                >
                                    <span>Show records</span>
                                </button>
                            )}

                            {user && !isHomeRoute && !isCodeIDE && !isCodeAnalysis && (
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

                            {(isCodeJudge || isCodeIDE) && (
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

                            {!isHomeRoute && !isCodeIDE && !isCodeAnalysis && (
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

                            {!isHomeRoute && !isCodeIDE && !isCodeAnalysis && (
                                <div className={`hidden h-8 w-px md:block ${isDark ? "bg-white/10" : "bg-slate-900/10"}`} />
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
                                    <div className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${isDark
                                        ? "border-white/20 bg-linear-to-br from-indigo-500 via-purple-600 to-pink-600"
                                        : "border-slate-200 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500"
                                        }`}>
                                        <User className={`h-4.5 w-4.5 text-white`} />
                                    </div>
                                    <span className={`hidden text-[11px] font-black tracking-[0.2em] md:block ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                                        {isLoading ? "LOADING..." : user ? `HEY, ${displayName.toUpperCase()}` : "LOGIN"}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-500 ${isDark ? "text-slate-400" : "text-slate-500"} ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <div className={`absolute right-0 z-50 mt-4 w-64 overflow-hidden rounded-[2rem] border p-2 shadow-[0_30px_70px_rgba(0,0,0,0.5)] backdrop-blur-3xl animate-in fade-in slide-in-from-top-4 duration-300 ${isDark
                                        ? "border-white/10 bg-[#0A0F1A]/95"
                                        : "border-slate-200 bg-white/95"
                                        }`}>
                                        <div className="space-y-1">
                                            <div className={`mb-2 px-4 py-3 border-b ${isDark ? "border-white/5" : "border-slate-100"}`}>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>Logged in as</p>
                                                <p className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{user?.email || "Guest"}</p>
                                            </div>
                                            <button
                                                onClick={() => { onOpenSettings(); setIsProfileOpen(false); }}
                                                className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isDark ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
                                            >
                                                <Settings className={`h-4 w-4 transition-transform group-hover:rotate-90 ${isDark ? "text-slate-400 group-hover:text-cyan-400" : "text-slate-400 group-hover:text-indigo-600"}`} />
                                                General settings
                                            </button>
                                            {user ? (
                                                <>
                                                    <button
                                                        onClick={() => { router.push('/account-settings'); setIsProfileOpen(false); }}
                                                        className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isDark ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
                                                    >
                                                        <User className={`h-4 w-4 transition-transform group-hover:scale-110 ${isDark ? "text-slate-400 group-hover:text-cyan-400" : "text-slate-400 group-hover:text-indigo-600"}`} />
                                                        Account settings
                                                    </button>

                                                    <div className={`mx-4 my-2 h-px ${isDark ? "bg-white/5" : "bg-slate-100"}`} />

                                                    <button
                                                        onClick={() => { router.push('/account-controls'); setIsProfileOpen(false); }}
                                                        className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isDark ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
                                                    >
                                                        <Shield className={`h-4 w-4 transition-transform group-hover:scale-110 ${isDark ? "text-slate-400 group-hover:text-cyan-400" : "text-slate-400 group-hover:text-indigo-600"}`} />
                                                        Account controls
                                                    </button>
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
                                                <button
                                                    onClick={() => { router.push('/login'); setIsProfileOpen(false); }}
                                                    className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isDark ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100"}`}
                                                >
                                                    <User className={`h-4 w-4 transition-transform group-hover:scale-110 ${isDark ? "text-slate-400 group-hover:text-cyan-400" : "text-slate-400 group-hover:text-indigo-600"}`} />
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
