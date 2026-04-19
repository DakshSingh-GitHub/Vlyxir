"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

import {
    Trophy,
    Code,
    Cpu,
    Zap, ArrowLeft, ArrowRight, Github, Instagram,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/General/Footer";

export default function MeetDeveloper() {

    const achievements = [
        {
            title: "Built CodeJudge",
            description:
                "Full-stack coding platform architected using Next.js and modern web technologies.",
            icon: <Trophy className="w-6 h-6" />,
        },
        {
            title: "Full-Stack Developer",
            description:
                "Hands on React, Next.js, Java, Python, and scalable system design.",
            icon: <Code className="w-6 h-6" />,
        },
        {
            title: "DSA Expertise",
            description:
                "Strong foundation in data structures, algorithms, and optimization.",
            icon: <Cpu className="w-6 h-6" />,
        },
        {
            title: "Performance Driven",
            description:
                "Focused on building fast, efficient, and scalable applications.",
            icon: <Zap className="w-6 h-6" />,
        },
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
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

    return (
        <div
            className="relative flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-950 transition-colors duration-500">
            {/* Ambient Background Elements */}
            <div
                className="absolute top-0 left-1/4 w-120 h-120 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div
                className="absolute bottom-1/4 right-0 w-100 h-100 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div
                className="absolute top-1/2 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

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


            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col justify-center z-10 max-w-7xl mt-20 mx-auto px-6 pt-20 pb-32"
            >
                <motion.h1
                    variants={itemVariants}
                    className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.95] md:leading-[0.9] text-center"
                >
                    Meet the Developer<br />
                    <span
                        className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                        Daksh Singh
                    </span>
                </motion.h1>
                <motion.p
                    variants={itemVariants}
                    className="text-xl md:text-lg lg:text-xl font-bold mt-10 text-center leading-relaxed"
                >
                    Full-stack developer specializing in React, Next.js, and scalable web applications. <br /> Passionate
                    about building high-performance digital products.
                </motion.p>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-20 mb-20"
            >
                {achievements.map((feature, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className="p-8 rounded-3xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-gray-700 text-indigo-600 dark:text-indigo-400">
                            {feature.icon}
                        </div>
                        <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </motion.div>


            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col justify-center align-center md:w-[50%] w-[90%] mx-auto md:mb-20 bg-blue-300/5 md:p-20 rounded-4xl border-violet-900 border shadow-xl hover:border-violet-600 transition-all duration-300 hover:shadow-violet-800 hover:shadow-[0_0_30px_rgba(77,23,154,0.8)] mb-10 p-10"
            >
                <motion.h1
                    variants={itemVariants}
                    className="text-4xl md:text-6xl lg:text-6xl font-black tracking-tighter leading-[0.95] md:leading-[0.9] text-center"
                >
                    Contact me here...
                </motion.h1>
                <motion.p
                    variants={itemVariants}
                    className="md:text-2xl text-xl font-bold mt-10 mb-10 text-center leading-relaxed"
                >
                    For any suggestions and improvements you are free to message me or connect to me on the following handles. My messages are always open to good vibes...:)
                </motion.p>

                <hr className="border" />

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">

                    <Link
                        href="https://https://github.com/DakshSingh-GitHub/Vlyxir"
                        className="group relative px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 transition-all duration-300 hover:scale-[1.02] active:scale-95 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Github <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </Link>
                    <div className="flex flex-row gap-4">
                        <Link
                            href="https://https://github.com/DakshSingh-GitHub/Vlyxir"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-bold text-lg border border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300"
                        >
                            <Github className="w-5 h-5" /> GitHub
                        </Link>
                        <Link
                            href="https://www.instagram.com/dtlz_564"
                            className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-bold text-lg border border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300"
                        >
                            <Instagram className="w-5 h-5" /> Instagram
                        </Link>
                    </div>
                </motion.div>
            </motion.div>

            <Footer />

        </div>
    );
}