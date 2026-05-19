"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { notificationsApi } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

type NotifType = "ANNOUNCEMENT" | "INFO" | "SUCCESS";

interface SentNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  imageUrl?: string | null;
  isRead: boolean;
  popupDismissed: boolean;
  createdAt: string;
  userId?: string | null;
  recipientCount?: number;
}

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const TYPE_CONFIG: Record<NotifType, { label: string; icon: string; color: string; bg: string; border: string; ring: string }> = {
  ANNOUNCEMENT: {
    label: "Announcement",
    icon: "📢",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    ring: "ring-purple-500",
  },
  INFO: {
    label: "Info",
    icon: "ℹ️",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    ring: "ring-blue-500",
  },
  SUCCESS: {
    label: "Success",
    icon: "✅",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    ring: "ring-emerald-500",
  },
};

const ALL_TYPES = Object.keys(TYPE_CONFIG) as NotifType[];

export default function AdminNotificationsPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();

  // Sent history
  const [notifications, setNotifications] = useState<SentNotification[]>([]);
  const [histLoading, setHistLoading] = useState(true);

  // Compose form
  const [showCompose, setShowCompose] = useState(false);
  const [nType, setNType] = useState<NotifType>("ANNOUNCEMENT");
  const [nTitle, setNTitle] = useState("");
  const [nMessage, setNMessage] = useState("");
  const [nImage, setNImage] = useState("");
  const [recipientMode, setRecipientMode] = useState<"ALL" | "SELECTED">("ALL");
  const [parents, setParents] = useState<Parent[]>([]);
  const [parentsLoading, setParentsLoading] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const [selectedParents, setSelectedParents] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [sendErr, setSendErr] = useState<string | null>(null);

  // Image preview debounce
  const imgRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [imgPreview, setImgPreview] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  // Fetch notifications sent by this admin
  const fetchHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const res = await notificationsApi.getSent();
      setNotifications((res.data as SentNotification[]) || []);
    } catch {
      // keep page resilient
    } finally { setHistLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Fetch parents list when switching to SELECTED mode
  useEffect(() => {
    if (recipientMode !== "SELECTED" || parents.length > 0 || !token) return;
    setParentsLoading(true);
    fetch(`${API}/users?role=PARENT`, {
      headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
    })
      .then((r) => r.json())
      .then((d) => setParents((d.data || d) as Parent[]))
      .catch(() => {})
      .finally(() => setParentsLoading(false));
  }, [recipientMode, token, parents.length]);

  function handleImageInput(val: string) {
    setNImage(val);
    if (imgRef.current) clearTimeout(imgRef.current);
    imgRef.current = setTimeout(() => setImgPreview(val.trim()), 600);
  }

  function toggleParent(id: string) {
    setSelectedParents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function toggleAllFiltered() {
    const visible = filteredParents.map((p) => p.id);
    const allSelected = visible.every((id) => selectedParents.has(id));
    setSelectedParents((prev) => {
      const next = new Set(prev);
      if (allSelected) { visible.forEach((id) => next.delete(id)); }
      else { visible.forEach((id) => next.add(id)); }
      return next;
    });
  }

  const filteredParents = parents.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase().includes(parentSearch.toLowerCase())
  );

  async function handleSend() {
    if (!nTitle.trim() || !nMessage.trim()) { setSendErr("Title and message are required."); return; }
    if (recipientMode === "SELECTED" && selectedParents.size === 0) { setSendErr("Select at least one parent."); return; }
    setSending(true); setSendErr(null); setSendResult(null);
    try {
      const res = await notificationsApi.broadcast({
        type: nType,
        title: nTitle.trim(),
        message: nMessage.trim(),
        imageUrl: nImage.trim() || undefined,
        recipientType: recipientMode,
        parentIds: recipientMode === "SELECTED" ? Array.from(selectedParents) : undefined,
      });
      const count = (res.data as { created: number }).created;
      setSendResult(`Sent to ${count} parent${count !== 1 ? "s" : ""} successfully.`);
      setNTitle(""); setNMessage(""); setNImage(""); setImgPreview("");
      setSelectedParents(new Set()); setRecipientMode("ALL"); setNType("ANNOUNCEMENT");
      setShowCompose(false);
      fetchHistory();
    } catch (e) {
      setSendErr(e instanceof Error ? e.message : "Failed to send.");
    } finally { setSending(false); }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 pt-20">

      {/* Header */}
      <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">🔔 Notifications</h1>
              <p className="text-white/40 text-sm">Send announcements to parents</p>
            </div>
          </div>
          <button
            onClick={() => { setShowCompose(true); setSendErr(null); setSendResult(null); }}
            className="px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 transition-all flex items-center gap-2"
          >
            <span>+</span> New Notification
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Global feedback */}
        {sendResult && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex justify-between">
            ✅ {sendResult}
            <button onClick={() => setSendResult(null)}>✕</button>
          </div>
        )}

        {/* Compose modal */}
        {showCompose && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
                <h2 className="text-white font-bold text-lg">New Notification</h2>
                <button onClick={() => setShowCompose(false)} className="text-white/40 hover:text-white transition-colors text-xl leading-none">✕</button>
              </div>

              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                {/* Type selector */}
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block">Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {ALL_TYPES.map((t) => {
                      const cfg = TYPE_CONFIG[t];
                      const active = nType === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setNType(t)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${active ? `${cfg.bg} ${cfg.border} ring-2 ${cfg.ring}/40` : "bg-white/3 border-white/8 hover:border-white/15"}`}
                        >
                          <span className="text-2xl">{cfg.icon}</span>
                          <span className={`text-xs font-semibold ${active ? cfg.color : "text-white/50"}`}>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block">Title *</label>
                  <input
                    type="text"
                    value={nTitle}
                    onChange={(e) => setNTitle(e.target.value)}
                    placeholder="e.g. Summer Camp Registration Open"
                    className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-lebanon-green/50 text-sm"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block">Message *</label>
                  <textarea
                    value={nMessage}
                    onChange={(e) => setNMessage(e.target.value)}
                    placeholder="Write your message here..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-lebanon-green/50 text-sm resize-none"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block">Image URL <span className="normal-case text-white/30">(optional)</span></label>
                  <input
                    type="url"
                    value={nImage}
                    onChange={(e) => handleImageInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-lebanon-green/50 text-sm"
                  />
                  {imgPreview && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-h-40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgPreview}
                        alt="preview"
                        className="w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                </div>

                {/* Recipients */}
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block">Send To</label>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setRecipientMode("ALL")}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${recipientMode === "ALL" ? "bg-lebanon-green/15 border-lebanon-green/40 text-lebanon-green" : "bg-white/3 border-white/10 text-white/50 hover:border-white/20"}`}
                    >
                      👥 All Parents
                    </button>
                    <button
                      onClick={() => setRecipientMode("SELECTED")}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${recipientMode === "SELECTED" ? "bg-blue-500/15 border-blue-500/40 text-blue-400" : "bg-white/3 border-white/10 text-white/50 hover:border-white/20"}`}
                    >
                      🎯 Select Parents
                    </button>
                  </div>

                  {recipientMode === "SELECTED" && (
                    <div className="bg-dark-900 border border-white/8 rounded-xl overflow-hidden">
                      <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
                        <input
                          type="text"
                          value={parentSearch}
                          onChange={(e) => setParentSearch(e.target.value)}
                          placeholder="Search parents..."
                          className="flex-1 bg-transparent text-white text-sm placeholder-white/25 focus:outline-none"
                        />
                        {filteredParents.length > 0 && (
                          <button onClick={toggleAllFiltered} className="text-xs text-white/40 hover:text-white/70 transition-colors whitespace-nowrap">
                            {filteredParents.every((p) => selectedParents.has(p.id)) ? "Deselect all" : "Select all"}
                          </button>
                        )}
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {parentsLoading ? (
                          <div className="px-4 py-6 text-center text-white/30 text-sm">Loading parents…</div>
                        ) : filteredParents.length === 0 ? (
                          <div className="px-4 py-6 text-center text-white/30 text-sm">No parents found</div>
                        ) : (
                          filteredParents.map((p) => (
                            <label key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/3 cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedParents.has(p.id)}
                                onChange={() => toggleParent(p.id)}
                                className="accent-lebanon-green w-4 h-4"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-medium">{p.firstName} {p.lastName}</div>
                                <div className="text-white/35 text-xs truncate">{p.email}</div>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                      {selectedParents.size > 0 && (
                        <div className="px-4 py-2 border-t border-white/5 bg-white/2 text-xs text-white/50">
                          {selectedParents.size} parent{selectedParents.size !== 1 ? "s" : ""} selected
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Errors */}
                {sendErr && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {sendErr}
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-white/8 flex-shrink-0">
                <button
                  onClick={() => setShowCompose(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !nTitle.trim() || !nMessage.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 disabled:opacity-50 transition-all"
                >
                  {sending ? "Sending…" : `Send ${recipientMode === "ALL" ? "to All" : `to ${selectedParents.size} Parent${selectedParents.size !== 1 ? "s" : ""}`}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        <div>
          <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Sent Notifications</h2>
          {histLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-dark-800 border border-white/5 rounded-xl p-4 animate-pulse h-20" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-dark-800 border border-white/5 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-white/40 text-sm">No announcements sent yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type as NotifType];
                return (
                  <div key={n.id} className="bg-dark-800 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
                    <div className="flex items-start gap-4">
                      {n.imageUrl && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={n.imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {cfg && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                              {cfg.icon} {cfg.label}
                            </span>
                          )}
                          <span className="text-white font-semibold text-sm">{n.title}</span>
                        </div>
                        <p className="text-white/50 text-sm line-clamp-2">{n.message}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-white/30 text-xs">
                            📅 {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            {" · "}
                            {new Date(n.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {(n.recipientCount ?? 0) > 0 && (
                            <span className="text-white/40 text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/8">
                              👥 {n.recipientCount} recipient{(n.recipientCount ?? 0) !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
