"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LayoutDashboard, Settings, User, LogOut, Menu, BrainCircuit } from "lucide-react";

export function Header() {
  const { data: session, status } = useSession();
  const [workspaceName, setWorkspaceName] = useState("MeetingMind");

  // @ts-ignore
  const WORKSPACE_ID = session?.user?.workspaceId;

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!WORKSPACE_ID) return;
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
        const response = await fetch(`${API_URL}/workspaces/me`, {
          headers: {
            "x-workspace-id": WORKSPACE_ID,
            // @ts-ignore
            "x-user-id": session?.user?.id || "",
          },
        });
        const data = await response.json();
        setWorkspaceName(data.name || "My Workspace");
      } catch (error) {
        console.error("Failed to fetch workspace:", error);
        setWorkspaceName("MeetingMind");
      }
    };

    if (status === "authenticated") {
      fetchWorkspace();
    } else {
      setWorkspaceName("MeetingMind");
    }
  }, [WORKSPACE_ID, session, status]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/40 bg-slate-950/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 group transition-all">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white leading-none">
              MeetingMind
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase mt-1">
              Premium Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {status === "authenticated" ? (
            <>
              <Link href="/workspace" className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-indigo-400 transition-all">
                <LayoutDashboard className="h-4 w-4" />
                Workspace
              </Link>
              <Link href="/settings" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-all">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </>
          ) : (
            <>
              <Link href="#capabilities" className="text-sm font-medium text-slate-400 hover:text-white transition-all">Capabilities</Link>
              <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-all">Features</Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {status === "authenticated" ? (
            <div className="flex items-center gap-4">
              <span className="hidden lg:block text-xs font-medium text-slate-400">
                {session?.user?.name || session?.user?.email}
              </span>
              <div className="h-8 w-[1px] bg-slate-800 mx-1 hidden md:block"></div>
              <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all border border-slate-800"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/login"
                className="text-sm font-bold text-slate-300 hover:text-white px-4 py-2 transition-all"
              >
                Sign In
              </Link>
              <Link 
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
              >
                Join Now
              </Link>
            </div>
          )}
          
          <button className="md:hidden p-2 text-slate-400">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
