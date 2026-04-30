"use client";

import { useEffect, useState, useRef } from "react";
import { getProblems } from "../app/lib/api/api";

interface Problem {
    id: string;
    title: string;
    difficulty?: string;
}

interface ProblemSelectorProps {
    onSelect: (id: string) => void;
}

export default function ProblemSelector({ onSelect }: ProblemSelectorProps) {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getProblems().then((data) => {
            setProblems(data.problems || []);
        });
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelectProblem = (problem: Problem | null) => {
        setSelectedProblem(problem);
        onSelect(problem ? problem.id : "");
        setIsOpen(false);
    };

    const getDifficultyStyles = (difficulty?: string) => {
        const diff = (difficulty || "medium").toLowerCase();
        switch (diff) {
            case "easy":
                return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
            case "medium":
                return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
            case "hard":
                return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
            default:
                return "bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20";
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label id="listbox-label" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Choose a Problem
            </label>
            <button
                type="button"
                className="relative w-full cursor-default rounded-xl bg-white dark:bg-gray-700 py-3 pl-4 pr-10 text-left text-gray-900 dark:text-gray-50 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-labelledby="listbox-label"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center justify-between">
                    <span className="block truncate">{selectedProblem ? selectedProblem.title : "Select a problem"}</span>
                    {selectedProblem && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-tighter mx-2 ${getDifficultyStyles(selectedProblem.difficulty)}`}>
                            {selectedProblem.difficulty || "Medium"}
                        </span>
                    )}
                </div>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.28a.75.75 0 011.06 0L10 15.19l2.47-2.47a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z" clipRule="evenodd" />
                    </svg>
                </span>
            </button>

            {isOpen && (
                <ul
                    className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="listbox"
                    aria-labelledby="listbox-label"
                >
                    <li
                        className="text-gray-900 dark:text-gray-50 relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
                        role="option"
                        aria-selected={!selectedProblem}
                        onClick={() => handleSelectProblem(null)}
                    >
                        <span className="font-normal block truncate">Select a problem</span>
                    </li>
                    {problems.map((problem) => (
                        <li
                            key={problem.id}
                            className="text-gray-900 dark:text-gray-50 relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
                            role="option"
                            aria-selected={selectedProblem?.id === problem.id}
                            onClick={() => handleSelectProblem(problem)}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`font-normal block truncate ${selectedProblem?.id === problem.id ? 'font-semibold' : ''}`}>
                                    {problem.title}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-tighter ${getDifficultyStyles(problem.difficulty)}`}>
                                    {problem.difficulty || "Medium"}
                                </span>
                            </div>
                            {selectedProblem?.id === problem.id ? (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 dark:text-white">
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            ) : null}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
