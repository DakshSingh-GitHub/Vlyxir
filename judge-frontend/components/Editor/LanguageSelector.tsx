"use client";

import React, { useState, useRef, useEffect, memo } from 'react';
import { ChevronDown, Check, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Link from 'next/link';

interface LanguageSelectorProps {
  language?: string;
  setLanguage?: (lang: string) => void;
}

const LanguageSelector = memo(({ language = "python", setLanguage }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages = [
    { id: 'python', label: 'Python', icon: '🐍' },
    ...(setLanguage ? [{ id: 'javascript', label: 'JavaScript', icon: 'js' }] : [])
  ];

  const currentLang = languages.find(l => l.id === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    if (setLanguage) {
      setLanguage(id);
    }
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2" ref={containerRef}>
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-gray-800/40 backdrop-blur-md border border-gray-700/50 transition-all duration-200 min-w-25 md:min-w-30 hover:border-indigo-500/50 hover:bg-gray-700/70 cursor-pointer shadow-lg shadow-black/5"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20">
              {currentLang.id === 'python' ? 'PY' : 'JS'}
            </div>
            <span className="text-[11px] md:text-xs font-semibold text-gray-200 tracking-tight">
              {currentLang.label}
            </span>
          </div>
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
              className="absolute left-0 bottom-full mb-2 w-full min-w-40 
                bg-gray-900 border border-gray-700/80 
                rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden py-1"
            >
              <div className="px-3 py-1.5 border-b border-gray-800/80 flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Language</span>
              </div>
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleSelect(lang.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 text-xs transition-all duration-150
                    ${language === lang.id
                      ? 'bg-indigo-500/10 text-indigo-400 font-bold'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${language === lang.id ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'bg-transparent'}`} />
                    {lang.label}
                  </div>
                  {language === lang.id && <Check className="w-4 h-4" />}
                </button>
              ))}
              {!setLanguage && languages.length === 1 && (
                <div className="px-3 py-2.5 mt-1 border-t border-gray-800/80 bg-black/20">
                  <p className="text-[9px] text-gray-500 leading-tight">
                    JavaScript is available in <br />
                    <Link href="/code-judge-experiment" className="text-indigo-400/80 font-bold">Experiment Mode</Link> only.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
LanguageSelector.displayName = "LanguageSelector";

export default LanguageSelector;
