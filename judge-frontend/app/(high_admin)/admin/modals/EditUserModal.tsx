/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Check, ChevronDown, Shield, Trash2, Key } from 'lucide-react';
import { User, Permission } from '../../../lib/types/types';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSave: (id: string, updates: Partial<User>) => void;
    onDelete?: (id: string) => void;
    currentUser: User | null;
}

const ROLES = [
    {
        id: 'DOCS',
        label: 'Internal Docs',
        description: 'Read-only access to internal documentation',
        permissions: ['DOCS_INT'] as Permission[],
        color: 'blue'
    },
    {
        id: 'ADMIN_VIEW',
        label: 'Admin View',
        description: 'View admin dashboard and user lists',
        permissions: ['DOCS_INT', 'ADMIN_VIEW'] as Permission[],
        color: 'indigo'
    },
    {
        id: 'ADMIN_EDIT',
        label: 'Admin Edit',
        description: 'Full access to manage users and system',
        permissions: ['DOCS_INT', 'ADMIN_VIEW', 'ADMIN_EDIT'] as Permission[],
        color: 'red'
    }
];

export default function EditUserModal({ isOpen, onClose, user, onSave, onDelete, currentUser }: EditUserModalProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState(ROLES[0]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setPassword(''); // Don't show existing password

            // Determine current role based on permissions
            if (user.permissions.includes('ADMIN_EDIT')) {
                setSelectedRole(ROLES[2]);
            } else if (user.permissions.includes('ADMIN_VIEW')) {
                setSelectedRole(ROLES[1]);
            } else {
                setSelectedRole(ROLES[0]);
            }
        }
    }, [user, isOpen]);

    if (!user) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const updates: Partial<User> = {
            username,
            permissions: selectedRole.permissions
        };

        if (password) {
            updates.password = password;
        }

        onSave(user.id, updates);
        onClose();
    };

    const isSelf = currentUser?.id === user.id;
    const canEdit = currentUser?.isRoot || (currentUser?.permissions.includes('ADMIN_EDIT'));
    // Prevent editing root user unless it's self (and even then, restrict critical changes if needed)
    const isTargetRoot = user.isRoot;

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
                        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 text-white text-xl md:text-2xl font-black">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black">{user.username}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">User ID: {user.id.substring(0, 8)}...</span>
                                    {user.isRoot && (
                                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-md uppercase">Root</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Username</label>
                                <input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    // Root username shouldn't be changed easily, or at all? Let's allow it but be careful.
                                    disabled={!canEdit}
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-950 rounded-2xl outline-none border border-transparent focus:border-indigo-500 font-bold transition-all disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">New Password</label>
                                <div className="relative">
                                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={!canEdit}
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-950 rounded-2xl outline-none border border-transparent focus:border-indigo-500 font-bold transition-all disabled:opacity-50"
                                        placeholder="Leave empty to keep current"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Role & Permissions</label>
                                <button
                                    type="button"
                                    onClick={() => canEdit && !isTargetRoot && setIsDropdownOpen(!isDropdownOpen)}
                                    disabled={!canEdit || isTargetRoot}
                                    className={`w-full px-6 py-4 bg-gray-50 dark:bg-gray-950 rounded-2xl outline-none border border-transparent ${canEdit && !isTargetRoot ? 'focus:border-indigo-500' : 'opacity-60 cursor-not-allowed'} text-left flex items-center justify-between group`}
                                >
                                    <div>
                                        <div className="font-bold text-sm flex items-center gap-2">
                                            {selectedRole.label}
                                            {isTargetRoot && <Shield className="w-3 h-3 text-indigo-500" />}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium">{selectedRole.description}</div>
                                    </div>
                                    {!isTargetRoot && (
                                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    )}
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
                                                    disabled={role.id === 'ADMIN_EDIT' && !currentUser?.isRoot} // Only root can grant root-like/admin_edit permissions? Or admin_edit can grant admin_edit? Let's say admins can grant admin.
                                                    onClick={() => {
                                                        setSelectedRole(role);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
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

                            <div className="flex gap-4 pt-4">
                                {canEdit && onDelete && !isTargetRoot && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this user?')) {
                                                onDelete(user.id);
                                                onClose();
                                            }
                                        }}
                                        className="px-6 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center gap-2"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={!canEdit}
                                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-base md:text-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
