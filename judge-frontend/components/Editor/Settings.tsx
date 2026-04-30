"use client";

import React, { useState, useRef, useEffect, memo } from 'react';
import LanguageSelector from './LanguageSelector';
import { ChevronDown, Check, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsProps {
    fontSize: number;
    setFontSize: (size: number) => void;
    language?: string;
    setLanguage?: (lang: string) => void;
}

const Settings = memo(({ fontSize, setFontSize, language, setLanguage }: SettingsProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const fontSizes = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (size: number) => {
        setFontSize(size);
        setIsOpen(false);
    };

    return (
        <div className="flex items-center gap-3">
            <LanguageSelector language={language} setLanguage={setLanguage} />
            <div className="h-4 w-px bg-gray-700/50" />

            <div className="flex items-center gap-2" ref={containerRef}>
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-gray-800/40 backdrop-blur-md border border-gray-700/50 transition-all duration-200 min-w-20 md:min-w-22.5 hover:border-indigo-500/50 hover:bg-gray-700/70 cursor-pointer shadow-lg shadow-black/5"
                    >
                        <span className="text-[11px] md:text-xs font-semibold text-gray-200 tracking-tight">
                            {fontSize}px
                        </span>
                        <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                        </motion.div>
                    </motion.button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 0, scale: 0.95 }}
                                animate={{ opacity: 1, y: -10, scale: 1 }}
                                exit={{ opacity: 0, y: 0, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                                style={{ zIndex: 9999 }}
                                className="absolute right-0 bottom-full mb-2 w-full min-w-30 
                                    bg-gray-900 border border-gray-700/80 
                                    rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
                            >
                                <div className="px-3 py-1.5 border-b border-gray-800/80 flex items-center gap-2">
                                    <Type className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Font Size</span>
                                </div>
                                <div className="max-h-55 overflow-y-auto custom-scrollbar py-1">
                                    {fontSizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => handleSelect(size)}
                                            className={`
                                                w-full flex items-center justify-between px-3 py-2 text-xs transition-all duration-150
                                                ${fontSize === size
                                                    ? 'bg-indigo-500/10 text-indigo-400 font-bold'
                                                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}
                                            `}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${fontSize === size ? 'bg-indigo-400' : 'bg-transparent'}`} />
                                                {size}px
                                            </div>
                                            {fontSize === size && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
});
Settings.displayName = "Settings";

export default Settings;
