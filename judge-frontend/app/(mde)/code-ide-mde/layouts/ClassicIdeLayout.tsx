import { useEffect, useRef } from "react";
import { anime } from "../../../lib/utils/anime";
import type { IdeDesktopLayoutProps } from "./types";

export default function ClassicIdeLayout({
    mainContentRef,
    isResizing,
    mainContentWidth,
    onMouseDownMain,
    titlePanel,
    editorPanel,
    inputPanel,
    outputPanel
}: IdeDesktopLayoutProps) {
    const introRef = useRef<HTMLDivElement>(null);

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
        <div ref={introRef} className="flex-1 overflow-hidden relative z-10">
            <div
                ref={mainContentRef}
                data-content-area
                className="h-full w-full grid gap-4"
                style={{
                    gridTemplateColumns: `minmax(0, calc(${mainContentWidth}% - 0.5rem)) 0.375rem minmax(0, calc(${100 - mainContentWidth}% - 0.5rem))`,
                    gridTemplateRows: "minmax(0, 1fr)",
                    gridTemplateAreas: `"editor mdiv tools"`,
                    transition: isResizing
                        ? "none"
                        : "grid-template-columns 300ms cubic-bezier(0.4,0,0.2,1)"
                }}
            >
                <div data-layout-panel style={{ gridArea: "editor" }} className="min-h-0 min-w-0">
                    {editorPanel}
                </div>

                <div
                    style={{ gridArea: "mdiv" }}
                    onMouseDown={onMouseDownMain}
                    className="rounded-full bg-transparent hover:bg-slate-600/30 cursor-col-resize transition-colors duration-200"
                />

                <div data-layout-panel style={{ gridArea: "tools" }} className="min-h-0 min-w-0 flex flex-col gap-4">
                    <div className="shrink-0">{titlePanel}</div>
                    <div className="h-48 shrink-0">{inputPanel}</div>
                    <div className="flex-1 min-h-0">{outputPanel}</div>
                </div>
            </div>
        </div>
    );
}
