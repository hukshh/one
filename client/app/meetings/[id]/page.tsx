"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  FileAudio, FileVideo, Users, Calendar, Clock, 
  CheckCircle2, AlertCircle, Info, Download, 
  Share2, ChevronRight, PlayCircle, MessageSquare,
  ArrowLeft, Loader2
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function MeetingDetail() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Derived IDs from session
  const USER_ID = session?.user?.id;
  // @ts-ignore
  const WORKSPACE_ID = session?.user?.workspaceId;

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!WORKSPACE_ID || !USER_ID || !id) return;

      try {
        const response = await fetch(`${API_URL}/meetings/${id}`, {
          headers: {
            "x-workspace-id": WORKSPACE_ID,
            "x-user-id": USER_ID,
          },
        });
        const data = await response.json();
        
        if (data.error) {
          console.error("API Error:", data.error);
          setMeeting(null);
        } else {
          setMeeting(data);
        }
      } catch (error) {
        console.error("Failed to fetch meeting:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchMeeting();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [id, status, WORKSPACE_ID, USER_ID]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-lg">Analyzing organizational memory...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Meeting Not Found</h2>
        <p className="text-slate-400 mb-6">The meeting you are looking for doesn't exist or was deleted.</p>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-indigo-600 rounded-lg font-medium">Go Back</button>
      </div>
    );
  }

  const handleExport = async () => {
    if (!WORKSPACE_ID || !USER_ID || !id) return;
    
    try {
      window.open(`${API_URL}/meetings/${id}/export/pdf?workspaceId=${WORKSPACE_ID}&userId=${USER_ID}`, '_blank');
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export PDF report.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              {meeting.videoUrl ? <FileVideo className="h-6 w-6" /> : <FileAudio className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{meeting.title}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> 
                  {meeting.createdAt ? new Date(meeting.createdAt).toLocaleDateString() : 'Date pending'}
                </span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {meeting.duration || '0:00'} min</span>
                <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                   meeting.status === "PROCESSED" ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {meeting.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-all"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20">
              <Share2 className="h-4 w-4" />
              Share Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Transcript & Summary */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Summary Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-indigo-500/5">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Info className="h-5 w-5 text-indigo-400" />
                  Executive Summary
                </h2>
                {meeting.summary && (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                    Intelligence Synthesized
                  </span>
                )}
              </div>
              <div className="p-6">
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  {meeting.summary?.detailed || "Processing detailed summary..."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-3 uppercase tracking-wider">Key Takeaway</h3>
                    <p className="text-sm text-slate-400 italic">
                      {meeting.summary?.short || "Summary pending..."}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-3 uppercase tracking-wider">Context</h3>
                    <p className="text-xs text-slate-500">
                      This meeting was analyzed using the Llama 3.3 model via Groq for high-precision extraction.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transcript Viewer */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col h-[600px] backdrop-blur-sm">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-400" />
                  Meeting Transcript
                </h2>
                <span className="text-xs text-slate-500">{meeting.transcript?.length || 0} Segments</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {meeting.transcript?.length > 0 ? (
                  meeting.transcript.map((seg: any, i: number) => (
                    <TranscriptSegment 
                      key={i}
                      speaker={seg.speakerLabel || "Speaker"} 
                      time={new Date(seg.startTime * 1000).toISOString().substr(14, 5)} 
                      content={seg.content}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    Transcript is being generated...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Action Items, Decisions, Risks */}
          <div className="space-y-6">
            <IntelligenceSection 
              title="Action Items" 
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              items={meeting.actionItems?.map((a: any) => ({
                label: a.task,
                owner: a.owner,
                date: a.deadline ? new Date(a.deadline).toLocaleDateString() : null
              })) || []}
            />
            <IntelligenceSection 
              title="Key Decisions" 
              icon={<ChevronRight className="h-5 w-5 text-indigo-400" />}
              items={meeting.decisions?.map((d: any) => ({
                label: d.content
              })) || []}
            />
            <IntelligenceSection 
              title="Identified Risks" 
              icon={<AlertCircle className="h-5 w-5 text-amber-400" />}
              items={meeting.risks?.map((r: any) => ({
                label: r.content,
                severity: r.severity
              })) || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TranscriptSegment({ speaker, time, content }: any) {
  return (
    <div className="flex gap-4 group">
      <div className="w-12 shrink-0 text-[10px] font-mono text-slate-500 mt-1.5">{time}</div>
      <div className="space-y-1">
        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{speaker}</div>
        <p className="text-sm text-slate-300 leading-relaxed group-hover:text-white transition-colors">{content}</p>
      </div>
    </div>
  );
}

function IntelligenceSection({ title, icon, items }: any) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">
        {items && items.length > 0 ? (
          items.map((item: any, i: number) => (
            <div key={i} className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl hover:border-indigo-500/30 transition-all cursor-default">
              <p className="text-sm text-slate-200 mb-2 leading-snug">{item.label}</p>
              {(item.owner || item.severity) && (
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
                  {item.owner && <span className="text-indigo-400">Owner: {item.owner}</span>}
                  {item.date && <span className="text-slate-500">{item.date}</span>}
                  {item.severity && <span className={item.severity === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}>Severity: {item.severity}</span>}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 text-center py-4 italic">No items identified yet.</p>
        )}
      </div>
    </div>
  );
}
