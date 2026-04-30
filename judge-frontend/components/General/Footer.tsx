/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import {Scale} from "lucide-react";
import Link from "next/link";
import { useAppContext } from "../../app/lib/auth/context";

export default function Footer() {
    const { codeJudgePath, isDark } = useAppContext();
    return(
        <footer className={`relative z-10 border-t backdrop-blur-xl ${isDark ? "border-gray-900 bg-gray-950/50" : "border-gray-200 bg-white/70"}`}>
            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                        <img src="/vlyxir/logo.png" alt="VLYXIR Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className={`font-black text-xl tracking-tighter ${isDark ? "text-slate-100" : "text-slate-900"}`}>VLYXIR</span>
                </div>
                <p className={`text-sm font-medium ${isDark ? "text-gray-500" : "text-gray-600"}`}>
                    © 2026 VLYXIR. Built with passion for the developer community.
                </p>
                <div className="flex items-center gap-6">
                    <Link href={codeJudgePath} className={`text-sm font-bold transition-colors ${isDark ? "text-slate-300 hover:text-indigo-400" : "text-slate-700 hover:text-indigo-600"}`}>Practice</Link>
                    <Link href="/leaderboard" className={`text-sm font-bold transition-colors ${isDark ? "text-slate-300 hover:text-indigo-400" : "text-slate-700 hover:text-indigo-600"}`}>Leaderboard</Link>
                    <Link href="/code-ide" className={`text-sm font-bold transition-colors ${isDark ? "text-slate-300 hover:text-indigo-400" : "text-slate-700 hover:text-indigo-600"}`}>IDE</Link>
                    <Link href="/docs" className={`text-sm font-bold transition-colors ${isDark ? "text-slate-300 hover:text-indigo-400" : "text-slate-700 hover:text-indigo-600"}`}>Documentation</Link>
                    <Link href="/meet-developer" className={`text-sm font-bold transition-colors ${isDark ? "text-slate-300 hover:text-indigo-400" : "text-slate-700 hover:text-indigo-600"}`}>Meet Developer</Link>
                </div>
            </div>
        </footer>
    );
}
