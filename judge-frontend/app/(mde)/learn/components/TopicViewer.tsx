"use client";

import { useState } from "react";
import Link from "next/link";
import { LearnTopic, SupportedLanguage, getAllTopics } from "../../../lib/data/learnData";
import { Bookmark, CheckCircle2, Clock, Sparkles, ArrowLeft, ArrowRight, Copy, Check, HelpCircle, AlertCircle, Info, Lightbulb, Code2 } from "lucide-react";
import { useAppContext } from "../../../lib/auth/context";

interface TopicViewerProps {
    topic: LearnTopic;
    isCompleted: boolean;
    isBookmarked: boolean;
    onToggleCompleted: () => void;
    onToggleBookmark: () => void;
}

const LANGUAGE_LABELS: Record<SupportedLanguage, { label: string }> = {
    python: { label: "Python" },
    java: { label: "Java" },
    cpp: { label: "C++" },
    javascript: { label: "JavaScript" }
};

export default function TopicViewer({
    topic,
    isCompleted,
    isBookmarked,
    onToggleCompleted,
    onToggleBookmark
}: TopicViewerProps) {
    const { isDark } = useAppContext();
    const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("python");
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
    const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});

    const allTopics = getAllTopics();
    const currentIndex = allTopics.findIndex(t => t.id === topic.id);
    const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
    const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

    const handleCopy = (code: string, index: number) => {
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleSelectOption = (quizId: string, optionIndex: number) => {
        setSelectedAnswers(prev => ({ ...prev, [quizId]: optionIndex }));
        setShowExplanations(prev => ({ ...prev, [quizId]: true }));
    };

    const getDifficultyBadge = (difficulty: LearnTopic["difficulty"]) => {
        switch (difficulty) {
            case "Beginner":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
            case "Intermediate":
                return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
            case "Advanced":
                return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
        }
    };

    return (
        <div className={`h-full min-h-0 flex flex-col rounded-3xl border backdrop-blur-xl transition-all duration-300 overflow-hidden ${isDark
            ? "border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(10,15,26,0.92))] shadow-[0_16px_36px_rgba(2,6,23,0.24)]"
            : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
            }`}>
            {/* Topic Header Bar */}
            <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getDifficultyBadge(topic.difficulty)}`}>
                            {topic.difficulty}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            {topic.readTime}
                        </span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {topic.title}
                    </h1>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {topic.subtitle}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleBookmark}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${isBookmarked
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                    >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-500" : ""}`} />
                        <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
                    </button>

                    <button
                        onClick={onToggleCompleted}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 ${isCompleted
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                            }`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isCompleted ? "Marked Complete" : "Mark as Complete"}</span>
                    </button>
                </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Overview Card */}
                <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        <span>Executive Summary</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                        {topic.overview}
                    </p>
                </div>

                {/* Key Concepts Bullet Points */}
                {topic.keyConcepts && topic.keyConcepts.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                            Key Takeaways
                        </h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {topic.keyConcepts.map((concept, idx) => (
                                <li
                                    key={idx}
                                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-start gap-2.5 text-xs font-medium text-slate-800 dark:text-slate-200"
                                >
                                    <div className="p-1 rounded-full bg-indigo-500/10 text-indigo-500 mt-0.5 shrink-0">
                                        <Lightbulb className="w-3 h-3" />
                                    </div>
                                    <span>{concept}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Time & Space Complexity Card */}
                {(topic.timeComplexity || topic.spaceComplexity) && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                            Complexity Analysis
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {topic.timeComplexity?.access && (
                                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Access</p>
                                    <p className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono">{topic.timeComplexity.access}</p>
                                </div>
                            )}
                            {topic.timeComplexity?.search && (
                                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Search</p>
                                    <p className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono">{topic.timeComplexity.search}</p>
                                </div>
                            )}
                            {topic.timeComplexity?.insertion && (
                                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Insertion</p>
                                    <p className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono">{topic.timeComplexity.insertion}</p>
                                </div>
                            )}
                            {topic.spaceComplexity && (
                                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Space</p>
                                    <p className="text-base font-black text-purple-600 dark:text-purple-400 mt-1 font-mono">{topic.spaceComplexity}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Section Content */}
                <div className="space-y-6">
                    {topic.sections.map((section, idx) => (
                        <div key={idx} className="space-y-3 pt-2">
                            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                {section.heading}
                            </h2>
                            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {section.content}
                            </p>

                            {/* Flow Diagram Block */}
                            {section.diagram && (
                                <div className="rounded-2xl border border-indigo-500/20 bg-slate-950 p-4 shadow-xl overflow-x-auto">
                                    <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
                                        <span>Diagram & Data Flow Visualization</span>
                                    </div>
                                    <pre className="text-[11px] font-mono text-emerald-300 leading-relaxed whitespace-pre">
                                        {section.diagram}
                                    </pre>
                                </div>
                            )}

                            {/* Callout Box */}
                            {section.callout && (
                                <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${section.callout.type === "tip"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200"
                                    : section.callout.type === "warning"
                                        ? "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200"
                                        : "bg-sky-500/10 border-sky-500/20 text-sky-900 dark:text-sky-200"
                                    }`}>
                                    {section.callout.type === "tip" && <Lightbulb className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                                    {section.callout.type === "warning" && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                                    {section.callout.type === "note" && <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />}
                                    <span>{section.callout.text}</span>
                                </div>
                            )}

                            {/* Multi-Language Code Snippet Block */}
                            {section.codeSnippet && (
                                <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
                                    {/* Header & Language Tab Switcher */}
                                    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <Code2 className="w-4 h-4 text-indigo-400" />
                                            <span className="text-xs font-mono font-medium text-slate-300">
                                                {section.codeSnippet.title}
                                            </span>
                                        </div>

                                        {/* Multi-Language Tabs */}
                                        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                            {(["python", "java", "cpp", "javascript"] as SupportedLanguage[]).map((lang) => (
                                                <button
                                                    key={lang}
                                                    onClick={() => setSelectedLanguage(lang)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${selectedLanguage === lang
                                                        ? "bg-indigo-600 text-white shadow-md"
                                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                                                        }`}
                                                >
                                                    <span>{LANGUAGE_LABELS[lang].label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Copy Button */}
                                        <button
                                            onClick={() => handleCopy(section.codeSnippet!.code[selectedLanguage] || "", idx)}
                                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-sans flex items-center gap-1.5 transition-colors"
                                        >
                                            {copiedIndex === idx ? (
                                                <>
                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                    <span className="text-emerald-400">Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3" />
                                                    <span>Copy</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Code Output for Selected Tab */}
                                    <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                                        <code>{section.codeSnippet.code[selectedLanguage] || `// Code sample unavailable for ${selectedLanguage}`}</code>
                                    </pre>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Self Check Quiz Section */}
                {topic.quiz && topic.quiz.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                            <HelpCircle className="w-4 h-4 text-indigo-500" />
                            <h3>Interactive Self-Check Flashcards</h3>
                        </div>

                        <div className="space-y-4">
                            {topic.quiz.map((q) => {
                                const selected = selectedAnswers[q.id];
                                const isAnswered = selected !== undefined;
                                const isCorrect = selected === q.correctIndex;

                                return (
                                    <div
                                        key={q.id}
                                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 space-y-3"
                                    >
                                        <p className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            {q.question}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {q.options.map((opt, optIdx) => {
                                                let btnStyle = "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300";

                                                if (isAnswered) {
                                                    if (optIdx === q.correctIndex) {
                                                        btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold";
                                                    } else if (selected === optIdx) {
                                                        btnStyle = "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300";
                                                    }
                                                }

                                                return (
                                                    <button
                                                        key={optIdx}
                                                        onClick={() => handleSelectOption(q.id, optIdx)}
                                                        className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${btnStyle}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {showExplanations[q.id] && (
                                            <div className={`p-3 rounded-xl text-xs font-medium border ${isCorrect
                                                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20"
                                                : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20"
                                                }`}>
                                                <p className="font-bold mb-0.5">{isCorrect ? "Correct!" : "Incorrect"}</p>
                                                <p>{q.explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Footer Navigation (Prev / Next Topic) */}
                <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4">
                    {prevTopic ? (
                        <Link
                            href={`/learn/${prevTopic.categorySlug}/${prevTopic.slug}`}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-all"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>{prevTopic.title}</span>
                        </Link>
                    ) : (
                        <div />
                    )}

                    {nextTopic ? (
                        <Link
                            href={`/learn/${nextTopic.categorySlug}/${nextTopic.slug}`}
                            className="px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
                        >
                            <span>{nextTopic.title}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    ) : (
                        <div />
                    )}
                </div>
            </div>
        </div>
    );
}
