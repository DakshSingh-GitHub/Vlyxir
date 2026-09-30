"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

declare global {
  interface Window {
    electronAPI?: {
      platform?: string;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
      openExternal?: (url: string) => void;
      onOAuthCallback?: (callback: (url: string) => void) => void;
      updateCurrentRoute?: (route: string) => void;
      onNavigate?: (callback: (path: string) => void) => void;
      onMenuAction?: (callback: (action: string) => void) => void;
    };
  }
}

interface TitleBarProps {
  isNavExcluded?: boolean;
}

export default function TitleBar({ isNavExcluded = false }: TitleBarProps) {
  const [isElectron, setIsElectron] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasElectronAPI = window.electronAPI !== undefined;
      const hasElectronAgent = navigator.userAgent.toLowerCase().includes('electron');

      if (hasElectronAPI || hasElectronAgent) {
        setIsElectron(true);

        const platform = window.electronAPI?.platform || (navigator.platform?.toLowerCase().includes('mac') ? 'darwin' : 'win32');
        setIsMac(platform === 'darwin' || navigator.userAgent.toLowerCase().includes('mac'));

        if (window.electronAPI) {
          window.electronAPI.isMaximized().then(setIsMaximized).catch(() => {});
        }
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

  // When Navbar is present: unify directly into the top bar with NO separate header
  if (!isNavExcluded) {
    return (
      <>
        {/* Top drag overlay region so empty areas can drag the window */}
        <div
          onDoubleClick={handleDoubleClick}
          className="absolute inset-x-0 top-0 h-16 z-[60] pointer-events-none"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        />

        {/* Windows Desktop Control Buttons (Cross / Minimize / Maximize) on the exact same horizontal level */}
        {!isMac && (
          <div
            className="fixed top-3 right-4 z-[1001] flex items-center h-9 rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-lg overflow-hidden select-none"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            {/* Minimize */}
            <button
              onClick={handleMinimize}
              className="h-full w-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer"
              title="Minimize"
            >
              <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
                <rect width="10" height="1" />
              </svg>
            </button>

            {/* Maximize / Restore */}
            <button
              onClick={handleMaximize}
              className="h-full w-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer"
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

            {/* Close (Turns red on hover) */}
            <button
              onClick={handleClose}
              className="h-full w-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#E81123] active:bg-[#C40A18] transition-colors cursor-pointer"
              title="Close"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M1 1l8 8M9 1L1 9" />
              </svg>
            </button>
          </div>
        )}
      </>
    );
  }

  // When Navbar is excluded (e.g. /docs, /login, /forum): render a clean minimal transparent drag strip
  return (
    <header
      onDoubleClick={handleDoubleClick}
      className={`sticky top-0 z-[1000] h-[38px] w-full flex items-center justify-between pr-0 text-xs select-none bg-transparent transition-colors duration-150 shrink-0 ${
        isMac ? 'pl-[78px]' : 'pl-4'
      }`}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex-1 h-full" />

      {/* Windows Desktop Control Buttons */}
      {!isMac && (
        <div
          className="flex items-center h-full pr-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {/* Minimize */}
          <button
            onClick={handleMinimize}
            className="h-full w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors duration-100 cursor-default"
            title="Minimize"
          >
            <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
              <rect width="10" height="1" />
            </svg>
          </button>

          {/* Maximize / Restore */}
          <button
            onClick={handleMaximize}
            className="h-full w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors duration-100 cursor-default"
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

          {/* Close */}
          <button
            onClick={handleClose}
            className="h-full w-[44px] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#E81123] active:bg-[#C40A18] transition-colors duration-100 cursor-default"
            title="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M1 1l8 8M9 1L1 9" />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
}

