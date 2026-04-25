"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FileAudio, FileVideo, Plus, Search, Calendar, Users, CheckCircle2, Loader2, Play } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [workspaceName, setWorkspaceName] = useState("Your Workspace");

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
      alert("Failed to upload meeting. Make sure the server is running and the file is valid.");
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-lg">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{workspaceName}</h1>
          <p className="text-slate-400">Real-time intelligence from your team's conversations.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-500/20 cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Meetings" value={meetings.length.toString()} change="+100%" icon={<FileVideo className="text-indigo-400" />} />
        <StatCard title="Hours Analyzed" value={(meetings.length * 0.5).toFixed(1)} change="+100%" icon={<Calendar className="text-emerald-400" />} />
        <StatCard title="Processed" value={meetings.filter(m => m.status === 'PROCESSED').length.toString()} change="+100%" icon={<CheckCircle2 className="text-amber-400" />} />
        <StatCard title="Workspaces" value="1" change="0%" icon={<Users className="text-rose-400" />} />
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold">Intelligence Feed</h2>
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search meeting memory..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            )}
          </div>
        </div>

        {loading && meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Connecting to database...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
            <Play className="h-12 w-12 mb-4 opacity-20" />
            <p>No meetings found. Upload one to start!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <MeetingRow 
                key={meeting.id}
                id={meeting.id}
                title={meeting.title} 
                date={new Date(meeting.createdAt).toLocaleDateString()} 
                status={meeting.status} 
                type="video" 
                summary={meeting.summary?.short || "Processing intelligence..."}
                onClick={() => router.push(`/meetings/${meeting.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon }: { title: string, value: string, change: string, icon: React.ReactNode }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-800 rounded-lg">
          {icon}
        </div>
        <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
          {change}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
    </div>
  );
}

function MeetingRow({ id, title, date, status, type, summary, onClick }: any) {
  const isProcessed = status === "PROCESSED";
  const isFailed = status === "FAILED";
  
  return (
    <div 
      onClick={onClick}
      className="group flex items-start gap-4 p-4 rounded-xl hover:bg-slate-800/30 transition-all border border-transparent hover:border-slate-700/50 cursor-pointer"
    >
      <div className={`mt-1 p-3 rounded-xl ${type === 'video' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'}`}>
        {type === 'video' ? <FileVideo className="h-5 w-5" /> : <FileAudio className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">{title}</h4>
          <span className="text-xs text-slate-500">{date}</span>
        </div>
        <p className="text-sm text-slate-400 line-clamp-1 mb-2">{summary}</p>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
            isProcessed ? 'bg-emerald-500/10 text-emerald-400' : 
            isFailed ? 'bg-rose-500/10 text-rose-400' :
            'bg-indigo-500/10 text-indigo-400 animate-pulse'
          }`}>
            <div className={`h-1.5 w-1.5 rounded-full ${
              isProcessed ? 'bg-emerald-400' : 
              isFailed ? 'bg-rose-400' :
              'bg-indigo-400'
            }`} />
            {status}
          </div>
        </div>
      </div>
    </div>
  );
}

