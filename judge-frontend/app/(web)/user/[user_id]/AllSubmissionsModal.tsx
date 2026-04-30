/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Clock, ExternalLink, Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';

interface AllSubmissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    submissions: any[];
    onViewCode: (submission: any) => void;
}

export default function AllSubmissionsModal({ isOpen, onClose, submissions, onViewCode, isDark }: AllSubmissionsModalProps & { isDark?: boolean }) {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredSubmissions = submissions.filter(sub =>
        (sub.problems?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'hard': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 backdrop-blur-sm bg-slate-900/40 dark:bg-[#0B0C15]/80"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl max-h-[85vh] border rounded-3xl shadow-2xl overflow-hidden flex flex-col bg-white border-slate-200 dark:bg-[#141625] dark:border-slate-800"
                >
                    {/* Header */}
                    <div className="p-6 border-b flex items-center justify-between border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Submissions</h2>
                            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">{submissions.length} total records found</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full transition-colors hover:bg-slate-100 text-slate-500 hover:text-indigo-600 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="p-4 border-b bg-white border-slate-100 dark:bg-slate-900/30 dark:border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search by problem name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border rounded-xl py-2 pl-10 pr-4 transition-colors focus:outline-none focus:border-indigo-500 bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-950/50 dark:border-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar">
                        {filteredSubmissions.length > 0 ? (
                            filteredSubmissions.map((sub) => {
                                const isAccepted = sub.total > 0 && sub.passed === sub.total;
                                const prob = sub.problems || {};

                                return (
                                    <motion.div
                                        key={sub.id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-all group bg-slate-50 border-slate-100 hover:bg-white hover:shadow-md hover:border-indigo-100 dark:bg-slate-800/20 dark:border-slate-800/50 dark:hover:bg-slate-800/40 dark:hover:shadow-none dark:hover:border-slate-700"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl ${isAccepted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {isAccepted ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold transition-colors group-hover:text-indigo-400 flex items-center gap-2 text-slate-900 dark:text-white">
                                                    {prob.title || "Unknown Problem"}
                                                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getDifficultyColor(prob.difficulty)}`}>
                                                        {prob.difficulty || "Medium"}
                                                    </span>
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {format(new Date(sub.created_at), 'MMM d, yyyy • h:mm a')}
                                                    </span>
                                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                                    <span>{sub.passed}/{sub.total} Test Cases</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onViewCode(sub)}
                                            className="mt-4 md:mt-0 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 text-sm font-semibold hover:text-white rounded-xl transition-all border border-indigo-500/20"
                                        >
                                            <ExternalLink size={16} />
                                            View Solution
                                        </button>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                <Search size={48} className="mb-4 opacity-20" />
                                <p>No submissions matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
