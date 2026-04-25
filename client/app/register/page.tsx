"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, Loader2, CheckCircle2, XCircle, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("No invitation token found.");
        setLoading(false);
        return;
      }

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
      const response = await fetch(`${API_URL}/workspaces/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, fullName, password }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to join workspace.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-indigo-500" />
        <p>Validating invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-4">
        <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-8 rounded-3xl text-center backdrop-blur-xl">
          <XCircle className="h-16 w-16 text-rose-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2">Invitation Error</h1>
          <p className="text-slate-400 mb-8">{error}</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-4">
        <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-8 rounded-3xl text-center backdrop-blur-xl">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2">Success!</h1>
          <p className="text-slate-400 mb-8">You have successfully joined <strong>{invitation?.workspace?.name}</strong>. Redirecting you to login...</p>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 animate-[progress_3s_ease-in-out]" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-8 rounded-[32px] backdrop-blur-2xl shadow-2xl relative">
        <div className="mb-8 text-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Join the Team</h1>
          <p className="text-slate-400 text-sm">
            You've been invited to join <span className="text-indigo-400 font-semibold">{invitation?.workspace?.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
            <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-4 py-3.5 text-slate-400 flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-slate-600" />
              <span className="text-sm">{invitation?.email}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
            <input 
              type="text" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Create Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
            />
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 group mt-4"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Join Workspace
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          Already have an account? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
