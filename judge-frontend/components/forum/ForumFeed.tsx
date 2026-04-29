"use client";

import { Search, MessagesSquare, MessageSquare, ArrowUp, Menu, Plus, User, PenSquare, HelpCircle } from "lucide-react";
import { useAppContext } from "@/app/lib/context";
import { useEffect, useState } from "react";
import { fetchPosts, ForumPost } from "../../app/forum/forum-helper/helper";
import { useAuth } from "@/app/lib/auth-context";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";


interface ForumFeedProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    activeChannelId: string | null;
    setActiveChannelId: (id: string | null) => void;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export default function ForumFeed({
    activeTab,
    setActiveTab,
    activeChannelId,
    setActiveChannelId,
    setIsMobileMenuOpen
}: ForumFeedProps) {

    const { isDark } = useAppContext();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    const [isFabOpen, setIsFabOpen] = useState(false);
    const tabs = ['All Posts', 'Trending', 'New', 'Fast Growing'];

    // Debouncing search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch posts from database
    useEffect(() => {
        let isMounted = true;

        async function loadPosts() {
            setIsLoading(true);
            try {
                // Determine if we are using a navigation tab or a channel-specific sort
                // If activeChannelId is set, and activeTab is one of the nav tabs, use it for sorting
                const navTabs = ['All Posts', 'Trending', 'New', 'Fast Growing'];
                const currentSort = navTabs.includes(activeTab) ? activeTab : 'All Posts';

                const data = await fetchPosts(activeChannelId || undefined, currentSort, debouncedSearchQuery, user?.id);
                if (isMounted) {
                    setPosts(data || []);
                }
            } catch (error) {
                console.error("Failed to load posts", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }
        loadPosts();

        return () => {
            isMounted = false;
        };
    }, [activeTab, activeChannelId, debouncedSearchQuery, user?.id]);

    const skeletonCount = 4;

    return (
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto px-4 py-6 md:px-8">
            {/* Search Bar & Mobile Menu Toggle */}
            <div className="flex items-center gap-2 mb-8 px-2">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className={`md:hidden p-2.5 rounded-xl border transition-all active:scale-95 ${isDark
                        ? 'bg-slate-800/50 border-slate-700 text-slate-300'
                        : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                        }`}
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className={`h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full py-2.5 px-10 rounded-2xl text-sm transition-all text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] ${isDark
                            ? 'bg-slate-800/50 text-slate-200 border-slate-700 placeholder:text-slate-400'
                            : 'bg-white text-slate-800 border-slate-200 placeholder:text-slate-500 border'
                            }`}
                    />
                </div>
            </div>

            {/* Tabs Header - Hidden on Mobile (available in sidebar) */}
            <div className={`hidden md:flex gap-6 mb-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} overflow-x-auto no-scrollbar min-h-[48px]`}>
                {tabs.map((tab) => {
                    // A tab is active if activeTab matches it, 
                    // OR if activeChannelId is set and this is the default tab ('All Posts') and activeTab is the channel name
                    const isTabInNav = tabs.includes(activeTab);
                    const isActive = activeTab === tab || (!isTabInNav && tab === 'All Posts');

                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 px-1 text-sm font-bold transition-all relative whitespace-nowrap min-w-fit flex items-center justify-center ${isActive
                                ? (isDark ? 'text-indigo-400' : 'text-indigo-600')
                                : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')
                                }`}
                        >
                            {tab}
                            {isActive && (
                                <div className="absolute -bottom-[1px] left-0 right-0 h-[2.5px] bg-indigo-500 rounded-full z-20" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Feed Content */}
            <div className="space-y-4">
                {isLoading ? (
                    // Skeleton Cards
                    Array.from({ length: skeletonCount }).map((_, i) => (
                        <div key={i} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm transition-all duration-300`}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} animate-pulse`} />
                                <div className={`h-4 w-24 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'} animate-pulse`} />
                            </div>
                            <div className={`h-6 w-3/4 rounded mb-2 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} animate-pulse`} />
                            <div className={`h-4 w-full rounded mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} animate-pulse`} />
                            <div className="flex gap-2">
                                <div className={`h-4 w-12 rounded ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'} animate-pulse`} />
                                <div className={`h-4 w-12 rounded ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'} animate-pulse`} />
                            </div>
                        </div>
                    ))
                ) : posts.length === 0 ? (
                    // Beautiful Empty State
                    <div className={`mt-8 flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed ${isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-slate-50/50 border-slate-300'}`}>
                        <div className={`p-5 rounded-3xl mb-5 shadow-lg ${isDark ? 'bg-slate-800/80 text-indigo-400 shadow-black/20' : 'bg-white text-indigo-500 shadow-indigo-500/10'}`}>
                            <MessagesSquare className="w-8 h-8" />
                        </div>
                        <h3 className={`text-xl md:text-2xl font-black mb-2 tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            No forums here
                        </h3>
                        <p className={`text-sm md:text-base max-w-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            It looks quiet in here. There are no posts in the database yet. Be the first one to start the conversation!
                        </p>
                    </div>
                ) : (
                    // Real Cards
                    posts.map((post) => (
                        <div
                            key={post.id}
                            className={`relative group p-5 rounded-2xl border transition-all duration-300 mb-4 last:mb-0 ${isDark
                                ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                                } shadow-sm`}
                        >
                            {/* Card Link Overlay */}
                            <Link href={`/forum/${post.id}`} className="absolute inset-0 z-0 rounded-2xl" />

                            <div className="relative z-10 pointer-events-none">
                                <div className="flex items-center gap-3 mb-3">
                                    <Link
                                        href={`/user/${post.author_username}`}
                                        className="flex items-center gap-3 pointer-events-auto group/author"
                                    >
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs shadow-sm transition-all group-hover/author:scale-110 ${isDark ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'}`}>
                                            {post.author_username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className={`text-sm font-semibold transition-colors group-hover/author:text-indigo-400 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            {post.author_username || 'Anonymous'}
                                        </div>
                                    </Link>
                                    <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        • {new Date(post.created_at).toLocaleDateString()}
                                    </div>

                                    {post.channel_name === 'Questions' && (
                                        <div className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm transition-all hover:scale-105 ${
                                            isDark ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
                                        }`}>
                                            <HelpCircle className="w-4 h-4" />
                                            <span className="text-xs font-black uppercase tracking-widest">Question</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pointer-events-auto">
                                    <Link href={`/forum/${post.id}`}>
                                        <h3 className={`text-lg font-bold mb-2 tracking-tight transition-colors hover:text-indigo-400 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                            {post.title}
                                        </h3>
                                        <div className={`prose-forum line-clamp-2 mb-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {post.body}
                                            </ReactMarkdown>
                                        </div>
                                    </Link>
                                </div>

                                <div className="flex items-center gap-3 pointer-events-auto">
                                    {post.tags?.slice(0, 3).map((tag, i) => (
                                        <span key={i} className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                            #{tag}
                                        </span>
                                    ))}
                                    <div className="flex items-center gap-4 ml-auto">
                                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            <ArrowUp className={`w-3.5 h-3.5 ${post.has_upvoted ? 'text-indigo-500' : ''}`} />
                                            {post.upvotes_count || 0}
                                        </div>
                                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            {post.comment_count || 0}
                                        </div>
                                        {post.read_time_minutes > 0 && (
                                            <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {post.read_time_minutes} min read
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))

                )}
            </div>
            {/* Modern Expandable FAB (Speed Dial) */}
            <div className="md:hidden fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
                {/* FAB Options */}
                <div className={`flex flex-col items-end gap-3 transition-all duration-300 transform ${isFabOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'}`}>
                    {/* Your Contents Option */}
                    <Link
                        href="/forum/your-content"
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'} active:scale-95 transition-all`}
                    >
                        <span className="text-xs font-bold tracking-wide">Your Contents</span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <User className="w-5 h-5" />
                        </div>
                    </Link>

                    {/* Create Post Option */}
                    <Link
                        href="/forum/new-post"
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'} active:scale-95 transition-all`}
                    >
                        <span className="text-xs font-bold tracking-wide">Create Post</span>
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <PenSquare className="w-5 h-5" />
                        </div>
                    </Link>
                </div>

                {/* Main FAB Trigger */}
                <button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 z-50 border-2 border-white/10 active:scale-90 ${isFabOpen
                            ? 'bg-slate-800 text-slate-400 rotate-[135deg]'
                            : 'bg-indigo-600 text-white shadow-indigo-500/40'
                        }`}
                >
                    <Plus className="w-6 h-6" />
                </button>

                {/* FAB Backdrop Tap-to-close */}
                {isFabOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] -z-10"
                        onClick={() => setIsFabOpen(false)}
                    />
                )}
            </div>
        </main>
    );
}
