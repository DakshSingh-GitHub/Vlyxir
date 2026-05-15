import { supabase } from "./supabase/client";

export const FORGE_FREE_LIMIT = 10;
export const FORGE_PRO_TIER1_LIMIT = 25;
export const FORGE_PRO_TIER2_LIMIT = 40;
export const FORGE_PRO_TIER3_LIMIT = 100;

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
            return { allowed: true, role: 'user', plan: 'free', limit: FORGE_FREE_LIMIT };
        }

        const role = profile?.role || 'user';
        const plan = profile?.plan || 'free';

        // 2. If super, they are unlimited
        if (role === 'super') {
            return { allowed: true, role: 'super', plan, limit: Infinity };
        }

        // 3. Determine limit based on plan and tier
        let dailyLimit = FORGE_FREE_LIMIT;

        if (plan === 'pro') {
            const { data: tierData, error: tierError } = await supabase
                .from('user_tiers')
                .select('tier')
                .eq('user_id', userId)
                .single();

            if (tierError) {
                if (tierError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                    console.error("Error fetching user tier:", tierError);
                }
                dailyLimit = FORGE_PRO_TIER1_LIMIT; // Default to tier 1 for pro
            } else {
                const tier = tierData?.tier || 1;
                if (tier === 1) dailyLimit = FORGE_PRO_TIER1_LIMIT;
                else if (tier === 2) dailyLimit = FORGE_PRO_TIER2_LIMIT;
                else if (tier === 3) dailyLimit = FORGE_PRO_TIER3_LIMIT;
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
            return { allowed: true, role, plan, limit: dailyLimit };
        }

        const runCount = count || 0;
        if (runCount >= dailyLimit) {
            return { allowed: false, count: runCount, role, plan, limit: dailyLimit };
        }

        return { allowed: true, count: runCount, role, plan, limit: dailyLimit };
    } catch (err) {
        console.error("Unexpected error in checkForgeLimit:", err);
        return { allowed: true, role: 'user', plan: 'free', limit: FORGE_FREE_LIMIT };
    }
}

export async function recordForgeRun(userId: string) {
    try {
        await supabase.from('forge_usage').insert({ user_id: userId });
    } catch (err) {
        console.error("Error recording forge run:", err);
    }
}
