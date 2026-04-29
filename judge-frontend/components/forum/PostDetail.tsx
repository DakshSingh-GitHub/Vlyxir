"use client";

import { ForumPost } from "../../app/forum/forum-helper/helper";
import { useAppContext } from "../../app/lib/context";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toggleUpvote } from "../../app/forum/forum-helper/helper";
import { useAuth } from "../../app/lib/auth-context";
import CommentSection from "./CommentSection";
import ProblemReferenceModal from "./ProblemReferenceModal";
import { Sparkles, ExternalLink } from "lucide-react";

interface PostDetailProps {
    post: ForumPost;
}

export default function PostDetail({ post }: PostDetailProps) {
    const { isDark } = useAppContext();
    const { user } = useAuth();
    const [upvoteCount, setUpvoteCount] = useState(post.upvotes_count || 0);
    const [hasUpvoted, setHasUpvoted] = useState(!!post.has_upvoted);
    const [isVoting, setIsVoting] = useState(false);
    const [showProblemModal, setShowProblemModal] = useState(false);

    const handleVote = async () => {
        if (!user) {
            // Basic redirect to login if not authenticated
            window.location.href = '/login';
            return;
        }

        setIsVoting(true);
        // Optimistic update
        const newHasUpvoted = !hasUpvoted;
        setHasUpvoted(newHasUpvoted);
        setUpvoteCount(prev => newHasUpvoted ? prev + 1 : prev - 1);

        const { error } = await toggleUpvote(post.id, user.id);
        if (error) {
            // Rollback on error
            setHasUpvoted(!newHasUpvoted);
            setUpvoteCount(prev => !newHasUpvoted ? prev + 1 : prev - 1);
            console.error("Voting error:", error);
        }
        setIsVoting(false);
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto px-4 py-8 md:px-12">
            <Link
                href="/forum"
                className={`flex items-center gap-2 mb-8 text-xs font-black tracking-widest transition-all w-fit ${isDark ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'}`}
            >
                <ArrowLeft className="w-4 h-4" />
                BACK TO FEED
            </Link>

            <article className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Link
                    href={`/user/${post.author_username}`}
                    className="flex items-center gap-3 mb-8 group w-fit"
                >
                    <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-black text-sm shadow-lg transition-all group-hover:scale-110 group-hover:shadow-indigo-500/20 ${isDark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                        {post.author_username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                        <div className={`text-sm font-black truncate transition-colors group-hover:text-indigo-400 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {post.author_username}
                        </div>
                        <div className={`text-[11px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {new Date(post.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </Link>

                <h1 className={`text-3xl md:text-5xl font-black mb-6 tracking-tighter leading-[1.1] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {post.title}
                </h1>

                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-10">
                        {post.tags.map((tag, i) => (
                            <span
                                key={i}
                                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border shadow-sm transition-all hover:scale-105 cursor-default ${isDark
                                        ? 'bg-slate-950 border-slate-800 text-slate-400'
                                        : 'bg-slate-50 border-slate-200 text-slate-500'
                                    }`}
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {post.referenced_problem_id && (
                    <div className={`mb-10 p-6 rounded-2xl border transition-all hover:scale-[1.01] ${
                        isDark 
                        ? 'bg-indigo-500/5 border-indigo-500/20' 
                        : 'bg-indigo-50/50 border-indigo-100'
                    }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl ${
                                    isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white text-indigo-600 shadow-sm'
                                }`}>
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        Contextual Problem Attached
                                    </h3>
                                    <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        This question refers to a specific technical challenge.
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowProblemModal(true)}
                                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all active:scale-95 ${
                                    isDark 
                                    ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/10'
                                }`}
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                VIEW PROBLEM
                            </button>
                        </div>
                    </div>
                )}

                <div className={`prose-forum max-w-none mb-12 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.body}
                    </ReactMarkdown>
                </div>

                {/* Upvote Interaction */}
                <div className="flex items-center gap-6 mb-16">
                    <button
                        onClick={handleVote}
                        disabled={isVoting}
                        className={`group flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all active:scale-95 ${hasUpvoted
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                                : isDark
                                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-600'
                            }`}
                    >
                        {isVoting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <ArrowUp className={`w-5 h-5 transition-transform group-hover:-translate-y-1 ${hasUpvoted ? 'fill-current' : ''}`} />
                        )}
                        <span className="text-sm font-black tracking-tight">
                            {hasUpvoted ? 'Upvoted' : 'Upvote'}
                        </span>
                        <div className={`w-px h-4 mx-1 ${hasUpvoted ? 'bg-white/30' : 'bg-slate-700/20'}`} />
                        <span className="text-sm font-black">
                            {upvoteCount}
                        </span>
                    </button>

                    <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        {upvoteCount === 1 ? '1 upvote' : `${upvoteCount} upvotes`}
                    </div>
                </div>

                <CommentSection postId={post.id} postOwnerId={post.author_id} />
            </article>

            {post.referenced_problem_id && (
                <ProblemReferenceModal 
                    isOpen={showProblemModal} 
                    onClose={() => setShowProblemModal(false)} 
                    problemId={post.referenced_problem_id} 
                />
            )}
        </div>
    );
}
