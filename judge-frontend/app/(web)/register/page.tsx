import { Suspense } from "react";
import AuthForm from "../../../components/Auth/AuthForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <AuthForm mode="register" />
    </Suspense>
  );
}
