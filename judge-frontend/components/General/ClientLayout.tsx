"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAppContext } from '../../app/lib/context';
import NavBar from './NavBar';
import SubmissionsModal from './SubmissionsModal';
import SettingsModal from './SettingsModal';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen, setIsSidebarOpen, isSubmissionsModalOpen, setIsSubmissionsModalOpen } = useAppContext();
    const pathname = usePathname();
    const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
    const excludedPaths = ['/', '/docs', '/docs-int', '/admin', '/visuals', '/meet-developer', '/login']
    const isHomePage = excludedPaths.includes(pathname);

    return (
        <main className="flex h-screen flex-col">
            {!isHomePage && (
                <NavBar
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
