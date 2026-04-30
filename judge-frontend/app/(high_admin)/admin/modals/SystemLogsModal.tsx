import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, CheckCircle, AlertTriangle, AlertOctagon, Terminal, Clock } from 'lucide-react';
import { SystemLog } from '../../../lib/utils/storage';

interface SystemLogsModalProps {
    isOpen: boolean;
    onClose: () => void;
    logs: SystemLog[];
}

export default function SystemLogsModal({ isOpen, onClose, logs }: SystemLogsModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                                    <Terminal className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 dark:text-white">System Logs</h2>
                                    <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Audit trail and system events</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {logs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">No Logs Found</h3>
                                    <p className="text-xs md:text-sm text-gray-500">System events will appear here.</p>
                                </div>
                            ) : (
                                logs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-start gap-4 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                                            log.status === 'WARNING' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                                'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                            }`}>
                                            {log.status === 'SUCCESS' ? <CheckCircle className="w-4 h-4" /> :
                                                log.status === 'WARNING' ? <AlertTriangle className="w-4 h-4" /> :
                                                    <AlertOctagon className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${log.type === 'AUDIT' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                                                    log.type === 'SECURITY' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                                        'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                    }`}>
                                                    {log.type}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {log.details}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
