import { supabase } from "./supabase/client";

export type AdminUser = {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    role: string;
    plan: string;
    tier?: number;
    is_banned?: boolean;
    is_deleted?: boolean;
};

export type PlatformStats = {
    totalUsers: number;
    activeUsers24h: number;
    totalForgeRunsToday: number;
    totalAiRunsToday: number;
};

export async function fetchAllUsers(search?: string) {
    try {
        let query = supabase.from('profiles').select('*');

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data: profiles, error: profileError } = await query.order('id', { ascending: true });
        if (profileError) throw profileError;

        // Fetch related data separately to avoid join/relationship issues
        const [tierRes, modRes] = await Promise.all([
            supabase.from('user_tiers').select('user_id, tier'),
            supabase.from('user_moderation').select('user_id, is_banned, is_deleted')
        ]);

        const tierMap = new Map(tierRes.data?.map(t => [t.user_id, t.tier]) || []);
        const modMap = new Map(modRes.data?.map(m => [m.user_id, m]) || []);

        return (profiles || []).map(u => {
            const isSuper = u.role === 'super';
            const dbTier = tierMap.get(u.id);
            const moderation = modMap.get(u.id);
            
            return {
                ...u,
                tier: isSuper ? 3 : (dbTier || (u.plan === 'pro' ? 1 : 0)),
                is_banned: moderation?.is_banned || false,
                is_deleted: moderation?.is_deleted || false
            };
        }) as AdminUser[];
    } catch (err) {
        console.error("Error fetching users:", err);
        return [];
    }
}

export async function resetUserLimits(userId: string, type: 'forge' | 'ai' | 'both') {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    try {
        if (type === 'forge' || type === 'both') {
            const { error } = await supabase
                .from('forge_usage')
                .delete()
                .eq('user_id', userId)
                .gte('created_at', today.toISOString());
            if (error) throw error;
        }

        if (type === 'ai' || type === 'both') {
            const { error } = await supabase
                .from('ai_usage')
                .delete()
                .eq('user_id', userId)
                .gte('created_at', today.toISOString());
            if (error) throw error;
        }

        return { success: true };
    } catch (err) {
        console.error("Error resetting limits:", err);
        return { success: false, error: err };
    }
}

export async function updateUserModeration(userId: string, updates: { is_banned?: boolean, is_deleted?: boolean, ban_reason?: string }) {
    try {
        const { error } = await supabase
            .from('user_moderation')
            .upsert({
                user_id: userId,
                ...updates,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error("Error updating moderation:", err);
        return { success: false, error: err };
    }
}

export async function updateUserPlan(userId: string, plan: string, tier?: number) {
    try {
        // 1. Update profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ plan })
            .eq('id', userId);

        if (profileError) throw profileError;

        // 2. Update user_tiers table if plan is pro
        if (plan === 'pro' && tier !== undefined) {
            const { error: tierError } = await supabase
                .from('user_tiers')
                .upsert({
                    user_id: userId,
                    tier,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
            
            if (tierError) throw tierError;
        } else if (plan === 'free') {
            // Optional: remove tier entry or set to 0
            await supabase.from('user_tiers').delete().eq('user_id', userId);
        }

        return { success: true };
    } catch (err) {
        console.error("Error updating plan:", err);
        return { success: false, error: err };
    }
}

export async function updateUserRole(userId: string, role: string) {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', userId);

        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error("Error updating role:", err);
        return { success: false, error: err };
    }
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    try {
        const [
            { count: totalUsers },
            { count: activeUsers },
            { count: forgeRunsToday },
            { count: aiRunsToday }
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('forge_usage').select('user_id', { count: 'exact', head: true }).gte('created_at', yesterday.toISOString()), // Simplified active check
            supabase.from('forge_usage').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
            supabase.from('ai_usage').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString())
        ]);

        return {
            totalUsers: totalUsers || 0,
            activeUsers24h: activeUsers || 0,
            totalForgeRunsToday: forgeRunsToday || 0,
            totalAiRunsToday: aiRunsToday || 0
        };
    } catch (err) {
        console.error("Error fetching platform stats:", err);
        return {
            totalUsers: 0,
            activeUsers24h: 0,
            totalForgeRunsToday: 0,
            totalAiRunsToday: 0
        };
    }
}

export async function fetchSystemConfig(key: string) {
    try {
        const { data, error } = await supabase
            .from('system_config')
            .select('value')
            .eq('key', key)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data?.value || null;
    } catch (err) {
        console.error(`Error fetching config ${key}:`, err);
        return null;
    }
}

export async function updateSystemConfig(key: string, value: any) {
    try {
        const { error } = await supabase
            .from('system_config')
            .upsert({
                key,
                value,
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });

        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error(`Error updating config ${key}:`, err);
        return { success: false, error: err };
    }
}
