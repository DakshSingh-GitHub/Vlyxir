"use client";

import { useState } from "react";
import { Reply, User, Send, Loader2, X, ThumbsUp } from "lucide-react";
import { ForumComment, toggleCommentLike } from "../../app/forum/forum-helper/helper";
import { useAppContext } from "../../app/lib/context";
import { useAuth } from "../../app/lib/auth-context";

interface CommentThreadProps {
    comments: ForumComment[];
    parentId?: string | null;
    onReply?: (parentId: string) => void;
    replyingTo?: string | null;
    onSubmitReply?: (parentId: string, body: string) => Promise<void>;
    onCancelReply?: () => void;
}

interface CommentItemProps {
    comment: ForumComment;
    isDark: boolean;
    onReply?: (parentId: string) => void;
    replyingTo?: string | null;
    replyBody: string;
    setReplyBody: (body: string) => void;
    isSubmitting: boolean;
    setIsSubmitting: (val: boolean) => void;
    onSubmitReply?: (parentId: string, body: string) => Promise<void>;
    onCancelReply?: () => void;
    comments: ForumComment[];
}

function CommentItem({ 
    comment, 
    isDark, 
    onReply, 
    replyingTo, 
    replyBody, 
    setReplyBody, 
    isSubmitting, 
    setIsSubmitting,
    onSubmitReply,
    onCancelReply,
    comments
}: CommentItemProps) {
    const { user } = useAuth();
    const [likes, setLikes] = useState(comment.likes_count || 0);
    const [hasLiked, setHasLiked] = useState(!!comment.has_liked);
    const [isLiking, setIsLiking] = useState(false);

    const handleLike = async () => {
        if (!user) {
            window.location.href = '/login';
            return;
        }
        if (isLiking) return;

        setIsLiking(true);
        const newHasLiked = !hasLiked;
        setHasLiked(newHasLiked);
        setLikes(prev => newHasLiked ? prev + 1 : prev - 1);

        const { error } = await toggleCommentLike(comment.id, user.id);
        if (error) {
            setHasLiked(!newHasLiked);
            setLikes(prev => !newHasLiked ? prev + 1 : prev - 1);
        }
        setIsLiking(false);
    };

    return (
        <div className="group animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="flex gap-3">
                <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm ${isDark ? 'bg-slate-800 text-indigo-400' : 'bg-slate-100 text-indigo-600'}`}>
                    {comment.author_username?.charAt(0) || <User className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                            {comment.author_username}
                        </span>
                        <span className={`text-[10px] whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <p className={`text-sm leading-relaxed break-words ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {comment.body}
                    </p>
                    
                    <div className="mt-2 flex items-center gap-4">
                        <button 
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`flex items-center gap-1 text-[11px] font-bold tracking-tight transition-all hover:scale-110 active:scale-90 ${hasLiked ? 'text-indigo-500' : isDark ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'}`}
                        >
                            <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                            {likes > 0 ? likes : 'LIKE'}
                        </button>

                        <button 
                            onClick={() => onReply && onReply(comment.id)}
                            className={`flex items-center gap-1.5 text-[11px] font-bold tracking-tight hover:text-indigo-500 transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                            <Reply className="w-3.5 h-3.5" />
                            REPLY
                        </button>
                    </div>

                    {replyingTo === comment.id && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className={`p-1 rounded-xl border flex ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <textarea
                                    value={replyBody}
                                    onChange={(e) => setReplyBody(e.target.value)}
                                    placeholder="Write a reply..."
                                    className={`flex-1 bg-transparent p-2 md:p-3 text-sm focus:outline-none resize-none min-h-[60px] ${isDark ? 'text-slate-200 placeholder-slate-600' : 'text-slate-900 placeholder-slate-400'}`}
                                    autoFocus
                                />
                                <div className="flex flex-col gap-1 p-1">
                                    <button 
                                        onClick={() => {
                                            setReplyBody("");
                                            onCancelReply?.();
                                        }}
                                        className={`p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            if (!replyBody.trim()) return;
                                            setIsSubmitting(true);
                                            await onSubmitReply?.(comment.id, replyBody.trim());
                                            setIsSubmitting(false);
                                            setReplyBody("");
                                        }}
                                        disabled={!replyBody.trim() || isSubmitting}
                                        className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Recursive call for replies */}
            <CommentThread 
                comments={comments} 
                parentId={comment.id} 
                onReply={onReply}
                replyingTo={replyingTo}
                onSubmitReply={onSubmitReply}
                onCancelReply={onCancelReply}
            />
        </div>
    );
}

export default function CommentThread({ 
    comments, 
    parentId = null, 
    onReply,
    replyingTo,
    onSubmitReply,
    onCancelReply
}: CommentThreadProps) {
    const { isDark } = useAppContext();
    const [replyBody, setReplyBody] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Filter comments for the current level
    const currentComments = comments.filter(c => c.parent_id === parentId);
    
    if (currentComments.length === 0) return null;

    return (
        <div className={`space-y-4 ${parentId ? 'ml-4 md:ml-8 mt-4 border-l-2 pl-4 md:pl-6' : ''} ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
            {currentComments.map((comment) => (
                <CommentItem 
                    key={comment.id}
                    comment={comment}
                    isDark={isDark}
                    onReply={onReply}
                    replyingTo={replyingTo}
                    replyBody={replyBody}
                    setReplyBody={setReplyBody}
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                    onSubmitReply={onSubmitReply}
                    onCancelReply={onCancelReply}
                    comments={comments}
                />
            ))}
        </div>
    );
}
