"use client";

import { signIn } from "next-auth/react";
import { Github, Mail, BrainCircuit, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] text-white p-6 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <Link href="/" className="mb-12 flex items-center gap-3 group transition-all relative z-10">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl shadow-indigo-500/20 border border-white/10">
          <BrainCircuit className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-black tracking-tight text-white">MeetingMind</span>
      </Link>

      <div className="w-full max-w-[440px] bg-slate-900/40 border border-slate-800/60 rounded-[40px] p-10 backdrop-blur-2xl shadow-2xl relative z-10 overflow-hidden">
        {/* Subtle top light */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="h-3 w-3" />
            Secure Portal
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3">Welcome Back</h1>
          <p className="text-slate-400 font-medium">Sign in to your intelligence workspace</p>
        </div>

        <div className="space-y-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const email = (e.target as any).email.value;
              signIn("credentials", { email, callbackUrl: "/workspace" });
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                name="email"
                type="email" 
                placeholder="name@company.com" 
                required
                className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 group"
            >
              Sign In to Workspace
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

        </div>

        <div className="mt-10 pt-10 border-t border-slate-800/50 text-center">
          <p className="text-sm text-slate-500 font-medium">
            New here? <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Create a free workspace</Link>
          </p>
        </div>
      </div>

      <div className="mt-12 text-[10px] font-mono text-slate-700 tracking-[0.4em] uppercase relative z-10">
        Secured by MeetingMind AES-256
      </div>
    </div>
  );
}
