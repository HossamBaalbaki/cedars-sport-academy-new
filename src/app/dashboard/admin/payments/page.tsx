"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { paymentsApi } from "@/lib/api";

interface PaymentRow {
  id: string;
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE" | "PARTIAL" | "FAILED";
  method?: "CASH" | "CARD" | "TRANSFER" | null;
  paidAt?: string | null;
  createdAt: string;
  transactionId?: string | null;
  gateway?: string | null;
  currency?: string | null;
  notes?: string | null;
  studentFirstName?: string | null;
  studentLastName?: string | null;
  studentCode?: string | null;
  dateOfBirth?: string | null;
  programName?: string | null;
  locationName?: string | null;
  coachName?: string | null;
  parentFirstName?: string | null;
  parentLastName?: string | null;
}

const METHOD_STYLES: Record<string, { label: string; cls: string; icon: string }> = {
  CASH: { label: "Cash", cls: "bg-green-500/10 text-green-400 border-green-500/20", icon: "💵" },
  CARD: { label: "Card", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: "💳" },
  TRANSFER: { label: "Transfer", cls: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: "🏦" },
};

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  OVERDUE: "bg-red-500/10 text-red-400 border-red-500/20",
  PARTIAL: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  FAILED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

function InvoiceModal({ payment, onClose }: { payment: PaymentRow; onClose: () => void }) {
  const studentName = [payment.studentFirstName, payment.studentLastName].filter(Boolean).join(" ") || "—";
  const parentName = [payment.parentFirstName, payment.parentLastName].filter(Boolean).join(" ") || "—";
  const dob = payment.dateOfBirth
    ? new Date(payment.dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "—";
  const paymentDate = payment.paidAt
    ? new Date(payment.paidAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : new Date(payment.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const rows = [
    { section: "Student Information", items: [
      { label: "Student Name", value: studentName },
      { label: "CSA Code", value: payment.studentCode || "—" },
      { label: "Date of Birth", value: dob },
      { label: "Parent", value: parentName },
    ]},
    { section: "Program Details", items: [
      { label: "Program / Sport", value: payment.programName || "—" },
      { label: "Location", value: payment.locationName || "—" },
      { label: "Coach", value: payment.coachName || "—" },
    ]},
    { section: "Payment Details", items: [
      { label: "Date of Payment", value: paymentDate },
      { label: "Payment Method", value: payment.method || "—" },
      { label: "Transaction Code", value: payment.transactionId || "—", mono: true },
      { label: "Status", value: payment.status },
    ]},
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#00A651] px-6 py-5 text-center">
          <div className="text-white font-black text-xl tracking-wide">Cedars Sport Academy</div>
          <div className="text-white/70 text-xs mt-0.5 tracking-widest uppercase">Payment Receipt</div>
        </div>

        {/* Ref + Amount */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider">Transaction Ref</div>
            <div className="font-mono text-sm font-semibold text-gray-700 mt-0.5">{payment.transactionId || "—"}</div>
          </div>
          <div className="text-right">
            <span className="inline-block bg-[#00A651] text-white text-xs font-bold px-3 py-1 rounded-full mb-1">{payment.status}</span>
            <div className="text-2xl font-black text-gray-800">{payment.amount?.toLocaleString()} <span className="text-sm font-semibold text-gray-400">{payment.currency || "QAR"}</span></div>
          </div>
        </div>

        {/* Detail sections */}
        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {rows.map((section) => (
            <div key={section.section}>
              <div className="text-[10px] font-bold text-[#00A651] uppercase tracking-widest mb-2 border-b border-[#00A651]/20 pb-1">{section.section}</div>
              <table className="w-full text-sm">
                <tbody>
                  {section.items.map((item) => (
                    <tr key={item.label} className="border-b border-gray-50 last:border-0">
                      <td className="py-1.5 text-gray-400 w-[45%]">{item.label}</td>
                      <td className={`py-1.5 font-semibold text-gray-700 ${(item as any).mono ? "font-mono text-xs" : ""}`}>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 px-4 py-2 rounded-xl bg-[#00A651] text-white text-sm font-semibold hover:bg-[#00A651]/80 transition-all"
          >
            🖨️ Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPaymentsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [invoicePayment, setInvoicePayment] = useState<PaymentRow | null>(null);

  const [singleChildQar, setSingleChildQar] = useState<number>(400);
  const [multiChildQar, setMultiChildQar] = useState<number>(350);
  const [savingRules, setSavingRules] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentsApi.getAll(
        filter === "ALL" ? undefined : filter,
        undefined,
        methodFilter === "ALL" ? undefined : methodFilter
      );
      setPayments((res.data as PaymentRow[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [filter, methodFilter]);

  const fetchRules = useCallback(async () => {
    try {
      const res = await paymentsApi.getPricingRules();
      const data = res.data as { singleChildQar: number; multiChildQar: number };
      setSingleChildQar(data.singleChildQar ?? 400);
      setMultiChildQar(data.multiChildQar ?? 350);
    } catch {
      // keep defaults
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN")) {
      fetchPayments();
      fetchRules();
    }
  }, [isAuthenticated, user, fetchPayments, fetchRules]);

  async function saveRules() {
    setSavingRules(true);
    setError(null);
    try {
      await paymentsApi.updatePricingRules({ singleChildQar, multiChildQar });
      await fetchRules();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save pricing rules");
    } finally {
      setSavingRules(false);
    }
  }

  async function markPaid(id: string) {
    setMarkingPaid(id);
    try {
      await paymentsApi.markPaid(id);
      await fetchPayments();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark as paid");
    } finally {
      setMarkingPaid(null);
    }
  }

  const totalRevenue = payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0);
  const totalFailed = payments.filter((p) => p.status === "FAILED").reduce((sum, p) => sum + p.amount, 0);
  const cashCount = payments.filter((p) => p.method === "CASH").length;
  const cardCount = payments.filter((p) => p.method === "CARD").length;
  const pendingCash = payments.filter((p) => p.status === "PENDING" && p.method === "CASH").length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      {invoicePayment && (
        <InvoiceModal payment={invoicePayment} onClose={() => setInvoicePayment(null)} />
      )}

      <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">💳 Payments</h1>
              <p className="text-white/40 text-sm">{payments.length} records</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Pricing Rules */}
        <div className="glass-card p-5">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">Pricing Rules (QAR)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-sm text-white/70">
              1 child rate (QAR)
              <input
                type="number"
                min={1}
                value={singleChildQar}
                onChange={(e) => setSingleChildQar(Number(e.target.value))}
                className="mt-1 w-full bg-dark-800 border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm text-white/70">
              2+ children rate (QAR)
              <input
                type="number"
                min={1}
                value={multiChildQar}
                onChange={(e) => setMultiChildQar(Number(e.target.value))}
                className="mt-1 w-full bg-dark-800 border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </label>
            <div className="flex items-end">
              <button
                onClick={saveRules}
                disabled={savingRules}
                className="w-full px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 disabled:opacity-60"
              >
                {savingRules ? "Saving..." : "Save Rules"}
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-card p-5 border-emerald-500/20">
            <div className="text-emerald-400 text-2xl font-black">{totalRevenue.toLocaleString()} <span className="text-sm font-semibold">QAR</span></div>
            <div className="text-white/40 text-xs mt-1">💰 Collected</div>
          </div>
          <div className="glass-card p-5 border-yellow-500/20">
            <div className="text-yellow-400 text-2xl font-black">{totalPending.toLocaleString()} <span className="text-sm font-semibold">QAR</span></div>
            <div className="text-white/40 text-xs mt-1">⏳ Pending</div>
          </div>
          <div className="glass-card p-5 border-rose-500/20">
            <div className="text-rose-400 text-2xl font-black">{totalFailed.toLocaleString()} <span className="text-sm font-semibold">QAR</span></div>
            <div className="text-white/40 text-xs mt-1">❌ Failed</div>
          </div>
          <div className="glass-card p-5 border-green-500/20">
            <div className="text-green-400 text-2xl font-black">{cashCount}</div>
            <div className="text-white/40 text-xs mt-1">💵 Cash Payments</div>
            {pendingCash > 0 && (
              <div className="text-amber-400 text-xs mt-1 font-semibold">⚠ {pendingCash} awaiting confirmation</div>
            )}
          </div>
          <div className="glass-card p-5 border-blue-500/20">
            <div className="text-blue-400 text-2xl font-black">{cardCount}</div>
            <div className="text-white/40 text-xs mt-1">💳 Card Payments</div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="space-y-3">
          <div>
            <div className="text-white/30 text-xs uppercase tracking-wider mb-2">Filter by Status</div>
            <div className="flex gap-2 flex-wrap">
              {["ALL", "PAID", "PENDING", "OVERDUE", "PARTIAL", "FAILED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === s
                      ? "bg-lebanon-green text-white"
                      : "bg-dark-800 text-white/50 hover:text-white border border-white/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-white/30 text-xs uppercase tracking-wider mb-2">Filter by Method</div>
            <div className="flex gap-2 flex-wrap">
              {["ALL", "CASH", "CARD", "TRANSFER"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    methodFilter === m
                      ? "bg-blue-500 text-white"
                      : "bg-dark-800 text-white/50 hover:text-white border border-white/10"
                  }`}
                >
                  {m === "ALL" ? "ALL" : `${METHOD_STYLES[m]?.icon || ""} ${m}`}
                </button>
              ))}
              <button
                onClick={fetchPayments}
                className="ml-auto px-4 py-2 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/30 text-sm"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-white/40">No payments found</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-white/40 text-xs uppercase">Parent</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs uppercase">Student</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs uppercase">Program</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs uppercase">Amount</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs uppercase">Method</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs uppercase">Recorded by</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 text-sm text-white/80">
                        {p.parentFirstName || p.parentLastName
                          ? `${p.parentFirstName ?? ""} ${p.parentLastName ?? ""}`.trim()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {p.studentFirstName || p.studentLastName
                          ? `${p.studentFirstName ?? ""} ${p.studentLastName ?? ""}`.trim()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-white/60">{p.programName || "—"}</td>
                      <td className="px-4 py-3 text-sm text-white font-bold">{p.amount?.toLocaleString() ?? 0} <span className="text-white/40 text-xs font-normal">{p.currency || "QAR"}</span></td>
                      <td className="px-4 py-3">
                        {p.method ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${METHOD_STYLES[p.method]?.cls || "bg-white/10 text-white/40 border-white/10"}`}>
                            {METHOD_STYLES[p.method]?.icon || "?"} {METHOD_STYLES[p.method]?.label || p.method}
                          </span>
                        ) : (
                          <span className="text-white/30 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs border ${STATUS_STYLES[p.status] || ""}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {(() => {
                          const notes = p.notes || "";
                          const adminMatch = notes.match(/(?:Renewal recorded by admin|Recorded by admin):\s*(.+)/i);
                          const isRenewal = /renewal/i.test(notes);
                          if (adminMatch) {
                            return (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                                  🛡️ {adminMatch[1].trim()}
                                </span>
                                {isRenewal && <div className="text-white/30 text-[10px] mt-0.5 pl-0.5">Renewal</div>}
                              </div>
                            );
                          }
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                              👤 Parent Portal
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/50">
                        <div>{new Date(p.createdAt).toLocaleDateString()}</div>
                        {p.paidAt && (
                          <div className="text-emerald-400/60 text-[10px]">Paid {new Date(p.paidAt).toLocaleDateString()}</div>
                        )}
                        {p.transactionId && (
                          <div className="text-white/25 font-mono text-[9px] mt-0.5">{p.transactionId}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setInvoicePayment(p)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-medium hover:bg-white/10 hover:text-white transition-all border border-white/10"
                            title="View Invoice"
                          >
                            📄 Invoice
                          </button>
                          {p.status === "PENDING" && (
                            <button
                              onClick={() => markPaid(p.id)}
                              disabled={markingPaid === p.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30 disabled:opacity-50 transition-all"
                            >
                              {markingPaid === p.id ? "..." : "✅ Mark Paid"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
