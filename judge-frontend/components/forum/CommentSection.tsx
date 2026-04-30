/* eslint-disable react-hooks/exhaustive-deps */
 
"use client";

import React, { useEffect, useState, useRef } from "react";
import { ForumComment, fetchComments, publishComment, checkProfanity } from "../../app/forum/forum-helper/helper";
import ProfanityModal from "../../app/forum/forum-helper/ProfanityModal";

import { useAppContext } from "../../app/lib/auth/context";
import { useAuth } from "../../app/lib/auth/auth-context";
import { Loader2, Send, MessageSquare, ArrowDown } from "lucide-react";
import CommentThread from "./CommentThread";

interface CommentSectionProps {
    postId: string;
    postOwnerId: string;
}

export default function CommentSection({ postId, postOwnerId }: CommentSectionProps) {
    const { isDark } = useAppContext();
    const { user } = useAuth();

    const [comments, setComments] = useState<ForumComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [topLevelBody, setTopLevelBody] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showProfanityModal, setShowProfanityModal] = useState(false);

    const inputRef = useRef<HTMLDivElement>(null);

    const scrollToInput = () => {
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Slightly delay focus to ensure scroll is happening
        setTimeout(() => {
            const textarea = inputRef.current?.querySelector('textarea');
            textarea?.focus();
        }, 300);
    };

    const loadComments = async () => {
        setIsLoading(true);
        const fetched = await fetchComments(postId, user?.id);
        setComments(fetched);
        setIsLoading(false);
    };

    useEffect(() => {
        loadComments();
    }, [postId, user?.id]);

    const handleTopLevelSubmit = async () => {
        if (!topLevelBody.trim() || !user) return;

        if (checkProfanity(topLevelBody)) {
            setShowProfanityModal(true);
            return;
        }

        setIsSubmitting(true);

        const { error } = await publishComment(postId, topLevelBody.trim(), user);
        setIsSubmitting(false);
        if (!error) {
            setTopLevelBody("");
            loadComments(); // Re-fetch to get new comment with auto-generated ID & timestamp
        } else {
            console.error("Failed to post comment:", error);
        }
    };

    const handleReplySubmit = async (parentId: string, body: string) => {
        if (!user) return;
        const { error } = await publishComment(postId, body, user, parentId);
        if (!error) {
            setReplyingTo(null);
            loadComments();
        } else {
            console.error("Failed to post reply:", error);
        }
    };

    return (
        <div className={`mt-16 pt-8 border-t ${isDark ? 'border-slate-800/50' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-8">
                <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    Discussion ({comments.length})
                </h2>
                <button 
                    onClick={scrollToInput}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        isDark 
                        ? 'border-indigo-500/30 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10' 
                        : 'border-indigo-100 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    }`}
                >
                    <MessageSquare className="w-3 h-3" />
                    Join Thread
                    <ArrowDown className="w-3 h-3 animate-bounce" />
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8 opacity-50">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-6">
                    <CommentThread 
                        comments={comments} 
                        replyingTo={replyingTo}
                        postOwnerId={postOwnerId}
                        onReply={(id) => setReplyingTo(id)}
                        onCancelReply={() => setReplyingTo(null)}
                        onSubmitReply={handleReplySubmit}
                        onDeleteComment={loadComments}
                    />
                </div>
            ) : (
                <div className={`p-8 rounded-2xl border border-dashed text-center ${isDark ? 'border-slate-800 bg-slate-900/10 text-slate-500' : 'border-slate-300 bg-slate-50/50 text-slate-400'}`}>
                    <p className="font-semibold text-sm">No comments yet. Be the first to share your thoughts!</p>
                </div>
            )}

            <div className="mt-12" ref={inputRef}>
                {user ? (
                    <div className={`group p-2 rounded-2xl border flex flex-col transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 ${isDark ? 'bg-slate-900/50 border-slate-800 focus-within:border-indigo-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-indigo-500/50'}`}>
                        <textarea
                            value={topLevelBody}
                            onChange={(e) => setTopLevelBody(e.target.value)}
                            placeholder="Add your thoughts to the discussion..."
                            className={`w-full bg-transparent p-4 min-h-30 text-sm focus:outline-none resize-y ${isDark ? 'text-slate-200 placeholder-slate-600' : 'text-slate-900 placeholder-slate-400'}`}
                        />
                        <div className={`flex items-center justify-between p-2 px-3 border-t mt-2 ${isDark ? 'border-slate-800/50' : 'border-slate-200'}`}>
                            <p className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Markdown is supported
                            </p>
                            <button
                                onClick={handleTopLevelSubmit}
                                disabled={!topLevelBody.trim() || isSubmitting}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/20 active:scale-95"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Post Comment
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={`p-8 rounded-3xl border border-dashed text-center flex flex-col items-center gap-4 ${isDark ? 'bg-slate-900/10 border-slate-800' : 'bg-slate-50/30 border-slate-200'}`}>
                        <div className={`p-3 rounded-2xl ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-400 shadow-sm'}`}>
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <p className={`text-sm font-black tracking-tight mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Join the Conversation
                            </p>
                            <p className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Sign in to share your wisdom with the community.
                            </p>    
                        </div>
                        <button 
                            onClick={() => window.location.href = '/login'}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            Log In to Comment
                        </button>
                    </div>
                )}
            </div>
            <ProfanityModal isOpen={showProfanityModal} onClose={() => setShowProfanityModal(false)} />
        </div>

    );
}
