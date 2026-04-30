/* eslint-disable @typescript-eslint/no-unused-vars */
import { Problem } from "../app/lib/types/types";
import { Sparkles, Terminal } from "lucide-react";
import { memo, useEffect, useRef } from "react";
import { anime, stagger } from "../app/lib/utils/anime";

interface ProblemViewerProps {
    problem: Problem | null;
}

const ProblemViewer = memo(function ProblemViewer({ problem }: ProblemViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const emptyStateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (problem && containerRef.current) {
            anime({
                targets: containerRef.current,
                opacity: [0, 1],
                duration: 250,
                easing: 'easeOutQuad'
            });

            anime({
                targets: containerRef.current.querySelector("[data-pv-title]"),
                translateY: [12, 0],
                opacity: [0, 1],
                duration: 400,
                easing: 'easeOutExpo'
            });

            anime({
                targets: containerRef.current.querySelectorAll("[data-pv-section]"),
                translateY: [16, 0],
                scale: [0.985, 1],
                opacity: [0, 1],
                delay: stagger(70),
                duration: 520,
                easing: 'easeOutCubic'
            });
        }
    }, [problem]);

    useEffect(() => {
        if (!problem && emptyStateRef.current) {
            anime({
                targets: emptyStateRef.current,
                translateY: [10, 0],
                opacity: [0, 1],
                duration: 420,
                easing: 'easeOutCubic'
            });
        }
    }, [problem]);

    if (!problem) {
        return (
            <div
                ref={emptyStateRef}
                className="flex flex-col items-center justify-center h-full text-center"
            >
                <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-gray-50">
                    No Problem Selected
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Please choose a problem from the dropdown above to see its
                    details.
                </p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="space-y-6"
        >
            <h2
                data-pv-title
                className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 bg-clip-text bg-linear-to-r from-gray-900 to-gray-600 dark:from-gray-50 dark:to-gray-400"
            >
                {typeof problem.title === 'string' ? problem.title : JSON.stringify(problem.title || "Untitled")}
            </h2>

            <div
                data-pv-section
                className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-900/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none"
            >
                {typeof problem.description === 'string' ? problem.description : JSON.stringify(problem.description)}
            </div>

            {problem.input_format && (
                <div
                    data-pv-section
                    className="space-y-2 group"
                >
                    <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-50 group-hover:text-indigo-500 transition-colors">
                        Input Format
                    </h4>
                    <div className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-transparent hover:border-indigo-500/30 transition-all whitespace-pre-wrap">
                        {typeof problem.input_format === 'string' ? problem.input_format : JSON.stringify(problem.input_format)}
                    </div>
                </div>
            )}

            {problem.output_format && (
                <div
                    data-pv-section
                    className="space-y-2 group"
                >
                    <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-50 group-hover:text-indigo-500 transition-colors">
                        Output Format
                    </h4>
                    <div className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-transparent hover:border-indigo-500/30 transition-all whitespace-pre-wrap">
                        {typeof problem.output_format === 'string' ? problem.output_format : JSON.stringify(problem.output_format)}
                    </div>
                </div>
            )}

            {problem.sample_test_cases && problem.sample_test_cases.length > 0 && (
                <div
                    data-pv-section
                    className="space-y-3"
                >
                    <h4 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Example
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input</span>
                                <div className="h-1 flex-1 mx-3 bg-gray-100 dark:bg-gray-800 rounded-full" />
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-950/50 rounded-xl border border-gray-200 dark:border-gray-800 font-mono text-sm text-gray-800 dark:text-gray-300 overflow-x-auto">
                                <pre className="whitespace-pre-wrap">{typeof problem.sample_test_cases[0].input === 'string' ? problem.sample_test_cases[0].input : JSON.stringify(problem.sample_test_cases[0].input || '')}</pre>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Output</span>
                                <div className="h-1 flex-1 mx-3 bg-gray-100 dark:bg-gray-800 rounded-full" />
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-950/50 rounded-xl border border-gray-200 dark:border-gray-800 font-mono text-sm text-gray-800 dark:text-gray-300 overflow-x-auto relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                                <pre className="whitespace-pre-wrap">{typeof problem.sample_test_cases[0].output === 'string' ? problem.sample_test_cases[0].output : JSON.stringify(problem.sample_test_cases[0].output || '')}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {problem.constraints && (
                <div
                    data-pv-section
                    className="space-y-2"
                >
                    <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-50">
                        Constraints
                    </h4>
                    <pre className="mt-1 p-4 bg-gray-100 dark:bg-gray-900 rounded-xl text-sm text-gray-800 dark:text-gray-200 overflow-x-auto border border-gray-200 dark:border-gray-700">
                        <code className="font-mono whitespace-pre-wrap">
                            {problem.constraints && typeof problem.constraints === 'object' ? (
                                Object.entries(problem.constraints)
                                    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`)
                                    .join('\n')
                            ) : (
                                typeof problem.constraints === 'string' ? problem.constraints : JSON.stringify(problem.constraints || '')
                            )}
                        </code>
                    </pre>
                </div>
            )}
        </div>
    );
});
ProblemViewer.displayName = "ProblemViewer";

export default ProblemViewer;
