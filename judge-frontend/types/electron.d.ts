export {};

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
