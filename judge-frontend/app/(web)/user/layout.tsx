import { Metadata } from "next";

export const metadata: Metadata = {
    title: "User Profile",
    description: "Explore developer profiles, coding statistics, and achievements on the Vlyxir platform.",
};

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
