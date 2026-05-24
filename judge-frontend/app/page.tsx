"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import { 
    Code, Scale, Zap, Shield, Globe, Cpu, ArrowRight, Github, 
    BookOpen, BrainCircuit, Coffee, Terminal, CheckCircle2, Play, 
    Sparkles, Server, Flame, GitBranch, RefreshCw, BarChart3, 
    MessageSquare, Eye, Layers, HelpCircle
} from 'lucide-react';
import { useAppContext } from './lib/auth/context';
import Footer from "@/components/General/Footer";

// Typing Terminal Simulation Component for Hero Section
function CodeTerminalSimulation({ isDark }: { isDark: boolean }) {
    const pythonCode = [
        "def solve(nums, target):",
        "    # Find two indices that sum to target",
        "    seen = {}",
        "    for i, num in enumerate(nums):",
        "        diff = target - num",
        "        if diff in seen:",
        "            return [seen[diff], i]",
        "        seen[num] = i",
        "    return []"
    ];

    const [currentLine, setCurrentLine] = useState(0);
    const [currentChar, setCurrentChar] = useState(0);
    const [typedCode, setTypedCode] = useState<string[]>([
        pythonCode[0].match(/^\s*/)?.[0] || ""
    ]);
    const [step, setStep] = useState<"typing" | "running" | "success">("typing");

    useEffect(() => {
        if (step === "typing") {
            if (currentLine < pythonCode.length) {
                const targetText = pythonCode[currentLine];
                const leadingSpaces = targetText.match(/^\s*/)?.[0] || "";
                const actualText = targetText.slice(leadingSpaces.length);

                if (currentChar < actualText.length) {
                    const timer = setTimeout(() => {
                        setTypedCode(prev => {
                            const newCode = [...prev];
                            newCode[currentLine] = leadingSpaces + actualText.slice(0, currentChar + 1);
                            return newCode;
                        });
                        setCurrentChar(prev => prev + 1);
                    }, 20);
                    return () => clearTimeout(timer);
                } else {
                    const timer = setTimeout(() => {
                        const nextLineIndex = currentLine + 1;
                        if (nextLineIndex < pythonCode.length) {
                            const nextLeadingSpaces = pythonCode[nextLineIndex].match(/^\s*/)?.[0] || "";
                            setTypedCode(prev => [...prev, nextLeadingSpaces]);
                        } else {
                            setTypedCode(prev => [...prev, ""]);
                        }
                        setCurrentLine(prev => prev + 1);
                        setCurrentChar(0);
                    }, 100);
                    return () => clearTimeout(timer);
                }
            } else {
                const timer = setTimeout(() => {
                    setStep("running");
                }, 400);
                return () => clearTimeout(timer);
            }
        } else if (step === "running") {
            const timer = setTimeout(() => {
                setStep("success");
            }, 1000);
            return () => clearTimeout(timer);
        } else if (step === "success") {
            const timer = setTimeout(() => {
                const firstLineLeading = pythonCode[0].match(/^\s*/)?.[0] || "";
                setTypedCode([firstLineLeading]);
                setCurrentLine(0);
                setCurrentChar(0);
                setStep("typing");
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [step, currentLine, currentChar]);

    const borderStyle = isDark 
        ? "border-slate-800 bg-slate-950/80 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)]" 
        : "border-slate-200 bg-white/90 shadow-[0_25px_60px_-15px_rgba(99,102,241,0.08)]";

    return (
        <div className={`w-full rounded-2xl border backdrop-blur-md overflow-hidden transition-all duration-300 ${borderStyle}`}>
            {/* Window Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-slate-900 bg-slate-950/50" : "border-slate-100 bg-slate-50/50"}`}>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className={`text-[11px] font-mono font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    vlyxir_sandbox.py
                </span>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                        isDark ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                    }`}>
                        Python 3.10
                    </span>
                </div>
            </div>

            {/* Code Body */}
            <div className="p-5 font-mono text-[11px] sm:text-xs leading-relaxed overflow-x-auto h-[320px] flex flex-col justify-between select-none">
                {/* Code Lines Container (Fixed Height) */}
                <div className="h-[180px] overflow-y-auto no-scrollbar">
                    {typedCode.map((line, idx) => (
                        <div key={idx} className="flex">
                            <span className={`w-6 select-none text-right pr-3 ${isDark ? "text-slate-700" : "text-slate-350"}`}>
                                {idx + 1}
                            </span>
                            <span className={`whitespace-pre ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                {line.startsWith("def ") ? (
                                    <>
                                        <span className="text-pink-500">def</span> {line.slice(4)}
                                    </>
                                ) : line.includes("#") ? (
                                    <span className={isDark ? "text-slate-550" : "text-slate-400"}>{line}</span>
                                ) : line.includes("return ") ? (
                                    <>
                                        {line.slice(0, line.indexOf("return "))}
                                        <span className="text-pink-500">return</span>
                                        {line.slice(line.indexOf("return ") + 6)}
                                    </>
                                ) : line.includes("for ") || line.includes("if ") || line.includes("in ") ? (
                                    // simple highlighting
                                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>{line}</span>
                                ) : (
                                    line
                                )}
                                {idx === typedCode.length - 1 && step === "typing" && (
                                    <span className="inline-block w-1.5 h-3.5 bg-indigo-500 ml-0.5 animate-pulse" />
                                )}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Simulated Terminal Status & Output (Fixed Height) */}
                <div className="h-[90px] mt-4 pt-3 border-t border-dashed border-slate-800/40 flex flex-col justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === "typing" && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.7 }}
                                exit={{ opacity: 0 }}
                                className={`flex items-center gap-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                            >
                                <Terminal className="w-3.5 h-3.5" />
                                <span>Waiting for code completion...</span>
                            </motion.div>
                        )}

                        {step === "running" && (
                            <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="space-y-1"
                            >
                                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Vlyxir Judge: Evaluating solution...</span>
                                </div>
                                <div className={`pl-5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                    Executing test cases...
                                </div>
                            </motion.div>
                        )}

                        {step === "success" && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-2"
                            >
                                <div className="flex items-center gap-2 text-emerald-500 font-bold">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>All tests passed successfully! (Accepted)</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-6 mt-1">
                                    <div className={`p-2 rounded-lg border text-[10px] ${
                                        isDark ? "bg-slate-900/30 border-slate-900 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-600"
                                    }`}>
                                        <span className="block opacity-60">Runtime</span>
                                        <span className="font-bold text-emerald-500">14 ms</span>
                                    </div>
                                    <div className={`p-2 rounded-lg border text-[10px] ${
                                        isDark ? "bg-slate-900/30 border-slate-900 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-600"
                                    }`}>
                                        <span className="block opacity-60">Test Cases</span>
                                        <span className="font-bold text-indigo-500">50 / 50 Passed</span>
                                    </div>
                                    <div className={`p-2 rounded-lg border text-[10px] ${
                                        isDark ? "bg-slate-900/30 border-slate-900 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-600"
                                    }`}>
                                        <span className="block opacity-60">Status</span>
                                        <span className="font-bold text-purple-400">Accepted</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const { isDark, codeJudgePath, codeIdePath, codeAnalysisPath } = useAppContext();

    // Bento Grid Language Selection State
    const [forgeLang, setForgeLang] = useState<"python" | "cpp" | "js">("python");
    const forgeSnippets = {
        python: `def greet(name):\n    print(f"Hello, {name}!")\n\ngreet("Vlyxir")`,
        cpp: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, Vlyxir!";\n    return 0;\n}`,
        js: `const greet = (name) => {\n  console.log(\`Hello, \${name}!\`);\n};\n\ngreet("Vlyxir");`
    };

    // Pillars Tab Showcase State
    const [activePillar, setActivePillar] = useState(0);

    const pillars = [
        {
            title: "Vlyxir Arena",
            tagline: "High-Performance Competitive Platform",
            description: "Step into the ultimate high-performance competitive coding arena. Solve hand-picked algorithmic challenges ranging from warm-ups to complex tree structures, track your progress globally, and conquer leaderboards. Every submission undergoes a fast, isolated verification workflow delivering immediate success or error feedback across dozens of deep edge-case test suites, helping you build core algorithmic intuition.",
            buttonText: "Enter the Arena",
            href: codeJudgePath,
            image: "/promo/arena.png",
            features: [
                "500+ Algorithmic challenges with global statistics",
                "Instant code execution with optimized scoring feedback",
                "Real-time leaderboards & comprehensive run profiles"
            ],
            colorTheme: "from-indigo-500 to-cyan-500",
            icon: <Scale className="w-5 h-5 text-white" />
        },
        {
            title: "Vlyxir Forge",
            tagline: "Professional-Grade Developer Environment",
            description: "A professional, full-featured developer sandbox workspace engineered for builders. Write code without arbitrary constraints, prototype custom solutions, and structure complex files inside our powerful workspace featuring Monaco editor completions. Supporting Python, C++, TypeScript, and Go environments, the Forge allows you to refine your syntax, run immediate tests, and build out raw programmatic concepts in a sleek, customized developer IDE.",
            buttonText: "Start Forging",
            href: codeIdePath,
            image: "/promo/forge.png",
            features: [
                "Integrated professional Monaco code editor engine",
                "Support for Python, TypeScript, JavaScript, C++, and Go",
                "Custom themes, keybindings, and autocomplete suggestions"
            ],
            colorTheme: "from-purple-500 to-pink-500",
            icon: <Code className="w-5 h-5 text-white" />
        },
        {
            title: "Vlyxir Insights",
            tagline: "AI-Powered Code Analytics Hub",
            description: "Go far beyond binary pass/fail outcomes. Vlyxir Insights leverages state-of-the-art static code analysis and intelligent LLM-driven diagnostic reviews to provide specialized optimization advice. Gain deep structural metrics examining code maintainability, receive automated suggestions to eliminate execution bottlenecks, and understand the core time/space Big-O bounds of your algorithms so you write production-grade code.",
            buttonText: "Get Insights",
            href: codeAnalysisPath,
            image: "/promo/insights.png",
            features: [
                "Detailed Big-O complexity reports (Time & Space)",
                "AI-driven diagnostic reports pinpointing bottlenecks",
                "Automated standard optimization suggestions"
            ],
            colorTheme: "from-emerald-500 to-teal-500",
            icon: <BrainCircuit className="w-5 h-5 text-white" />
        }
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: [0.21, 0.47, 0.32, 0.98]
            }
        }
    };

    const shellClassName = isDark
        ? "relative flex flex-col min-h-0 flex-1 overflow-y-auto overflow-x-hidden text-slate-100 font-sans selection:bg-indigo-500/30"
        : "relative flex flex-col min-h-0 flex-1 overflow-y-auto overflow-x-hidden text-slate-900 font-sans selection:bg-indigo-500/20";
    
    const ambientClassName = isDark
        ? "pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.18),transparent_55%),linear-gradient(135deg,rgba(11,12,21,0.95),rgba(15,23,42,0.98))]"
        : "pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.08),transparent_55%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(243,244,246,0.98))]";

    const gridOverlayClassName = `pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:32px_32px] ${
        isDark ? "opacity-40" : "opacity-25"
    }`;

    return (
        <div className={shellClassName}>
            {/* Ambient Backgrounds */}
            <div className={ambientClassName} />
            <div className={gridOverlayClassName} />
            <div className={`pointer-events-none fixed left-[-15%] top-[-10%] h-[600px] w-[600px] rounded-full blur-[140px] ${isDark ? "bg-indigo-950/20" : "bg-indigo-200/40"} opacity-70`} />
            <div className={`pointer-events-none fixed right-[-10%] bottom-[-10%] h-[700px] w-[700px] rounded-full blur-[150px] ${isDark ? "bg-purple-950/20" : "bg-purple-200/35"} opacity-60`} />

            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24 w-full">
                
                {/* Hero Section */}
                <motion.section
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-36 pt-4 min-h-[75vh]"
                >
                    {/* Hero Text */}
                    <div className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left">
                        {/* Glow Badge */}
                        {/* <motion.div 
                            variants={itemVariants} 
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-8 ${
                                isDark 
                                    ? "bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                                    : "bg-indigo-50 border-indigo-150 shadow-sm"
                            }`}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? "text-indigo-400" : "text-indigo-650"}`}>
                                Release 2.0 • Advanced Sandbox
                            </span>
                        </motion.div> */}

                        {/* Title */}
                        <motion.h1
                            variants={itemVariants}
                            className={`text-5xl md:text-6xl xl:text-7xl font-black tracking-tight mb-8 leading-[1.02] ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                            Master the <br /> Art of <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-600 dark:from-indigo-400 dark:via-cyan-400 dark:to-purple-400 whitespace-nowrap">
                                Problem Solving
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            variants={itemVariants}
                            className={`text-base md:text-lg max-w-xl mx-auto lg:mx-0 mb-10 font-medium leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}
                        >
                            Vlyxir is a state-of-the-art playground engineered for modern developers. Write, execute, and analyze your algorithms with unparalleled security and AI insights.
                        </motion.p>

                        {/* Quick Specs List */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 mb-10 w-full max-w-lg"
                        >
                            {[
                                { title: "Questions", value: "500+" },
                                { title: "Performance", value: "Low Latency" },
                                { title: "Analytics", value: "Big-O Analysis" }
                            ].map((spec, i) => (
                                <div key={i} className={`p-3 rounded-xl border ${
                                    isDark ? "bg-slate-900/20 border-slate-900/60" : "bg-white/50 border-slate-100"
                                }`}>
                                    <span className={`block text-[10px] uppercase font-bold tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                        {spec.title}
                                    </span>
                                    <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                                        {spec.value}
                                    </span>
                                </div>
                            ))}
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full">
                            <Link
                                href={codeJudgePath}
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-base shadow-xl shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-2 group"
                            >
                                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link 
                                href="https://github.com/DakshSingh-GitHub/Vlyxir" 
                                target="_blank" 
                                className={`px-6 py-4 rounded-xl border font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-2 ${
                                    isDark 
                                        ? "border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/60 text-slate-350" 
                                        : "border-slate-250 bg-white hover:bg-slate-50 text-slate-750"
                                }`}
                            >
                                <Github className="w-4 h-4" /> Github
                            </Link>
                        </motion.div>
                    </div>

                    {/* Interactive Code Simulator Visual (Col Span 5) */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-5 w-full relative z-20"
                    >
                        <div className="absolute -inset-4 bg-indigo-500/5 blur-xl rounded-[2.5rem] pointer-events-none" />
                        <CodeTerminalSimulation isDark={isDark} />
                        
                        {/* Decorative Badge Overlay */}
                        <div className={`absolute -bottom-6 -right-4 p-4 rounded-xl border backdrop-blur-xl shadow-lg hidden sm:flex items-center gap-3 ${
                            isDark ? "bg-slate-950/90 border-slate-900" : "bg-white/95 border-slate-150"
                        }`}>
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Cpu className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <span className={`block text-[10px] uppercase font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}>Judge Engine</span>
                                <span className={`text-xs font-black ${isDark ? "text-slate-200" : "text-slate-800"}`}>Online • Ready</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.section>

                {/* Technical Stats Section */}
                <motion.section
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className={`grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl border mb-32 ${
                        isDark 
                            ? "bg-slate-900/20 border-slate-900/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]" 
                            : "bg-white/60 border-slate-150 shadow-[0_15px_35px_rgba(0,0,0,0.02)]"
                    }`}
                >
                    {[
                        { label: "Evaluation Speed", value: "Instant", sub: "Real-time grading feedback" },
                        { label: "Algorithmic Challenges", value: "500+", sub: "Hand-picked database" },
                        { label: "Execution Time", value: "<120ms", sub: "Optimized pipelines" },
                        { label: "Community Support", value: "Interactive", sub: "Developer Forums" }
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center md:text-left">
                            <span className="block text-2xl md:text-3xl font-black text-indigo-500">{stat.value}</span>
                            <span className={`block text-xs font-bold mt-1 ${isDark ? "text-slate-300" : "text-slate-800"}`}>{stat.label}</span>
                            <span className={`block text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{stat.sub}</span>
                        </div>
                    ))}
                </motion.section>

                {/* Platform Selection */}
                <motion.section
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-2 gap-8 mb-32"
                >
                    {/* VLYXIR Arena */}
                    <Link href={codeJudgePath} className="group">
                        <motion.div
                            variants={itemVariants}
                            className={`h-full p-8 rounded-3xl border backdrop-blur-xl relative overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 ${
                                isDark 
                                    ? "border-slate-900 bg-slate-950/30 hover:border-indigo-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]" 
                                    : "border-slate-200 bg-white/65 hover:border-indigo-300/35 hover:bg-white shadow-[0_15px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.04)]"
                            }`}
                        >
                            <div className={`absolute top-0 right-0 p-6 ${isDark ? "text-indigo-500/10 group-hover:text-indigo-500/20" : "text-indigo-500/5 group-hover:text-indigo-500/10"} transition-all duration-700`}>
                                <Scale className="w-32 h-32 rotate-[-15deg] group-hover:scale-125 transition-transform duration-700" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/20">
                                    <Scale className="w-6 h-6 text-white" />
                                </div>
                                <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>VLYXIR Arena</h3>
                                <p className={`text-sm md:text-base ${isDark ? "text-slate-400" : "text-slate-600"} mb-8 leading-relaxed`}>
                                    Practice with 500+ hand-picked algorithmic problems. Experience instant evaluation with our industrial-grade sandbox runtime.
                                </p>
                                <div className="mt-auto flex items-center gap-1.5 font-bold text-indigo-500 text-sm">
                                    Start Practice <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* VLYXIR Forge */}
                    <Link href={codeIdePath} className="group">
                        <motion.div
                            variants={itemVariants}
                            className={`h-full p-8 rounded-3xl border backdrop-blur-xl relative overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 ${
                                isDark 
                                    ? "border-slate-900 bg-slate-950/30 hover:border-purple-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]" 
                                    : "border-slate-200 bg-white/65 hover:border-purple-300/35 hover:bg-white shadow-[0_15px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(168,85,247,0.04)]"
                            }`}
                        >
                            <div className={`absolute top-0 right-0 p-6 ${isDark ? "text-purple-500/10 group-hover:text-purple-500/20" : "text-purple-500/5 group-hover:text-purple-500/10"} transition-all duration-700`}>
                                <Code className="w-32 h-32 rotate-15 group-hover:scale-125 transition-transform duration-700" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-600/20">
                                    <Code className="w-6 h-6 text-white" />
                                </div>
                                <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>VLYXIR Forge</h3>
                                <p className={`text-sm md:text-base ${isDark ? "text-slate-400" : "text-slate-600"} mb-8 leading-relaxed`}>
                                    A versatile environment to think, prototype and build. Write code in multiple languages with professional-grade editor features.
                                </p>
                                <div className="mt-auto flex items-center gap-1.5 font-bold text-purple-500 text-sm">
                                    Open IDE <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* VLYXIR Insight */}
                    <Link href={codeAnalysisPath} className="group">
                        <motion.div
                            variants={itemVariants}
                            className={`h-full p-8 rounded-3xl border backdrop-blur-xl relative overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 ${
                                isDark 
                                    ? "border-slate-900 bg-slate-950/30 hover:border-emerald-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]" 
                                    : "border-slate-200 bg-white/65 hover:border-emerald-300/35 hover:bg-white shadow-[0_15px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.04)]"
                            }`}
                        >
                            <div className={`absolute top-0 right-0 p-6 ${isDark ? "text-emerald-500/10 group-hover:text-emerald-500/20" : "text-emerald-500/5 group-hover:text-emerald-500/10"} transition-all duration-700`}>
                                <BrainCircuit className="w-32 h-32 rotate-15 group-hover:scale-125 transition-transform duration-700" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-600/20">
                                    <BrainCircuit className="w-6 h-6 text-white" />
                                </div>
                                <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>VLYXIR Insight</h3>
                                <p className={`text-sm md:text-base ${isDark ? "text-slate-400" : "text-slate-600"} mb-8 leading-relaxed`}>
                                    A platform integrated for the users to analyse their code, Learn how good your code is and Improve them !
                                </p>
                                <div className="mt-auto flex items-center gap-1.5 font-bold text-emerald-500 text-sm">
                                    Analyse code <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Forums */}
                    <Link href="/forum" className="group">
                        <motion.div
                            variants={itemVariants}
                            className={`h-full p-8 rounded-3xl border backdrop-blur-xl relative overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 ${
                                isDark 
                                    ? "border-slate-900 bg-slate-950/30 hover:border-amber-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]" 
                                    : "border-slate-200 bg-white/65 hover:border-amber-300/35 hover:bg-white shadow-[0_15px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.04)]"
                            }`}
                        >
                            <div className={`absolute top-0 right-0 p-6 ${isDark ? "text-amber-500/10 group-hover:text-amber-500/20" : "text-amber-500/5 group-hover:text-amber-500/10"} transition-all duration-700`}>
                                <Coffee className="w-32 h-32 rotate-[-15deg] group-hover:scale-125 transition-transform duration-700" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center mb-6 shadow-lg shadow-amber-600/20">
                                    <Coffee className="w-6 h-6 text-white" />
                                </div>
                                <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Forums</h3>
                                <p className={`text-sm md:text-base ${isDark ? "text-slate-400" : "text-slate-600"} mb-8 leading-relaxed`}>
                                    Let&apos;s have some discussion together...with a cup of coffee ofcourse!
                                </p>
                                <div className="mt-auto flex items-center gap-1.5 font-bold text-amber-500 text-sm">
                                    Visit Forums <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                </motion.section>

                {/* Core Pillars Interactive Tab System */}
                <motion.section
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="mb-36"
                >
                    <div className="text-center mb-12">
                        <motion.h2 
                            variants={itemVariants}
                            className={`text-3xl md:text-4xl font-black mb-4 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                            Feature Deep-Dive
                        </motion.h2>
                        <motion.p 
                            variants={itemVariants}
                            className={`text-sm md:text-base ${isDark ? "text-slate-400" : "text-slate-600"} font-medium`}
                        >
                            Select a core pillar to review its operational environment and user interfaces.
                        </motion.p>
                    </div>

                    {/* Tab Navigation Menu */}
                    <motion.div 
                        variants={itemVariants}
                        className={`flex justify-center p-1 rounded-2xl border max-w-md mx-auto mb-16 ${
                            isDark ? "bg-slate-950/60 border-slate-900" : "bg-slate-100/80 border-slate-200"
                        }`}
                    >
                        {pillars.map((pillar, idx) => {
                            const isActive = activePillar === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setActivePillar(idx)}
                                    className={`relative flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
                                        isActive 
                                            ? "text-white" 
                                            : isDark ? "text-slate-500 hover:text-slate-350" : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activePillarTab"
                                            className="absolute inset-0 bg-indigo-600 rounded-xl z-0"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">{pillar.title.split(" ")[1] || pillar.title}</span>
                                </button>
                            );
                        })}
                    </motion.div>

                    {/* Display Active Pillar Details */}
                    <div className="relative min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activePillar}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.4 }}
                                className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center"
                            >
                                {/* Left Pillar Details */}
                                <div className="lg:col-span-5 flex flex-col justify-center text-left">
                                    <div className="inline-flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
                                            {pillars[activePillar].icon}
                                        </div>
                                        <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-500">
                                            {pillars[activePillar].tagline}
                                        </span>
                                    </div>
                                    
                                    <h3 className={`text-3xl md:text-4xl font-black mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {pillars[activePillar].title}
                                    </h3>
                                    
                                    <p className={`text-base ${isDark ? "text-slate-400" : "text-slate-600"} mb-8 leading-relaxed`}>
                                        {pillars[activePillar].description}
                                    </p>

                                    {/* Bullets */}
                                    <ul className="space-y-3.5 mb-8">
                                        {pillars[activePillar].features.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0 text-xs mt-0.5">✓</span>
                                                <span className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                                    {feat}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div>
                                        <Link
                                            href={pillars[activePillar].href}
                                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/15 transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
                                        >
                                            {pillars[activePillar].buttonText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Right Pillar Media Screen */}
                                <div className="lg:col-span-7" style={{ perspective: '2000px' }}>
                                    <motion.div
                                        initial={{ rotateX: 6, rotateY: -12, scale: 0.95 }}
                                        animate={{ rotateX: 4, rotateY: -8, scale: 1 }}
                                        whileHover={{ rotateX: 0, rotateY: 0, scale: 1.02 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="relative group w-full"
                                    >
                                        {/* Outer frame glow */}
                                        <div className="absolute -inset-1.5 bg-linear-to-tr from-indigo-500/15 via-purple-500/10 to-transparent rounded-2xl blur-md pointer-events-none" />
                                        
                                        {/* Frame container */}
                                        <div className={`relative rounded-2xl border overflow-hidden backdrop-blur-sm ${
                                            isDark 
                                                ? "border-slate-800 bg-slate-950/60 shadow-[0_35px_80px_-20px_rgba(0,0,0,0.6)]" 
                                                : "border-slate-200 bg-white/70 shadow-[0_25px_60px_-15px_rgba(99,102,241,0.06)]"
                                        }`}>
                                            {/* Window header buttons decor */}
                                            <div className={`flex items-center px-4 py-2.5 border-b ${isDark ? "border-slate-900 bg-slate-950/60" : "border-slate-100 bg-slate-50/60"}`}>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500/35 group-hover:bg-rose-500/80 transition-colors duration-300" />
                                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500/35 group-hover:bg-amber-500/80 transition-colors duration-300" />
                                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500/35 group-hover:bg-emerald-500/80 transition-colors duration-300" />
                                                </div>
                                            </div>

                                            <div className="p-1">
                                                <Image
                                                    src={pillars[activePillar].image}
                                                    alt={pillars[activePillar].title}
                                                    width={1000}
                                                    height={600}
                                                    className="w-full h-auto opacity-95 group-hover:opacity-100 transition-opacity duration-300"
                                                    priority
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.section>

                {/* Classic Platform Features Showcase */}
                <motion.section
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <div className="text-center mb-16">
                        <motion.h2 
                            variants={itemVariants}
                            className={`text-2xl md:text-4xl font-black mb-4 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                            Built for Performance
                        </motion.h2>
                        <motion.p 
                            variants={itemVariants}
                            className={`text-sm md:text-base ${isDark ? "text-slate-400" : "text-slate-655"} font-medium`}
                        >
                            Engineered from the ground up to support modern algorithm evaluation pipelines.
                        </motion.p>
                    </div>

                    {/* Small grid cards */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { 
                                icon: <Zap className="w-5 h-5 text-indigo-500" />, 
                                title: "Instant Evaluation", 
                                desc: "High-performance evaluation scoring ensures near-zero queue latency for all incoming code solutions." 
                            },
                            { 
                                icon: <Shield className="w-5 h-5 text-indigo-500" />, 
                                title: "Secure Execution", 
                                desc: "Solutions are executed in an isolated, secure environment protecting every run and ensuring reliable grading." 
                            },
                            { 
                                icon: <Globe className="w-5 h-5 text-indigo-500" />, 
                                title: "Global Standards", 
                                desc: "Algorithmic problems modeled after major enterprise interview patterns for high-impact interview preparation." 
                            },
                            { 
                                icon: <Cpu className="w-5 h-5 text-indigo-500" />, 
                                title: "Python Optimized", 
                                desc: "Highly optimized execution environment for Python runtimes, with continuous multi-language expansion." 
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                whileHover={{ y: -4 }}
                                className={`p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                                    isDark 
                                        ? "border-slate-800 bg-slate-900/30 hover:border-slate-700 shadow-md" 
                                        : "border-slate-200 bg-white/70 hover:border-slate-350 shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${
                                    isDark ? "bg-slate-950 border border-slate-900" : "bg-indigo-50/70 border border-indigo-100"
                                }`}>
                                    {feature.icon}
                                </div>
                                <h4 className={`text-base font-bold mb-2.5 ${isDark ? "text-white" : "text-slate-900"}`}>{feature.title}</h4>
                                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

            </div>
            <Footer />
        </div>
    );
}
