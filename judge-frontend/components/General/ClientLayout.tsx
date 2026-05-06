"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAppContext } from '../../app/lib/auth/context';
import NavBar from './NavBar';
import NewNavBar from './NewNavBar';
import SubmissionsModal from './SubmissionsModal';
import SettingsModal from './SettingsModal';
import { isCodeAnalysisPath, isCodeIdePath, isCodeJudgePath, isForumPath } from '@/app/lib/utils/paths';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen, setIsSidebarOpen, isSubmissionsModalOpen, setIsSubmissionsModalOpen, useNewUi, isDark } = useAppContext();
    const pathname = usePathname();
    const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
    const excludedPaths = ['/docs', '/docs-int', '/admin', '/visuals', '/meet-developer', '/login', '/register', '/leaderboard', '/community-guidelines', '/what-is-vlyxir', '/features'];
    const isNavExcluded = excludedPaths.includes(pathname) || pathname.startsWith('/forum') || pathname.startsWith('/user') || pathname.startsWith('/account');
    const NavComponent = useNewUi ? NewNavBar : NavBar;

    const isHomePage = pathname === '/';
    const isAccountPage = pathname.startsWith('/account');
    const isSingleScreenPage = isCodeJudgePath(pathname) || isCodeIdePath(pathname) || isCodeAnalysisPath(pathname) || isForumPath(pathname);
    const isGradientPage = isHomePage || isSingleScreenPage || isAccountPage;

    // Base background classes based on theme and route
    const mainBgClass = isGradientPage 
        ? (isDark 
            ? "bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)]" 
            : "bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]")
        : "bg-background";

    return (
        <main className={`flex flex-col transition-colors duration-500 ${isSingleScreenPage ? "h-screen overflow-hidden" : "min-h-screen"} ${mainBgClass}`}>
            {!isNavExcluded && (
                <NavComponent
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    setIsSubmissionsModalOpen={setIsSubmissionsModalOpen}
                    onOpenSettings={() => setIsSettingsModalOpen(true)}
                />
            )}
            <div className="flex-1 min-h-0 flex flex-col">
                {children}
            </div>
            <SubmissionsModal
                isOpen={isSubmissionsModalOpen}
                onClose={() => setIsSubmissionsModalOpen(false)}
            />
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            />
        </main>
    );
}
