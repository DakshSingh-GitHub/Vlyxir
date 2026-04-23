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
    Star
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAppContext } from '../../lib/context';
import Link from 'next/link';

interface LeaderboardUser {
    id: string;
    username: string;
    full_name: string;
    total_score: number;
    country?: string;
}

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
        async function fetchLeaderboard() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, total_score, country')
                    .order('total_score', { ascending: false })
                    .limit(50);

                if (error) throw error;

                const leaderboardData = data || [];
                setUsers(leaderboardData);

                // Calculate some stats
                const totalPoints = leaderboardData.reduce((acc, curr) => acc + (curr.total_score || 0), 0);
                setStats({
                    totalUsers: leaderboardData.length,
                    totalPoints: totalPoints,
                    avgScore: leaderboardData.length > 0 ? Math.round(totalPoints / leaderboardData.length) : 0
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
    const others = filteredUsers.slice(topThree.length);

    if (loading) return <LeaderboardSkeleton />;

    return (
        <div className={`min-h-screen p-4 md:p-8 transition-colors duration-500 ${isDark ? "bg-background text-slate-100" : "bg-slate-50 text-slate-900"}`}>
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
                            Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Leaderboard</span>
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

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative w-full md:w-80"
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 items-end">
                        {/* 2nd Place */}
                        <TopThreeCard 
                            user={users[1]} 
                            rank={2} 
                            delay={0.8}
                            color="from-slate-300 to-slate-500"
                            shadow="shadow-slate-500/20"
                            height="h-64"
                        />
                        {/* 1st Place */}
                        <TopThreeCard 
                            user={users[0]} 
                            rank={1} 
                            delay={0.7}
                            color="from-amber-300 to-amber-600"
                            shadow="shadow-amber-500/30"
                            height="h-80"
                            isMain
                        />
                        {/* 3rd Place */}
                        <TopThreeCard 
                            user={users[2]} 
                            rank={3} 
                            delay={0.9}
                            color="from-orange-300 to-orange-600"
                            shadow="shadow-orange-500/20"
                            height="h-56"
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
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                        <h2 className="text-xl font-bold">Overall Rankings</h2>
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                            {filteredUsers.length} Users Listed
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-8 py-4">Rank</th>
                                    <th className="px-4 py-4">Coder</th>
                                    <th className="px-4 py-4">Country</th>
                                    <th className="px-4 py-4 text-right">Score</th>
                                    <th className="px-8 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {others.length > 0 ? (
                                    others.map((user, idx) => (
                                        <RankingRow 
                                            key={user.id} 
                                            user={user} 
                                            rank={topThree.length + idx + 1} 
                                        />
                                    ))
                                ) : !searchTerm && users.length > 3 ? (
                                    <tr className="text-center">
                                        <td colSpan={5} className="py-12 text-slate-400">Loading more competitors...</td>
                                    </tr>
                                ) : searchTerm && filteredUsers.length === 0 ? (
                                    <tr className="text-center">
                                        <td colSpan={5} className="py-12 text-slate-400">No coders found matching your search.</td>
                                    </tr>
                                ) : (
                                    // If search matches top 3, they might be here
                                    filteredUsers.slice(0, 3).map((user, idx) => (
                                        <RankingRow 
                                            key={user.id} 
                                            user={user} 
                                            rank={idx + 1} 
                                        />
                                    ))
                                )}
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
            className="p-6 rounded-3xl border glass-morphism bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 flex items-center gap-6 group hover:border-indigo-500/50 transition-all shadow-sm"
        >
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                <p className="text-3xl font-black tabular-nums">{value.toLocaleString()}</p>
            </div>
        </motion.div>
    );
}

function TopThreeCard({ user, rank, delay, color, shadow, height, isMain }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: "spring", stiffness: 100 }}
            className={`flex flex-col items-center gap-4 relative group`}
        >
            {isMain && (
                <div className="absolute -top-12 animate-bounce">
                    <Star className="text-amber-400 fill-amber-400" size={32} />
                </div>
            )}

            <Link href={`/user/${user.id}`} className="group relative">
                <div className={`h-24 w-24 md:h-32 md:w-32 rounded-3xl bg-gradient-to-br ${color} ${shadow} shadow-2xl flex items-center justify-center text-3xl md:text-4xl font-black text-white border-4 border-white dark:border-[#0B0C15] group-hover:rotate-6 transition-transform z-10 relative`}>
                    {user.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                </div>
                <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center font-black z-20`}>
                    {rank}
                </div>
            </Link>

            <div className="text-center space-y-1 mt-4">
                <h3 className="text-xl font-bold tracking-tight">{user.full_name}</h3>
                <p className="text-indigo-400 font-semibold text-sm">@{user.username}</p>
                <div className="pt-4">
                    <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
                        {user.total_score?.toLocaleString() || 0}
                    </span>
                    <span className="text-xs font-bold text-slate-500 ml-1">pts</span>
                </div>
            </div>

            <div className={`w-full ${height} rounded-t-3xl bg-gradient-to-b from-white/10 to-transparent dark:from-slate-800/50 dark:to-transparent border-x border-t border-slate-200 dark:border-slate-800 mt-4 backdrop-blur-md`}></div>
        </motion.div>
    );
}

function RankingRow({ user, rank }: { user: LeaderboardUser, rank: number }) {
    return (
        <motion.tr 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
            <td className="px-8 py-5">
                <span className={`flex items-center justify-center h-8 w-8 rounded-lg font-black text-sm ${
                    rank <= 3 ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                    {rank}
                </span>
            </td>
            <td className="px-4 py-5">
                <Link href={`/user/${user.id}`} className="flex items-center gap-4 group/user">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white group-hover/user:scale-110 transition-transform">
                        {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white group-hover/user:text-indigo-400 transition-colors">{user.full_name}</p>
                        <p className="text-xs text-slate-500">@{user.username}</p>
                    </div>
                </Link>
            </td>
            <td className="px-4 py-5">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    {user.country || "Global"}
                </span>
            </td>
            <td className="px-4 py-5 text-right">
                <span className="text-lg font-black tracking-tight text-indigo-400">
                    {user.total_score?.toLocaleString() || 0}
                </span>
            </td>
            <td className="px-8 py-5 text-right">
                <Link href={`/user/${user.id}`} className="p-2 rounded-full hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-all inline-block">
                    <ChevronRight size={20} />
                </Link>
            </td>
        </motion.tr>
    );
}

function LeaderboardSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background p-4 md:p-8">
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

                <div className="h-[600px] bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800"></div>
            </div>
        </div>
    );
}