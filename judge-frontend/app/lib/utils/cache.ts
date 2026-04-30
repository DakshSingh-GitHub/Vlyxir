/* eslint-disable @typescript-eslint/no-unused-vars */
import { Problem, LeaderboardUser } from "../types/types";

const PROBLEMS_CACHE_KEY = "code_judge_problems_cache";
const PROBLEM_DETAIL_PREFIX = "code_judge_problem_cache_";
const LEADERBOARD_CACHE_KEY = "code_judge_leaderboard_cache";

interface LeaderboardCacheData {
    users: LeaderboardUser[];
    stats: {
        totalUsers: number;
        totalPoints: number;
        avgScore: number;
    };
}

export function getCachedProblems(): { problems: Problem[] } | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(PROBLEMS_CACHE_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch (e) {
        return null;
    }
}

export function setCachedProblems(data: { problems: Problem[] }) {
    if (typeof window === "undefined") return;
    localStorage.setItem(PROBLEMS_CACHE_KEY, JSON.stringify(data));
}

export function getCachedProblemById(id: string): Problem | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(`${PROBLEM_DETAIL_PREFIX}${id}`);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch (e) {
        return null;
    }
}

export function setCachedProblemById(id: string, data: Problem) {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${PROBLEM_DETAIL_PREFIX}${id}`, JSON.stringify(data));
}

export function getCachedLeaderboard(): LeaderboardCacheData | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(LEADERBOARD_CACHE_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch (e) {
        return null;
    }
}

export function setCachedLeaderboard(data: LeaderboardCacheData) {
    if (typeof window === "undefined") return;
    localStorage.setItem(LEADERBOARD_CACHE_KEY, JSON.stringify(data));
}
