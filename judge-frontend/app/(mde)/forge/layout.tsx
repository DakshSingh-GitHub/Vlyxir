import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Vlyxir Forge",
    description: "A fast, integrated development environment for Python prototyping and experimentation.",
};

export default function CodeIdeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
