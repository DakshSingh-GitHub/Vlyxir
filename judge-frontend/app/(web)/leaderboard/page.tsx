/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Medal,
    Search,
    Users,
    TrendingUp,
    ArrowRight,
    ChevronRight,
    Sparkles,
    Star,
    Globe,
    Home
} from 'lucide-react';
import { supabase } from '../../lib/api/supabase/client';
import { useAppContext } from '../../lib/auth/context';
import { LeaderboardUser } from '../../lib/types/types';
import { getCachedLeaderboard, setCachedLeaderboard } from '../../lib/utils/cache';
import Image from 'next/image';
import Link from 'next/link';


export default function LeaderboardPage() {
    const { isDark } = useAppContext();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPoints: 0,
        avgScore: 0
    });

    useEffect(() => {
        // Try to load from cache first for instant UI
        const cached = getCachedLeaderboard();
        if (cached) {
            setUsers(cached.users);
            setStats(cached.stats);
            setLoading(false);
        }

        async function fetchLeaderboard() {
            // Only show loading if we don't have cached data
            if (!cached) setLoading(true);
            
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, total_score, country, avatar_url')
                    .order('total_score', { ascending: false })
                    .limit(50);

                if (error) throw error;

                const leaderboardData = (data || []).map((user, index) => ({
                    ...user,
                    rank: index + 1
                }));

                const totalPoints = leaderboardData.reduce((acc, curr) => acc + (curr.total_score || 0), 0);
                const newStats = {
                    totalUsers: leaderboardData.length,
                    totalPoints: totalPoints,
                    avgScore: leaderboardData.length > 0 ? Math.round(totalPoints / leaderboardData.length) : 0
                };

                setUsers(leaderboardData);
                setStats(newStats);

                // Update cache with fresh data
                setCachedLeaderboard({
                    users: leaderboardData,
                    stats: newStats
                });

            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchLeaderboard();
    }, []);

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    };

    const topThree = users.slice(0, 3);
    const tableUsers = searchTerm ? filteredUsers : filteredUsers.slice(3);

    if (loading) return <LeaderboardSkeleton />;

    return (
        <div className={`min-h-screen p-4 md:p-8 transition-colors duration-500 ${isDark ? "bg-[#0B0C15] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-sm"
                        >
                            <Sparkles size={16} />
                            Vlyxir Rankings
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black tracking-tight"
                        >
                            Global <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-purple-500">Leaderboard</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-500 dark:text-slate-400 text-lg"
                        >
                            Recognizing the elite coders and problem solvers across the globe.
                        </motion.p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Link 
                            href="/"
                            className="flex items-center gap-2 px-4 py-3 rounded-2xl border glass-morphism bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all shadow-sm text-slate-500 hover:text-indigo-500 font-bold"
                        >
                            <Home size={18} />
                            <span className="hidden sm:inline">Home</span>
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="relative flex-1 md:w-80"
                        >
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Find a coder..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-2xl border glass-morphism bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        icon={<Users className="text-indigo-400" />}
                        label="Top Competitors"
                        value={stats.totalUsers}
                        delay={0.4}
                    />
                    <StatCard
                        icon={<Trophy className="text-amber-400" />}
                        label="Total Community Points"
                        value={stats.totalPoints}
                        delay={0.5}
                    />
                    <StatCard
                        icon={<TrendingUp className="text-emerald-400" />}
                        label="Average Score"
                        value={stats.avgScore}
                        delay={0.6}
                    />
                </div>

                {/* Top 3 Section */}
                {!searchTerm && users.length >= 3 && (
                    <div className="grid grid-cols-3 gap-2 md:gap-8 pt-12 items-end">
                        {/* 2nd Place */}
                        <TopThreeCard
                            user={users[1]}
                            rank={2}
                            delay={0.8}
                            color="from-slate-400 to-slate-600"
                            shadow="shadow-slate-500/20"
                            height="h-24 md:h-64"
                            className="order-1"
                        />
                        {/* 1st Place */}
                        <TopThreeCard
                            user={users[0]}
                            rank={1}
                            delay={0.7}
                            color="from-amber-400 to-amber-600"
                            shadow="shadow-amber-500/30"
                            height="h-32 md:h-80"
                            isMain
                            className="order-2"
                        />
                        {/* 3rd Place */}
                        <TopThreeCard
                            user={users[2]}
                            rank={3}
                            delay={0.9}
                            color="from-orange-500 to-orange-700"
                            shadow="shadow-orange-500/20"
                            height="h-20 md:h-56"
                            className="order-3"
                        />
                    </div>
                )}

                {/* Rankings Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="overflow-hidden rounded-3xl border glass-morphism bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none"
                >
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                        <h2 className="text-lg font-bold">Overall Rankings</h2>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                            {filteredUsers.length} Users Listed
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 w-20 text-center">Rank</th>
                                    <th className="px-4 py-4 w-full text-left">Coder</th>
                                    <th className="px-4 py-4 w-32 text-left">Country</th>
                                    <th className="px-6 py-4 w-32 text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {tableUsers.length > 0 ? (
                                    tableUsers.map((user) => (
                                        <RankingRow
                                            key={user.id}
                                            user={user}
                                            rank={user.rank || 0}
                                        />
                                    ))
                                ) : searchTerm ? (
                                    <tr className="text-center">
                                        <td colSpan={5} className="py-12 text-slate-400">No coders found matching your search.</td>
                                    </tr>
                                ) : users.length > 3 ? (
                                    <tr className="text-center">
                                        <td colSpan={5} className="py-12 text-slate-400">Loading more competitors...</td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="p-8 rounded-3xl border glass-morphism bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border-slate-200 dark:border-slate-800 flex items-center gap-5 group hover:border-indigo-500/50 transition-all shadow-sm"
        >
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <p className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-4xl font-black tabular-nums">{value.toLocaleString()}</p>
            </div>
        </motion.div>
    );
}

function TopThreeCard({ user, rank, delay, color, shadow, height, isMain, className }: any) {
    const titles = ["", "Grand Champion", "Elite Coder", "Rising Star"];

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: "spring", stiffness: 100 }}
            className={`flex flex-col items-center gap-4 relative group ${className}`}
        >
            {isMain && (
                <div className="absolute -top-12 animate-bounce z-30">
                    <Star className="text-amber-400 fill-amber-400" size={32} />
                </div>
            )}

            <Link href={`/user/${user.username}`} className="group relative z-20">
                <div className={`h-16 w-16 md:h-32 md:w-32 rounded-2xl md:rounded-3xl bg-linear-to-br ${color} ${shadow} shadow-2xl flex items-center justify-center text-xl md:text-4xl font-black text-white border-2 md:border-4 border-white dark:border-[#0B0C15] group-hover:rotate-6 transition-transform relative overflow-hidden`}>
                    {user.avatar_url ? (
                        <Image 
                            src={user.avatar_url} 
                            alt={user.full_name} 
                            fill
                            className="object-cover"
                        />
                    ) : (
                        user.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'
                    )}
                </div>
                <div className={`absolute -bottom-2 md:-bottom-4 left-1/2 -translate-x-1/2 w-6 h-6 md:w-10 md:h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[10px] md:text-base font-black z-20`}>
                    {rank}
                </div>
            </Link>

            <div className="text-center mt-2 md:mt-3 z-20 w-full px-1">
                <Link href={`/user/${user.username}`} className="group/info block">
                    <h3 className="text-[10px] md:text-xl font-black tracking-tight group-hover/info:text-indigo-400 transition-colors truncate">{user.full_name}</h3>
                    <p className="text-indigo-400 font-semibold text-[8px] md:text-sm">@{user.username}</p>
                </Link>
                <div className="mt-1 md:mt-1">
                    <span className="text-base md:text-4xl font-black dark:text-slate-100 text-slate-900">
                        {user.total_score?.toLocaleString() || 0}
                    </span>
                    <span className="text-[10px] md:text-sm font-black text-slate-500 ml-0.5 md:ml-1 uppercase tracking-widest">pts</span>
                </div>
            </div>

            {/* Podium Base */}
            <div className={`w-full ${height} rounded-t-3xl bg-linear-to-b from-white/10 to-transparent dark:from-slate-800/40 dark:to-transparent border-x border-t mt-2 backdrop-blur-md relative overflow-hidden flex flex-col items-center p-6 ${rank === 1 ? 'border-amber-500/30 dark:border-amber-500/20' : rank === 2 ? 'border-slate-400/30 dark:border-slate-400/20' : 'border-orange-500/30 dark:border-orange-500/20'}`}>
                {/* Background Rank Number */}
                <div className="absolute -bottom-4 md:-bottom-10 -right-2 md:-right-4 text-6xl md:text-9xl font-black text-slate-900/20 dark:text-white/5 select-none pointer-events-none">
                    {rank}
                </div>

                {/* Visual accents */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-current to-transparent opacity-50 ${rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-slate-400' : 'text-orange-500'}`}></div>

                <div className="mt-auto mb-2 flex flex-col items-center gap-1 relative z-10">
                    <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] ${rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-slate-400' : 'text-orange-500'}`}>
                        {titles[rank]}
                    </span>

                    <div className="flex items-center gap-1 text-[8px] md:text-[10px] font-bold text-slate-500">
                        <Globe size={8} className="md:w-[10px] md:h-[10px]" />
                        <span className="truncate max-w-[40px] md:max-w-none">{user.country || "Global"}</span>
                    </div>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
            </div>
        </motion.div>
    );
}

function RankingRow({ user, rank }: { user: LeaderboardUser, rank: number }) {
    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0 backdrop-blur-sm"
        >
            <td className="px-6 py-3 md:py-4 w-20 text-center">
                <span className={`flex items-center justify-center h-8 w-8 rounded-lg font-black text-sm mx-auto ${rank <= 3 ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                    {rank}
                </span>
            </td>
            <td className="px-4 py-3 md:py-4 w-full">
                <Link href={`/user/${user.username}`} className="flex items-center gap-3 group/user">
                    <div className="h-9 w-9 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white group-hover/user:scale-105 transition-transform overflow-hidden relative shrink-0">
                        {user.avatar_url ? (
                            <Image 
                                src={user.avatar_url} 
                                alt={user.full_name} 
                                fill
                                className="object-cover"
                            />
                        ) : (
                            user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
                        )}
                    </div>
                    <div className="flex flex-col justify-center">
                        <p className="font-black text-slate-900 dark:text-white group-hover/user:text-indigo-400 transition-colors line-clamp-1">{user.full_name}</p>
                        <p className="text-[10px] md:text-xs font-semibold text-slate-500">@{user.username}</p>
                    </div>
                </Link>
            </td>
            <td className="px-4 py-3 md:py-4 w-32 text-left">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    {user.country || "Global"}
                </span>
            </td>
            <td className="px-6 py-3 md:py-4 w-32 text-right">
                <span className={`text-lg font-black tracking-tight ${user.total_score === 0 ? 'text-slate-400 dark:text-slate-600' : 'text-indigo-500 dark:text-indigo-400'}`}>
                    {user.total_score?.toLocaleString() || 0}
                </span>
            </td>
        </motion.tr>
    );
}

function LeaderboardSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0C15] pb-20 pt-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
                <div className="flex justify-between items-end">
                    <div className="space-y-4">
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                        <div className="h-12 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                        <div className="h-6 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    </div>
                    <div className="h-12 w-80 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800"></div>
                    ))}
                </div>

                <div className="h-150 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800"></div>
            </div>
        </div>
    );
}