import { 
  FileAudio, FileVideo, Users, Calendar, Clock, 
  CheckCircle2, AlertCircle, Info, Download, 
  Share2, ChevronRight, PlayCircle, MessageSquare
} from "lucide-react";

export default function MeetingDetail() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <FileVideo className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Q3 Product Roadmap Sync</h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Apr 22, 2026</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 45:12 min</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-all">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-all">
              <Share2 className="h-4 w-4" />
              Share Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Transcript & Summary */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Summary Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Info className="h-5 w-5 text-indigo-400" />
                  Executive Summary
                </h2>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                  AI Confidence: 98%
                </span>
              </div>
              <div className="p-6">
                <p className="text-slate-300 leading-relaxed mb-4">
                  The meeting focused on aligning the product roadmap for Q3 2026, with a primary emphasis on the MeetingMind platform's intelligence pipeline and user dashboard overhaul. Key stakeholders discussed the integration of advanced speaker diarization and real-time sentiment analysis.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-3">Key Themes</h3>
                    <ul className="space-y-2">
                      {['Platform Scalability', 'AI Pipeline Precision', 'UX/UI Modernization'].map((theme, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          {theme}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-3">Meeting Context</h3>
                    <p className="text-xs text-slate-500 italic">
                      Strategic planning session involving Product, Engineering, and Design leads to finalize resource allocation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transcript Viewer */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-400" />
                  Interactive Transcript
                </h2>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400"><Search className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <TranscriptSegment 
                  speaker="Sarah Chen" 
                  time="00:00" 
                  content="Alright, let's get started. Today we're diving deep into the Q3 roadmap for MeetingMind. Our goal is to finalize the feature list by Friday."
                />
                <TranscriptSegment 
                  speaker="Marcus Thorne" 
                  time="00:12" 
                  content="I've reviewed the engineering bandwidth. We can handle the diarization update, but the sentiment analysis might need to push to Q4 if we want a high-confidence model."
                />
                <TranscriptSegment 
                  speaker="Elena Rodriguez" 
                  time="00:45" 
                  content="From a design perspective, the dashboard overhaul is a priority. Users are asking for better visualization of action items and decisions across multiple meetings."
                />
              </div>
            </div>
          </div>

          {/* Sidebar: Action Items, Decisions, Risks */}
          <div className="space-y-6">
            <IntelligenceSection 
              title="Action Items" 
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              items={[
                { label: "Finalize feature list for Q3", owner: "Sarah", date: "Friday" },
                { label: "Engineering audit of Whisper v3", owner: "Marcus", date: "Next Mon" },
                { label: "Initial UI mockups for Dashboard", owner: "Elena", date: "Apr 28" }
              ]}
            />
            <IntelligenceSection 
              title="Key Decisions" 
              icon={<ChevronRight className="h-5 w-5 text-indigo-400" />}
              items={[
                { label: "Adopt Whisper v3 for all core transcription" },
                { label: "Prioritize Dashboard Overhaul over Sentiment Analysis" },
                { label: "Weekly syncs shifted to Tuesdays at 10 AM" }
              ]}
            />
            <IntelligenceSection 
              title="Identified Risks" 
              icon={<AlertCircle className="h-5 w-5 text-amber-400" />}
              items={[
                { label: "Resource overlap between API and Pipeline teams", severity: "High" },
                { label: "Diarization accuracy in noisy environments", severity: "Medium" }
              ]}
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
      <div className="w-16 shrink-0 text-xs font-mono text-slate-500 mt-1">{time}</div>
      <div className="space-y-1">
        <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{speaker}</div>
        <p className="text-sm text-slate-300 leading-relaxed group-hover:text-white transition-colors cursor-pointer">{content}</p>
      </div>
    </div>
  );
}

function IntelligenceSection({ title, icon, items }: any) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item: any, i: number) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl hover:border-indigo-500/30 transition-all cursor-default">
            <p className="text-sm text-slate-200 mb-2 leading-snug">{item.label}</p>
            {(item.owner || item.severity) && (
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
                {item.owner && <span className="text-indigo-400">Owner: {item.owner}</span>}
                {item.date && <span className="text-slate-500">{item.date}</span>}
                {item.severity && <span className={item.severity === 'High' ? 'text-rose-400' : 'text-amber-400'}>Severity: {item.severity}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
