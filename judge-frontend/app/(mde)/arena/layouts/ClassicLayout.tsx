import { useEffect, useRef } from "react";
import { anime } from "../../../lib/utils/anime";
import type { DesktopLayoutProps } from "./types";
import { useAppContext } from "../../../lib/auth/context";

export default function ClassicLayout({
    mainContentRef,
    isSidebarOpen,
    isResizing,
    sidebarWidth,
    mainContentWidth,
    onMouseDownSidebar,
    onMouseDownMain,
    problemList,
    problemDescription,
    editorPanel
}: DesktopLayoutProps) {
    const introRef = useRef<HTMLDivElement>(null);
    const { isDark } = useAppContext();

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

    return (
        <div ref={introRef} className="flex-1 overflow-hidden p-4 relative z-10">
            <div
                ref={mainContentRef}
                data-content-area
                className="h-full w-full grid gap-4"
                style={{
                    gridTemplateColumns: `${isSidebarOpen ? `${sidebarWidth}px` : "0px"} 0.375rem minmax(0, calc(${mainContentWidth}% - 0.75rem)) 0.375rem minmax(0, calc(${100 - mainContentWidth}% - 0.75rem))`,
                    gridTemplateRows: "minmax(0, 1fr)",
                    gridTemplateAreas: `"list sdiv desc mdiv editor"`,
                    transition: isResizing
                        ? "none"
                        : "grid-template-columns 300ms cubic-bezier(0.4,0,0.2,1), grid-template-rows 300ms cubic-bezier(0.4,0,0.2,1)"
                }}
            >
                <div
                    data-layout-panel
                    style={{ gridArea: "list" }}
                    className={`min-h-0 min-w-0 overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${isDark
                        ? "border-slate-700/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(10,15,26,0.92))] shadow-[0_16px_36px_rgba(2,6,23,0.24)]"
                        : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                        } ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                    {problemList}
                </div>

                <div
                    style={{ gridArea: "sdiv" }}
                    onMouseDown={onMouseDownSidebar}
                    className={`rounded-full bg-transparent cursor-col-resize transition-colors duration-200 ${isDark ? "hover:bg-slate-600/30" : "hover:bg-slate-300/70"}`}
                />

                <div data-layout-panel style={{ gridArea: "desc" }} className="min-h-0 min-w-0">
                    {problemDescription}
                </div>

                <div
                    style={{ gridArea: "mdiv" }}
                    onMouseDown={onMouseDownMain}
                    className={`rounded-full bg-transparent cursor-col-resize transition-colors duration-200 ${isDark ? "hover:bg-slate-600/30" : "hover:bg-slate-300/70"}`}
                />

                <div data-layout-panel style={{ gridArea: "editor" }} className="min-h-0 min-w-0">
                    {editorPanel}
                </div>
            </div>
        </div>
    );
}
