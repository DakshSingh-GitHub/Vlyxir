/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Layout, 
  Settings, 
  ShieldAlert, 
  Loader2,
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';
import { useAppContext } from '../../lib/auth/context';
import NotFound from '../../not-found';
import { supabase } from '@/app/lib/api/supabase/client';

type AdminTab = 'Users' | 'Platform' | 'Controls';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { isDark } = useAppContext();
  const [activeTab, setActiveTab] = useState<AdminTab>('Users');
  const [isVerifying, setIsVerifying] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    async function verifyAdmin() {
      if (isAuthLoading) return;
      
      if (!user) {
        setAccessDenied(true);
        setIsVerifying(false);
        return;
      }

      try {
        // Fetch the user's role from the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        console.log("Admin Verification - User ID:", user.id);
        console.log("Admin Verification - Data:", data);
        if (error) console.error("Admin Verification - Error:", error);

        if (error || data?.role !== 'super') {
          setAccessDenied(true);
        }
        setIsVerifying(false);
      } catch (err) {
        console.error("Verification error:", err);
        setAccessDenied(true);
        setIsVerifying(false);
      }
    }

    verifyAdmin();
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0B0C15]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-50" />
      </div>
    );
  }

  if (accessDenied) {
    return <NotFound />;
  }

  const tabs: { id: AdminTab; icon: any; label: string }[] = [
    { id: 'Users', icon: Users, label: 'Users' },
    { id: 'Platform', icon: Layout, label: 'Platform' },
    { id: 'Controls', icon: Settings, label: 'Controls' },
  ];

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-500 ${isDark ? "bg-[#0B0C15] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Pill-shaped Sidebar */}
      <aside className="relative flex w-24 flex-col items-center py-8 md:w-28">
        <div className={`flex h-[90%] w-16 flex-col items-center justify-between rounded-full border py-8 shadow-2xl backdrop-blur-xl md:w-20 ${isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white/50"}`}>
          <div className="flex flex-col items-center gap-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 shadow-lg shadow-indigo-600/20">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>

            <nav className="flex flex-col gap-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="group relative flex flex-col items-center gap-1 outline-none"
                    title={tab.label}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:bg-slate-500/10 hover:text-slate-300"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute -right-3 h-1 w-1 rounded-full bg-indigo-500"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <button
            onClick={() => router.push("/")}
            className="group flex h-12 w-12 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-rose-500/10 hover:text-rose-500"
            title="Exit Admin"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-10 md:px-12">
        <div className="mx-auto max-w-6xl">
          <header className="mb-12">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400"
              >
                <Sparkles className="h-3 w-3" />
                Management Console
              </motion.div>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl font-black tracking-tight md:text-5xl"
            >
              System <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-purple-500">{activeTab}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`mt-4 text-sm font-medium leading-relaxed md:text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Welcome back, Daksh. High-level controls for {activeTab.toLowerCase()} are active.
            </motion.p>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[60vh] rounded-[3rem] border border-slate-200/50 bg-white/50 p-8 shadow-sm backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/50 md:p-12"
            >
              {activeTab === 'Users' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <button className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all">
                      Create Insider
                    </button>
                  </div>
                  {/* User content will go here */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <PlaceholderCard title="Security Protocols" value="Active" />
                    <PlaceholderCard title="Total Accounts" value="482" />
                    <PlaceholderCard title="Pending Verifications" value="12" />
                  </div>
                </div>
              )}

              {activeTab === 'Platform' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold">Platform Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <PlaceholderCard title="CPU Load" value="12%" />
                    <PlaceholderCard title="Memory" value="4.2GB" />
                    <PlaceholderCard title="Network" value="Optimal" />
                    <PlaceholderCard title="Uptime" value="99.9%" />
                  </div>
                </div>
              )}

              {activeTab === 'Controls' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold">System Controls</h2>
                  <div className="space-y-4">
                    <ControlToggle label="Maintenance Mode" description="Disable all public submissions and code execution." />
                    <ControlToggle label="Global Logs" description="Enable verbose system-wide audit logging." />
                    <ControlToggle label="Insider Access" description="Allow registration of new administrative accounts." />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function PlaceholderCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200/50 bg-white/30 p-6 dark:border-slate-800/50 dark:bg-slate-800/30">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function ControlToggle({ label, description }: { label: string, description: string }) {
  const [active, setActive] = useState(false);
  return (
    <div className="flex items-center justify-between rounded-3xl border border-slate-200/50 bg-white/30 p-6 dark:border-slate-800/50 dark:bg-slate-800/30">
      <div>
        <p className="font-bold">{label}</p>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
      <button
        onClick={() => setActive(!active)}
        className={`relative h-6 w-12 rounded-full transition-colors duration-300 ${active ? "bg-indigo-600" : "bg-slate-700"}`}
      >
        <motion.div
          animate={{ x: active ? 26 : 4 }}
          className="h-4 w-4 rounded-full bg-white shadow-md"
        />
      </button>
    </div>
  );
}
