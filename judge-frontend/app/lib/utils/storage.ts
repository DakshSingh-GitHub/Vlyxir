/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "../types/types";
import { supabase } from "../api/supabase/client";

export interface Submission {
    id: string;
    user_id?: string;
    problemId: string;
    problemTitle: string;
    code: string;
    final_status: string;
    summary: {
        passed: number;
        total: number;
    };
    total_duration: number;
    timestamp: number;
    created_at?: string;
}

export interface SystemLog {
    id: string;
    timestamp: number;
    status: 'SUCCESS' | 'WARNING' | 'ERROR';
    details: string;
    type: 'AUDIT' | 'SYSTEM' | 'SECURITY';
}

const USERS_STORAGE_KEY = "code_judge_users";

type SubmissionRow = {
    id: string;
    user_id: string;
    problem_id: string;
    problem_title: string;
    code: string;
    final_status: string;
    passed: number;
    total: number;
    total_duration: number | string | null;
    created_at: string;
};

function mapSubmissionRow(row: SubmissionRow): Submission {
    return {
        id: row.id,
        user_id: row.user_id,
        problemId: row.problem_id,
        problemTitle: row.problem_title,
        code: row.code,
        final_status: row.final_status,
        summary: {
            passed: Number(row.passed ?? 0),
            total: Number(row.total ?? 0),
        },
        total_duration: Number(row.total_duration ?? 0),
        timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
        created_at: row.created_at,
    };
}

async function getCurrentUserId(): Promise<string | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        console.error("Failed to read Supabase auth user", error);
        return null;
    }
    return data.user?.id ?? null;
}

export function getUsers(): User[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) {
        // Initialize with root user
        const rootUser: User = {
            id: 'root-daksh',
            username: 'daksh',
            password: 'daksh@codejudge',
            permissions: ['DOCS_INT', 'ADMIN_VIEW', 'ADMIN_EDIT'],
            isRoot: true,
            createdAt: Date.now()
        };
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([rootUser]));
        return [rootUser];
    }
    return JSON.parse(stored);
}

export function saveUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = getUsers();
    const newUser: User = {
        ...user,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now()
    };
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    // Protection: root user cannot lose ADMIN_EDIT or be modified in some ways
    if (users[index].isRoot) {
        updates.isRoot = true;
        if (updates.permissions) {
            updates.permissions = ['DOCS_INT', 'ADMIN_VIEW', 'ADMIN_EDIT'];
        }
    }

    users[index] = { ...users[index], ...updates };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return users[index];
}

export function deleteUser(id: string): boolean {
    const users = getUsers();
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete || userToDelete.isRoot) return false;

    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
}

export async function saveSubmission(submission: {
    problemId: string;
    problemTitle: string;
    code: string;
    final_status: string;
    summary: { passed: number; total: number };
    total_duration: number | undefined
}): Promise<Submission | null> {
    if (typeof window === "undefined") return null;

    const userId = await getCurrentUserId();
    if (!userId) return null;

    const existing = await getSubmissionsByProblemId(submission.problemId);
    if (existing.some(s => s.code === submission.code)) return null;

    const payload = {
        user_id: userId,
        problem_id: submission.problemId,
        problem_title: submission.problemTitle,
        code: submission.code,
        final_status: submission.final_status,
        passed: submission.summary.passed,
        total: submission.summary.total,
        total_duration: submission.total_duration ?? 0,
    };

    const { data, error } = await supabase
        .from("submissions")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        console.error("Failed to save submission", error);
        throw error;
    }

    // Award +20XP instead of +10XP if solving today's Daily Problem
    // Run after successful insert so database triggers have finished executing
    if (submission.final_status === "Accepted") {
        try {
            const today = new Date();
            const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            const { data: dailyData } = await supabase
                .from("daily_questions")
                .select("problem_id")
                .eq("date", todayString)
                .maybeSingle();

            const dailyProblemId = dailyData?.problem_id;

            if (dailyProblemId && dailyProblemId === submission.problemId) {
                const { data: userSubs, error: subsError } = await supabase
                    .from("submissions")
                    .select("created_at")
                    .eq("user_id", userId)
                    .eq("problem_id", submission.problemId)
                    .eq("final_status", "Accepted");

                if (!subsError && userSubs) {
                    const startOfToday = new Date();
                    startOfToday.setHours(0, 0, 0, 0);

                    // Count how many accepted submissions we have since midnight today
                    const subsToday = userSubs.filter((sub: any) => {
                        const subDate = new Date(sub.created_at);
                        return subDate >= startOfToday;
                    });

                    // If the count today is exactly 1, this is our first successful solve today!
                    if (subsToday.length === 1) {
                        // Check if they have solved this in the past (before today)
                        const solvedInPast = userSubs.some((sub: any) => {
                            const subDate = new Date(sub.created_at);
                            return subDate < startOfToday;
                        });

                        const { data: profile, error: profileErr } = await supabase
                            .from("profiles")
                            .select("total_score")
                            .eq("id", userId)
                            .single();

                        if (profile && !profileErr) {
                            // If solved in past, the auto trigger won't run, so we add full +20.
                            // If never solved before, auto trigger will add +10, so we add extra +10.
                            const bonus = solvedInPast ? 20 : 10;
                            const currentScore = profile.total_score || 0;
                            const newScore = currentScore + bonus;

                            const { error: updateErr } = await supabase
                                .from("profiles")
                                .update({ total_score: newScore })
                                .eq("id", userId);

                            if (!updateErr) {
                                console.log(`[Daily Challenge] Successfully awarded +${bonus} XP! New score: ${newScore}`);
                                
                                // Custom event to notify components to refresh the score
                                if (typeof window !== "undefined") {
                                    window.dispatchEvent(new CustomEvent("daily-score-updated"));
                                }
                            } else {
                                console.error("[Daily Challenge] Failed to sync user score:", updateErr);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error("[Daily Challenge] Error updating score bonus:", err);
        }
    }

    return mapSubmissionRow(data as SubmissionRow);
}

export async function getSubmissions(): Promise<Submission[]> {
    if (typeof window === "undefined") return [];

    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        console.error("Failed to load submissions", error);
        throw error;
    }

    return (data as SubmissionRow[]).map(mapSubmissionRow);
}

export async function getSubmissionsByProblemId(problemId: string): Promise<Submission[]> {
    if (typeof window === "undefined") return [];

    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", userId)
        .eq("problem_id", problemId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to load submissions for problem", error);
        throw error;
    }

    return (data as SubmissionRow[]).map(mapSubmissionRow);
}

export async function deleteSubmission(id: string): Promise<void> {
    if (typeof window === "undefined") return;

    const userId = await getCurrentUserId();
    if (!userId) return;

    const { error } = await supabase
        .from("submissions")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

    if (error) {
        console.error("Failed to delete submission", error);
        throw error;
    }
}

// Admin Dashboard Persistence
export function setAdminStats(stats: any) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('admin_stats', JSON.stringify(stats));
    }
}

export function getAdminStats() {
    if (typeof window !== 'undefined') {
        const stats = localStorage.getItem('admin_stats');
        return stats ? JSON.parse(stats) : null;
    }
    return null;
}

export function setSystemConfig(config: any) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('system_config', JSON.stringify(config));
    }
}

export function getSystemConfig() {
    if (typeof window !== 'undefined') {
        const config = localStorage.getItem('system_config');
        return config ? JSON.parse(config) : {
            maintenanceMode: false,
            publicSubmissions: true,
            dynamicScaling: true,
            debugLogs: false
        };
    }
    return {
        maintenanceMode: false,
        publicSubmissions: true,
        dynamicScaling: true,
        debugLogs: false
    };
}

export function saveSystemLog(log: Omit<SystemLog, 'id' | 'timestamp'>) {
    if (typeof window === 'undefined') return;

    const logs = getSystemLogs();
    const newLog: SystemLog = {
        ...log,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
    };

    logs.unshift(newLog); // Add to beginning
    // Keep only last 100 logs
    if (logs.length > 100) logs.length = 100;

    localStorage.setItem('code_judge_system_logs', JSON.stringify(logs));
    return newLog;
}

export function getSystemLogs(): SystemLog[] {
    if (typeof window === 'undefined') return [];
    const logs = localStorage.getItem('code_judge_system_logs');
    return logs ? JSON.parse(logs) : [];
}

// ----------------------------------------------------------------------------
// Learner Arena Progress (Supabase)
// ----------------------------------------------------------------------------

export interface LearningProgress {
    topic_id: string;
    is_completed: boolean;
    is_bookmarked: boolean;
}

/**
 * Fetches the user's saved learning progress from Supabase.
 * Returns null if the user is not authenticated.
 */
export async function getLearningProgress(): Promise<LearningProgress[] | null> {
    if (typeof window === 'undefined') return null;

    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
        .from('user_learning_progress')
        .select('topic_id, is_completed, is_bookmarked')
        .eq('user_id', userId);

    if (error) {
        console.error("Failed to load learning progress from Supabase", error);
        return null;
    }

    return data as LearningProgress[];
}

/**
 * Upserts a topic's completion or bookmarked status in Supabase.
 */
export async function toggleTopicStatus(
    topicId: string,
    field: 'is_completed' | 'is_bookmarked',
    value: boolean
): Promise<void> {
    if (typeof window === 'undefined') return;

    const userId = await getCurrentUserId();
    if (!userId) return;

    // Supabase Upsert logic:
    // First we must attempt an update or fetch the existing row to see if we need to insert or update,
    // OR we can rely on a pure UPSERT if we know all values.
    // However, if we only know one field (e.g. `is_completed`), upserting might overwrite the other field to default.
    // Best approach: Fetch existing first, then Upsert.
    
    const { data: existing } = await supabase
        .from('user_learning_progress')
        .select('is_completed, is_bookmarked')
        .eq('user_id', userId)
        .eq('topic_id', topicId)
        .maybeSingle();

    const isCompleted = field === 'is_completed' ? value : (existing?.is_completed ?? false);
    const isBookmarked = field === 'is_bookmarked' ? value : (existing?.is_bookmarked ?? false);

    const { error } = await supabase
        .from('user_learning_progress')
        .upsert({
            user_id: userId,
            topic_id: topicId,
            is_completed: isCompleted,
            is_bookmarked: isBookmarked,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,topic_id'
        });

    if (error) {
        console.error(`Failed to update ${field} for topic ${topicId}`, error);
    }
}
