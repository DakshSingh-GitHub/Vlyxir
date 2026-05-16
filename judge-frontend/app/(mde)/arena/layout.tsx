import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Vlyxir Arena",
    description: "Solve algorithmic challenges and master competitive programming on the Vlyxir Code Judge platform.",
};

export default function CodeJudgeMdeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
