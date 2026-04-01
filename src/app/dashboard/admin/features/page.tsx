"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

interface FeatureFlag {
  id: string;
  key: string;
  isEnabled: boolean;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

const FLAG_META: Record<string, { icon: string; label: string; desc: string }> = {
  gallery: { icon: "🖼️", label: "Gallery", desc: "Public gallery section on the website" },
  news: { icon: "📰", label: "News & Events", desc: "News ticker and articles section" },
  booking: { icon: "📅", label: "Online Booking", desc: "Allow visitors to book trial sessions" },
  payments: { icon: "💳", label: "Online Payments", desc: "Enable online payment processing" },
  notifications: { icon: "🔔", label: "Notifications", desc: "Push notifications to users" },
  achievements: { icon: "🏆", label: "Achievements", desc: "Achievements & trophies section" },
  chat: { icon: "💬", label: "Live Chat", desc: "WhatsApp / live chat widget" },
  multilingual: { icon: "🌐", label: "Multilingual", desc: "Arabic / English language toggle" },
  registration: { icon: "📝", label: "Registration", desc: "Allow new user registrations" },
  maintenance: { icon: "🔧", label: "Maintenance Mode", desc: "Show maintenance page to visitors" },
};

export default function AdminFeaturesPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFlag, setNewFlag] = useState({ key: "", description: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  const fetchFlags = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/feature-flags`, {
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      if (res.ok) {
        const data = await res.json();
        setFlags(data.data || []);
      } else {
        setError("Failed to load feature flags");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchFlags(); }, [fetchFlags]);

  const handleToggle = async (key: string) => {
    setTogglingKey(key);
    try {
      const res = await fetch(`${API}/feature-flags/${key}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      if (res.ok) {
        const data = await res.json();
        setFlags((prev) => prev.map((f) => f.key === key ? { ...f, isEnabled: data.data.isEnabled } : f));
        setSuccess(data.message || `Feature '${key}' toggled`);
      } else {
        const err = await res.json();
        setError(err.message || "Failed to toggle feature");
      }
    } catch {
      setError("Network error");
    } finally {
      setTogglingKey(null);
    }
  };

  const handleAdd = async () => {
    if (!newFlag.key) return;
    setAdding(true);
    try {
      const res = await fetch(`${API}/feature-flags`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": TENANT,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: newFlag.key.toLowerCase().replace(/\s+/g, "_"), description: newFlag.description, isEnabled: false }),
      });
      if (res.ok) {
        setSuccess("Feature flag created!");
        setNewFlag({ key: "", description: "" });
        setShowAddForm(false);
        fetchFlags();
      } else {
        const err = await res.json();
        setError(err.message || "Failed to create flag");
      }
    } catch {
      setError("Network error");
    } finally {
      setAdding(false);
    }
  };

  const enabledCount = flags.filter((f) => f.isEnabled).length;

  if (isLoading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/admin" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
                ←
              </Link>
              <div>
                <h1 className="text-2xl font-black text-white">⚙️ Feature Flags</h1>
                <p className="text-white/40 text-sm">{enabledCount}/{flags.length} features enabled</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 transition-all"
            >
              + New Flag
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex justify-between">
            {error} <button onClick={() => setError(null)}>✕</button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex justify-between">
            {success} <button onClick={() => setSuccess(null)}>✕</button>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="glass-card p-6 mb-6">
            <h3 className="text-white font-bold mb-4">Create New Feature Flag</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Flag key (e.g. dark_mode) *"
                value={newFlag.key}
                onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value })}
                className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newFlag.description}
                onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">Cancel</button>
              <button onClick={handleAdd} disabled={adding || !newFlag.key} className="px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 disabled:opacity-50 transition-all">
                {adding ? "Creating..." : "Create Flag"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse h-24" />
            ))}
          </div>
        ) : flags.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">⚙️</div>
            <p className="text-white/40">No feature flags found. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flags.map((flag) => {
              const meta = FLAG_META[flag.key] || { icon: "🔧", label: flag.key, desc: flag.description || "Custom feature flag" };
              return (
                <div key={flag.id} className={`glass-card p-5 transition-all ${flag.isEnabled ? "border-lebanon-green/20" : "border-white/5"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold text-sm">{meta.label}</span>
                          <code className="text-white/30 text-xs bg-dark-800 px-1.5 py-0.5 rounded">{flag.key}</code>
                        </div>
                        <p className="text-white/40 text-xs mt-0.5">{meta.desc}</p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggle(flag.key)}
                      disabled={togglingKey === flag.key}
                      className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ml-4 ${
                        flag.isEnabled ? "bg-lebanon-green" : "bg-dark-800 border border-white/10"
                      } ${togglingKey === flag.key ? "opacity-50" : ""}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        flag.isEnabled ? "left-6" : "left-0.5"
                      }`} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs font-medium ${flag.isEnabled ? "text-lebanon-green" : "text-white/30"}`}>
                      {flag.isEnabled ? "● Enabled" : "○ Disabled"}
                    </span>
                    <span className="text-white/20 text-xs">
                      {flag.updatedAt ? `Updated ${new Date(flag.updatedAt).toLocaleDateString()}` : `Created ${new Date(flag.createdAt).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
