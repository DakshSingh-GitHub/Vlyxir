"use client";

import { X, Check, Filter, Layers, BadgeCheck, RotateCcw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { anime } from "../../app/lib/utils/anime";
import { motion } from "framer-motion";
import { useAppContext } from "../../app/lib/auth/context";

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: {
        difficulty: string[];
        status: "all" | "solved" | "unsolved";
        statusSub: { correct: boolean; incorrect: boolean; hasOne: boolean };
    };
    setFilters: (filters: {
        difficulty: string[];
        status: "all" | "solved" | "unsolved";
        statusSub: { correct: boolean; incorrect: boolean; hasOne: boolean };
    }) => void;
}

type Category = "difficulty" | "status";

export default function FilterModal({ isOpen, onClose, filters, setFilters }: FilterModalProps) {
    const { isDark } = useAppContext();
    const [activeCategory, setActiveCategory] = useState<Category>("difficulty");
    const [mounted, setMounted] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (backdropRef.current) {
                anime({
                    targets: backdropRef.current,
                    opacity: [0, 1],
                    duration: 300,
                    easing: 'linear'
                });
            }
            if (modalRef.current) {
                anime({
                    targets: modalRef.current,
                    opacity: [0, 1],
                    scale: [0.95, 1],
                    translateY: [20, 0],
                    duration: 400,
                    easing: 'easeOutExpo'
                });
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && contentRef.current) {
            anime({
                targets: contentRef.current,
                opacity: [0, 1],
                translateX: [15, 0],
                duration: 300,
                easing: 'easeOutQuad'
            });
        }
    }, [activeCategory, isOpen]);

    if (!mounted) return null;

    const handleClose = () => {
        anime({
            targets: backdropRef.current,
            opacity: 0,
            duration: 250,
            easing: 'linear'
        });
        anime({
            targets: modalRef.current,
            opacity: 0,
            scale: 0.96,
            translateY: 15,
            duration: 250,
            easing: 'easeInQuad',
            complete: () => onClose()
        });
    };

    const categories = [
        { 
            id: "difficulty" as const, 
            label: "Difficulty", 
            icon: Layers, 
            color: "from-indigo-500 to-blue-600",
            activeBg: isDark ? "bg-slate-800/80 border border-slate-700/60 shadow-lg" : "bg-white border border-slate-200 shadow-sm"
        },
        { 
            id: "status" as const, 
            label: "Status", 
            icon: BadgeCheck, 
            color: "from-emerald-500 to-teal-600",
            activeBg: isDark ? "bg-slate-800/80 border border-slate-700/60 shadow-lg" : "bg-white border border-slate-200 shadow-sm"
        },
    ];

    const difficultyOptions = [
        { 
            id: "easy", 
            label: "Easy", 
            color: "text-emerald-400 dark:text-emerald-400", 
            bg: "bg-emerald-500/10", 
            border: "border-emerald-500/20",
            activeClass: isDark 
                ? "border-emerald-500/50 bg-emerald-500/5 shadow-[0_8px_30px_rgba(16,185,129,0.08)]" 
                : "border-emerald-400 bg-emerald-50/40 shadow-[0_8px_30px_rgba(16,185,129,0.04)]",
            hoverBorder: isDark
                ? "hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.06)]"
                : "hover:border-emerald-400/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.04)]"
        },
        { 
            id: "medium", 
            label: "Medium", 
            color: "text-amber-500 dark:text-amber-400", 
            bg: "bg-amber-500/10", 
            border: "border-amber-500/20",
            activeClass: isDark 
                ? "border-amber-500/50 bg-amber-500/5 shadow-[0_8px_30px_rgba(245,158,11,0.08)]" 
                : "border-amber-400 bg-amber-50/40 shadow-[0_8px_30px_rgba(245,158,11,0.04)]",
            hoverBorder: isDark
                ? "hover:border-amber-500/30 hover:shadow-[0_0_15px_rgba(245,158,11,0.06)]"
                : "hover:border-amber-400/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.04)]"
        },
        { 
            id: "hard", 
            label: "Hard", 
            color: "text-rose-500 dark:text-rose-400", 
            bg: "bg-rose-500/10", 
            border: "border-rose-500/20",
            activeClass: isDark 
                ? "border-rose-500/50 bg-rose-500/5 shadow-[0_8px_30px_rgba(244,63,94,0.08)]" 
                : "border-rose-400 bg-rose-50/40 shadow-[0_8px_30px_rgba(244,63,94,0.04)]",
            hoverBorder: isDark
                ? "hover:border-rose-500/30 hover:shadow-[0_0_15px_rgba(244,63,94,0.06)]"
                : "hover:border-rose-400/40 hover:shadow-[0_0_15px_rgba(244,63,94,0.04)]"
        },
    ];

    const statusOptions = [
        { 
            id: "all" as const, 
            label: "All Problems", 
            icon: "🌐", 
            desc: "Show everything available",
            activeClass: isDark 
                ? "border-indigo-500/50 bg-indigo-500/5 shadow-[0_8px_30px_rgba(99,102,241,0.08)]" 
                : "border-indigo-400 bg-indigo-50/40 shadow-[0_8px_30px_rgba(99,102,241,0.04)]",
            hoverBorder: isDark ? "hover:border-indigo-500/30 hover:bg-slate-900/30" : "hover:border-slate-300 hover:bg-slate-50/30"
        },
        { 
            id: "solved" as const, 
            label: "Solved Only", 
            icon: "✅", 
            desc: "Problems you've conquered",
            activeClass: isDark 
                ? "border-emerald-500/50 bg-emerald-500/5 shadow-[0_8px_30px_rgba(16,185,129,0.08)]" 
                : "border-emerald-400 bg-emerald-50/40 shadow-[0_8px_30px_rgba(16,185,129,0.04)]",
            hoverBorder: isDark ? "hover:border-emerald-500/30 hover:bg-slate-900/30" : "hover:border-slate-300 hover:bg-slate-50/30"
        },
        { 
            id: "unsolved" as const, 
            label: "Unsolved Only", 
            icon: "🚀", 
            desc: "New challenges to take on",
            activeClass: isDark 
                ? "border-amber-500/50 bg-amber-500/5 shadow-[0_8px_30px_rgba(245,158,11,0.08)]" 
                : "border-amber-400 bg-amber-50/40 shadow-[0_8px_30px_rgba(245,158,11,0.04)]",
            hoverBorder: isDark ? "hover:border-amber-500/30 hover:bg-slate-900/30" : "hover:border-slate-300 hover:bg-slate-50/30"
        },
    ];

    const toggleDifficulty = (diff: string) => {
        const newDiffs = filters.difficulty.includes(diff)
            ? filters.difficulty.filter((d) => d !== diff)
            : [...filters.difficulty, diff];
        setFilters({ ...filters, difficulty: newDiffs });
    };

    const resetFilters = () => {
        setFilters({
            difficulty: [],
            status: "all",
            statusSub: { correct: true, incorrect: true, hasOne: false }
        });
    };

    const activeFilterCount = filters.difficulty.length + (filters.status !== "all" ? 1 : 0);

    const modalShellClass = isDark
        ? "bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(8,12,22,0.96))] border-slate-800/80 shadow-[0_45px_90px_rgba(2,6,23,0.7)] text-slate-100"
        : "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] border-slate-200/80 shadow-[0_45px_90px_rgba(15,23,42,0.12)] text-slate-900";

    const sidebarClass = isDark
        ? "bg-slate-950/20 md:border-r border-slate-800/80"
        : "bg-slate-50/30 md:border-r border-slate-200/60";

    const resetBtnClass = isDark
        ? "text-slate-400 hover:text-indigo-400 hover:border-indigo-500/10 hover:bg-indigo-500/5"
        : "text-slate-500 hover:text-indigo-600 hover:border-indigo-500/10 hover:bg-indigo-50/50";

    const closeBtnClass = isDark
        ? "bg-slate-900 border-slate-800/60 hover:bg-slate-800/70 hover:border-slate-700/60"
        : "bg-slate-100 border-slate-200 hover:bg-slate-200/60 hover:border-slate-300";

    const statusNestedContainer = isDark
        ? "bg-slate-950/40 border-slate-800/40"
        : "bg-slate-100/50 border-slate-200/50";

    const statusSubBtnClass = (active: boolean) => active
        ? (isDark ? "border-emerald-500/40 bg-emerald-500/5 shadow-sm text-emerald-300" : "border-emerald-400/40 bg-emerald-50/30 text-emerald-700 shadow-sm")
        : (isDark ? "border-transparent bg-transparent opacity-50 hover:opacity-80" : "border-transparent bg-transparent opacity-65 hover:opacity-85");

    const statusHasOneClass = filters.statusSub.hasOne
        ? (isDark ? "bg-indigo-500/10 border-indigo-500/20" : "bg-indigo-50/30 border-indigo-500/20")
        : (isDark ? "bg-slate-900/40 border-transparent" : "bg-slate-100/40 border-transparent");

    const applyBtnClass = "bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] hover:brightness-110 active:scale-[0.97] hover:scale-[1.005] duration-200 hover:shadow-indigo-500/35 shadow-[0_12px_24px_rgba(99,102,241,0.3)]";

    if (!isOpen) return null;

    const ModalContent = (
        <div className="fixed inset-0 z-10000 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                ref={backdropRef}
                onClick={handleClose}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl opacity-0"
            />

            {/* Modal Card */}
            <div
                ref={modalRef}
                className={`relative w-full max-w-[70vw] min-w-87.5 md:min-w-212.5 rounded-2xl md:rounded-4xl overflow-hidden border backdrop-blur-2xl flex flex-col md:flex-row h-150 md:h-[46rem] max-h-[95vh] opacity-0 transition-colors duration-300 ${modalShellClass}`}
            >
                {/* Sidebar */}
                <div className={`w-full md:w-72 p-4 md:p-8 flex flex-col md:justify-between shrink-0 ${sidebarClass}`}>
                    <div>
                        <div className="hidden md:flex items-center gap-4 mb-10 pl-2">
                            <div className="p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-600/30">
                                <Filter className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">
                                Filter
                            </h3>
                        </div>

                        <div className="flex flex-row md:flex-col gap-2 md:space-y-3 relative">
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id as Category)}
                                        className="relative flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 md:gap-3 px-3 md:px-5 py-3 md:py-4 rounded-xl md:rounded-3xl transition-all duration-300 group outline-none select-none active:scale-[0.98]"
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-filter-category"
                                                className={`absolute inset-0 rounded-xl md:rounded-3xl ${cat.activeBg}`}
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                        <div className={`relative z-10 p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all duration-500 scale-100 ${isActive ? `bg-linear-to-br ${cat.color} text-white shadow-lg` : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                                            <Icon className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                        <span className={`relative z-10 font-bold text-xs md:text-sm transition-colors ${isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-350"}`}>
                                            {cat.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={resetFilters}
                        className={`hidden md:flex items-center justify-center gap-2 w-full py-3 text-xs font-bold transition-all active:scale-95 border-2 border-transparent hover:border-indigo-500/10 rounded-xl ${resetBtnClass}`}
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset Selection
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col p-6 md:p-12 min-h-0 bg-transparent">
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-6 md:mb-10 shrink-0">
                        <div>
                            <h4 className="text-[10px] md:text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-1 md:mb-3">
                                Filtering By {activeCategory}
                            </h4>
                            <h2 className="text-xl md:text-2xl font-black">
                                {activeCategory === "difficulty" ? "How tough?" : "Your progress"}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={resetFilters}
                                className="md:hidden p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl"
                            >
                                <RotateCcw className="w-5 h-5 text-slate-400" />
                            </button>
                            <button
                                onClick={handleClose}
                                className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all group active:scale-90 border flex items-center justify-center ${closeBtnClass}`}
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Forms */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                        <div
                            ref={contentRef}
                            className="space-y-4 md:space-y-6"
                        >
                            {activeCategory === "difficulty" && (
                                <div className="grid grid-cols-1 gap-3 md:gap-4">
                                    {difficultyOptions.map((opt) => {
                                        const isSelected = filters.difficulty.includes(opt.id);
                                        return (
                                            <label
                                                key={opt.id}
                                                className={`flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 cursor-pointer group active:scale-[0.985] ${isSelected ? opt.activeClass : `border-slate-100/30 dark:border-slate-900/40 bg-slate-50/10 dark:bg-slate-900/10 ${opt.hoverBorder}`}`}
                                            >
                                                <div className="flex items-center gap-4 md:gap-6">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleDifficulty(opt.id)}
                                                        className="hidden"
                                                    />
                                                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-base md:text-xl font-black uppercase tracking-tighter ${opt.bg} ${opt.color} border-2 ${opt.border} shadow-sm group-hover:scale-105 transition-transform`}>
                                                        {opt.id[0]}
                                                    </div>
                                                    <div>
                                                        <span className="capitalize text-base md:text-lg font-bold block">
                                                            {opt.label}
                                                        </span>
                                                        <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-400">
                                                            Show {opt.id} problems
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-350 ${isSelected
                                                    ? (opt.id === "easy" ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                                      : opt.id === "medium" ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                                                      : "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]") + " scale-100"
                                                    : "bg-slate-200 dark:bg-slate-800 scale-90 opacity-0 md:group-hover:opacity-100"
                                                    }`}>
                                                    <Check className="w-4 h-4 md:w-5 md:h-5 text-white stroke-[4.5px]" />
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {activeCategory === "status" && (
                                <div className="grid grid-cols-1 gap-4 md:gap-6">
                                    {statusOptions.map((opt) => {
                                        const isSelected = filters.status === opt.id;
                                        return (
                                            <div key={opt.id} className="space-y-4">
                                                <label
                                                    className={`flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 cursor-pointer group active:scale-[0.985] ${isSelected ? opt.activeClass : `border-slate-100/30 dark:border-slate-900/40 bg-slate-50/10 dark:bg-slate-900/10 ${opt.hoverBorder}`}`}
                                                >
                                                    <div className="flex items-center gap-4 md:gap-6">
                                                        <input
                                                            type="radio"
                                                            name="status"
                                                            checked={isSelected}
                                                            onChange={() => setFilters({ ...filters, status: opt.id })}
                                                            className="hidden"
                                                        />
                                                        <div className="text-xl md:text-2xl w-12 h-12 md:w-16 md:h-16 bg-slate-100 dark:bg-slate-800/80 rounded-xl md:rounded-2xl flex items-center justify-center shadow-md border border-slate-200/50 dark:border-slate-700/50 group-hover:scale-105 transition-transform">
                                                            {opt.icon}
                                                        </div>
                                                        <div>
                                                            <span className="text-base md:text-lg font-bold block">
                                                                {opt.label}
                                                            </span>
                                                            <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-400">
                                                                {opt.desc}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={`w-6 h-6 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-350 ${isSelected
                                                        ? "bg-emerald-500 scale-100 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                                        : "bg-slate-200 dark:bg-slate-800 scale-90 opacity-0 md:group-hover:opacity-100"
                                                        }`}>
                                                        <Check className="w-4 h-4 md:w-5 md:h-5 text-white stroke-[4.5px]" />
                                                    </div>
                                                </label>

                                                {opt.id === "solved" && isSelected && (
                                                    <div className={`ml-4 md:ml-8 p-6 md:p-8 rounded-3xl md:rounded-4xl border space-y-6 animate-in slide-in-from-top-4 duration-400 ${statusNestedContainer}`}>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {[
                                                                { id: 'correct', label: 'Correct', color: 'text-emerald-400', bg: 'bg-emerald-500/10', desc: 'At least one accepted answer' },
                                                                { id: 'incorrect', label: 'Incorrect', color: 'text-rose-400', bg: 'bg-rose-500/10', desc: 'Failed or pending answers' }
                                                            ].map((sub) => (
                                                                <button
                                                                    key={sub.id}
                                                                    onClick={() => {
                                                                        const key = sub.id as 'correct' | 'incorrect';
                                                                        const otherKey = key === 'correct' ? 'incorrect' : 'correct';
                                                                        if (filters.statusSub[key] && !filters.statusSub[otherKey]) return;
                                                                        
                                                                        setFilters({
                                                                            ...filters,
                                                                            statusSub: {
                                                                                ...filters.statusSub,
                                                                                [key]: !filters.statusSub[key]
                                                                            }
                                                                        });
                                                                    }}
                                                                    className={`flex items-center gap-4 p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 outline-none select-none active:scale-[0.98] ${statusSubBtnClass(filters.statusSub[sub.id as 'correct' | 'incorrect'])}`}
                                                                >
                                                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${sub.bg} ${sub.color} flex items-center justify-center shrink-0`}>
                                                                        {filters.statusSub[sub.id as 'correct' | 'incorrect'] ? <Check className="w-4 h-4 stroke-[4px]" /> : <div className="w-4 h-4" />}
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <span className="text-sm md:text-base font-bold block leading-tight">{sub.label}</span>
                                                                        <span className="text-[10px] text-slate-400 dark:text-slate-450">{sub.desc}</span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <div className="h-px bg-linear-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

                                                        <button
                                                            onClick={() => setFilters({
                                                                ...filters,
                                                                statusSub: {
                                                                    ...filters.statusSub,
                                                                    hasOne: !filters.statusSub.hasOne
                                                                }
                                                            })}
                                                            className={`w-full flex items-center justify-between p-4 md:p-6 rounded-2xl transition-all duration-400 border outline-none select-none active:scale-[0.99] ${statusHasOneClass}`}
                                                        >
                                                            <div className="flex flex-col items-start gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`p-1.5 rounded-lg transition-colors ${filters.statusSub.hasOne ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                                                                        <BadgeCheck className="w-4 h-4" />
                                                                    </div>
                                                                    <span className="text-base md:text-lg font-bold">Has One</span>
                                                                </div>
                                                                <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-450 ml-8 text-left">Match at least one submission criteria</span>
                                                            </div>
                                                            <div className={`w-12 h-6 md:w-14 md:h-7 rounded-full p-1 transition-all duration-400 ${filters.statusSub.hasOne ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                                                <div className={`w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transition-all duration-400 ${filters.statusSub.hasOne ? 'translate-x-6 md:translate-x-7' : 'translate-x-0'}`} />
                                                            </div>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sticky Bottom Actions */}
                    <div className="mt-6 md:mt-8 pt-2 shrink-0">
                        <button
                            onClick={handleClose}
                            className={`w-full py-4 text-white rounded-2xl md:rounded-4xl text-sm md:text-lg font-black shadow-[0_15px_30px_-8px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-2 md:gap-4 group cursor-pointer ${applyBtnClass}`}
                        >
                            <div className="flex items-center gap-2">
                                Apply Filters
                                {activeFilterCount > 0 && (
                                    <span className="bg-white/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-sm font-bold backdrop-blur-md">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </div>
                            <div className="bg-white/10 p-1 rounded-full group-hover:translate-x-1 transition-transform">
                                <Check className="w-4 h-4 md:w-5 md:h-5 stroke-[3px]" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(ModalContent, document.body);
}
