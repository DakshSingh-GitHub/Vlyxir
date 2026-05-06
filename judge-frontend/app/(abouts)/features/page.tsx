
'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { BackButton } from '@/components/General/BackButton';
import { 
    Code2, 
    Cpu, 
    Zap, 
    Shield, 
    Globe, 
    Users, 
    Terminal, 
    BarChart3, 
    MessageSquare, 
    Smartphone, 
    Layers,
    Sparkles
} from 'lucide-react';

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

export default function FeaturesPage() {
    const features = [
        {
            title: "Industrial-Grade Execution Engine",
            desc: "Experience the pinnacle of code execution technology with Vlyxir's high-performance online judge. Engineered for sub-millisecond overhead, our engine handles massive test suites with ease, providing real-time verdicts and precise resource consumption metrics. Built on a foundation of enterprise-grade reliability, it ensures that your performance is measured with surgical accuracy, every single time you submit your solution for evaluation.",
            icon: <Terminal className="text-indigo-400" />,
            size: "large",
            color: "from-indigo-500/20 to-blue-500/20"
        },
        {
            title: "Intelligent AI Code Analysis",
            desc: "Elevate your coding standards with instant, AI-driven feedback. Our platform integrates advanced Large Language Models to analyze your submissions for time and space complexity, potential logic flaws, and security vulnerabilities. It's like having a senior developer offering tailored advice to optimize your algorithms and refine your technical approach in real-time.",
            icon: <Sparkles className="text-purple-400" />,
            size: "small",
            color: "from-purple-500/20 to-pink-500/20"
        },
        {
            title: "Interactive Professional IDE",
            desc: "Code without boundaries in our distraction-free, fully-featured cloud environment. The Vlyxir IDE supports intelligent syntax highlighting, automated indentation, and real-time snippet testing, providing the fluidity and power of a local setup right in your browser window.",
            icon: <Code2 className="text-emerald-400" />,
            size: "small",
            color: "from-emerald-500/20 to-teal-500/20"
        },
        {
            title: "Deep Performance Analytics",
            desc: "Transform raw data into actionable insights with our comprehensive developer dashboard. Vlyxir tracks your progress across multiple dimensions—from language proficiency and accuracy rates to historical solve trends and percentile rankings. Gain a granular understanding of your strengths and weaknesses to strategically improve your technical skills.",
            icon: <BarChart3 className="text-orange-400" />,
            size: "medium",
            color: "from-orange-500/20 to-red-500/20"
        },
        {
            title: "Dynamic Global Leaderboards",
            desc: "Measure your skills against the world's finest engineering talent on our real-time global leaderboard. Our sophisticated ranking algorithm accounts for problem difficulty, execution efficiency, and consistency. Filter by country, language, or curated problem sets to see exactly where you stand in the global developer ecosystem.",
            icon: <Globe className="text-blue-400" />,
            size: "small",
            color: "from-blue-500/20 to-cyan-500/20"
        },
        {
            title: "Collaborative Community Hub",
            desc: "Engage with a global network of top-tier developers within the Vlyxir community. Beyond sharing solutions, our forum is a breeding ground for innovative algorithmic strategies and technical breakthroughs. Participate in deep-dive discussions, receive peer reviews on your code, and contribute to the collective intelligence of the platform.",
            icon: <MessageSquare className="text-indigo-400" />,
            size: "medium",
            color: "from-indigo-500/20 to-purple-500/20"
        },
        {
            title: "Secure Sandboxed Execution",
            desc: "Your security is our highest priority. Every line of code submitted to Vlyxir runs within a strictly isolated, multi-layered sandbox environment. Utilizing proprietary security protocols and containerized virtualization, we ensure that your intellectual property and our infrastructure remain protected against all potential threat vectors.",
            icon: <Shield className="text-rose-400" />,
            size: "small",
            color: "from-rose-500/20 to-orange-500/20"
        },
        {
            title: "Responsive Mobile Interface",
            desc: "The developer's journey doesn't stop at the desk. Vlyxir features a meticulously crafted responsive interface that brings the full power of our platform to your mobile device. Review complex problems, engage in forum discussions, and track your ranking updates with a UI that's optimized for clarity and speed on any screen size.",
            icon: <Smartphone className="text-amber-400" />,
            size: "small",
            color: "from-amber-500/20 to-yellow-500/20"
        },
        {
            title: "Advanced Multi-Language Support",
            desc: "Code in the language that fits your logic. Vlyxir provides first-class support for industry-standard languages including Python, with a roadmap for Java, Rust, and Go. Each language is optimized for peak performance within our judge, ensuring that your preferred syntax is never a bottleneck for execution.",
            icon: <Layers className="text-cyan-400" />,
            size: "medium",
            color: "from-cyan-500/20 to-blue-500/20"
        }
    ];


    return (
        <div className="min-h-screen bg-background pt-12 pb-32 selection:bg-indigo-500/30">
            <div className="max-w-6xl mx-auto px-6">
                <div className="mb-8">
                    <BackButton />
                </div>
                <header className="mb-20 space-y-6 text-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold tracking-wide"
                    >
                        THE VLYXIR STACK
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black tracking-tight"
                    >
                        Features built for <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">serious engineers.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-foreground/60 max-w-3xl mx-auto text-lg leading-relaxed"
                    >
                        Vlyxir is a state-of-the-art ecosystem designed for high-performance code execution, intelligent algorithmic analysis, 
                        and collaborative growth. Our suite of professional tools empowers developers to solve complex problems with 
                        unprecedented efficiency and provides the analytical depth required to excel in the global engineering landscape.
                    </motion.p>
                </header>

                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]"
                >
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            variants={item}
                            className={`
                                relative group overflow-hidden rounded-[2rem] border border-white/5 bg-white/5 hover:border-white/10 transition-all duration-500
                                ${f.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                                ${f.size === 'medium' ? 'md:col-span-2' : ''}
                            `}
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            
                            <div className="relative h-full p-10 flex flex-col justify-between z-10">
                                <div className="space-y-4">
                                    <div className="p-3 rounded-2xl bg-black/40 w-fit group-hover:scale-110 transition-transform duration-500 group-hover:bg-black/20">
                                        {React.cloneElement(f.icon as React.ReactElement<{size?: number}>, { size: 28 })}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold group-hover:text-white transition-colors">{f.title}</h3>
                                        <p className="text-foreground/60 group-hover:text-foreground/80 leading-relaxed text-sm">
                                            {f.desc}
                                        </p>
                                    </div>
                                </div>

                                {f.size === 'large' && (
                                    <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                                        <div className="px-4 py-2 rounded-xl bg-black/40 text-xs font-mono text-indigo-300">PYTHON 3.11</div>
                                        <div className="px-4 py-2 rounded-xl bg-black/40 text-xs font-mono text-emerald-300">FASTAPI</div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom Section */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-32 p-12 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center space-y-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
                    
                    <h2 className="text-3xl md:text-5xl font-black relative z-10">Constant Ecosystem Evolution</h2>
                    <p className="text-white/80 max-w-3xl mx-auto text-lg leading-relaxed relative z-10">
                        Our commitment to innovation is relentless. We are continuously expanding the Vlyxir ecosystem with weekly updates, 
                        ranging from custom enterprise-level contest orchestration to collaborative team workspaces. Vlyxir is evolving 
                        beyond a standard online judge to become the comprehensive operating system for the next generation of software engineers.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
