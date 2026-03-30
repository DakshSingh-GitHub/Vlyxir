/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import {
    BookOpen,
    Zap,
    Code,
    Terminal,
    CheckCircle2,
    Lightbulb,
    ArrowRight,
    ArrowLeft,
    Play,
    History,
    Cpu,
    MousePointer2,
    Layout,
    Layers,
    Rocket
} from 'lucide-react';
import { useAppContext } from '../lib/context';
import Link from 'next/link';

export default function Documentation() {
    const { isDark, codeJudgePath } = useAppContext();

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
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
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    const sections = [
        {
            id: "intro",
            title: "Introduction",
            icon: <BookOpen className="w-6 h-6" />,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            content: "Welcome to CodeJudge, a high-performance platform engineered for developers to sharpen their algorithmic skills and master technical interviews. Built with a focus on speed, security, and developer experience, CodeJudge provides a seamless environment to practice, test, and validate your solutions."
        },
        {
            id: "quickstart",
            title: "Quick Start",
            icon: <Zap className="w-6 h-6" />,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            steps: [
                "Select a problem from the Code Judge library.",
                "Choose your preferred programming language (Python is natively optimized).",
                "Write your solution in the high-performance editor.",
                "Use the 'Test' button to run your code against sample inputs.",
                "Click 'Submit' to validate your solution against all hidden test cases."
            ]
        },
        {
            id: "judge",
            title: "The Code Judge",
            icon: <Layout className="w-6 h-6" />,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            content: "Our Judge interface is split into two main sections for efficient workflow:",
            details: [
                { title: "Problem Viewer", desc: "Detailed problem descriptions, input/output formats, constraints, and sample test cases." },
                { title: "Editor & Console", desc: "A professional-grade editor with syntax highlighting, automatic indentation, and an integrated output sink." },
                { title: "Verdicts", desc: "Instant feedback with statuses like 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', or 'Runtime Error'." }
            ]
        },
        {
            id: "ide",
            title: "Integrated IDE",
            icon: <Code className="w-6 h-6" />,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            content: "Beyond problem-specific challenges, CodeJudge features a dedicated IDE (Playground) for free-form coding and prototyping.",
            features: [
                "Interactive Shell: Real-time input/output streaming.",
                "Multi-language support with specialized syntax highlighting.",
                "Persisted drafts: Your code stays with you even after a refresh.",
                "Clean, distraction-free interface for deep focus."
            ]
        },
        {
            id: "best-practices",
            title: "Best Practices",
            icon: <Lightbulb className="w-6 h-6" />,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            tips: [
                "Read the constraints carefully: They often hint at the required time complexity.",
                "Test before submitting: Use custom inputs to handle edge cases like empty arrays or large integers.",
                "Optimize for performance: While Python is expressive, efficient algorithms are key to passing 'Hard' difficulty problems.",
                "Keep it clean: Well-structured code is easier to debug and more consistent with industrial standards."
            ]
        }
    ];

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-950 transition-colors duration-500 selection:bg-indigo-500/30">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-150 h-150 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-125 h-125 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Back to Home Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute top-8 left-8 z-50"
            >
                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-bold text-sm hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300 group shadow-sm hover:shadow-md"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Go back to home</span>
                </Link>
            </motion.div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 md:pt-24 pb-32">
                {/* Hero Header */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center mb-20"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 mb-8">
                        <Rocket className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Platform Guide</span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-7xl font-black tracking-tighter mb-6 leading-tight"
                    >
                        Master the Art of <br />
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                            Problem Solving
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed"
                    >
                        Everything you need to know about navigating and excelling on the CodeJudge platform.
                    </motion.p>
                </motion.div>

                {/* Documentation Sections */}
                <div className="space-y-16 md:space-y-24">
                    {sections.map((section, idx) => (
                        <motion.section
                            key={section.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            id={section.id}
                            className="relative group"
                        >
                            <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                                {/* Section Title & Icon */}
                                <div className="md:w-1/3 shrink-0">
                                    <div className={`w-14 h-14 ${section.bg} rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-transparent group-hover:border-current transition-all duration-500`}>
                                        <div className={section.color}>{section.icon}</div>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">{section.title}</h2>
                                    <div className="w-12 h-1 bg-gray-100 dark:bg-gray-800 rounded-full" />
                                </div>

                                {/* Section Content */}
                                <div className="md:w-2/3">
                                    {section.content && (
                                        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed mb-8 font-medium">
                                            {section.content}
                                        </p>
                                    )}

                                    {section.steps && (
                                        <div className="space-y-4">
                                            {section.steps.map((step, i) => (
                                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/50 hover:bg-white dark:hover:bg-gray-900 transition-colors">
                                                    <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 text-xs font-black">
                                                        {i + 1}
                                                    </div>
                                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {section.details && (
                                        <div className="grid gap-4">
                                            {section.details.map((detail, i) => (
                                                <div key={i} className="p-6 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/50">
                                                    <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                        {detail.title}
                                                    </h4>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                                        {detail.desc}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {section.features && (
                                        <ul className="space-y-4">
                                            {section.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
                                                    <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {section.tips && (
                                        <div className="grid gap-6">
                                            {section.tips.map((tip, i) => (
                                                <div key={i} className="flex gap-4">
                                                    <div className="w-1 h-auto bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full" />
                                                    <p className="text-gray-600 dark:text-gray-400 font-medium italic">
                                                        "{tip}"
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.section>
                    ))}
                </div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-32 p-12 rounded-[3rem] bg-linear-to-br from-indigo-600 to-purple-700 text-center text-white shadow-2xl shadow-indigo-500/30 overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 p-8 text-white/5">
                        <Rocket className="w-64 h-64 rotate-[-15deg]" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-black mb-6">Ready to start?</h3>
                        <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto font-medium">
                            Jump into the library and test your skills against our algorithmic challenges.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={codeJudgePath}
                                className="px-10 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-2"
                            >
                                Browse Problems <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/code-ide"
                                className="px-10 py-4 bg-indigo-500/30 text-white rounded-2xl font-bold text-lg border border-white/20 hover:bg-indigo-500/40 transition-all"
                            >
                                Open Playground
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Simple Footer */}
            <footer className="border-t border-gray-100 dark:border-gray-900 py-12">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <p className="text-sm text-gray-500 font-medium">
                        © 2026 CodeJudge. Designed for high performance.
                    </p>
                </div>
            </footer>
        </div>
    );
}
