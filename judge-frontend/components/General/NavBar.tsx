"use client";

import React, { memo, useEffect, useRef, useState } from 'react';
import { anime } from '../../app/lib/utils/anime';
import { History, LayoutGrid, User, Settings, LogOut, Shield, ChevronDown, Users, Plus, X, Mail, Crown, MessageSquare, Trophy } from 'lucide-react';
import NavDropdown from './NavDropdown';
import { usePathname, useRouter } from 'next/navigation';
import { isCodeJudgePath, isCodeIdePath, isCodeAnalysisPath } from '../../app/lib/utils/paths';
import { useAuth } from '../../app/lib/auth/auth-context';
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
    const [imageError, setImageError] = useState(false);

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
            className="sticky top-0 z-50 shrink-0 border-b border-white/5 bg-white/70 px-4 py-3 opacity-0 backdrop-blur-2xl transition-all duration-300 dark:border-gray-800/40 dark:bg-[#0B0C15]/80 md:px-8 md:py-4"
        >
            <div className="mx-auto flex max-w-450 items-center justify-between px-0 md:px-10">
                <div
                    ref={navItemsRef}
                    className="flex items-center gap-4 opacity-0"
                >
                    <NavDropdown />
                </div>
                <div className="flex items-center gap-3 md:gap-6">
                    <>
                        {isCodeAnalysis && (
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent("open-code-analysis-records"))}
                                className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-gray-600 shadow-sm transition-all duration-200 hover:border-indigo-100 hover:bg-white hover:text-indigo-600 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-900 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
                                title="Show analysis records"
                            >
                                <span className="text-xs font-semibold uppercase tracking-wider">Show records</span>
                            </button>
                        )}

                        {user && !isHomeRoute && !isCodeIDE && !isCodeAnalysis && (
                            <button
                                onClick={() => setIsSubmissionsModalOpen(true)}
                                className="group flex items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-2.5 text-gray-500 shadow-sm transition-all duration-200 hover:border-indigo-100 hover:bg-white hover:text-indigo-600 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-indigo-900 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
                                title="See Submissions"
                            >
                                <History className="h-5 w-5 transition-transform group-hover:rotate-[-20deg]" />
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
                                className="hidden items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-gray-600 shadow-sm transition-all duration-200 hover:border-indigo-100 hover:bg-white hover:text-indigo-600 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 lg:flex dark:hover:border-indigo-900 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
                                title="Select UI Grid"
                            >
                                <LayoutGrid className="h-4 w-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">UI Grid</span>
                            </button>
                        )}

                        {!isHomeRoute && !isCodeIDE && !isCodeAnalysis && (
                            <button
                                onClick={() =>
                                    setIsSidebarOpen(!isSidebarOpen)
                                }
                                className={`${isCodeJudge ? "hidden lg:flex" : "flex"} items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-2.5 text-gray-500 shadow-sm transition-all duration-200 hover:bg-white dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800`}
                                title={
                                    isSidebarOpen
                                        ? "Hide sidebar"
                                        : "Show sidebar"
                                }
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
                    </>

                    {!isHomeRoute && !isCodeIDE && !isCodeAnalysis && (
                        <div className="hidden h-6 w-px bg-gray-100 dark:bg-gray-800 md:block" />
                    )}

                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="group flex items-center gap-3 rounded-full border border-gray-100 bg-gray-50 py-1.5 pl-1.5 pr-3 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:bg-white hover:shadow-md active:scale-95 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-indigo-900 dark:hover:bg-gray-900"
                                    title="Profile"
                                    aria-label="Profile"
                                >
                                    <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-indigo-200 bg-indigo-100 shadow-sm transition-transform group-hover:scale-105 dark:border-indigo-800 dark:bg-indigo-900/40">
                                        {avatarUrl && !imageError ? (
                                            <Image src={avatarUrl} alt="Profile" fill sizes="32px" className="object-cover" unoptimized onError={() => setImageError(true)} />
                                        ) : (
                                            <User className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
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
                                    <span className="hidden text-sm font-bold tracking-tight md:block">
                                        {user ? `HEY, ${displayName.toUpperCase()}` : isLoading ? "LOADING..." : "LOGIN"}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-3 w-[22rem] rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                        <div className="p-2 space-y-1">
                                            <button
                                                onClick={() => { onOpenSettings(); setIsProfileOpen(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
                                            >
                                                <Settings className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                                                General settings
                                            </button>
                                            {user ? (
                                                <>
                                                    <button
                                                        onClick={() => { router.push('/your-profile'); setIsProfileOpen(false); }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
                                                    >
                                                        <User className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                                                        Your profile
                                                    </button>
                                                    <button
                                                        onClick={() => { router.push('/account-settings'); setIsProfileOpen(false); }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
                                                    >
                                                        <User className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                                                        Account settings
                                                    </button>
                                                    <button
                                                        onClick={() => { router.push('/your-plan'); setIsProfileOpen(false); }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
                                                    >
                                                        <Crown className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                                                        Your plan
                                                    </button>
                                                    <button
                                                        onClick={() => { router.push('/forum/your-content'); setIsProfileOpen(false); }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
                                                    >
                                                        <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                                                        Community post
                                                    </button>
                                                    <button
                                                        onClick={() => { router.push('/leaderboard'); setIsProfileOpen(false); }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
                                                    >
                                                        <Trophy className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                                                        Leaderboard
                                                    </button>

                                                    <div className="my-1 h-px bg-gray-100 dark:bg-gray-800 mx-2" />

                                                    <button
                                                        onClick={() => { router.push('/account-controls'); setIsProfileOpen(false); }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
                                                    >
                                                        <Shield className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                                                        Account controls
                                                    </button>

                                                    <div className="my-1 h-px bg-gray-100 dark:bg-gray-800 mx-2" />

                                                    {/* Switch Accounts Section */}
                                                    <div className="p-2">
                                                        <div className="flex items-center justify-between px-2 mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Switch Accounts</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => { 
                                                                    router.push('/login?add_account=true'); 
                                                                    setIsProfileOpen(false); 
                                                                }}
                                                                className="p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-500 transition-colors"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <div className="space-y-0.5 max-h-40 overflow-y-auto overflow-x-hidden no-scrollbar custom-scrollbar">
                                                            {savedAccounts.filter(acc => acc.userId !== user?.id).length > 0 ? (
                                                                savedAccounts.filter(acc => acc.userId !== user?.id).map((acc) => (
                                                                    <div key={acc.userId} className="flex items-center gap-1 group/acc">
                                                                        <button
                                                                            onClick={() => { switchAccount(acc.userId); setIsProfileOpen(false); }}
                                                                            className="flex-1 flex items-center gap-2.5 px-2 py-2 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                                                        >
                                                                            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 shrink-0">
                                                                                {acc.avatarUrl ? (
                                                                                    <Image src={acc.avatarUrl} alt={acc.username} fill sizes="24px" className="object-cover" />
                                                                                ) : (
                                                                                    <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[8px] font-bold text-indigo-600 dark:text-indigo-400">
                                                                                        {acc.username.charAt(0).toUpperCase()}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                                                <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300 truncate" title={acc.username}>
                                                                                    {acc.username}
                                                                                </p>
                                                                            </div>
                                                                        </button>
                                                                        <div className="flex items-center gap-1 shrink-0 px-1">
                                                                            {/* Google Provider Icon */}
                                                                            {(acc.providers ? acc.providers.includes('google') : acc.provider === 'google') && (
                                                                                <div className="p-1 rounded-lg bg-gray-50 dark:bg-gray-800">
                                                                                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5">
                                                                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.25.81-.59z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                                                                    </svg>
                                                                                </div>
                                                                            )}
                                                                            {/* Email Provider Icon */}
                                                                            {(acc.providers ? acc.providers.includes('email') : acc.provider !== 'google') && (
                                                                                <Mail className="w-2.5 h-2.5 text-gray-400 dark:text-gray-600" />
                                                                            )}
                                                                            <button 
                                                                                onClick={(e) => { e.stopPropagation(); removeAccount(acc.userId); }}
                                                                                className="p-1.5 rounded-lg transition-all hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
                                                                                title="Remove Account"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-[10px] text-center py-2 text-gray-400">No other accounts</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="my-1 h-px bg-gray-100 dark:bg-gray-800 mx-2" />
                                                    <button
                                                        onClick={async () => {
                                                            await signOut();
                                                            setIsProfileOpen(false);
                                                            router.push('/login');
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors group"
                                                    >
                                                        <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-600" />
                                                        Logout
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => { router.push('/login'); setIsProfileOpen(false); }}
                                                    className="group w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors"
                                                >
                                                    <LogInFallbackIcon />
                                                    Login
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
            </div>
        </header>
    );
});
NavBar.displayName = "NavBar";

export default NavBar;

function LogInFallbackIcon() {
    return <User className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />;
}
