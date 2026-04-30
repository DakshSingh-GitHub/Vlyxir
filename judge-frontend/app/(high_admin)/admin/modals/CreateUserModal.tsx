import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Check, ChevronDown } from 'lucide-react';
import { Permission } from '../../../lib/types/types';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (username: string, password: string, permissions: Permission[]) => void;
}

const ROLES = [
    {
        id: 'DOCS',
        label: 'Internal Docs',
        description: 'Read-only access to internal documentation',
        permissions: ['DOCS_INT'] as Permission[]
    },
    {
        id: 'ADMIN_VIEW',
        label: 'Admin View',
        description: 'View admin dashboard and user lists',
        permissions: ['DOCS_INT', 'ADMIN_VIEW'] as Permission[]
    }
];

export default function CreateUserModal({ isOpen, onClose, onSubmit }: CreateUserModalProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState(ROLES[0]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(username, password, selectedRole.permissions);
        // Reset form
        setUsername('');
        setPassword('');
        setSelectedRole(ROLES[0]);
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
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black">Add User</h2>
                                <p className="text-gray-500 text-xs md:text-sm font-medium">Create a new authenticated user</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Username</label>
                                <input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-950 rounded-2xl outline-none border border-transparent focus:border-indigo-500 font-bold transition-all"
                                    placeholder="Enter username"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-950 rounded-2xl outline-none border border-transparent focus:border-indigo-500 font-bold transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Role & Permissions</label>
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-950 rounded-2xl outline-none border border-transparent focus:border-indigo-500 text-left flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="font-bold text-sm">{selectedRole.label}</div>
                                        <div className="text-[10px] text-gray-400 font-medium">{selectedRole.description}</div>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-20"
                                        >
                                            {ROLES.map((role) => (
                                                <button
                                                    key={role.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedRole(role);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between group"
                                                >
                                                    <div>
                                                        <div className={`font-bold text-sm ${selectedRole.id === role.id ? 'text-indigo-600' : ''}`}>
                                                            {role.label}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 font-medium">{role.description}</div>
                                                    </div>
                                                    {selectedRole.id === role.id && (
                                                        <Check className="w-4 h-4 text-indigo-600" />
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-base md:text-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                            >
                                <UserPlus className="w-5 h-5" />
                                Create User
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
