"use client";

import { useEffect, useRef } from "react";
import { anime } from "../../app/lib/utils/anime";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    title?: string;
    message?: string;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    title = "Delete Comment?",
    message = "This action is permanent and cannot be undone. Are you sure you want to proceed?"
}: DeleteConfirmationModalProps) {
    const backdropRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        if (backdropRef.current) {
            anime({
                targets: backdropRef.current,
                opacity: [0, 1],
                duration: 200,
                easing: "easeOutQuad"
            });
        }

        if (panelRef.current) {
            anime({
                targets: panelRef.current,
                opacity: [0, 1],
                translateY: [20, 0],
                scale: [0.95, 1],
                duration: 300,
                easing: "easeOutCubic"
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <button
                ref={backdropRef}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md opacity-0 transition-all"
                aria-label="Close modal"
            />

            {/* Modal Panel */}
            <div
                ref={panelRef}
                className="relative z-10 w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 dark:bg-slate-900/80 p-8 shadow-2xl opacity-0"
                style={{ backdropFilter: 'blur(20px)' }}
            >
                <div className="flex flex-col items-center text-center">
                    {/* Icon Container with Glow */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 animate-pulse bg-red-500/20 blur-xl rounded-full" />
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/30">
                            <AlertTriangle className="h-8 w-8 text-white" />
                        </div>
                    </div>

                    <h3 className="mb-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                        {title}
                    </h3>
                    <p className="mb-8 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                        {message}
                    </p>

                    <div className="flex w-full flex-col gap-3">
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-900 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] dark:bg-white"
                        >
                            <div className="absolute inset-0 bg-linear-to-r from-red-600 to-orange-600 opacity-0 transition-opacity group-hover:opacity-100" />
                            <span className="relative text-xs tracking-widest uppercase text-white dark:text-slate-900 group-hover:text-white">
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "CONFIRM DELETE"
                                )}
                            </span>
                        </button>

                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="h-12 w-full rounded-2xl border border-slate-200 text-xs font-bold tracking-widest uppercase text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        >
                            Wait, Keep it
                        </button>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
