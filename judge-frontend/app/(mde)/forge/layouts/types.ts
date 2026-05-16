import { ReactNode, RefObject, MouseEvent } from "react";

export interface IdeDesktopLayoutProps {
    mainContentRef: RefObject<HTMLDivElement | null>;
    isResizing: boolean;
    mainContentWidth: number;
    secondaryContentWidth: number;
    onMouseDownMain: (e: MouseEvent<HTMLDivElement>) => void;
    onMouseDownSecondary: (e: MouseEvent<HTMLDivElement>) => void;
    titlePanel: ReactNode;
    editorPanel: ReactNode;
    inputPanel: ReactNode;
    outputPanel: ReactNode;
}
