"use client";

import { signIn } from "next-auth/react";
import { BrainCircuit, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0B] text-white p-6">
      <Link href="/" className="mb-12 block group transition-all">
        <img 
          src="/logo.svg" 
          alt="MeetingMind" 
          className="h-10 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
        />
      </Link>

      <div className="w-full max-w-[400px] ui-card p-10">
        <div className="text-center mb-10">
          <div className="ui-badge mb-6 w-fit mx-auto">Secure Portal</div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-[#A1A1AA] text-sm">Sign in to your intelligence workspace</p>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const email = (e.target as any).email.value;
            signIn("credentials", { email, callbackUrl: "/workspace" });
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest ml-1">Email Address</label>
            <input 
              name="email"
              type="email" 
              placeholder="name@company.com" 
              required
              className="ui-input w-full"
            />
          </div>
          <button 
            type="submit"
            className="ui-button-primary w-full py-3 flex items-center justify-center gap-2"
          >
            Sign In
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-[#1F1F23] text-center">
          <p className="text-sm text-[#A1A1AA]">
            New here? <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Create workspace</Link>
          </p>
        </div>
      </div>

      <div className="mt-12 text-[10px] font-bold text-[#2D2D33] tracking-[0.2em] uppercase">
        Enterprise Standard Security
      </div>
    </div>
  );
}
