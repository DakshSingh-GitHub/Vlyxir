"use client";

import React, { useState } from "react";
import { 
  Download, 
  Monitor, 
  Apple, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Cpu, 
  Layers, 
  Globe, 
  CheckCircle2, 
  ArrowRight,
  Maximize2,
  Terminal,
  Code2
} from "lucide-react";
import { useAppContext } from "@/app/lib/auth/context";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DownloadPage() {
  const { isDark } = useAppContext();
  const [selectedOS, setSelectedOS] = useState<"win" | "mac">("win");

  return (
    <div className={`min-h-screen py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-500 selection:bg-indigo-500/30 ${
      isDark ? "bg-[#0A0F1A] text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      <div className="max-w-6xl mx-auto space-y-20">

        {/* HERO SECTION */}
        <div className="relative text-center space-y-8 pt-8 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-cyan-500/15 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest backdrop-blur-xl shadow-lg"
          >
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>Vlyxir Desktop Engine v7.3.20</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight max-w-4xl mx-auto"
          >
            Power Your Code with <br />
            <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Native Desktop Speed
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-base sm:text-xl max-w-2xl mx-auto leading-relaxed ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Eliminate browser latency. Experience customized translucent titlebars, dedicated hardware acceleration, and seamless algorithm execution in one dedicated workspace.
          </motion.p>

          {/* DOWNLOAD ACTION CARD */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`max-w-xl mx-auto p-8 rounded-3xl border backdrop-blur-2xl shadow-2xl relative z-10 ${
              isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/80 border-slate-200"
            }`}
          >
            {/* OS Selector Tabs */}
            <div className={`p-1.5 rounded-2xl border flex items-center gap-2 mb-8 ${
              isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
            }`}>
              <button
                onClick={() => setSelectedOS("win")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedOS === "win"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Monitor className="h-4 w-4" />
                <span>Windows (.exe)</span>
              </button>

              <button
                onClick={() => setSelectedOS("mac")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedOS === "mac"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Apple className="h-4 w-4" />
                <span>macOS (.dmg)</span>
              </button>
            </div>

            {/* Primary Download Button */}
            {selectedOS === "win" ? (
              <div className="space-y-4">
                <a
                  href="/dist/Vlyxir Setup 7.3.20.exe"
                  download
                  className="w-full py-5 rounded-2xl bg-linear-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black text-base shadow-xl shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <Download className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
                  <span>Download Vlyxir for Windows 64-bit</span>
                </a>
                <p className="text-xs text-slate-500 font-medium">
                  Compatible with Windows 10 & 11 • Version 7.3.20 (~260 MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <a
                  href="/dist/Vlyxir 7.3.20.dmg"
                  download
                  className="w-full py-5 rounded-2xl bg-linear-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-base shadow-xl shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <Download className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
                  <span>Download Vlyxir for macOS (Universal)</span>
                </a>
                <p className="text-xs text-slate-500 font-medium">
                  Supports Apple Silicon (M1/M2/M3/M4) & Intel Macs • macOS 12+
                </p>
              </div>
            )}

            {/* Verification Footer */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>SHA-256 Verified Clean</span>
              </div>
              <span className="font-mono">v7.3.20-release</span>
            </div>
          </motion.div>
        </div>

        {/* FEATURES GRID */}
        <div className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Built Specifically for Desktop Power Users
            </h2>
            <p className={`text-sm sm:text-base max-w-xl mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Why run your competitive programming platform inside a crowded browser tab when you can have a dedicated desktop IDE environment?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Maximize2 className="h-6 w-6 text-indigo-400" />}
              title="Custom Translucent TitleBar"
              description="Seamless glassmorphic titlebar with smooth window drag and native minimize/maximize controls matching Vlyxir's design language."
              isDark={isDark}
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-cyan-400" />}
              title="Zero Browser Overhead"
              description="Dedicated V8 engine execution with zero browser extensions, popup blockers, or tab thrashing interfering with your timer."
              isDark={isDark}
            />
            <FeatureCard
              icon={<Terminal className="h-6 w-6 text-purple-400" />}
              title="Local Code Execution"
              description="Direct IPC pipeline connection between the Vlyxir frontend and hosted/local Judge containers for rapid submission evaluation."
              isDark={isDark}
            />
          </div>
        </div>

        {/* WEB VS DESKTOP COMPARISON */}
        <div className={`p-8 sm:p-12 rounded-3xl border backdrop-blur-xl ${
          isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black">Desktop App vs Web Browser</h3>
              <p className="text-xs sm:text-sm text-slate-500">Compare the native desktop experience against browser-based execution.</p>
            </div>

            <div className="space-y-4">
              <ComparisonRow 
                feature="Custom Translucent TitleBar & Frameless Window"
                web={false}
                desktop={true}
                isDark={isDark}
              />
              <ComparisonRow 
                feature="Hardware-Accelerated Code Rendering"
                web={true}
                desktop={true}
                isDark={isDark}
              />
              <ComparisonRow 
                feature="Zero Browser Extension Interferences"
                web={false}
                desktop={true}
                isDark={isDark}
              />
              <ComparisonRow 
                feature="System Taskbar Badge & Native Notifications"
                web={false}
                desktop={true}
                isDark={isDark}
              />
              <ComparisonRow 
                feature="Keyboard Shortcut Locking & Focus Mode"
                web={false}
                desktop={true}
                isDark={isDark}
              />
            </div>
          </div>
        </div>

        {/* SYSTEM REQUIREMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <RequirementCard
            os="Windows Requirements"
            icon={<Monitor className="h-6 w-6 text-indigo-400" />}
            specs={[
              "Windows 10 / 11 64-bit Edition",
              "Intel Core i3 / AMD Ryzen 3 or higher",
              "4 GB RAM minimum (8 GB recommended)",
              "500 MB free disk space",
            ]}
            isDark={isDark}
          />
          <RequirementCard
            os="macOS Requirements"
            icon={<Apple className="h-6 w-6 text-purple-400" />}
            specs={[
              "macOS 12.0 Monterey or newer",
              "Apple Silicon (M1/M2/M3/M4) or Intel Processor",
              "4 GB RAM minimum (8 GB recommended)",
              "500 MB free disk space",
            ]}
            isDark={isDark}
          />
        </div>

        {/* BOTTOM CTA */}
        <div className="text-center space-y-6 pt-8 pb-12">
          <h2 className="text-3xl font-black">Ready to Elevate Your Coding Arena?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/dist/Vlyxir Setup 7.3.20.exe"
              download
              className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              Download Vlyxir (.exe)
            </a>
            <Link
              href="/"
              className={`px-8 py-4 rounded-2xl border font-bold text-sm transition-all ${
                isDark ? "border-slate-800 hover:bg-slate-900 text-slate-300" : "border-slate-300 hover:bg-slate-100 text-slate-700"
              }`}
            >
              Use Web App Version
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, isDark }: { icon: React.ReactNode; title: string; description: string; isDark: boolean }) {
  return (
    <div className={`p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
      isDark ? "bg-slate-900/40 border-slate-800/80 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
    }`}>
      <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 w-fit mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
        {description}
      </p>
    </div>
  );
}

function ComparisonRow({ feature, web, desktop, isDark }: { feature: string; web: boolean; desktop: boolean; isDark: boolean }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border ${
      isDark ? "bg-slate-950/60 border-slate-800/60" : "bg-slate-50 border-slate-200"
    }`}>
      <span className="text-sm font-semibold">{feature}</span>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 w-20 justify-end">
          <span>Web</span>
          {web ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <div className="h-2 w-2 rounded-full bg-slate-500/40" />}
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 w-24 justify-end">
          <span>Desktop</span>
          {desktop ? <CheckCircle2 className="h-4 w-4 text-cyan-400" /> : <div className="h-2 w-2 rounded-full bg-slate-500/40" />}
        </div>
      </div>
    </div>
  );
}

function RequirementCard({ os, icon, specs, isDark }: { os: string; icon: React.ReactNode; specs: string[]; isDark: boolean }) {
  return (
    <div className={`p-8 rounded-3xl border ${
      isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200 shadow-sm"
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{os}</h3>
      </div>
      <ul className="space-y-3">
        {specs.map((spec, i) => (
          <li key={i} className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>{spec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}