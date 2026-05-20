"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePageLog, useActivityLog } from "@/hooks/useActivityLog";
import { paymentsApi } from "@/lib/api";
import * as XLSX from "xlsx";

// ── Types ──────────────────────────────────────────────────────────────────────
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

interface ParentGroup {
  key: string;
  parentName: string;
  isUnlinked?: boolean;
  payments: PaymentRow[];
  students: { name: string; program: string }[];
  latest: PaymentRow;
  totalPaid: number;
  pendingCount: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const METHOD_STYLES: Record<string, { label: string; cls: string; icon: string }> = {
  CASH:     { label: "Cash",     cls: "bg-green-500/10 text-green-400 border-green-500/20",   icon: "💵" },
  CARD:     { label: "Card",     cls: "bg-blue-500/10 text-blue-400 border-blue-500/20",      icon: "💳" },
  TRANSFER: { label: "Transfer", cls: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: "🏦" },
};

const STATUS_STYLES: Record<string, string> = {
  PAID:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  OVERDUE: "bg-red-500/10 text-red-400 border-red-500/20",
  PARTIAL: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  FAILED:  "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

// ── Export helpers ─────────────────────────────────────────────────────────────
function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

async function exportPDF(group: ParentGroup) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Header
  doc.setFillColor(0, 166, 81);
  doc.rect(0, 0, 297, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Cedars Sport Academy — Payment History", 14, 13);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Parent: ${group.parentName}   |   Generated: ${new Date().toLocaleDateString("en-GB")}`, 14, 19);

  // Table
  autoTable(doc, {
    startY: 27,
    head: [["Student", "Program", "Amount (QAR)", "Method", "Status", "Transaction", "Date", "Paid On"]],
    body: group.payments.map(p => [
      [p.studentFirstName, p.studentLastName].filter(Boolean).join(" ") || "—",
      p.programName || "—",
      p.amount?.toLocaleString() ?? "0",
      p.method || "—",
      p.status,
      p.transactionId || "—",
      fmtDate(p.createdAt),
      fmtDate(p.paidAt),
    ]),
    headStyles: { fillColor: [0, 166, 81], textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 250, 247] },
    columnStyles: { 2: { halign: "right" }, 5: { font: "courier", fontSize: 7 } },
    margin: { left: 14, right: 14 },
  });

  // Footer totals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Collected: ${group.totalPaid.toLocaleString()} QAR`, 14, finalY);
  if (group.pendingCount > 0)
    doc.text(`Pending: ${group.pendingCount} payment(s)`, 80, finalY);

  doc.save(`payments_${group.parentName.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
}

function exportExcel(group: ParentGroup) {

  const rows = group.payments.map(p => ({
    "Parent":        group.parentName,
    "Student":       [p.studentFirstName, p.studentLastName].filter(Boolean).join(" ") || "—",
    "Student Code":  p.studentCode || "—",
    "Program":       p.programName  || "—",
    "Location":      p.locationName || "—",
    "Coach":         p.coachName    || "—",
    "Amount (QAR)":  p.amount ?? 0,
    "Currency":      p.currency || "QAR",
    "Method":        p.method   || "—",
    "Status":        p.status,
    "Transaction ID": p.transactionId || "—",
    "Created":       fmtDate(p.createdAt),
    "Paid On":       fmtDate(p.paidAt),
    "Notes":         p.notes || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  // Column widths
  ws["!cols"] = [18,22,14,20,16,18,14,10,10,10,24,14,14,30].map(w => ({ wch: w }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Payment History");
  XLSX.writeFile(wb, `payments_${group.parentName.replace(/\s+/g, "_")}_${Date.now()}.xlsx`);
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function parentInitials(name: string) {
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function recordedBy(notes: string | null | undefined) {
  const n = notes || "";
  const m = n.match(/(?:Renewal recorded by admin|Recorded by admin):\s*(.+)/i);
  const isRenewal = /renewal/i.test(n);
  if (m) return { label: m[1].trim(), isAdmin: true, isRenewal };
  return { label: "Parent Portal", isAdmin: false, isRenewal: false };
}

// ── Invoice Modal ──────────────────────────────────────────────────────────────
function InvoiceModal({ payment, onClose }: { payment: PaymentRow; onClose: () => void }) {
  const studentName = [payment.studentFirstName, payment.studentLastName].filter(Boolean).join(" ") || "—";
  const parentName  = [payment.parentFirstName,  payment.parentLastName ].filter(Boolean).join(" ") || "—";
  const dob = payment.dateOfBirth
    ? new Date(payment.dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "—";
  const paymentDate = payment.paidAt
    ? new Date(payment.paidAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : new Date(payment.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const sections = [
    { title: "Student Information", rows: [
      { label: "Student Name",   value: studentName },
      { label: "CSA Code",       value: payment.studentCode || "—" },
      { label: "Date of Birth",  value: dob },
      { label: "Parent",         value: parentName },
    ]},
    { title: "Program Details", rows: [
      { label: "Program / Sport", value: payment.programName  || "—" },
      { label: "Location",        value: payment.locationName || "—" },
      { label: "Coach",           value: payment.coachName    || "—" },
    ]},
    { title: "Payment Details", rows: [
      { label: "Date of Payment",  value: paymentDate },
      { label: "Payment Method",   value: payment.method || "—" },
      { label: "Transaction Code", value: payment.transactionId || "—", mono: true },
      { label: "Status",           value: payment.status },
    ]},
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-[#00A651] px-6 py-5 text-center">
          <div className="text-white font-black text-xl tracking-wide">Cedars Sport Academy</div>
          <div className="text-white/70 text-xs mt-0.5 tracking-widest uppercase">Payment Receipt</div>
        </div>
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider">Transaction Ref</div>
            <div className="font-mono text-sm font-semibold text-gray-700 mt-0.5">{payment.transactionId || "—"}</div>
          </div>
          <div className="text-right">
            <span className="inline-block bg-[#00A651] text-white text-xs font-bold px-3 py-1 rounded-full mb-1">{payment.status}</span>
            <div className="text-2xl font-black text-gray-800">
              {payment.amount?.toLocaleString()} <span className="text-sm font-semibold text-gray-400">{payment.currency || "QAR"}</span>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 space-y-4 max-h-[55vh] overflow-y-auto">
          {sections.map(s => (
            <div key={s.title}>
              <div className="text-[10px] font-bold text-[#00A651] uppercase tracking-widest mb-2 border-b border-[#00A651]/20 pb-1">{s.title}</div>
              <table className="w-full text-sm">
                <tbody>
                  {s.rows.map(r => (
                    <tr key={r.label} className="border-b border-gray-50 last:border-0">
                      <td className="py-1.5 text-gray-400 w-[45%]">{r.label}</td>
                      <td className={`py-1.5 font-semibold text-gray-700 ${"mono" in r && r.mono ? "font-mono text-xs" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button onClick={() => window.print()} className="flex-1 px-4 py-2 rounded-xl bg-[#00A651] text-white text-sm font-semibold hover:bg-[#00A651]/80 transition-all">🖨️ Print</button>
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300 transition-all">Close</button>
        </div>
      </div>
    </div>
  );
}

// ── History Drawer ─────────────────────────────────────────────────────────────
function HistoryDrawer({
  group, markingPaid, onMarkPaid, onInvoice, onClose,
}: {
  group: ParentGroup;
  markingPaid: string | null;
  onMarkPaid: (id: string) => void;
  onInvoice: (p: PaymentRow) => void;
  onClose: () => void;
}) {
  const [exporting, setExporting] = useState<"pdf" | "xlsx" | null>(null);

  async function handleExportPDF() {
    setExporting("pdf");
    try { await exportPDF(group); } finally { setExporting(null); }
  }
  function handleExportExcel() {
    setExporting("xlsx");
    try { exportExcel(group); } finally { setExporting(null); }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 w-full max-w-3xl bg-dark-900 border-l border-white/10 shadow-2xl flex flex-col">
        {/* Drawer header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lebanon-green/40 to-lebanon-green/10 border border-lebanon-green/20 flex items-center justify-center text-sm font-bold text-lebanon-green shrink-0">
            {parentInitials(group.parentName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-lg">{group.parentName}</div>
            <div className="text-white/40 text-xs mt-0.5">{group.payments.length} payment{group.payments.length !== 1 ? "s" : ""} · {group.students.length} student{group.students.length !== 1 ? "s" : ""}</div>
          </div>
          {/* Export buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportPDF}
              disabled={exporting !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-all disabled:opacity-50"
            >
              {exporting === "pdf" ? <span className="w-3 h-3 border border-red-400/50 border-t-red-400 rounded-full animate-spin" /> : "📄"}
              PDF
            </button>
            <button
              onClick={handleExportExcel}
              disabled={exporting !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-all disabled:opacity-50"
            >
              {exporting === "xlsx" ? <span className="w-3 h-3 border border-emerald-400/50 border-t-emerald-400 rounded-full animate-spin" /> : "📊"}
              Excel
            </button>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all shrink-0">✕</button>
        </div>

        {/* Students summary */}
        <div className="px-6 py-3 border-b border-white/5 flex flex-wrap gap-2 shrink-0">
          {group.students.map(s => (
            <div key={s.name} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
              <span className="text-white/70 font-medium">{s.name}</span>
              {s.program && s.program !== "—" && <span className="text-white/30">· {s.program}</span>}
            </div>
          ))}
        </div>

        {/* Payment history table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-dark-900 z-10">
              <tr className="border-b border-white/5">
                {["Student", "Program", "Amount", "Method", "Status", "Date", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-white/30 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {group.payments.map(p => {
                const by = recordedBy(p.notes);
                return (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <div className="text-white font-medium">{[p.studentFirstName, p.studentLastName].filter(Boolean).join(" ") || "—"}</div>
                      {p.studentCode && <div className="text-white/30 text-[10px] font-mono">{p.studentCode}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">{p.programName || "—"}</td>
                    <td className="px-4 py-3 text-sm font-bold text-white whitespace-nowrap">
                      {p.amount?.toLocaleString()} <span className="text-white/40 text-xs font-normal">{p.currency || "QAR"}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.method
                        ? <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${METHOD_STYLES[p.method]?.cls || "bg-white/10 text-white/40 border-white/10"}`}>
                            {METHOD_STYLES[p.method]?.icon} {METHOD_STYLES[p.method]?.label}
                          </span>
                        : <span className="text-white/30 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_STYLES[p.status] || ""}`}>{p.status}</span>
                      {by.isAdmin && (
                        <div className="text-[9px] text-amber-400/60 mt-0.5">🛡️ {by.isRenewal ? "Renewal" : "Admin"}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50 whitespace-nowrap">
                      <div>{new Date(p.createdAt).toLocaleDateString()}</div>
                      {p.paidAt && <div className="text-emerald-400/60 text-[10px]">Paid {new Date(p.paidAt).toLocaleDateString()}</div>}
                      {p.transactionId && <div className="text-white/20 font-mono text-[9px] mt-0.5 truncate max-w-[100px]">{p.transactionId}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => onInvoice(p)} className="px-2.5 py-1 rounded-lg bg-white/5 text-white/60 text-xs hover:bg-white/10 hover:text-white transition-all border border-white/10">📄</button>
                        {p.status === "PENDING" && (
                          <button
                            onClick={() => onMarkPaid(p.id)}
                            disabled={markingPaid === p.id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30 disabled:opacity-50 transition-all whitespace-nowrap"
                          >
                            {markingPaid === p.id ? "…" : "✅ Paid"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminPaymentsPage() {
  usePageLog("Viewed Admin Payments");
  const log = useActivityLog();
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [invoicePayment, setInvoicePayment] = useState<PaymentRow | null>(null);
  const [historyGroup, setHistoryGroup] = useState<ParentGroup | null>(null);

  const [singleChildQar, setSingleChildQar] = useState<number>(400);
  const [multiChildQar, setMultiChildQar] = useState<number>(350);
  const [savingRules, setSavingRules] = useState(false);

  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "MONTH" | "YEAR" | "CUSTOM">("ALL");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [exportingAll, setExportingAll] = useState<"pdf" | "xlsx" | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  const fetchPayments = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await paymentsApi.getAll(
        filter === "ALL" ? undefined : filter,
        undefined,
        methodFilter === "ALL" ? undefined : methodFilter,
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
      const d = res.data as { singleChildQar: number; multiChildQar: number };
      setSingleChildQar(d.singleChildQar ?? 400);
      setMultiChildQar(d.multiChildQar ?? 350);
    } catch { /* keep defaults */ }
  }, []);

  useEffect(() => {
    if (isAuthenticated && (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN")) {
      fetchPayments(); fetchRules();
    }
  }, [isAuthenticated, user, fetchPayments, fetchRules]);

  async function saveRules() {
    setSavingRules(true); setError(null);
    try { await paymentsApi.updatePricingRules({ singleChildQar, multiChildQar }); await fetchRules(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to save pricing rules"); }
    finally { setSavingRules(false); }
  }

  async function markPaid(id: string) {
    setMarkingPaid(id);
    log(`Marked payment as paid`, { entityId: id });
    try { await paymentsApi.markPaid(id); await fetchPayments(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to mark as paid"); }
    finally { setMarkingPaid(null); }
  }

  // ── Date filter ────────────────────────────────────────────────────────────
  const dateFiltered = useMemo(() => {
    if (dateFilter === "ALL") return payments;
    const now = new Date();
    return payments.filter(p => {
      const d = new Date(p.createdAt);
      if (dateFilter === "TODAY")
        return d.toDateString() === now.toDateString();
      if (dateFilter === "MONTH")
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (dateFilter === "YEAR")
        return d.getFullYear() === now.getFullYear();
      if (dateFilter === "CUSTOM") {
        const from = customFrom ? new Date(customFrom) : null;
        const to   = customTo   ? new Date(customTo + "T23:59:59") : null;
        if (from && d < from) return false;
        if (to   && d > to)   return false;
        return true;
      }
      return true;
    });
  }, [payments, dateFilter, customFrom, customTo]);

  // ── Page-level exports ─────────────────────────────────────────────────────
  async function exportAllPDF(visibleGroups: ParentGroup[]) {
    setExportingAll("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      const periodLabel =
        dateFilter === "TODAY"  ? "Today" :
        dateFilter === "MONTH"  ? "This Month" :
        dateFilter === "YEAR"   ? "This Year" :
        dateFilter === "CUSTOM" ? `${customFrom || "—"} to ${customTo || "—"}` :
        "All Time";

      const allPayments = visibleGroups.flatMap(g =>
        g.payments.map(p => ({ ...p, _parentName: g.isUnlinked ? "—" : g.parentName }))
      );

      doc.setFillColor(0, 166, 81);
      doc.rect(0, 0, 297, 22, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14); doc.setFont("helvetica", "bold");
      doc.text("Cedars Sport Academy — Payment Report", 14, 13);
      doc.setFontSize(9); doc.setFont("helvetica", "normal");
      doc.text(`Period: ${periodLabel}   |   Generated: ${new Date().toLocaleDateString("en-GB")}   |   ${allPayments.length} record(s)`, 14, 19);

      autoTable(doc, {
        startY: 27,
        head: [["Parent", "Student", "Program", "Amount (QAR)", "Method", "Status", "Transaction", "Date", "Paid On"]],
        body: allPayments.map(p => [
          p._parentName,
          [p.studentFirstName, p.studentLastName].filter(Boolean).join(" ") || "—",
          p.programName || "—",
          p.amount?.toLocaleString() ?? "0",
          p.method || "—",
          p.status,
          p.transactionId || "—",
          fmtDate(p.createdAt),
          fmtDate(p.paidAt),
        ]),
        headStyles: { fillColor: [0, 166, 81], textColor: 255, fontStyle: "bold", fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        alternateRowStyles: { fillColor: [245, 250, 247] },
        columnStyles: { 3: { halign: "right" }, 6: { font: "courier", fontSize: 6.5 } },
        margin: { left: 14, right: 14 },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 6;
      const totalCollected = allPayments.filter(p => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
      doc.setFontSize(9); doc.setTextColor(50, 50, 50); doc.setFont("helvetica", "bold");
      doc.text(`Total Collected: ${totalCollected.toLocaleString()} QAR   |   Records: ${allPayments.length}`, 14, finalY);

      doc.save(`payments_report_${Date.now()}.pdf`);
    } finally { setExportingAll(null); }
  }

  function exportAllExcel(visibleGroups: ParentGroup[]) {
    setExportingAll("xlsx");
    try {
      const rows = visibleGroups.flatMap(g =>
        g.payments.map(p => ({
          "Parent":         g.isUnlinked ? "—" : g.parentName,
          "Student":        [p.studentFirstName, p.studentLastName].filter(Boolean).join(" ") || "—",
          "Student Code":   p.studentCode  || "—",
          "Program":        p.programName  || "—",
          "Location":       p.locationName || "—",
          "Coach":          p.coachName    || "—",
          "Amount (QAR)":   p.amount ?? 0,
          "Currency":       p.currency || "QAR",
          "Method":         p.method   || "—",
          "Status":         p.status,
          "Transaction ID": p.transactionId || "—",
          "Created":        fmtDate(p.createdAt),
          "Paid On":        fmtDate(p.paidAt),
          "Notes":          p.notes || "",
        }))
      );
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [18,22,14,20,16,18,14,10,10,10,24,14,14,30].map(w => ({ wch: w }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Payments");
      XLSX.writeFile(wb, `payments_report_${Date.now()}.xlsx`);
    } finally { setExportingAll(null); }
  }

  // ── Group payments by parent ───────────────────────────────────────────────
  const groups = useMemo(() => {
    const parentMap = new Map<string, PaymentRow[]>();

    for (const p of dateFiltered) {
      const parentName = [p.parentFirstName, p.parentLastName].filter(Boolean).join(" ").trim();
      const key = parentName
        ? parentName
        : `__unlinked__${[p.studentFirstName, p.studentLastName].filter(Boolean).join(" ").trim() || p.id}`;
      if (!parentMap.has(key)) parentMap.set(key, []);
      parentMap.get(key)!.push(p);
    }

    const result: ParentGroup[] = [];
    for (const [key, rows] of parentMap) {
      const isUnlinked = key.startsWith("__unlinked__");
      const sorted = [...rows].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const studentMap = new Map<string, string>();
      for (const p of rows) {
        const sName = [p.studentFirstName, p.studentLastName].filter(Boolean).join(" ").trim();
        if (sName && !studentMap.has(sName)) studentMap.set(sName, p.programName || "—");
      }
      const displayName = isUnlinked
        ? ([rows[0].studentFirstName, rows[0].studentLastName].filter(Boolean).join(" ").trim() || "Unknown Student")
        : key;
      result.push({
        key,
        parentName: displayName,
        isUnlinked,
        payments: sorted,
        students: Array.from(studentMap.entries()).map(([name, program]) => ({ name, program })),
        latest: sorted[0],
        totalPaid: rows.filter(p => p.status === "PAID").reduce((s, p) => s + p.amount, 0),
        pendingCount: rows.filter(p => p.status === "PENDING").length,
      });
    }

    result.sort((a, b) => {
      if (a.pendingCount > 0 && b.pendingCount === 0) return -1;
      if (b.pendingCount > 0 && a.pendingCount === 0) return 1;
      return new Date(b.latest.createdAt).getTime() - new Date(a.latest.createdAt).getTime();
    });

    return result;
  }, [dateFiltered]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(g =>
      g.parentName.toLowerCase().includes(q) ||
      g.students.some(s => s.name.toLowerCase().includes(q) || s.program.toLowerCase().includes(q))
    );
  }, [groups, search]);

  // Stats — reflect current date filter
  const totalRevenue = dateFiltered.filter(p => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const totalPending = dateFiltered.filter(p => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);
  const totalFailed  = dateFiltered.filter(p => p.status === "FAILED").reduce((s, p) => s + p.amount, 0);
  const cashCount    = dateFiltered.filter(p => p.method === "CASH").length;
  const cardCount    = dateFiltered.filter(p => p.method === "CARD").length;
  const pendingCash  = dateFiltered.filter(p => p.status === "PENDING" && p.method === "CASH").length;

  if (isLoading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      {invoicePayment && <InvoiceModal payment={invoicePayment} onClose={() => setInvoicePayment(null)} />}
      {historyGroup && (
        <HistoryDrawer
          group={historyGroup}
          markingPaid={markingPaid}
          onMarkPaid={async (id) => { await markPaid(id); setHistoryGroup(g => g ? { ...g, payments: g.payments.map(p => p.id === id ? { ...p, status: "PAID" } : p) } : null); }}
          onInvoice={(p) => setInvoicePayment(p)}
          onClose={() => setHistoryGroup(null)}
        />
      )}

      {/* Page header */}
      <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">←</Link>
            <div>
              <h1 className="text-2xl font-black text-white">💳 Payments</h1>
              <p className="text-white/40 text-sm">{groups.length} parent{groups.length !== 1 ? "s" : ""} · {payments.length} payment{payments.length !== 1 ? "s" : ""}</p>
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
              <input type="number" min={1} value={singleChildQar} onChange={e => setSingleChildQar(Number(e.target.value))}
                className="mt-1 w-full bg-dark-800 border border-white/10 rounded-xl px-3 py-2 text-white" />
            </label>
            <label className="text-sm text-white/70">
              2+ children rate (QAR)
              <input type="number" min={1} value={multiChildQar} onChange={e => setMultiChildQar(Number(e.target.value))}
                className="mt-1 w-full bg-dark-800 border border-white/10 rounded-xl px-3 py-2 text-white" />
            </label>
            <div className="flex items-end">
              <button onClick={saveRules} disabled={savingRules}
                className="w-full px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 disabled:opacity-60">
                {savingRules ? "Saving..." : "Save Rules"}
              </button>
            </div>
          </div>
        </div>

        {/* Summary cards */}
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
            <div className="text-white/40 text-xs mt-1">💵 Cash</div>
            {pendingCash > 0 && <div className="text-amber-400 text-xs mt-1 font-semibold">⚠ {pendingCash} awaiting</div>}
          </div>
          <div className="glass-card p-5 border-blue-500/20">
            <div className="text-blue-400 text-2xl font-black">{cardCount}</div>
            <div className="text-white/40 text-xs mt-1">💳 Card</div>
          </div>
        </div>

        {/* Filters + search */}
        <div className="glass-card p-4 space-y-3">
          {/* Row 1: search + status + method + refresh */}
          <div className="flex flex-wrap gap-3 items-center">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parent or student…"
              className="px-4 py-2 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm w-56" />
            <div className="h-6 w-px bg-white/10" />
            <div className="flex gap-2 flex-wrap">
              {["ALL", "PAID", "PENDING", "OVERDUE", "PARTIAL", "FAILED"].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === s ? "bg-lebanon-green text-white" : "bg-dark-800 text-white/50 hover:text-white border border-white/10"}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex gap-2 flex-wrap">
              {["ALL", "CASH", "CARD", "TRANSFER"].map(m => (
                <button key={m} onClick={() => setMethodFilter(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${methodFilter === m ? "bg-blue-500 text-white" : "bg-dark-800 text-white/50 hover:text-white border border-white/10"}`}>
                  {m === "ALL" ? "ALL" : `${METHOD_STYLES[m]?.icon} ${m}`}
                </button>
              ))}
            </div>
            <button onClick={fetchPayments} className="ml-auto px-3 py-1.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-xs transition-all">
              🔄 Refresh
            </button>
          </div>

          {/* Row 2: date filter + custom range + export */}
          <div className="flex flex-wrap gap-3 items-center border-t border-white/5 pt-3">
            <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">📅 Period:</span>
            <div className="flex gap-2 flex-wrap">
              {([
                { key: "ALL",    label: "All Time" },
                { key: "TODAY",  label: "Today" },
                { key: "MONTH",  label: "This Month" },
                { key: "YEAR",   label: "This Year" },
                { key: "CUSTOM", label: "Custom" },
              ] as const).map(({ key, label }) => (
                <button key={key} onClick={() => setDateFilter(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${dateFilter === key ? "bg-violet-500 text-white" : "bg-dark-800 text-white/50 hover:text-white border border-white/10"}`}>
                  {label}
                </button>
              ))}
            </div>
            {dateFilter === "CUSTOM" && (
              <div className="flex items-center gap-2">
                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-dark-800 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500/50" />
                <span className="text-white/30 text-xs">→</span>
                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-dark-800 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500/50" />
              </div>
            )}
            {/* Page-level export */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-white/20 text-xs">{dateFiltered.length} record{dateFiltered.length !== 1 ? "s" : ""}</span>
              <button
                onClick={() => exportAllPDF(filtered)}
                disabled={exportingAll !== null || filtered.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-all disabled:opacity-40"
              >
                {exportingAll === "pdf" ? <span className="w-3 h-3 border border-red-400/50 border-t-red-400 rounded-full animate-spin" /> : "📄"} PDF
              </button>
              <button
                onClick={() => exportAllExcel(filtered)}
                disabled={exportingAll !== null || filtered.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-all disabled:opacity-40"
              >
                {exportingAll === "xlsx" ? <span className="w-3 h-3 border border-emerald-400/50 border-t-emerald-400 rounded-full animate-spin" /> : "📊"} Excel
              </button>
            </div>
          </div>
        </div>

        {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        {/* Grouped table */}
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="glass-card p-4 animate-pulse h-16" />)}</div>
        ) : filtered.length === 0 ? (
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
                    {["Parent / Student", "Students", "Latest Payment", "Total Paid", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-white/30 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(g => (
                    <tr key={g.key} className="hover:bg-white/2 transition-colors group">

                      {/* Parent / unlinked student */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border ${
                            g.isUnlinked
                              ? "bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400"
                              : "bg-gradient-to-br from-lebanon-green/40 to-lebanon-green/10 border-lebanon-green/20 text-lebanon-green"
                          }`}>
                            {parentInitials(g.parentName)}
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">{g.parentName}</div>
                            {g.isUnlinked
                              ? <div className="text-amber-400/60 text-[10px] font-medium">No parent linked</div>
                              : <div className="text-white/30 text-xs">{g.payments.length} payment{g.payments.length !== 1 ? "s" : ""}</div>
                            }
                          </div>
                        </div>
                      </td>

                      {/* Students */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          {g.students.map(s => (
                            <div key={s.name} className="text-xs">
                              <span className="text-white/80 font-medium">{s.name}</span>
                              {s.program && s.program !== "—" && <span className="text-white/30 ml-1">· {s.program}</span>}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Latest payment */}
                      <td className="px-5 py-4">
                        <div className="text-white font-bold text-sm">
                          {g.latest.amount?.toLocaleString()} <span className="text-white/40 text-xs font-normal">{g.latest.currency || "QAR"}</span>
                        </div>
                        <div className="text-white/30 text-xs mt-0.5">
                          {new Date(g.latest.createdAt).toLocaleDateString()}
                        </div>
                        {g.latest.method && (
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border mt-1 ${METHOD_STYLES[g.latest.method]?.cls || ""}`}>
                            {METHOD_STYLES[g.latest.method]?.icon} {METHOD_STYLES[g.latest.method]?.label}
                          </span>
                        )}
                      </td>

                      {/* Total paid */}
                      <td className="px-5 py-4">
                        <div className="text-emerald-400 font-bold text-sm">{g.totalPaid.toLocaleString()} QAR</div>
                        {g.pendingCount > 0 && (
                          <div className="text-yellow-400 text-xs mt-0.5">⏳ {g.pendingCount} pending</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs border ${STATUS_STYLES[g.latest.status] || ""}`}>
                          {g.latest.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setHistoryGroup(g); log(`Opened payment history — ${g.parentName}`); }}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-all border border-white/5"
                          >
                            📋 History
                          </button>
                          {g.pendingCount > 0 && (
                            <button
                              onClick={() => { setHistoryGroup(g); log(`Opened confirm payment — ${g.parentName}`); }}
                              className="px-3 py-1.5 rounded-lg bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-400 text-xs font-semibold transition-all border border-yellow-500/20"
                            >
                              ✅ Confirm
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
