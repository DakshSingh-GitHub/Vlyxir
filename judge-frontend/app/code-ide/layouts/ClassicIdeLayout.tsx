import { useEffect, useRef } from "react";
import { anime } from "../../lib/anime";
import type { IdeDesktopLayoutProps } from "./types";

export default function ClassicIdeLayout({ mainContentRef, titlePanel, editorPanel, inputPanel, outputPanel }: IdeDesktopLayoutProps) {
    const introRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!introRef.current) return;
        const animation = anime({
            targets: introRef.current.querySelectorAll("[data-layout-panel]"),
            opacity: [0, 1],
            translateY: [14, 0],
            duration: 500,
            delay: (_el: Element, index: number) => index * 70,
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
        <div ref={introRef} className="flex-1 min-h-0 grid grid-cols-12 gap-6 md:gap-8">
            <div ref={mainContentRef} data-layout-panel className="col-span-8 min-h-0">
                {editorPanel}
            </div>
            <div data-layout-panel className="col-span-4 min-h-0 flex flex-col gap-6">
                <div className="shrink-0">{titlePanel}</div>
                <div className="h-50 shrink-0">{inputPanel}</div>
                <div className="flex-1 min-h-0">{outputPanel}</div>
            </div>
        </div>
    );
}
