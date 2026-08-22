import { supabase } from "./supabase/client";

export const FORGE_FREE_LIMIT = Infinity;
export const FORGE_PRO_TIER1_LIMIT = Infinity;
export const FORGE_PRO_TIER2_LIMIT = Infinity;
export const FORGE_PRO_TIER3_LIMIT = Infinity;

export const AI_FREE_LIMIT = 0;
export const AI_PRO_TIER1_LIMIT = 0;
export const AI_PRO_TIER2_LIMIT = 10;
export const AI_PRO_TIER3_LIMIT = 20;

export async function checkForgeLimit(userId: string) {
    try {
        // 1. Get user plan and role from profiles
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, plan')
            .eq('id', userId)
            .single();

        if (profileError) {
            console.error("Error fetching profile role/plan:", profileError);
            return { 
                allowed: true, 
                role: 'user', 
                plan: 'free', 
                tier: 0,
                limit: FORGE_FREE_LIMIT,
                aiLimit: AI_FREE_LIMIT 
            };
        }

        const role = profile?.role || 'user';
        const plan = profile?.plan || 'free';

        // 2. If super, they are unlimited
        if (role === 'super') {
            return { 
                allowed: true, 
                role: 'super', 
                plan, 
                tier: 3, 
                limit: Infinity, 
                aiLimit: Infinity 
            };
        }

        // 3. Determine limit based on plan and tier
        let dailyLimit = FORGE_FREE_LIMIT;
        let aiLimit = AI_FREE_LIMIT;
        let tier = 0;

        if (plan === 'pro') {
            const { data: tierData, error: tierError } = await supabase
                .from('user_tiers')
                .select('tier')
                .eq('user_id', userId)
                .single();

            if (tierError) {
                if (tierError.code !== 'PGRST116') {
                    console.error("Error fetching user tier:", tierError);
                }
                tier = 1; // Default to tier 1 for pro
                dailyLimit = FORGE_PRO_TIER1_LIMIT;
                aiLimit = AI_PRO_TIER1_LIMIT;
            } else {
                tier = tierData?.tier || 1;
                if (tier === 1) {
                    dailyLimit = FORGE_PRO_TIER1_LIMIT;
                    aiLimit = AI_PRO_TIER1_LIMIT;
                } else if (tier === 2) {
                    dailyLimit = FORGE_PRO_TIER2_LIMIT;
                    aiLimit = AI_PRO_TIER2_LIMIT;
                } else if (tier === 3) {
                    dailyLimit = FORGE_PRO_TIER3_LIMIT;
                    aiLimit = AI_PRO_TIER3_LIMIT;
                }
            }
        }

        // 4. Count today's runs (UTC)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        const { count, error } = await supabase
            .from('forge_usage')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', today.toISOString());

        if (error) {
            console.error("Error checking forge limit:", error);
            return { allowed: true, role, plan, tier, limit: dailyLimit, aiLimit };
        }

        const runCount = count || 0;
        if (dailyLimit !== Infinity && runCount >= dailyLimit) {
            return { allowed: false, count: runCount, role, plan, tier, limit: dailyLimit, aiLimit };
        }

        return { allowed: true, count: runCount, role, plan, tier, limit: dailyLimit, aiLimit };
    } catch (err) {
        console.error("Unexpected error in checkForgeLimit:", err);
        return { allowed: true, role: 'user', plan: 'free', tier: 0, limit: FORGE_FREE_LIMIT, aiLimit: AI_FREE_LIMIT };
    }
}

export async function checkAiLimit(userId: string) {
    try {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, plan')
            .eq('id', userId)
            .single();

        if (profileError) return { allowed: false, limit: 0 };
        const role = profile?.role || 'user';
        const plan = profile?.plan || 'free';

        if (role === 'super') return { allowed: true, limit: Infinity };
        if (plan !== 'pro') return { allowed: false, limit: 0 };

        const { data: tierData } = await supabase
            .from('user_tiers')
            .select('tier')
            .eq('user_id', userId)
            .single();

        const tier = tierData?.tier || 1;
        let limit = 0;
        if (tier === 2) limit = AI_PRO_TIER2_LIMIT;
        else if (tier === 3) limit = AI_PRO_TIER3_LIMIT;

        if (limit === 0) return { allowed: false, limit: 0 };

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const { count, error } = await supabase
            .from('ai_usage')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', today.toISOString());

        if (error) return { allowed: true, limit };

        return { 
            allowed: (count || 0) < limit, 
            count: count || 0, 
            limit 
        };
    } catch (err) {
        return { allowed: false, limit: 0 };
    }
}

export async function recordForgeRun(userId: string) {
    try {
        await supabase.from('forge_usage').insert({ user_id: userId });
    } catch (err) {
        console.error("Error recording forge run:", err);
    }
}

export async function recordAiRun(userId: string) {
    try {
        await supabase.from('ai_usage').insert({ user_id: userId });
    } catch (err) {
        console.error("Error recording AI run:", err);
    }
}
