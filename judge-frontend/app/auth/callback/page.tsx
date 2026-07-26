"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/api/supabase/client";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        const search = typeof window !== "undefined" ? window.location.search : "";
        const paramString = hash ? hash.substring(1) : search ? search.substring(1) : "";
        const params = new URLSearchParams(paramString);

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          // Set Supabase session in current browser
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          // Trigger deep-link to Vlyxir Desktop App
          const deepLinkUrl = `vlyxir://auth/callback#access_token=${accessToken}&refresh_token=${refreshToken}`;
          setStatus("Redirecting to Vlyxir Desktop App...");
          
          // Attempt deep link navigation
          window.location.href = deepLinkUrl;

          // Fallback redirect to home in web browser after 1.5 seconds
          setTimeout(() => {
            router.replace("/");
          }, 1500);
        } else {
          // Fallback session check
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const deepLinkUrl = `vlyxir://auth/callback#access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
            window.location.href = deepLinkUrl;
          }
          setTimeout(() => {
            router.replace("/");
          }, 1200);
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        router.replace("/");
      }
    }

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 mb-6 animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
      </div>
      <h1 className="text-2xl font-black tracking-tight mb-2">Authenticating with Vlyxir</h1>
      <p className="text-sm text-slate-400 max-w-sm">{status}</p>
    </div>
  );
}
