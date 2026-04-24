"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  currentUsername: string;
  isDark: boolean;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  currentUsername,
  isDark,
}: DeleteAccountModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (confirmationText !== currentUsername) return;
    
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account.");
      setIsDeleting(false);
    }
  };

  const isConfirmed = confirmationText === currentUsername;

  const overlayClass = "fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6";
  const backdropClass = "absolute inset-0 bg-slate-950/60 backdrop-blur-sm";
  const surfaceClass = isDark
    ? "border-slate-800 bg-slate-950 text-slate-100"
    : "border-slate-200 bg-white text-slate-900";
  const inputClass = isDark
    ? "border-slate-800 bg-slate-900 text-slate-100 placeholder:text-slate-600 focus:border-rose-500"
    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-rose-500";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={overlayClass}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={backdropClass}
            onClick={!isDeleting ? onClose : undefined}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border p-8 shadow-2xl ${surfaceClass}`}
          >
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="absolute right-6 top-6 rounded-full p-2 transition hover:bg-slate-500/10 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-black tracking-tight md:text-3xl">
              Delete account permanently?
            </h2>
            
            <p className={`mt-4 text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              This action is <span className="font-bold text-rose-500">irreversible</span>. 
              All your submissions, profile data, and forum posts will be permanently removed.
            </p>

            <div className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Type your username <span className={`font-black ${isDark ? "text-slate-200" : "text-slate-900"}`}>{currentUsername}</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  disabled={isDeleting}
                  placeholder="Type your username"
                  className={`w-full rounded-2xl border px-5 py-4 outline-none transition focus:ring-4 focus:ring-rose-500/10 ${inputClass}`}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className={`flex-1 rounded-2xl border px-6 py-4 text-sm font-bold transition ${isDark ? "border-slate-800 bg-slate-900 hover:bg-slate-800" : "border-slate-200 bg-white hover:bg-slate-50"} disabled:opacity-50`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!isConfirmed || isDeleting}
                  className={`flex-[1.5] rounded-2xl bg-rose-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none`}
                >
                  {isDeleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    "Delete account permanently"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
