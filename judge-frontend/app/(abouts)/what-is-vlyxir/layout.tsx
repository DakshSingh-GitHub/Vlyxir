import { Metadata } from "next";

export const metadata: Metadata = {
    title: "What is Vlyxir?",
    description: "Learn about the mission and vision of Vlyxir—the intelligent frontier of competitive coding. Built for the next generation of developers.",
};

export default function WhatIsVlyxirLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
