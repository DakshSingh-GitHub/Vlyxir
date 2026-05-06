import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Community Forum",
    description: "The official Vlyxir forum for algorithmic discussions, problem-solving tips, and community engagement.",
};

export default function ForumLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
