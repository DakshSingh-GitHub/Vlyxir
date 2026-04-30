"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Submission } from "../../app/lib/utils/storage";
import { Trash2, AlertTriangle, X, LogIn, LockKeyhole } from "lucide-react";
import { useState, memo, useEffect, useRef } from "react";
import { anime, stagger } from "../../app/lib/utils/anime";
import { useAuth } from "../../app/lib/auth/auth-context";
import { useAppContext } from "../../app/lib/auth/context";

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
    const { user, isLoading } = useAuth();
    const { isDark } = useAppContext();
    const pathname = usePathname();

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

    if (!isLoading && !user) {
        const loginHref = `/login?next=${encodeURIComponent(pathname)}`;
        const cardClass = isDark
            ? "border-slate-300/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(10,15,26,0.92))] shadow-[0_18px_48px_rgba(2,6,23,0.28)]"
            : "border-gray-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,250,251,0.92))] shadow-[0_18px_48px_rgba(15,23,42,0.08)]";
        const iconClass = isDark
            ? "border-slate-700/70 bg-slate-900/80 text-indigo-300"
            : "border-indigo-100 bg-indigo-50 text-indigo-600";
        const titleClass = isDark ? "text-white" : "text-slate-900";
        const bodyClass = isDark ? "text-slate-400" : "text-slate-600";
        const buttonClass = isDark
            ? "bg-[linear-gradient(135deg,#2563eb,#7c3aed)] shadow-lg shadow-indigo-500/25"
            : "bg-[linear-gradient(135deg,#1d4ed8,#8b5cf6)] shadow-lg shadow-indigo-500/20";

        return (
            <div className="flex h-full min-h-80 items-center justify-center px-4 py-12">
                <div className={`w-full max-w-md rounded-4xl border p-6 text-center ${cardClass}`}>
                    <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${iconClass}`}>
                        <LockKeyhole className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">Past submissions</p>
                    <h3 className={`mt-3 text-2xl font-black tracking-tight ${titleClass}`}>Log in to view history</h3>
                    <p className={`mt-3 text-sm leading-relaxed ${bodyClass}`}>
                        Your saved submissions are tied to your account. Sign in to see attempts, reuse code, and keep your history in sync.
                    </p>
                    <Link
                        href={loginHref}
                        className={`mt-6 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98] ${buttonClass}`}
                    >
                        <LogIn className="h-4 w-4" />
                        Log in
                    </Link>
                </div>
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-4 py-12 text-gray-500 dark:text-gray-400">
                <div className="rounded-full bg-gray-100 p-4 font-mono text-2xl dark:bg-gray-700">
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
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
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
