/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy,
    Target,
    Flame,
    Calendar,
    Globe,
    Github,
    Twitter,
    ChevronRight,
    CheckCircle2,
    Clock,
    ExternalLink,
    Swords
} from 'lucide-react';
import { supabase } from '../../../lib/api/supabase/client';
import { useAuth } from '../../../lib/auth/auth-context';
import { format } from 'date-fns';

import LoginPrompt from '../../../../components/Auth/LoginPrompt';
import { useAppContext } from '../../../lib/auth/context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getProblems } from '../../../lib/api/api';
import AllSubmissionsModal from './AllSubmissionsModal';
import CodeViewModal from './CodeViewModal';
import Image from 'next/image';

interface PageProps {
    params: Promise<{
        user_id: string;
    }>;
}

interface UserProfile {
    id: string;
    username: string;
    full_name: string;
    bio?: string;
    country?: string;
    github_username?: string;
    twitter_username?: string;
    created_at: string;
    total_score?: number;
    avatar_url?: string;
}

interface SubmissionStats {
    total_solved: number;
    easy_solved: number;
    medium_solved: number;
    hard_solved: number;
    accuracy: number;
    total_submissions: number;
}

interface RecentSubmission {
    id: string;
    problem_id: string;
    passed: number;
    total: number;
    code: string;
    problems: {
        title: string;
        difficulty: string;
    } | {
        title: string;
        difficulty: string;
    }[] | null;
    created_at: string;
}

export default function UserPage({ params }: PageProps) {
    const { user_id } = React.use(params);
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { isDark } = useAppContext();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<SubmissionStats | null>(null);
    const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
    const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [rank, setRank] = useState<number | string>('N/A');
    const [wlStats, setWlStats] = useState({ wins: 0, losses: 0 });

    // Follow states
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [togglingFollow, setTogglingFollow] = useState(false);

    // Modal states
    const [isAllSubmissionsOpen, setIsAllSubmissionsOpen] = useState(false);
    const [isCodeViewOpen, setIsCodeViewOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            if (authLoading) return;

            setLoading(true);
            try {
                // Fetch User Profile
                let profileData = null;
                let profileError = null;

                // Try fetching by ID first if it looks like a UUID
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user_id);

                if (isUUID) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user_id)
                        .maybeSingle();
                    profileData = data;
                    profileError = error;
                }

                // If not found by ID or not a UUID, try fetching by username
                if (!profileData) {
                    const normalizedUsername = user_id.trim().toLowerCase();
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .ilike('username', normalizedUsername)
                        .maybeSingle();
                    profileData = data;
                    profileError = error;
                }

                if (profileError) throw profileError;
                if (!profileData) {
                    setLoading(false);
                    return;
                }
                setProfile(profileData);

                // Fetch Rank
                const { count: rankCount, error: rankError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .gt('total_score', profileData.total_score || 0);

                if (!rankError) {
                    setRank((rankCount || 0) + 1);
                }

                // Fetch Submissions for stats using the resolved profile ID
                const resolvedUserId = profileData.id;

                const { data: submissionsData, error: submissionsError } = await supabase
                    .from('submissions')
                    .select(`
                        id,
                        problem_id,
                        passed,
                        total,
                        code,
                        created_at
                    `)
                    .eq('user_id', resolvedUserId)
                    .order('created_at', { ascending: false });

                if (submissionsError) throw submissionsError;

                let validSubmissions = (submissionsData || []) as any[];

                // Fetch external problem metadata and merge
                try {
                    const apiData = await getProblems();
                    const problemsList = apiData.problems || [];

                    validSubmissions = validSubmissions.map(sub => {
                        const prob = problemsList.find((p: any) => p.id === sub.problem_id);
                        return {
                            ...sub,
                            problems: prob ? { title: prob.title, difficulty: prob.difficulty } : { title: "Unknown Problem", difficulty: "Unknown" }
                        };
                    });
                } catch (err) {
                    console.error("Failed to fetch problems API:", err);
                    validSubmissions = validSubmissions.map(sub => ({
                        ...sub,
                        problems: { title: "Unknown Problem", difficulty: "Unknown" }
                    }));
                }

                // Calculate Stats
                const acceptedSubmissions = validSubmissions.filter(s => s.total > 0 && s.passed === s.total);

                // Use a Set to count unique problems solved
                const solvedProblemIds = new Set(acceptedSubmissions.map(s => s.problem_id));

                const difficultyCounts = acceptedSubmissions.reduce((acc, s) => {
                    const problem = Array.isArray(s.problems) ? s.problems[0] : s.problems;
                    const diff = problem?.difficulty?.toLowerCase() || 'unknown';
                    acc[diff] = (acc[diff] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                // Calculate new accuracy based on first submissions only
                const firstSubmissionsMap = new Map();
                
                const oldestFirst = [...validSubmissions].sort((a, b) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );

                oldestFirst.forEach(sub => {
                    if (!firstSubmissionsMap.has(sub.problem_id)) {
                        firstSubmissionsMap.set(sub.problem_id, sub);
                    }
                });

                const firstSubmissions = Array.from(firstSubmissionsMap.values());
                
                let totalAccuracyScore = 0;
                firstSubmissions.forEach(sub => {
                    if (sub.total > 0) {
                        totalAccuracyScore += (sub.passed / sub.total);
                    }
                });
                
                const calculatedAccuracy = firstSubmissions.length > 0 
                    ? (totalAccuracyScore / firstSubmissions.length) * 100 
                    : 0;

                setStats({
                    total_solved: solvedProblemIds.size,
                    easy_solved: difficultyCounts['easy'] || 0,
                    medium_solved: difficultyCounts['medium'] || 0,
                    hard_solved: difficultyCounts['hard'] || 0,
                    total_submissions: validSubmissions.length,
                    accuracy: calculatedAccuracy
                });

                setRecentSubmissions(validSubmissions.slice(0, 2));
                setAllSubmissions(validSubmissions);

                // Fetch Followers
                const { count: followers } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', resolvedUserId);
                setFollowerCount(followers || 0);

                // Fetch Following
                const { count: following } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('follower_id', resolvedUserId);
                setFollowingCount(following || 0);

                // Check if current user is following
                if (user && user.id !== resolvedUserId) {
                    const { data: followRecord } = await supabase
                        .from('follows')
                        .select('*')
                        .eq('follower_id', user.id)
                        .eq('following_id', resolvedUserId)
                        .maybeSingle();
                    setIsFollowing(!!followRecord);
                }

                // Fetch completed coding duels to calculate W/L ratio
                const { data: duelResultsData } = await supabase
                    .from('duel_participant_results')
                    .select('result')
                    .eq('user_id', resolvedUserId);

                const duels = duelResultsData || [];
                const wins = duels.filter((d: any) => d.result === 'victory').length;
                const losses = duels.filter((d: any) => d.result === 'defeat').length;
                setWlStats({ wins, losses });

            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user_id, authLoading, user?.id]);

    if (authLoading || (loading && !profile)) {
        return <ProfileSkeleton />;
    }

    if (!user) {
        return (
            <div className={`flex flex-1 items-center justify-center px-4 py-10 min-h-screen ${isDark ? "bg-[#0B0C15] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
                <div className="w-full max-w-xl">
                    <LoginPrompt
                        title="Login to view profiles"
                        description="You must be logged in to view user profiles and statistics on Vlyxir."
                        nextPath={`/user/${user_id}`}
                    />
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className={`flex flex-1 items-center justify-center min-h-screen ${isDark ? "bg-[#0B0C15] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
                <h1 className="text-2xl font-bold">User Not Found</h1>
            </div>
        );
    }

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    };

    const handleViewCode = (submission: any) => {
        setSelectedSubmission(submission);
        setIsCodeViewOpen(true);
    };

    const handleFollowToggle = async () => {
        if (!user || togglingFollow || !profile) return;
        setTogglingFollow(true);
        try {
            if (isFollowing) {
                // Unfollow
                const { error } = await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', user.id)
                    .eq('following_id', profile.id);
                if (!error) {
                    setIsFollowing(false);
                    setFollowerCount(prev => Math.max(0, prev - 1));
                }
            } else {
                // Follow
                const { error } = await supabase
                    .from('follows')
                    .insert([{ follower_id: user.id, following_id: profile.id }]);
                if (!error) {
                    setIsFollowing(true);
                    setFollowerCount(prev => prev + 1);
                }
            }
        } catch (err) {
            console.error('Error toggling follow:', err);
        } finally {
            setTogglingFollow(false);
        }
    };

    return (
        <div className={`flex-1 transition-colors duration-500 p-4 md:p-8 min-h-screen ${isDark ? "bg-[#0B0C15] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Back Navigation */}
                <div className="flex items-center">
                    <button 
                        onClick={() => router.back()} 
                        className="flex items-center gap-2 text-sm font-medium transition-all px-4 py-2 rounded-full glass-morphism outline-1 text-slate-600 hover:text-indigo-600 bg-white/70 outline-slate-200 shadow-sm dark:text-slate-400 dark:hover:text-indigo-400 dark:bg-slate-900/50 dark:outline-slate-800 dark:shadow-none cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                </div>

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl p-8 glass-morphism border bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Trophy size={160} className="text-indigo-500" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                        <div className="h-32 w-32 rounded-3xl bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-indigo-500/20 overflow-hidden relative">
                            {profile.avatar_url ? (
                                <Image 
                                    src={profile.avatar_url} 
                                    alt={profile.full_name} 
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                getInitials(profile.full_name)
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-center md:justify-start">
                                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{profile.full_name}</h1>
                                {user && user.id !== profile.id && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleFollowToggle}
                                            disabled={togglingFollow}
                                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                                isFollowing
                                                    ? "bg-slate-200 text-slate-800 border border-slate-300 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
                                                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                                            }`}
                                        >
                                            {isFollowing ? "Unfollow" : "Follow"}
                                        </button>
                                        <Link
                                            href={`/duel?challenge=${profile.id}`}
                                            className="px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 bg-linear-to-r from-red-650 via-orange-600 to-amber-500 text-white hover:brightness-110 shadow-xs"
                                        >
                                            Challenge ⚔️
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <p className="text-xl text-indigo-400 font-medium">@{profile.username}</p>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">{profile.bio || "No bio available."}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <span className="font-bold text-slate-900 dark:text-white mr-1">{followingCount}</span> Following
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <span className="font-bold text-slate-900 dark:text-white mr-1">{followerCount}</span> Followers
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                                {profile.country && (
                                    <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300">
                                        <Globe size={14} className="text-indigo-400" />
                                        <span>{profile.country}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300">
                                    <Calendar size={14} className="text-indigo-400" />
                                    <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>                 {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatCard
                        icon={<Target className="text-emerald-400" />}
                        label="Total Solved"
                        value={stats?.total_solved || 0}
                        color="emerald"
                        delay={0.1}
                    />
                    <StatCard
                        icon={<Trophy className="text-amber-400" />}
                        label="Accuracy"
                        value={`${stats?.accuracy?.toFixed(1) || '0.0'}%`}
                        color="amber"
                        delay={0.2}
                    />
                    <StatCard
                        icon={<Flame className="text-orange-400" />}
                        label="Submissions"
                        value={stats?.total_submissions || 0}
                        color="orange"
                        delay={0.3}
                    />
                    <StatCard
                        icon={<Clock className="text-indigo-400" />}
                        label="Rank"
                        value={rank}
                        color="indigo"
                        delay={0.4}
                    />
                    <StatCard
                        icon={<Swords className="text-rose-455 dark:text-rose-400" />}
                        label="W/L Ratio"
                        value={wlStats.losses === 0 ? (wlStats.wins > 0 ? `${wlStats.wins}.00` : '0.00') : (wlStats.wins / wlStats.losses).toFixed(2)}
                        color="red"
                        delay={0.5}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Difficulty Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="border rounded-3xl p-6 glass-morphism h-fit bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none"
                    >
                        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Level Distribution</h2>
                        <div className="space-y-6">
                            <DifficultyBar label="Easy" count={stats?.easy_solved || 0} total={stats?.total_solved || 0} color="bg-emerald-500" />
                            <DifficultyBar label="Medium" count={stats?.medium_solved || 0} total={stats?.total_solved || 0} color="bg-amber-500" />
                            <DifficultyBar label="Hard" count={stats?.hard_solved || 0} total={stats?.total_solved || 0} color="bg-rose-500" />
                        </div>
                    </motion.div>

                    {/* Recent Submissions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="lg:col-span-2 border rounded-3xl p-6 glass-morphism bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                            <button
                                onClick={() => setIsAllSubmissionsOpen(true)}
                                className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                            >
                                View all <ChevronRight size={14} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {recentSubmissions.length > 0 ? (
                                recentSubmissions.map((sub, idx) => {
                                    const isAccepted = sub.total > 0 && sub.passed === sub.total;
                                    return (
                                        <div
                                            key={sub.id}
                                            onClick={() => handleViewCode(sub)}
                                            className="flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group bg-slate-50 border-slate-200 hover:bg-white hover:shadow-md dark:bg-slate-800/30 dark:border-slate-700/50 dark:hover:bg-slate-800/50 dark:hover:shadow-none"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${isAccepted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                    {isAccepted ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold transition-colors group-hover:text-indigo-400 text-slate-900 dark:text-white">
                                                        {Array.isArray(sub.problems) ? sub.problems[0]?.title : sub.problems?.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{format(new Date(sub.created_at), 'MMM d, yyyy • h:mm a')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${getDifficultyColor(Array.isArray(sub.problems) ? sub.problems[0]?.difficulty : sub.problems?.difficulty)}`}>
                                                    {Array.isArray(sub.problems) ? sub.problems[0]?.difficulty : sub.problems?.difficulty}
                                                </span>
                                                <ExternalLink size={14} className="text-slate-600 group-hover:text-indigo-400" />
                                            </div>
                                        </div>
                                    );
                                })

                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    No recent activity found.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modals */}
            <AllSubmissionsModal
                isOpen={isAllSubmissionsOpen}
                onClose={() => setIsAllSubmissionsOpen(false)}
                submissions={allSubmissions}
                onViewCode={handleViewCode}
                isDark={isDark}
            />

            <CodeViewModal
                isOpen={isCodeViewOpen}
                onClose={() => setIsCodeViewOpen(false)}
                submission={selectedSubmission}
                isDark={isDark}
            />
        </div>
    );
}

function getColorClasses(color: string) {
    switch (color?.toLowerCase()) {
        case 'emerald':
            return {
                text: 'text-emerald-555 dark:text-emerald-400',
                bg: 'bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
                border: 'bg-emerald-500 dark:bg-emerald-400',
                glow: 'bg-emerald-500/10 dark:bg-emerald-500/5',
                bgLarge: 'text-emerald-500/5 dark:text-emerald-500/10'
            };
        case 'amber':
            return {
                text: 'text-amber-555 dark:text-amber-400',
                bg: 'bg-amber-500/10 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400',
                border: 'bg-amber-500 dark:bg-amber-400',
                glow: 'bg-amber-500/10 dark:bg-amber-500/5',
                bgLarge: 'text-amber-500/5 dark:text-amber-500/10'
            };
        case 'orange':
            return {
                text: 'text-orange-555 dark:text-orange-400',
                bg: 'bg-orange-500/10 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400',
                border: 'bg-orange-500 dark:bg-orange-400',
                glow: 'bg-orange-500/10 dark:bg-orange-500/5',
                bgLarge: 'text-orange-500/5 dark:text-orange-500/10'
            };
        case 'indigo':
            return {
                text: 'text-indigo-555 dark:text-indigo-400',
                bg: 'bg-indigo-500/10 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400',
                border: 'bg-indigo-500 dark:bg-indigo-400',
                glow: 'bg-indigo-500/10 dark:bg-indigo-500/5',
                bgLarge: 'text-indigo-500/5 dark:text-indigo-500/10'
            };
        case 'red':
        case 'rose':
            return {
                text: 'text-rose-555 dark:text-rose-400',
                bg: 'bg-rose-500/10 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400',
                border: 'bg-rose-500 dark:bg-rose-400',
                glow: 'bg-rose-500/10 dark:bg-rose-500/5',
                bgLarge: 'text-rose-500/5 dark:text-rose-500/10'
            };
        default:
            return {
                text: 'text-slate-555 dark:text-slate-400',
                bg: 'bg-slate-500/10 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400',
                border: 'bg-slate-500 dark:bg-slate-400',
                glow: 'bg-slate-500/10 dark:bg-slate-500/5',
                bgLarge: 'text-slate-500/5 dark:text-slate-500/10'
            };
    }
}

function StatCard({ icon, label, value, color, delay }: any) {
    const theme = getColorClasses(color);
    
    // Custom sublabel helper to add depth to stats
    const getSublabel = (lbl: string) => {
        const lower = lbl.toLowerCase();
        if (lower.includes('solved')) return 'Completed challenges';
        if (lower.includes('accuracy')) return 'First attempt success';
        if (lower.includes('submissions')) return 'Total code compiles';
        if (lower.includes('rank')) return 'Global standing';
        if (lower.includes('ratio')) return 'Arena duel standing';
        return 'Vlyxir aggregate stat';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="border p-6 rounded-3xl glass-morphism bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[140px]"
        >
            {/* Absolute positioned large background icon for rich aesthetic */}
            <div className={`absolute -right-4 -bottom-4 ${theme.bgLarge} w-24 h-24 opacity-[0.08] dark:opacity-[0.15] pointer-events-none flex items-center justify-center`}>
                {React.cloneElement(icon, { size: 96, className: "stroke-[1]" })}
            </div>

            {/* Glowing top-right background accent */}
            <div className={`absolute top-0 right-0 w-24 h-24 ${theme.glow} rounded-full blur-2xl pointer-events-none`} />

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${theme.bg} shadow-2xs`}>
                        {icon}
                    </div>
                    <span className="text-[10px] font-black tracking-wider uppercase text-slate-555 dark:text-slate-455">
                        {label}
                    </span>
                </div>

                <div className="space-y-1">
                    <div className="text-3.5xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                        {value}
                    </div>
                    <p className="text-[10.5px] text-slate-455 dark:text-slate-450 font-bold">
                        {getSublabel(label)}
                    </p>
                </div>
            </div>
            
            {/* Left Accent indicator line (always visible for beautiful static design) */}
            <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full ${theme.border}`} />
        </motion.div>
    );
}

function DifficultyBar({ label, count, total, color }: any) {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
                <span className="font-bold text-slate-900 dark:text-white">{count} <span className="text-slate-500 font-normal">/ {total}</span></span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${color} rounded-full`}
                />
            </div>
        </div>
    );
}

function getDifficultyColor(diff: string = '') {
    switch (diff.toLowerCase()) {
        case 'easy': return 'text-emerald-500 bg-emerald-500/10';
        case 'medium': return 'text-amber-500 bg-amber-500/10';
        case 'hard': return 'text-rose-500 bg-rose-500/10';
        default: return 'text-slate-400 bg-slate-400/10';
    }
}

function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
    );
}

function ProfileSkeleton() {
    return (
        <div className="min-h-screen p-4 md:p-8 bg-slate-50 dark:bg-background">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Back Link Skeleton */}
                <Skeleton className="h-10 w-32 rounded-full" />

                {/* Header Skeleton */}
                <div className="rounded-3xl p-8 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <Skeleton className="h-32 w-32 rounded-3xl" />
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <Skeleton className="h-10 w-64 mx-auto md:mx-0" />
                            <Skeleton className="h-6 w-32 mx-auto md:mx-0" />
                            <Skeleton className="h-20 w-full max-w-2xl" />
                            <div className="flex gap-4 justify-center md:justify-start">
                                <Skeleton className="h-8 w-24 rounded-full" />
                                <Skeleton className="h-8 w-32 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                        </div>
                    ))}
                </div>

                {/* Lower Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-6">
                        <Skeleton className="h-6 w-40" />
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-12" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                    <Skeleton className="h-2 w-full rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-2 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-6">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-10 w-10 rounded-lg" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-48" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-20 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
