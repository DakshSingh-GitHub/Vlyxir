"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface LimitFlashProps {
    isVisible: boolean;
    onClose: () => void;
    message?: string;
}

export default function LimitFlash({ isVisible, onClose, message = "Limits reached for today" }: LimitFlashProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
                >
                    <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-xl p-4 shadow-2xl shadow-rose-500/20">
                        {/* Background glow effect */}
                        <div className="absolute inset-0 bg-linear-to-r from-rose-500/10 via-transparent to-rose-500/10" />
                        
                        <div className="relative flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 shadow-lg shadow-rose-500/30">
                                <AlertCircle className="h-6 w-6 text-white" />
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="text-sm font-black uppercase tracking-widest text-rose-500">Access Restricted</h3>
                                <p className="text-xs font-bold text-rose-700 dark:text-rose-300 mt-0.5">{message}</p>
                            </div>
                            
                            <button 
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-rose-500/20 text-rose-500 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        
                        {/* Progress line decoration */}
                        <motion.div 
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 5, ease: "linear" }}
                            onAnimationComplete={onClose}
                            className="absolute bottom-0 left-0 h-1 bg-rose-500" 
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
