'use client';

import { useServerInsertedHTML } from 'next/navigation';

export function ThemeScript() {
  useServerInsertedHTML(() => {
    return (
      <script
        id="theme-init-script"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var themeMode = localStorage.getItem('theme_mode');
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              var shouldUseDark = false;

              if (themeMode === 'dark') {
                shouldUseDark = true;
              } else if (themeMode === 'light') {
                shouldUseDark = false;
              } else if (themeMode === 'system') {
                shouldUseDark = prefersDark;
              } else {
                shouldUseDark =
                  localStorage.theme === 'dark' ||
                  (!('theme' in localStorage) && prefersDark);
              }

              if (shouldUseDark) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }

              var hardwareAccelerationSetting = localStorage.getItem('hardware_accel_theme_animations');
              var shouldUseHardwareAcceleration = hardwareAccelerationSetting === null || hardwareAccelerationSetting === '1';
              if (shouldUseHardwareAcceleration) {
                document.documentElement.classList.add('theme-gpu');
              } else {
                document.documentElement.classList.remove('theme-gpu');
              }
            })();
          `,
        }}
      />
    );
  });

  return null;
}
