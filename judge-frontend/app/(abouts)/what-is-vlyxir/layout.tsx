import { Metadata } from "next";

export const metadata: Metadata = {
    title: "What is Vlyxir?",
    description: "Discover the vision behind Vlyxir—the elite ecosystem for mastering algorithms, preparing for FAANG interviews, and accelerating your software engineering career.",
};

export default function WhatIsVlyxirLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
