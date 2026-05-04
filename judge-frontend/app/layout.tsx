import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppWrapper } from "./lib/auth/context";
import { AuthProvider } from "./lib/auth/auth-context";
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
  applicationName: "Vlyxir",
  title: {
    default: "Vlyxir - Next-Gen Coding Platform",
    template: "%s | Vlyxir",
  },
  description: "Vlyxir is a next-generation platform designed for seamless coding, execution, and evaluation. It offers a fast, secure environment with real-time feedback, advanced analytics, and scalable architecture to empower developers, educators, and organizations in assessing and enhancing technical skills.",
  verification: {
    google: 'xkk6SWB7s8uypKr5DN6f1s9xTs0hZEBxjk-1Z4k_Esc',
  },
  openGraph: {
    title: "Vlyxir",
    description: "Vlyxir is a next-generation platform designed for seamless coding, execution, and evaluation. It offers a fast, secure environment with real-time feedback, advanced analytics, and scalable architecture to empower developers, educators, and organizations in assessing and enhancing technical skills.",
    siteName: "Vlyxir",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Vlyxir",
    description: "Vlyxir is a next-generation platform designed for seamless coding, execution, and evaluation. It offers a fast, secure environment with real-time feedback, advanced analytics, and scalable architecture to empower developers, educators, and organizations in assessing and enhancing technical skills.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vlyxir",
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
