import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../app/lib/context';
import { useAuth } from '@/app/lib/auth-context';
import { fetchUserPosts, ForumPost } from '@/app/forum/forum-helper/helper';
import { Plus, User, BarChart2, Star, TrendingUp, Info } from 'lucide-react';

import Link from 'next/link';

export default function ForumRightPanel() {
    const { isDark } = useAppContext();
    const { user } = useAuth();
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        async function loadInsights() {
            setIsLoading(true);
            try {
                const data = await fetchUserPosts(user!.id);
                setPosts(data);
            } catch (error) {
                console.error("Error fetching insights:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadInsights();
    }, [user]);


    
    return (
        <aside className={`w-80 flex-shrink-0 hidden lg:flex flex-col py-6 px-6 border-l ${isDark ? 'border-slate-800 bg-[#0f172a]' : 'border-slate-200 bg-slate-50'} overflow-y-auto`}>
            <div className="mb-10 space-y-3">
                {user ? (
                    <>
                        <Link href="/forum/create-post" className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                            <Plus className="w-4 h-4" />
                            Create New Post
                        </Link>
                        <Link href="/forum/your-content" className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'} text-sm font-bold transition-all active:scale-95`}>
                            <User className="w-4 h-4" />
                            Your Contents
                        </Link>
                    </>
                ) : (
                    <>
                        <button disabled className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-700/50 text-slate-400 text-sm font-bold cursor-not-allowed opacity-50">
                            <Plus className="w-4 h-4" />
                            Create New Post
                        </button>
                        <button disabled className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50'} text-slate-500 text-sm font-bold cursor-not-allowed opacity-50`}>
                            <User className="w-4 h-4" />
                            Your Contents
                        </button>
                    </>
                )}
            </div>

            <div className="mb-8">
                <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Post Insights</h3>
                
                {!user ? (
                    <div className={`p-6 rounded-2xl border ${isDark ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-indigo-100 bg-indigo-50/30'}`}>
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className={`p-3 rounded-xl ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white text-indigo-600 shadow-sm'}`}>
                                <Info className="w-5 h-5" />
                            </div>
                            <p className={`text-xs font-bold leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Login to participate in discussion and track your impact.
                            </p>
                            <Link href="/auth/login" className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400 transition-colors">
                                Sign In →
                            </Link>
                        </div>
                    </div>
                ) : isLoading ? (
                    <div className="space-y-4">
                        <div className={`h-20 w-full animate-pulse rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`} />
                        <div className={`h-20 w-full animate-pulse rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`} />
                    </div>
                ) : posts.length === 0 ? (
                    <div className={`p-8 rounded-2xl border border-dashed ${isDark ? 'border-slate-800 bg-slate-900/20' : 'border-slate-200 bg-slate-50/50'}`}>
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-400 shadow-sm'}`}>
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <p className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                No stats to show yet.
                            </p>
                            <Link href="/forum/create-post" className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                                Create your first post!
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className={`p-5 rounded-2xl border ${isDark ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-indigo-100 bg-indigo-50/50'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BarChart2 className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Number of Posts</span>
                                </div>
                                <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{posts.length}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Recent Contributions</h4>
                            <div className="flex flex-col gap-3">
                                {posts.slice(0, 3).map((post) => (
                                    <Link 
                                        key={post.id} 
                                        href={`/forum/${post.id}`}
                                        className={`group p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                                            isDark 
                                            ? 'border-slate-800 bg-slate-900/30 hover:bg-slate-800 hover:border-slate-700' 
                                            : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                                        }`}
                                    >
                                        <h5 className={`text-xs font-bold line-clamp-1 group-hover:text-indigo-500 transition-colors ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                            {post.title}
                                        </h5>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-[9px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                                            <div className="flex items-center gap-1">
                                                <Star className="w-2.5 h-2.5 text-amber-500" />
                                                <span className={`text-[9px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{post.upvotes}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            {posts.length > 3 && (
                                <Link 
                                    href="/forum/your-content"
                                    className={`block text-center text-[9px] font-black uppercase tracking-widest mt-2 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-indigo-600'}`}
                                >
                                    View all posts →
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
