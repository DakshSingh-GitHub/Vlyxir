/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { SubmitResponse, TestCaseResult } from '../../../lib/types/types';

interface ResultModalProps {
    result: SubmitResponse & { error?: string };
    onClose: () => void;
}

export default function ResultModal({ result, onClose }: ResultModalProps) {
    if (!result) return null;

    const isAccepted = result.final_status === "Accepted";

    // Calculate passing percentage for a visual bar
    const passed = result.summary?.passed ?? 0;
    const total = result.summary?.total ?? 0;
    const percentage = total > 0 ? (passed / total) * 100 : 0;

    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center px-4 sm:px-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950 rounded-2xl shadow-[0_20px_48px_rgba(2,6,23,0.32)] overflow-hidden flex flex-col border border-slate-700/70 animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Submission Details
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${isAccepted
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                            : "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30"
                            }`}>
                            {result.final_status}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Score</div>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {passed}/{total}
                                </div>
                                <div className="text-xs text-gray-400">test cases</div>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${isAccepted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Execution Time</div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {result.total_duration ? result.total_duration.toFixed(3) : "0.000"}s
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
                            <div className="flex items-center gap-2">
                                {isAccepted ? (
                                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-500" />
                                )}
                                <div className={`text-lg font-bold ${isAccepted ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {result.final_status}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Test Cases */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            Test Case Breakdown
                        </h3>

                        <div className="space-y-3">
                            {result.test_case_results && result.test_case_results.length > 0 ? (
                                result.test_case_results.map((tc, index) => (
                                    <TestCaseItem key={index} tc={tc} />
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    No test case details available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TestCaseItem({ tc }: { tc: TestCaseResult }) {
    const isPassed = tc.status === "Accepted";
    const isError = tc.status === "Runtime Error" || tc.status === "Internal Error" || tc.status === "Time Limit Exceeded";

    // If it's not accepted, we want to show details if available
    const showDetails = !isPassed && (tc.input || tc.expected_output || tc.actual_output || tc.error);

    return (
        <div className={`rounded-xl overflow-hidden border transition-all duration-200 ${isPassed
            ? "bg-white dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/50"
            : "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30"
            }`}>
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isPassed
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                        }`}>
                        {isPassed ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                            Test Case #{tc.test_case}
                        </div>
                        <div className={`text-xs font-medium ${isPassed
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                            }`}>
                            {tc.status} • {tc.duration ? `${tc.duration.toFixed(3)}s` : "0.000s"}
                        </div>
                    </div>
                </div>
            </div>

            {showDetails && (
                <div className="px-4 pb-4 pt-0 text-sm space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="h-px bg-gray-200/60 dark:bg-gray-700/60 w-full mb-3" />

                    {tc.input && (
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input</span>
                            <pre className="bg-gray-100 dark:bg-gray-950 p-3 rounded-lg font-mono text-gray-800 dark:text-gray-200 overflow-x-auto border border-gray-200 dark:border-gray-800">
                                {tc.input}
                            </pre>
                        </div>
                    )}

                    {tc.error ? (
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Error Message
                            </span>
                            <pre className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg font-mono text-red-700 dark:text-red-300 overflow-x-auto border border-red-100 dark:border-red-800/30 whitespace-pre-wrap">
                                {tc.error}
                            </pre>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tc.actual_output !== undefined && (
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Your Output</span>
                                    <pre className="bg-gray-100 dark:bg-gray-950 p-3 rounded-lg font-mono text-gray-800 dark:text-gray-200 overflow-x-auto border border-gray-200 dark:border-gray-800 min-h-12">
                                        {tc.actual_output || <span className="text-gray-400 italic">No output</span>}
                                    </pre>
                                </div>
                            )}

                            {tc.expected_output !== undefined && (
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expected Output</span>
                                    <pre className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg font-mono text-gray-800 dark:text-gray-200 overflow-x-auto border border-emerald-100 dark:border-emerald-900/30 min-h-12">
                                        {tc.expected_output}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
