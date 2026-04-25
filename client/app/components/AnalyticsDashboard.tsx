"use client";

import { useState, useEffect } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import { TrendingUp, Users, Clock, Video, Loader2, ArrowUpRight, Zap, Target, BrainCircuit } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function AnalyticsDashboard({ workspaceId, userId }: { workspaceId: string, userId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${API_URL}/workspaces/analytics`, {
          headers: {
            "x-workspace-id": workspaceId,
            "x-user-id": userId,
          },
        });
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId && userId) {
      fetchAnalytics();
    }
  }, [workspaceId, userId]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center bg-slate-950/40 rounded-[32px] border border-slate-800/40 backdrop-blur-3xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-slate-500 font-medium animate-pulse">Synthesizing workspace intelligence...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b"];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Top Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PremiumStatCard 
          icon={<Video className="h-5 w-5" />} 
          label="Intelligence Nodes" 
          value={data.totals.meetings} 
          subtext="Total Meetings"
          color="indigo"
        />
        <PremiumStatCard 
          icon={<Clock className="h-5 w-5" />} 
          label="Execution Time" 
          value={`${data.totals.durationMinutes}m`} 
          subtext="Processed Audio"
          color="emerald"
        />
        <PremiumStatCard 
          icon={<BrainCircuit className="h-5 w-5" />} 
          label="AI Confidence" 
          value={`${data.totals.avgConfidence}%`} 
          subtext="Extraction Accuracy"
          color="purple"
        />
        <PremiumStatCard 
          icon={<Target className="h-5 w-5" />} 
          label="Task Velocity" 
          value={`${data.totals.taskCompletionRate}%`} 
          subtext="Completion Rate"
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Large Main Chart */}
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800/50 rounded-[40px] p-8 backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="h-32 w-32 text-indigo-500" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Growth Dynamics</h3>
                <p className="text-sm text-slate-500">Workspace activity over the last 30 days</p>
              </div>
              <div className="flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500/20" />
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeline} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#475569" 
                    fontSize={9} 
                    tickFormatter={(val) => val.split("-").slice(1).join("/")} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                    minTickGap={30}
                  />
                  <YAxis stroke="#475569" fontSize={9} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    animationDuration={2500}
                    activeDot={{ 
                      r: 5, 
                      fill: "#6366f1", 
                      stroke: "#fff", 
                      strokeWidth: 2,
                      style: { filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.8))' }
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Vertical Rankings */}
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-[40px] p-8 backdrop-blur-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Top Performers</h3>
          <div className="space-y-6">
            {data.topParticipants.map((p: any, i: number) => (
              <div key={i} className="group relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black border border-slate-700 bg-slate-800 text-slate-300`}>
                      {i + 1}
                    </div>
                    <span className="text-sm font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">{p.name}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{p.count} sessions</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${(p.count / data.topParticipants[0].count) * 100}%`,
                      backgroundColor: COLORS[i % COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 text-center">
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-2">System Insight</p>
            <p className="text-sm text-slate-400 italic">"Your team's collaboration frequency has increased by 14% this week."</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumStatCard({ icon, label, value, subtext, color }: any) {
  const colorMap: any = {
    indigo: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 text-indigo-400",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400",
    rose: "from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-400",
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-[32px] p-7 backdrop-blur-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-500`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5">
            {icon}
          </div>
          <ArrowUpRight className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</p>
        <h4 className="text-3xl font-black text-white tracking-tight mb-1">{value}</h4>
        <p className="text-xs font-medium text-slate-500">{subtext}</p>
      </div>
      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/5 blur-3xl group-hover:bg-white/10 transition-colors" />
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl backdrop-blur-xl shadow-2xl">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-500" />
          <p className="text-sm font-bold text-white">
            {payload[0].value} Intelligence Reports
          </p>
        </div>
      </div>
    );
  }
  return null;
}
