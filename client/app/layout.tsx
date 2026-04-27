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
      <body className={`${inter.className} bg-[#0A0A0B] text-white antialiased`} suppressHydrationWarning>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            
            <main className="flex-1 relative">
              {children}
            </main>

            <footer className="border-t border-[#1F1F23] py-12 bg-[#0A0A0B]">
              <div className="ui-container flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded bg-[#111113] border border-[#1F1F23] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#A1A1AA]">M</span>
                  </div>
                  <span className="text-sm font-semibold text-[#A1A1AA]">MeetingMind Intelligence</span>
                </div>
                <div className="flex gap-8 text-xs font-medium text-[#52525B]">
                  <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
                  <span className="hover:text-white cursor-pointer transition-colors">Security</span>
                  <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
                </div>
                <p className="text-xs text-[#52525B]">
                  © 2026 MeetingMind Platform.
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
