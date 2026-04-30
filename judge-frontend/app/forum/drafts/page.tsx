/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import ForumLayout from "@/components/forum/ForumLayout";
import ForumSidebar from "@/components/forum/ForumSidebar";
import { useAppContext } from "@/app/lib/auth/context";
import { useAuth } from "@/app/lib/auth/auth-context";
import { fetchUserDrafts, deleteDraft, ForumDraft } from "@/app/forum/forum-helper/helper";
import Link from "next/link";
import { Edit2, Trash2, Calendar, Clock, AlertCircle, Trash, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Delete Confirmation Modal Component
interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    draftTitle: string;
    isDeleting: boolean;
}

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, draftTitle, isDeleting }: DeleteModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                        <Trash className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 tracking-tight">Delete Draft?</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">
                        Are you sure you want to delete <span className="text-slate-200 font-bold">"{draftTitle || "Untitled Draft"}"</span>? This action cannot be undone.
                    </p>
                    
                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="w-full py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : "Delete Draft"}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="w-full py-3.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 text-sm font-bold transition-all active:scale-95"
                        >
                            Keep it
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DraftsPage() {
    const { isDark } = useAppContext();
    const { user } = useAuth();
    const [drafts, setDrafts] = useState<ForumDraft[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Drafts');
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
    
    // Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [draftToDelete, setDraftToDelete] = useState<ForumDraft | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!user) return;
        
        async function loadUserDrafts() {
            setIsLoading(true);
            const data = await fetchUserDrafts(user!.id);
            setDrafts(data);
            setIsLoading(false);
        }

        loadUserDrafts();
    }, [user]);

    const handleDeleteClick = (draft: ForumDraft) => {
        setDraftToDelete(draft);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!draftToDelete) return;
        
        setIsDeleting(true);
        const { error } = await deleteDraft(draftToDelete.id);
        setIsDeleting(false);
        
        if (!error) {
            setDrafts(drafts.filter(d => d.id !== draftToDelete.id));
            setIsDeleteModalOpen(false);
            setDraftToDelete(null);
        } else {
            console.error("Failed to delete draft:", error);
            alert("Failed to delete draft. Please try again.");
        }
    };

    const skeletonCount = 3;

    return (
        <ForumLayout>
            <ForumSidebar 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeChannelId={activeChannelId}
                setActiveChannelId={setActiveChannelId} 
                isMobileMenuOpen={false} 
                setIsMobileMenuOpen={() => {}}
            />
            
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto px-4 py-6 md:px-8">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className={`text-3xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Your Drafts
                        </h1>
                        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Pick up where you left off.
                        </p>
                    </div>
                    <Link 
                        href="/forum" 
                        className={`px-6 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                            isDark 
                            ? 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
                        }`}
                    >
                        Forums
                    </Link>
                </div>

                {/* Drafts List */}
                <div className="space-y-4 w-full">
                    {isLoading ? (
                        Array.from({ length: skeletonCount }).map((_, i) => (
                            <div key={i} className={`p-6 rounded-3xl border animate-pulse ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <div className="h-6 w-1/3 bg-slate-800 rounded mb-4" />
                                <div className="h-4 w-full bg-slate-800 rounded mb-2" />
                                <div className="h-4 w-2/3 bg-slate-800 rounded mb-6" />
                                <div className="flex gap-2">
                                    <div className="h-8 w-20 bg-slate-800 rounded-xl" />
                                    <div className="h-8 w-20 bg-slate-800 rounded-xl" />
                                </div>
                            </div>
                        ))
                    ) : drafts.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center p-16 text-center rounded-4xl border-2 border-dashed ${isDark ? 'bg-slate-950/50 border-slate-800/50' : 'bg-slate-50/50 border-slate-200'}`}>
                            <div className={`p-5 rounded-3xl mb-6 ${isDark ? 'bg-slate-900 text-indigo-400' : 'bg-white text-indigo-500 shadow-sm'}`}>
                                <FileText className="w-10 h-10" />
                            </div>
                            <h3 className={`text-2xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>No drafts found</h3>
                            <p className={`text-slate-500 max-w-xs mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                You don't have any saved drafts. Start a new post and it will be saved here if you leave.
                            </p>
                            <Link href="/forum/new-post" className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95">
                                Create a new post
                            </Link>
                        </div>
                    ) : (
                        drafts.map((draft) => (
                            <div 
                                key={draft.id} 
                                className={`group p-6 rounded-3xl border transition-all duration-300 ${
                                    isDark 
                                    ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-900 hover:border-slate-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]' 
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                                }`}
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                <Calendar className="w-3.5 h-3.5" />
                                                Updated {new Date(draft.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>

                                        <Link href={`/forum/new-post?draftId=${draft.id}`} className={`block text-xl font-black mb-3 transition-colors ${isDark ? 'text-white hover:text-indigo-400' : 'text-slate-900 hover:text-indigo-600'}`}>
                                            {draft.title || <span className="italic opacity-50">Untitled Draft</span>}
                                        </Link>

                                        <div className={`prose-sm line-clamp-2 text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {draft.body ? (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {draft.body}
                                                </ReactMarkdown>
                                            ) : (
                                                <span className="italic opacity-50">No content yet...</span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {draft.tags?.map((tag, i) => (
                                                <span key={i} className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col gap-2 shrink-0">
                                        <Link 
                                            href={`/forum/new-post?draftId=${draft.id}`}
                                            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                                                isDark 
                                                ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white' 
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            Edit & Publish
                                        </Link>
                                        <button 
                                            onClick={() => handleDeleteClick(draft)}
                                            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                                                isDark 
                                                ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' 
                                                : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100'
                                            }`}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            <DeleteConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                draftTitle={draftToDelete?.title || ""}
                isDeleting={isDeleting}
            />
        </ForumLayout>
    );
}
