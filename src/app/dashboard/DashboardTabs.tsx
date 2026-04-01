"use client";

import { useEffect, useMemo, useState } from "react";
import { paymentsApi } from "@/lib/api";

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface Schedule {
  id: string;
  dayOfWeek: number; // 0=Sun … 6=Sat
  startTime: string;
  endTime: string;
  location?: { name: string };
  programName?: string;
}

export interface Enrollment {
  id: string;
  isActive: boolean;
  sessionsRemaining?: number;
  program: {
    id: string;
    name: string;
    sport?: string;
    ageGroup?: { name: string };
    coach?: { user?: { firstName: string; lastName: string } };
    schedules?: Schedule[];
  };
}

export interface AttendanceRecord {
  id: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  date: string;
  notes?: string;
  performanceRating?: number | null;
  isInjured?: boolean;
  injuryNote?: string | null;
  className?: string | null;
  schedule?: { program?: { name: string } };
  coach?: { user?: { firstName: string; lastName: string } };
}

export interface PaymentRecord {
  id: string;
  status: "PENDING" | "PAID" | "OVERDUE" | "PARTIAL" | "FAILED";
  amount: number;
  transactionId?: string | null;
  programName?: string | null;
  studentFirstName?: string | null;
  studentLastName?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

interface PaymentTabProps {
  childId: string;
  childName: string;
  enrollments: Enrollment[];
  onPaymentSuccess?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function statusCls(s: string) {
  if (s === "PRESENT") return "bg-emerald-500/20 text-emerald-400";
  if (s === "ABSENT") return "bg-red-500/20 text-red-400";
  if (s === "LATE") return "bg-yellow-500/20 text-yellow-400";
  if (s === "EXCUSED") return "bg-blue-500/20 text-blue-400";
  return "bg-white/10 text-white/40";
}

function sportIcon(sport?: string) {
  if (!sport) return "🏅";
  const s = sport.toLowerCase();
  if (s.includes("football") || s.includes("soccer")) return "⚽";
  if (s.includes("basketball")) return "🏀";
  if (s.includes("swim")) return "🏊";
  if (s.includes("tennis")) return "🎾";
  if (s.includes("gym") || s.includes("fitness")) return "💪";
  if (s.includes("martial") || s.includes("karate")) return "🥋";
  if (s.includes("volleyball")) return "🏐";
  return "🏅";
}

function getQuarterRange(now = new Date()) {
  const year = now.getFullYear();
  const quarter = Math.floor(now.getMonth() / 3);
  const start = new Date(year, quarter * 3, 1, 0, 0, 0, 0);
  const end = new Date(year, quarter * 3 + 3, 0, 23, 59, 59, 999);
  return { start, end };
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

export function OverviewTab({
  enrollments,
  medicalNotes,
  medicalCardNumber,
  onEnroll,
  onUnenroll,
}: {
  enrollments: Enrollment[];
  medicalNotes?: string;
  medicalCardNumber?: string;
  childId: string;
  onEnroll: () => void;
  onUnenroll: (enrollmentId: string, programName: string) => void;
}) {
  const active = enrollments.filter((e) => e.isActive);

  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">Active Enrollments</h3>
        {active.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-white/30 text-sm mb-3">No active enrollments.</p>
            <button
              onClick={onEnroll}
              className="px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 transition-all"
            >
              + Enroll in a Program
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((enr) => {
              const coachUser = enr.program.coach?.user;
              const coachName = coachUser
                ? `${coachUser.firstName ?? ""} ${coachUser.lastName ?? ""}`.trim()
                : null;
              const sessLeft = enr.sessionsRemaining ?? null;
              const isExpired = sessLeft !== null && sessLeft <= 0;

              return (
                <div
                  key={enr.id}
                  className={
                    "flex items-center justify-between p-3 rounded-xl border transition-all " +
                    (isExpired
                      ? "bg-red-500/5 border-red-500/20"
                      : "bg-white/3 border-white/5 hover:border-white/10")
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sportIcon(enr.program.sport)}</span>
                    <div>
                      <div className="text-white font-semibold text-sm">{enr.program.name}</div>
                      {enr.program.ageGroup && (
                        <div className="text-white/40 text-xs">{enr.program.ageGroup.name}</div>
                      )}
                      {coachName && (
                        <div className="text-white/40 text-xs">{"👨‍🏫"} {coachName}</div>
                      )}
                      {sessLeft !== null && (
                        <div className="mt-1">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
                              🔴 Expired — payment required
                            </span>
                          ) : sessLeft === 1 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold">
                              🟠 1 session left
                            </span>
                          ) : sessLeft === 2 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                              🟡 2 sessions left
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/70 text-xs">
                              ✅ {sessLeft} sessions left
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onUnenroll(enr.id, enr.program.name)}
                    className="px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all flex-shrink-0"
                  >
                    Unenroll
                  </button>
                </div>
              );
            })}
            <button
              onClick={onEnroll}
              className="w-full py-2 rounded-xl border border-dashed border-white/10 text-white/40 text-sm hover:border-lebanon-green/30 hover:text-lebanon-green/60 transition-all"
            >
              + Enroll in Another Program
            </button>
          </div>
        )}
      </div>

      {(medicalNotes || medicalCardNumber) && (
        <div className="glass-card p-5">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Medical Info</h3>
          <div className="space-y-2">
            {medicalCardNumber && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/40">{"🪪"} Card #:</span>
                <span className="text-white/70 font-mono">{medicalCardNumber}</span>
              </div>
            )}
            {medicalNotes && (
              <div className="text-white/60 text-sm">{medicalNotes}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Schedule Tab ─────────────────────────────────────────────────────────────

export function ScheduleTab({ enrollments }: { enrollments: Enrollment[] }) {
  const schedules = enrollments
    .filter((e) => e.isActive)
    .flatMap((e) =>
      (e.program.schedules ?? []).map((s) => ({
        ...s,
        programName: e.program.name,
      }))
    )
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div className="glass-card p-5">
      <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">Weekly Schedule</h3>
      {schedules.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/30 text-sm">No scheduled sessions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-lebanon-green/10 border border-lebanon-green/20 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-lebanon-green font-bold text-sm">
                    {DAY_NAMES[s.dayOfWeek] ?? String(s.dayOfWeek)}
                  </span>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{s.programName}</div>
                  {s.location && (
                    <div className="text-white/40 text-xs">{"📍"} {s.location.name}</div>
                  )}
                </div>
              </div>
              <div className="text-white/60 text-sm font-mono flex-shrink-0">
                {s.startTime} {"\u2013"} {s.endTime}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Subscription Status Helpers ──────────────────────────────────────────────

function subscriptionStatusBadge(status: string) {
  if (status === "active")
    return { label: "Active", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20", icon: "✅" };
  if (status === "paid")
    return { label: "Paid", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20", icon: "✅" };
  if (status === "pending_confirmation")
    return { label: "Awaiting Confirmation", cls: "bg-orange-500/20 text-orange-400 border-orange-500/20", icon: "⏳" };
  if (status === "pending_payment")
    return { label: "Pending Payment", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20", icon: "💳" };
  if (status === "resubscribe")
    return { label: "Resubscribe", cls: "bg-red-500/20 text-red-400 border-red-500/20", icon: "🔄" };
  return { label: status, cls: "bg-white/10 text-white/40 border-white/10", icon: "❓" };
}

// ─── Subscription Child Type ──────────────────────────────────────────────────

interface SubscriptionChild {
  studentId: string;
  firstName: string;
  lastName: string;
  enrollments: Array<{
    enrollmentId: string;
    programId: string;
    programName: string;
    totalSessions: number;
    sessionsRemaining: number;
  }>;
  latestPayment: {
    paymentId: string;
    status: string;
    method: string;
    amount: number;
    paidAt: string | null;
    createdAt: string;
  } | null;
  subscriptionStatus: string;
}

interface SubscriptionPricing {
  activeChildrenCount: number;
  singleChildRate: number;
  multiChildRate: number;
  pricePerChild: number;
  totalAmount: number;
  currency: string;
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────

export function PaymentTab({ childId, childName, enrollments, onPaymentSuccess }: PaymentTabProps) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionChild[]>([]);
  const [pricing, setPricing] = useState<SubscriptionPricing | null>(null);
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null); // studentId being paid, or "all"
  const [selectedMethod, setSelectedMethod] = useState<"CASH" | "CARD">("CARD");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setErr(null);
    try {
      const [subsRes, histRes] = await Promise.all([
        paymentsApi.getMySubscriptions(),
        paymentsApi.getMyPayments(),
      ]);
      const subsData = subsRes.data as { children: SubscriptionChild[]; pricing: SubscriptionPricing };
      setSubscriptions(subsData?.children ?? []);
      setPricing(subsData?.pricing ?? null);
      setHistory((histRes.data as PaymentRecord[]) || []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  async function payForChild(studentId: string) {
    setPaying(studentId);
    setErr(null);
    setOk(null);
    try {
      const res = await paymentsApi.payForChild({ studentId, method: selectedMethod });
      const data = res.data as { success: boolean; message: string; method: string };
      if (data?.success) {
        setOk(data.message || "Payment processed successfully.");
        await loadData();
        onPaymentSuccess?.();
      } else {
        setErr(data?.message || "Payment failed.");
        await loadData();
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPaying(null);
    }
  }

  async function payAll() {
    setPaying("all");
    setErr(null);
    setOk(null);
    try {
      const res = await paymentsApi.payForAllChildren({ method: selectedMethod });
      const data = res.data as { success: boolean; childrenPaid: number; totalAmount: number; method: string };
      if (data?.success) {
        setOk(`All ${data.childrenPaid} children paid successfully. Total: ${data.totalAmount} QAR`);
        await loadData();
        onPaymentSuccess?.();
      } else {
        setErr("Some payments failed. Check individual statuses.");
        await loadData();
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPaying(null);
    }
  }

  const needsPaymentChildren = subscriptions.filter(
    (c) => c.subscriptionStatus === "pending_payment" || c.subscriptionStatus === "resubscribe"
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="h-6 w-40 rounded bg-white/5 animate-pulse mb-3" />
            <div className="h-16 rounded bg-white/5 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Pricing Summary ── */}
      {pricing && (
        <div className="glass-card p-5">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">💰 Subscription Pricing</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-white/40 text-xs mb-1">Per Child</div>
              <div className="text-white font-bold text-lg">{pricing.pricePerChild} <span className="text-xs text-white/40">QAR</span></div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-white/40 text-xs mb-1">Total</div>
              <div className="text-emerald-400 font-bold text-lg">{pricing.totalAmount} <span className="text-xs text-emerald-400/60">QAR</span></div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-white/40 text-xs mb-1">Children</div>
              <div className="text-white font-bold text-lg">{pricing.activeChildrenCount}</div>
            </div>
          </div>
          {pricing.activeChildrenCount >= 2 && (
            <div className="mt-2 text-xs text-emerald-400/70">
              ✨ Multi-child discount applied ({pricing.multiChildRate} QAR instead of {pricing.singleChildRate} QAR per child)
            </div>
          )}
        </div>
      )}

      {/* ── Payment Method Selector ── */}
      <div className="glass-card p-5">
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">💳 Payment Method</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedMethod("CARD")}
            className={`flex-1 p-3 rounded-xl border-2 transition-all text-center ${
              selectedMethod === "CARD"
                ? "border-blue-500 bg-blue-500/10 text-blue-400"
                : "border-white/10 bg-white/3 text-white/50 hover:border-white/20"
            }`}
          >
            <div className="text-2xl mb-1">💳</div>
            <div className="text-sm font-semibold">Card</div>
            <div className="text-xs opacity-60">Pay instantly</div>
          </button>
          <button
            onClick={() => setSelectedMethod("CASH")}
            className={`flex-1 p-3 rounded-xl border-2 transition-all text-center ${
              selectedMethod === "CASH"
                ? "border-green-500 bg-green-500/10 text-green-400"
                : "border-white/10 bg-white/3 text-white/50 hover:border-white/20"
            }`}
          >
            <div className="text-2xl mb-1">💵</div>
            <div className="text-sm font-semibold">Cash</div>
            <div className="text-xs opacity-60">Pay at location</div>
          </button>
        </div>
        {selectedMethod === "CASH" && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
            💡 You can attend the first class and pay at the location. Admin will be notified.
          </div>
        )}
      </div>

      {/* ── Children Subscriptions ── */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">📋 Children Subscriptions</h3>
          {needsPaymentChildren.length > 1 && (
            <button
              onClick={payAll}
              disabled={paying !== null}
              className="px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 disabled:opacity-60 transition-all"
            >
              {paying === "all" ? "Processing..." : `Pay All (${selectedMethod})`}
            </button>
          )}
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-white/40 text-sm">No active enrollments found. Enroll your children in a program first.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((child) => {
              const badge = subscriptionStatusBadge(child.subscriptionStatus);
              const isPayable = child.subscriptionStatus === "pending_payment" || child.subscriptionStatus === "resubscribe";
              const isCurrentlyPaying = paying === child.studentId;

              return (
                <div
                  key={child.studentId}
                  className="p-4 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-white font-semibold text-sm">
                        {child.firstName} {child.lastName}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${badge.cls}`}>
                          {badge.icon} {badge.label}
                        </span>
                        {child.latestPayment && (
                          <span className="text-white/30 text-xs">
                            via {child.latestPayment.method}
                          </span>
                        )}
                      </div>
                    </div>
                    {isPayable && (
                      <button
                        onClick={() => payForChild(child.studentId)}
                        disabled={paying !== null}
                        className={`px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 flex-shrink-0 ${
                          child.subscriptionStatus === "resubscribe"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-lebanon-green hover:bg-lebanon-green/80"
                        }`}
                      >
                        {isCurrentlyPaying
                          ? "Processing..."
                          : child.subscriptionStatus === "resubscribe"
                          ? `🔄 Resubscribe (${selectedMethod})`
                          : `Pay (${selectedMethod})`}
                      </button>
                    )}
                  </div>

                  {/* Enrollments / Sessions */}
                  <div className="space-y-1.5">
                    {child.enrollments.map((enr) => {
                      const pct = enr.totalSessions > 0
                        ? Math.round((enr.sessionsRemaining / enr.totalSessions) * 100)
                        : 0;
                      const barColor =
                        enr.sessionsRemaining <= 0
                          ? "bg-red-500"
                          : enr.sessionsRemaining <= 2
                          ? "bg-yellow-500"
                          : "bg-emerald-500";

                      return (
                        <div key={enr.enrollmentId} className="flex items-center gap-3 p-2 rounded-lg bg-white/3">
                          <div className="flex-1 min-w-0">
                            <div className="text-white/80 text-xs font-medium truncate">{enr.programName}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1.5 rounded-full bg-white/10">
                                <div
                                  className={`h-1.5 rounded-full ${barColor} transition-all`}
                                  style={{ width: `${Math.max(pct, 2)}%` }}
                                />
                              </div>
                              <span className="text-white/50 text-xs flex-shrink-0">
                                {enr.sessionsRemaining}/{enr.totalSessions}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Status Messages ── */}
      {ok && (
        <div className="glass-card p-4 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 text-lg">✅</span>
            <div>
              <div className="text-emerald-400 text-sm font-semibold">{ok}</div>
              {selectedMethod === "CASH" && (
                <div className="text-emerald-400/60 text-xs mt-1">
                  You can attend the first class and pay at the location.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {err && (
        <div className="glass-card p-4 border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-2">
            <span className="text-red-400 text-lg">❌</span>
            <div className="text-red-400 text-sm">{err}</div>
          </div>
        </div>
      )}

      {/* ── Payment History ── */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">📜 Payment History</h3>
          <button onClick={loadData} className="text-xs text-white/50 hover:text-white transition-colors">Refresh</button>
        </div>

        {history.length === 0 ? (
          <div className="text-white/40 text-sm text-center py-4">No payment records yet.</div>
        ) : (
          <div className="space-y-2">
            {history.map((p) => (
              <div key={p.id} className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white text-sm font-semibold">{p.amount?.toLocaleString() ?? 0} QAR</div>
                  <div className="text-white/40 text-xs truncate">
                    {p.studentFirstName ? `${p.studentFirstName} ${p.studentLastName ?? ""}`.trim() : "—"}
                    {p.programName ? ` · ${p.programName}` : ""}
                    {" · "}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-xs font-semibold ${
                    p.status === "PAID" ? "text-emerald-400" :
                    p.status === "FAILED" ? "text-rose-400" :
                    p.status === "PENDING" ? "text-yellow-400" : "text-white/60"
                  }`}>
                    {p.status}
                  </div>
                  <div className="text-white/30 text-xs">{p.transactionId || "—"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Attendance Tab ───────────────────────────────────────────────────────────

export function AttendanceTab({ records }: { records: AttendanceRecord[] }) {
  const rate = records.length
    ? Math.round(
        (records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length /
          records.length) *
          100
      )
    : 0;

  const avgRating = (() => {
    const rated = records.filter((r) => r.performanceRating != null);
    if (!rated.length) return null;
    return (rated.reduce((s, r) => s + (r.performanceRating ?? 0), 0) / rated.length).toFixed(1);
  })();

  const [showTermPerf, setShowTermPerf] = useState(false);

  const quarterStats = useMemo(() => {
    const { start, end } = getQuarterRange();
    const quarterRecords = records.filter((r) => {
      const d = new Date(r.date);
      return d >= start && d <= end;
    });

    const distinctMonths = new Set(
      quarterRecords.map((r) => {
        const d = new Date(r.date);
        return `${d.getFullYear()}-${d.getMonth()}`;
      })
    );

    const hasThreeMonths = distinctMonths.size >= 3;

    const attendanceAvg = quarterRecords.length
      ? Math.round(
          (quarterRecords.filter((r) => r.status === "PRESENT" || r.status === "LATE").length /
            quarterRecords.length) *
            100
        )
      : null;

    const byClass = new Map<string, { sum: number; count: number }>();
    for (const r of quarterRecords) {
      if (r.performanceRating == null) continue;
      const label = (r.className || "General").trim();
      const cur = byClass.get(label) || { sum: 0, count: 0 };
      cur.sum += r.performanceRating ?? 0;
      cur.count += 1;
      byClass.set(label, cur);
    }

    const classAverages = Array.from(byClass.entries())
      .map(([name, v]) => ({
        name,
        avg: v.count ? Number((v.sum / v.count).toFixed(1)) : 0,
        count: v.count,
      }))
      .sort((a, b) => b.avg - a.avg);

    return {
      quarterRecordsCount: quarterRecords.length,
      hasThreeMonths,
      attendanceAvg,
      classAverages,
    };
  }, [records]);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Attendance Records</h3>
        <div className="flex items-center gap-3">
          {avgRating !== null && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-xs">⭐</span>
              <span className="text-yellow-400 text-xs font-semibold">{avgRating}</span>
              <span className="text-white/30 text-xs">avg grade</span>
            </div>
          )}
          {records.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 rounded-full bg-white/10">
                <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: rate + "%" }} />
              </div>
              <span className="text-emerald-400 text-xs font-semibold">{rate}%</span>
            </div>
          )}
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/30 text-sm">No attendance records yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-dark-900/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-white text-sm font-semibold">Term Performance</h4>
                <p className="text-white/40 text-xs">Current quarter · auto-generated after 3 months of records</p>
              </div>
              <button
                onClick={() => setShowTermPerf((v) => !v)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs border border-white/10"
              >
                {showTermPerf ? "Hide" : "View"}
              </button>
            </div>

            {showTermPerf && (
              <div className="mt-3">
                {!quarterStats.hasThreeMonths ? (
                  <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                    Quarter performance will appear after 3 distinct months of attendance records.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <div className="text-emerald-400 text-xs">Attendance Average</div>
                        <div className="text-white font-bold">{quarterStats.attendanceAvg ?? 0}%</div>
                      </div>
                      <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="text-blue-400 text-xs">Sessions in Quarter</div>
                        <div className="text-white font-bold">{quarterStats.quarterRecordsCount}</div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-white/70 text-xs font-semibold mb-2">Class Averages</h5>
                      {quarterStats.classAverages.length === 0 ? (
                        <p className="text-white/40 text-xs">No performance ratings recorded for this quarter yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {quarterStats.classAverages.map((c) => (
                            <div key={c.name} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                              <span className="text-white text-sm">{c.name}</span>
                              <span className="text-yellow-400 text-sm font-semibold">
                                ⭐ {c.avg} <span className="text-white/30 text-xs">({c.count})</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {records.map((r) => {
              const coachUser = r.coach?.user;
              const coachName = coachUser
                ? `${coachUser.firstName} ${coachUser.lastName}`.trim()
                : null;
              return (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + statusCls(r.status)}>
                        {r.status}
                      </span>
                      {r.schedule?.program?.name && (
                        <span className="text-white text-xs font-semibold">
                          {r.schedule.program.name}
                          {r.className ? (
                            <span className="text-white/50 font-normal"> / {r.className}</span>
                          ) : null}
                        </span>
                      )}
                      {r.isInjured && (
                        <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">🩹 Injured</span>
                      )}
                    </div>
                    <span className="text-white/40 text-xs flex-shrink-0">
                      {new Date(r.date).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1.5 gap-2">
                    <div className="flex items-center gap-3">
                      {coachName && (
                        <span className="text-white/40 text-xs">{"👨‍🏫"} {coachName}</span>
                      )}
                      {r.injuryNote && (
                        <span className="text-red-400/70 text-xs italic truncate max-w-40">{r.injuryNote}</span>
                      )}
                    </div>
                    {r.performanceRating != null && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span
                            key={n}
                            className={"text-xs " + (n <= (r.performanceRating ?? 0) ? "text-yellow-400" : "text-white/15")}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-white/40 text-xs ml-1">Grade</span>
                      </div>
                    )}
                  </div>

                  {r.notes && (
                    <div className="mt-2 flex items-start gap-1.5">
                      <span className="text-white/30 text-xs mt-0.5">📝</span>
                      <span className="text-white/50 text-xs italic leading-relaxed">{r.notes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
