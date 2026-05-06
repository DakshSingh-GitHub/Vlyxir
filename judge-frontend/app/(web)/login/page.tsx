import { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "../../../components/Auth/AuthForm";

export const metadata: Metadata = {
    title: "Login",
    description: "Access your Vlyxir account to solve problems, track your progress, and join the community of top-tier developers.",
};

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
            <AuthForm mode="login" />
        </Suspense>
    );
}
