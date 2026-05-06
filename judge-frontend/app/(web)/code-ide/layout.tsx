import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Vlyxir Forge",
    description: "A versatile environment to think, prototype and build. Write code in multiple languages with professional-grade editor features.",
};

export default function CodeIdeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
