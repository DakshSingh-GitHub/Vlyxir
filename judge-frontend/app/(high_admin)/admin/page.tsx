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
  Sparkles,
  Search,
  ArrowUpRight,
  UserCheck,
  Activity,
  Cpu,
  Zap,
  Brain,
  ExternalLink,
  RefreshCcw
} from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';
import { useAppContext } from '../../lib/auth/context';
import NotFound from '../../not-found';
import { supabase } from '@/app/lib/api/supabase/client';
import { 
  AdminUser, 
  PlatformStats, 
  fetchAllUsers, 
  fetchPlatformStats, 
  fetchSystemConfig, 
  updateSystemConfig 
} from '@/app/lib/api/admin';
import UserManagementModal from './components/UserManagementModal';

type AdminTab = 'Users' | 'Platform' | 'Controls';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { isDark } = useAppContext();
  const [activeTab, setActiveTab] = useState<AdminTab>('Users');
  const [isVerifying, setIsVerifying] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Data State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  
  // System Config State
  const [configs, setConfigs] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    async function verifyAdmin() {
      if (isAuthLoading) return;
      if (!user) { setAccessDenied(true); setIsVerifying(false); return; }

      try {
        const { data, error } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (error || data?.role !== 'super') {
          setAccessDenied(true);
        } else {
          loadInitialData();
        }
        setIsVerifying(false);
      } catch (err) {
        setAccessDenied(true);
        setIsVerifying(false);
      }
    }
    verifyAdmin();
  }, [user, isAuthLoading]);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    const [userData, statData, maintenance] = await Promise.all([
      fetchAllUsers(),
      fetchPlatformStats(),
      fetchSystemConfig('maintenance_mode')
    ]);
    setUsers(userData);
    setStats(statData);
    setConfigs({ maintenance_mode: maintenance === 'true' });
    setIsLoadingData(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    const data = await fetchAllUsers(query);
    setUsers(data);
  };

  const toggleConfig = async (key: string) => {
    const newValue = !configs[key];
    const res = await updateSystemConfig(key, newValue.toString());
    if (res.success) {
      setConfigs(prev => ({ ...prev, [key]: newValue }));
    }
  };

  if (isAuthLoading || isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0B0C15]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-50" />
      </div>
    );
  }

  if (accessDenied) return <NotFound />;

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
                      <motion.div layoutId="activeTabPill" className="absolute -right-3 h-1 w-1 rounded-full bg-indigo-500" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          <button onClick={() => router.push("/")} className="group flex h-12 w-12 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-rose-500/10 hover:text-rose-500" title="Exit Admin">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-10 md:px-12">
        <div className="mx-auto max-w-6xl">
          <header className="mb-12 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                  <Sparkles className="h-3 w-3" /> Management Console
                </motion.div>
              </div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                System <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-purple-500">{activeTab}</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className={`mt-4 text-sm font-medium leading-relaxed md:text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Welcome back, Daksh. Platform orchestration tools for {activeTab.toLowerCase()} are online.
              </motion.p>
            </div>
            <button onClick={loadInitialData} className="mb-4 rounded-2xl bg-slate-800/50 p-4 text-slate-400 hover:text-indigo-400 transition-all border border-slate-800/50">
              <RefreshCcw className={`h-5 w-5 ${isLoadingData ? 'animate-spin' : ''}`} />
            </button>
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
                  <div className="flex items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Search users by name or email..." 
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900/30 py-4 pl-12 pr-4 text-sm outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-500">
                      <span>Total: {users.length}</span>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-3xl border border-slate-800/50">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        <tr>
                          <th className="px-6 py-4">User Identity</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Plan</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {users.map((u) => (
                          <tr 
                            key={u.id} 
                            onClick={() => setSelectedUser(u)}
                            className="group cursor-pointer hover:bg-indigo-500/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
                                  {u.avatar_url ? <img src={u.avatar_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-500">{u.full_name?.[0] || '?'}</div>}
                                </div>
                                <div>
                                  <p className="text-sm font-bold">{u.full_name || 'Anonymous'}</p>
                                  <p className="text-xs text-slate-500">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest ${u.is_banned ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                {u.is_banned ? 'Restricted' : 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-bold ${u.plan === 'pro' ? 'text-purple-400' : 'text-slate-500'}`}>
                                {u.plan.toUpperCase()} {u.plan === 'pro' && `(T${u.tier})`}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="rounded-lg p-2 text-slate-500 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                                <ArrowUpRight className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {users.length === 0 && (
                      <div className="py-20 text-center text-slate-500 font-medium italic">No users found matching your query.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'Platform' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Citizens" value={stats?.totalUsers || 0} icon={UserCheck} color="indigo" />
                    <StatCard title="Active Pulse (24h)" value={stats?.activeUsers24h || 0} icon={Activity} color="emerald" />
                    <StatCard title="Forge Throughput" value={stats?.totalForgeRunsToday || 0} icon={Zap} color="orange" />
                    <StatCard title="Intelligence Cycles" value={stats?.totalAiRunsToday || 0} icon={Brain} color="purple" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-[2.5rem] border border-slate-800 bg-slate-900/30 p-8">
                      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-indigo-400" /> Infrastructure Status
                      </h3>
                      <div className="space-y-6">
                        <SystemProgress label="Compute Nodes" value={12} total={100} color="indigo" />
                        <SystemProgress label="Memory Grid" value={4.2} total={16} color="purple" />
                        <SystemProgress label="Network Latency" value={18} total={100} color="emerald" suffix="ms" />
                      </div>
                    </div>
                    <div className="rounded-[2.5rem] border border-slate-800 bg-slate-900/30 p-8 flex flex-col justify-center items-center text-center">
                      <ShieldAlert className="h-12 w-12 text-indigo-500 mb-4 opacity-50" />
                      <p className="text-slate-400 font-medium max-w-xs">All systems are currently performing within optimal range. No critical alerts detected.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Controls' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold">System Overrides</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <ControlToggle 
                      label="Maintenance Mode" 
                      description="Disable all public submissions and code execution across the platform." 
                      active={configs.maintenance_mode}
                      onToggle={() => toggleConfig('maintenance_mode')}
                    />
                    <ControlToggle label="Global Logs" description="Enable verbose system-wide audit logging for debugging." />
                    <ControlToggle label="Insider Access" description="Allow registration of new administrative and super accounts." />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedUser && (
          <UserManagementModal 
            user={selectedUser} 
            isOpen={!!selectedUser} 
            onClose={() => setSelectedUser(null)} 
            onUpdate={loadInitialData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number | string, icon: any, color: string }) {
  const colors: any = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };
  return (
    <div className={`rounded-3xl border p-6 ${colors[color] || colors.indigo}`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-6 w-6" />
        <ArrowUpRight className="h-4 w-4 opacity-30" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{title}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}

function SystemProgress({ label, value, total, color, suffix = "" }: { label: string, value: number, total: number, color: string, suffix?: string }) {
  const percent = Math.min(100, (value / total) * 100);
  const colors: any = {
    indigo: "bg-indigo-500 shadow-indigo-500/20",
    purple: "bg-purple-500 shadow-purple-500/20",
    emerald: "bg-emerald-500 shadow-emerald-500/20",
  };
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
        <span>{label}</span>
        <span>{value}{suffix} / {total}{suffix}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full rounded-full shadow-lg ${colors[color]}`}
        />
      </div>
    </div>
  );
}

function ControlToggle({ label, description, active: propActive, onToggle }: { label: string, description: string, active?: boolean, onToggle?: () => void }) {
  const [internalActive, setInternalActive] = useState(false);
  const active = propActive !== undefined ? propActive : internalActive;
  
  const handleToggle = () => {
    if (onToggle) onToggle();
    else setInternalActive(!internalActive);
  };

  return (
    <div className="flex items-center justify-between rounded-[2.5rem] border border-slate-800 bg-slate-900/30 p-8 transition-all hover:bg-slate-800/40">
      <div>
        <p className="text-lg font-bold">{label}</p>
        <p className="text-xs text-slate-500 mt-1 max-w-md">{description}</p>
      </div>
      <button
        onClick={handleToggle}
        className={`relative h-8 w-16 rounded-full transition-colors duration-300 ${active ? "bg-indigo-600" : "bg-slate-700"}`}
      >
        <motion.div
          animate={{ x: active ? 36 : 4 }}
          className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md"
        />
      </button>
    </div>
  );
}
