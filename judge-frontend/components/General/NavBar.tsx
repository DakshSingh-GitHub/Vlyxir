"use client";

import React, { memo, useEffect, useRef } from 'react';
import { anime } from '../../app/lib/anime';
import { History, LayoutGrid } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NavDropdown from './NavDropdown';
import { usePathname } from 'next/navigation';

interface NavBarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    isSubmissionsModalOpen: boolean;
    setIsSubmissionsModalOpen: (isOpen: boolean) => void;
    isDark: boolean;
    toggleTheme: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NavBar: React.FC<NavBarProps> = memo(({ isSidebarOpen, setIsSidebarOpen, isSubmissionsModalOpen, setIsSubmissionsModalOpen, isDark, toggleTheme }) => {
    const pathname = usePathname();
    const isCodeIDE = pathname === '/code-ide';
    const isCodeJudge = pathname === '/code-judge';
    const headerRef = useRef<HTMLElement>(null);
    const navItemsRef = useRef<HTMLDivElement>(null);

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
                        {!isCodeIDE && (
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

                        {!isCodeIDE && (
                            <button
                                onClick={() =>
                                    setIsSidebarOpen(!isSidebarOpen)
                                }
                                className="flex items-center justify-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md"
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

                    <div className="h-6 w-px bg-gray-100 dark:bg-gray-800 hidden md:block" />

                    <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
                </div>
            </div>
        </header>
    );
});
NavBar.displayName = "NavBar";

export default NavBar;
