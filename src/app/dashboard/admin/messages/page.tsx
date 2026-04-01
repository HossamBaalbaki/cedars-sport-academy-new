"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  sport?: string;
  isRead: boolean;
  repliedAt?: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/contact`, {
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.data || []);
      } else {
        setError("Failed to load messages");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const markRead = async (id: string) => {
    try {
      await fetch(`${API}/contact/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isRead: true } : m));
    } catch { /* silent */ }
  };

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.isRead) markRead(msg.id);
  };

  const filtered = messages.filter((m) => {
    if (filter === "UNREAD") return !m.isRead;
    if (filter === "READ") return m.isRead;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  if (isLoading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">
                ✉️ Messages
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-sm font-bold">{unreadCount}</span>
                )}
              </h1>
              <p className="text-white/40 text-sm">{messages.length} total · {unreadCount} unread</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["ALL", "UNREAD", "READ"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? "bg-lebanon-green text-white"
                  : "bg-dark-800 text-white/50 hover:text-white border border-white/10"
              }`}
            >
              {f === "UNREAD" ? `📬 ${f} (${unreadCount})` : f === "READ" ? `📭 ${f}` : `📮 ${f}`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message List */}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass-card p-4 animate-pulse h-20" />
              ))
            ) : filtered.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-3">✉️</div>
                <p className="text-white/40">No messages found</p>
              </div>
            ) : (
              filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={`w-full text-left glass-card p-4 hover:border-lebanon-green/20 transition-all ${
                    selected?.id === msg.id ? "border-lebanon-green/30 bg-lebanon-green/5" : ""
                  } ${!msg.isRead ? "border-l-2 border-l-lebanon-green" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${!msg.isRead ? "text-white" : "text-white/70"}`}>
                          {msg.name}
                        </span>
                        {!msg.isRead && (
                          <span className="w-2 h-2 rounded-full bg-lebanon-green flex-shrink-0" />
                        )}
                      </div>
                      <div className={`text-xs truncate mt-0.5 ${!msg.isRead ? "text-white/60" : "text-white/30"}`}>
                        {msg.subject}
                      </div>
                      <div className="text-white/30 text-xs truncate mt-0.5">{msg.message}</div>
                    </div>
                    <div className="text-white/30 text-xs flex-shrink-0">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:sticky lg:top-24 h-fit">
            {selected ? (
              <div className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{selected.subject}</h3>
                    <div className="text-white/40 text-xs mt-1">
                      {new Date(selected.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-white/30 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-lebanon-green/30 to-cedar-700/30 flex items-center justify-center text-sm font-bold text-lebanon-green">
                      {selected.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{selected.name}</div>
                      <div className="text-white/40 text-xs">{selected.email}</div>
                    </div>
                  </div>

                  {selected.phone && (
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <span>📞</span> {selected.phone}
                    </div>
                  )}
                  {selected.sport && (
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <span>⚽</span> Interested in: <span className="text-lebanon-green">{selected.sport}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-dark-800 mb-4">
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 transition-all"
                >
                  ↩️ Reply via Email
                </a>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-3">👆</div>
                <p className="text-white/40 text-sm">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
