"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

interface Notification {
  id: string;
  title: string;
  message: string;
  type?: string;
  isRead?: boolean;
  userId?: string;
  createdAt: string;
}

const TYPE_STYLES: Record<string, string> = {
  INFO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SUCCESS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  WARNING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  ERROR: "bg-red-500/10 text-red-400 border-red-500/20",
  ANNOUNCEMENT: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const TYPE_ICONS: Record<string, string> = {
  INFO: "ℹ️",
  SUCCESS: "✅",
  WARNING: "⚠️",
  ERROR: "🚨",
  ANNOUNCEMENT: "📢",
};

export default function AdminNotificationsPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "INFO" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
      } else {
        setError("Failed to load notifications");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleSend = async () => {
    if (!form.title || !form.message) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/notifications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": TENANT,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess("Notification sent!");
        setForm({ title: "", message: "", type: "INFO" });
        setShowForm(false);
        fetchNotifications();
      } else {
        const err = await res.json();
        setError(err.message || "Failed to send notification");
      }
    } catch {
      setError("Network error");
    } finally {
      setSending(false);
    }
  };

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
                <h1 className="text-2xl font-black text-white">🔔 Notifications</h1>
                <p className="text-white/40 text-sm">{notifications.length} total notifications</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 transition-all"
            >
              📢 Send Notification
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

        {/* Send Form */}
        {showForm && (
          <div className="glass-card p-6 mb-6">
            <h3 className="text-white font-bold mb-4">Send New Notification</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title *"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
                />
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm"
                >
                  {["INFO", "SUCCESS", "WARNING", "ERROR", "ANNOUNCEMENT"].map((t) => (
                    <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Message *"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm resize-none"
              />
            </div>
            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !form.title || !form.message}
                className="px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 disabled:opacity-50 transition-all"
              >
                {sending ? "Sending..." : "📢 Send"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-4 animate-pulse h-20" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">🔔</div>
            <p className="text-white/40">No notifications yet. Send your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className={`glass-card p-5 ${!n.isRead ? "border-l-2 border-l-lebanon-green" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0">{TYPE_ICONS[n.type || "INFO"] || "🔔"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-white font-semibold text-sm">{n.title}</span>
                        {n.type && (
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${TYPE_STYLES[n.type] || TYPE_STYLES.INFO}`}>
                            {n.type}
                          </span>
                        )}
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-lebanon-green flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-white/50 text-sm">{n.message}</p>
                    </div>
                  </div>
                  <div className="text-white/30 text-xs flex-shrink-0">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
