import { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "../../../components/Auth/AuthForm";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Join the Vlyxir community and start your journey to mastering algorithms and data structures.",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <AuthForm mode="register" />
    </Suspense>
  );
}
