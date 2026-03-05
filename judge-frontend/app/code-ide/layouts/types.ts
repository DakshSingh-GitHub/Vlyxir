import type { ReactNode, RefObject } from "react";

export interface IdeDesktopLayoutProps {
    mainContentRef: RefObject<HTMLDivElement | null>;
    titlePanel: ReactNode;
    editorPanel: ReactNode;
    inputPanel: ReactNode;
    outputPanel: ReactNode;
}
