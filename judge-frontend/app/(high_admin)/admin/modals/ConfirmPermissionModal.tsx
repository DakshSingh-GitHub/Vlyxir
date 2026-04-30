import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

interface ConfirmPermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password: string) => void;
}

export default function ConfirmPermissionModal({ isOpen, onClose, onConfirm }: ConfirmPermissionModalProps) {
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleConfirm = () => {
        onConfirm(confirmPassword);
        setConfirmPassword("");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-red-100 dark:border-red-900/30 shadow-2xl"
                    >
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <ShieldAlert className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-black text-center mb-2">High Permission Alert</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-center text-sm font-medium mb-8 leading-relaxed">
                            You are about to grant <span className="text-red-500 font-black">Admin Edit</span> rights. This user will be able to manage other users.
                        </p>

                        <div className="space-y-4">
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Enter YOUR admin password"
                                className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-950 rounded-2xl outline-none border border-transparent focus:border-red-500 font-bold"
                            />
                            <div className="flex gap-3">
                                <button onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-bold">Cancel</button>
                                <button onClick={handleConfirm} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold">Authorize</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
