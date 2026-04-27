"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from "recharts";
import { 
  TrendingUp, Clock, Calendar, Activity, Shield, Info
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * UI-LEVEL SAFE DISPLAY HELPERS
 * 
 * Ensures no NaN, null, or undefined values leak into the UI.
 * Strictly enforces "—" for missing data and "0" for zero values.
 */
const safeDisplay = (val: any, formatter?: (v: any) => string) => {
  if (val === 0) return "0";
  if (!val || isNaN(val)) return "—";
  return formatter ? formatter(val) : String(val);
};

const formatDurationUI = (mins: number) => {
  if (mins < 60) return `${Math.round(mins)}m`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const formatCurrencyUI = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

export function AnalyticsDashboard({ workspaceId, userId }: { workspaceId: string; userId: string }) {
  const [stats, setStats] = useState<any>(null);
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
        const data = await response.json();
        setStats(data);
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 text-[#A1A1AA]">
      <Activity className="h-8 w-8 animate-spin mb-4 text-[#52525B]" />
      <p className="text-xs font-bold uppercase tracking-widest">Aggregating Intelligence...</p>
    </div>
  );

  // EMPTY STATE HANDLER
  const hasData = stats && stats.totalMeetings > 0;

  if (!hasData) {
    return (
      <div className="ui-card flex flex-col items-center justify-center py-32 text-center">
        <div className="p-4 bg-[#1F1F23] rounded-full mb-6">
          <Info className="h-8 w-8 text-[#A1A1AA]" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No data available yet</h3>
        <p className="text-[#A1A1AA] text-sm max-w-xs mx-auto">
          Upload and process your first meeting to unlock workspace intelligence.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* METRIC CARDS - GREY THEME */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Meetings" 
          value={safeDisplay(stats.totalMeetings)} 
          icon={<Calendar className="h-4 w-4" />} 
        />
        <StatCard 
          title="Total Duration" 
          value={safeDisplay(stats.totalDuration, formatDurationUI)} 
          icon={<Clock className="h-4 w-4" />} 
        />
        <StatCard 
          title="AI Confidence" 
          value={safeDisplay(stats.avgConfidence, (v) => `${v}%`)}
          icon={<Activity className="h-4 w-4" />} 
          subtitle={stats.avgConfidence === null ? "Processing meetings..." : undefined}
        />
        <StatCard 
          title="Task Completion" 
          value={safeDisplay(stats.taskCompletionRate, (v) => `${v}%`)}
          icon={<TrendingUp className="h-4 w-4" />} 
          subtitle={stats.taskCompletionRate === null ? "No tasks found" : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART: MEETING VOLUME */}
        <div className="ui-card lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Meeting Volume</h3>
          </div>
          <div className="h-[300px] w-full min-h-0">
            {stats.dailyVolume && stats.dailyVolume.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dailyVolume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F1F23" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#52525B" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                  />
                  <YAxis stroke="#52525B" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#151518' }}
                    contentStyle={{ backgroundColor: '#111113', border: '1px solid #1F1F23', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#6366F1" radius={[2, 2, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#52525B] text-xs uppercase tracking-widest font-bold">
                Insufficient volume data
              </div>
            )}
          </div>
        </div>

        {/* CHART: SENTIMENT */}
        <div className="ui-card">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 text-center">Sentiment Analysis</h3>
          <div className="h-[250px] w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Positive', value: stats.sentiment?.positive || 0 },
                    { name: 'Neutral', value: stats.sentiment?.neutral || 0 },
                    { name: 'Critical', value: stats.sentiment?.critical || 0 },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#6366F1" />
                  <Cell fill="#1F1F23" />
                  <Cell fill="#A1A1AA" />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111113', border: '1px solid #1F1F23', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-3 mt-6">
            <SentimentIndicator label="Positive" value={stats.sentiment?.positive || 0} color="bg-indigo-500" />
            <SentimentIndicator label="Neutral" value={stats.sentiment?.neutral || 0} color="bg-[#1F1F23]" />
            <SentimentIndicator label="Critical" value={stats.sentiment?.critical || 0} color="bg-[#52525B]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, subtitle }: any) {
  const isNoData = value === "—";
  
  return (
    <div className={`ui-card transition-all duration-300 ${isNoData ? 'opacity-60 border-dashed' : 'opacity-100'}`}>
      <div className="flex items-center gap-3 mb-4 text-[#A1A1AA]">
        <div className="p-2 bg-[#151518] rounded-md border border-[#1F1F23]">
          {React.cloneElement(icon as React.ReactElement, { size: 16, strokeWidth: 1.5 })}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest">{title}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <p className={`text-2xl font-semibold tracking-tight ${isNoData ? 'text-[#52525B]' : 'text-white'}`}>
          {value}
        </p>
        {(isNoData || subtitle) && (
          <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-tighter">
            {subtitle || "Waiting for data"}
          </span>
        )}
      </div>
    </div>
  );
}

function SentimentIndicator({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${color}`} />
        <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-tighter">{label}</span>
      </div>
      <span className="text-xs font-bold text-white">{value}%</span>
    </div>
  );
}
