"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
      openExternal?: (url: string) => void;
      onOAuthCallback?: (callback: (url: string) => void) => void;
    };
  }
}

export default function TitleBar() {
  const [isElectron, setIsElectron] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window.electronAPI !== undefined || navigator.userAgent.toLowerCase().includes('electron'))
    ) {
      setIsElectron(true);
      if (window.electronAPI) {
        window.electronAPI.isMaximized().then(setIsMaximized).catch(() => {});
      }
    }
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimize();
    }
  };

  const handleMaximize = async () => {
    if (window.electronAPI) {
      window.electronAPI.maximize();
      const maximized = await window.electronAPI.isMaximized();
      setIsMaximized(maximized);
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.close();
    }
  };

  const handleDoubleClick = () => {
    handleMaximize();
  };

  // Render ONLY inside Electron desktop app environment
  if (!isElectron) {
    return null;
  }

  return (
    <header
      onDoubleClick={handleDoubleClick}
      className="sticky top-0 z-[1000] h-[40px] w-full flex items-center justify-between pl-3.5 pr-0 text-xs select-none bg-[#0A0F1A]/95 backdrop-blur-2xl border-b border-white/[0.06] transition-colors duration-150 shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* LEFT SECTION: Logo & App Title Only */}
      <div 
        className="flex items-center gap-2.5 h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <div className="relative h-5 w-5 shrink-0 flex items-center justify-center">
          <Image
            src="/icons/icon-512x512.png"
            alt="Vlyxir Logo"
            width={20}
            height={20}
            className="object-contain"
            priority
          />
        </div>

        <span className="font-bold text-[13px] tracking-tight text-slate-100">
          Vlyxir
        </span>
      </div>

      {/* CENTER SECTION: Completely Empty for Minimal Desktop Aesthetic */}
      <div className="flex-1 h-full" />

      {/* RIGHT SECTION: Native Windows Desktop Control Buttons */}
      <div
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Minimize */}
        <button
          onClick={handleMinimize}
          className="h-full w-[46px] flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors duration-100 cursor-default"
          title="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1" />
          </svg>
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={handleMaximize}
          className="h-full w-[46px] flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors duration-100 cursor-default"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M3 3v-2h6v6h-2" />
              <rect x="1" y="3" width="6" height="6" fill="none" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="1" y="1" width="8" height="8" />
            </svg>
          )}
        </button>

        {/* Close (Turns red ONLY on hover) */}
        <button
          onClick={handleClose}
          className="h-full w-[46px] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#E81123] active:bg-[#C40A18] transition-colors duration-100 cursor-default"
          title="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M1 1l8 8M9 1L1 9" />
          </svg>
        </button>
      </div>
    </header>
  );
}
