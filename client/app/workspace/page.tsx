"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  FileVideo, Plus, Search, Calendar, Users, 
  CheckCircle, Loader2, Play, BarChart3, List, ChevronRight, Clock, Shield
} from "lucide-react";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const safeDisplay = (val: any) => {
  if (val === 0) return "0";
  if (!val || isNaN(val)) return "—";
  return String(val);
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [workspaceName, setWorkspaceName] = useState("Your Workspace");
  const [view, setView] = useState<"meetings" | "analytics">("meetings");

  // Derived IDs from session
  const USER_ID = session?.user?.id;
  // @ts-ignore
  const WORKSPACE_ID = session?.user?.workspaceId;

  const fetchWorkspace = async () => {
    if (!WORKSPACE_ID) return;
    try {
      const response = await fetch(`${API_URL}/workspaces/me`, {
        headers: {
          "x-workspace-id": WORKSPACE_ID,
          "x-user-id": USER_ID || "",
        },
      });
      const data = await response.json();
      setWorkspaceName(data.name || "Your Workspace");
    } catch (error) {
      console.error("Failed to fetch workspace:", error);
    }
  };

  const fetchMeetings = async (query = searchQuery) => {
    if (!WORKSPACE_ID || !USER_ID) return;
    
    try {
      const url = query 
        ? `${API_URL}/meetings?q=${encodeURIComponent(query)}`
        : `${API_URL}/meetings`;

      const response = await fetch(url, {
        headers: {
          "x-workspace-id": WORKSPACE_ID,
          "x-user-id": USER_ID,
        },
      });
      const data = await response.json();
      setMeetings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    
    if (status === "authenticated") {
      fetchWorkspace();
      const delayDebounceFn = setTimeout(() => {
        fetchMeetings();
      }, searchQuery ? 300 : 0);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [status, WORKSPACE_ID, USER_ID, searchQuery]);

  useEffect(() => {
    if (status === "authenticated" && !searchQuery) {
      const interval = setInterval(fetchMeetings, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [status, WORKSPACE_ID, USER_ID, searchQuery]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !WORKSPACE_ID || !USER_ID) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name.split('.')[0] || "New Meeting");
    formData.append("workspaceId", WORKSPACE_ID);
    formData.append("creatorId", USER_ID);

    try {
      const response = await fetch(`${API_URL}/meetings/upload`, {
        method: "POST",
        headers: {
          "x-workspace-id": WORKSPACE_ID,
          "x-user-id": USER_ID,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      
      fetchMeetings();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#A1A1AA]">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#52525B]" />
        <p className="text-xs font-medium uppercase tracking-widest">Synchronizing Environment...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0B] min-h-screen">
      <div className="ui-container py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">{workspaceName}</h1>
            <p className="text-[#A1A1AA] text-sm font-medium">Real-time intelligence from your team's conversations.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className={`ui-button-primary flex items-center gap-2 cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isUploading ? 'Uploading...' : 'Upload Meeting'}
              <input 
                type="file" 
                className="hidden" 
                accept="audio/*,video/*" 
                onChange={handleUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-10 bg-[#111113] p-1 rounded-lg border border-[#1F1F23] w-fit">
          <button 
            onClick={() => setView("meetings")}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${view === "meetings" ? 'bg-[#1F1F23] text-white' : 'text-[#A1A1AA] hover:text-zinc-300'}`}
          >
            <List className="h-4 w-4 stroke-[1.5]" />
            Meetings
          </button>
          <button 
            onClick={() => setView("analytics")}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${view === "analytics" ? 'bg-[#1F1F23] text-white' : 'text-[#A1A1AA] hover:text-zinc-300'}`}
          >
            <BarChart3 className="h-4 w-4 stroke-[1.5]" />
            Analytics
          </button>
        </div>

        {view === "analytics" ? (
          <AnalyticsDashboard workspaceId={WORKSPACE_ID} userId={USER_ID || ""} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <StatCard title="Meetings" value={safeDisplay(meetings.length)} icon={<Calendar className="h-4 w-4" />} />
              <StatCard title="Hours Logged" value={safeDisplay(meetings.length > 0 ? (meetings.length * 0.4).toFixed(1) : null) + (meetings.length > 0 ? 'h' : '')} icon={<Clock className="h-4 w-4" />} />
              <StatCard title="Processed" value={safeDisplay(meetings.filter(m => m.status === 'PROCESSED').length)} icon={<CheckCircle className="h-4 w-4" />} />
              <StatCard title="Contributors" value={safeDisplay(session?.user?.name ? "1" : "0")} icon={<Users className="h-4 w-4" />} />
            </div>

            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden">
              <div className="p-8 border-b border-[#1F1F23] flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Intelligence Feed</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525B]" />
                  <input 
                    type="text" 
                    placeholder="Search transcripts..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ui-input pl-10 w-64"
                  />
                </div>
              </div>

              <div className="divide-y divide-[#1F1F23]">
                {loading && meetings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-[#A1A1AA]">
                    <Loader2 className="h-6 w-6 animate-spin mb-4 text-[#52525B]" />
                    <p className="text-xs font-medium uppercase tracking-wider">Syncing database...</p>
                  </div>
                ) : meetings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-[#52525B]">
                    <Play className="h-10 w-10 mb-4 opacity-20" />
                    <p className="text-sm">No meetings found.</p>
                  </div>
                ) : (
                  meetings.map((meeting) => (
                    <MeetingRow 
                      key={meeting.id}
                      id={meeting.id}
                      title={meeting.title} 
                      date={new Date(meeting.createdAt).toLocaleDateString()} 
                      status={meeting.status} 
                      summary={meeting.summary?.short}
                      onClick={() => router.push(`/meetings/${meeting.id}`)}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="ui-card">
      <div className="flex items-center gap-3 mb-4 text-[#A1A1AA]">
        <div className="p-2 bg-[#151518] rounded-md border border-[#1F1F23]">
          {icon && (
            <div className="stroke-[1.5]">
              {icon}
            </div>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest">{title}</span>
      </div>
      <h3 className="text-2xl font-semibold text-white tracking-tight">{value}</h3>
    </div>
  );
}

function MeetingRow({ id, title, date, status, summary, onClick }: any) {
  const isProcessed = status === "PROCESSED";
  const isFailed = status === "FAILED";
  
  return (
    <div 
      onClick={onClick}
      className="group flex items-center gap-6 p-6 hover:bg-[#151518] transition-colors cursor-pointer"
    >
      <div className="h-10 w-10 rounded-lg bg-[#151518] border border-[#1F1F23] flex items-center justify-center text-[#A1A1AA] group-hover:text-white transition-colors">
        <FileVideo className="h-5 w-5 stroke-[1.5]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
            {title}
          </h4>
          <span className="text-[10px] font-medium text-[#52525B] uppercase tracking-wider">
            {date}
          </span>
        </div>
        <p className="text-xs text-[#A1A1AA] line-clamp-1 mb-2 font-medium">
          {summary || "AI is currently extracting organizational memory..."}
        </p>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
            isProcessed ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 
            isFailed ? 'bg-rose-500/5 text-rose-500 border-rose-500/10' :
            'bg-indigo-500/5 text-indigo-400 border-indigo-500/20'
          }`}>
            <div className={`h-1 w-1 rounded-full ${isProcessed ? 'bg-emerald-500' : isFailed ? 'bg-rose-500' : 'bg-indigo-500'}`} />
            {status}
          </div>
          <span className="text-[10px] text-[#2D2D33] font-medium tracking-tighter">ID: {id.slice(-6)}</span>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-[#2D2D33] group-hover:text-[#A1A1AA] group-hover:translate-x-1 transition-all" />
    </div>
  );
}
