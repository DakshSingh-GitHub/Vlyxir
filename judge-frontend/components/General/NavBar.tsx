"use client";

import React, { memo, useEffect, useRef, useState } from 'react';
import { anime } from '../../app/lib/anime';
import { History, LayoutGrid, User, Settings, LogOut, Shield, ChevronDown } from 'lucide-react';
import NavDropdown from './NavDropdown';
import { usePathname, useRouter } from 'next/navigation';
import { isCodeJudgePath } from '../../app/lib/paths';
import { useAuth } from '../../app/lib/auth-context';

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
                                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-indigo-200 bg-indigo-100 shadow-sm transition-transform group-hover:scale-105 dark:border-indigo-800 dark:bg-indigo-900/40">
                                        <User className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <span className="hidden text-sm font-bold tracking-tight md:block">
                                        {isLoading ? "LOADING..." : user ? `HEY, ${displayName.toUpperCase()}` : "LOGIN"}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
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
                                                        onClick={() => { router.push('/account-settings'); setIsProfileOpen(false); }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
                                                    >
                                                        <User className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                                                        Account settings
                                                    </button>

                                                    <div className="my-1 h-px bg-gray-100 dark:bg-gray-800 mx-2" />

                                                    <button
                                                        onClick={() => { router.push('/account-controls'); setIsProfileOpen(false); }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
                                                    >
                                                        <Shield className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                                                        Account controls
                                                    </button>
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
