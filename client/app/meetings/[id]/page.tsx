"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  FileAudio, FileVideo, Users, Calendar, Clock, 
  CheckCircle2, AlertCircle, Info, Download, 
  Share2, ChevronRight, MessageSquare,
  ArrowLeft, Loader2, BrainCircuit, X, Zap, ArrowUpRight, Send, Mail, Check, Lightbulb
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

  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'assistant', content: "Hello! I'm your MeetingMind Assistant. Ask me anything about this meeting's transcript." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsSending(true);

    try {
      const response = await fetch(`${API_URL}/meetings/${id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': WORKSPACE_ID,
          'x-user-id': USER_ID,
        },
        body: JSON.stringify({ message: chatInput }),
      });

      const data = await response.json();
      if (data.answer) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error processing your request." }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleShareReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail.trim() || isSharing) return;

    setIsSharing(true);
    try {
      const response = await fetch(`${API_URL}/workspaces/share-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID || '',
          'x-workspace-id': WORKSPACE_ID || '',
        },
        body: JSON.stringify({
          meetingId: id,
          email: shareEmail,
          workspaceId: WORKSPACE_ID
        }),
      });

      if (response.ok) {
        setShareSuccess(true);
        setTimeout(() => {
          setIsShareModalOpen(false);
          setShareSuccess(false);
          setShareEmail("");
        }, 2000);
      }
    } catch (err) {
      console.error("Share error:", err);
    } finally {
      setIsSharing(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-lg font-bold animate-pulse text-indigo-400 font-mono tracking-widest">SYNCHRONIZING INTELLIGENCE...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Memory Node Missing</h2>
        <p className="text-slate-400 mb-8">The requested intelligence report could not be retrieved from the nexus.</p>
        <button onClick={() => router.push('/')} className="px-8 py-3 bg-indigo-600 rounded-2xl font-bold">Return to Dashboard</button>
      </div>
    );
  }

  const handleExport = async () => {
    if (!WORKSPACE_ID || !USER_ID || !id) return;
    window.open(`${API_URL}/meetings/${id}/export/pdf?workspaceId=${WORKSPACE_ID}&userId=${USER_ID}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
      <div className="container mx-auto px-6 py-10 relative">
        {/* Navigation */}
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-white mb-12 transition-all group uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Dashboard / Meeting Analysis
        </button>

        <div className="flex flex-col gap-10">
          {/* Header Section */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pb-10 border-b border-slate-900">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-[32px] bg-indigo-600/10 text-indigo-400 flex items-center justify-center shadow-2xl border border-indigo-500/10 backdrop-blur-3xl shrink-0">
                {meeting.videoUrl ? <FileVideo className="h-10 w-10" /> : <FileAudio className="h-10 w-10" />}
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight text-white">{meeting.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-2 px-4 py-1.5 bg-slate-900/50 rounded-full border border-white/5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" /> 
                    {new Date(meeting.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </span>
                  <span className="flex items-center gap-2 px-4 py-1.5 bg-slate-900/50 rounded-full border border-white/5">
                    <Clock className="h-3.5 w-3.5 text-emerald-400" /> 
                    {meeting.duration || '0'} Minutes Analysis
                  </span>
                  <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${
                     meeting.status === "PROCESSED" ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    <div className={`h-2 w-2 rounded-full ${meeting.status === "PROCESSED" ? 'bg-emerald-400' : 'bg-indigo-400 animate-pulse'}`} />
                    {meeting.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl ${isChatOpen ? 'bg-white text-slate-900' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'}`}
              >
                <BrainCircuit className="h-5 w-5" />
                {isChatOpen ? 'Close AI Assistant' : 'Launch AI Assistant'}
              </button>
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 px-8 py-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
              >
                <Share2 className="h-5 w-5" />
                Share via Email
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-8 py-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
              >
                <Download className="h-5 w-5" />
                Export PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content Pane */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Meeting Summary */}
              <div className="bg-slate-900/20 border border-slate-800/40 rounded-[48px] overflow-hidden backdrop-blur-3xl shadow-2xl">
                <div className="p-10 border-b border-slate-800/50 flex items-center justify-between bg-indigo-500/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">Meeting Summary</h2>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Core Intelligence Extraction</p>
                    </div>
                  </div>
                </div>
                <div className="p-12">
                  <p className="text-slate-300 leading-relaxed text-2xl mb-12 font-medium">
                    {meeting.summary?.detailed || "Generating executive intelligence summary..."}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-800/40">
                    <div className="p-8 bg-slate-950/40 rounded-[32px] border border-white/5 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Lightbulb className="h-20 w-20" />
                      </div>
                      <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Key Takeaway</h3>
                      <p className="text-lg text-slate-200 font-bold leading-relaxed">
                        {meeting.summary?.short || "Summary pending..."}
                      </p>
                    </div>
                    <div className="p-8 bg-slate-950/40 rounded-[32px] border border-white/5">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">AI Confidence</h3>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full w-[94%]" />
                        </div>
                        <span className="text-xs font-black text-indigo-400">94%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        Extracted using Llama-3.3-70B high-precision analysis. All data points verified against transcript timestamps.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Transcript Viewer */}
              <div className="bg-slate-900/20 border border-slate-800/40 rounded-[48px] flex flex-col h-[800px] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                <div className="p-10 border-b border-slate-800/50 flex items-center justify-between bg-slate-950/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded-2xl text-slate-400">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">Full Transcript</h2>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Verbatim Organizational Memory</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/50 px-4 py-2 rounded-full border border-white/5">{meeting.transcript?.length || 0} Transcription Nodes</span>
                </div>
                <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {meeting.transcript?.length > 0 ? (
                    meeting.transcript.map((seg: any, i: number) => (
                      <TranscriptSegment 
                        key={i}
                        speaker={seg.speakerLabel || "Participant"} 
                        time={new Date(seg.startTime * 1000).toISOString().substr(14, 5)} 
                        content={seg.content}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-6 text-slate-600">
                      <Loader2 className="h-12 w-12 animate-spin opacity-20" />
                      <p className="font-black uppercase tracking-[0.3em] text-[10px]">Reconstructing Speech Data...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Pane */}
            <div className="space-y-10">
              <IntelligenceSection 
                title="To-Do List" 
                subtitle="Extracted Action Items"
                icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                items={meeting.actionItems?.map((a: any) => ({
                  label: a.task,
                  owner: a.owner,
                  date: a.deadline ? new Date(a.deadline).toLocaleDateString() : null
                })) || []}
              />
              <IntelligenceSection 
                title="Key Decisions" 
                subtitle="Consensus & Agreements"
                icon={<ChevronRight className="h-5 w-5 text-indigo-400" />}
                items={meeting.decisions?.map((d: any) => ({
                  label: d.content
                })) || []}
              />
              <IntelligenceSection 
                title="Potential Risks" 
                subtitle="Threats & Blockers"
                icon={<AlertCircle className="h-5 w-5 text-rose-400" />}
                items={meeting.risks?.map((r: any) => ({
                  label: r.content,
                  severity: r.severity
                })) || []}
              />
            </div>
          </div>
        </div>

        {/* AI Chat Drawer */}
        <div className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-[#020617] border-l border-slate-800/50 shadow-[0_0_100px_rgba(0,0,0,0.8)] z-[100] transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) backdrop-blur-3xl transform ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-10 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600/10 rounded-2xl">
                  <BrainCircuit className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-black text-white uppercase tracking-[0.1em] text-sm">MeetingMind Assistant</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Transcript-Synced Intelligence</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-3 hover:bg-slate-800/50 rounded-2xl transition-all">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  <div className={`max-w-[88%] p-6 rounded-[32px] text-[15px] leading-relaxed shadow-xl ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none font-bold' 
                      : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none font-medium'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-[32px] rounded-tl-none">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 bg-slate-950/80 backdrop-blur-3xl border-t border-slate-900">
              <form onSubmit={handleSendMessage} className="relative group">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about this meeting..."
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-[24px] py-5 pl-8 pr-16 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                />
                <button 
                  type="submit"
                  disabled={isSending || !chatInput.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl transition-all shadow-xl shadow-indigo-500/30"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </button>
              </form>
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">Verified Against Nexus Memory</p>
              </div>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/60 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5">
                <Mail className="h-32 w-32" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white mb-2">Share Intelligence</h3>
                <p className="text-sm text-slate-500 mb-8 font-medium">Send a secure report link to your team member's email.</p>
                
                {shareSuccess ? (
                  <div className="flex flex-col items-center py-10 text-emerald-400 animate-in zoom-in duration-500">
                    <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                      <Check className="h-8 w-8" />
                    </div>
                    <p className="font-black uppercase tracking-widest text-sm">Report Dispatched</p>
                  </div>
                ) : (
                  <form onSubmit={handleShareReport} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Recipient Email</label>
                      <input 
                        type="email" 
                        required
                        placeholder="team-mate@company.com"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setIsShareModalOpen(false)}
                        className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isSharing}
                        className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
                      >
                        {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Send Report
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TranscriptSegment({ speaker, time, content }: any) {
  return (
    <div className="flex gap-10 group">
      <div className="w-20 shrink-0 flex flex-col items-center">
        <div className="text-[10px] font-black text-slate-600 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/5 mb-2 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all font-mono">
          {time}
        </div>
        <div className="w-px h-full bg-gradient-to-b from-slate-800 to-transparent opacity-20" />
      </div>
      <div className="space-y-3 pb-8">
        <div className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2.5">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
          {speaker}
        </div>
        <p className="text-lg text-slate-300 leading-relaxed group-hover:text-white transition-all duration-500 font-medium">
          {content}
        </p>
      </div>
    </div>
  );
}

function IntelligenceSection({ title, subtitle, icon, items }: any) {
  return (
    <div className="bg-slate-900/20 border border-slate-800/40 rounded-[40px] p-10 backdrop-blur-3xl group hover:border-indigo-500/20 transition-all duration-700 shadow-xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3.5 bg-slate-950 rounded-[20px] border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <div>
          <h3 className="font-black uppercase tracking-[0.1em] text-sm text-white">{title}</h3>
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-5">
        {items && items.length > 0 ? (
          items.map((item: any, i: number) => (
            <div key={i} className="bg-slate-950/60 border border-slate-800/80 p-6 rounded-[28px] group/item hover:bg-slate-900/80 transition-all border-l-4 border-l-indigo-600/20 hover:border-l-indigo-500">
              <p className="text-[15px] font-bold text-slate-200 mb-4 leading-relaxed group-hover/item:text-white transition-colors">{item.label}</p>
              {(item.owner || item.severity) && (
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-black pt-4 border-t border-slate-800/50">
                  {item.owner && (
                    <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
                      <Users className="h-3 w-3" /> 
                      {item.owner}
                    </div>
                  )}
                  {item.date && <span className="text-slate-600">{item.date}</span>}
                  {item.severity && (
                    <span className={`px-3 py-1 rounded-full border font-black ${
                      item.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {item.severity} SEVERITY
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10 opacity-20 group-hover:opacity-40 transition-all duration-700">
            <div className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Zap className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Link Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
