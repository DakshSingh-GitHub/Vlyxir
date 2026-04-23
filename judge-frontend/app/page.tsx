"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { Code, Scale, Zap, Shield, Globe, Cpu, ArrowRight, Github, BookOpen, BrainCircuit, Coffee } from 'lucide-react';
import { useAppContext } from './lib/context';
import Footer from "@/components/General/Footer";

export default function Home() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isDark, codeJudgePath } = useAppContext();

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
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
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    const features = [
        { icon: <Zap className="w-6 h-6" />, title: "Instant Evaluation", description: "Get real-time feedback on your code with our optimized judge engine." },
        { icon: <Shield className="w-6 h-6" />, title: "Secure Sandbox", description: "Your code runs in a isolated, secure environment protecting every execution." },
        { icon: <Globe className="w-6 h-6" />, title: "Global Standards", description: "Practice with problems that mirror top-tier technical interview patterns." },
        { icon: <Cpu className="w-6 h-6" />, title: "Python Optimized", description: "Currently optimized for Python, with seamless execution and instant feedback." }
    ];

    const shellClassName = isDark
        ? "relative flex flex-col min-h-0 flex-1 overflow-y-auto overflow-x-hidden text-slate-100 font-sans selection:bg-indigo-500/30"
        : "relative flex flex-col min-h-0 flex-1 overflow-y-auto overflow-x-hidden text-slate-900 font-sans selection:bg-indigo-500/20";
    const ambientClassName = isDark
        ? "pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(51,65,85,0.22),transparent_48%),linear-gradient(135deg,rgba(2,6,23,0.18),transparent_35%,rgba(15,23,42,0.3)_100%)]"
        : "pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_48%),linear-gradient(135deg,rgba(255,255,255,0.6),transparent_35%,rgba(224,231,255,0.9)_100%)]";
    const glowLeftClassName = isDark ? "bg-indigo-900/15" : "bg-indigo-200/60";
    const glowRightClassName = isDark ? "bg-purple-900/15" : "bg-purple-200/60";
    const glowCenterClassName = isDark ? "bg-slate-700/10" : "bg-slate-200/70";
    const badgeClassName = isDark
        ? "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8"
        : "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8";
    const badgeTextClassName = isDark
        ? "text-xs font-black text-indigo-400 uppercase tracking-[0.2em]"
        : "text-xs font-black text-indigo-600 uppercase tracking-[0.2em]";
    const heroTitleClassName = isDark
        ? "text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.9] text-white"
        : "text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.9] text-slate-900";
    const heroSubtitleClassName = isDark
        ? "text-base md:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
        : "text-base md:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-12 font-medium leading-relaxed";
    const secondaryButtonClassName = isDark
        ? "flex items-center justify-center gap-2 px-8 py-4 bg-slate-900/50 backdrop-blur-xl text-white rounded-2xl font-bold text-lg border border-slate-700/50 hover:border-indigo-500 transition-all duration-300 w-full sm:w-auto"
        : "flex items-center justify-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-xl text-slate-900 rounded-2xl font-bold text-lg border border-slate-200 hover:border-indigo-300 transition-all duration-300 w-full sm:w-auto shadow-[0_12px_30px_rgba(15,23,42,0.08)]";
    const sectionHeadingClassName = isDark ? "text-2xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight text-white" : "text-2xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight text-slate-900";
    const sectionSubheadingClassName = isDark ? "text-sm md:text-base text-slate-400 font-medium" : "text-sm md:text-base text-slate-600 font-medium";
    const featureCardClassName = isDark
        ? "p-8 rounded-4xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 transition-all duration-300"
        : "p-8 rounded-4xl bg-white/80 backdrop-blur-xl border border-slate-200 transition-all duration-300 shadow-[0_18px_42px_rgba(15,23,42,0.06)]";
    const featureIconWrapClassName = isDark
        ? "w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-slate-700 text-indigo-400"
        : "w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100 text-indigo-600";
    const featureTitleClassName = isDark ? "text-xl font-bold mb-3 text-white" : "text-xl font-bold mb-3 text-slate-900";
    const featureBodyClassName = isDark ? "text-slate-400 text-sm leading-relaxed" : "text-slate-600 text-sm leading-relaxed";

    return (
        <div className={shellClassName}>
            {/* Ambient Background Elements */}
            <div className={ambientClassName} />
            <div className={`pointer-events-none fixed left-[-10%] top-[5%] h-[500px] w-[500px] rounded-full blur-[120px] ${glowLeftClassName} opacity-60`} />
            <div className={`pointer-events-none fixed right-[-5%] bottom-[-10%] h-[600px] w-[600px] rounded-full blur-[140px] ${glowRightClassName} opacity-50`} />
            <div className={`pointer-events-none fixed left-[20%] top-[20%] h-96 w-96 rounded-full blur-[150px] ${glowCenterClassName} opacity-30`} />

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
                {/* Hero Section */}
                <motion.section
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center mb-24"
                >
                    <motion.div variants={itemVariants} className={badgeClassName}>
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className={badgeTextClassName}>Next-Gen Platform</span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className={heroTitleClassName}
                    >
                        Master the Art of <br />
                        <span className={`bg-clip-text text-transparent bg-linear-to-r ${isDark ? "from-indigo-400 via-cyan-400 to-purple-500" : "from-indigo-600 via-purple-600 to-pink-600"} animate-gradient-x`}>
                            Problem Solving
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className={heroSubtitleClassName}
                    >
                        VLYXIR — a fast, secure, and intuitive platform designed for developers to sharpen their skills and ace technical interviews.
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-center gap-4 mb-12 flex-wrap"
                    >
                        {['Versatile', 'Logic', 'Yield', 'X-platform', 'Intelligent', 'Runtime'].map((word, i) => (
                            <span key={word} className={`text-xs font-bold tracking-widest uppercase ${isDark ? "text-slate-500" : "text-slate-400"} flex items-center gap-2`}>
                                <span className={isDark ? "text-indigo-400" : "text-indigo-600"}>{word[0]}</span>{word.slice(1)}
                                {i < 5 && <span className="opacity-30">•</span>}
                            </span>
                        ))}
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                        <Link
                            href={codeJudgePath}
                            className="group relative px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/25 hover:bg-indigo-500 transition-all duration-300 hover:scale-[1.02] active:scale-95 overflow-hidden w-full sm:w-auto flex justify-center"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </Link>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Link
                                href="https://https://github.com/DakshSingh-GitHub/Vlyxir"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={secondaryButtonClassName}
                            >
                                <Github className="w-5 h-5" /> VLYXIR
                            </Link>
                            <Link
                                href="/docs"
                                className={secondaryButtonClassName}
                            >
                                <BookOpen className="w-5 h-5" /> Documentation
                            </Link>
                        </div>
                    </motion.div>
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
                            className={`h-full p-8 rounded-[2.5rem] border ${isDark ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-white/80"} backdrop-blur-xl transition-all duration-500 relative overflow-hidden flex flex-col hover:scale-[1.02] hover:shadow-2xl`}
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
                                    Practice with 50+ hand-picked algorithmic problems. Experience instant evaluation with our industrial-grade sandbox runtime.
                                </p>
                                <div className="mt-auto flex items-center gap-2 font-bold text-indigo-500 group-hover:gap-3 transition-all">
                                    Start Practice <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* VLYXIR Forge */}
                    <Link href="/code-ide" className="group">
                        <motion.div
                            variants={itemVariants}
                            className={`h-full p-8 rounded-[2.5rem] border ${isDark ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-white/80"} backdrop-blur-xl transition-all duration-500 relative overflow-hidden flex flex-col hover:scale-[1.02] hover:shadow-2xl`}
                        >
                            <div className={`absolute top-0 right-0 p-6 ${isDark ? "text-purple-500/10 group-hover:text-purple-500/20" : "text-purple-500/5 group-hover:text-purple-500/10"} transition-all duration-700`}>
                                <Code className="w-32 h-32 rotate-[15deg] group-hover:scale-125 transition-transform duration-700" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-600/20">
                                    <Code className="w-6 h-6 text-white" />
                                </div>
                                <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>VLYXIR Forge</h3>
                                <p className={`text-sm md:text-base ${isDark ? "text-slate-400" : "text-slate-600"} mb-8 leading-relaxed`}>
                                    A versatile environment to think, prototype and build. Write code in multiple languages with professional-grade editor features.
                                </p>
                                <div className="mt-auto flex items-center gap-2 font-bold text-purple-500 group-hover:gap-3 transition-all">
                                    Open IDE <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* VLYXIR Insight */}
                    <Link href="/code-analysis" className="group">
                        <motion.div
                            variants={itemVariants}
                            className={`h-full p-8 rounded-[2.5rem] border ${isDark ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-white/80"} backdrop-blur-xl transition-all duration-500 relative overflow-hidden flex flex-col hover:scale-[1.02] hover:shadow-2xl`}
                        >
                            <div className={`absolute top-0 right-0 p-6 ${isDark ? "text-emerald-500/10 group-hover:text-emerald-500/20" : "text-emerald-500/5 group-hover:text-emerald-500/10"} transition-all duration-700`}>
                                <BrainCircuit className="w-32 h-32 rotate-[15deg] group-hover:scale-125 transition-transform duration-700" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-600/20">
                                    <BrainCircuit className="w-6 h-6 text-white" />
                                </div>
                                <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>VLYXIR Insight</h3>
                                <p className={`text-sm md:text-base ${isDark ? "text-slate-400" : "text-slate-600"} mb-8 leading-relaxed`}>
                                    A platform integrated for the users to analyse their code, Learn how good your code is and Improve them !
                                </p>
                                <div className="mt-auto flex items-center gap-2 font-bold text-emerald-500 group-hover:gap-3 transition-all">
                                    Analyse code <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Forums */}
                    <Link href="/forum" className="group">
                        <motion.div
                            variants={itemVariants}
                            className={`h-full p-8 rounded-[2.5rem] border ${isDark ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-white/80"} backdrop-blur-xl transition-all duration-500 relative overflow-hidden flex flex-col hover:scale-[1.02] hover:shadow-2xl`}
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
                                <div className="mt-auto flex items-center gap-2 font-bold text-amber-500 group-hover:gap-3 transition-all">
                                    Visit Forums <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                </motion.section>

                {/* Features Grid */}
                <motion.section
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.div variants={itemVariants} className="text-center mb-16">
                        <h2 className={sectionHeadingClassName}>Built for Performance</h2>
                        <p className={sectionSubheadingClassName}>Engineered to provide the best possible coding experience.</p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                                className={featureCardClassName}
                            >
                                <div className={featureIconWrapClassName}>
                                    {feature.icon}
                                </div>
                                <h4 className={featureTitleClassName}>{feature.title}</h4>
                                <p className={featureBodyClassName}>
                                    {feature.description}
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
