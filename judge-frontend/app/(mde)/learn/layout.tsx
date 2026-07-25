"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import TopicSidebar from "./components/TopicSidebar";
import { useAppContext } from "../../lib/auth/context";
import { BookOpen, List, FileText } from "lucide-react";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
    const { isDark } = useAppContext();
    const pathname = usePathname();
    const [sidebarWidth, setSidebarWidth] = useState(320); // default ~30% width
    const [isResizing, setIsResizing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileTab, setMobileTab] = useState<"sidebar" | "content">("content");
    const isResizingRef = useRef(false);
    const requestRef = useRef<number | null>(null);

    // State for completed & bookmarked topics saved in localStorage
    const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
    const [bookmarkedTopics, setBookmarkedTopics] = useState<Set<string>>(new Set());

    useEffect(() => {
        try {
            const savedCompleted = localStorage.getItem("vlyxir_learn_completed");
            if (savedCompleted) {
                setCompletedTopics(new Set(JSON.parse(savedCompleted)));
            }
            const savedBookmarked = localStorage.getItem("vlyxir_learn_bookmarked");
            if (savedBookmarked) {
                setBookmarkedTopics(new Set(JSON.parse(savedBookmarked)));
            }
        } catch (e) {
            console.error("Failed to load learn progress", e);
        }
    }, []);

    const toggleBookmark = useCallback((topicId: string, e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        setBookmarkedTopics(prev => {
            const next = new Set(prev);
            if (next.has(topicId)) {
                next.delete(topicId);
            } else {
                next.add(topicId);
            }
            localStorage.setItem("vlyxir_learn_bookmarked", JSON.stringify(Array.from(next)));
            return next;
        });
    }, []);

    // Check responsive screen size
    useEffect(() => {
        const checkScreen = () => {
            const width = window.innerWidth;
            setIsMobile(width < 1024);
        };
        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);

    // Resizable handle logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizingRef.current) return;
            if (requestRef.current) return;

            requestRef.current = requestAnimationFrame(() => {
                const newWidth = Math.max(240, Math.min(550, e.clientX - 16));
                setSidebarWidth(newWidth);
                requestRef.current = null;
            });
        };

        const handleMouseUp = () => {
            isResizingRef.current = false;
            setIsResizing(false);
            document.body.style.cursor = "default";
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizingRef.current = true;
        setIsResizing(true);
        document.body.style.cursor = "col-resize";
    }, []);

    return (
        <div className={`flex-1 flex flex-col min-h-0 relative overflow-hidden font-sans ${isDark ? "text-gray-100" : "text-slate-900"}`}>
            {/* Background Ambient Glows */}
            <div className={`pointer-events-none absolute inset-0 ${isDark ? "bg-[radial-gradient(circle_at_top,rgba(51,65,85,0.32),transparent_38%),linear-gradient(135deg,rgba(2,6,23,0.18),transparent_35%,rgba(15,23,42,0.3)_100%)]" : "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),transparent_38%),linear-gradient(135deg,rgba(241,245,249,0.8),transparent_35%,rgba(226,232,240,0.8)_100%)]"}`} />
            <div className={`pointer-events-none absolute left-[-8%] top-[12%] h-72 w-72 rounded-full blur-[130px] ${isDark ? "bg-indigo-900/30" : "bg-indigo-200/50"}`} />
            <div className={`pointer-events-none absolute bottom-[-6%] right-[-5%] h-80 w-80 rounded-full blur-[150px] ${isDark ? "bg-purple-900/30" : "bg-purple-200/40"}`} />

            {/* Mobile Tab Switcher */}
            {isMobile && (
                <div className="flex items-center justify-center gap-2 p-3 z-20 shrink-0">
                    <div className="flex items-center gap-1 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg">
                        <button
                            onClick={() => setMobileTab("sidebar")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${mobileTab === "sidebar"
                                ? "bg-indigo-600 text-white shadow-md"
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                }`}
                        >
                            <List className="w-3.5 h-3.5" />
                            <span>Curriculum</span>
                        </button>
                        <button
                            onClick={() => setMobileTab("content")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${mobileTab === "content"
                                ? "bg-indigo-600 text-white shadow-md"
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                }`}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Topic Content</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Resizable Layout Container */}
            <div className="flex-1 min-h-0 overflow-hidden p-4 relative z-10">
                {isMobile ? (
                    <div className="h-full w-full flex flex-col min-h-0">
                        {mobileTab === "sidebar" ? (
                            <div className="h-full min-h-0 overflow-hidden">
                                <TopicSidebar
                                    completedTopics={completedTopics}
                                    bookmarkedTopics={bookmarkedTopics}
                                    toggleBookmark={toggleBookmark}
                                    onSelectTopicMobile={() => setMobileTab("content")}
                                />
                            </div>
                        ) : (
                            <div className="h-full min-h-0 overflow-hidden">
                                {children}
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        className="h-full w-full grid gap-3"
                        style={{
                            gridTemplateColumns: `${sidebarWidth}px 0.375rem minmax(0, 1fr)`,
                            gridTemplateRows: "minmax(0, 1fr)",
                            gridTemplateAreas: `"sidebar sdiv main"`,
                            transition: isResizing ? "none" : "grid-template-columns 200ms cubic-bezier(0.4,0,0.2,1)"
                        }}
                    >
                        {/* Left Sidebar */}
                        <div style={{ gridArea: "sidebar" }} className="min-h-0 min-w-0 overflow-hidden">
                            <TopicSidebar
                                completedTopics={completedTopics}
                                bookmarkedTopics={bookmarkedTopics}
                                toggleBookmark={toggleBookmark}
                            />
                        </div>

                        {/* Resizable Divider Handle */}
                        <div
                            style={{ gridArea: "sdiv" }}
                            onMouseDown={handleMouseDown}
                            className={`rounded-full bg-transparent cursor-col-resize transition-colors duration-200 ${isDark ? "hover:bg-indigo-500/40" : "hover:bg-indigo-300/70"}`}
                        />

                        {/* Main Content Area */}
                        <div style={{ gridArea: "main" }} className="min-h-0 min-w-0 overflow-hidden">
                            {children}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
