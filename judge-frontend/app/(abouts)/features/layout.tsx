import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Platform Features",
    description: "Explore the advanced technical capabilities of Vlyxir, from AI-powered code analysis to our high-performance automated judge system.",
};

export default function FeaturesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
