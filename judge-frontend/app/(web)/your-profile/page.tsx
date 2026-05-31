/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Target,
    Flame,
    Calendar,
    Globe,
    ChevronRight,
    CheckCircle2,
    Clock,
    ExternalLink,
    Search,
    BookOpen,
    ArrowRight,
    Award,
    Settings,
    CreditCard,
    UserMinus,
    Users,
    TrendingUp,
    Sparkles,
    Check,
    AlertCircle,
    UserCheck,
    ArrowLeft,
    Shield,
    Activity,
    LogOut,
    HelpCircle,
    Zap,
    Terminal
} from 'lucide-react';
import { supabase } from '../../lib/api/supabase/client';
import { useAuth } from '../../lib/auth/auth-context';
import { format } from 'date-fns';

import LoginPrompt from '../../../components/Auth/LoginPrompt';
import { useAppContext } from '../../lib/auth/context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProblems } from '../../lib/api/api';
import AllSubmissionsModal from '../user/[user_id]/AllSubmissionsModal';
import CodeViewModal from '../user/[user_id]/CodeViewModal';
import Image from 'next/image';

interface UserProfile {
    id: string;
    username: string;
    full_name: string;
    bio?: string;
    country?: string;
    created_at: string;
    total_score?: number;
    avatar_url?: string;
    plan?: string;
}

interface SubmissionStats {
    total_solved: number;
    easy_solved: number;
    medium_solved: number;
    hard_solved: number;
    accuracy: number;
    total_submissions: number;
}

interface SolvedProblemItem {
    problemId: string;
    title: string;
    difficulty: string;
    solvedAt: Date;
    submissionsCount: number;
    score: number;
    lastSubmission: any;
}

export default function YourProfilePage() {
    const router = useRouter();
    const { user, dbProfile, refreshProfile, isLoading: authLoading, savedAccounts, switchAccount, signOut } = useAuth();
    const { isDark } = useAppContext();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [proTier, setProTier] = useState<number | null>(null);
    const [stats, setStats] = useState<SubmissionStats | null>(null);
    const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
    const [solvedProblems, setSolvedProblems] = useState<SolvedProblemItem[]>([]);
    const [duelsHistory, setDuelsHistory] = useState<any[]>([]);
    const [totalProblemsInSystem, setTotalProblemsInSystem] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [rank, setRank] = useState<number | string>('N/A');

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

    // Modal states
    const [isAllSubmissionsOpen, setIsAllSubmissionsOpen] = useState(false);
    const [isCodeViewOpen, setIsCodeViewOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

    // Dynamic Account Switcher state
    const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

    // Social follow lists states
    const [followersList, setFollowersList] = useState<any[]>([]);
    const [followingList, setFollowingList] = useState<any[]>([]);
    const [socialTab, setSocialTab] = useState<"following" | "followers">("following");

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        const currentUser = user;

        async function fetchData() {
            setLoading(true);
            try {
                // 1. Fetch current profile from database
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .maybeSingle();

                if (profileError) throw profileError;

                let activeProfile = profileData;
                if (!activeProfile) {
                    // Fallback to local session details if database record not synchronized yet
                    activeProfile = {
                        id: currentUser.id,
                        username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || "coder",
                        full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || "Vlyxir Coder",
                        created_at: currentUser.created_at,
                        total_score: 0,
                        avatar_url: currentUser.user_metadata?.avatar_url || "",
                        plan: "Free"
                    };
                }
                setProfile(activeProfile);

                // Fetch Pro Tier if user is Pro plan
                let userTier = null;
                if (activeProfile.plan === 'pro') {
                    const { data: tierData } = await supabase
                        .from('user_tiers')
                        .select('tier')
                        .eq('user_id', currentUser.id)
                        .maybeSingle();
                    userTier = tierData?.tier || 1; // Default to Tier 1 for Pro
                }
                setProTier(userTier);

                // 2. Fetch Leaderboard Rank (how many users have more score than current user + 1)
                const scoreToCompare = activeProfile.total_score || 0;
                const { count: rankCount, error: rankError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .gt('total_score', scoreToCompare);

                if (!rankError) {
                    setRank((rankCount || 0) + 1);
                }

                // 3. Fetch submissions for calculations
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
                    .eq('user_id', currentUser.id)
                    .order('created_at', { ascending: false });

                if (submissionsError) throw submissionsError;

                let validSubmissions = (submissionsData || []) as any[];

                // 4. Fetch problem metadata list from API
                let problemsList: any[] = [];
                try {
                    const apiData = await getProblems();
                    problemsList = apiData.problems || [];
                    setTotalProblemsInSystem(problemsList.length);

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

                setAllSubmissions(validSubmissions);

                // 5. Calculate statistics & accuracy
                const acceptedSubmissions = validSubmissions.filter(s => s.total > 0 && s.passed === s.total);
                const solvedProblemIds = new Set(acceptedSubmissions.map(s => s.problem_id));

                const difficultyCounts = acceptedSubmissions.reduce((acc, s) => {
                    const problem = Array.isArray(s.problems) ? s.problems[0] : s.problems;
                    const diff = problem?.difficulty?.toLowerCase() || 'unknown';
                    acc[diff] = (acc[diff] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                // Calculate first-submission accuracy metric
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

                // 6. Aggregate unique solved problems list for the Explorer
                const solvedList: SolvedProblemItem[] = [];
                solvedProblemIds.forEach(pId => {
                    const problemSubmissions = validSubmissions.filter(s => s.problem_id === pId);
                    const successSubmissions = problemSubmissions.filter(s => s.total > 0 && s.passed === s.total);
                    if (successSubmissions.length > 0) {
                        const sampleSub = successSubmissions[0]; // most recent accepted
                        const probMeta = sampleSub.problems;
                        solvedList.push({
                            problemId: pId,
                            title: probMeta?.title || "Unknown Problem",
                            difficulty: probMeta?.difficulty || "Unknown",
                            solvedAt: new Date(sampleSub.created_at),
                            submissionsCount: problemSubmissions.length,
                            score: sampleSub.passed,
                            lastSubmission: sampleSub
                        });
                    }
                });

                // Sort by solved date descending
                solvedList.sort((a, b) => b.solvedAt.getTime() - a.solvedAt.getTime());
                setSolvedProblems(solvedList);

                // Fetch Followers
                const { data: followersData } = await supabase
                    .from('follows')
                    .select('follower_id')
                    .eq('following_id', currentUser.id);
                
                if (followersData && followersData.length > 0) {
                    const followerIds = followersData.map((f: any) => f.follower_id);
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, username, full_name, avatar_url, bio')
                        .in('id', followerIds);
                    setFollowersList(profiles || []);
                } else {
                    setFollowersList([]);
                }

                // Fetch Following
                const { data: followingData } = await supabase
                    .from('follows')
                    .select('following_id')
                    .eq('follower_id', currentUser.id);
                
                if (followingData && followingData.length > 0) {
                    const followingIds = followingData.map((f: any) => f.following_id);
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, username, full_name, avatar_url, bio')
                        .in('id', followingIds);
                    setFollowingList(profiles || []);
                } else {
                    setFollowingList([]);
                }

                // --- 7. Fetch completed coding duels and opponent profiles ---
                const { data: duelResultsData, error: duelsError } = await supabase
                    .from('duel_participant_results')
                    .select(`
                        id,
                        code,
                        passed,
                        total,
                        result,
                        created_at,
                        duel_sessions (
                            id,
                            problem_id,
                            creator_id,
                            opponent_id,
                            winner_id,
                            completed_at
                        )
                    `)
                    .eq('user_id', currentUser.id)
                    .order('created_at', { ascending: false });

                if (duelsError) throw duelsError;

                const rawDuelResults = (duelResultsData || []) as any[];
                const opponentIds = Array.from(new Set(rawDuelResults.map(res => {
                    const session = Array.isArray(res.duel_sessions) ? res.duel_sessions[0] : res.duel_sessions;
                    const creatorId = session?.creator_id;
                    const opponentId = session?.opponent_id;
                    return creatorId === currentUser.id ? opponentId : creatorId;
                }).filter(Boolean)));

                let opponentProfilesMap: Record<string, any> = {};
                if (opponentIds.length > 0) {
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('id, username, full_name, avatar_url')
                        .in('id', opponentIds);
                    
                    (profilesData || []).forEach(p => {
                        opponentProfilesMap[p.id] = p;
                    });
                }

                const resolvedDuels = rawDuelResults.map(res => {
                    const session = Array.isArray(res.duel_sessions) ? res.duel_sessions[0] : res.duel_sessions;
                    const pId = session?.problem_id;
                    const prob = problemsList.find((p: any) => p.id === pId);
                    
                    const creatorId = session?.creator_id;
                    const opponentId = session?.opponent_id;
                    const oppId = creatorId === currentUser.id ? opponentId : creatorId;
                    const oppProfile = oppId ? opponentProfilesMap[oppId] : null;

                    return {
                        id: res.id,
                        code: res.code,
                        passed: res.passed,
                        total: res.total,
                        result: res.result, // 'victory' | 'defeat' | 'draw'
                        solvedAt: new Date(res.created_at),
                        problemTitle: prob?.title || "Python Arena Duel",
                        problemDifficulty: prob?.difficulty || "Medium",
                        opponent: oppProfile ? {
                            username: oppProfile.username,
                            fullName: oppProfile.full_name,
                            avatarUrl: oppProfile.avatar_url
                        } : { username: "arena_competitor", fullName: "Arena Competitor" }
                    };
                });

                setDuelsHistory(resolvedDuels);

            } catch (err) {
                console.error("Error loading profile metrics:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user, authLoading]);

    // --- Contribution Grid Calculations ---
    const submissionCountsByDate = useMemo(() => {
        const counts: Record<string, number> = {};
        allSubmissions.forEach(sub => {
            if (sub.created_at) {
                const date = new Date(sub.created_at);
                const dateStr = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
                counts[dateStr] = (counts[dateStr] || 0) + 1;
            }
        });
        return counts;
    }, [allSubmissions]);

    const streakStats = useMemo(() => {
        const counts = submissionCountsByDate;
        let longestStreak = 0;
        let currentStreak = 0;
        let activeDays = 0;

        const sortedDates = Object.keys(counts).sort();
        activeDays = sortedDates.length;

        // Longest Streak
        let tempStreak = 0;
        const oneDayMs = 24 * 60 * 60 * 1000;

        if (sortedDates.length > 0) {
            let prevTime = new Date(sortedDates[0]).getTime();
            tempStreak = 1;
            longestStreak = 1;

            for (let i = 1; i < sortedDates.length; i++) {
                const currTime = new Date(sortedDates[i]).getTime();
                const diffDays = Math.round((currTime - prevTime) / oneDayMs);
                if (diffDays === 1) {
                    tempStreak++;
                } else if (diffDays > 1) {
                    if (tempStreak > longestStreak) {
                        longestStreak = tempStreak;
                    }
                    tempStreak = 1;
                }
                prevTime = currTime;
            }
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
            }
        }

        // Current Streak
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let checkDate = new Date();
        if (counts[todayStr]) {
            while (true) {
                const checkStr = checkDate.toISOString().split('T')[0];
                if (counts[checkStr]) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        } else if (counts[yesterdayStr]) {
            checkDate = yesterday;
            while (true) {
                const checkStr = checkDate.toISOString().split('T')[0];
                if (counts[checkStr]) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        return {
            activeDays,
            longestStreak,
            currentStreak
        };
    }, [submissionCountsByDate]);

    const activityInsights = useMemo(() => {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayCounts = Array(7).fill(0);
        
        allSubmissions.forEach(sub => {
            if (sub.created_at) {
                const day = new Date(sub.created_at).getDay();
                dayCounts[day]++;
            }
        });

        let maxDayIdx = 3; // default to Wednesday
        let maxCount = 0;
        dayCounts.forEach((count, idx) => {
            if (count > maxCount) {
                maxCount = count;
                maxDayIdx = idx;
            }
        });

        const activeDays = streakStats.activeDays;
        let title = "Rising Coder";
        let color = "text-emerald-555 dark:text-emerald-400";
        let bg = "bg-emerald-500/10";
        let border = "border-emerald-500/20";
        
        if (activeDays >= 150) {
            title = "Elite Coder";
            color = "text-amber-550 dark:text-amber-400";
            bg = "bg-amber-500/10";
            border = "border-amber-500/20 animate-pulse";
        } else if (activeDays >= 75) {
            title = "Unstoppable";
            color = "text-purple-555 dark:text-purple-400";
            bg = "bg-purple-500/10";
            border = "border-purple-500/20";
        } else if (activeDays >= 30) {
            title = "Consistent Coder";
            color = "text-indigo-555 dark:text-indigo-400";
            bg = "bg-indigo-500/10";
            border = "border-indigo-500/20";
        } else if (activeDays >= 10) {
            title = "Active Dev";
            color = "text-blue-555 dark:text-blue-450";
            bg = "bg-blue-500/10";
            border = "border-blue-500/20";
        }

        const yearSubmissions = allSubmissions.filter(s => {
            const oneYearAgo = new Date();
            oneYearAgo.setDate(oneYearAgo.getDate() - 365);
            return new Date(s.created_at) >= oneYearAgo;
        }).length;

        return {
            mostActiveDay: maxCount > 0 ? daysOfWeek[maxDayIdx] : 'None yet',
            weeklyAverage: (yearSubmissions / 52).toFixed(1),
            badge: { title, color, bg, border }
        };
    }, [allSubmissions, streakStats.activeDays]);

    const { daySquares, monthLabels } = useMemo(() => {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 230); // 36 weeks ago (252 days)
        // Align to start of week (Sunday)
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);

        const daySquares: { date: Date; dateStr: string; dayIndex: number }[] = [];
        const tempDate = new Date(startDate);

        while (tempDate <= today) {
            daySquares.push({
                date: new Date(tempDate),
                dateStr: tempDate.toISOString().split('T')[0],
                dayIndex: tempDate.getDay()
            });
            tempDate.setDate(tempDate.getDate() + 1);
        }

        // Month labels with column indices
        const monthLabels: { label: string; colIndex: number }[] = [];
        let lastMonth = -1;
        let lastColIndex = -10;

        for (let i = 0; i < daySquares.length; i += 7) {
            // Use middle of the week to get the dominant month for that week column
            const weekDate = daySquares[Math.min(i + 3, daySquares.length - 1)].date;
            const month = weekDate.getMonth();
            const colIndex = Math.floor(i / 7);
            if (month !== lastMonth) {
                // Prevent overlapping by ensuring at least 3 weeks separation between consecutive month labels
                if (colIndex - lastColIndex >= 3) {
                    monthLabels.push({
                        label: format(weekDate, 'MMM'),
                        colIndex: colIndex
                    });
                    lastMonth = month;
                    lastColIndex = colIndex;
                }
            }
        }

        return { daySquares, monthLabels };
    }, []);

    // Handle view code action
    const handleViewCode = (submission: any) => {
        setSelectedSubmission(submission);
        setIsCodeViewOpen(true);
    };

    // Filter solved questions based on search & difficulty dropdown
    const filteredSolvedProblems = useMemo(() => {
        return solvedProblems.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDifficulty = difficultyFilter === 'all' || item.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
            return matchesSearch && matchesDifficulty;
        });
    }, [solvedProblems, searchTerm, difficultyFilter]);

    // Multi-segment circular progress properties
    const easyCount = stats?.easy_solved || 0;
    const mediumCount = stats?.medium_solved || 0;
    const hardCount = stats?.hard_solved || 0;
    const solvedCount = stats?.total_solved || 0;

    const C_CIRCUMFERENCE = 339.3; // Circumference for r=54 (2 * PI * 54 = 339.29)
    const ringTotal = solvedCount || 1;
    const easyLength = (easyCount / ringTotal) * C_CIRCUMFERENCE;
    const mediumLength = (mediumCount / ringTotal) * C_CIRCUMFERENCE;
    const hardLength = (hardCount / ringTotal) * C_CIRCUMFERENCE;

    const easyOffset = 0;
    const mediumOffset = -easyLength;
    const hardOffset = -(easyLength + mediumLength);

    const handleUnfollow = async (targetId: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', user.id)
                .eq('following_id', targetId);
            if (!error) {
                setFollowingList(prev => prev.filter(item => item.id !== targetId));
            }
        } catch (err) {
            console.error("Error unfollowing user:", err);
        }
    };

    const handleRemoveFollower = async (targetId: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', targetId)
                .eq('following_id', user.id);
            if (!error) {
                setFollowersList(prev => prev.filter(item => item.id !== targetId));
            }
        } catch (err) {
            console.error("Error removing follower:", err);
        }
    };

    if (authLoading || (loading && !profile)) {
        return <ProfileSkeleton />;
    }

    if (!user) {
        return (
            <div className={`flex flex-1 items-center justify-center px-4 py-10 min-h-screen ${isDark ? "bg-[#0B0C15] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
                <div className="w-full max-w-xl">
                    <LoginPrompt
                        title="Access Your Profile"
                        description="Sign in to your Vlyxir account to review point balances, Leaderboard standings, solved submissions, and detailed telemetries."
                        nextPath="/your-profile"
                    />
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className={`flex flex-1 items-center justify-center min-h-screen ${isDark ? "bg-[#0B0C15] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
                <div className="text-center space-y-4">
                    <AlertCircle className="mx-auto text-rose-500" size={48} />
                    <h1 className="text-2xl font-black tracking-tight">Account Sync Failed</h1>
                    <p className="text-slate-500 max-w-sm">We could not pull profile aggregates for your authenticated session.</p>
                </div>
            </div>
        );
    }

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    };

    // Overall progress percentages
    const totalSolvedPercent = totalProblemsInSystem > 0 
        ? Math.min(100, Math.round(((stats?.total_solved || 0) / totalProblemsInSystem) * 100))
        : 0;

    return (
        <div className={`flex-1 transition-colors duration-500 p-4 md:p-8 min-h-screen ${isDark ? "bg-[#0B0C15] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Dashboard Nav bar / Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs">
                        <Sparkles size={14} className="animate-pulse" />
                        Developer Workspace
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link 
                            href="/leaderboard"
                            className="flex items-center gap-2 text-xs font-bold transition-all px-4 py-2 rounded-full glass-morphism border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 hover:border-indigo-500/30"
                        >
                            <Trophy size={14} className="text-indigo-400" />
                            Leaderboard
                        </Link>
                        
                        <button
                            onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
                            className="flex items-center gap-2 text-xs font-bold transition-all px-4 py-2 rounded-full glass-morphism border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 hover:border-indigo-500/30 cursor-pointer"
                        >
                            <Users size={14} className="text-indigo-400" />
                            Profiles ({savedAccounts.length})
                        </button>
                    </div>
                </div>

                {/* Multi-Account Drawer */}
                <AnimatePresence>
                    {showAccountSwitcher && savedAccounts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="p-6 rounded-3xl border glass-morphism bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 shadow-lg space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <UserCheck size={16} className="text-indigo-400" />
                                    Active Sessions Switcher
                                </h3>
                                <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                    Click any profile to instantly switch
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {savedAccounts.map((account) => {
                                    const isCurrent = account.userId === user.id;
                                    return (
                                        <div
                                            key={account.userId}
                                            onClick={async () => {
                                                if (!isCurrent) {
                                                    await switchAccount(account.userId);
                                                }
                                            }}
                                            className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                                                isCurrent 
                                                    ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10' 
                                                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/20 dark:hover:bg-slate-900/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-black relative overflow-hidden shrink-0 shadow-sm">
                                                    {account.avatarUrl ? (
                                                        <Image 
                                                            src={account.avatarUrl} 
                                                            alt={account.username} 
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        getInitials(account.username)
                                                    )}
                                                </div>
                                                <div className="truncate max-w-[150px]">
                                                    <p className="font-bold text-sm truncate text-slate-900 dark:text-white">
                                                        {account.username}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 truncate">
                                                        {account.email}
                                                    </p>
                                                </div>
                                            </div>
                                            {isCurrent ? (
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1 bg-indigo-400/10 px-2 py-0.5 rounded-full">
                                                    <Check size={10} /> Active
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 group-hover:text-indigo-400 transition-colors">
                                                    Switch
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Profile Header Block */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl p-6 md:p-8 glass-morphism border bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    {/* Visual accent backdrop glow */}
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 relative z-10">
                        
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                            {/* Avatar */}
                            <div className="h-28 w-28 md:h-32 md:w-32 rounded-3xl bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-indigo-500/10 overflow-hidden relative shrink-0">
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

                            {/* Bio Details */}
                            <div className="space-y-2 max-w-xl">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                        {profile.full_name}
                                    </h1>
                                    {profile.plan === 'pro' ? (
                                        proTier === 3 ? (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-550 dark:text-amber-400 animate-pulse shadow-xs">
                                                <Award size={10} className="text-amber-500 dark:text-amber-400 animate-pulse" />
                                                Pro Tier 3
                                            </span>
                                        ) : proTier === 2 ? (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-550 dark:text-indigo-400 shadow-xs">
                                                <Sparkles size={10} className="text-indigo-500 dark:text-indigo-400" />
                                                Pro Tier 2
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-500 dark:text-blue-400 shadow-xs">
                                                <Zap size={10} className="text-blue-500 dark:text-blue-450" />
                                                Pro Tier 1
                                            </span>
                                        )
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-500/20 bg-slate-500/10 text-slate-650 dark:text-slate-400 shadow-xs">
                                            <Terminal size={10} className="text-slate-500 dark:text-slate-400" />
                                            Free Plan
                                        </span>
                                    )}
                                </div>
                                <p className="text-indigo-400 font-bold">@{profile.username}</p>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                    {profile.bio || "No profile biography written yet. Click account controls to add your bio and tech stack summary."}
                                </p>

                                 <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                                     {profile.country && (
                                         <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-full border bg-slate-100/50 border-slate-200 text-slate-600 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-400">
                                             <Globe size={12} className="text-indigo-400" />
                                             <span>{profile.country}</span>
                                         </div>
                                     )}
                                     <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-full border bg-slate-100/50 border-slate-200 text-slate-600 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-400">
                                         <Calendar size={12} className="text-indigo-400" />
                                         <span>Member since {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
                                     </div>
                                     <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-full border bg-slate-100/50 border-slate-200 text-slate-600 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-400">
                                         <span className="font-bold text-slate-900 dark:text-white">{followingList.length}</span>
                                         <span className="text-slate-500">Following</span>
                                     </div>
                                     <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-full border bg-slate-100/50 border-slate-200 text-slate-600 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-400">
                                         <span className="font-bold text-slate-900 dark:text-white">{followersList.length}</span>
                                         <span className="text-slate-500">Followers</span>
                                     </div>
                                 </div>
                            </div>
                        </div>

                        {/* Quick Control Shortcuts */}
                        <div className="flex lg:flex-col gap-2 shrink-0 w-full lg:w-auto">
                            <Link
                                href="/account-settings"
                                className="flex-1 lg:flex-initial flex items-center justify-center gap-2 text-xs font-black px-4 py-2.5 rounded-2xl border transition-all text-slate-700 border-slate-200 bg-slate-50/50 hover:bg-white hover:text-indigo-600 dark:text-slate-400 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-800/80 dark:hover:text-indigo-400 hover:border-indigo-500/40 shadow-xs hover:shadow-sm cursor-pointer"
                            >
                                <Settings size={14} />
                                Account Settings
                            </Link>
                            <Link
                                href="/your-plan"
                                className="flex-1 lg:flex-initial flex items-center justify-center gap-2 text-xs font-black px-4 py-2.5 rounded-2xl border transition-all text-slate-700 border-slate-200 bg-slate-50/50 hover:bg-white hover:text-indigo-600 dark:text-slate-400 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-800/80 dark:hover:text-indigo-400 hover:border-indigo-500/40 shadow-xs hover:shadow-sm cursor-pointer"
                            >
                                <CreditCard size={14} />
                                Manage Plan
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="flex items-center justify-center p-3 rounded-2xl border transition-all border-rose-250 text-rose-500 bg-rose-50/40 hover:bg-rose-100/80 hover:text-rose-650 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400 dark:hover:bg-rose-950/30 shrink-0 cursor-pointer"
                                title="Sign out account"
                            >
                                <LogOut size={14} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Telemetry Dashboard Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatTelemetryCard
                        icon={<Target className="text-emerald-400" />}
                        label="Problems Solved"
                        value={stats?.total_solved || 0}
                        subLabel={`${totalSolvedPercent}% of all tasks`}
                        delay={0.1}
                    />
                    <StatTelemetryCard
                        icon={<Trophy className="text-amber-400" />}
                        label="Prestige Score"
                        value={profile.total_score || 0}
                        subLabel="Vlyxir ranking points"
                        delay={0.2}
                    />
                    <StatTelemetryCard
                        icon={<TrendingUp className="text-indigo-400" />}
                        label="Global Ranking"
                        value={`#${rank}`}
                        subLabel="On global leaderboard"
                        delay={0.3}
                    />
                    <StatTelemetryCard
                        icon={<Flame className="text-orange-400" />}
                        label="Accuracy Rate"
                        value={`${stats?.accuracy?.toFixed(1) || '0.0'}%`}
                        subLabel="Based on first attempts"
                        delay={0.4}
                    />
                </div>

                {/* Contribution Grid Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="border rounded-3xl p-6 glass-morphism bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    {/* Header stats bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="text-indigo-400" size={18} />
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">Submission Activity</h2>
                        </div>
                        
                        {/* Micro-stats cards */}
                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                            <div className="flex flex-col border-r border-slate-200 dark:border-slate-800 pr-4 text-center md:text-left">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Days</span>
                                <span className="text-sm font-black text-slate-800 dark:text-slate-100">{streakStats.activeDays} days</span>
                            </div>
                            <div className="flex flex-col border-r border-slate-200 dark:border-slate-800 pr-4 text-center md:text-left">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Current Streak</span>
                                <span className="text-sm font-black text-slate-800 dark:text-slate-100">{streakStats.currentStreak} days</span>
                            </div>
                            <div className="flex flex-col text-center md:text-left">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Max Streak</span>
                                <span className="text-sm font-black text-slate-800 dark:text-slate-100">{streakStats.longestStreak} days</span>
                            </div>
                        </div>
                    </div>

                    {/* Heatmap Layout split: Calendar Heatmap on Left, Gamified Activity Insights on Right */}
                    <div className="flex flex-col xl:flex-row gap-6">
                        {/* Heatmap Grid & Legend wrapper */}
                        <div className="flex-1 min-w-0">
                            {/* Heatmap Grid */}
                            <div className="overflow-x-auto pb-2 custom-scrollbar select-none">
                                <div className="min-w-[340px] sm:min-w-[570px] space-y-1.5 pl-1 [--label-offset:24px] [--col-width:12px] sm:[--label-offset:30px] sm:[--col-width:15px]">
                                    {/* Month labels header */}
                                    <div className="relative h-4 text-[9px] font-black text-slate-400 uppercase tracking-wider mb-3.5">
                                        {monthLabels.map((m, idx) => (
                                            <span 
                                                key={idx} 
                                                className="absolute" 
                                                style={{ left: `calc(var(--label-offset, 24px) + ${m.colIndex} * var(--col-width, 12px))` }}
                                            >
                                                {m.label}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Grid wrapper */}
                                    <div className="flex gap-1 sm:gap-1.5">
                                        {/* Day labels column */}
                                        <div className="grid grid-rows-7 h-[81px] sm:h-[105px] text-[8px] font-black text-slate-455 dark:text-slate-500 justify-between items-center pr-1.5 w-5 sm:w-6 sm:pr-2 uppercase leading-none">
                                            <span>Sun</span>
                                            <span className="opacity-0">Mon</span>
                                            <span>Tue</span>
                                            <span className="opacity-0">Wed</span>
                                            <span>Thu</span>
                                            <span className="opacity-0">Fri</span>
                                            <span>Sat</span>
                                        </div>

                                        {/* Contribution cells (grid-flow-col grids) */}
                                        <div className="grid grid-flow-col grid-rows-7 gap-[2px] sm:gap-1 h-[81px] sm:h-[105px]">
                                            {daySquares.map((daySquare, idx) => {
                                                const count = submissionCountsByDate[daySquare.dateStr] || 0;
                                                const colorClass = getContributionColorClass(count);
                                                return (
                                                    <div key={idx} className="relative group cursor-pointer">
                                                        <div className={`w-[9px] h-[9px] sm:w-[11px] sm:h-[11px] rounded-xs transition-colors duration-150 ${colorClass}`} />
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 bg-slate-900 border border-slate-800 text-[9px] text-white px-2 py-1 rounded shadow-lg whitespace-nowrap leading-none">
                                                            {count === 0 ? 'No' : count} {count === 1 ? 'submission' : 'submissions'} on {format(daySquare.date, 'MMM d, yyyy')}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Legend bar */}
                            <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800 pt-3">
                                <span className="flex items-center gap-1.5">
                                    <Flame className="text-orange-400" size={12} />
                                    {allSubmissions.filter(s => {
                                        const oneYearAgo = new Date();
                                        oneYearAgo.setDate(oneYearAgo.getDate() - 365);
                                        return new Date(s.created_at) >= oneYearAgo;
                                    }).length} submissions in the last year
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                    <span>Less</span>
                                    <div className="w-[10px] h-[10px] rounded-xs bg-slate-200/70 dark:bg-violet-950/35 border border-slate-300/30 dark:border-violet-900/30" />
                                    <div className="w-[10px] h-[10px] rounded-xs bg-violet-200 dark:bg-violet-900/50 border border-violet-300/50 dark:border-violet-800/30" />
                                    <div className="w-[10px] h-[10px] rounded-xs bg-violet-400/80 dark:bg-violet-700/70 border border-violet-400/50 dark:border-violet-600/40" />
                                    <div className="w-[10px] h-[10px] rounded-xs bg-violet-600/90 dark:bg-violet-500 border border-violet-600/40 dark:border-violet-400/40" />
                                    <div className="w-[10px] h-[10px] rounded-xs bg-violet-800 dark:bg-violet-300 border border-violet-900/50 dark:border-violet-200/40" />
                                    <span>More</span>
                                </div>
                            </div>
                        </div>

                        {/* Divider line for wide screens */}
                        <div className="hidden xl:block w-px bg-slate-200/50 dark:bg-slate-800/80 self-stretch my-1" />

                        {/* Right Panel: Streak Status & Gamified Activity Insights */}
                        <div className="w-full xl:w-[240px] shrink-0 flex flex-col justify-between">
                            <div className="p-4 rounded-2xl bg-slate-500/5 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between h-full space-y-4 shadow-2xs">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Level</span>
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${activityInsights.badge.border} ${activityInsights.badge.bg} ${activityInsights.badge.color}`}>
                                            {activityInsights.badge.title}
                                        </span>
                                    </div>

                                    {/* Circular gauge or nice central visual */}
                                    <div className="flex items-center gap-3 bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-900 shadow-2xs">
                                        <div className="relative flex items-center justify-center shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center animate-pulse">
                                                <Flame className="text-orange-500 animate-pulse" size={20} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Current Streak</p>
                                            <p className="text-lg font-black text-slate-800 dark:text-white leading-none tabular-nums">
                                                {streakStats.currentStreak} <span className="text-xs font-bold text-slate-400">days</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800/40 pb-2">
                                        <span className="text-slate-400 font-bold flex items-center gap-1.5">
                                            <Clock size={12} className="text-indigo-400" />
                                            Active Day
                                        </span>
                                        <span className="font-bold text-slate-700 dark:text-slate-200">{activityInsights.mostActiveDay}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800/40 pb-2">
                                        <span className="text-slate-400 font-bold flex items-center gap-1.5">
                                            <TrendingUp size={12} className="text-indigo-400" />
                                            Weekly Avg
                                        </span>
                                        <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">{activityInsights.weeklyAverage} / wk</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-400 font-bold flex items-center gap-1.5">
                                            <Target size={12} className="text-indigo-400" />
                                            Consistency
                                        </span>
                                        <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                                            {Math.round((streakStats.activeDays / 365) * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Visual Telemetry Chart & Submissions Metrics split layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Ring Telemetry & Level Distribution */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="border rounded-3xl p-6 glass-morphism bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                    >
                        <div>
                            <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                                <Activity size={18} className="text-indigo-400" />
                                Metric Telemetry
                            </h2>
                            
                            {/* Circular radial metrics visual (multi-segment donut chart representing levels) */}
                            <div className="flex justify-center mb-6 relative">
                                <svg width="144" height="144" viewBox="0 0 144 144" className="w-36 h-36">
                                    <g transform="rotate(-90 72 72)">
                                        {/* Unsolved background circle representing total */}
                                        <circle
                                            cx="72"
                                            cy="72"
                                            r="54"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-slate-100 dark:text-slate-800"
                                        />
                                        {/* Easy Solved Segment (Green) */}
                                        {easyCount > 0 && (
                                            <motion.circle
                                                cx="72"
                                                cy="72"
                                                r="54"
                                                stroke="#10B981" // Emerald
                                                strokeWidth="10"
                                                fill="transparent"
                                                strokeDasharray={`${easyLength} ${C_CIRCUMFERENCE}`}
                                                initial={{ strokeDashoffset: C_CIRCUMFERENCE }}
                                                animate={{ strokeDashoffset: easyOffset }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="drop-shadow-[0_0_4px_rgba(16,185,129,0.25)]"
                                            />
                                        )}
                                        {/* Medium Solved Segment (Amber) */}
                                        {mediumCount > 0 && (
                                            <motion.circle
                                                cx="72"
                                                cy="72"
                                                r="54"
                                                stroke="#F59E0B" // Amber
                                                strokeWidth="10"
                                                fill="transparent"
                                                strokeDasharray={`${mediumLength} ${C_CIRCUMFERENCE}`}
                                                initial={{ strokeDashoffset: C_CIRCUMFERENCE }}
                                                animate={{ strokeDashoffset: mediumOffset }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="drop-shadow-[0_0_4px_rgba(245,158,11,0.25)]"
                                            />
                                        )}
                                        {/* Hard Solved Segment (Rose) */}
                                        {hardCount > 0 && (
                                            <motion.circle
                                                cx="72"
                                                cy="72"
                                                r="54"
                                                stroke="#F43F5E" // Rose
                                                strokeWidth="10"
                                                fill="transparent"
                                                strokeDasharray={`${hardLength} ${C_CIRCUMFERENCE}`}
                                                initial={{ strokeDashoffset: C_CIRCUMFERENCE }}
                                                animate={{ strokeDashoffset: hardOffset }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="drop-shadow-[0_0_4px_rgba(244,63,94,0.25)]"
                                            />
                                        )}
                                    </g>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                                        {solvedCount}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">
                                        Solved
                                    </span>
                                </div>
                            </div>

                            {/* Level Distribution Sliders */}
                            <div className="space-y-4">
                                <DifficultyBarTelemetry
                                    label="Easy Tasks"
                                    count={stats?.easy_solved || 0}
                                    total={stats?.total_solved || 0}
                                    color="bg-emerald-500"
                                    trackColor="bg-emerald-500/10"
                                    textColor="text-emerald-500"
                                />
                                <DifficultyBarTelemetry
                                    label="Medium Tasks"
                                    count={stats?.medium_solved || 0}
                                    total={stats?.total_solved || 0}
                                    color="bg-amber-500"
                                    trackColor="bg-amber-500/10"
                                    textColor="text-amber-500"
                                />
                                <DifficultyBarTelemetry
                                    label="Hard Tasks"
                                    count={stats?.hard_solved || 0}
                                    total={stats?.total_solved || 0}
                                    color="bg-rose-500"
                                    trackColor="bg-rose-500/10"
                                    textColor="text-rose-500"
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                                <Clock size={10} /> Real-time database sync
                            </span>
                            <span>{stats?.total_submissions || 0} total attempts</span>
                        </div>
                    </motion.div>

                    {/* Solved Problems Explorer & Search List */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="lg:col-span-2 border rounded-3xl p-6 glass-morphism bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
                    >
                        {/* Header controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <BookOpen size={18} className="text-indigo-400" />
                                    Solved Problems Explorer
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review codes, attempt levels, and solved statuses</p>
                            </div>
                            
                            <button
                                onClick={() => setIsAllSubmissionsOpen(true)}
                                className="text-xs font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors self-start sm:self-auto px-3 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5"
                            >
                                Submissions Log <ChevronRight size={14} />
                            </button>
                        </div>

                        {/* Search & Difficulty Filter controls */}
                        <div className="flex gap-3 mb-4 w-full">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by problem name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs glass-morphism bg-slate-50 border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-900/40 dark:border-slate-800 dark:focus:ring-indigo-500/50"
                                />
                            </div>
                            <select
                                value={difficultyFilter}
                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                className="px-4 py-2.5 rounded-2xl border text-xs glass-morphism bg-slate-50 border-slate-200 focus:outline-none dark:bg-slate-900/40 dark:border-slate-800 cursor-pointer text-slate-600 dark:text-slate-350"
                            >
                                <option value="all">All Levels</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        {/* Solved Problems List */}
                        <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-2 custom-scrollbar">
                            {filteredSolvedProblems.length > 0 ? (
                                filteredSolvedProblems.map((item) => (
                                    <div
                                        key={item.problemId}
                                        onClick={() => handleViewCode(item.lastSubmission)}
                                        className="flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group bg-slate-50 border-slate-200 hover:bg-white hover:shadow-md dark:bg-slate-800/20 dark:border-slate-800/60 dark:hover:bg-slate-800/40 dark:hover:shadow-none"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                                                <CheckCircle2 size={18} />
                                            </div>
                                            <div className="truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                                                <h3 className="font-bold text-sm transition-colors group-hover:text-indigo-400 text-slate-900 dark:text-white truncate">
                                                    {item.title}
                                                </h3>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    Solved {format(item.solvedAt, 'MMM d, yyyy • h:mm a')} • {item.submissionsCount} {item.submissionsCount === 1 ? 'attempt' : 'attempts'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${getDifficultyColorTelemetry(item.difficulty)}`}>
                                                {item.difficulty}
                                            </span>
                                            <div className="p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-400 transition-colors">
                                                <ExternalLink size={12} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 text-slate-400 border border-dashed rounded-3xl border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-900/10">
                                    <HelpCircle size={32} className="text-slate-350 dark:text-slate-700 mb-2" />
                                    <p className="text-xs font-bold">No Solved Problems Match</p>
                                    <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">We couldn't find any solved problems matching your current search parameters.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Arena Match History Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="border rounded-3xl p-6 glass-morphism bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Trophy className="text-indigo-400" size={18} />
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">Arena Match History</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                        {duelsHistory.length > 0 ? (
                            duelsHistory.map((duel) => (
                                <div
                                    key={duel.id}
                                    onClick={() => handleViewCode({
                                        id: duel.id,
                                        code: duel.code,
                                        passed: duel.passed,
                                        total: duel.total,
                                        problems: { title: duel.problemTitle }
                                    })}
                                    className="p-4 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer group bg-slate-50 border-slate-200 hover:bg-white hover:shadow-md dark:bg-slate-800/20 dark:border-slate-800/60 dark:hover:bg-slate-800/30"
                                >
                                    <div className="space-y-3 animate-fade-in">
                                        {/* Header: Result badge & Date */}
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                                duel.result === "victory"
                                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]"
                                                    : duel.result === "defeat"
                                                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                                    : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                                            }`}>
                                                {duel.result}
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-semibold">
                                                {format(duel.solvedAt, 'MMM d, yyyy • h:mm a')}
                                            </span>
                                        </div>

                                        {/* Competitor / Opponent detail */}
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-7 w-7 rounded-lg bg-linear-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-[10px] font-black relative overflow-hidden shrink-0 shadow-2xs">
                                                {duel.opponent.avatarUrl ? (
                                                    <Image 
                                                        src={duel.opponent.avatarUrl} 
                                                        alt={duel.opponent.fullName} 
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    duel.opponent.fullName[0].toUpperCase()
                                                )}
                                            </div>
                                            <div className="truncate min-w-0">
                                                <p className="font-bold text-xs truncate leading-none text-slate-850 dark:text-slate-200">
                                                    vs {duel.opponent.fullName}
                                                </p>
                                                <p className="text-[9px] text-slate-455 dark:text-slate-400 mt-0.5 leading-none">
                                                    @{duel.opponent.username}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Problem Details */}
                                        <div>
                                            <h4 className="font-black text-xs text-slate-900 dark:text-white truncate group-hover:text-indigo-400 transition-colors">
                                                {duel.problemTitle}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${getDifficultyColorTelemetry(duel.problemDifficulty)}`}>
                                                    {duel.problemDifficulty}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-bold">
                                                    Score: {duel.passed}/{duel.total}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Row */}
                                    <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-slate-400">
                                        <span className="flex items-center gap-1 text-[9px] font-black tracking-wider uppercase group-hover:text-indigo-400 transition-colors">
                                            View Solution <ChevronRight size={10} />
                                        </span>
                                        <ExternalLink size={10} className="group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 border border-dashed rounded-3xl border-slate-250 dark:border-slate-800 flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-900/10">
                                <HelpCircle size={32} className="text-slate-350 dark:text-slate-700 mb-2" />
                                <p className="text-xs font-bold text-slate-400">No Arena Duels Completed Yet</p>
                                <p className="text-[10px] text-slate-500 mt-1 max-w-[220px]">Compete with other developers in the Competitive 1v1 Arena to build your reputation!</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Social Network Management Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="border rounded-3xl p-6 glass-morphism bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Users className="text-indigo-400" size={18} />
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">Social Connections</h2>
                        </div>
                        <div className="flex gap-2 bg-slate-200/50 dark:bg-slate-800/60 p-1 rounded-xl self-start sm:self-auto">
                            <button
                                onClick={() => setSocialTab("following")}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    socialTab === "following"
                                        ? "bg-white text-indigo-650 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                }`}
                            >
                                Following ({followingList.length})
                            </button>
                            <button
                                onClick={() => setSocialTab("followers")}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    socialTab === "followers"
                                        ? "bg-white text-indigo-650 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                }`}
                            >
                                Followers ({followersList.length})
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {socialTab === "following" ? (
                            followingList.length > 0 ? (
                                followingList.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-4 rounded-2xl border flex items-center justify-between bg-slate-50 border-slate-200 dark:bg-slate-800/20 dark:border-slate-800/60 transition-all hover:bg-white dark:hover:bg-slate-800/30"
                                    >
                                        <Link href={`/user/${item.id}`} className="flex items-center gap-3 min-w-0">
                                            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-black relative overflow-hidden shrink-0 shadow-xs">
                                                {item.avatar_url ? (
                                                    <Image 
                                                        src={item.avatar_url} 
                                                        alt={item.full_name} 
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    getInitials(item.full_name)
                                                )}
                                            </div>
                                            <div className="truncate">
                                                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.full_name}</p>
                                                <p className="text-[10px] text-slate-400 truncate">@{item.username}</p>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => handleUnfollow(item.id)}
                                            className="px-3 py-1.5 rounded-xl text-[10px] font-bold border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0 flex items-center gap-1 active:scale-95 cursor-pointer"
                                        >
                                            <UserMinus size={12} />
                                            Unfollow
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-10 text-slate-400 text-xs">
                                    You are not following anyone yet.
                                </div>
                            )
                        ) : (
                            followersList.length > 0 ? (
                                followersList.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-4 rounded-2xl border flex items-center justify-between bg-slate-50 border-slate-200 dark:bg-slate-800/20 dark:border-slate-800/60 transition-all hover:bg-white dark:hover:bg-slate-800/30"
                                    >
                                        <Link href={`/user/${item.id}`} className="flex items-center gap-3 min-w-0">
                                            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-black relative overflow-hidden shrink-0 shadow-xs">
                                                {item.avatar_url ? (
                                                    <Image 
                                                        src={item.avatar_url} 
                                                        alt={item.full_name} 
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    getInitials(item.full_name)
                                                )}
                                            </div>
                                            <div className="truncate">
                                                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.full_name}</p>
                                                <p className="text-[10px] text-slate-400 truncate">@{item.username}</p>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => handleRemoveFollower(item.id)}
                                            className="px-3 py-1.5 rounded-xl text-[10px] font-bold border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0 flex items-center gap-1 active:scale-95 cursor-pointer"
                                        >
                                            <UserMinus size={12} />
                                            Remove
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-10 text-slate-400 text-xs">
                                    No one is following you yet.
                                </div>
                            )
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Submissions & Code View Modals */}
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

/* Helper Telemetry Stat Card with entrance transition */
function StatTelemetryCard({ icon, label, value, subLabel, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ y: -4 }}
            className="border p-5 rounded-3xl glass-morphism bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl transition-colors bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 shrink-0">
                    {icon}
                </div>
                <span className="text-[10px] font-black tracking-wider uppercase text-slate-500 group-hover:text-indigo-400 transition-colors">
                    {label}
                </span>
            </div>
            <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
                {value}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-bold">
                {subLabel}
            </p>
        </motion.div>
    );
}

/* Helper Level progress bar component */
function DifficultyBarTelemetry({ label, count, total, color, trackColor, textColor }: any) {
    const percentage = total > 0 ? Math.min(100, (count / total) * 100) : 0;

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">{label}</span>
                <span className={`${textColor}`}>
                    {count} <span className="text-slate-400 font-medium">/ {total}</span>
                </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h-full ${color} rounded-full`}
                />
            </div>
        </div>
    );
}

/* Difficulty color mapper helper */
function getDifficultyColorTelemetry(diff: string = '') {
    switch (diff.toLowerCase()) {
        case 'easy': return 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20';
        case 'medium': return 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
        case 'hard': return 'text-rose-500 bg-rose-500/10 border border-rose-500/20';
        default: return 'text-slate-400 bg-slate-400/10 border border-slate-400/20';
    }
}

/* Loading skeleton fallback structure */
function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
    );
}

function getContributionColorClass(count: number) {
    if (count === 0) return 'bg-slate-200/70 dark:bg-violet-950/35 border border-slate-300/30 dark:border-violet-900/30';
    if (count >= 1 && count <= 2) return 'bg-violet-200 dark:bg-violet-900/50 border border-violet-300/50 dark:border-violet-800/30';
    if (count >= 3 && count <= 5) return 'bg-violet-400/80 dark:bg-violet-700/70 border border-violet-400/50 dark:border-violet-600/40';
    if (count >= 6 && count <= 9) return 'bg-violet-600/90 dark:bg-violet-500 border border-violet-600/40 dark:border-violet-400/40';
    return 'bg-violet-800 dark:bg-violet-300 border border-violet-900/50 dark:border-violet-200/40';
}

function ProfileSkeleton() {
    return (
        <div className="min-h-screen p-4 md:p-8 bg-slate-50 dark:bg-[#0B0C15]">
            <div className="max-w-6xl mx-auto space-y-6">
                
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
