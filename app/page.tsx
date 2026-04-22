import { FileAudio, FileVideo, Plus, Search, Calendar, Users, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Workspace Intelligence</h1>
          <p className="text-slate-400">Manage and analyze your team's meeting memory.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-all">
            <Plus className="h-4 w-4" />
            New Meeting
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Meetings" value="128" change="+12%" icon={<FileVideo className="text-indigo-400" />} />
        <StatCard title="Hours Analyzed" value="42.5" change="+5.2%" icon={<Calendar className="text-emerald-400" />} />
        <StatCard title="Action Items" value="342" change="+18.4%" icon={<CheckCircle2 className="text-amber-400" />} />
        <StatCard title="Participants" value="84" change="+2.1%" icon={<Users className="text-rose-400" />} />
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold">Recent Meetings</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search transcript, title, or tags..." 
              className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64"
            />
          </div>
        </div>

        <div className="space-y-4">
          <MeetingRow 
            title="Q3 Product Roadmap Sync" 
            date="2 hours ago" 
            status="Processed" 
            type="video" 
            participants={4} 
            summary="Discussion on feature prioritization and engineering bandwidth for the upcoming quarter."
          />
          <MeetingRow 
            title="Design System Review" 
            date="Yesterday" 
            status="Processed" 
            type="video" 
            participants={3} 
            summary="Refining the color tokens and typography for the MeetingMind dashboard overhaul."
          />
          <MeetingRow 
            title="Weekly Engineering Standup" 
            date="Apr 21, 2026" 
            status="Transcribing" 
            type="audio" 
            participants={8} 
            summary="Quick updates on current sprints and blocker identification."
          />
        </div>
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
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  );
}

function MeetingRow({ title, date, status, type, participants, summary }: any) {
  const isProcessed = status === "Processed";
  
  return (
    <div className="group flex items-start gap-4 p-4 rounded-xl hover:bg-slate-800/30 transition-colors border border-transparent hover:border-slate-700/50 cursor-pointer">
      <div className={`mt-1 p-3 rounded-xl ${type === 'video' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'}`}>
        {type === 'video' ? <FileVideo className="h-5 w-5" /> : <FileAudio className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-slate-200 group-hover:text-white">{title}</h4>
          <span className="text-xs text-slate-500">{date}</span>
        </div>
        <p className="text-sm text-slate-400 line-clamp-1 mb-2">{summary}</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5" />
            {participants} participants
          </div>
          <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${isProcessed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400 animate-pulse'}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${isProcessed ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            {status}
          </div>
        </div>
      </div>
    </div>
  );
}
