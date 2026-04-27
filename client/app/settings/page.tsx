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

  const [copied, setCopied] = useState(false);

  const copyWorkspaceId = () => {
    if (!WORKSPACE_ID) return;
    navigator.clipboard.writeText(WORKSPACE_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#A1A1AA]">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-indigo-500" />
        <p className="text-sm font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="ui-container py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight mb-2 text-white">Workspace Settings</h1>
        <p className="text-[#A1A1AA] text-sm">Manage team members, workspace identity, and configuration.</p>
      </div>

      {message && (
        <div className="mb-8 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-center gap-3 text-indigo-400">
          <CheckCircle2 className="h-4 w-4" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left Column: Forms */}
        <div className="md:col-span-2 space-y-10">
          {/* General Settings */}
          <section className="ui-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-[#1F1F23] rounded-lg">
                <Building2 className="h-4 w-4 text-[#A1A1AA]" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#A1A1AA]">General</h2>
            </div>
            
            <form onSubmit={handleUpdateWorkspace} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest ml-1">Workspace Name</label>
                <input 
                  type="text" 
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="ui-input w-full"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={updating}
                  className="ui-button-primary flex items-center gap-2"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* Team Members */}
          <section className="ui-card">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#1F1F23] rounded-lg">
                  <Users className="h-4 w-4 text-[#A1A1AA]" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#A1A1AA]">Team Members</h2>
              </div>
              <span className="ui-badge">
                {workspace?.users?.length || 0} Members
              </span>
            </div>

            <div className="space-y-3 mb-10">
              {workspace?.users?.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0D0D0F] border border-[#1F1F23]">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#1F1F23] flex items-center justify-center text-[#A1A1AA] font-bold text-xs border border-[#2D2D33]">
                      {user.fullName?.[0] || user.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user.fullName || "Unnamed User"}</p>
                      <p className="text-xs text-[#52525B]">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-0.5 bg-indigo-500/5 rounded border border-indigo-500/10">
                    <Shield className="h-3 w-3 text-indigo-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{user.role || 'Member'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-10 border-t border-[#1F1F23]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#52525B] mb-4">Invite new member</h3>
              <form onSubmit={handleInvite} className="flex gap-3">
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="ui-input flex-1"
                  placeholder="teammate@example.com"
                  required
                />
                <button 
                  type="submit"
                  disabled={inviting}
                  className="ui-button-primary flex items-center gap-2"
                >
                  {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Invite
                </button>
              </form>
            </div>
          </section>
        </div>

        {/* Right Column: Identity */}
        <div className="space-y-6">
          <div className="ui-card">
            <h4 className="text-[10px] font-bold text-[#52525B] uppercase tracking-[0.2em] mb-6">Workspace Identity</h4>
            <div className="bg-[#0D0D0F] border border-[#1F1F23] rounded-xl p-4 mb-6">
              <p className="text-[10px] font-mono text-[#A1A1AA] break-all leading-relaxed">
                {WORKSPACE_ID}
              </p>
            </div>
            <button 
              onClick={copyWorkspaceId}
              className={`w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                copied ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' : 'bg-[#1F1F23] text-[#A1A1AA] border-[#2D2D33] hover:bg-[#2D2D33]'
              }`}
            >
              {copied ? 'Identity Copied!' : 'Copy Workspace ID'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
