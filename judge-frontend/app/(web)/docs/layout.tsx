import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Documentation",
    description: "Learn how to use Vlyxir's Code Judge, AI analysis tools, and more. Master the platform with our comprehensive guides and documentation.",
};

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
