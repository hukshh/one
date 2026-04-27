"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const name = formData.get("name");
    const workspaceName = formData.get("workspaceName");

    try {
      const res = await fetch(`${API_URL}/workspaces/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, workspaceName }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0B] text-white p-6">
      <Link href="/" className="mb-12 block group transition-all">
        <img 
          src="/logo.svg" 
          alt="MeetingMind" 
          className="h-10 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
        />
      </Link>

      <div className="w-full max-w-[440px] ui-card p-10">
        <div className="text-center mb-10">
          <div className="ui-badge mb-6 w-fit mx-auto">Get Started</div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Create Workspace</h1>
          <p className="text-[#A1A1AA] text-sm">Join the next generation of meeting intelligence</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest ml-1">Full Name</label>
            <input 
              name="name"
              type="text" 
              placeholder="Alex Rivers" 
              required
              className="ui-input w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest ml-1">Work Email</label>
            <input 
              name="email"
              type="email" 
              placeholder="alex@company.com" 
              required
              className="ui-input w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest ml-1">Workspace Name</label>
            <input 
              name="workspaceName"
              type="text" 
              placeholder="Design Labs" 
              required
              className="ui-input w-full"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="ui-button-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                Create Workspace
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-[#1F1F23] text-center">
          <p className="text-sm text-[#A1A1AA]">
            Already have one? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="mt-12 text-[10px] font-bold text-[#2D2D33] tracking-[0.2em] uppercase">
        Enterprise Standard Security
      </div>
    </div>
  );
}
