import { animate, stagger } from "animejs";

type LegacyAnimeParams = {
    targets: unknown;
    [key: string]: unknown;
};

// Compatibility wrapper for v3-style anime({ targets, ...options }) calls.
export const anime = ({ targets, ...options }: LegacyAnimeParams) =>
    animate(targets as Parameters<typeof animate>[0], options as Parameters<typeof animate>[1]);

export { stagger };
