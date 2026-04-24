"use client";

import { signIn } from "next-auth/react";
import { Github, Mail } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl mb-4">
            <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg">M</div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your MeetingMind account</p>
        </div>

        <div className="space-y-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const email = (e.target as any).email.value;
              signIn("credentials", { email, callbackUrl: "/" });
            }}
            className="space-y-3 mb-6"
          >
            <input 
              name="email"
              type="email" 
              placeholder="Enter your email for dev login" 
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button 
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-all"
            >
              Sign In
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs text-slate-500 uppercase tracking-widest">or continue with</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <button 
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl font-medium transition-all group"
          >
            <Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
            Continue with GitHub
          </button>
          
          <button 
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-medium transition-all group"
          >
            <Mail className="h-5 w-5 group-hover:scale-110 transition-transform" />
            Continue with Google
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-500 italic">
            "Your organizational memory, secured and intelligence-powered."
          </p>
        </div>
      </div>
    </div>
  );
}
