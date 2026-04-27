"use client";

import { 
  Activity, Shield, Zap, Calendar, Users, BarChart3, ChevronRight, Lightbulb
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const { status } = useSession();

  return (
    <div className="min-h-screen bg-[#0A0A0B] overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-indigo-500/5 blur-[120px] rounded-full opacity-50" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F1F23_1px,transparent_1px),linear-gradient(to_bottom,#1F1F23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.15]" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 ui-container pt-40 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-2xl"
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <img 
                src="/logo.svg" 
                alt="MeetingMind" 
                className="h-8 md:h-10 w-auto object-contain opacity-90"
              />
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-7xl font-semibold text-white tracking-tight leading-[1.05] mb-8">
              Transform meetings <br />
              into <span className="text-zinc-500">structured memory.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-xl text-[#A1A1AA] leading-relaxed mb-12 max-w-lg font-medium">
              Automated intelligence for high-performance teams. Extract action items and decisions with zero latency.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex items-center gap-5">
              <Link href="/workspace" className="ui-button-primary px-10 py-4 text-base shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                Go to Workspace
              </Link>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="mt-16 flex items-center gap-10 text-[#52525B]">
              <div className="flex flex-col gap-1">
                <span className="text-white font-semibold text-lg tracking-tight">99.9%</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-60">Accuracy</span>
              </div>
              <div className="h-10 w-px bg-[#1F1F23]" />
              <div className="flex flex-col gap-1">
                <span className="text-white font-semibold text-lg tracking-tight">AES-256</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-60">Security</span>
              </div>
              <div className="h-10 w-px bg-[#1F1F23]" />
              <div className="flex flex-col gap-1">
                <span className="text-white font-semibold text-lg tracking-tight">ISO 27001</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-60">Certified</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className="hidden lg:flex flex-col gap-5 relative"
          >
            {/* Decorative Card 1: AI Transcription */}
            <motion.div 
              whileHover={{ x: -15, scale: 1.02, rotateY: -5, rotateX: 5 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ 
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                x: { type: "spring", stiffness: 400, damping: 30 }
              }}
              className="ui-card flex items-start gap-4 bg-[#111113]/80 backdrop-blur-xl border-indigo-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group cursor-default perspective-1000"
            >
              <div className="p-2.5 bg-[#151518] rounded-lg border border-[#1F1F23] group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5 transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0)] group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Activity className="h-5 w-5 text-[#A1A1AA] group-hover:text-white transition-colors stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1 tracking-tight group-hover:text-indigo-400 transition-colors">AI Transcription</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">Precision-tuned for technical discourse and complex business logic.</p>
              </div>
            </motion.div>

            {/* Decorative Card 2: Instant Intelligence */}
            <motion.div 
              whileHover={{ x: -15, scale: 1.02, rotateY: -5, rotateX: 5 }}
              animate={{ y: [0, 12, 0] }}
              transition={{ 
                y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                x: { type: "spring", stiffness: 400, damping: 30 }
              }}
              className="ui-card flex items-start gap-4 translate-x-12 bg-[#111113]/80 backdrop-blur-xl border-indigo-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group cursor-default perspective-1000"
            >
              <div className="p-2.5 bg-[#151518] rounded-lg border border-[#1F1F23] group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5 transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0)] group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Zap className="h-5 w-5 text-[#A1A1AA] group-hover:text-white transition-colors stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1 tracking-tight group-hover:text-indigo-400 transition-colors">Instant Intelligence</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">Automated extraction of decisions, action items, and project risks.</p>
              </div>
            </motion.div>

            {/* Decorative Card 3: Autonomous Insights */}
            <motion.div 
              whileHover={{ x: -15, scale: 1.02, rotateY: -5, rotateX: 5 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ 
                y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 },
                x: { type: "spring", stiffness: 400, damping: 30 }
              }}
              className="ui-card flex items-start gap-4 bg-[#111113]/80 backdrop-blur-xl border-indigo-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group cursor-default perspective-1000"
            >
              <div className="p-2.5 bg-[#151518] rounded-lg border border-[#1F1F23] group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5 transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0)] group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Lightbulb className="h-5 w-5 text-[#A1A1AA] group-hover:text-white transition-colors stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1 tracking-tight group-hover:text-indigo-400 transition-colors">Autonomous Insights</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">AI that thinks ahead, flagging mission-critical action items in real-time.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Core Workflow - Fills vacant space */}
      <div className="relative z-10 border-y border-[#1F1F23] bg-[#0A0A0B]/50 backdrop-blur-sm">
        <div className="ui-container py-24">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            <WorkflowStep 
              number="01"
              title="Seamless Ingestion"
              description="Upload any audio or video format. Our pipeline handles noise reduction and speaker diarization instantly."
            />
            <WorkflowStep 
              number="02"
              title="Neural Analysis"
              description="Proprietary models identify key decisions, project risks, and action items with context-aware reasoning."
            />
            <WorkflowStep 
              number="03"
              title="Instant Delivery"
              description="Sync intelligence to your workspace or export professional reports for your entire team immediately."
            />
          </motion.div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="relative z-10 ui-container py-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<Activity className="h-6 w-6" />}
            title="AI Reasoning"
            description="Advanced transcription that understands context, identifies speakers, and extracts patterns from technical discussions."
          />
          <FeatureCard 
            icon={<Shield className="h-6 w-6" />}
            title="Enterprise Privacy"
            description="Your data stays within your workspace. AES-256 encryption for storage and isolated environments."
          />
          <FeatureCard 
            icon={<Zap className="h-6 w-6" />}
            title="Instant Sharing"
            description="Automated reports sent to participants immediately after the session concludes. Zero manual effort."
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 ui-container py-12 border-t border-[#1F1F23]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <img 
            src="/logo.svg" 
            alt="MeetingMind" 
            className="h-5 w-auto object-contain opacity-60"
          />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#52525B]">
            © {new Date().getFullYear()} MeetingMind Intelligence. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function WorkflowStep({ number, title, description }: any) {
  return (
    <motion.div variants={fadeInUp} className="flex flex-col gap-4">
      <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-2">
        Step {number}
      </div>
      <h3 className="text-xl font-semibold text-white tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-[#A1A1AA] leading-relaxed font-medium">
        {description}
      </p>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="flex flex-col gap-6 p-8 rounded-2xl bg-[#111113]/30 border border-[#1F1F23] hover:bg-[#111113]/80 hover:border-indigo-500/20 transition-all duration-300"
    >
      <div className="p-3 bg-[#151518] border border-[#1F1F23] rounded-xl w-fit text-[#A1A1AA]">
        {icon && typeof icon !== 'string' ? (
          <div className="stroke-[1.5]">
            {icon}
          </div>
        ) : icon}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-[#A1A1AA] leading-relaxed text-sm font-medium">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
