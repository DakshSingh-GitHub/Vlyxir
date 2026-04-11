"use client";

import { ForumComment } from "../../app/forum/forum-helper/helper";
import { useAppContext } from "../../app/lib/context";
import { Reply, User } from "lucide-react";

interface CommentThreadProps {
    comments: ForumComment[];
    parentId?: string | null;
    onReply?: (parentId: string) => void;
}

export default function CommentThread({ comments, parentId = null, onReply }: CommentThreadProps) {
    const { isDark } = useAppContext();
    
    // Filter comments for the current level
    const currentComments = comments.filter(c => c.parent_id === parentId);
    
    if (currentComments.length === 0) return null;

    return (
        <div className={`space-y-4 ${parentId ? 'ml-4 md:ml-8 mt-4 border-l-2 pl-4 md:pl-6' : ''} ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
            {currentComments.map((comment) => (
                <div key={comment.id} className="group animate-in fade-in slide-in-from-left-2 duration-300">
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
                            <button 
                                onClick={() => onReply && onReply(comment.id)}
                                className={`mt-2 flex items-center gap-1.5 text-[11px] font-bold tracking-tight hover:text-indigo-500 transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                            >
                                <Reply className="w-3 h-3" />
                                REPLY
                            </button>
                        </div>
                    </div>
                    {/* Recursive call for replies */}
                    <CommentThread comments={comments} parentId={comment.id} onReply={onReply} />
                </div>
            ))}
        </div>
    );
}
