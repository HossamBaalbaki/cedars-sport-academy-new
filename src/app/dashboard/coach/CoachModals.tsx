"use client";
import { useEffect, useState } from "react";
import { coachSessionsApi } from "@/lib/api";

// ─── Student Profile Types ────────────────────────────────────────────────────

export interface MyStudent {
  id: string;
  firstName: string;
  lastName: string;
  programs: string[];
  totalSessions: number;
  attended: number;
  avgRating: number | null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface Sched {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  program?: { id: string; name: string; icon?: string };
  location?: { id: string; name: string; city?: string };
}

export interface Session {
  id: string;
  date: string;
  notes?: string;
  className?: string | null;
  isCompleted?: boolean;
  schedule: Sched;
  _count?: { attendance: number };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  sessionsRemaining?: number;
  isExpired?: boolean;
  paymentStatus?: 'paid' | 'pending' | 'unpaid';
  paymentMethod?: string | null;
  attendance: {
    id: string;
    status: Status;
    performanceRating?: number;
    notes?: string;
    isInjured?: boolean;
    injuryNote?: string;
  } | null;
}

interface Rec {
  studentId: string;
  status: Status;
  performanceRating?: number;
  notes?: string;
  isInjured?: boolean;
  injuryNote?: string;
}

// ─── Student Profile Modal ────────────────────────────────────────────────────

interface StudentDetailRecord {
  date: string;
  programName: string;
  status: Status;
  performanceRating?: number;
  notes?: string;
  isInjured?: boolean;
  injuryNote?: string;
}

interface StudentDetail {
  student: { id: string; firstName: string; lastName: string; medicalNotes?: string };
  stats: { total: number; attended: number; avgRating: number | null };
  history: StudentDetailRecord[];
}

interface StudentProfileModalProps {
  studentId: string;
  onClose: () => void;
}

const STATUS_BADGE: Record<Status, string> = {
  PRESENT: "bg-emerald-500/20 text-emerald-400",
  ABSENT:  "bg-red-500/20 text-red-400",
  LATE:    "bg-yellow-500/20 text-yellow-400",
  EXCUSED: "bg-blue-500/20 text-blue-400",
};

export function StudentProfileModal({ studentId, onClose }: StudentProfileModalProps) {
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    setBusy(true);
    setErr("");
    coachSessionsApi.getStudentDetail(studentId)
      .then((res) => {
        setDetail(res.data as StudentDetail);
      })
      .catch((e: unknown) => {
        setErr(e instanceof Error ? e.message : "Failed to load student profile.");
      })
      .finally(() => setBusy(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const attendanceRate = detail
    ? detail.stats.total > 0
      ? Math.round((detail.stats.attended / detail.stats.total) * 100)
      : 0
    : 0;

  function Stars({ rating }: { rating?: number }) {
    if (!rating) return <span className="text-white/20 text-xs">—</span>;
    return (
      <span className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= rating ? "text-yellow-400" : "text-white/15"} style={{ fontSize: 12 }}>★</span>
        ))}
      </span>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {detail ? detail.student.firstName.charAt(0) : "?"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {detail ? `${detail.student.firstName} ${detail.student.lastName}` : "Student Profile"}
              </h3>
              <p className="text-white/40 text-xs mt-0.5">Attendance History &amp; Performance</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {busy ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : err ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{err}</div>
          ) : detail ? (
            <div className="space-y-6">

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white/3 border border-white/5 text-center">
                  <div className="text-2xl font-bold text-white">{attendanceRate}%</div>
                  <div className="text-white/40 text-xs mt-1">Attendance Rate</div>
                  <div className="text-white/25 text-xs">{detail.stats.attended}/{detail.stats.total} sessions</div>
                </div>
                <div className="p-4 rounded-xl bg-white/3 border border-white/5 text-center">
                  <div className="text-2xl font-bold text-white">
                    {detail.stats.avgRating ? detail.stats.avgRating.toFixed(1) : "—"}
                  </div>
                  <div className="text-white/40 text-xs mt-1">Avg Performance</div>
                  {detail.stats.avgRating && (
                    <div className="flex justify-center mt-1">
                      <Stars rating={Math.round(detail.stats.avgRating)} />
                    </div>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-white/3 border border-white/5 text-center">
                  <div className="text-2xl font-bold text-white">{detail.stats.total}</div>
                  <div className="text-white/40 text-xs mt-1">Total Sessions</div>
                </div>
              </div>

              {/* Medical notes if any */}
              {detail.student.medicalNotes && (
                <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl">
                  <div className="text-red-400 text-xs font-semibold mb-1">⚕ Medical Notes</div>
                  <div className="text-white/60 text-xs">{detail.student.medicalNotes}</div>
                </div>
              )}

              {/* Session history */}
              <div>
                <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Session History</h4>
                {detail.history.length === 0 ? (
                  <div className="text-center py-8 text-white/30">
                    <div className="text-3xl mb-2">📋</div>
                    <p className="text-sm">No session records yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {detail.history.map((rec, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5">
                        <div className="flex items-start gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white text-sm font-medium">{fmtD(rec.date)}</span>
                              <span className="text-white/30 text-xs">·</span>
                              <span className="text-white/60 text-xs">{rec.programName}</span>
                            </div>
                            {rec.notes && (
                              <p className="text-white/40 text-xs mt-1 leading-relaxed">📝 {rec.notes}</p>
                            )}
                            {rec.isInjured && (
                              <p className="text-red-400 text-xs mt-1">🩹 {rec.injuryNote || "Injury reported"}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Stars rating={rec.performanceRating} />
                            <span className={"px-2 py-0.5 rounded-lg text-xs font-medium " + STATUS_BADGE[rec.status]}>
                              {rec.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/70 text-sm rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_OPTS = [
  { val: "PRESENT" as Status, label: "Present", cls: "bg-emerald-500/20 text-emerald-400" },
  { val: "ABSENT"  as Status, label: "Absent",  cls: "bg-red-500/20 text-red-400" },
  { val: "LATE"    as Status, label: "Late",    cls: "bg-yellow-500/20 text-yellow-400" },
  { val: "EXCUSED" as Status, label: "Excused", cls: "bg-blue-500/20 text-blue-400" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function t12(time: string): string {
  const parts = time.split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return (h % 12 || 12) + ":" + String(m).padStart(2, "0") + " " + (h >= 12 ? "PM" : "AM");
}

function fmtD(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function Spin() {
  return <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block" />;
}

// ─── Start Session Modal ──────────────────────────────────────────────────────

interface StartModalProps {
  scheds: Sched[];
  initialScheduleId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function StartSessionModal({ scheds, initialScheduleId, onClose, onSuccess }: StartModalProps) {
  const [selSched, setSelSched] = useState(initialScheduleId ?? "");
  const [selDate, setSelDate] = useState(new Date().toISOString().slice(0, 10));
  const [selNotes, setSelNotes] = useState("");
  const [selClassName, setSelClassName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function doStart() {
    if (!selSched) { setErr("Select a schedule."); return; }
    if (!selClassName.trim()) { setErr("Class name is required."); return; }
    setBusy(true);
    setErr("");
    try {
      await coachSessionsApi.startSession({
        scheduleId: selSched,
        date: selDate,
        notes: selNotes || undefined,
        className: selClassName.trim(),
      });
      onSuccess();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to start session.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Start Session</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5">Schedule *</label>
            <select
              value={selSched}
              onChange={(e) => setSelSched(e.target.value)}
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
            >
              <option value="">— Select a schedule —</option>
              {scheds.filter((s) => s.isActive).map((s) => (
                <option key={s.id} value={s.id}>
                  {DAYS[s.dayOfWeek]} · {s.program?.name ?? "Program"} · {t12(s.startTime)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5">Session Date *</label>
            <input
              type="date"
              value={selDate}
              onChange={(e) => setSelDate(e.target.value)}
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5">
              Class Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={selClassName}
              onChange={(e) => setSelClassName(e.target.value)}
              placeholder="e.g. Shooting, Dribbling, Goalkeeping"
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5">Notes (optional)</label>
            <textarea
              value={selNotes}
              onChange={(e) => setSelNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Focus on passing drills"
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>
          {err && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{err}</div>
          )}
        </div>
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 text-sm rounded-xl transition-colors">
            Cancel
          </button>
          <button
            onClick={doStart}
            disabled={busy}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {busy ? <Spin /> : "Start Session"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Attendance Modal ─────────────────────────────────────────────────────────

interface AttModalProps {
  session: Session;
  onClose: () => void;
  onSuccess: () => void;
}

export function AttendanceModal({ session, onClose, onSuccess }: AttModalProps) {
  const isCompletedSession = session.isCompleted === true;
  const [roster, setRoster] = useState<Student[]>([]);
  const [rosterBusy, setRosterBusy] = useState(true);
  const [attMap, setAttMap] = useState<Record<string, Rec>>({});
  const [subBusy, setSubBusy] = useState(false);
  const [subOk, setSubOk] = useState(false);
  const [subErr, setSubErr] = useState("");

  // Load roster on mount
  useEffect(() => {
    coachSessionsApi.getRoster(session.id).then((res) => {
      const data = res.data as { students: Student[] };
      const students = data.students || [];
      // Filter: hide students with paymentStatus === "unpaid" (no payment / FAILED / OVERDUE)
      const visibleStudents = students.filter((s) => s.paymentStatus !== 'unpaid');
      setRoster(visibleStudents);
      const m: Record<string, Rec> = {};
      for (const s of visibleStudents) {
        if (s.attendance) {
          m[s.id] = {
            studentId: s.id,
            status: s.attendance.status,
            performanceRating: s.attendance.performanceRating,
            notes: s.attendance.notes,
            isInjured: s.attendance.isInjured,
            injuryNote: s.attendance.injuryNote,
          };
        } else {
          m[s.id] = { studentId: s.id, status: "PRESENT" };
        }
      }
      setAttMap(m);
    }).catch(() => {
      setRoster([]);
    }).finally(() => {
      setRosterBusy(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  function setF(id: string, k: keyof Rec, v: unknown) {
    setAttMap((p) => ({ ...p, [id]: { ...p[id], studentId: id, [k]: v } }));
  }

  function markAll(s: Status) {
    setAttMap((p) => {
      const n = { ...p };
      // Only mark students whose payment is not pending
      const paidStudentIds = new Set(roster.filter((stu) => stu.paymentStatus !== 'pending').map((stu) => stu.id));
      for (const id of Object.keys(n)) {
        if (paidStudentIds.has(id)) {
          n[id] = { ...n[id], status: s };
        }
      }
      return n;
    });
  }

  async function doSubmit() {
    setSubBusy(true);
    setSubErr("");
    try {
      await coachSessionsApi.submitAttendance(session.id, Object.values(attMap));
      setSubOk(true);
      onSuccess();
    } catch (e: unknown) {
      setSubErr(e instanceof Error ? e.message : "Failed to submit.");
    } finally {
      setSubBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

        <div className="p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white">
              Attendance —{" "}
              {session.schedule?.program?.name
                ? session.className
                  ? `${session.schedule.program.name} / ${session.className}`
                  : session.schedule.program.name
                : "Session"}
            </h3>
            <p className="text-white/40 text-xs mt-0.5">{fmtD(session.date)}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {rosterBusy ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : roster.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-sm">No enrolled students found</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5 flex-wrap">
                <span className="text-white/40 text-xs">Mark all:</span>
                {STATUS_OPTS.map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => !isCompletedSession && markAll(opt.val)}
                    disabled={isCompletedSession}
                    className={
                      "px-2.5 py-1 rounded-lg text-xs font-medium " +
                      (isCompletedSession ? "bg-white/5 text-white/20 cursor-not-allowed" : opt.cls)
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {roster.map((stu) => {
                const rec = attMap[stu.id] ?? { studentId: stu.id, status: "PRESENT" as Status };
                const expired = stu.isExpired === true;
                const isPending = stu.paymentStatus === 'pending';
                const isBlocked = expired || isPending;
                const sessLeft = stu.sessionsRemaining ?? null;
                return (
                  <div
                    key={stu.id}
                    className={
                      "p-4 rounded-xl border space-y-3 transition-all " +
                      (isPending
                        ? "bg-amber-500/5 border-amber-500/15 opacity-50"
                        : expired
                          ? "bg-red-500/5 border-red-500/20 opacity-60"
                          : "bg-white/3 border-white/5")
                    }
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className={
                        "w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 " +
                        (isPending
                          ? "bg-gradient-to-br from-amber-600 to-amber-700"
                          : expired
                            ? "bg-gradient-to-br from-gray-600 to-gray-700"
                            : "bg-gradient-to-br from-blue-500 to-indigo-600")
                      }>
                        {stu.firstName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-semibold">{stu.firstName} {stu.lastName}</div>
                        {/* Payment status badge */}
                        {isPending && (
                          <div className="mt-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                              💵 Cash — Pending Admin Approval
                            </span>
                          </div>
                        )}
                        {/* Sessions remaining badge */}
                        {!isPending && sessLeft !== null && (
                          <div className="mt-0.5">
                            {expired ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                                🚫 No sessions — payment required
                              </span>
                            ) : sessLeft <= 2 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
                                ⚠️ {sessLeft} session{sessLeft === 1 ? "" : "s"} left
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/70 text-xs">
                                {sessLeft} sessions left
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Status buttons — disabled for expired or pending-payment students */}
                      <div className="flex gap-1 flex-wrap">
                        {STATUS_OPTS.map((opt) => (
                          <button
                            key={opt.val}
                            onClick={() => !isBlocked && setF(stu.id, "status", opt.val)}
                            disabled={isBlocked}
                            title={
                              isPending
                                ? "Cash payment pending admin approval — attendance blocked"
                                : expired
                                  ? "No sessions remaining — cannot mark attendance"
                                  : undefined
                            }
                            className={
                              "px-2.5 py-1 rounded-lg text-xs font-medium transition-all " +
                              (isBlocked
                                ? "bg-white/3 text-white/20 cursor-not-allowed"
                                : rec.status === opt.val
                                  ? opt.cls
                                  : "bg-white/5 text-white/40 hover:bg-white/10")
                            }
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pending payment notice */}
                    {isPending && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/15">
                        <p className="text-amber-400/80 text-xs">
                          ⏳ This student&apos;s parent chose <strong>Cash</strong> payment. Attendance is blocked until an admin marks the payment as paid.
                        </p>
                      </div>
                    )}

                    {/* Rating + injury — hidden for expired or pending */}
                    {!isBlocked && (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="text-white/40 text-xs w-20">Rating (1-5)</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                onClick={() => setF(stu.id, "performanceRating", rec.performanceRating === n ? undefined : n)}
                                className={"w-7 h-7 rounded-lg text-xs font-bold transition-all " + (rec.performanceRating === n ? "bg-yellow-500 text-dark-900" : "bg-white/5 text-white/40 hover:bg-white/10")}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!rec.isInjured}
                              onChange={(e) => setF(stu.id, "isInjured", e.target.checked)}
                              disabled={isCompletedSession}
                              className="w-4 h-4 rounded accent-red-500 disabled:opacity-40"
                            />
                            <span className="text-white/50 text-xs">Injured</span>
                          </label>
                          {rec.isInjured && (
                            <input
                              value={rec.injuryNote ?? ""}
                              onChange={(e) => setF(stu.id, "injuryNote", e.target.value)}
                              placeholder="Injury note..."
                              disabled={isCompletedSession}
                              className="flex-1 bg-dark-700 border border-red-500/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none disabled:opacity-40"
                            />
                          )}
                        </div>

                        {/* ── Session Note (saved with attendance) ── */}
                        <div className="pt-2 border-t border-white/5">
                          <label className="block text-white/40 text-xs font-medium mb-1.5">
                            📝 Session Note <span className="text-white/20">(saved with attendance · visible to parent)</span>
                          </label>
                          <textarea
                            value={rec.notes ?? ""}
                            onChange={(e) => setF(stu.id, "notes", e.target.value)}
                            rows={2}
                            placeholder="Note about this student for this session…"
                            disabled={isCompletedSession}
                            className="w-full bg-dark-700 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-white/30 resize-none disabled:opacity-40"
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 flex-shrink-0">
          {isCompletedSession && (
            <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm text-center">
              This session is completed. Attendance is read-only.
            </div>
          )}
          {subOk && (
            <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm text-center">
              Attendance saved successfully!
            </div>
          )}
          {subErr && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{subErr}</div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 text-sm rounded-xl transition-colors">
              Close
            </button>
            {roster.length > 0 && !isCompletedSession && (
              <button
                onClick={doSubmit}
                disabled={subBusy}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {subBusy ? <Spin /> : "Save Attendance"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
