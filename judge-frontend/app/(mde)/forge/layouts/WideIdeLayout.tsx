import { useEffect, useRef } from "react";
import { anime } from "../../../lib/utils/anime";
import type { IdeDesktopLayoutProps } from "./types";

export default function WideIdeLayout({
    mainContentRef,
    isResizing,
    mainContentWidth,
    secondaryContentWidth,
    onMouseDownMain,
    onMouseDownSecondary,
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
                    gridTemplateRows: `minmax(0, calc(${mainContentWidth}% - 0.5rem)) 0.375rem minmax(0, calc(${100 - mainContentWidth}% - 0.5rem))`,
                    gridTemplateColumns: "minmax(0, 1fr)",
                    gridTemplateAreas: `
                        "editor"
                        "mdiv"
                        "bottom"
                    `,
                    transition: isResizing
                        ? "none"
                        : "grid-template-rows 300ms cubic-bezier(0.4,0,0.2,1)"
                }}
            >
                <div data-layout-panel style={{ gridArea: "editor" }} className="min-h-0 min-w-0">
                    {editorPanel}
                </div>

                <div
                    style={{ gridArea: "mdiv" }}
                    onMouseDown={onMouseDownMain}
                    className="rounded-full bg-transparent hover:bg-slate-600/30 cursor-row-resize transition-colors duration-200"
                />

                <div style={{ gridArea: "bottom" }} className="min-h-0 min-w-0 flex flex-col gap-4">
                    <div className="shrink-0 lg:hidden">{titlePanel}</div>
                    <div
                        className="flex-1 grid gap-4"
                        style={{
                            gridTemplateColumns: `minmax(0, calc(${secondaryContentWidth}% - 0.5rem)) 0.375rem minmax(0, calc(${100 - secondaryContentWidth}% - 0.5rem))`,
                            gridTemplateRows: "minmax(0, 1fr)",
                            gridTemplateAreas: `"input sdiv output"`,
                            transition: isResizing
                                ? "none"
                                : "grid-template-columns 300ms cubic-bezier(0.4,0,0.2,1)"
                        }}
                    >
                        <div data-layout-panel style={{ gridArea: "input" }} className="min-h-0 min-w-0">
                            {inputPanel}
                        </div>

                        <div
                            style={{ gridArea: "sdiv" }}
                            onMouseDown={onMouseDownSecondary}
                            className="rounded-full bg-transparent hover:bg-slate-600/30 cursor-col-resize transition-colors duration-200"
                        />

                        <div data-layout-panel style={{ gridArea: "output" }} className="min-h-0 min-w-0">
                            {outputPanel}
                        </div>
                    </div>
                </div>
            </div>
            {/* Desktop floating title for Wide layout if needed, or just part of editor */}
            <div className="absolute top-4 right-4 z-20 hidden lg:block pointer-events-none opacity-50">
                {titlePanel}
            </div>
        </div>
    );
}
