"use client";

import { X, Check, Filter, Layers, BadgeCheck, RotateCcw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { anime } from "../../app/lib/anime";

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
    const [activeCategory, setActiveCategory] = useState<Category>("difficulty");
    const [mounted, setMounted] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Animation for opening
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
                    scale: [0.9, 1],
                    translateY: [30, 0],
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
                translateX: [20, 0],
                duration: 300,
                easing: 'easeOutQuad'
            });
        }
    }, [activeCategory, isOpen]);

    if (!mounted) return null;

    const handleClose = () => {
        // Animation for closing
        anime({
            targets: backdropRef.current,
            opacity: 0,
            duration: 300,
            easing: 'linear'
        });
        anime({
            targets: modalRef.current,
            opacity: 0,
            scale: 0.9,
            translateY: 30,
            duration: 300,
            easing: 'easeInQuad',
            complete: () => onClose()
        });
    };

    const categories = [
        { id: "difficulty", label: "Difficulty", icon: Layers, color: "from-indigo-500 to-blue-600" },
        { id: "status", label: "Status", icon: BadgeCheck, color: "from-emerald-500 to-teal-600" },
    ];

    const difficultyOptions = [
        { id: "easy", label: "Easy", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        { id: "medium", label: "Medium", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        { id: "hard", label: "Hard", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    ];

    const statusOptions: Array<{ id: "all" | "solved" | "unsolved"; label: string; icon: string; desc: string }> = [
        { id: "all", label: "All Problems", icon: "🌐", desc: "Show everything available" },
        { id: "solved", label: "Solved Only", icon: "✅", desc: "Problems you've conquered" },
        { id: "unsolved", label: "Unsolved Only", icon: "🚀", desc: "New challenges to take on" },
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

    if (!isOpen) return null;

    const ModalContent = (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                ref={backdropRef}
                onClick={handleClose}
                className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl opacity-0"
            />

            {/* Modal Card */}
            <div
                ref={modalRef}
                className="relative w-full max-w-3xl bg-white dark:bg-gray-950 rounded-[2rem] md:rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 dark:border-gray-800 flex flex-col md:flex-row h-[550px] md:h-[600px] max-h-[90vh] opacity-0"
            >
                {/* Sidebar / Top Tabs */}
                <div className="w-full md:w-72 bg-gray-50/50 dark:bg-gray-900/40 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 p-4 md:p-8 flex flex-col md:justify-between shrink-0">
                    <div>
                        <div className="hidden md:flex items-center gap-4 mb-10 pl-2">
                            <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30">
                                <Filter className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                Filter
                            </h3>
                        </div>

                        <div className="flex flex-row md:flex-col gap-2 md:space-y-3">
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id as Category)}
                                        className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 md:gap-3 px-3 md:px-5 py-3 md:py-4 rounded-xl md:rounded-[1.5rem] transition-all duration-300 group ${isActive
                                            ? "bg-white dark:bg-gray-800 shadow-md md:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.15)] dark:shadow-none border border-gray-100 dark:border-gray-700"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-800/40"
                                            }`}
                                    >
                                        <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all duration-500 scale-100 ${isActive ? `bg-gradient-to-br ${cat.color} text-white shadow-lg shadow-indigo-500/20` : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                            }`}>
                                            <Icon className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                        <span className={`font-black text-xs md:text-sm transition-colors ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                                            }`}>
                                            {cat.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={resetFilters}
                        className="hidden md:flex items-center justify-center gap-2 w-full py-3 text-xs font-black text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-all active:scale-95 border-2 border-transparent hover:border-indigo-500/10 rounded-xl"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset Selection
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 p-6 md:p-12 min-h-0">
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-6 md:mb-10">
                        <div>
                            <h4 className="text-[10px] md:text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-1 md:mb-3">
                                Filtering By {activeCategory}
                            </h4>
                            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                                {activeCategory === "difficulty" ? "How tough?" : "Your progress"}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={resetFilters}
                                className="md:hidden p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl"
                            >
                                <RotateCcw className="w-5 h-5 text-gray-400" />
                            </button>
                            <button
                                onClick={handleClose}
                                className="p-2.5 md:p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl md:rounded-2xl transition-all group active:scale-90 border border-gray-100 dark:border-gray-800"
                            >
                                <X className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                        <div
                            ref={contentRef}
                            className="space-y-3 md:space-y-4"
                        >
                            {activeCategory === "difficulty" && (
                                <div className="grid grid-cols-1 gap-3 md:gap-4">
                                    {difficultyOptions.map((opt) => (
                                        <label
                                            key={opt.id}
                                            className={`flex items-center justify-between p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] border-2 transition-all cursor-pointer group active:scale-[0.98] ${filters.difficulty.includes(opt.id)
                                                ? `border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/10`
                                                : "border-gray-50 dark:border-gray-900 hover:border-gray-100 dark:hover:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4 md:gap-5">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.difficulty.includes(opt.id)}
                                                    onChange={() => toggleDifficulty(opt.id)}
                                                    className="hidden"
                                                />
                                                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-xs md:text-sm font-black uppercase tracking-tighter ${opt.bg} ${opt.color} border-2 ${opt.border} shadow-sm group-hover:scale-110 transition-transform`}>
                                                    {opt.id[0]}
                                                </div>
                                                <div>
                                                    <span className="capitalize text-base md:text-lg font-bold text-gray-900 dark:text-white block">
                                                        {opt.label}
                                                    </span>
                                                    <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                                                        Show {opt.id} problems
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-500 ${filters.difficulty.includes(opt.id)
                                                ? "bg-indigo-600 scale-100 shadow-lg shadow-indigo-600/40"
                                                : "bg-gray-200 dark:bg-gray-800 scale-90 opacity-0 md:group-hover:opacity-100"
                                                }`}>
                                                <Check className="w-3 h-3 md:w-5 md:h-5 text-white stroke-[4.5px]" />
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {activeCategory === "status" && (
                                <div className="grid grid-cols-1 gap-3 md:gap-4">
                                    {statusOptions.map((opt) => (
                                        <div key={opt.id} className="space-y-4">
                                            <label
                                                className={`flex items-center justify-between p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] border-2 transition-all cursor-pointer group active:scale-[0.98] ${filters.status === opt.id
                                                    ? "border-emerald-600 dark:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/10"
                                                    : "border-gray-50 dark:border-gray-900 hover:border-gray-100 dark:hover:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4 md:gap-5">
                                                    <input
                                                        type="radio"
                                                        name="status"
                                                        checked={filters.status === opt.id}
                                                        onChange={() => setFilters({ ...filters, status: opt.id })}
                                                        className="hidden"
                                                    />
                                                    <div className="text-xl md:text-3xl w-10 h-10 md:w-14 md:h-14 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                                                        {opt.icon}
                                                    </div>
                                                    <div>
                                                        <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white block">
                                                            {opt.label}
                                                        </span>
                                                        <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                                                            {opt.desc}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-500 ${filters.status === opt.id
                                                    ? "bg-emerald-600 scale-100 shadow-lg shadow-emerald-600/40"
                                                    : "bg-gray-200 dark:bg-gray-800 scale-90 opacity-0 md:group-hover:opacity-100"
                                                    }`}>
                                                    <Check className="w-3 h-3 md:w-5 md:h-5 text-white stroke-[4.5px]" />
                                                </div>
                                            </label>

                                            {opt.id === "solved" && filters.status === "solved" && (
                                                <div className="ml-4 md:ml-8 p-6 rounded-[2rem] bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800/50 space-y-6 animate-in slide-in-from-top-4 duration-300">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {[
                                                            { id: 'correct', label: 'Correct', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                                            { id: 'incorrect', label: 'Incorrect', color: 'text-rose-500', bg: 'bg-rose-500/10' }
                                                        ].map((sub) => (
                                                            <button
                                                                key={sub.id}
                                                                onClick={() => {
                                                                    const key = sub.id as 'correct' | 'incorrect';
                                                                    const otherKey = key === 'correct' ? 'incorrect' : 'correct';
                                                                    // Cannot uncheck both
                                                                    if (filters.statusSub[key] && !filters.statusSub[otherKey]) return;
                                                                    
                                                                    setFilters({
                                                                        ...filters,
                                                                        statusSub: {
                                                                            ...filters.statusSub,
                                                                            [key]: !filters.statusSub[key]
                                                                        }
                                                                    });
                                                                }}
                                                                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                                                    filters.statusSub[sub.id as 'correct' | 'incorrect']
                                                                        ? 'border-emerald-500/50 bg-white dark:bg-gray-800 shadow-sm'
                                                                        : 'border-transparent bg-transparent opacity-60 grayscale'
                                                                }`}
                                                            >
                                                                <div className={`w-8 h-8 rounded-lg ${sub.bg} ${sub.color} flex items-center justify-center`}>
                                                                    {filters.statusSub[sub.id as 'correct' | 'incorrect'] ? <Check className="w-4 h-4 stroke-[3px]" /> : <div className="w-4 h-4" />}
                                                                </div>
                                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{sub.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />

                                                    <button
                                                        onClick={() => setFilters({
                                                            ...filters,
                                                            statusSub: {
                                                                ...filters.statusSub,
                                                                hasOne: !filters.statusSub.hasOne
                                                            }
                                                        })}
                                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                                                            filters.statusSub.hasOne 
                                                                ? 'bg-emerald-500/10 border-2 border-emerald-500/20' 
                                                                : 'bg-gray-100/50 dark:bg-gray-800/30 border-2 border-transparent'
                                                        }`}
                                                    >
                                                        <div className="flex flex-col items-start gap-1">
                                                            <span className="text-sm font-black text-gray-900 dark:text-white">Has One</span>
                                                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Show if any submission matches</span>
                                                        </div>
                                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${filters.statusSub.hasOne ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${filters.statusSub.hasOne ? 'translate-x-6' : 'translate-x-0'}`} />
                                                        </div>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sticky Bottom Actions */}
                    <div className="mt-6 md:mt-8 pt-2">
                        <button
                            onClick={handleClose}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 hover:from-indigo-500 hover:to-blue-600 text-white rounded-2xl md:rounded-[2rem] text-sm md:text-lg font-black shadow-[0_15px_30px_-8px_rgba(79,70,229,0.5)] active:scale-[0.97] transition-all flex items-center justify-center gap-2 md:gap-4 group"
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
