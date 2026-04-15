import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppWrapper } from "./lib/context";
import { AuthProvider } from "./lib/auth-context";
import ClientLayout from "../components/General/ClientLayout";
import { ThemeScript } from "../components/General/ThemeScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "VLYXIR",
  title: {
    default: "VLYXIR",
    template: "%s | VLYXIR",
  },
  description: "VLYXIR — a fast, secure platform for coding, execution, and evaluation",
  openGraph: {
    title: "VLYXIR",
    description: "VLYXIR — a fast, secure platform for coding, execution, and evaluation",
    siteName: "VLYXIR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "VLYXIR",
    description: "VLYXIR — a fast, secure platform for coding, execution, and evaluation",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VLYXIR",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.png",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased select-none`}
      >
        <AppWrapper>
          <AuthProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </AuthProvider>
        </AppWrapper>
      </body>
    </html>
  );
}
