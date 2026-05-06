import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Global Leaderboard",
    description: "See where you stand among the best developers globally. Track rankings, scores, and accomplishments on the Vlyxir leaderboard.",
};

export default function LeaderboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
