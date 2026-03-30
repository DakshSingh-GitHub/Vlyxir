"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAppContext } from '../../app/lib/context';
import NavBar from './NavBar';
import NewNavBar from './NewNavBar';
import SubmissionsModal from './SubmissionsModal';
import SettingsModal from './SettingsModal';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen, setIsSidebarOpen, isSubmissionsModalOpen, setIsSubmissionsModalOpen, useNewUi } = useAppContext();
    const pathname = usePathname();
    const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
    const excludedPaths = ['/', '/docs', '/docs-int', '/admin', '/visuals', '/meet-developer', '/login']
    const isHomePage = excludedPaths.includes(pathname);
    const NavComponent = useNewUi ? NewNavBar : NavBar;

    return (
        <main className="flex h-screen flex-col">
            {!isHomePage && (
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
