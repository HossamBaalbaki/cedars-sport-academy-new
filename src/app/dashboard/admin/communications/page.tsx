"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const API    = process.env.NEXT_PUBLIC_API_URL  || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TwilioBalance {
  balance:  number;
  currency: string;
}

interface UsageRecord {
  category:  string;
  count:     number;
  price:     number;
  priceUnit: string;
  startDate: string;
  endDate:   string;
}

interface TwilioMessage {
  sid:          string;
  to:           string;
  status:       string;
  body:         string;
  price:        number;
  priceUnit:    string;
  dateCreated:  string;
  errorMessage: string | null;
  errorCode:    number | null;
}

interface TwilioTemplate {
  sid:              string;
  friendlyName:     string;
  language:         string;
  dateCreated:      string;
  dateUpdated:      string;
  body:             string;
  whatsappStatus:   string;
  whatsappCategory: string | null;
  rejectionReason:  string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  const map: Record<string, string> = {
    delivered:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    read:        "bg-blue-500/15 text-blue-400 border-blue-500/30",
    sent:        "bg-sky-500/15 text-sky-400 border-sky-500/30",
    queued:      "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    sending:     "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    failed:      "bg-red-500/15 text-red-400 border-red-500/30",
    undelivered: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  const icon: Record<string, string> = {
    delivered: "✅", read: "👁️", sent: "📤", queued: "⏳",
    sending: "⏳", failed: "❌", undelivered: "❌",
  };
  const cls = map[status] || "bg-white/5 text-white/40 border-white/10";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {icon[status] || "•"} {status}
    </span>
  );
}

function templateBadge(status: string) {
  if (status === "approved") return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">✅ Approved</span>;
  if (status === "pending")  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">⏳ Pending</span>;
  if (status === "rejected") return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">❌ Rejected</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/5 text-white/40 border border-white/10">• {status}</span>;
}

function fmtDate(d: string | Date) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtMonth(d: string) {
  return new Date(d).toLocaleString("en-GB", { month: "long", year: "numeric" });
}

function groupUsageByMonth(records: UsageRecord[]) {
  const map: Record<string, { count: number; price: number; currency: string; startDate: string }> = {};
  for (const r of records) {
    const key = r.startDate?.slice(0, 7) || "unknown";
    if (!map[key]) map[key] = { count: 0, price: 0, currency: r.priceUnit, startDate: r.startDate };
    map[key].count += r.count;
    map[key].price += r.price;
  }
  return Object.values(map).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CommunicationsPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<"templates" | "messages">("templates");

  const [balance,   setBalance]   = useState<TwilioBalance | null>(null);
  const [usage,     setUsage]     = useState<UsageRecord[]>([]);
  const [templates, setTemplates] = useState<TwilioTemplate[]>([]);
  const [messages,  setMessages]  = useState<TwilioMessage[]>([]);
  const [msgLimit,  setMsgLimit]  = useState(50);

  const [loadingBalance,   setLoadingBalance]   = useState(true);
  const [loadingUsage,     setLoadingUsage]     = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingMessages,  setLoadingMessages]  = useState(false);

  const [errorTemplates, setErrorTemplates] = useState<string | null>(null);
  const [errorMessages,  setErrorMessages]  = useState<string | null>(null);

  const [msgSearch, setMsgSearch] = useState("");
  const [msgFilter, setMsgFilter] = useState<string>("all");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  const hdrs = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Tenant-ID": TENANT,
  }), [token]);

  // Fetch balance
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/settings/twilio/balance`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => setBalance(d.data))
      .catch(() => {})
      .finally(() => setLoadingBalance(false));
  }, [token, hdrs]);

  // Fetch usage
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/settings/twilio/usage`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => setUsage(d.data || []))
      .catch(() => {})
      .finally(() => setLoadingUsage(false));
  }, [token, hdrs]);

  // Fetch templates on load
  useEffect(() => {
    if (!token) return;
    setLoadingTemplates(true);
    fetch(`${API}/settings/twilio/templates`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => { if (d.data) setTemplates(d.data); else setErrorTemplates(d.message || "Failed to load templates"); })
      .catch(() => setErrorTemplates("Network error"))
      .finally(() => setLoadingTemplates(false));
  }, [token, hdrs]);

  // Fetch messages (lazy — only when tab selected)
  const fetchMessages = useCallback((limit: number) => {
    if (!token) return;
    setLoadingMessages(true);
    setErrorMessages(null);
    fetch(`${API}/settings/twilio/messages?limit=${limit}`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => { if (d.data) setMessages(d.data); else setErrorMessages(d.message || "Failed to load messages"); })
      .catch(() => setErrorMessages("Network error"))
      .finally(() => setLoadingMessages(false));
  }, [token, hdrs]);

  useEffect(() => {
    if (tab === "messages" && messages.length === 0) fetchMessages(msgLimit);
  }, [tab]); // eslint-disable-line

  // ── Derived stats ──
  const monthlyGroups = groupUsageByMonth(usage);
  const thisMonth     = monthlyGroups[0];
  const totalSpent    = monthlyGroups.reduce((s, m) => s + m.price, 0);

  const filteredMessages = messages.filter(m => {
    if (msgFilter !== "all" && m.status !== msgFilter) return false;
    if (msgSearch) {
      const q = msgSearch.toLowerCase();
      return m.to.includes(q) || m.body.toLowerCase().includes(q) || m.sid.toLowerCase().includes(q);
    }
    return true;
  });

  const approvedCount = templates.filter(t => t.whatsappStatus === "approved").length;
  const pendingCount  = templates.filter(t => t.whatsappStatus === "pending").length;
  const rejectedCount = templates.filter(t => t.whatsappStatus === "rejected").length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href="/dashboard/admin" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">←</Link>
          <div>
            <h1 className="text-2xl font-black text-white">💬 Communications</h1>
            <p className="text-white/40 text-sm">WhatsApp templates, message logs & Twilio account</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* ── Top stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Balance */}
          <div className="glass-card p-5 border border-emerald-500/20">
            <div className="text-lg mb-1">💰</div>
            {loadingBalance ? (
              <div className="w-20 h-7 bg-white/5 rounded animate-pulse mb-1" />
            ) : balance ? (
              <div className="text-2xl font-black text-emerald-400">
                ${balance.balance.toFixed(4)}
              </div>
            ) : (
              <div className="text-white/30 text-sm">—</div>
            )}
            <div className="text-white/40 text-xs mt-1">Remaining Balance ({balance?.currency || "USD"})</div>
          </div>

          {/* This month messages */}
          <div className="glass-card p-5 border border-blue-500/20">
            <div className="text-lg mb-1">📨</div>
            {loadingUsage ? (
              <div className="w-14 h-7 bg-white/5 rounded animate-pulse mb-1" />
            ) : (
              <div className="text-2xl font-black text-blue-400">{thisMonth?.count ?? 0}</div>
            )}
            <div className="text-white/40 text-xs mt-1">Messages This Month</div>
          </div>

          {/* This month cost */}
          <div className="glass-card p-5 border border-yellow-500/20">
            <div className="text-lg mb-1">💵</div>
            {loadingUsage ? (
              <div className="w-16 h-7 bg-white/5 rounded animate-pulse mb-1" />
            ) : (
              <div className="text-2xl font-black text-yellow-400">${(thisMonth?.price ?? 0).toFixed(4)}</div>
            )}
            <div className="text-white/40 text-xs mt-1">Cost This Month (USD)</div>
          </div>

          {/* Total spent */}
          <div className="glass-card p-5 border border-purple-500/20">
            <div className="text-lg mb-1">📊</div>
            {loadingUsage ? (
              <div className="w-16 h-7 bg-white/5 rounded animate-pulse mb-1" />
            ) : (
              <div className="text-2xl font-black text-purple-400">${totalSpent.toFixed(4)}</div>
            )}
            <div className="text-white/40 text-xs mt-1">Total Spent (All Time)</div>
          </div>
        </div>

        {/* ── Monthly Usage Table ── */}
        {!loadingUsage && monthlyGroups.length > 0 && (
          <div className="glass-card p-5">
            <h2 className="text-white font-bold mb-4">📅 Monthly WhatsApp Usage</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-white/40 text-xs font-semibold uppercase text-left pb-3 pr-8">Month</th>
                    <th className="text-white/40 text-xs font-semibold uppercase text-right pb-3 pr-8">Messages</th>
                    <th className="text-white/40 text-xs font-semibold uppercase text-right pb-3">Cost (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {monthlyGroups.map((m) => (
                    <tr key={m.startDate}>
                      <td className="text-white/70 py-3 pr-8">{fmtMonth(m.startDate)}</td>
                      <td className="text-white py-3 pr-8 text-right font-mono">{m.count.toLocaleString()}</td>
                      <td className="text-yellow-400 py-3 text-right font-mono">${m.price.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-1 border-b border-white/10">
          <button
            onClick={() => setTab("templates")}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${tab === "templates" ? "border-lebanon-green text-white" : "border-transparent text-white/40 hover:text-white/70"}`}
          >
            📋 Templates
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold">{templates.length}</span>
          </button>
          <button
            onClick={() => setTab("messages")}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${tab === "messages" ? "border-lebanon-green text-white" : "border-transparent text-white/40 hover:text-white/70"}`}
          >
            📜 Message History
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold">{messages.length}</span>
          </button>
        </div>

        {/* ── TEMPLATES TAB ── */}
        {tab === "templates" && (
          <div className="space-y-4">
            {/* Summary badges */}
            {!loadingTemplates && templates.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">✅ {approvedCount} Approved</span>
                <span className="px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold">⏳ {pendingCount} Pending</span>
                {rejectedCount > 0 && <span className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">❌ {rejectedCount} Rejected</span>}
              </div>
            )}

            {loadingTemplates ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="glass-card p-5 h-24 animate-pulse" />)}
              </div>
            ) : errorTemplates ? (
              <div className="glass-card p-8 text-center">
                <div className="text-3xl mb-2">⚠️</div>
                <p className="text-red-400 text-sm">{errorTemplates}</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-white/40 text-sm">No templates found on this Twilio account</p>
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {["Template Name", "Category", "Language", "Status", "Body Preview", "Last Updated"].map(h => (
                          <th key={h} className="text-white/40 text-xs font-semibold uppercase tracking-wider px-5 py-4 text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {templates.map(t => (
                        <tr key={t.sid} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-4">
                            <div className="text-white text-sm font-semibold">{t.friendlyName}</div>
                            <div className="text-white/30 text-[10px] font-mono mt-0.5">{t.sid}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-medium">
                              {t.whatsappCategory || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-white/50 text-sm uppercase">{t.language}</td>
                          <td className="px-5 py-4">
                            {templateBadge(t.whatsappStatus)}
                            {t.rejectionReason && (
                              <div className="text-red-400/70 text-[10px] mt-1 max-w-[140px]">{t.rejectionReason}</div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-white/50 text-xs max-w-[260px] line-clamp-2 leading-relaxed">
                              {t.body || <span className="text-white/20 italic">No body preview</span>}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">{fmtDate(t.dateUpdated)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGE HISTORY TAB ── */}
        {tab === "messages" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Search by phone, body or SID..."
                value={msgSearch}
                onChange={e => setMsgSearch(e.target.value)}
                className="flex-1 min-w-[220px] px-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
              />
              <select
                value={msgFilter}
                onChange={e => setMsgFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white/70 text-sm focus:outline-none focus:border-lebanon-green/50"
              >
                <option value="all">All Statuses</option>
                <option value="delivered">✅ Delivered</option>
                <option value="read">👁️ Read</option>
                <option value="sent">📤 Sent</option>
                <option value="failed">❌ Failed</option>
                <option value="undelivered">❌ Undelivered</option>
                <option value="queued">⏳ Queued</option>
              </select>
              <button
                onClick={() => fetchMessages(msgLimit)}
                disabled={loadingMessages}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm border border-white/10 transition-all disabled:opacity-50"
              >
                {loadingMessages ? "Loading…" : "🔄 Refresh"}
              </button>
            </div>

            {loadingMessages && messages.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass-card p-4 h-16 animate-pulse" />)}
              </div>
            ) : errorMessages ? (
              <div className="glass-card p-8 text-center">
                <div className="text-3xl mb-2">⚠️</div>
                <p className="text-red-400 text-sm">{errorMessages}</p>
                <button onClick={() => fetchMessages(msgLimit)} className="mt-3 px-4 py-2 rounded-xl bg-white/5 text-white/50 text-sm hover:bg-white/10">Retry</button>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-white/40 text-sm">{messages.length === 0 ? "No messages found" : "No messages match your filter"}</p>
              </div>
            ) : (
              <>
                <div className="glass-card overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                    <span className="text-white/40 text-xs">Showing {filteredMessages.length} of {messages.length} messages</span>
                    <span className="text-white/30 text-xs">Most recent first</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          {["Date & Time", "To (Phone)", "Status", "Message Preview", "Cost (USD)"].map(h => (
                            <th key={h} className="text-white/40 text-xs font-semibold uppercase tracking-wider px-5 py-4 text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredMessages.map(m => (
                          <tr key={m.sid} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-3 text-white/50 text-xs whitespace-nowrap">{fmtDate(m.dateCreated)}</td>
                            <td className="px-5 py-3">
                              <div className="text-white text-sm font-mono">{m.to || "—"}</div>
                              <div className="text-white/20 text-[10px] mt-0.5">{m.sid}</div>
                            </td>
                            <td className="px-5 py-3">
                              {statusBadge(m.status)}
                              {m.errorMessage && (
                                <div className="text-red-400/60 text-[10px] mt-1 max-w-[160px]" title={m.errorMessage}>
                                  {m.errorMessage.slice(0, 60)}{m.errorMessage.length > 60 ? "…" : ""}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              <div className="text-white/50 text-xs max-w-[300px] line-clamp-2 leading-relaxed">
                                {m.body || <span className="text-white/20 italic">Template message</span>}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-yellow-400 text-sm font-mono">
                              {m.price ? `$${Math.abs(m.price).toFixed(5)}` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Load more */}
                {messages.length >= msgLimit && (
                  <div className="text-center">
                    <button
                      onClick={() => {
                        const next = msgLimit + 50;
                        setMsgLimit(next);
                        fetchMessages(next);
                      }}
                      disabled={loadingMessages}
                      className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm border border-white/10 transition-all disabled:opacity-50"
                    >
                      {loadingMessages ? "Loading…" : `Load more (showing ${messages.length})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
