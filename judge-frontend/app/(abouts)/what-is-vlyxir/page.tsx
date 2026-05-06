
'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Code2, Cpu, Zap, Shield, Globe, Users } from 'lucide-react';
import { BackButton } from '@/components/General/BackButton';

const fadeInUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

const staggerContainer: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function WhatIsVlyxirPage() {
    return (
        <div className="min-h-screen bg-background selection:bg-indigo-500/30">
            {/* Hero Section */}
            <section className="relative pt-12 pb-20 overflow-hidden">
                {/* Background Ambient Light */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="max-w-6xl mx-auto px-6">
                    <div className="mb-8">
                        <BackButton />
                    </div>
                    <motion.div 
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                        className="text-center space-y-8"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-sm font-medium">
                            <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Discover the Future of Coding
                        </motion.div>

                        <motion.h1 
                            variants={fadeInUp}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight"
                        >
                            The Intelligent Frontier of <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] animate-gradient">
                                Competitive Coding
                            </span>
                        </motion.h1>

                        <motion.p 
                            variants={fadeInUp}
                            className="max-w-3xl mx-auto text-lg md:text-xl text-foreground/60 leading-relaxed"
                        >
                            Vlyxir is far more than a standard online judge. It is a sophisticated, premium ecosystem engineered specifically for developers and software engineers who demand absolute precision, lightning-fast execution speeds, and deep architectural intelligence. Whether you are preparing for high-stakes technical interviews at FAANG companies or looking to sharpen your algorithmic intuition, Vlyxir provides the high-fidelity tools necessary to master every line of code you write.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Core Mission */}
            <section className="py-24 relative">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold">Built for the Next Generation of Elite Developers</h2>
                            <p className="text-foreground/70 text-lg leading-relaxed">
                                Vlyxir was born from a fundamental observation of the current developer landscape: most competitive coding platforms and technical assessment tools haven't kept pace with the rapid evolution of the modern web. Many existing online judges rely on legacy architectures that feel clunky, suffer from significant latency, and offer an uninspiring, purely functional aesthetic that fails to ignite a developer's creativity.
                            </p>
                            <p className="text-foreground/70 text-lg leading-relaxed">
                                Our core mission is to bridge the significant gap between industrial-grade performance execution and a world-class, premium user experience. By seamlessly integrating state-of-the-art Large Language Model (LLM) analysis with a custom-engineered, lightning-fast judge engine, we have created an environment where you don't just solve algorithmic puzzles—you undergo a comprehensive code transformation. We provide the metrics, the insights, and the performance stability required to transition from a coder to a master software architect.
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative aspect-square md:aspect-video rounded-3xl overflow-hidden border border-white/5 glass-morphism bg-white/5 flex items-center justify-center group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-50" />
                            <Code2 size={120} className="text-indigo-400/20 group-hover:text-indigo-400/40 transition-colors duration-500" />
                            
                            {/* Decorative elements */}
                            <div className="absolute top-8 left-8 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                                <Zap className="text-yellow-400" size={24} />
                            </div>
                            <div className="absolute bottom-12 right-12 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                                <Shield className="text-emerald-400" size={32} />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Three Pillars */}
            <section className="py-24 bg-black/20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">The Three Pillars of Vlyxir</h2>
                        <p className="text-foreground/60 max-w-xl mx-auto">A holistic approach to mastering data structures, algorithms, and secure coding practices.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Cpu className="text-indigo-400" size={32} />,
                                title: "Performance Judge Engine",
                                desc: "Our industrial-strength execution engine is optimized for Python, providing near-instantaneous test case validation. We deliver precise metrics on runtime latency and memory consumption, ensuring your algorithmic solutions are not just correct, but optimally efficient for production-scale environments."
                            },
                            {
                                icon: <Zap className="text-purple-400" size={32} />,
                                title: "AI-Powered Logic Insights",
                                desc: "Leveraging cutting-edge LLMs and Groq-accelerated inference, Vlyxir performs deep static analysis on your code. We identify complex logic flaws, Big O complexity bottlenecks, and potential security vulnerabilities in real-time, offering actionable feedback that traditional judges simply cannot provide."
                            },
                            {
                                icon: <Globe className="text-emerald-400" size={32} />,
                                title: "Global Elite Community",
                                desc: "Join an international network of high-performing developers. Compete on global leaderboards for rank and prestige, share architectural wisdom in our curated forums, and track your long-term growth with professional-grade analytics that map your journey toward technical excellence."
                            }
                        ].map((pillar, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="p-8 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors duration-300 group"
                            >
                                <div className="mb-6 p-4 rounded-2xl bg-black/20 w-fit group-hover:scale-110 transition-transform duration-300">
                                    {pillar.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4">{pillar.title}</h3>
                                <p className="text-foreground/60 leading-relaxed">{pillar.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats / Numbers (Social Proof Mockup) */}
            {/* <section className="py-24">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: "Problems Solved", value: "250K+" },
                            { label: "Active Users", value: "15K+" },
                            { label: "Judge Response", value: "<150ms" },
                            { label: "Countries", value: "45+" }
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center space-y-2">
                                <div className="text-4xl font-black text-indigo-400 tracking-tighter">{stat.value}</div>
                                <div className="text-sm font-medium text-foreground/40 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* Footer-like CTA */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Ready to Accelerate Your <br/><span className="text-indigo-400">Engineering Career?</span></h2>
                    <p className="text-foreground/60 max-w-2xl mx-auto text-lg">Join developers who are using Vlyxir to master complex algorithms and secure their dream roles at top tech companies.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="px-8 py-4 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25">
                            Join the Elite Arena
                        </button>
                        <button className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all hover:scale-105 active:scale-95">
                            View Documentation
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
