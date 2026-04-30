/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderOpen, FileCode, Dna, Terminal, CircleCheck } from 'lucide-react';
import { Problem } from '../../../lib/types/types';

interface ProblemInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    problems: Problem[];
    difficultyStats: { Easy: number; Medium: number; Hard: number };
}

export default function ProblemInventoryModal({ isOpen, onClose, problems, difficultyStats }: ProblemInventoryModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden"
                    >
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                    <FolderOpen className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight">Problem Inventory</h2>
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500/10 text-green-600 text-[10px] font-black uppercase">
                                            {difficultyStats.Easy} Easy
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-600 text-[10px] font-black uppercase">
                                            {difficultyStats.Medium} Medium
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 text-red-600 text-[10px] font-black uppercase">
                                            {difficultyStats.Hard} Hard
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all text-gray-400"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30 dark:bg-gray-950/30">
                            <div className="grid grid-cols-1 gap-4">
                                {problems.map(prob => (
                                    <motion.div
                                        key={prob.id}
                                        className="group relative p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="flex items-start gap-5 min-w-0">
                                                <div className="w-12 h-12 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-700">
                                                    <FileCode className="w-6 h-6 text-indigo-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap mb-1">
                                                        <h3 className="text-lg font-black truncate">{prob.title}</h3>
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${prob.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                                                            prob.difficulty === 'Hard' ? 'bg-red-100 text-red-600' :
                                                                'bg-yellow-100 text-yellow-600'
                                                            }`}>
                                                            {prob.difficulty || 'Medium'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2 line-clamp-1">{prob.description}</p>
                                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                        <span className="flex items-center gap-1.5"><Terminal className="w-3 h-3 text-indigo-500" /> ID: {prob.id}</span>
                                                        <span className="flex items-center gap-1.5"><CircleCheck className="w-3 h-3 text-green-500" /> Ready</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 shrink-0 overflow-x-auto pb-1 lg:pb-0">
                                                <TestCaseBadge count={prob.sample_test_cases_count || 0} label="Sample Cases" color="blue" />
                                                <TestCaseBadge count={prob.hidden_test_cases_count || 0} label="Hidden Cases" color="purple" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end shrink-0">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all"
                            >
                                Close Inventory
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function TestCaseBadge({ count, label, color }: { count: number, label: string, color: 'blue' | 'purple' }) {
    const shadow = color === 'blue' ? 'shadow-blue-500/10' : 'shadow-purple-500/10';
    const bg = color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-purple-50 dark:bg-purple-900/10';
    const text = color === 'blue' ? 'text-blue-600' : 'text-purple-600';

    return (
        <div className={`px-4 py-3 rounded-2xl ${bg} border border-transparent flex flex-col gap-1 min-w-25 shadow-sm ${shadow}`}>
            <span className={`text-xl font-black ${text}`}>{count}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</span>
        </div>
    );
}
