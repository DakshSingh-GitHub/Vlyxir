"use client";

import { useState } from 'react';
import { Zap, Shield, BarChart, BrainCircuit } from 'lucide-react';
import CodeEditor from '../../components/Editor/CodeEditor';
import { useAppContext } from '../lib/context';

const DEFAULT_CODE = `def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

# Example:
# print(factorial(5))
`;

export default function CodeAnalysisPage() {
    const { isDark } = useAppContext();
    const [code, setCode] = useState(DEFAULT_CODE);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleAnalyze = () => {
        setIsLoading(true);
        // Mock analysis
        setTimeout(() => {
            setAnalysisResult({
                static: "No syntax errors found. 2 unused variables detected.",
                complexity: "O(n) - Linear time complexity. Good for most cases.",
                security: "No critical security vulnerabilities found. Medium-risk issue: Use of recursion may lead to stack overflow with large inputs."
            });
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden mb-5">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-15%] left-[-15%] w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[-15%] right-[-15%] w-80 h-80 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow delay-1000" />

            <div className="max-w-7xl mx-auto z-10">
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">
                        Code Analysis Engine
                    </h1>
                    <p className="text-base text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
                        Paste your code below to get an in-depth analysis of its performance, complexity, and security.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Code Editor Panel */}
                    <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-6 flex flex-col h-150.5 overflow-hidden">
                        <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
                            <CodeEditor code={code} setCode={setCode} isDark={isDark} />
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            className="w-full mt-6 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                    Analyzing...
                                </div>
                            ) : (
                                "Analyze Code"
                            )}
                        </button>
                    </div>

                    {/* Analysis Results Panel */}
                    <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <BrainCircuit className="w-7 h-7 text-indigo-500" />
                            Analysis Report
                        </h2>
                        
                        {isLoading ? (
                            <div className="space-y-6 animate-pulse">
                                <div className="h-24 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl" />
                                <div className="h-24 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl" />
                                <div className="h-24 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl" />
                            </div>
                        ) : analysisResult ? (
                            <div className="space-y-6">
                                <AnalysisCard icon={Zap} title="Static Analysis" content={analysisResult.static} color="cyan" />
                                <AnalysisCard icon={BarChart} title="Complexity Analysis" content={analysisResult.complexity} color="purple" />
                                <AnalysisCard icon={Shield} title="Security Vulnerabilities" content={analysisResult.security} color="rose" />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                                <BrainCircuit className="w-16 h-16 mb-4 opacity-30" />
                                <p className="text-lg font-medium">Your analysis report will appear here.</p>
                                <p className="text-sm">Click "Analyze Code" to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface AnalysisCardProps {
    icon: React.ElementType;
    title: string;
    content: string;
    color: 'cyan' | 'purple' | 'rose';
}

function AnalysisCard({ icon: Icon, title, content, color }: AnalysisCardProps) {
    const colorClasses = {
        cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
        purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    };

    return (
        <div className={`p-5 rounded-2xl border ${colorClasses[color]}`}>
            <div className="flex items-center gap-3 mb-3">
                <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[1]}`} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {content}
            </p>
        </div>
    );
}
