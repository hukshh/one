"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Shield, Building2, Calendar, CheckCircle, Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");

  const USER_ID = session?.user?.id;
  // @ts-ignore
  const WORKSPACE_ID = session?.user?.workspaceId;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      if (!USER_ID) return;
      try {
        const response = await fetch(`${API_URL}/users/me`, {
          headers: {
            "x-user-id": USER_ID,
            "x-workspace-id": WORKSPACE_ID || "",
          },
        });
        const data = await response.json();
        setUser(data);
        setFullName(data.fullName || "");
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [USER_ID, WORKSPACE_ID, status, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": USER_ID || "",
          "x-workspace-id": WORKSPACE_ID || "",
        },
        body: JSON.stringify({ fullName }),
      });
      if (response.ok) {
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0B] text-[#A1A1AA]">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-indigo-500" />
        <p className="text-sm font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="ui-container py-12">
        <Link href="/workspace" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#52525B] hover:text-white transition-colors mb-12 group">
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
          Back to Workspace
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight mb-2 text-white">User Profile</h1>
          <p className="text-[#A1A1AA] text-sm">Manage your personal identity and account security.</p>
        </div>

        {message && (
          <div className="mb-8 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-center gap-3 text-indigo-400">
            <CheckCircle className="h-4 w-4" />
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <section className="ui-card p-10">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2.5 bg-[#1F1F23] rounded-lg">
                  <User className="h-5 w-5 text-[#A1A1AA]" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#A1A1AA]">Personal Information</h2>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="ui-input w-full"
                      placeholder="e.g. Alex Rivers"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest ml-1">Email Address</label>
                    <div className="ui-input w-full bg-[#0D0D0F] border-[#1F1F23] text-[#52525B] cursor-not-allowed flex items-center gap-3">
                      <Mail className="h-4 w-4 opacity-50" />
                      {user?.email}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={updating}
                    className="ui-button-primary px-8 flex items-center gap-2"
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </section>

            <section className="ui-card p-10">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2.5 bg-[#1F1F23] rounded-lg">
                  <Shield className="h-5 w-5 text-[#A1A1AA]" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#A1A1AA]">Security & Role</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-[#0D0D0F] border border-[#1F1F23] rounded-2xl">
                  <h3 className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest mb-3">Access Level</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-indigo-400" />
                    </div>
                    <span className="text-lg font-semibold text-white capitalize">{user?.role || "Member"}</span>
                  </div>
                </div>
                <div className="p-6 bg-[#0D0D0F] border border-[#1F1F23] rounded-2xl">
                  <h3 className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest mb-3">Active Workspace</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#1F1F23] flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-[#A1A1AA]" />
                    </div>
                    <span className="text-lg font-semibold text-white">{user?.workspace?.name || "Global"}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-8">
            <section className="ui-card p-8">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-8">Activity Snapshot</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-[#A1A1AA]" />
                    <span className="text-sm font-medium text-[#A1A1AA]">Meetings Created</span>
                  </div>
                  <span className="text-sm font-bold text-white">{user?.stats?.meetingCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-[#A1A1AA]" />
                    <span className="text-sm font-medium text-[#A1A1AA]">Active Tasks</span>
                  </div>
                  <span className="text-sm font-bold text-white">{user?.stats?.actionItems || 0}</span>
                </div>
              </div>
            </section>

            <div className="p-8 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Account Status</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Your account is verified and secured with enterprise-grade encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
