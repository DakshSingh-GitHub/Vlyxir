/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { anime } from '../../app/lib/utils/anime';
import { useAppContext } from '../../app/lib/auth/context';
import { CODE_JUDGE_PATH, CODE_JUDGE_MDE_PATH, CODE_IDE_PATH, CODE_IDE_MDE_PATH, CODE_ANALYSIS_PATH, CODE_ANALYSIS_MDE_PATH } from '../../app/lib/utils/paths';

type RouteItem = {
    name: string;
    path: string;
    icon: string;
    subtext: string;
    aliases?: string[];
};

export default function NavDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { codeJudgePath, codeIdePath, codeAnalysisPath, isDark } = useAppContext();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const arrowRef = useRef<SVGSVGElement>(null);

    const routes: RouteItem[] = [
        { name: "VLYXIR Home", path: "/", icon: "👋", subtext: "See you here!" },
        {
            name: "VLYXIR Arena",
            path: codeJudgePath,
            icon: "⚔️",
            subtext: "Select a problem and start solving!",
            aliases: [CODE_JUDGE_PATH, CODE_JUDGE_MDE_PATH]
        },
        {
            name: "VLYXIR Forge",
            path: codeIdePath,
            icon: "💻",
            subtext: "Think and Build!",
            aliases: [CODE_IDE_PATH, CODE_IDE_MDE_PATH]
        },
        {
            name: "VLYXIR Insights",
            path: codeAnalysisPath,
            icon: "📃",
            subtext: "Now look at what you did",
            aliases: [CODE_ANALYSIS_PATH, CODE_ANALYSIS_MDE_PATH]
        },
    ];

    const currentRoute = routes.find((route) => route.path === pathname || (route.aliases?.includes(pathname) ?? false)) || routes[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (menuRef.current) {
                anime({
                    targets: menuRef.current,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    scale: [0.95, 1],
                    duration: 300,
                    easing: 'easeOutExpo'
                });
            }
            if (arrowRef.current) {
                anime({
                    targets: arrowRef.current,
                    rotate: 180,
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        } else { // When dropdown is closed
            if (arrowRef.current) {
                anime({
                    targets: arrowRef.current,
                    rotate: 0,
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        }
    }, [isOpen]);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleNavigate = (path: string) => {
        router.push(path);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all duration-300 group active:scale-95 ${isDark
                    ? "bg-slate-900/90 border-slate-700/70 text-slate-100 shadow-sm hover:shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                    : "bg-white border-slate-200 text-slate-900 shadow-sm hover:shadow-[0_0_12px_rgba(99,102,241,0.18)]"
                    }`}
            >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                    {currentRoute.icon === "vlyxir-logo" ? (
                        <img src="/vlyxir/logo.png" alt="VLYXIR Logo" className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-lg">{currentRoute.icon}</span>
                    )}
                </div>
                <span className={`text-xl font-black tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
                    {currentRoute.name}
                </span>
                <svg
                    ref={arrowRef}
                    className={`w-4 h-4 transition-colors ${isDark ? "text-slate-400 group-hover:text-indigo-300" : "text-slate-400 group-hover:text-indigo-500"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className={`absolute top-full left-0 mt-3 w-80 backdrop-blur-2xl border rounded-4xl shadow-2xl p-3 z-50 overflow-hidden opacity-0 ${isDark
                        ? "bg-slate-950/95 border-slate-800"
                        : "bg-white/95 border-slate-200"
                        }`}
                >
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <button
                                key={route.path}
                                onClick={() => handleNavigate(route.path)}
                                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 ${(pathname === route.path || (route.aliases?.includes(pathname) ?? false))
                                    ? (isDark
                                        ? "bg-indigo-900/20 text-indigo-300 border border-indigo-800/30 shadow-sm"
                                        : "bg-indigo-50/70 text-indigo-700 border border-indigo-100/70 shadow-sm")
                                    : (isDark
                                        ? "text-slate-400 hover:text-indigo-300 hover:bg-slate-900"
                                        : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50")
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                    {route.icon === "vlyxir-logo" ? (
                                        <img src="/vlyxir/logo.png" alt="VLYXIR Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-2xl">{route.icon}</span>
                                    )}
                                </div>
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-bold text-[15px] tracking-tight">{route.name}</span>
                                    <span className={`text-[10px] leading-tight font-medium ${isDark ? "opacity-60" : "opacity-70"}`}>
                                        {route.subtext}
                                    </span>
                                </div>
                                {(pathname === route.path || (route.aliases?.includes(pathname) ?? false)) && (
                                    <div
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
