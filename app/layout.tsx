import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur">
              <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span className="font-bold text-white">M</span>
                  </div>
                  <span className="text-xl font-bold tracking-tight">MeetingMind</span>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                  <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Dashboard</a>
                  <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Search</a>
                  <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Settings</a>
                </nav>
                <div className="flex items-center gap-4">
                  <button className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white">
                    <div className="h-5 w-5" /> {/* User Icon Placeholder */}
                  </button>
                </div>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
              © 2026 MeetingMind. Built for high-performance teams.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
