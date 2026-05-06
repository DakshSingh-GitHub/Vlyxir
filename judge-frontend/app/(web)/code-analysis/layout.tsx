import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Vlyxir Insights",
    description: "Analyse your code, learn its strengths and weaknesses, and improve your programming logic with deep insights.",
};

export default function CodeAnalysisLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
