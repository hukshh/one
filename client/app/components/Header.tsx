"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Calendar, Settings, LogOut, User } from "lucide-react";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1F1F23] bg-[#0A0A0B]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group transition-all">
          <img 
            src="/logo.svg" 
            alt="MeetingMind" 
            className="h-5 md:h-6 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {status === "authenticated" && (
            <>
              <Link href="/workspace" className="flex items-center gap-2 text-sm font-medium text-[#A1A1AA] hover:text-white transition-all">
                <Calendar className="h-4 w-4 stroke-[1.5]" />
                Workspace
              </Link>
              <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-[#A1A1AA] hover:text-white transition-all">
                <User className="h-4 w-4 stroke-[1.5]" />
                Profile
              </Link>
              <Link href="/settings" className="flex items-center gap-2 text-sm font-medium text-[#A1A1AA] hover:text-white transition-all">
                <Settings className="h-4 w-4 stroke-[1.5]" />
                Settings
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-6">
          {status === "authenticated" ? (
            <div className="flex items-center gap-6">
              <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="ui-button-secondary text-xs px-3 py-1.5 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4 stroke-[1.5]" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                href="/login"
                className="text-sm font-medium text-[#A1A1AA] hover:text-white transition-all"
              >
                Sign In
              </Link>
              <Link 
                href="/workspace"
                className="ui-button-primary text-sm"
              >
                Go to Workspace
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
