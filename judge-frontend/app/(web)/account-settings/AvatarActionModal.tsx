"use client";

import { Image as ImageIcon, Trash2, RotateCcw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AvatarActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: () => void;
    onDelete: () => void;
    onResetToProvider?: () => void;
    providerName?: string;
}

export default function AvatarActionModal({ 
    isOpen, 
    onClose, 
    onUpload, 
    onDelete, 
    onResetToProvider,
    providerName = "Gmail"
}: AvatarActionModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        role="dialog"
                        className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white pl-1">Edit Avatar</h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => { onUpload(); onClose(); }}
                                className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:bg-slate-800"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                    <ImageIcon size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">Select from Files</p>
                                    <p className="text-xs text-slate-500">Upload a custom image from your device</p>
                                </div>
                            </button>

                            {onResetToProvider && (
                                <button
                                    onClick={() => { onResetToProvider(); onClose(); }}
                                    className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:bg-slate-800"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                        <RotateCcw size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Reset to {providerName}</p>
                                        <p className="text-xs text-slate-500">Use your default {providerName} picture</p>
                                    </div>
                                </button>
                            )}

                            <button
                                onClick={() => { onDelete(); onClose(); }}
                                className="flex w-full items-center gap-4 rounded-2xl border border-rose-100 bg-rose-50/30 p-4 text-left transition hover:bg-rose-50 dark:border-rose-900/30 dark:bg-rose-950/10 dark:hover:bg-rose-900/20"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                                    <Trash2 size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-rose-600 dark:text-rose-400">Delete profile photo</p>
                                    <p className="text-xs text-rose-500/70">Remove your photo and use initials</p>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
