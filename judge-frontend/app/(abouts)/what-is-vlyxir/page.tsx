
'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Code2, Cpu, Zap, Shield, Globe, Users } from 'lucide-react';

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
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background Ambient Light */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="max-w-6xl mx-auto px-6">
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
                            className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/60 leading-relaxed"
                        >
                            Vlyxir is more than just a judge. It's a premium ecosystem designed for engineers 
                            who demand precision, speed, and intelligence in their coding journey.
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
                            <h2 className="text-3xl md:text-4xl font-bold">Built for the Next Generation of Developers</h2>
                            <p className="text-foreground/70 text-lg leading-relaxed">
                                We started Vlyxir with a simple realization: competitive coding platforms haven't evolved with the modern web. 
                                Most judges feel like tools from the past decade—clunky, slow, and aesthetically uninspiring.
                            </p>
                            <p className="text-foreground/70 text-lg leading-relaxed">
                                Our mission is to bridge the gap between high-performance execution and premium user experience. 
                                By integrating state-of-the-art LLM analysis with a lightning-fast judge engine, we provide an 
                                environment where you don't just solve problems—you master them.
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
                        <p className="text-foreground/60 max-w-xl mx-auto">Everything you need to sharpen your skills and dominate the leaderboards.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Cpu className="text-indigo-400" size={32} />,
                                title: "Performance Judge",
                                desc: "Blazing fast execution for Python and C++ with real-time test case validation and precise metrics."
                            },
                            {
                                icon: <Zap className="text-purple-400" size={32} />,
                                title: "AI-Powered Insights",
                                desc: "Deep static and security analysis powered by Groq to identify complexity bottlenecks and vulnerabilities."
                            },
                            {
                                icon: <Globe className="text-emerald-400" size={32} />,
                                title: "Elite Community",
                                desc: "Compete on global leaderboards, share wisdom in the forums, and track your growth with detailed analytics."
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
            <section className="py-24">
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
            </section>

            {/* Footer-like CTA */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Ready to level up your code?</h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="px-8 py-4 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25">
                            Start Solving Problems
                        </button>
                        <button className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all hover:scale-105 active:scale-95">
                            Explore Features
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
