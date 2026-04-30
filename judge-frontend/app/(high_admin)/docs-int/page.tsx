/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Info,
    ShieldAlert,
    Lock,
    ArrowRight,
    Cpu,
    Layers,
    ShieldCheck,
    Zap,
    Database,
    Server,
    Code2,
    ChevronRight,
    Search,
    Key,
    UserCheck,
    ArrowLeft,
    MousePointer2,
    Activity,
    LineChart
} from 'lucide-react';
import Link from 'next/link';
import { getUsers } from '../../lib/utils/storage';
import { useAppContext } from '../../lib/auth/context';

export default function DocsInt() {
    const { isDark } = useAppContext();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const allUsers = getUsers();
        const user = allUsers.find(u => u.username === username && u.password === password);

        if (user) {
            if (user.permissions.includes('DOCS_INT')) {
                setIsAuthenticated(true);
                setError("");
            } else {
                setError("You don't have access to Internal Docs.");
            }
        } else {
            setError("You aren't a insider..sorry :(");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md p-8 rounded-[2.5rem] bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800"
                >
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-indigo-600/20">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black mb-2">Insider Access</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Please authenticate to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Username</label>
                            <div className="relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none font-medium"
                                    placeholder="Enter username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Password</label>
                            <div className="relative">
                                <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm font-bold text-center"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        >
                            <UserCheck className="w-5 h-5" />
                            Verify Identity
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-950 transition-colors duration-500 selection:bg-indigo-500/30">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-200 h-200 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-0 w-150 h-150 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

            {/* Back to Home Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="fixed top-8 left-8 z-50 hidden lg:block"
            >
                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-bold text-sm hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Exit Insider View</span>
                </Link>
            </motion.div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-32">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800/50 mb-8">
                        <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-widest">Confidential Technical Specs</span>
                    </div>

                    <h1 className="text-4xl md:text-8xl font-black tracking-tighter mb-8 leading-tight">
                        Under the Hood <br />
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-red-600 via-orange-600 to-amber-600 dark:from-red-400 dark:via-orange-400 dark:to-amber-400">
                            Judge Architecture
                        </span>
                    </h1>

                    <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl font-medium leading-relaxed">
                        A deep-dive into the internals of CodeJudge. From FastAPI routing to the high-performance parallelized execution engine.
                    </p>
                </motion.div>

                {/* Main Content Sections */}
                <div className="space-y-32">

                    {/* Section 1: API Layer */}
                    <section className="grid lg:grid-cols-12 gap-12 items-start">
                        <div className="lg:col-span-4 sticky top-24">
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-600/20">
                                <Server className="w-7 h-7 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">FastAPI Core</h2>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">The brain of the backend, handling high-concurrency requests with Pydantic validation.</p>
                        </div>
                        <div className="lg:col-span-8 space-y-8">
                            <div className="p-8 rounded-[2.5rem] bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-2xl font-black mb-6">Request Lifecycle</h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 font-bold">1</div>
                                        <div>
                                            <h4 className="font-bold mb-1">CORS & Middleware</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Configured with permissive CORS during development (allow_origins=["*"]) to facilitate frontend integration across different domains.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 font-bold">2</div>
                                        <div>
                                            <h4 className="font-bold mb-1">Pydantic Schema Validation</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Strict typing for <code className="text-indigo-500">SubmitRequest</code> and <code className="text-indigo-500">RunRequest</code> ensuring code and problem contexts are present before execution.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 font-bold">3</div>
                                        <div>
                                            <h4 className="font-bold mb-1">Problem Resolution</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Dynamically loads problem JSONs from the <code className="text-indigo-500">problems/</code> directory, validating data structure before passing to the runner.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                                    <h4 className="font-black text-xs uppercase tracking-widest text-indigo-500 mb-2">Endpoint: /submit</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Orchestrates multi-test case execution. Differentiates between sample-only runs (test_only) and full hidden case evaluations.</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-purple-500/5 border border-purple-500/10">
                                    <h4 className="font-black text-xs uppercase tracking-widest text-purple-500 mb-2">Endpoint: /run</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Immediate playground execution. Uses <code className="text-purple-500">run_code_once</code> for rapid feedback without full test case overhead.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Execution Engine */}
                    <section className="grid lg:grid-cols-12 gap-12 items-start">
                        <div className="lg:col-span-4 sticky top-24">
                            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-600/20">
                                <Cpu className="w-7 h-7 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">The Runner Engine</h2>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">The industrial-grade execution layer built on top of Python's subprocess API.</p>
                        </div>
                        <div className="lg:col-span-8 space-y-8">
                            <div className="p-8 rounded-[2.5rem] bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-2xl font-black mb-6">Optimization Strategies</h3>
                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                            <Zap className="w-6 h-6 text-yellow-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold mb-2">ThreadPool Dispatcher</h4>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">Instead of running test cases one by one, the engine spawns multiple worker threads, saturating all available CPU cores up to a limit of 8 concurrent workers.</p>
                                            <div className="bg-gray-100 dark:bg-black/40 p-4 rounded-2xl font-mono text-[11px] text-gray-700 dark:text-gray-300">
                                                num_workers = min(os.cpu_count() or 4, 8)
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                            <Layers className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold mb-2">Persistent Worker Model</h4>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">Traditional judges spawn a new process for every test case. CodeJudge optimizes this by keeping 'JudgeWorkers' alive. We compile the code once during 'init' and run multiple 'inputs' via standard pipes.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Diagramish Content */}
                            <div className="relative p-12 rounded-[2.5rem] bg-indigo-600 overflow-hidden text-white">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Code2 className="w-48 h-48" />
                                </div>
                                <div className="relative z-10">
                                    <h4 className="text-xl font-bold mb-8">Process Communication Protocol (JSON over Pipes)</h4>
                                    <div className="space-y-4 font-mono text-xs">
                                        <div className="flex items-center gap-4">
                                            <span className="px-2 py-1 bg-white/20 rounded">Manager</span>
                                            <ChevronRight className="w-4 h-4 opacity-50" />
                                            <span className="text-indigo-200">{"{\"type\": \"init\", \"code\": \"...\"}"}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="px-2 py-1 bg-white/20 rounded">Worker</span>
                                            <ChevronRight className="w-4 h-4 opacity-50" />
                                            <span className="text-green-300">{"{\"status\": \"ready\"}"}</span>
                                        </div>
                                        <div className="h-px bg-white/10 my-4" />
                                        <div className="flex items-center gap-4">
                                            <span className="px-2 py-1 bg-white/20 rounded">Manager</span>
                                            <ChevronRight className="w-4 h-4 opacity-50" />
                                            <span className="text-indigo-200">{"{\"type\": \"run\", \"input\": \"3 4\"}"}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="px-2 py-1 bg-white/20 rounded">Worker</span>
                                            <ChevronRight className="w-4 h-4 opacity-50" />
                                            <span className="text-green-300">{"{\"status\": \"done\", \"output\": \"7\"}"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Worker & Sandboxing */}
                    <section className="grid lg:grid-cols-12 gap-12 items-start">
                        <div className="lg:col-span-4 sticky top-24">
                            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-red-600/20">
                                <ShieldCheck className="w-7 h-7 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">Sandboxing</h2>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">Multi-layered security to ensure untrusted user code cannot compromise the host system.</p>
                        </div>
                        <div className="lg:col-span-8 space-y-8">
                            <div className="p-8 rounded-[2.5rem] bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-2xl font-black mb-8 underline decoration-red-500/30">Security Layers</h3>
                                <div className="grid sm:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-red-500">
                                            <Search className="w-5 h-5" />
                                            <h4 className="font-bold">Layer 1: Static Analysis</h4>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Before execution, the code is scanned for forbidden keywords using high-precision regex. Patterns like <code className="text-red-400">os.system</code>, <code className="text-red-400">subprocess.run</code>, and <code className="text-red-400">__import__</code> are immediately blocked.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-indigo-500">
                                            <Lock className="w-5 h-5" />
                                            <h4 className="font-bold">Layer 2: Scope Isolation</h4>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">The worker uses a restricted global dictionary. We override the <code className="text-indigo-400">__builtins__</code> to replace the default importer with our <code className="text-indigo-400">restricted_import</code> function.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-amber-500">
                                            <TimerIcon className="w-5 h-5" />
                                            <h4 className="font-bold">Layer 3: Time Enforcement</h4>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">The Manager process monitors workers using a secondary thread. If a worker doesn't respond within 2 seconds, the entire subprocess group is forcefully SIGKILLED.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-emerald-500">
                                            <Layers className="w-5 h-5" />
                                            <h4 className="font-bold">Layer 4: Resource Limiting</h4>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">We use <code className="text-emerald-400">psutil</code> to identify all child processes of a worker. When killing, we clean up the entire process tree to prevent zombie processes or orphan resource hogging.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-gray-950 text-white font-mono text-sm border border-gray-800 relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-6 text-gray-500">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="ml-4 text-xs font-bold uppercase tracking-widest">security.py</span>
                                </div>
                                <div className="space-y-2 opacity-80">
                                    <p className="text-blue-400">FORBIDDEN_MODULES = {"{"}</p>
                                    <p className="ml-4">'socket', 'http', 'requests', 'asyncio',</p>
                                    <p className="ml-4">'os', 'subprocess', 'shutil', 'tempfile'</p>
                                    <p className="text-blue-400">{"}"}</p>
                                    <br />
                                    <p className="text-purple-400">def restricted_import(name, ...):</p>
                                    <p className="ml-4 text-gray-300">if name in FORBIDDEN_MODULES:</p>
                                    <p className="ml-8 text-red-400">raise ImportError("no external servers!")</p>
                                    <p className="ml-4 text-gray-300">return original_import(name, ...)</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Testing & Data */}
                    <section className="grid lg:grid-cols-12 gap-12 items-start">
                        <div className="lg:col-span-4 sticky top-24">
                            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-amber-500/20">
                                <Database className="w-7 h-7 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">Data Management</h2>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">How we handle test cases and problem synchronization with the execution engine.</p>
                        </div>
                        <div className="lg:col-span-8 space-y-8">
                            <div className="p-8 rounded-[2.5rem] bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <div className="grid gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                            <MousePointer2 className="w-6 h-6 text-indigo-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold mb-1">Normalization Logic</h4>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">To ensure fairness, all output is normalized. We strip trailing whitespace, split by lines, and collapse multi-space gaps into single spaces before comparison.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                            <Code2 className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold mb-1">Standard I/O Redirection</h4>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">We use <code className="text-emerald-500">io.StringIO</code> and <code className="text-emerald-500">contextlib.redirect_stdout</code> to capture user output without relying on disk intermediate files, resulting in sub-millisecond overhead for I/O capturing.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Performance & Benchmarking */}
                    <section className="grid lg:grid-cols-12 gap-12 items-start pb-24">
                        <div className="lg:col-span-4 sticky top-24">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20">
                                <Activity className="w-7 h-7 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">Benchmarks</h2>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">Quantifying the efficiency of our execution engine under heavy load.</p>
                        </div>
                        <div className="lg:col-span-8 space-y-8">
                            <div className="p-8 rounded-[2.5rem] bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-2xl font-black mb-8">System Stress Tests</h3>
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold">Throughput (200 Test Cases)</h4>
                                            <span className="text-xs font-black px-2 py-1 bg-green-500/10 text-green-500 rounded-lg uppercase tracking-tighter">High Efficiency</span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Using <code className="text-indigo-500">benchmark.py</code>, we consistently observe sub-5 second execution for 200 mathematical validation cases (A+B problem).</p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 flex-1 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                                                <div className="h-full w-[95%] bg-green-500" />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400">95% faster than sequential</span>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold">Optimization Impact</h4>
                                            <span className="text-xs font-black px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg uppercase tracking-tighter">Verified</span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Toggling <code className="text-indigo-500">ENABLE_OPTIMIZATION</code> in <code className="text-indigo-500">benchmark_toggle.py</code> shows that the Parallel Worker model reduces execution time by up to 12.5x compared to the legacy sequential process model.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>

            {/* Final Insider Footer */}
            <footer className="border-t border-gray-100 dark:border-gray-900 py-20 bg-gray-50/30 dark:bg-gray-900/10">
                <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center mb-6">
                        <Cpu className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mb-4">You've reached the end of the technical specs.</p>
                    <Link href="/" className="text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all">Back to Reality</Link>
                </div>
            </footer>
        </div>
    );
}

function TimerIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="10" x2="14" y1="2" y2="2" />
            <line x1="12" x2="15" y1="14" y2="11" />
            <circle cx="12" cy="14" r="8" />
        </svg>
    )
}
