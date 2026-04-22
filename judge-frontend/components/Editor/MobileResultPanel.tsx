"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Check, X, ChevronRight, Info, AlertCircle } from 'lucide-react';
import { SubmitResponse } from '../../app/lib/types';

interface MobileResultPanelProps {
    result: SubmitResponse & { error?: string } | null;
    isDark: boolean;
    onOpenDetails: () => void;
    onClose: () => void;
}

export default function MobileResultPanel({ result, isDark, onOpenDetails, onClose }: MobileResultPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const controls = useAnimation();

    // The drawer is 90vh tall. 
    // "Closed" (peek) state: y = 60vh (shows 30vh)
    // "Open" (full) state: y = 5vh (shows 85vh)
    const peekY = "62vh";
    const fullY = "8vh";

    useEffect(() => {
        if (result) {
            controls.start({ y: peekY, transition: { type: "spring", damping: 25, stiffness: 200 } });
        }
    }, [result, controls]);

    if (!result) return null;

    const isAccepted = result.final_status === "Accepted";
    const passedCount = result.summary?.passed ?? 0;
    const totalCount = result.summary?.total ?? 0;
    const progressPercent = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

    const onDragEnd = (event: any, info: any) => {
        const velocity = info.velocity.y;
        const offset = info.offset.y;

        if (velocity < -100 || offset < -100) {
            setIsExpanded(true);
            controls.start({ y: fullY });
        } else if (velocity > 100 || offset > 100) {
            if (isExpanded && offset < 300) {
                setIsExpanded(false);
                controls.start({ y: peekY });
            } else {
                onClose();
            }
        } else {
            controls.start({ y: isExpanded ? fullY : peekY });
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                animate={controls}
                exit={{ y: "100%" }}
                style={{ y: "100%" }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.05}
                onDragEnd={onDragEnd}
                transition={{
                    type: "spring",
                    damping: 35,
                    stiffness: 300,
                    mass: 0.5,
                    restDelta: 0.001
                }}
                className={`fixed top-0 left-0 right-0 z-[60] h-[95vh] rounded-t-[2.5rem] border-t backdrop-blur-xl shadow-[0_-20px_80px_rgba(0,0,0,0.6)] flex flex-col transform-gpu ${isDark
                        ? "bg-slate-900/90 border-slate-700/50"
                        : "bg-white/90 border-slate-200/50"
                    }`}
            >
                {/* Pull Handle Area */}
                <div className="w-full pt-4 pb-2 flex justify-center items-center cursor-grab active:cursor-grabbing shrink-0">
                    <div className={`w-16 h-1.5 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
                </div>

                <div className="flex-1 flex flex-col overflow-hidden px-5 pb-32">
                    {/* Header: Always visible */}
                    <div className="flex items-center justify-between mb-6 shrink-0 mt-2">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${isAccepted ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'}`}>
                                {isAccepted ? <Check className="w-7 h-7 text-white stroke-[3px]" /> : <X className="w-7 h-7 text-white stroke-[3px]" />}
                            </div>
                            <div>
                                <h3 className={`text-2xl font-black uppercase tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
                                    {isAccepted ? "Accepted" : result.final_status}
                                </h3>
                                <p className={`text-sm font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    Execution: {result.total_duration?.toFixed(3)}s
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2.5 rounded-full transition-colors ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Progress Bar: Always visible */}
                    <div className="space-y-3 mb-8 shrink-0">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                            <span className={isDark ? "text-slate-400" : "text-slate-500"}>Test Case Pass Rate</span>
                            <span className={isDark ? "text-white" : "text-slate-900"}>{passedCount} / {totalCount} Passed</span>
                        </div>
                        <div className={`h-4 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1, ease: "circOut" }}
                                className={`h-full rounded-full ${isAccepted ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}
                            />
                        </div>
                    </div>

                    {/* Content Section: Scrollable when expanded */}
                    <div className="flex-1 overflow-y-auto mb-6 custom-scrollbar pr-1">
                        <div className="grid grid-cols-1 gap-4 pb-4">
                            <div className={`p-5 rounded-3xl border ${isDark ? "bg-slate-800/40 border-slate-700/50" : "bg-slate-50 border-slate-200"}`}>
                                <h4 className="font-black uppercase tracking-widest text-[10px] mb-3 opacity-50 flex items-center gap-2">
                                    <AlertCircle className="w-3 h-3" /> System Analysis
                                </h4>
                                <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"} leading-relaxed`}>
                                    Your code execution completed with status <span className="font-bold text-emerald-500">{result.final_status}</span>.
                                    The algorithm demonstrated optimal time complexity for the given constraints. Scroll Up and expand this panel to see more options.
                                </div>
                            </div>

                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-2 gap-3"
                                >
                                    <div className={`p-4 rounded-3xl border ${isDark ? "bg-slate-800/40 border-slate-700/50" : "bg-slate-50 border-slate-200"}`}>
                                        <p className="text-[10px] font-black uppercase opacity-40 mb-1">Time</p>
                                        <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{result.total_duration?.toFixed(3)}s</p>
                                    </div>
                                    <div className={`p-4 rounded-3xl border ${isDark ? "bg-slate-800/40 border-slate-700/50" : "bg-slate-50 border-slate-200"}`}>
                                        <p className="text-[10px] font-black uppercase opacity-40 mb-1">Status</p>
                                        <p className={`text-lg font-bold ${isAccepted ? "text-emerald-500" : "text-red-500"}`}>{isAccepted ? "PASS" : "FAIL"}</p>
                                    </div>
                                </motion.div>
                            )}

                            {isExpanded && result.error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-5 rounded-3xl bg-red-500/10 border border-red-500/20"
                                >
                                    <h4 className="font-black uppercase tracking-widest text-[10px] mb-3 text-red-400">Error Details</h4>
                                    <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap">{result.error}</pre>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Action: Bottom of drawer */}
                    <button
                        onClick={onOpenDetails}
                        className={`w-full py-5 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl shrink-0 ${isDark
                            ? "bg-white text-slate-900 hover:bg-slate-100"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                            }`}
                    >
                        <Info className="w-5 h-5" />
                        Detailed Report
                        <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
