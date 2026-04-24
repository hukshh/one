"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LayoutDashboard, Search, Settings, User, LogOut, Menu } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
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
          <div className="flex items-center gap-3">
            {session?.user && (
              <span className="hidden lg:block text-xs font-medium text-slate-400">
                {session.user.name || session.user.email}
              </span>
            )}
            <div className="h-8 w-[1px] bg-slate-800 mx-1 hidden md:block"></div>
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
          
          <button className="md:hidden p-2 text-slate-400">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
