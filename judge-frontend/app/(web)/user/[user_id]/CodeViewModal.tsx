/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Code2, Download } from 'lucide-react';

interface CodeViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    submission: any;
}

export default function CodeViewModal({ isOpen, onClose, submission, isDark }: CodeViewModalProps & { isDark?: boolean }) {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen || !submission) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(submission.code || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadCode = () => {
        const element = document.createElement("a");
        const file = new Blob([submission.code || ""], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${submission.problems?.title || 'solution'}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const isAccepted = submission.total > 0 && submission.passed === submission.total;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-110 flex items-center justify-center p-4 md:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 backdrop-blur-md bg-slate-900/60 dark:bg-[#0B0C15]/90"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="relative w-full max-w-5xl h-[80vh] border rounded-3xl shadow-2xl overflow-hidden flex flex-col bg-white border-slate-200 dark:bg-[#141625] dark:border-slate-800"
                >
                    {/* Header */}
                    <div className="p-6 border-b flex flex-wrap items-center justify-between gap-4 border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                                <Code2 size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                                    {submission.problems?.title || "Solution View"}
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${isAccepted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {isAccepted ? 'Accepted' : 'Failed'}
                                    </span>
                                </h2>
                                <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">
                                    Language: Auto-detected • {submission.passed}/{submission.total} Test Cases Passed
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-2 px-4 py-2 border rounded-xl transition-all text-sm font-medium bg-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-white border-slate-200 shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700 dark:border-slate-700 dark:shadow-none"
                            >
                                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                                onClick={downloadCode}
                                className="p-2 border rounded-xl transition-all bg-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-white border-slate-200 shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700 dark:border-slate-700 dark:shadow-none"
                                title="Download Code"
                            >
                                <Download size={20} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 ml-2 rounded-full transition-colors hover:bg-slate-100 text-slate-500 hover:text-indigo-600 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Code Editor Area */}
                    <div className="flex-1 overflow-hidden p-4 relative group bg-slate-950 dark:bg-[#0D0E19]">
                        <pre className="h-full overflow-auto p-6 text-sm md:text-base font-mono leading-relaxed text-indigo-100/90 custom-scrollbar selection:bg-indigo-500/30">
                            <code>{submission.code || "// No code available"}</code>
                        </pre>

                        {/* Background subtle glow */}
                        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-500/5 blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-blue-500/5 blur-[80px] pointer-events-none" />
                    </div>

                    {/* Footer / Meta */}
                    <div className="px-6 py-4 border-t flex items-center justify-between border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/30">
                        <div className="text-xs text-slate-500 flex items-center gap-4">
                            <span>ID: {submission.id.substring(0, 8)}...</span>
                            <span>Points: {submission.passed}</span>
                        </div>
                        <div className="text-xs text-indigo-400/60 font-medium italic">
                            Powered by VLYXIR Code Viewer
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
