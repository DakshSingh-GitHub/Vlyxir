"use client";

import { useEffect, useRef, useState } from "react";
import { anime } from "../../../lib/utils/anime";
import type { DesktopLayoutProps } from "./types";
import { useAppContext } from "../../../lib/auth/context";
import { List, FileText } from "lucide-react";

type LeftPanelTab = "selector" | "description";

export default function GroupedSwitchLayout({
    mainContentRef,
    selectedProblemId,
    isResizing,
    mainContentWidth,
    onMouseDownMain,
    problemList,
    problemDescription,
    editorPanel
}: DesktopLayoutProps) {
    const introRef = useRef<HTMLDivElement>(null);
    const [leftPanelTab, setLeftPanelTab] = useState<LeftPanelTab>("selector");
    const { reduceMotion } = useAppContext();

    // Initial intro animation using anime.js
    useEffect(() => {
        if (!introRef.current) return;

        const animation = anime({
            targets: introRef.current.querySelectorAll("[data-layout-panel]"),
            opacity: [0, 1],
            translateY: [16, 0],
            scale: [0.995, 1],
            duration: 520,
            delay: (_el: Element, index: number) => index * 60,
            easing: "easeOutCubic"
        });

        const maybeThenable = animation as unknown as { catch?: (onRejected: () => void) => void };
        maybeThenable.catch?.(() => undefined);

        return () => {
            const maybeCancelable = animation as { cancel?: () => void };
            maybeCancelable.cancel?.();
        };
    }, []);

    useEffect(() => {
        if (selectedProblemId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLeftPanelTab("description");
        }
    }, [selectedProblemId]);

    const transitionStyle = reduceMotion
        ? "none"
        : "transform 400ms cubic-bezier(0.19, 1, 0.22, 1)";

    return (
        <div ref={introRef} className="flex-1 overflow-hidden p-4 relative z-10">
            <div
                ref={mainContentRef}
                data-content-area
                className="h-full w-full grid gap-4"
                style={{
                    gridTemplateColumns: `minmax(0, calc(${mainContentWidth}% - 0.375rem)) 0.375rem minmax(0, calc(${100 - mainContentWidth}% - 0.375rem))`,
                    gridTemplateRows: "minmax(0, 1fr)",
                    gridTemplateAreas: `"left mdiv editor"`,
                    transition: isResizing
                        ? "none"
                        : "grid-template-columns 300ms cubic-bezier(0.4,0,0.2,1), grid-template-rows 300ms cubic-bezier(0.4,0,0.2,1)"
                }}
            >
                <div
                    data-layout-panel
                    style={{ gridArea: "left" }}
                    className="min-h-0 min-w-0 overflow-hidden rounded-2xl border border-white/20 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl flex flex-col"
                >
                    <div className="px-4 py-3 border-b border-gray-100/50 dark:border-gray-800/50 bg-white/40 dark:bg-gray-900/40 z-20 relative">
                        {/* Redesigned Selector with Subtle Glow & Modern Scheme */}
                        <div className="relative flex w-full rounded-xl bg-gray-200/50 dark:bg-black/20 p-1 isolate shadow-inner dark:shadow-black/20 ring-1 ring-black/5 dark:ring-white/5">
                            {/* Sliding Indicator with Soft Glow */}
                            <div
                                className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-white dark:bg-gray-800 shadow-sm shadow-black/10 z-0 will-change-transform ring-1 ring-black/5 dark:ring-white/10"
                                style={{
                                    transform: `translateX(${leftPanelTab === "selector" ? "0%" : "100%"}) translateZ(0)`,
                                    transition: reduceMotion ? "none" : "transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)"
                                }}
                            >
                                {/* Subtle Gradient & Glow Overlay */}
                                <div className="absolute inset-0 rounded-lg bg-linear-to-b from-white/50 to-transparent dark:from-white/5 dark:to-transparent" />
                                <div className="absolute inset-0 rounded-lg opacity-0 dark:opacity-100 shadow-[0_0_15px_-3px_rgba(99,102,241,0.15)] transition-opacity duration-300" />
                            </div>

                            <button
                                onClick={() => setLeftPanelTab("selector")}
                                className={`flex-1 relative z-10 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-lg group ${leftPanelTab === "selector"
                                    ? "text-gray-900 dark:text-gray-100"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                <List className={`w-4 h-4 transition-transform duration-300 ${leftPanelTab === "selector" ? "scale-110 stroke-[2.5px] text-indigo-500 dark:text-indigo-400" : "group-hover:scale-105"}`} />
                                <span className="tracking-wide">Problems</span>
                            </button>
                            <button
                                onClick={() => setLeftPanelTab("description")}
                                className={`flex-1 relative z-10 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-lg group ${leftPanelTab === "description"
                                    ? "text-gray-900 dark:text-gray-100"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                <FileText className={`w-4 h-4 transition-transform duration-300 ${leftPanelTab === "description" ? "scale-110 stroke-[2.5px] text-indigo-500 dark:text-indigo-400" : "group-hover:scale-105"}`} />
                                <span className="tracking-wide">Description</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 overflow-hidden relative transform-gpu">
                        <div
                            className="absolute inset-0 w-full h-full will-change-transform"
                            style={{
                                transform: leftPanelTab === 'selector' ? 'translateX(0%) translateZ(0)' : 'translateX(-100%) translateZ(0)',
                                transition: transitionStyle,
                            }}
                        >
                            {problemList}
                        </div>
                        <div
                            className="absolute inset-0 w-full h-full will-change-transform"
                            style={{
                                transform: leftPanelTab === 'description' ? 'translateX(0%) translateZ(0)' : 'translateX(100%) translateZ(0)',
                                transition: transitionStyle,
                            }}
                        >
                            {problemDescription}
                        </div>
                    </div>
                </div>

                <div
                    style={{ gridArea: "mdiv" }}
                    onMouseDown={onMouseDownMain}
                    className="rounded-full bg-transparent hover:bg-indigo-500/30 cursor-col-resize transition-colors duration-200"
                />

                <div data-layout-panel style={{ gridArea: "editor" }} className="min-h-0 min-w-0">
                    {editorPanel}
                </div>
            </div>
        </div>
    );
}
