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
    ExternalLink
} from 'lucide-react';
import { supabase } from '../../../lib/supabase/client';
import { useAuth } from '../../../lib/auth-context';
import { format } from 'date-fns';

import LoginPrompt from '../../../../components/Auth/LoginPrompt';
import { useAppContext } from '../../../lib/context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getProblems } from '../../../lib/api';
import AllSubmissionsModal from './AllSubmissionsModal';
import CodeViewModal from './CodeViewModal';

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

            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user_id, authLoading]);

    if (authLoading || (loading && !profile)) {
        return <ProfileSkeleton />;
    }

    if (!user) {
        return (
            <div className="flex flex-1 items-center justify-center px-4 py-10">
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
            <div className="flex flex-1 items-center justify-center">
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

    return (
        <div className="flex-1 transition-colors duration-500 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Back Navigation */}
                <div className="flex items-center">
                    <button 
                        onClick={() => router.back()} 
                        className="flex items-center gap-2 text-sm font-medium transition-all px-4 py-2 rounded-full glass-morphism outline outline-1 text-slate-600 hover:text-indigo-600 bg-white/70 outline-slate-200 shadow-sm dark:text-slate-400 dark:hover:text-indigo-400 dark:bg-slate-900/50 dark:outline-slate-800 dark:shadow-none cursor-pointer"
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
                        <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-indigo-500/20">
                            {getInitials(profile.full_name)}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{profile.full_name}</h1>
                            <p className="text-xl text-indigo-400 font-medium">@{profile.username}</p>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">{profile.bio || "No bio available."}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
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
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        value="N/A"
                        color="indigo"
                        delay={0.4}
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

function StatCard({ icon, label, value, color, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ y: -5 }}
            className="border p-6 rounded-3xl glass-morphism group bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none"
        >
            <div className="flex items-center gap-4 mb-2">
                <div className="p-2 rounded-xl transition-colors bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700">
                    {icon}
                </div>
                <span className="text-sm font-medium transition-colors uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                    {label}
                </span>
            </div>
            <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{value}</div>
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
