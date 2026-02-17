import "./globals.css";
import "@/src/styles/theme.css";
import { AppContextProvider } from "@/context/AppContext";
import { QueryProvider } from "@/src/lib/providers/query-provider";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FarmOps - Farm Operations Platform",
  description: "Offline-first farm operations management platform",
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#16a34a" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FarmOps",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/icons/icon-192x192.png" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        </head>
        <body className="antialiased font-sans">
          <QueryProvider>
            <Toaster />
            <AppContextProvider>
              {children}
            </AppContextProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
