"use client";

import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export default function SuccessModal({ isOpen, onClose, title = "Saved Successfully", message = "Your changes have been saved." }: SuccessModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                        aria-modal="true"
                        className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-emerald-500/20 bg-white p-8 shadow-2xl dark:border-emerald-500/10 dark:bg-slate-900"
                    >
                        {/* Decorative background glow */}
                        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
                        
                        <div className="relative flex flex-col items-center text-center">
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-inner dark:bg-emerald-500/10 dark:text-emerald-400">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>

                            <h2 className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                                {title}
                            </h2>

                            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                                {message}
                            </p>

                            <button
                                onClick={onClose}
                                className="mt-8 w-full rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-offset-slate-900"
                            >
                                Ok
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
