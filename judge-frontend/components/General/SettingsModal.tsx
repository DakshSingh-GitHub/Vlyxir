/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { anime } from "../../app/lib/utils/anime";
import { useAppContext } from "../../app/lib/auth/context";
import { 
    Moon, 
    Sun, 
    Monitor, 
    Type, 
    PencilRuler, 
    Sparkles, 
    Smartphone, 
    Cpu, 
    RotateCcw, 
    X, 
    LayoutGrid,
    Sliders,
    Info
} from "lucide-react";

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
        const isJudgePath = pathname === "/code-judge" || pathname === "/arena";
        if (!isJudgePath) return;
        const targetPath = useNewUi ? "/arena" : "/code-judge";
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
            {/* Ambient Backdrop Overlay */}
            <button
                ref={backdropRef}
                onClick={onClose}
                className="absolute inset-0 bg-[#020408]/60 dark:bg-black/70 backdrop-blur-md opacity-0 cursor-pointer w-full h-full border-none outline-none"
                aria-label="Close settings"
            />
            
            {/* Settings Terminal Panel Container */}
            <div
                ref={panelRef}
                className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[32px] border border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#0B0C15]/95 shadow-2xl backdrop-blur-2xl opacity-0"
            >
                {/* Visual Header Glow */}
                <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-indigo-500/[0.04] to-transparent pointer-events-none" />

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-white/[0.06] relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 border-indigo-500/20 text-indigo-500 dark:text-indigo-400">
                          Workspace Overrides
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-350" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                          vlyxir.core
                        </span>
                      </div>
                      <h3 className="text-xl font-black tracking-tight mt-1 text-slate-900 dark:text-white">
                        System Configuration
                      </h3>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                      aria-label="Close settings"
                    >
                      <X className="w-4 h-4 text-slate-650 dark:text-slate-300" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Contents panel */}
                <div className="max-h-[65vh] overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
                    
                    {/* Section 1: Themes Cockpit Selector */}
                    <section className="space-y-3.5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Visual Theme Allocation
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200/50 dark:border-white/5">
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
                                        className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                                            selected
                                                ? "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/[0.05] text-indigo-650 dark:text-indigo-400 shadow-sm"
                                                : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        <span>{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Section 2: UI Font Scale Telemetry Slider */}
                    <section className="space-y-3.5 p-4 rounded-2xl border border-slate-100 dark:border-white/[0.04] bg-slate-500/[0.01]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Type className="w-4 h-4 text-cyan-500" />
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-550 dark:text-slate-450">
                                  UI Interface Font Scale
                                </h4>
                            </div>
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md">
                              {fontScalePercent}%
                            </span>
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
                            className="w-full accent-indigo-500 h-1.5 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer"
                        />
                    </section>

                    {/* Section 3: Arena UI Cockpit Override Switch */}
                    <section className="space-y-3.5">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4 text-violet-500" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-550 dark:text-slate-450">
                              System Interface overrides
                            </h4>
                        </div>
                        
                        <div className="flex items-center justify-between rounded-3xl border border-slate-200 dark:border-white/[0.05] p-4 transition-colors duration-300 hover:border-slate-300 dark:hover:border-white/[0.08] bg-slate-500/[0.01]">
                            <div className="space-y-1 pr-4">
                                <p className="text-sm font-black text-slate-900 dark:text-white">New Vlyxir UI</p>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                  Switches Arena interfaces to modern high-fidelity dashboard structures.
                                </p>
                            </div>
                            
                            <button
                                type="button"
                                onClick={() => setUseNewUi(!useNewUi)}
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed ${
                                    useNewUi ? 'bg-indigo-500' : 'bg-slate-250 dark:bg-slate-800'
                                } cursor-pointer`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                                        useNewUi ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </section>

                    {/* Section 4: Editor Font Size Telemetry Slider */}
                    <section className="space-y-3.5 p-4 rounded-2xl border border-slate-100 dark:border-white/[0.04] bg-slate-500/[0.01]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PencilRuler className="w-4 h-4 text-emerald-500" />
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-550 dark:text-slate-450">
                                  Workspace Compiler Font Size
                                </h4>
                            </div>
                            <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-md">
                              {editorFontSize}px
                            </span>
                        </div>
                        <input
                            type="range"
                            min={12}
                            max={22}
                            step={1}
                            value={editorFontSize}
                            onChange={(e) => setEditorFontSize(Number(e.target.value))}
                            className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer"
                        />
                    </section>

                    {/* Section 5: Preferences switches */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Sliders className="w-4 h-4 text-slate-500" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-550 dark:text-slate-450">
                              Cognitive & Motion parameters
                            </h4>
                        </div>

                        {/* Switch 1: Reduce Motion */}
                        <div className="flex items-center justify-between rounded-3xl border border-slate-200 dark:border-white/[0.05] p-4 transition-colors duration-300 hover:border-slate-300 dark:hover:border-white/[0.08] bg-slate-500/[0.01]">
                            <div className="space-y-1 pr-4">
                                <p className="text-sm font-black text-slate-900 dark:text-white">Reduce System Animations</p>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                  Minimizes transition steps and heavy rendering graphics layers.
                                </p>
                            </div>
                            
                            <button
                                type="button"
                                onClick={() => setReduceMotion(!reduceMotion)}
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed ${
                                    reduceMotion ? 'bg-indigo-500' : 'bg-slate-250 dark:bg-slate-800'
                                } cursor-pointer`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                                        reduceMotion ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Switch 2: Hardware acceleration */}
                        <div className="flex items-center justify-between rounded-3xl border border-slate-200 dark:border-white/[0.05] p-4 transition-colors duration-300 hover:border-slate-300 dark:hover:border-white/[0.08] bg-slate-500/[0.01]">
                            <div className="space-y-1 pr-4">
                                <p className="text-sm font-black text-slate-900 dark:text-white">GPU Graphics Acceleration</p>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                  Allocates graphics shaders to process theme transition frames.
                                </p>
                            </div>
                            
                            <button
                                type="button"
                                onClick={() => setHardwareAcceleratedThemeAnimations(!hardwareAcceleratedThemeAnimations)}
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed ${
                                    hardwareAcceleratedThemeAnimations ? 'bg-indigo-500' : 'bg-slate-250 dark:bg-slate-800'
                                } cursor-pointer`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                                        hardwareAcceleratedThemeAnimations ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Switch 3: Mobile Pills */}
                        <div className="flex items-center justify-between rounded-3xl border border-slate-200 dark:border-white/[0.05] p-4 transition-colors duration-300 hover:border-slate-300 dark:hover:border-white/[0.08] bg-slate-500/[0.01]">
                            <div className="space-y-1 pr-4">
                                <p className="text-sm font-black text-slate-900 dark:text-white">Auto-hide Mobile tab-pills</p>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                  Hides hovering dashboard selectors while actively scrolling logs.
                                </p>
                            </div>
                            
                            <button
                                type="button"
                                onClick={() => setAutoHideMobilePills(!autoHideMobilePills)}
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed ${
                                    autoHideMobilePills ? 'bg-indigo-500' : 'bg-slate-250 dark:bg-slate-800'
                                } cursor-pointer`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                                        autoHideMobilePills ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </section>
                </div>

                {/* Footer specs resets (strictly no gradient buttons) */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/80 dark:bg-[#0B0C15]/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 opacity-50">
                      <Info className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-bold tracking-widest text-slate-500">
                        SYS: 7.3.20
                      </span>
                    </div>

                    <button
                        onClick={resetUiSettings}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 bg-white dark:bg-white/[0.01] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Defaults</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
