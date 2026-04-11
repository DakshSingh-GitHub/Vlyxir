"use client";

import { ForumPost } from "../../app/forum/forum-helper/helper";
import { useAppContext } from "../../app/lib/context";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PostDetailProps {
    post: ForumPost;
}

export default function PostDetail({ post }: PostDetailProps) {
    const { isDark } = useAppContext();

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
                <div className="flex items-center gap-3 mb-8">
                    <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-black text-sm shadow-lg ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        {post.author_username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                        <div className={`text-sm font-black truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {post.author_username}
                        </div>
                        <div className={`text-[11px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {new Date(post.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>

                <h1 className={`text-3xl md:text-5xl font-black mb-10 tracking-tighter leading-[1.1] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {post.title}
                </h1>

                <div className={`prose-forum max-w-none ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.body}
                    </ReactMarkdown>
                </div>
            </article>
        </div>
    );
}
