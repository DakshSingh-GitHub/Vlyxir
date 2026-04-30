"use client";

interface CreatePostErrorModalProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
}

export default function CreatePostErrorModal({ isOpen, message, onClose }: CreatePostErrorModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/65 backdrop-blur-md" />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-post-error-title"
                className="relative w-full max-w-md rounded-4xl border border-red-200 bg-white p-8 shadow-2xl dark:border-red-900/40 dark:bg-slate-950"
            >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/70 dark:text-red-400">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-8 w-8"
                        aria-hidden="true"
                    >
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h17.94a2 2 0 0 0 1.71-3L14.71 3.86a2 2 0 0 0-3.42 0Z" />
                    </svg>
                </div>

                <h2 id="create-post-error-title" className="text-2xl font-black tracking-tight text-red-600 dark:text-red-400">
                    Error
                </h2>

                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                    {message}
                </p>

                <div className="mt-8">
                    <button
                        onClick={onClose}
                        className="w-full rounded-2xl bg-red-600 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
