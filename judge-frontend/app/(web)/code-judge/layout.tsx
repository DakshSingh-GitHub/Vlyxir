import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Vlyxir Arena",
    description: "Solve challenging algorithmic problems in an integrated IDE. Test your code against various test cases and improve your problem-solving skills on Vlyxir.",
};

export default function CodeJudgeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
