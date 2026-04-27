"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  FileAudio, FileVideo, Users, Calendar, Clock, 
  CheckCircle, AlertCircle, Info, Download, 
  Share2, ChevronRight, MessageSquare, Activity,
  ArrowLeft, Loader2, X, ArrowUpRight, Send, Mail, Check, Lightbulb
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
    { role: 'assistant', content: "Hello! Ask me anything about this meeting's transcript." }
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#A1A1AA]">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-indigo-500" />
        <p className="text-sm font-medium">Loading analysis...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="ui-container py-20 text-center">
        <AlertCircle className="h-10 w-10 mx-auto text-rose-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-white">Meeting not found</h2>
        <p className="text-[#A1A1AA] mb-8 max-w-xs mx-auto">The requested meeting report could not be retrieved.</p>
        <button onClick={() => router.push('/')} className="ui-button-primary">Return to Dashboard</button>
      </div>
    );
  }

  const handleExport = async () => {
    if (!WORKSPACE_ID || !USER_ID || !id) return;
    window.open(`${API_URL}/meetings/${id}/export/pdf?workspaceId=${WORKSPACE_ID}&userId=${USER_ID}`, '_blank');
  };

  const handleToggleTask = async (actionItemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'OPEN' : 'COMPLETED';
    
    // Optimistic update
    setMeeting((prev: any) => ({
      ...prev,
      actionItems: prev.actionItems.map((ai: any) => 
        ai.id === actionItemId ? { ...ai, status: newStatus } : ai
      )
    }));

    try {
      await fetch(`${API_URL}/meetings/action-items/${actionItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': WORKSPACE_ID,
          'x-user-id': USER_ID,
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update task status:", err);
      // Revert on error
      setMeeting((prev: any) => ({
        ...prev,
        actionItems: prev.actionItems.map((ai: any) => 
          ai.id === actionItemId ? { ...ai, status: currentStatus } : ai
        )
      }));
    }
  };

  // Calculate Average AI Confidence
  const calculateConfidence = () => {
    const items = [
      ...(meeting.actionItems || []),
      ...(meeting.decisions || []),
      ...(meeting.risks || [])
    ];
    const total = items.reduce((acc, i) => acc + (i.confidence || 0.9), 0);
    return items.length > 0 ? Math.round((total / items.length) * 100) : 90;
  };

  const avgConfidence = calculateConfidence();

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="ui-container py-12">
        {/* Breadcrumb */}
        <button 
          onClick={() => router.push('/workspace')}
          className="flex items-center gap-2 text-sm font-medium text-[#A1A1AA] hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-[#1F1F23] mb-12">
          <div className="flex items-start gap-5">
            <div className="h-12 w-12 rounded-lg bg-[#151518] border border-[#1F1F23] flex items-center justify-center text-[#A1A1AA]">
              {meeting.videoUrl ? <FileVideo className="h-5 w-5 stroke-[1.5]" /> : <FileAudio className="h-5 w-5 stroke-[1.5]" />}
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight">{meeting.title}</h1>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA]">
                  <Calendar className="h-3.5 w-3.5 stroke-[1.5]" /> 
                  {new Date(meeting.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA]">
                  <Clock className="h-3.5 w-3.5 stroke-[1.5]" /> 
                  {meeting.duration || '0'}m duration
                </span>
                <span className="ui-badge">
                  {meeting.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`ui-button-secondary text-sm flex items-center gap-2 ${isChatOpen ? 'bg-white text-black hover:bg-zinc-200' : ''}`}
            >
              <Activity className="h-4 w-4 stroke-[1.5]" />
              {isChatOpen ? 'Close Assistant' : 'AI Assistant'}
            </button>
            <button onClick={() => setIsShareModalOpen(true)} className="ui-button-secondary text-sm flex items-center gap-2">
              <Share2 className="h-4 w-4 stroke-[1.5]" />
              Share
            </button>
            <button onClick={handleExport} className="ui-button-secondary text-sm flex items-center gap-2">
              <Download className="h-4 w-4 stroke-[1.5]" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Executive Summary */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Activity className="h-4 w-4 text-[#A1A1AA] stroke-[1.5]" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#A1A1AA]">Executive Summary</h2>
              </div>
              <div className="ui-card p-8">
                <p className="text-lg text-zinc-200 leading-relaxed font-medium mb-10">
                  {meeting.summary?.detailed || "Summary is being generated..."}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-[#1F1F23]">
                  <div className="p-5 bg-[#151518] rounded-lg border border-[#1F1F23]">
                    <h3 className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-3">Key Takeaway</h3>
                    <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                      {meeting.summary?.short || "Summary pending..."}
                    </p>
                  </div>
                  <div className="p-5 bg-[#151518] rounded-lg border border-[#1F1F23]">
                    <h3 className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-3">AI Confidence</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 flex-1 bg-[#1F1F23] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${avgConfidence}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold text-[#A1A1AA]">{avgConfidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Transcript */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#A1A1AA] stroke-[1.5]" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#A1A1AA]">Transcript</h2>
                </div>
                <span className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">
                  {meeting.transcript?.length || 0} Segments
                </span>
              </div>
              
              <div className="ui-card p-0 flex flex-col h-[700px] overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 space-y-10">
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
                    <div className="flex flex-col items-center justify-center h-full text-[#52525B] gap-4">
                      <Loader2 className="h-6 w-6 animate-spin opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">Processing transcript...</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 sticky top-32">
            <IntelligenceSection 
              title="Action Items" 
              icon={<CheckCircle className="h-4 w-4" />}
              items={meeting.actionItems?.map((a: any) => ({
                id: a.id,
                label: a.task,
                owner: a.owner,
                status: a.status,
                date: a.deadline ? new Date(a.deadline).toLocaleDateString() : null
              })) || []}
              onTaskToggle={handleToggleTask}
            />
            <IntelligenceSection 
              title="Key Decisions" 
              icon={<ChevronRight className="h-4 w-4" />}
              items={meeting.decisions?.map((d: any) => ({
                label: d.content
              })) || []}
            />
            <IntelligenceSection 
              title="Risks & Blockers" 
              icon={<AlertCircle className="h-4 w-4" />}
              items={meeting.risks?.map((r: any) => ({
                label: r.content,
                severity: r.severity
              })) || []}
            />
          </div>
        </div>
      </div>

      {/* AI Chat Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#0D0D0F] border-l border-[#1F1F23] shadow-2xl z-[100] transition-transform duration-300 ease-in-out transform ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-[#1F1F23] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-[#A1A1AA] stroke-[1.5]" />
              <h3 className="font-semibold text-white">Meeting Assistant</h3>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-[#1F1F23] rounded-lg transition-colors">
              <X className="h-4 w-4 text-[#A1A1AA]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none font-medium' 
                    : 'bg-[#151518] border border-[#1F1F23] text-zinc-200 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-[#151518] border border-[#1F1F23] p-4 rounded-xl rounded-tl-none">
                  <Loader2 className="h-4 w-4 animate-spin text-[#52525B]" />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-[#1F1F23] bg-[#0A0A0B]">
            <form onSubmit={handleSendMessage} className="relative">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about this meeting..."
                className="ui-input w-full pr-12"
              />
              <button 
                type="submit"
                disabled={isSending || !chatInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-md transition-all"
              >
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="ui-card w-full max-w-sm p-8 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-2">Share Report</h3>
            <p className="text-sm text-[#A1A1AA] mb-6">Send this meeting analysis via email.</p>
            
            {shareSuccess ? (
              <div className="flex flex-col items-center py-6 text-emerald-500">
                <Check className="h-10 w-10 mb-2" />
                <p className="font-medium text-sm">Sent successfully</p>
              </div>
            ) : (
              <form onSubmit={handleShareReport} className="space-y-4">
                <input 
                  type="email" 
                  required
                  placeholder="email@company.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="ui-input w-full"
                />
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsShareModalOpen(false)} className="ui-button-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSharing} className="ui-button-primary flex-1">
                    {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TranscriptSegment({ speaker, time, content }: any) {
  return (
    <div className="flex gap-6 group">
      <div className="w-12 shrink-0 pt-1">
        <div className="text-[10px] font-mono font-bold text-[#52525B] uppercase tracking-tighter">
          {time}
        </div>
      </div>
      <div className="space-y-1.5 flex-1 max-w-3xl">
        <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
          {speaker}
        </div>
        <p className="text-base text-zinc-300 leading-relaxed font-normal group-hover:text-white transition-colors">
          {content}
        </p>
      </div>
    </div>
  );
}

function IntelligenceSection({ title, icon, items, onTaskToggle }: any) {
  return (
    <div className="ui-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#151518] rounded-md border border-[#1F1F23]">
          {icon && React.cloneElement(icon as React.ReactElement, { size: 16, strokeWidth: 1.5, className: "text-[#A1A1AA]" })}
        </div>
        <h3 className="font-semibold text-[10px] uppercase tracking-widest text-[#A1A1AA]">{title}</h3>
      </div>
      <div className="space-y-3">
        {items && items.length > 0 ? (
          items.map((item: any, i: number) => (
            <div key={i} className={`bg-[#0D0D0F] border border-[#1F1F23] p-4 rounded-lg transition-opacity ${item.status === 'COMPLETED' ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-start gap-3 mb-3">
                {onTaskToggle && (
                   <button 
                    onClick={() => onTaskToggle(item.id, item.status)}
                    className={`mt-1 h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                      item.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-[#1F1F23] hover:border-[#52525B]'
                    }`}
                   >
                     {item.status === 'COMPLETED' && <Check className="h-3 w-3" />}
                   </button>
                )}
                <p className={`text-sm font-medium leading-relaxed ${item.status === 'COMPLETED' ? 'text-[#52525B] line-through' : 'text-zinc-300'}`}>
                  {item.label}
                </p>
              </div>
              
              {(item.owner || item.severity) && (
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  {item.owner && (
                    <span className="text-[#A1A1AA] bg-[#1F1F23] px-2 py-0.5 rounded border border-[#1F1F23]">
                      {item.owner}
                    </span>
                  )}
                  {item.severity && (
                    <span className={`px-2 py-0.5 rounded border ${
                      item.severity === 'HIGH' ? 'text-rose-500 border-rose-500/10' : 'text-amber-500 border-amber-500/10'
                    }`}>
                      {item.severity}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-xs text-[#52525B] italic">No data extracted.</p>
        )}
      </div>
    </div>
  );
}
