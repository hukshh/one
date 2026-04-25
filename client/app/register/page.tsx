"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, Loader2, CheckCircle2, XCircle, ArrowRight, ShieldCheck, BrainCircuit, Sparkles, Building2 } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(token ? true : false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/workspaces/invitations/${token}`);
        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Invalid or expired invitation.");
          setLoading(false);
          return;
        }
        const data = await response.json();
        setInvitation(data);
        setEmail(data.email);
      } catch (err) {
        setError("Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const endpoint = token ? `${API_URL}/workspaces/join` : `${API_URL}/workspaces/register`;
      const body = token 
        ? { token, fullName, password }
        : { fullName, email, workspaceName, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/workspace"), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-indigo-500" />
        <p className="text-sm font-black uppercase tracking-widest">Validating Invitation...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] px-4">
        <div className="max-w-md w-full bg-slate-900/40 border border-slate-800 p-10 rounded-[40px] text-center backdrop-blur-2xl shadow-2xl">
          <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Workspace Created</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Your intelligence environment is being provisioned. Redirecting you to login...
          </p>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 animate-[progress_3s_ease-in-out]" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] px-4 py-20 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <Link href="/" className="mb-12 flex items-center gap-3 group transition-all relative z-10">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl shadow-indigo-500/20 border border-white/10">
          <BrainCircuit className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-black tracking-tight text-white">MeetingMind</span>
      </Link>

      <div className="max-w-lg w-full bg-slate-900/40 border border-slate-800/60 p-10 rounded-[40px] backdrop-blur-2xl shadow-2xl relative z-10 overflow-hidden">
        {/* Subtle top light */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="h-3 w-3" />
            {token ? 'Join Workspace' : 'New Workspace'}
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            {token ? 'Accept Invitation' : 'Create Your Workspace'}
          </h1>
          <p className="text-slate-400 font-medium">
            {token ? `You've been invited to ${invitation?.workspace?.name}` : 'Provision your premium intelligence environment'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm font-medium">
            <XCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
              <input 
                type="email" 
                required
                disabled={!!token}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {!token && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Workspace Name</label>
              <div className="relative">
                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                <input 
                  type="text" 
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Acme Intelligence"
                  className="w-full pl-14 pr-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
            />
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 group mt-4"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {token ? 'Join Workspace' : 'Initialize Environment'}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-slate-500 font-medium">
          Already a member? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Sign in to your account</Link>
        </p>
      </div>
      
      <div className="mt-12 text-[10px] font-mono text-slate-700 tracking-[0.4em] uppercase relative z-10">
        Enterprise Standard • AES-256
      </div>
    </div>
  );
}
