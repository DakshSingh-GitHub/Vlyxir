import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppWrapper } from "./lib/context";
import ClientLayout from "../components/General/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "CodeJudge",
  title: {
    default: "CodeJudge",
    template: "%s | CodeJudge",
  },
  description: "CodeJudge — a fast, secure platform for coding, execution, and evaluation",
  openGraph: {
    title: "CodeJudge",
    description: "CodeJudge — a fast, secure platform for coding, execution, and evaluation",
    siteName: "CodeJudge",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CodeJudge",
    description: "CodeJudge — a fast, secure platform for coding, execution, and evaluation",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CodeJudge",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9FAFB" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0C15" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
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

      if (
        shouldUseDark
      ) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased select-none`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AppWrapper>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AppWrapper>
      </body>
    </html>
  );
}
