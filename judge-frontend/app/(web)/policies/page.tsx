"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import {
    ShieldCheck,
    Lock,
    Cpu,
    Scale,
    FileText,
    Key,
    AlertTriangle,
    EyeOff,
    CheckCircle2,
    ArrowRight,
    Terminal,
    Sparkles,
    Search,
    Fingerprint,
    Server,
    Flame,
    Share2,
    Check
} from "lucide-react";
import { useAppContext } from "../../lib/auth/context";
import { BackButton } from "@/components/General/BackButton";
import Footer from "@/components/General/Footer";

interface PolicySection {
    id: string;
    number: string;
    title: string;
    icon: React.ReactNode;
    badge: string;
    colorTheme: {
        gradient: string;
        border: string;
        bgGlow: string;
        accentText: string;
        iconBg: string;
    };
    lead: string;
    items: {
        title: string;
        description: string;
        icon: React.ReactNode;
    }[];
}

export default function PoliciesPage() {
    const { isDark, codeJudgePath, codeIdePath } = useAppContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedLink, setCopiedLink] = useState(false);
    const [activeSection, setActiveSection] = useState<string>("section-1");

    const sections: PolicySection[] = [
        {
            id: "section-1",
            number: "01",
            title: "Absolute Zero-Disclosure & Privacy Covenant",
            badge: "Zero-Disclosure Doctrine",
            icon: <ShieldCheck className="w-6 h-6 text-indigo-400" />,
            colorTheme: {
                gradient: "from-indigo-500 via-cyan-500 to-blue-500",
                border: isDark ? "border-indigo-500/20 hover:border-indigo-500/40" : "border-indigo-200 hover:border-indigo-400",
                bgGlow: "bg-indigo-500/10",
                accentText: "text-indigo-400",
                iconBg: isDark ? "bg-indigo-950/60 text-indigo-400 border border-indigo-500/30" : "bg-indigo-50 text-indigo-600 border border-indigo-200"
            },
            lead: "The fundamental cornerstone of the VLYXIR platform is absolute user confidentiality. We operate under a strict zero-disclosure doctrine regarding all identifying and aggregate user metrics.",
            items: [
                {
                    title: "Absolute Non-Disclosure of Personal Identifiers",
                    description: "Under no circumstances will the VLYXIR development team, administrators, or affiliated contributors disclose, sell, lease, publicize, or share your personal data—including but not limited to your email addresses, usernames, display handles, or authentication records—with any third-party entity, advertiser, corporate sponsor, or external body.",
                    icon: <Lock className="w-5 h-5 text-indigo-400 shrink-0" />
                },
                {
                    title: "Confidentiality of Aggregate User Metrics",
                    description: "Unlike platforms that monetize or market platform traction, VLYXIR explicitly commits to keeping platform-wide aggregate statistics strictly internal. The total registered user count, active user numbers, and demographic distributions will never be publicly revealed, sold, or shared.",
                    icon: <EyeOff className="w-5 h-5 text-cyan-400 shrink-0" />
                },
                {
                    title: "No Third-Party Tracking / Ad Monetization",
                    description: "VLYXIR does not embed third-party advertising tracking pixels, cross-site telemetry trackers, or data-broker SDKs. Your identity on VLYXIR belongs exclusively to you.",
                    icon: <Fingerprint className="w-5 h-5 text-blue-400 shrink-0" />
                }
            ]
        },
        {
            id: "section-2",
            number: "02",
            title: "Code Execution, Sandboxing & Intellectual Property",
            badge: "100% Author IP Ownership",
            icon: <Cpu className="w-6 h-6 text-purple-400" />,
            colorTheme: {
                gradient: "from-purple-500 via-pink-500 to-indigo-500",
                border: isDark ? "border-purple-500/20 hover:border-purple-500/40" : "border-purple-200 hover:border-purple-400",
                bgGlow: "bg-purple-500/10",
                accentText: "text-purple-400",
                iconBg: isDark ? "bg-purple-950/60 text-purple-400 border border-purple-500/30" : "bg-purple-50 text-purple-600 border border-purple-200"
            },
            lead: "VLYXIR provides specialized computational environments for algorithmic problem-solving, code benchmarking, and rapid development.",
            items: [
                {
                    title: "User Ownership of Code",
                    description: "You retain 100% intellectual property ownership of any code, solutions, scripts, and algorithms authored within Forge or submitted to Arena. VLYXIR claims no copyright or proprietary rights over your source code.",
                    icon: <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                },
                {
                    title: "Execution & Evaluation License",
                    description: "By submitting code to our automated judge or running scripts in the IDE, you grant VLYXIR a non-exclusive, worldwide, royalty-free license strictly to compile, sandbox, execute, benchmark (time/memory analysis), and display runtime results back to your session.",
                    icon: <Terminal className="w-5 h-5 text-pink-400 shrink-0" />
                },
                {
                    title: "Ephemeral Sandboxing",
                    description: "Code executed inside VLYXIR sandboxes runs in isolated, ephemeral environments. While we safeguard against cross-container data leakage, you agree not to submit production secret keys, plain-text production passwords, or sensitive proprietary credentials into test runners.",
                    icon: <Server className="w-5 h-5 text-indigo-400 shrink-0" />
                }
            ]
        },
        {
            id: "section-3",
            number: "03",
            title: "Acceptable Use Policy & Platform Integrity",
            badge: "Zero Abuse Tolerance",
            icon: <Flame className="w-6 h-6 text-rose-400" />,
            colorTheme: {
                gradient: "from-rose-500 via-amber-500 to-orange-500",
                border: isDark ? "border-rose-500/20 hover:border-rose-500/40" : "border-rose-200 hover:border-rose-400",
                bgGlow: "bg-rose-500/10",
                accentText: "text-rose-400",
                iconBg: isDark ? "bg-rose-950/60 text-rose-400 border border-rose-500/30" : "bg-rose-50 text-rose-600 border border-rose-200"
            },
            lead: "To ensure fair competition and system stability across Arena and Forge, all users must adhere to strict operational standards.",
            items: [
                {
                    title: "Anti-Abuse & Sandbox Containment",
                    description: "You agree not to attempt container breakouts, denial-of-service (DoS/DDoS) attacks against VLYXIR servers, fork-bombing sandbox nodes, unauthorized network traversal, or resource starvation targeting our worker clusters.",
                    icon: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                },
                {
                    title: "Fair Play in Arena",
                    description: "Automated scraping of test cases, tampering with execution timers, exploiting grading heuristics, or reverse-engineering protected benchmark test suites is strictly prohibited.",
                    icon: <Scale className="w-5 h-5 text-amber-400 shrink-0" />
                },
                {
                    title: "Prohibited Content",
                    description: "You may not use VLYXIR to store, host, or execute malware, cryptominers, malicious network sniffers, or unsolicited automation scripts.",
                    icon: <ShieldCheck className="w-5 h-5 text-orange-400 shrink-0" />
                }
            ]
        },
        {
            id: "section-4",
            number: "04",
            title: "Account Security & Responsibilities",
            badge: "Identity Integrity",
            icon: <Key className="w-6 h-6 text-emerald-400" />,
            colorTheme: {
                gradient: "from-emerald-500 via-teal-500 to-cyan-500",
                border: isDark ? "border-emerald-500/20 hover:border-emerald-500/40" : "border-emerald-200 hover:border-emerald-400",
                bgGlow: "bg-emerald-500/10",
                accentText: "text-emerald-400",
                iconBg: isDark ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
            },
            lead: "Maintaining platform-wide trust requires mutual security vigilance and adherence to authentic identity standards.",
            items: [
                {
                    title: "Credential Safeguarding",
                    description: "You are solely responsible for maintaining the confidentiality of your session tokens, passwords, and access credentials.",
                    icon: <Key className="w-5 h-5 text-emerald-400 shrink-0" />
                },
                {
                    title: "One Person, One Identity",
                    description: "Creating automated bot farms or spam accounts to artificially manipulate leaderboard metrics in Arena is grounds for immediate account termination.",
                    icon: <Fingerprint className="w-5 h-5 text-teal-400 shrink-0" />
                },
                {
                    title: "Data Deletion",
                    description: "You retain the right to terminate your account and request complete purging of your personal records from our authentication database at any time.",
                    icon: <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                }
            ]
        },
        {
            id: "section-5",
            number: "05",
            title: "Service Availability, Limitations & Disclaimer",
            badge: "Transparency & Governance",
            icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
            colorTheme: {
                gradient: "from-amber-500 via-yellow-500 to-orange-500",
                border: isDark ? "border-amber-500/20 hover:border-amber-500/40" : "border-amber-200 hover:border-amber-400",
                bgGlow: "bg-amber-500/10",
                accentText: "text-amber-400",
                iconBg: isDark ? "bg-amber-950/60 text-amber-400 border border-amber-500/30" : "bg-amber-50 text-amber-600 border border-amber-200"
            },
            lead: "Operational parameters, warranty disclaimers, and commitment to invariant non-disclosure throughout all future iterations.",
            items: [
                {
                    title: "As-Is Provisioning",
                    description: "The VLYXIR platform, including code compilation speed, metric telemetry in Insight, and sandbox uptime, is provided on an 'AS IS' and 'AS AVAILABLE' basis without express or implied warranties.",
                    icon: <Server className="w-5 h-5 text-amber-400 shrink-0" />
                },
                {
                    title: "Limitation of Liability",
                    description: "In no event shall the VLYXIR development team be liable for data loss, compilation delays, transient execution errors, or local hardware issues arising from your use of the platform.",
                    icon: <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
                },
                {
                    title: "Modifications to Terms",
                    description: "Any structural updates to platform capabilities or backend architecture will be reflected here. The core non-disclosure pledge regarding user identity and user count remains uncompromised across all future iterations.",
                    icon: <Sparkles className="w-5 h-5 text-orange-400 shrink-0" />
                }
            ]
        }
    ];

    const filteredSections = searchQuery.trim() === ""
        ? sections
        : sections.filter(sec =>
            sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sec.lead.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sec.items.some(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );

    const handleCopyPageUrl = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    const shellClassName = isDark
        ? "relative flex flex-col min-h-0 flex-1 overflow-y-auto overflow-x-hidden text-slate-100 font-sans selection:bg-indigo-500/30"
        : "relative flex flex-col min-h-0 flex-1 overflow-y-auto overflow-x-hidden text-slate-900 font-sans selection:bg-indigo-500/20";

    const ambientClassName = isDark
        ? "pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.22),transparent_55%),linear-gradient(135deg,rgba(11,12,21,0.96),rgba(15,23,42,0.98))]"
        : "pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.08),transparent_55%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(243,244,246,0.98))]";

    const gridOverlayClassName = `pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:32px_32px] ${
        isDark ? "opacity-40" : "opacity-25"
    }`;

    return (
        <div className={shellClassName}>
            {/* Ambient Backgrounds matching Landing Page */}
            <div className={ambientClassName} />
            <div className={gridOverlayClassName} />
            <div className={`pointer-events-none fixed left-[-15%] top-[-10%] h-[600px] w-[600px] rounded-full blur-[140px] ${isDark ? "bg-indigo-950/25" : "bg-indigo-200/40"} opacity-70`} />
            <div className={`pointer-events-none fixed right-[-10%] bottom-[-10%] h-[700px] w-[700px] rounded-full blur-[150px] ${isDark ? "bg-purple-950/25" : "bg-purple-200/35"} opacity-60`} />

            <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 md:px-12 pt-10 pb-24 w-full">
                {/* Top Navigation & Back Link */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <BackButton />

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCopyPageUrl}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-95 ${
                                isDark
                                    ? "bg-slate-900/50 hover:bg-slate-900 border-slate-800 text-slate-300"
                                    : "bg-white/80 hover:bg-white border-slate-200 text-slate-700 shadow-sm"
                            }`}
                        >
                            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                            <span>{copiedLink ? "Link Copied!" : "Share Policy"}</span>
                        </button>
                    </div>
                </div>

                {/* Hero Header */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center max-w-3xl mx-auto mb-16 space-y-6"
                >
                    {/* Pulsing Pill Tag */}
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400">
                            Effective Date: August 2026
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={itemVariants}
                        className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] ${
                            isDark ? "text-white" : "text-slate-900"
                        }`}
                    >
                        Terms of Service & <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 whitespace-normal relative inline-block">
                            Privacy Covenant
                            <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full blur-[1px]" />
                        </span>
                    </motion.h1>

                    {/* Welcome Introduction */}
                    <motion.div
                        variants={itemVariants}
                        className={`p-6 rounded-2xl border text-sm md:text-base leading-relaxed text-left font-medium backdrop-blur-xl ${
                            isDark
                                ? "bg-slate-950/50 border-slate-800 text-slate-300 shadow-[0_15px_30px_rgba(0,0,0,0.3)]"
                                : "bg-white/90 border-slate-200 text-slate-700 shadow-[0_10px_25px_rgba(99,102,241,0.04)]"
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div>
                                <strong className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Welcome to the VLYXIR ecosystem</strong> (encompassing VLYXIR Arena, VLYXIR Forge, and VLYXIR Insight). By creating an account, accessing our interfaces, utilizing our automated judging engines, or executing code within our sandboxes, you agree to be bound by these Terms and Conditions and Privacy Policy.
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Core Guarantees Quick-Specs (Grid of 4) */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
                >
                    {[
                        {
                            icon: <ShieldCheck className="w-5 h-5 text-indigo-400" />,
                            title: "Zero-Disclosure",
                            value: "Strict Doctrine",
                            sub: "No metric or identity leaks"
                        },
                        {
                            icon: <Cpu className="w-5 h-5 text-purple-400" />,
                            title: "Author Code IP",
                            value: "100% Yours",
                            sub: "Zero copyright claims"
                        },
                        {
                            icon: <Server className="w-5 h-5 text-emerald-400" />,
                            title: "Execution Box",
                            value: "Ephemeral VMs",
                            sub: "Isolated memory spaces"
                        },
                        {
                            icon: <EyeOff className="w-5 h-5 text-cyan-400" />,
                            title: "Ad Telemetry",
                            value: "Zero Trackers",
                            sub: "No external SDKs / brokers"
                        }
                    ].map((spec, idx) => (
                        <div
                            key={idx}
                            className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                                isDark
                                    ? "bg-slate-950/40 border-slate-900/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
                                    : "bg-white/80 border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`p-1.5 rounded-lg ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
                                    {spec.icon}
                                </div>
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                    {spec.title}
                                </span>
                            </div>
                            <span className={`block text-sm font-black ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                                {spec.value}
                            </span>
                            <span className="block text-[11px] text-slate-500 mt-0.5">
                                {spec.sub}
                            </span>
                        </div>
                    ))}
                </motion.div>

                {/* Section Quick Navigator & Search */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800/20 dark:border-slate-800">
                    {/* Jump-to-section Navigation Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto py-1">
                        {sections.map(sec => (
                            <a
                                key={sec.id}
                                href={`#${sec.id}`}
                                onClick={() => setActiveSection(sec.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all duration-200 border ${
                                    activeSection === sec.id
                                        ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                                        : isDark
                                        ? "bg-slate-950/40 hover:bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
                                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Section {sec.number}
                            </a>
                        ))}
                    </div>

                    {/* Quick Search */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Filter policy clauses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border outline-none transition-all duration-200 ${
                                isDark
                                    ? "bg-slate-950/60 border-slate-850 focus:border-indigo-500 text-slate-200 placeholder-slate-500"
                                    : "bg-white border-slate-200 focus:border-indigo-500 text-slate-800 placeholder-slate-400"
                            }`}
                        />
                    </div>
                </div>

                {/* Main Policy Sections */}
                <div className="space-y-12 mb-20">
                    {filteredSections.length === 0 ? (
                        <div className={`p-12 text-center rounded-3xl border ${isDark ? "bg-slate-950/40 border-slate-900" : "bg-white border-slate-200"}`}>
                            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-40" />
                            <h3 className={`text-base font-bold mb-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>No matching clauses found</h3>
                            <p className="text-xs text-slate-500">Try refining your search terms or clearing the filter.</p>
                            <button
                                onClick={() => setSearchQuery("")}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-colors"
                            >
                                Reset Search
                            </button>
                        </div>
                    ) : (
                        filteredSections.map((sec) => (
                            <motion.section
                                key={sec.id}
                                id={sec.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.5 }}
                                className={`rounded-3xl border p-6 sm:p-8 md:p-10 backdrop-blur-xl relative overflow-hidden transition-all duration-300 ${
                                    isDark
                                        ? `bg-slate-950/40 ${sec.colorTheme.border} shadow-[0_20px_50px_rgba(0,0,0,0.4)]`
                                        : `bg-white/85 ${sec.colorTheme.border} shadow-[0_15px_35px_rgba(99,102,241,0.03)]`
                                }`}
                            >
                                {/* Subtle Background Ambient Aura */}
                                <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-40 ${sec.colorTheme.bgGlow}`} />

                                {/* Section Header */}
                                <div className="relative z-10 mb-8">
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[11px] font-black uppercase tracking-wider bg-slate-900/10 border-slate-700/20 text-slate-500">
                                            <span>ARTICLE {sec.number}</span>
                                        </div>
                                        <span className={`text-xs font-black uppercase tracking-wider ${sec.colorTheme.accentText}`}>
                                            {sec.badge}
                                        </span>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${sec.colorTheme.iconBg}`}>
                                            {sec.icon}
                                        </div>
                                        <div>
                                            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                                                {sec.title}
                                            </h2>
                                            <p className={`text-sm sm:text-base font-medium leading-relaxed ${isDark ? "text-slate-300" : "text-slate-650"}`}>
                                                {sec.lead}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Clauses List */}
                                <div className="relative z-10 grid gap-4 sm:gap-5 mt-6">
                                    {sec.items.map((clause, cIdx) => (
                                        <div
                                            key={cIdx}
                                            className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 hover:border-slate-700/40 ${
                                                isDark
                                                    ? "bg-slate-900/30 border-slate-900"
                                                    : "bg-slate-50/70 border-slate-150"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3.5">
                                                <div className="mt-0.5">
                                                    {clause.icon}
                                                </div>
                                                <div className="space-y-1.5 text-left">
                                                    <h3 className={`text-sm sm:text-base font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                                                        {clause.title}
                                                    </h3>
                                                    <p className={`text-xs sm:text-sm leading-relaxed font-normal ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                                        {clause.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        ))
                    )}
                </div>

                {/* Bottom Callout & Commitment Footer Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`rounded-3xl border p-8 md:p-12 text-center relative overflow-hidden backdrop-blur-xl mb-16 ${
                        isDark
                            ? "bg-gradient-to-b from-indigo-950/30 to-slate-950/60 border-indigo-500/20"
                            : "bg-gradient-to-b from-indigo-50/80 to-white/90 border-indigo-200 shadow-xl shadow-indigo-500/5"
                    }`}
                >
                    <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                            Our Invariant Commitment
                        </h3>
                        <p className={`text-sm sm:text-base leading-relaxed font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            VLYXIR was architected from day one around the belief that high-performance developer tooling should respect the engineer. We do not sell metrics, monetize user data, or compromise on security.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                            <Link
                                href={codeJudgePath}
                                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <span>Enter Vlyxir Arena</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href={codeIdePath}
                                className={`px-6 py-3.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                                    isDark
                                        ? "border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-900"
                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                Open Forge IDE
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Platform Footer */}
            <Footer />
        </div>
    );
}