"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Building2, Users, Send, CheckCircle2, Shield, Loader2, Save } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState("");

  // @ts-ignore
  const WORKSPACE_ID = session?.user?.workspaceId;
  const USER_ID = session?.user?.id;

  useEffect(() => {
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
        setWorkspace(data);
        setWorkspaceName(data.name);
      } catch (error) {
        console.error("Failed to fetch workspace:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [WORKSPACE_ID, USER_ID]);

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/workspaces/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-workspace-id": WORKSPACE_ID,
          "x-user-id": USER_ID || "",
        },
        body: JSON.stringify({ name: workspaceName }),
      });
      if (response.ok) {
        setMessage("Workspace updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to update workspace:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const response = await fetch(`${API_URL}/workspaces/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-workspace-id": WORKSPACE_ID,
          "x-user-id": USER_ID || "",
        },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (response.ok) {
        setInviteEmail("");
        setMessage(`Invitation sent to ${inviteEmail}`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to send invite:", error);
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-lg">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Workspace Settings</h1>
        <p className="text-slate-400">Manage your team, branding, and workspace configuration.</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* General Settings */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="h-5 w-5 text-indigo-400" />
              <h2 className="text-xl font-semibold">General</h2>
            </div>
            
            <form onSubmit={handleUpdateWorkspace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Workspace Name</label>
                <input 
                  type="text" 
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-bold text-white transition-all shadow-lg shadow-indigo-500/20"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* Team Members */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                <h2 className="text-xl font-semibold">Team Members</h2>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                {workspace?.users?.length || 0} Members
              </span>
            </div>

            <div className="space-y-4 mb-8">
              {workspace?.users?.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-600">
                      {user.fullName?.[0] || user.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{user.fullName || "Unnamed User"}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                    <Shield className="h-3 w-3 text-indigo-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{user.role || 'Member'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-sm font-semibold mb-4 text-slate-300">Invite new member</h3>
              <form onSubmit={handleInvite} className="flex gap-3">
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                  placeholder="teammate@example.com"
                  required
                />
                <button 
                  type="submit"
                  disabled={inviting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-white text-slate-950 disabled:opacity-50 rounded-xl font-bold transition-all shadow-lg shadow-white/5"
                >
                  {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Invite
                </button>
              </form>
            </div>
          </section>
        </div>

        {/* Right Column: Info/Plan */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/10">
            <h3 className="text-lg font-bold mb-1">Premium Plan</h3>
            <p className="text-indigo-100 text-xs mb-6">Unlimited meeting intelligence for your team.</p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-xs text-indigo-100">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Unlimited uploads</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-indigo-100">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Priority processing</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-indigo-100">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Advanced search</span>
              </div>
            </div>

            <button className="w-full py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:bg-indigo-50 transition-all">
              Manage Subscription
            </button>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-sm font-semibold mb-2">Workspace ID</h4>
            <code className="text-[10px] bg-slate-800 px-2 py-1 rounded block truncate text-slate-400">
              {WORKSPACE_ID}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
