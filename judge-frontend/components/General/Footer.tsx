"use client";

import {Scale} from "lucide-react";
import Link from "next/link";
import { useAppContext } from "../../app/lib/context";

export default function Footer() {
    const { codeJudgePath } = useAppContext();
    return(
        <footer className="relative z-10 border-t border-gray-100 dark:border-gray-900 bg-white/50 dark:bg-gray-950/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Scale className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-black text-xl tracking-tighter">CodeJudge</span>
                </div>
                <p className="text-sm text-gray-500 font-medium">
                    © 2026 CodeJudge. Built with passion for the developer community.
                </p>
                <div className="flex items-center gap-6">
                    <Link href={codeJudgePath} className="text-sm font-bold hover:text-indigo-500 transition-colors">Practice</Link>
                    <Link href="/code-ide" className="text-sm font-bold hover:text-indigo-500 transition-colors">IDE</Link>
                    <Link href="/docs" className="text-sm font-bold hover:text-indigo-500 transition-colors">Documentation</Link>
                    <Link href="/meet-developer" className="text-sm font-bold hover:text-indigo-500 transition-colors">Meet Developer</Link>
                </div>
            </div>
        </footer>
    );
}
