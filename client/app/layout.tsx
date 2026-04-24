import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";
import { LayoutDashboard, Search, Settings, User, Menu, X } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeetingMind | Premium Meeting Intelligence",
  description: "Transform your meetings into actionable organizational memory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased`} suppressHydrationWarning>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-slate-800/40 bg-slate-950/70 backdrop-blur-xl">
              <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2.5 group transition-all">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
                    <span className="font-bold text-white text-lg">M</span>
                  </div>
                  <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    MeetingMind
                  </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                  <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-indigo-400 transition-all">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link href="#" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-all">
                    <Search className="h-4 w-4" />
                    Intelligence
                  </Link>
                  <Link href="#" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-all">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </nav>

                <div className="flex items-center gap-3">
                  <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 text-xs font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                    <Search className="h-3.5 w-3.5" />
                    <span className="opacity-60">⌘K</span>
                  </button>
                  <div className="h-8 w-[1px] bg-slate-800 mx-1 hidden md:block"></div>
                  <button className="rounded-full bg-slate-800 p-2 text-slate-300 hover:text-white transition-all hover:bg-slate-700 border border-slate-700/50">
                    <User className="h-5 w-5" />
                  </button>
                  
                  {/* Mobile Menu Toggle (Visual only for now since it's a layout) */}
                  <button className="md:hidden p-2 text-slate-400">
                    <Menu className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </header>
            
            <main className="flex-1 relative">
              {/* Subtle background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[400px] bg-indigo-500/5 blur-[120px] pointer-events-none -z-10" />
              {children}
            </main>

            <footer className="border-t border-slate-900 py-10 bg-slate-950">
              <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 opacity-50">
                  <div className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center">
                    <span className="text-[10px] font-bold">M</span>
                  </div>
                  <span className="text-sm font-semibold">MeetingMind</span>
                </div>
                <div className="flex gap-8 text-xs font-medium text-slate-500">
                  <Link href="#" className="hover:text-slate-300">Privacy</Link>
                  <Link href="#" className="hover:text-slate-300">Terms</Link>
                  <Link href="#" className="hover:text-slate-300">Support</Link>
                </div>
                <p className="text-xs text-slate-600">
                  © 2026 MeetingMind AI Platform.
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
