"use client";

import { useEffect, useRef, useState } from "react";
import { anime } from "../../lib/anime";
import type { DesktopLayoutProps } from "./types";
import { useAppContext } from "../../lib/context";
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
                    className="min-h-0 min-w-0 overflow-hidden rounded-2xl border border-slate-700/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(10,15,26,0.92))] backdrop-blur-xl shadow-[0_16px_36px_rgba(2,6,23,0.24)] flex flex-col"
                >
                    <div className="px-4 py-3 border-b border-slate-700/70 bg-slate-950/30 z-20 relative">
                        <div className="relative flex w-full rounded-xl bg-slate-900/70 p-1 isolate shadow-inner ring-1 ring-slate-700/70">
                            <div
                                className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-slate-800 shadow-sm z-0 will-change-transform ring-1 ring-slate-700/70"
                                style={{
                                    transform: `translateX(${leftPanelTab === "selector" ? "0%" : "100%"}) translateZ(0)`,
                                    transition: reduceMotion ? "none" : "transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)"
                                }}
                            >
                                <div className="absolute inset-0 rounded-lg bg-linear-to-b from-white/5 to-transparent" />
                                <div className="absolute inset-0 rounded-lg opacity-0 dark:opacity-100 transition-opacity duration-300" />
                            </div>
                            
                            <button
                                onClick={() => setLeftPanelTab("selector")}
                                className={`flex-1 relative z-10 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-lg group ${leftPanelTab === "selector"
                                    ? "text-white"
                                    : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                <List className={`w-4 h-4 transition-transform duration-300 ${leftPanelTab === "selector" ? "scale-110 stroke-[2.5px] text-slate-200" : "group-hover:scale-105"}`} />
                                <span className="tracking-wide">Problems</span>
                            </button>
                            <button
                                onClick={() => setLeftPanelTab("description")}
                                className={`flex-1 relative z-10 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-lg group ${leftPanelTab === "description"
                                    ? "text-white"
                                    : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                <FileText className={`w-4 h-4 transition-transform duration-300 ${leftPanelTab === "description" ? "scale-110 stroke-[2.5px] text-slate-200" : "group-hover:scale-105"}`} />
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
                        className="rounded-full bg-transparent hover:bg-slate-600/30 cursor-col-resize transition-colors duration-200"
                />

                <div data-layout-panel style={{ gridArea: "editor" }} className="min-h-0 min-w-0">
                    {editorPanel}
                </div>
            </div>
        </div>
    );
}
