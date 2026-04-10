"use client";

import React from 'react';
import { useAppContext } from '../../app/lib/context';

export default function ForumLayout({ children }: { children: React.ReactNode }) {
    const { isDark } = useAppContext();
    
    return (
        <div className={`flex-1 flex overflow-hidden min-h-0 ${isDark ? 'bg-[#0f172a] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
            <div className="w-full flex h-full">
                {children}
            </div>
        </div>
    );
}
