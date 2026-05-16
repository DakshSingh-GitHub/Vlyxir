import type { ReactNode, RefObject, MouseEvent } from "react";

export interface DesktopLayoutProps {
    mainContentRef: RefObject<HTMLDivElement | null>;
    selectedProblemId: string;
    isSidebarOpen: boolean;
    isResizing: boolean;
    sidebarWidth: number;
    mainContentWidth: number;
    onMouseDownSidebar: (e: MouseEvent<HTMLDivElement>) => void;
    onMouseDownMain: (e: MouseEvent<HTMLDivElement>) => void;
    problemList: ReactNode;
    problemDescription: ReactNode;
    editorPanel: ReactNode;
}
