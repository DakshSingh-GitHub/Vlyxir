import { supabase } from "./supabase/client";

export const FORGE_DAILY_LIMIT = 10;

export async function checkForgeLimit(userId: string) {
    try {
        // 1. Get user role from profiles
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (profileError) {
            console.error("Error fetching profile role:", profileError);
            // Default to allowed if we can't fetch profile to avoid blocking users
            return { allowed: true, role: 'user' };
        }

        const role = profile?.role || 'user';

        // 2. If super, they are unlimited
        if (role === 'super') {
            return { allowed: true, role: 'super' };
        }

        // 3. Count today's runs (UTC)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        const { count, error } = await supabase
            .from('forge_usage')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', today.toISOString());

        if (error) {
            console.error("Error checking forge limit:", error);
            return { allowed: true, role }; // Allow on error
        }

        if (count !== null && count >= FORGE_DAILY_LIMIT) {
            return { allowed: false, count, role };
        }

        return { allowed: true, count: count || 0, role };
    } catch (err) {
        console.error("Unexpected error in checkForgeLimit:", err);
        return { allowed: true, role: 'user' };
    }
}

export async function recordForgeRun(userId: string) {
    try {
        await supabase.from('forge_usage').insert({ user_id: userId });
    } catch (err) {
        console.error("Error recording forge run:", err);
    }
}
