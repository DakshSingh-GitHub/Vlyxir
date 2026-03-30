"use client";

import React, { memo, useEffect, useRef, useState } from 'react';
import { anime } from '../../app/lib/anime';
import { History, LayoutGrid, User, Settings, LogOut, Shield, ChevronDown } from 'lucide-react';
import NavDropdown from './NavDropdown';
import { usePathname, useRouter } from 'next/navigation';
import { isCodeJudgePath } from '../../app/lib/paths';

interface NavBarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    setIsSubmissionsModalOpen: (isOpen: boolean) => void;
    onOpenSettings: () => void;
}

const NavBar: React.FC<NavBarProps> = memo(({ isSidebarOpen, setIsSidebarOpen, setIsSubmissionsModalOpen, onOpenSettings }) => {
    const pathname = usePathname();
    const router = useRouter();
    const isHomeRoute = pathname === '/';
    const isCodeIDE = pathname === '/code-ide';
    const isCodeJudge = isCodeJudgePath(pathname);
    const isCodeAnalysis = pathname === '/code-analysis';
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
            className="bg-white/70 dark:bg-gray-950/70 backdrop-blur-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none border-b border-gray-100 dark:border-gray-800/50 px-4 py-3 md:px-8 md:py-4 transition-colors duration-200 sticky top-0 z-50 shrink-0 opacity-0"
        >
            <div className="max-w-450 mx-auto flex items-center justify-between md:px-10 px-0">
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
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200 border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900 shadow-sm hover:shadow-md"
                                title="Show analysis records"
                            >
                                <span className="text-xs font-medium">Show records</span>
                            </button>
                        )}

                        {!isHomeRoute && !isCodeIDE && !isCodeAnalysis && (
                            <button
                                onClick={() => setIsSubmissionsModalOpen(true)}
                                className="flex items-center justify-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200 border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900 group shadow-sm hover:shadow-md"
                                title="See Submissions"
                            >
                                <History className="w-5 h-5 group-hover:rotate-[-20deg] transition-transform" />
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
                                className="hidden lg:flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200 border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900 shadow-sm hover:shadow-md"
                                title="Select UI Grid"
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span className="text-xs font-medium">UI Grid</span>
                            </button>
                        )}

                        {!isHomeRoute && !isCodeIDE && !isCodeAnalysis && (
                            <button
                                onClick={() =>
                                    setIsSidebarOpen(!isSidebarOpen)
                                }
                                className={`${isCodeJudge ? "hidden lg:flex" : "flex"} items-center justify-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md`}
                                title={
                                    isSidebarOpen
                                        ? "Hide sidebar"
                                        : "Show sidebar"
                                }
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
                    </>

                    {!isHomeRoute && !isCodeIDE && !isCodeAnalysis && (
                        <div className="h-6 w-px bg-gray-100 dark:bg-gray-800 hidden md:block" />
                    )}

                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 pl-1.5 pr-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900 shadow-sm hover:shadow-md active:scale-95 group"
                            title="Profile"
                            aria-label="Profile"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shadow-sm overflow-hidden transition-transform group-hover:scale-105">
                                <User className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-sm font-semibold tracking-tight hidden md:block">Hey, User</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={() => { router.push('/'); setIsProfileOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
                                    >
                                        <User className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                                        Account settings
                                    </button>
                                    <button
                                        onClick={() => { onOpenSettings(); setIsProfileOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
                                    >
                                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                                        General settings
                                    </button>
                                    
                                    <div className="my-1 h-px bg-gray-100 dark:bg-gray-800 mx-2" />
                                    
                                    <button
                                        onClick={() => { router.push('/'); setIsProfileOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
                                    >
                                        <Shield className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                                        Account controls
                                    </button>
                                    <button
                                        onClick={() => { router.push('/'); setIsProfileOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors group"
                                    >
                                        <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-600" />
                                        Logout
                                    </button>
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
