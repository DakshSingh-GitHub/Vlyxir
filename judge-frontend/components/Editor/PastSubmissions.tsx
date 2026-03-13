"use client";

import { Submission } from "../../app/lib/storage";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { useState, memo, useEffect, useRef } from "react";
import { anime, stagger } from "../../app/lib/anime";

interface PastSubmissionsProps {
    submissions: Submission[];
    onLoadCode: (code: string) => void;
    onDelete: (id: string) => void;
}

const PastSubmissions = memo(function PastSubmissions({ submissions, onLoadCode, onDelete }: PastSubmissionsProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const listContainerRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const modalOverlayRef = useRef<HTMLDivElement>(null);

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDeletingId(id);
    };

    const confirmDelete = () => {
        if (deletingId) {
            onDelete(deletingId);
            setDeletingId(null);
        }
    };

    useEffect(() => {
        if (submissions.length > 0 && listContainerRef.current) {
            anime({
                targets: listContainerRef.current.children,
                opacity: [0, 1],
                translateY: [20, 0],
                delay: stagger(50),
                duration: 500,
                easing: 'easeOutQuad'
            });
        }
    }, [submissions.length]);

    useEffect(() => {
        if (deletingId) {
            if (modalOverlayRef.current) {
                anime({
                    targets: modalOverlayRef.current,
                    opacity: [0, 1],
                    duration: 300,
                    easing: 'linear'
                });
            }
            if (modalRef.current) {
                anime({
                    targets: modalRef.current,
                    scale: [0.95, 1],
                    translateY: [20, 0],
                    opacity: [0, 1],
                    duration: 400,
                    easing: 'easeOutExpo'
                });
            }
        }
    }, [deletingId]);

    if (submissions.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 space-y-4 py-12">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700 font-mono text-2xl">
                    📁
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">No Submissions Yet</h3>
                    <p className="mt-2 max-w-xs">You haven&apos;t submitted anything for this problem yet. Give it a try!</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div ref={listContainerRef} className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {submissions.map((sub) => (
                    <div
                        key={sub.id}
                        className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 group relative hover:bg-white dark:hover:bg-gray-800 opacity-0"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${sub.final_status === "Accepted"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/10"
                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 shadow-rose-500/10"
                                    }`}>
                                    {typeof sub.final_status === 'string' ? sub.final_status : JSON.stringify(sub.final_status || "Unknown")}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(sub.timestamp).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onLoadCode(sub.code)}
                                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                >
                                    Refill Code
                                </button>
                                <button
                                    onClick={(e) => handleDeleteClick(e, sub.id)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition-all"
                                    title="Delete Submission"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <span className="text-gray-600 dark:text-gray-300">
                                        Passed: {sub.summary.passed}/{sub.summary.total}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                    <span className="text-gray-600 dark:text-gray-300">
                                        Time: {sub.total_duration.toFixed(2)}s
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${sub.final_status === "Accepted" ? "bg-green-500" : "bg-red-500"}`}
                                style={{ width: `${(sub.summary.passed / sub.summary.total) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {deletingId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        ref={modalOverlayRef}
                        onClick={() => setDeletingId(null)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0"
                    />
                    <div
                        ref={modalRef}
                        className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 opacity-0"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Delete Submission?</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
                            </div>
                            <button
                                onClick={() => setDeletingId(null)}
                                className="ml-auto p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-95 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});
PastSubmissions.displayName = "PastSubmissions";

export default PastSubmissions;
