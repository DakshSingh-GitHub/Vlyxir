"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Shield, 
  User, 
  Mail, 
  Calendar, 
  Zap, 
  Brain, 
  Ban, 
  Trash2, 
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Crown,
  Trophy
} from 'lucide-react';
import { AdminUser, updateUserPlan, updateUserRole, updateUserModeration, resetUserLimits, updateLeaderboardStatus } from '@/app/lib/api/admin';
import { supabase } from '@/app/lib/api/supabase/client';

interface UserManagementModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function UserManagementModal({ user, isOpen, onClose, onUpdate }: UserManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'subscription' | 'limits' | 'moderation' | 'leaderboard'>('details');
  const [plan, setPlan] = useState(user.plan);
  const [tier, setTier] = useState(user.tier || 1);
  const [role, setRole] = useState(user.role);
  const [isBanned, setIsBanned] = useState(user.is_banned || false);
  const [banReason, setBanReason] = useState('');
  const [isLeaderboardEnabled, setIsLeaderboardEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Reset state when user changes
  useEffect(() => {
    setPlan(user.plan);
    setTier(user.tier || 1);
    setRole(user.role);
    setIsBanned(user.is_banned || false);
    setMessage(null);

    // Fetch leaderboard status
    supabase.from('leaderboard_settings').select('is_enabled').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      setIsLeaderboardEnabled(data?.is_enabled ?? true);
    });
  }, [user]);

  const handleSavePlan = async () => {
    setIsSaving(true);
    const res = await updateUserPlan(user.id, plan, tier);
    if (res.success) {
      setMessage({ type: 'success', text: 'Subscription updated successfully' });
      onUpdate();
    } else {
      setMessage({ type: 'error', text: 'Failed to update subscription' });
    }
    setIsSaving(false);
  };

  const handleSaveRole = async () => {
    setIsSaving(true);
    const res = await updateUserRole(user.id, role);
    if (res.success) {
      setMessage({ type: 'success', text: 'User role updated' });
      onUpdate();
    } else {
      setMessage({ type: 'error', text: 'Failed to update role' });
    }
    setIsSaving(false);
  };

  const handleResetLimit = async (type: 'forge' | 'ai') => {
    setIsSaving(true);
    const res = await resetUserLimits(user.id, type);
    if (res.success) {
      setMessage({ type: 'success', text: `${type === 'forge' ? 'Forge' : 'AI'} limits reset` });
    } else {
      setMessage({ type: 'error', text: 'Failed to reset limits' });
    }
    setIsSaving(false);
  };

  const handleModeration = async () => {
    setIsSaving(true);
    const res = await updateUserModeration(user.id, { is_banned: !isBanned, ban_reason: banReason });
    if (res.success) {
      setIsBanned(!isBanned);
      setMessage({ type: 'success', text: isBanned ? 'User unbanned' : 'User banned' });
      onUpdate();
    } else {
      setMessage({ type: 'error', text: 'Moderation action failed' });
    }
    setIsSaving(false);
  };

  const handleLeaderboardUpdate = async () => {
    setIsSaving(true);
    const res = await updateLeaderboardStatus(user.id, !isLeaderboardEnabled);
    if (res.success) {
      setIsLeaderboardEnabled(!isLeaderboardEnabled);
      setMessage({ type: 'success', text: !isLeaderboardEnabled ? 'Added to leaderboard' : 'Removed from leaderboard' });
    } else {
      setMessage({ type: 'error', text: 'Leaderboard update failed' });
    }
    setIsSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0B0C15]/80 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-7xl h-[650px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0D0F1A] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex"
      >
        {/* Sidebar */}
        <div className="w-[300px] border-r border-white/5 flex flex-col bg-[#111425]/50 backdrop-blur-sm">
          {/* Sidebar Header: User Info */}
          <div className="p-8 border-b border-white/5">
            <div className="relative mb-6">
              <div className="h-20 w-20 overflow-hidden rounded-3xl border-2 border-indigo-500/30 bg-slate-800 shadow-2xl shadow-indigo-500/20">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
                    <User className="h-10 w-10 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 rounded-full bg-[#0D0F1A] p-1">
                <div className={`h-4 w-4 rounded-full border-2 border-[#0D0F1A] ${user.is_banned ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              </div>
            </div>
            
            <h3 className="text-xl font-black tracking-tight text-white mb-1 line-clamp-1">{user.full_name || 'Anonymous User'}</h3>
            <p className="text-slate-400 text-xs font-medium truncate mb-4">{user.email}</p>

            <div className="flex flex-wrap gap-2">
              <span className={`rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest ${user.role === 'super' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                {user.role}
              </span>
              <span className={`rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest ${user.plan === 'pro' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                {user.plan} {user.plan === 'pro' && `T${user.tier}`}
              </span>
            </div>
          </div>

          {/* Sidebar Nav */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {[
              { id: 'details', label: 'Identity', icon: Shield, color: 'text-blue-400' },
              { id: 'subscription', label: 'Subscription', icon: Crown, color: 'text-purple-400' },
              { id: 'limits', label: 'Usage', icon: Zap, color: 'text-amber-400' },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-indigo-400' },
              { id: 'moderation', label: 'Control', icon: Ban, color: 'text-rose-400' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent'
                }`}
              >
                <tab.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${activeTab === tab.id ? tab.color : 'text-slate-500'}`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-white/5">
            <button 
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-500"
            >
              <X className="h-4 w-4" /> Close Session
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          {/* Tab Header */}
          <div className="px-10 py-8 flex items-center justify-between">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
              {activeTab === 'details' && 'User Identity'}
              {activeTab === 'subscription' && 'Plan Management'}
              {activeTab === 'limits' && 'Resource Usage'}
              {activeTab === 'leaderboard' && 'Leaderboard Control'}
              {activeTab === 'moderation' && 'Account Control'}
            </h2>
          </div>

          {/* Content Scroll Area */}
          <div className="flex-1 overflow-y-auto px-10 pb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === 'details' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="group rounded-[2rem] border border-white/5 bg-white/5 p-8 transition-all hover:border-indigo-500/30 hover:bg-white/[0.07]">
                        <div className="flex items-center gap-3 text-slate-500 mb-6">
                          <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400">
                            <Shield className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest">Administrative Role</span>
                        </div>
                        <div className="relative">
                          <select 
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full appearance-none bg-transparent text-2xl font-black text-white outline-none cursor-pointer"
                          >
                            <option value="user" className="bg-[#161827]">Standard Platform User</option>
                            <option value="super" className="bg-[#161827]">Super Administrative Access</option>
                          </select>
                          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500 pointer-events-none transition-transform group-hover:text-indigo-400" />
                        </div>
                        <p className="mt-4 text-xs text-slate-500 font-medium">Controls access to administrative dashboards and system-wide configurations.</p>
                      </div>

                      <div className="rounded-[2rem] border border-white/5 bg-white/5 p-8">
                        <div className="flex items-center gap-3 text-slate-500 mb-6">
                          <div className="rounded-xl bg-slate-500/10 p-2 text-slate-400">
                            <Mail className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest">Internal Identifier</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-lg text-slate-200">{user.id}</p>
                          <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">Copy ID</button>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleSaveRole}
                      disabled={isSaving}
                      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-indigo-600 py-6 font-black uppercase tracking-widest text-white shadow-[0_20px_40px_-12px_rgba(79,70,229,0.4)] transition-all hover:bg-indigo-500 hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.5)] active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <><Save className="h-5 w-5 transition-transform group-hover:scale-110" /> Commit Identity Changes</>
                      )}
                    </button>
                  </div>
                )}

                {activeTab === 'subscription' && (
                  <div className="space-y-8">
                    <div className="rounded-[2rem] border border-white/5 bg-white/5 p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400">
                          <Crown className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Tier Configuration</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {['free', 'pro'].map((p) => (
                          <button
                            key={p}
                            onClick={() => setPlan(p)}
                            className={`relative flex flex-col gap-2 rounded-2xl border p-6 text-left transition-all ${
                              plan === p 
                                ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-[0_0_30px_rgba(99,102,241,0.15)]' 
                                : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/20'
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest">Base Tier</span>
                            <span className="text-xl font-black uppercase italic">{p}</span>
                            {plan === p && <CheckCircle2 className="absolute top-6 right-6 h-5 w-5 text-indigo-400" />}
                          </button>
                        ))}
                      </div>

                      {plan === 'pro' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-8 space-y-4"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intelligence Level</span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3].map((t) => (
                              <button
                                key={t}
                                onClick={() => setTier(t)}
                                className={`rounded-xl border py-4 text-xs font-black transition-all ${
                                  tier === t 
                                    ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)]' 
                                    : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'
                                }`}
                              >
                                TIER {t}
                              </button>
                            ))}
                          </div>
                          <div className="rounded-xl bg-white/5 p-4 text-[10px] text-slate-400 font-medium leading-relaxed">
                            <span className="text-white font-bold">Tier 1:</span> Base Pro Features • <span className="text-white font-bold">Tier 2:</span> Deep Code Analysis • <span className="text-white font-bold">Tier 3:</span> Ultimate Forge Intelligence
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <button 
                      onClick={handleSavePlan}
                      disabled={isSaving}
                      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-6 font-black uppercase tracking-widest text-white shadow-[0_20px_40px_-12px_rgba(79,70,229,0.4)] transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <><Zap className="h-5 w-5 transition-transform group-hover:rotate-12" /> Sync Subscription State</>
                      )}
                    </button>
                  </div>
                )}

                {activeTab === 'limits' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="group flex items-center justify-between rounded-[2rem] border border-white/5 bg-white/5 p-8 transition-all hover:border-orange-500/30">
                        <div className="flex items-center gap-6">
                          <div className="rounded-2xl bg-orange-500/10 p-5 text-orange-500 transition-transform group-hover:scale-110">
                            <Zap className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-lg font-black text-white uppercase tracking-tight">Vlyxir Forge</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">Daily code execution and compiler runtime quota</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleResetLimit('forge')}
                          disabled={isSaving}
                          className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-orange-500 hover:text-white hover:border-orange-400 hover:shadow-[0_10px_20px_rgba(249,115,22,0.2)]"
                        >
                          Reset Quota
                        </button>
                      </div>

                      <div className="group flex items-center justify-between rounded-[2rem] border border-white/5 bg-white/5 p-8 transition-all hover:border-indigo-500/30">
                        <div className="flex items-center gap-6">
                          <div className="rounded-2xl bg-indigo-500/10 p-5 text-indigo-400 transition-transform group-hover:scale-110">
                            <Brain className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-lg font-black text-white uppercase tracking-tight">AI Insights</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">Intelligent code analysis and deep review limits</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleResetLimit('ai')}
                          disabled={isSaving}
                          className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-500 hover:text-white hover:border-indigo-400 hover:shadow-[0_10px_20px_rgba(99,102,241,0.2)]"
                        >
                          Reset Quota
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'leaderboard' && (
                  <div className="space-y-8">
                    <div className="rounded-[2rem] border border-white/5 bg-white/5 p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="rounded-2xl bg-indigo-500/10 p-4 text-indigo-400">
                            <Trophy className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">Leaderboard Standing</h4>
                            <p className="text-xs font-medium text-slate-500 mt-1">Manually override user visibility on public rankings.</p>
                          </div>
                        </div>
                        <button 
                          onClick={handleLeaderboardUpdate}
                          disabled={isSaving}
                          className={`rounded-2xl px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                            isLeaderboardEnabled 
                              ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_15px_30px_rgba(79,70,229,0.3)]'
                          }`}
                        >
                          {isLeaderboardEnabled ? 'Remove from Leaderboard' : 'Add to Leaderboard'}
                        </button>
                      </div>

                      <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/10 p-6 flex items-start gap-4">
                        <div className="mt-1 rounded-full bg-indigo-500/20 p-1">
                          <AlertTriangle className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">Admin Override Active</p>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Executing this action will bypass the 24-hour cooldown restriction normally applied to users. 
                            The change is instantaneous and will clear any existing wait timers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'moderation' && (
                  <div className="space-y-6">
                    <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/[0.02] p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="rounded-2xl bg-rose-500/10 p-4 text-rose-500">
                            <Ban className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">System Restriction</h4>
                            <p className="text-xs font-medium text-slate-500 mt-1">Suspend user access to all platform resources.</p>
                          </div>
                        </div>
                        <button 
                          onClick={handleModeration}
                          disabled={isSaving}
                          className={`rounded-2xl px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                            isBanned 
                              ? 'bg-white/10 text-white hover:bg-white/20' 
                              : 'bg-rose-600 text-white hover:bg-rose-500 shadow-[0_15px_30px_rgba(225,29,72,0.3)]'
                          }`}
                        >
                          {isBanned ? 'Lift Suspension' : 'Enforce Ban'}
                        </button>
                      </div>
                      {!isBanned && (
                        <div className="relative">
                          <textarea
                            placeholder="State the internal reason for this restriction..."
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            className="w-full rounded-[1.5rem] border border-white/5 bg-black/20 p-6 text-sm font-medium text-slate-300 outline-none transition-all focus:border-rose-500/30 focus:bg-black/40 min-h-[120px] resize-none"
                          />
                          <div className="absolute top-4 right-6 text-[10px] font-black uppercase tracking-widest text-slate-600">Ban Reason</div>
                        </div>
                      )}
                    </div>

                    <div className="rounded-[2rem] border border-white/5 bg-white/5 p-8 transition-all hover:border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="rounded-2xl bg-slate-500/10 p-4 text-slate-400">
                            <Trash2 className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">Data Purge</h4>
                            <p className="text-xs font-medium text-slate-500 mt-1">Irreversibly delete profile and associated records.</p>
                          </div>
                        </div>
                        <button 
                          className="rounded-2xl border border-rose-500/30 bg-transparent px-8 py-4 text-[10px] font-black uppercase tracking-widest text-rose-500 transition-all hover:bg-rose-500/10"
                        >
                          Purge Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Persistent Message Footer */}
          <div className="px-10 py-6 border-t border-white/5 bg-black/20">
            <div className="h-8 flex items-center">
              <AnimatePresence mode="wait">
                {message ? (
                  <motion.div
                    key="message"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
                      message.type === 'success' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    {message.text}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-pulse" />
                    System Ready for configuration
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
