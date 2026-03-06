"use client";

import { useEffect, useState, useRef, memo } from "react";
import { anime, stagger } from "../app/lib/anime";
import { getProblems } from "../app/lib/api";
import { Filter, Check, Sparkles, SlidersHorizontal } from "lucide-react";
import { getSubmissions } from "../app/lib/storage";
import FilterModal from "./General/FilterModal";

import { Problem } from "../app/lib/types";

interface ProblemListProps {
    onSelect: (id: string) => void;
    selectedId?: string;
    setIsSidebarOpen?: (open: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const ProblemList = memo(function ProblemList({ onSelect, selectedId, setIsSidebarOpen, searchQuery, setSearchQuery }: ProblemListProps) {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<{ difficulty: string[]; status: "all" | "solved" | "unsolved" }>({
        difficulty: [],
        status: "all"
    });
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(new Set());
    const filterRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterModalOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    useEffect(() => {
        const fetchProblemsData = async () => {
            const data = await getProblems();
            const problemList: Problem[] = data.problems || [];

            // Fetch solved submissions
            try {
                const submissions = await getSubmissions();
                const solvedIds = new Set(
                    submissions
                        .filter(s => s.final_status === "Accepted")
                        .map(s => s.problemId)
                );
                setSolvedProblemIds(solvedIds);
            } catch (err) {
                console.error("Failed to fetch submissions", err);
            }

            const sessionOrder = sessionStorage.getItem("problemOrder");

            if (sessionOrder) {
                try {
                    const orderIds: string[] = JSON.parse(sessionOrder);
                    const orderedProblems = orderIds
                        .map(id => problemList.find(p => p.id === id))
                        .filter((p): p is Problem => !!p);

                    // Add any problems that might be new or not in session storage
                    const remainingProblems = problemList.filter(p => !orderIds.includes(p.id));
                    setProblems([...orderedProblems, ...remainingProblems]);
                } catch (e) {
                    console.error("Failed to parse session order", e);
                    const shuffled = shuffleArray(problemList);
                    sessionStorage.setItem("problemOrder", JSON.stringify(shuffled.map(p => p.id)));
                    setProblems(shuffled);
                }
            } else {
                const shuffled = shuffleArray(problemList);
                sessionStorage.setItem("problemOrder", JSON.stringify(shuffled.map(p => p.id)));
                setProblems(shuffled);
            }
            setIsLoading(false);
        };

        fetchProblemsData();

        // Listen for new submissions
        const handleSubmissionUpdate = () => {
            getSubmissions().then(submissions => {
                const solvedIds = new Set(
                    submissions
                        .filter(s => s.final_status === "Accepted")
                        .map(s => s.problemId)
                );
                setSolvedProblemIds(solvedIds);
            });
        };

        window.addEventListener('submission-updated', handleSubmissionUpdate);
        return () => window.removeEventListener('submission-updated', handleSubmissionUpdate);
    }, []);

    const filteredProblems = problems.filter((problem) => {
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());

        // Difficulty Filter
        const matchesDifficulty = filters.difficulty.length === 0 ||
            filters.difficulty.includes((problem.difficulty || "medium").toLowerCase());

        // Status Filter
        const isSolved = solvedProblemIds.has(problem.id);
        const matchesStatus = filters.status === "all" ||
            (filters.status === "solved" && isSolved) ||
            (filters.status === "unsolved" && !isSolved);

        return matchesSearch && matchesDifficulty && matchesStatus;
    });

    useEffect(() => {
        if (!isLoading && listRef.current) {
            anime({
                targets: listRef.current.querySelectorAll('li'),
                opacity: [0, 1],
                translateX: [-10, 0],
                translateY: [5, 0],
                delay: stagger(50),
                duration: 600,
                easing: 'easeOutQuad'
            });
        }
    }, [isLoading, filteredProblems.length]);

    useEffect(() => {
        if (!selectedId || !listRef.current) return;
        const selectedItem = listRef.current.querySelector(`[data-problem-id="${selectedId}"]`);
        if (!selectedItem) return;

        anime({
            targets: selectedItem,
            scale: [0.99, 1.01, 1],
            translateX: [0, 4, 0],
            duration: 380,
            easing: 'easeOutCubic'
        });
    }, [selectedId, filteredProblems.length]);

    const getDifficultyStyles = (difficulty?: string) => {
        const diff = (difficulty || "medium").toLowerCase();
        switch (diff) {
            case "easy":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
            case "medium":
                return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
            case "hard":
                return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
            default:
                return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
        }
    };

    const selectRandomProblem = () => {
        if (filteredProblems.length === 0) {
            return;
        }

        const selectableProblems = filteredProblems.length > 1 && selectedId
            ? filteredProblems.filter((problem) => problem.id !== selectedId)
            : filteredProblems;

        const randomProblem = selectableProblems[Math.floor(Math.random() * selectableProblems.length)];
        onSelect(randomProblem.id);

        if (window.innerWidth < 1024 && setIsSidebarOpen) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/5">
            <div className="p-5 border-b border-gray-100/50 dark:border-gray-800/50">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400">
                            <Filter className="w-4 h-4" />
                        </div>
                        Problems
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={selectRandomProblem}
                            disabled={filteredProblems.length === 0}
                            className="p-2 rounded-lg transition-all active:scale-95 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            title="Pick a random problem"
                            aria-label="Pick a random problem"
                        >
                            <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsFilterModalOpen(true)}
                            className={`p-2 rounded-lg transition-all active:scale-95 ${filters.difficulty.length > 0 || filters.status !== "all"
                                ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 relative"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            {(filters.difficulty.length > 0 || filters.status !== "all") && (
                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-xl blur-md transition-opacity opacity-0 group-hover:opacity-100" />
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="relative w-full px-4 py-3 pl-11 text-sm bg-white dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-400 dark:text-white"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 peer-focus:text-indigo-500 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <FilterModal
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    filters={filters}
                    setFilters={setFilters}
                />
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                        <div
                            className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
                        />
                    </div>
                ) : filteredProblems.length === 0 ? (
                    <div
                        className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400 transition-opacity duration-300"
                    >
                        No problems found
                    </div>
                ) : (
                    <ul
                        ref={listRef}
                        className="space-y-2 p-3 pb-24"
                    >
                        {filteredProblems.map((problem) => (
                            <li
                                key={problem.id}
                                className="px-3 opacity-0"
                            >
                                <button
                                    data-problem-id={problem.id}
                                    onClick={() => {
                                        onSelect(problem.id);
                                        if (window.innerWidth < 1024 && setIsSidebarOpen) {
                                            setIsSidebarOpen(false);
                                        }
                                    }}
                                    className={`w-full text-left px-3 py-4 rounded-2xl transition-all duration-300 flex justify-between items-center group relative border border-transparent ${selectedId === problem.id
                                        ? "bg-white dark:bg-gray-800 shadow-xl shadow-indigo-500/10 border-indigo-200/50 dark:border-indigo-500/30 translate-x-1"
                                        : "hover:bg-white/40 dark:hover:bg-gray-800/40 hover:border-white/20 dark:hover:border-white/5 hover:translate-x-1"
                                        }`}
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className={`w-2 h-2 rounded-full shrink-0 transition-colors ${selectedId === problem.id ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "bg-gray-300 dark:bg-gray-700 group-hover:bg-indigo-400/50"}`} />

                                        <div className="flex flex-col overflow-hidden">
                                            <span className={`truncate text-sm font-semibold transition-colors ${selectedId === problem.id ? "text-indigo-900 dark:text-indigo-100" : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100"}`}>
                                                {typeof problem.title === 'string' ? problem.title : JSON.stringify(problem.title || "Untitled")}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        {solvedProblemIds.has(problem.id) && (
                                            <div
                                                className="text-emerald-500"
                                            >
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getDifficultyStyles(typeof problem.difficulty === 'string' ? problem.difficulty : 'medium')}`}>
                                            {typeof problem.difficulty === 'string' ? problem.difficulty : JSON.stringify(problem.difficulty || "Medium")}
                                        </span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
});
ProblemList.displayName = "ProblemList";

export default ProblemList;
