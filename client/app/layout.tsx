import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "./components/Header";

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
            <Header />
            
            <main className="flex-1 relative">
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
                  <span className="hover:text-slate-300 cursor-pointer">Privacy</span>
                  <span className="hover:text-slate-300 cursor-pointer">Terms</span>
                  <span className="hover:text-slate-300 cursor-pointer">Support</span>
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
