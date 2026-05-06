import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Vlyxir Insights",
    description: "Optimize your code with AI-powered insights. Identify security risks, complexity bottlenecks, and logic issues instantly.",
};

export default function CodeAnalysisLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
