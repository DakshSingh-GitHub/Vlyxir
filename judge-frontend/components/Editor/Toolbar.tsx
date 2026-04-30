/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, ExternalLink, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Settings from './Settings';
import { useAppContext } from '../../app/lib/auth/context';

interface ToolbarProps {
    code: string;
    fontSize: number;
    setFontSize: (size: number) => void;
    language?: string;
    setLanguage?: (lang: string) => void;
}

const Toolbar = memo(({ code, fontSize, setFontSize, language, setLanguage }: ToolbarProps) => {
    const router = useRouter();
    const { codeIdePath, codeAnalysisPath } = useAppContext();

    const handleTryInCodeIDE = () => {
        sessionStorage.setItem("code-ide-code", code);
        router.push(codeIdePath);
    };

    const handleAnalyseYourCode = () => {
        sessionStorage.setItem("code-analysis-code", code);
        router.push(codeAnalysisPath);
    };

    return (
        <div className="bg-gray-900 border-t border-gray-800 py-2 md:py-2 flex flex-wrap md:flex-nowrap justify-between items-center gap-2 md:gap-4 text-gray-300 text-sm px-3 md:px-5 min-h-11">
            <div className="flex items-center gap-2 md:gap-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTryInCodeIDE}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 bg-indigo-500/5 whitespace-nowrap"
                >
                    <span className="hidden sm:inline">Try in Code IDE</span>
                    <span className="sm:hidden">IDE</span>
                    <ExternalLink className="w-3 md:w-3.5 h-3 md:h-3.5" />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAnalyseYourCode}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 bg-indigo-500/5 whitespace-nowrap"
                >
                    <span className="hidden sm:inline">Analyse your code</span>
                    <span className="sm:hidden">CAn</span>
                    <ExternalLink className="w-3 md:w-3.5 h-3 md:h-3.5" />
                </motion.button>
            </div>

            <div className="flex items-center gap-3 md:gap-5 ml-auto">
                <Settings fontSize={fontSize} setFontSize={setFontSize} language={language} setLanguage={setLanguage} />
            </div>
        </div>
    );
});
Toolbar.displayName = "Toolbar";

export default Toolbar;
