/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, use } from 'react';
import ForumLayout from "../../../components/forum/ForumLayout";
import ForumSidebar from "../../../components/forum/ForumSidebar";
import ForumRightPanel from "../../../components/forum/ForumRightPanel";
import PostDetail from "../../../components/forum/PostDetail";
import { fetchPostById, ForumPost } from '../forum-helper/helper';
import { useRouter } from 'next/navigation';
import { Loader2, Globe } from 'lucide-react';
import { useAppContext } from '../../lib/auth/context';
import { useAuth } from '../../lib/auth/auth-context';

export default function ForumIDPage({
    params,
}: {
    params: Promise<{ forum_id: string }>;
}) {
    const { forum_id } = use(params);

    const router = useRouter();
    const { isDark } = useAppContext();
    const { user } = useAuth();
    const [post, setPost] = useState<ForumPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Sidebar state (minimal implementation for detail page)
    const [activeTab, setActiveTab] = useState('All Posts');
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

    useEffect(() => {
        async function loadPost() {
            setIsLoading(true);
            const decodedId = decodeURIComponent(forum_id);
            const data = await fetchPostById(decodedId, user?.id);
            if (data) {
                setPost(data);
            }
            setIsLoading(false);
        }
        loadPost();
    }, [forum_id, user?.id]);

    // If a channel or tab is clicked in the sidebar, redirect to the main forum page
    const handleSidebarChange = (tab: string, channelId: string | null = null) => {
        // Redirect to main forum with state if needed, but for now just redirect
        router.push('/forum');
    };

    return (
        <ForumLayout>
            <ForumSidebar 
                activeTab={activeTab}
                setActiveTab={(tab) => handleSidebarChange(tab)}
                activeChannelId={activeChannelId}
                setActiveChannelId={(id) => handleSidebarChange(activeTab, id)} isMobileMenuOpen={false} setIsMobileMenuOpen={function (isOpen: boolean): void {
                    throw new Error('Function not implemented.');
                } }            />
            
            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-6 opacity-40" />
                    <div className="flex items-center gap-2 opacity-30">
                        <Globe className="w-4 h-4 animate-pulse" />
                        <span className="text-[10px] font-black tracking-[0.4em] uppercase">Fetching Artifact</span>
                    </div>
                </div>
            ) : post ? (
                <PostDetail post={post} />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div className={`p-8 rounded-3xl mb-6 ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
                        <Globe className="w-12 h-12 opacity-50" />
                    </div>
                    <h1 className="text-2xl font-black mb-3 tracking-tighter">Post not found</h1>
                    <p className={`text-sm mb-8 max-w-xs leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        The artifact you are looking for does not exist or has been archived.
                    </p>
                    <button 
                        onClick={() => router.push('/forum')}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20"
                    >
                        RETURN TO HUB
                    </button>
                </div>
            )}

            <ForumRightPanel />
        </ForumLayout>
    );
}