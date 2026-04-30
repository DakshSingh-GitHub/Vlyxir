/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { X, History, Sparkles, ChevronDown, CheckCircle2, XCircle, Clock, ExternalLink, Code2, Terminal, ChevronRight } from "lucide-react";
import { useEffect, useState, useMemo, memo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { getSubmissions, Submission } from "../../app/lib/utils/storage";
import Editor from "@monaco-editor/react";
import { anime } from "../../app/lib/utils/anime";
import { useAuth } from "../../app/lib/auth/auth-context";
import LoginPrompt from "../Auth/LoginPrompt";

interface SubmissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface GroupedSubmissions {
    [problemId: string]: {
        title: string;
        submissions: Submission[];
    };
}

const SubmissionItem = memo(({ sub, formatDate, isSelected, onToggle }: { sub: Submission, formatDate: (t: number) => string, isSelected: boolean, onToggle: (id: string) => void }) => (
    <div
        className={`flex items-center justify-between p-4 rounded-2xl border transition-all group/item transform-gpu ${isSelected
            ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30 shadow-md shadow-indigo-500/5"
            : "bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-700/50 hover:border-indigo-500/20"
            }`}
    >
        <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${sub.final_status === "Accepted" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500" : "bg-rose-100 dark:bg-rose-500/20 text-rose-500"}`}>
                {sub.final_status === "Accepted" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">ID: {sub.id.toUpperCase()}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <span className={`text-[10px] font-black uppercase ${sub.final_status === "Accepted" ? "text-emerald-500" : "text-rose-500"}`}>
                        {sub.final_status}
                    </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(sub.timestamp)}
                    </div>
                    {sub.total_duration > 0 && (
                        <div className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                            {sub.total_duration < 1 ? sub.total_duration.toFixed(3) : sub.total_duration.toFixed(2)}ms
                        </div>
                    )}
                </div>
            </div>
        </div>
        <button
            onClick={() => onToggle(sub.id)}
            className={`p-2 rounded-xl transition-all ${isSelected
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                : "text-indigo-500 hover:bg-indigo-500/10 opacity-0 group-hover/item:opacity-100"
                }`}
        >
            <Code2 className="w-4 h-4" />
        </button>
    </div>
));

SubmissionItem.displayName = "SubmissionItem";

export default function SubmissionsModal({ isOpen, onClose }: SubmissionsModalProps) {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [selectedSubmissionID, setSelectedSubmissionID] = useState<string | null>(null);
    
    const backdropRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const sideDetailsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (user) {
                fetchSubmissions();
            } else {
                setSubmissions([]);
                setIsLoading(false);
            }
            
            // Open animation
            if (backdropRef.current) {
                anime({
                    targets: backdropRef.current,
                    opacity: [0, 1],
                    duration: 300,
                    easing: 'linear'
                });
            }
            if (modalRef.current) {
                anime({
                    targets: modalRef.current,
                    opacity: [0, 1],
                    scale: [0.95, 1],
                    translateY: [10, 0],
                    duration: 400,
                    easing: 'easeOutExpo'
                });
            }
        } else {
            document.body.style.overflow = 'unset';
            setSelectedSubmissionID(null);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, user]);

    const handleClose = () => {
        anime({
            targets: backdropRef.current,
            opacity: 0,
            duration: 300,
            easing: 'linear'
        });
        anime({
            targets: modalRef.current,
            opacity: 0,
            scale: 0.95,
            translateY: 10,
            duration: 300,
            easing: 'easeInQuad',
            complete: () => onClose()
        });
    };

    const fetchSubmissions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getSubmissions();
            setSubmissions(data);
        } catch (error) {
            console.error("Failed to fetch submissions:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isOpen || !user) return;

        const handleSubmissionUpdate = () => {
            fetchSubmissions();
        };

        window.addEventListener("submission-updated", handleSubmissionUpdate);
        return () => window.removeEventListener("submission-updated", handleSubmissionUpdate);
    }, [isOpen, user, fetchSubmissions]);

    const grouped = useMemo(() => {
        return submissions.reduce((acc, sub) => {
            if (!acc[sub.problemId]) {
                acc[sub.problemId] = {
                    title: sub.problemTitle || "Unknown Problem",
                    submissions: []
                };
            }
            acc[sub.problemId].submissions.push(sub);
            return acc;
        }, {} as GroupedSubmissions);
    }, [submissions]);

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSubmission = (id: string) => {
        setSelectedSubmissionID(prev => prev === id ? null : id);
    };

    const selectedSubmission = useMemo(() => {
        return submissions.find(s => s.id === selectedSubmissionID) || null;
    }, [submissions, selectedSubmissionID]);

    useEffect(() => {
        if (selectedSubmission && sideDetailsRef.current) {
            anime({
                targets: sideDetailsRef.current,
                translateX: [-100, 0],
                opacity: [0, 1],
                duration: 400,
                easing: 'easeOutExpo'
            });
        }
    }, [selectedSubmission]);

    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(timestamp));
    };

    if (!mounted || !isOpen) return null;

    if (isAuthLoading) {
        return createPortal(
            <div className="fixed inset-0 z-10000 flex items-center justify-center bg-gray-950/40 backdrop-blur-sm">
                <div className="rounded-2xl border border-white/20 bg-white/95 px-6 py-4 text-sm font-medium text-gray-700 shadow-2xl dark:bg-gray-950 dark:text-gray-200">
                    Checking login state...
                </div>
            </div>,
            document.body
        );
    }

    if (!user) {
        return createPortal(
            <div className="fixed inset-0 z-10000 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm" onClick={handleClose} />
                <div className="relative z-10 w-full max-w-xl">
                    <LoginPrompt
                        title="Login to view past submissions"
                        description="Your submission history is hidden until you sign in."
                        nextPath="/code-judge"
                    />
                </div>
            </div>,
            document.body
        );
    }

    const ModalContent = (
        <div className="fixed inset-0 z-10000 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                ref={backdropRef}
                onClick={handleClose}
                className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm opacity-0"
            />

            {/* Modal Card - Dynamic Width via CSS transition */}
            <div
                ref={modalRef}
                className={`relative bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 dark:border-gray-800 flex h-187.5 max-h-[90vh] transform-gpu opacity-0 transition-[width] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]`}
                style={{
                    width: selectedSubmission ? "min(1400px, 95vw)" : "min(768px, 95vw)"
                }}
            >
                {/* List Section (Left) */}
                <div
                    className={`flex flex-col h-full border-r border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-950 z-20 relative shadow-[20px_0_40px_-20px_rgba(0,0,0,0.15)] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${selectedSubmission ? "w-[40%] min-w-[320px]" : "w-full"}`}
                >
                    {/* Header */}
                    <div className="p-8 md:p-10 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-linear-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-xl shadow-indigo-500/30">
                                <History className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                                    History
                                    <div className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">
                                        BETA
                                    </div>
                                </h3>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                                    {submissions.length} attempts
                                </p>
                            </div>
                        </div>
                        {!selectedSubmission && (
                            <button
                                onClick={handleClose}
                                className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all active:scale-90 group"
                            >
                                <X className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                            </button>
                        )}
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4">
                                <div
                                    className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"
                                />
                                <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading records...</p>
                            </div>
                        ) : Object.keys(grouped).length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                <History className="w-12 h-12 text-gray-200 dark:text-gray-700" />
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white">No history found</h4>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(grouped).map(([id, group]) => {
                                    const isExpanded = expandedGroups.has(id);
                                    const isSolved = group.submissions.some(s => s.final_status === "Accepted");

                                    return (
                                        <div
                                            key={id}
                                            className={`rounded-4xl border transition-all duration-300 transform-gpu ${isExpanded
                                                ? "bg-indigo-50/30 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/30 shadow-lg shadow-indigo-500/5"
                                                : "bg-white dark:bg-gray-900/40 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm"
                                                }`}
                                        >
                                            <button
                                                onClick={() => toggleGroup(id)}
                                                className="w-full p-5 flex items-center justify-between text-left group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isSolved
                                                        ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                        : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                                        }`}>
                                                        {isSolved ? <CheckCircle2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                                            {group.title}
                                                        </h4>
                                                        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-tighter">
                                                            {group.submissions.length} attempts
                                                        </p>
                                                    </div>
                                                </div>
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${isExpanded ? "rotate-180 text-indigo-500" : "text-gray-400"}`} />
                                            </button>

                                            <div
                                                className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out px-4 pb-4 space-y-2 ${isExpanded ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0'}`}
                                            >
                                                {group.submissions.map((sub) => (
                                                    <SubmissionItem
                                                        key={sub.id}
                                                        sub={sub}
                                                        formatDate={formatDate}
                                                        isSelected={selectedSubmissionID === sub.id}
                                                        onToggle={toggleSubmission}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Code Details Section (Right) */}
                {selectedSubmission && (
                    <div
                        ref={sideDetailsRef}
                        className="flex-1 flex flex-col bg-white dark:bg-gray-950 relative border-l border-gray-100 dark:border-gray-800 z-10 opacity-0"
                    >
                        {/* Code Header */}
                        <div className="p-6 md:px-8 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-950">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                                    <Code2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        Submission Source
                                        <span className="text-[10px] uppercase text-gray-400 font-black tracking-widest">#{selectedSubmission.id.slice(0, 8)}</span>
                                    </h4>
                                    <p className="text-xs text-gray-500 font-medium">{selectedSubmission.problemTitle}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedSubmissionID(null)}
                                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Monaco Editor Container */}
                        <div className="flex-1 min-h-0 relative group">
                            <Editor
                                height="100%"
                                defaultLanguage="python"
                                theme="vs-dark"
                                value={selectedSubmission.code}
                                options={{
                                    readOnly: true,
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 20, bottom: 20 },
                                    fontFamily: "Jetbrains Mono, monospace",
                                    renderLineHighlight: "none",
                                    hideCursorInOverviewRuler: true,
                                    occurrencesHighlight: "off",
                                    selectionHighlight: false
                                }}
                            />
                            <div className="absolute top-4 right-4 px-3 py-1 bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-700 text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Read Only
                            </div>
                        </div>

                        {/* Verdict Footer */}
                        <div className="p-6 md:p-8 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className={`p-4 rounded-3xl shadow-xl ${selectedSubmission.final_status === "Accepted"
                                        ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10"
                                        : "bg-rose-500/10 text-rose-500 shadow-rose-500/10"
                                        }`}>
                                        {selectedSubmission.final_status === "Accepted" ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h5 className={`text-2xl font-black tracking-tight ${selectedSubmission.final_status === "Accepted" ? "text-emerald-500" : "text-rose-500"}`}>
                                                {selectedSubmission.final_status}
                                            </h5>
                                            <ChevronRight className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                <Terminal className="w-3.5 h-3.5" />
                                                Python 3.10
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-gray-300" />
                                            <div className="text-xs font-bold text-gray-400">
                                                {selectedSubmission.total_duration < 1 ? selectedSubmission.total_duration.toFixed(3) : selectedSubmission.total_duration.toFixed(2)}ms
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div className="px-4 py-2 bg-emerald-500/10 rounded-xl text-center min-w-20">
                                        <p className="text-[10px] font-black text-emerald-600/60 uppercase">Passed</p>
                                        <p className="text-lg font-black text-emerald-600">All</p>
                                    </div>
                                    <div className="px-4 py-2 bg-gray-200/50 dark:bg-gray-800 rounded-xl text-center min-w-20">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Testcases</p>
                                        <p className="text-lg font-black text-gray-700 dark:text-gray-300">Detailed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Decoration */}
                <div className="absolute top-0 right-0 w-1 pt-full bg-linear-to-b from-indigo-500 via-purple-500 to-transparent opacity-20" />
            </div>
        </div>
    );

    return createPortal(ModalContent, document.body);
}
