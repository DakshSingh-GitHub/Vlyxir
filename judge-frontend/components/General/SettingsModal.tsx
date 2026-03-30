"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { anime } from "../../app/lib/anime";
import { useAppContext } from "../../app/lib/context";
import { Moon, Sun, Monitor, Type, PencilRuler, Sparkles, Smartphone, Cpu, RotateCcw, X, LayoutGrid } from "lucide-react";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLButtonElement>(null);
    const fontScaleRafRef = useRef<number | null>(null);
    const {
        themeMode,
        setThemeMode,
        appFontScale,
        setAppFontScale,
        editorFontSize,
        setEditorFontSize,
        reduceMotion,
        setReduceMotion,
        hardwareAcceleratedThemeAnimations,
        setHardwareAcceleratedThemeAnimations,
        autoHideMobilePills,
        setAutoHideMobilePills,
        useNewUi,
        setUseNewUi,
        resetUiSettings
    } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();
    const [fontScalePercent, setFontScalePercent] = useState(Math.round(appFontScale * 100));

    useEffect(() => {
        if (!isOpen) return;
        setFontScalePercent(Math.round(appFontScale * 100));
    }, [appFontScale, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        if (backdropRef.current) {
            anime({
                targets: backdropRef.current,
                opacity: [0, 1],
                duration: 200,
                easing: "easeOutQuad"
            });
        }
        if (panelRef.current) {
            anime({
                targets: panelRef.current,
                opacity: [0, 1],
                translateY: [14, 0],
                scale: [0.98, 1],
                duration: 280,
                easing: "easeOutCubic"
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        return () => {
            if (fontScaleRafRef.current !== null) {
                window.cancelAnimationFrame(fontScaleRafRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const isJudgePath = pathname === "/code-judge" || pathname === "/code-judge-mde";
        if (!isJudgePath) return;
        const targetPath = useNewUi ? "/code-judge-mde" : "/code-judge";
        if (pathname !== targetPath) {
            router.replace(targetPath);
        }
    }, [pathname, router, useNewUi]);

    const applyLiveFontScale = useCallback((percent: number) => {
        const normalized = Math.min(120, Math.max(85, percent));
        if (fontScaleRafRef.current !== null) {
            window.cancelAnimationFrame(fontScaleRafRef.current);
        }
        fontScaleRafRef.current = window.requestAnimationFrame(() => {
            document.documentElement.style.setProperty("--app-font-scale", String(normalized / 100));
            fontScaleRafRef.current = null;
        });
    }, []);

    const commitFontScale = useCallback((percent: number) => {
        const normalized = Math.min(120, Math.max(85, percent));
        const nextScale = normalized / 100;
        if (Math.abs(nextScale - appFontScale) > 0.0001) {
            setAppFontScale(nextScale);
        }
    }, [appFontScale, setAppFontScale]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <button
                ref={backdropRef}
                onClick={onClose}
                className="absolute inset-0 bg-black/45 backdrop-blur-sm opacity-0"
                aria-label="Close settings"
            />
            <div
                ref={panelRef}
                className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 dark:border-gray-700/60 bg-white/95 dark:bg-gray-900/95 shadow-2xl opacity-0"
            >
                <div className="px-6 py-5 border-b border-gray-100/80 dark:border-gray-800/70 bg-linear-to-r from-indigo-500/10 via-cyan-500/5 to-transparent">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Settings</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Customize your CodeJudge workspace.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Close settings"
                        >
                            <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Theme</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-gray-100/80 dark:bg-gray-800/70 border border-gray-200/70 dark:border-gray-700/70">
                            {[
                                { id: "light", label: "Light", icon: Sun },
                                { id: "dark", label: "Dark", icon: Moon },
                                { id: "system", label: "System", icon: Monitor }
                            ].map((option) => {
                                const Icon = option.icon;
                                const selected = themeMode === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => setThemeMode(option.id as "light" | "dark" | "system")}
                                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${selected
                                            ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                            }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Type className="w-4 h-4 text-cyan-500" />
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">UI Font Scale</h4>
                            </div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{fontScalePercent}%</span>
                        </div>
                        <input
                            type="range"
                            min={85}
                            max={120}
                            step={1}
                            value={fontScalePercent}
                            onChange={(e) => {
                                const nextPercent = Number(e.target.value);
                                setFontScalePercent(nextPercent);
                                applyLiveFontScale(nextPercent);
                            }}
                            onPointerUp={() => commitFontScale(fontScalePercent)}
                            onKeyUp={() => commitFontScale(fontScalePercent)}
                            onBlur={() => commitFontScale(fontScalePercent)}
                            className="w-full accent-indigo-500"
                        />
                    </section>

                    <section className="hidden space-y-3 md:block">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4 text-violet-500" />
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Code Judge UI</h4>
                        </div>
                        <label className="flex items-center justify-between rounded-2xl border border-gray-200/80 dark:border-gray-700/70 p-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">New UI</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Switches Code Judge to the alternate route and navbar.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={useNewUi}
                                onChange={(e) => setUseNewUi(e.target.checked)}
                                className="h-4 w-4 accent-violet-600"
                            />
                        </label>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PencilRuler className="w-4 h-4 text-emerald-500" />
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Editor Font Size</h4>
                            </div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{editorFontSize}px</span>
                        </div>
                        <input
                            type="range"
                            min={12}
                            max={22}
                            step={1}
                            value={editorFontSize}
                            onChange={(e) => setEditorFontSize(Number(e.target.value))}
                            className="w-full accent-emerald-500"
                        />
                    </section>

                    <section className="space-y-3">
                        <label className="flex items-center justify-between rounded-2xl border border-gray-200/80 dark:border-gray-700/70 p-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Reduce Motion</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Minimizes heavy transitions and animations.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={reduceMotion}
                                onChange={(e) => setReduceMotion(e.target.checked)}
                                className="h-4 w-4 accent-indigo-600"
                            />
                        </label>
                        <label className="flex items-center justify-between rounded-2xl border border-gray-200/80 dark:border-gray-700/70 p-4">
                            <div className="flex items-start gap-2">
                                <Cpu className="w-4 h-4 mt-0.5 text-cyan-500" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Hardware Accelerated Theme Animations</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Uses GPU compositor hints to smooth theme transitions.</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={hardwareAcceleratedThemeAnimations}
                                onChange={(e) => setHardwareAcceleratedThemeAnimations(e.target.checked)}
                                className="h-4 w-4 accent-cyan-600"
                            />
                        </label>
                        <label className="flex items-center justify-between rounded-2xl border border-gray-200/80 dark:border-gray-700/70 p-4">
                            <div className="flex items-start gap-2">
                                <Smartphone className="w-4 h-4 mt-0.5 text-violet-500" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Auto-hide Mobile Pills</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Hide floating tab pills while scrolling.</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={autoHideMobilePills}
                                onChange={(e) => setAutoHideMobilePills(e.target.checked)}
                                className="h-4 w-4 accent-violet-600"
                            />
                        </label>
                    </section>
                </div>

                <div className="px-6 py-4 border-t border-gray-100/80 dark:border-gray-800/70 bg-gray-50/80 dark:bg-gray-900/70 flex justify-end">
                    <button
                        onClick={resetUiSettings}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Defaults
                    </button>
                </div>
            </div>
        </div>
    );
}
