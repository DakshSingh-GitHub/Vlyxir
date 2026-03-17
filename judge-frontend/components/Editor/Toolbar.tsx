"use client";

import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, ExternalLink, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Settings from './Settings';

interface ToolbarProps {
    code: string;
    fontSize: number;
    setFontSize: (size: number) => void;
    language?: string;
    setLanguage?: (lang: string) => void;
}

const Toolbar = memo(({ code, fontSize, setFontSize, language, setLanguage }: ToolbarProps) => {
    const router = useRouter();

    const handleTryInCodeIDE = () => {
        sessionStorage.setItem("code-ide-code", code);
        router.push('/code-ide');
    };

    const handleAnalyseYourCode = () => {
        sessionStorage.setItem("code-analysis-code", code);
        router.push('/code-analysis')
    }

    return (
        <div className="bg-gray-900 border-t border-gray-800 py-1.5 md:py-2 flex justify-between items-center gap-4 text-gray-300 text-sm px-4 md:px-5 min-h-11">
            <div className="flex items-center gap-3">
                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTryInCodeIDE}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/40 bg-indigo-500/5"
                >
                    <span className="hidden xs:inline">Try in Code IDE</span>
                    <span className="xs:hidden">IDE</span>
                    <ExternalLink className="w-3 md:w-3.5 h-3 md:h-3.5" />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAnalyseYourCode}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/40 bg-indigo-500/5"
                >
                    <span className="hidden xs:inline">Analyse your code</span>
                    <span className="xs:hidden">CAn</span>
                    <ExternalLink className="w-3 md:w-3.5 h-3 md:h-3.5" />
                </motion.button>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
                <Settings fontSize={fontSize} setFontSize={setFontSize} language={language} setLanguage={setLanguage} />
            </div>
        </div>
    );
});
Toolbar.displayName = "Toolbar";

export default Toolbar;
