"use client";

import { 
  CheckCircle2, BrainCircuit, ShieldCheck, Sparkles, Zap, ArrowRight,
  Globe, MessageSquare, Database, Search, Users
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useSession } from "next-auth/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function LandingPage() {
  const { status } = useSession();
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.4], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.4], [100, 0]);

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Hero Section - Split Layout */}
      <div className="relative pt-32 pb-40 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Text & Content */}
            <div className="flex flex-col items-start text-left">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
              >
                <Sparkles className="h-3 w-3" />
                Next Generation Meeting Intelligence
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-6xl font-black text-white tracking-tight mb-8 leading-[1.1]"
              >
                Turn your meetings into <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  organizational memory.
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed"
              >
                MeetingMind is an advanced intelligence layer for your organization. We capture, transcribe, and extract deep insights from your conversations, ensuring no critical decision or action item is ever lost to time.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex items-center gap-4 mb-12"
              >
                {status === "authenticated" ? (
                  <Link 
                    href="/workspace" 
                    className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3 group"
                  >
                    Go to Workspace
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/register" 
                      className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3 group"
                    >
                      Join MeetingMind
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link 
                      href="/login" 
                      className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl font-bold transition-all border border-slate-800"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </motion.div>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-900 w-full">
                <div>
                  <h4 className="text-white font-bold mb-2">99.9% Accuracy</h4>
                  <p className="text-xs text-slate-500">Industry-leading Whisper models tuned for technical jargon.</p>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2">Zero Latency</h4>
                  <p className="text-xs text-slate-500">Real-time processing with automated email delivery.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Smaller Perspective Image */}
            <motion.div 
              ref={targetRef}
              style={{ scale, opacity, y }}
              className="relative"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-[32px] blur-2xl transition-opacity group-hover:opacity-100"></div>
                
                <div className="relative bg-slate-900 rounded-[24px] overflow-hidden border border-white/10 shadow-2xl">
                  {/* Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full animate-shimmer z-20 pointer-events-none" />
                  
                  <Image 
                    src="/images/hero_ultimate.jpg" 
                    alt="MeetingMind Intelligence Dashboard" 
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.05]"
                    priority
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Core Capabilities Section */}
      <div id="capabilities" className="py-32 border-t border-slate-900 overflow-hidden bg-slate-950/20">
        <div className="container mx-auto px-6 mb-16">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-4xl font-black text-white mb-4">Core Capabilities</h2>
            <p className="text-slate-500 max-w-xl">Advanced AI-driven modules that power your organizational memory.</p>
          </div>
        </div>
        
        {/* Flowing Ticker */}
        <div className="relative flex overflow-x-hidden">
          <div className="flex items-center gap-8 py-12 animate-marquee whitespace-nowrap">
            {[
              { title: "Sentiment Analysis", icon: <MessageSquare className="h-5 w-5" /> },
              { title: "Action Item Tracking", icon: <CheckCircle2 className="h-5 w-5" /> },
              { title: "Speaker Diarization", icon: <Users className="h-5 w-5" /> },
              { title: "Risk Detection", icon: <ShieldCheck className="h-5 w-5" /> },
              { title: "Key Decisions", icon: <BrainCircuit className="h-5 w-5" /> },
              { title: "Transcript Search", icon: <Search className="h-5 w-5" /> },
              { title: "Automated Summaries", icon: <Zap className="h-5 w-5" /> },
              { title: "Global Intelligence", icon: <Globe className="h-5 w-5" /> },
              { title: "Deep Insights", icon: <Database className="h-5 w-5" /> }
            ].map((capability, i) => (
              <div key={i} className="flex items-center gap-4 px-8 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  {capability.icon}
                </div>
                <span className="text-xl font-bold text-slate-300">{capability.title}</span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              { title: "Sentiment Analysis", icon: <MessageSquare className="h-5 w-5" /> },
              { title: "Action Item Tracking", icon: <CheckCircle2 className="h-5 w-5" /> },
              { title: "Speaker Diarization", icon: <Users className="h-5 w-5" /> },
              { title: "Risk Detection", icon: <ShieldCheck className="h-5 w-5" /> },
              { title: "Key Decisions", icon: <BrainCircuit className="h-5 w-5" /> },
              { title: "Transcript Search", icon: <Search className="h-5 w-5" /> },
              { title: "Automated Summaries", icon: <Zap className="h-5 w-5" /> },
              { title: "Global Intelligence", icon: <Globe className="h-5 w-5" /> },
              { title: "Deep Insights", icon: <Database className="h-5 w-5" /> }
            ].map((capability, i) => (
              <div key={`dup-${i}`} className="flex items-center gap-4 px-8 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-xl">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  {capability.icon}
                </div>
                <span className="text-xl font-bold text-slate-300">{capability.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div id="features" className="container mx-auto px-6 py-32 border-t border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col gap-6">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <BrainCircuit className="h-7 w-7 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">AI Reasoning</h3>
            <p className="text-slate-400 leading-relaxed">
              Advanced transcription that understands context, identifies speakers, and extracts meaningful patterns from technical discussions.
            </p>
          </div>
          
          <div className="flex flex-col gap-6" id="security">
            <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <ShieldCheck className="h-7 w-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Enterprise Privacy</h3>
            <p className="text-slate-400 leading-relaxed">
              Your data stays within your workspace. AES-256 encryption for storage and isolated environments for meeting analysis.
            </p>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Zap className="h-7 w-7 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Instant Sharing</h3>
            <p className="text-slate-400 leading-relaxed">
              Automated email summaries sent to participants immediately after the session concludes. Zero manual effort required.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-20 text-center">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-2 text-xl font-black text-white">
            <BrainCircuit className="h-8 w-8 text-indigo-500" />
            MeetingMind
          </div>
          <p className="text-slate-500 max-w-sm">
            The premium intelligence platform for organizations that value their time and data.
          </p>
          <div className="flex gap-6 text-slate-400 text-sm font-medium">
            <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <div className="mt-8 text-[10px] font-mono text-slate-700 tracking-widest">
            © 2026 MEETINGMIND PREMIUM • ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
}
