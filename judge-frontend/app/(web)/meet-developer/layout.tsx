import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Meet the Developer",
    description: "Discover the story behind Vlyxir and meet Daksh Singh, the developer and architect of the platform.",
};

export default function MeetDeveloperLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
