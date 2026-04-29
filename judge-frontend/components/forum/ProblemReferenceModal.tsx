"use client";

import React, { useEffect, useState } from 'react';
import { X, Globe, Sparkles } from 'lucide-react';
import { useAppContext } from '../../app/lib/context';
import { getProblemById } from '../../app/lib/api';
import { Problem } from '../../app/lib/types';
import ProblemViewer from '../ProblemViewer';
import { anime } from '../../app/lib/anime';

interface ProblemReferenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    problemId: string;
}

export default function ProblemReferenceModal({ isOpen, onClose, problemId }: ProblemReferenceModalProps) {
    const { isDark } = useAppContext();
    const [problem, setProblem] = useState<Problem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && problemId) {
            setIsLoading(true);
            getProblemById(problemId)
                .then(setProblem)
                .catch(err => console.error("Error fetching problem:", err))
                .finally(() => setIsLoading(false));
            
            // Animate entry
            anime({
                targets: '.problem-modal-content',
                scale: [0.95, 1],
                opacity: [0, 1],
                duration: 400,
                easing: 'easeOutExpo'
            });
        }
    }, [isOpen, problemId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`problem-modal-content relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border shadow-2xl flex flex-col ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
            }`}>
                
                {/* Header */}
                <div className={`p-6 border-b flex items-center justify-between shrink-0 ${
                    isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Referenced Problem
                            </h3>
                            <p className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Technical Context
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className={`p-2 rounded-xl transition-all hover:scale-110 ${
                            isDark ? 'hover:bg-slate-800 text-slate-500 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-900'
                        }`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                    {isLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center">
                            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                            <div className="flex items-center gap-2 opacity-30">
                                <Sparkles className="w-4 h-4 animate-pulse text-amber-500" />
                                <span className="text-[10px] font-black tracking-[0.4em] uppercase">Decoding Metadata</span>
                            </div>
                        </div>
                    ) : problem ? (
                        <ProblemViewer problem={problem} />
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-center">
                            <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Failed to load problem details.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-6 border-t flex items-center justify-end gap-4 shrink-0 ${
                    isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'
                }`}>
                    <button 
                        onClick={onClose}
                        className={`px-8 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all hover:scale-105 active:scale-95 ${
                            isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        CLOSE VIEWER
                    </button>
                    {problem && (
                        <a 
                            href={`/code-judge?problem=${problem.id}`}
                            className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
                        >
                            SOLVE NOW
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
