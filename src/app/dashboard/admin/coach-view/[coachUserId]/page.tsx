"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { adminCoachApi } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Status = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
const STATUS_OPTS = [
  { val: "PRESENT" as Status, label: "Present", cls: "bg-emerald-500/20 text-emerald-400" },
  { val: "ABSENT"  as Status, label: "Absent",  cls: "bg-red-500/20 text-red-400" },
  { val: "LATE"    as Status, label: "Late",    cls: "bg-yellow-500/20 text-yellow-400" },
  { val: "EXCUSED" as Status, label: "Excused", cls: "bg-blue-500/20 text-blue-400" },
];

interface Sched {
  id: string; dayOfWeek: number; startTime: string; endTime: string; isActive: boolean;
  program?: { id: string; name: string; icon?: string };
  location?: { id: string; name: string; city?: string };
}
interface Session {
  id: string; date: string; notes?: string; className?: string | null; isCompleted?: boolean;
  schedule: Sched; _count?: { attendance: number };
}
interface MyStudent {
  id: string; firstName: string; lastName: string; photo?: string | null; programs: string[];
  totalSessions: number; attended: number; avgRating: number | null;
}
interface RosterStudent {
  id: string; firstName: string; lastName: string; photo?: string | null;
  sessionsRemaining?: number; isExpired?: boolean;
  paymentStatus?: "paid" | "pending" | "unpaid";
  attendance: { id: string; status: Status; performanceRating?: number; notes?: string; isInjured?: boolean; injuryNote?: string } | null;
}
interface Rec {
  studentId: string; status: Status; performanceRating?: number; notes?: string; isInjured?: boolean; injuryNote?: string;
}

function t12(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10); const m = parseInt(mStr, 10);
  return (h % 12 || 12) + ":" + String(m).padStart(2, "0") + " " + (h >= 12 ? "PM" : "AM");
}
function fmtD(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function Spin() {
  return <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block" />;
}

// ─── Session row (history) ────────────────────────────────────────────────────

function SessionRow({ sess, completingId, onOpenAtt, onComplete }: {
  sess: Session; completingId: string | null; onOpenAtt: () => void; onComplete: () => void;
}) {
  const prog = sess.schedule?.program;
  const loc = sess.schedule?.location;
  const cnt = sess._count?.attendance ?? 0;
  const done = sess.isCompleted === true;
  return (
    <div className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${done ? "bg-white/2 border-white/5 opacity-50" : "bg-white/3 border-white/5 hover:border-white/10"}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${done ? "bg-white/5" : "bg-blue-500/20"}`}>
        {prog?.icon ?? "⚽"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white font-medium text-sm">
            {prog?.name ?? "Session"}
            {sess.className ? <span className="text-white/40 font-normal"> / {sess.className}</span> : null}
          </span>
          {done && <span className="text-xs bg-white/8 text-white/30 px-2 py-0.5 rounded-full">✓ Done</span>}
          {cnt > 0 && <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full">{cnt} students</span>}
        </div>
        <div className="text-white/30 text-xs mt-0.5">
          {fmtD(sess.date)}{loc ? ` · ${loc.name}` : ""}
        </div>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button onClick={onOpenAtt}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${done ? "bg-white/5 hover:bg-white/10 text-white/40" : "bg-blue-500/15 hover:bg-blue-500/25 text-blue-400"}`}>
          {cnt > 0 ? "View" : "Attend"}
        </button>
        {!done && (
          <button onClick={onComplete} disabled={completingId === sess.id}
            className="px-2.5 py-1.5 bg-orange-500/15 hover:bg-orange-500/25 disabled:opacity-40 text-orange-400 text-xs font-medium rounded-lg transition-all">
            {completingId === sess.id ? "…" : "Done"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Start Session Modal ──────────────────────────────────────────────────────

function AdminStartSessionModal({ coachUserId, scheds, initialScheduleId, onClose, onSuccess }: {
  coachUserId: string; scheds: Sched[]; initialScheduleId?: string; onClose: () => void; onSuccess: () => void;
}) {
  const [selSched, setSelSched] = useState(initialScheduleId ?? "");
  const [selDate, setSelDate] = useState(new Date().toISOString().slice(0, 10));
  const [selNotes, setSelNotes] = useState("");
  const [selClassName, setSelClassName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function doStart() {
    if (!selSched) { setErr("Select a schedule."); return; }
    setBusy(true); setErr("");
    try {
      await adminCoachApi.startSession(coachUserId, {
        scheduleId: selSched, date: selDate,
        notes: selNotes || undefined,
        className: selClassName.trim() || undefined,
      });
      onSuccess();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to start session.");
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Start Session</h3>
            <p className="text-xs text-amber-400/60 mt-0.5">⚡ Logged under your admin account</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5">Schedule *</label>
            <select value={selSched} onChange={e => setSelSched(e.target.value)}
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50">
              <option value="">— Select a schedule —</option>
              {scheds.filter(s => s.isActive).map(s => (
                <option key={s.id} value={s.id}>{DAYS[s.dayOfWeek]} · {s.program?.name ?? "Program"} · {t12(s.startTime)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5">Session Date *</label>
            <input type="date" value={selDate} onChange={e => setSelDate(e.target.value)}
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5">
              Topic / Focus <span className="text-white/25">(optional)</span>
            </label>
            <input type="text" value={selClassName} onChange={e => setSelClassName(e.target.value)}
              placeholder="e.g. Shooting, Dribbling, Goalkeeping"
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5">Notes (optional)</label>
            <textarea value={selNotes} onChange={e => setSelNotes(e.target.value)} rows={2}
              placeholder="e.g. Focus on passing drills"
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none" />
          </div>
          {err && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{err}</div>}
        </div>
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 text-sm rounded-xl transition-colors">Cancel</button>
          <button onClick={doStart} disabled={busy}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {busy ? <Spin /> : "Start Session"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Attendance Modal ─────────────────────────────────────────────────────────

function AdminAttendanceModal({ session, onClose, onSuccess }: {
  session: Session; onClose: () => void; onSuccess: () => void;
}) {
  const isCompletedSession = session.isCompleted === true;
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [rosterBusy, setRosterBusy] = useState(true);
  const [attMap, setAttMap] = useState<Record<string, Rec>>({});
  const [subBusy, setSubBusy] = useState(false);
  const [subOk, setSubOk] = useState(false);
  const [subErr, setSubErr] = useState("");
  const [markAllWarning, setMarkAllWarning] = useState<string | null>(null);

  useEffect(() => {
    adminCoachApi.getRoster(session.id).then(res => {
      const data = res.data as { students: RosterStudent[] };
      const students = (data.students || []).filter(s => s.paymentStatus !== "unpaid");
      setRoster(students);
      const m: Record<string, Rec> = {};
      for (const s of students) {
        m[s.id] = s.attendance
          ? { studentId: s.id, status: s.attendance.status, performanceRating: s.attendance.performanceRating, notes: s.attendance.notes, isInjured: s.attendance.isInjured, injuryNote: s.attendance.injuryNote }
          : { studentId: s.id, status: "PRESENT" };
      }
      setAttMap(m);
    }).catch(() => setRoster([])).finally(() => setRosterBusy(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  function setF(id: string, k: keyof Rec, v: unknown) {
    setAttMap(p => ({ ...p, [id]: { ...p[id], studentId: id, [k]: v } }));
  }

  function markAll(s: Status) {
    const skipped = roster.filter(stu => stu.paymentStatus === "pending" || stu.isExpired).length;
    if (skipped > 0) {
      setMarkAllWarning(`${skipped} student${skipped > 1 ? "s" : ""} skipped — pending payment or no sessions remaining.`);
    } else {
      setMarkAllWarning(null);
    }
    setAttMap(p => {
      const n = { ...p };
      for (const stu of roster) {
        if (stu.paymentStatus !== "pending" && !stu.isExpired) {
          n[stu.id] = { ...n[stu.id], studentId: stu.id, status: s };
        }
      }
      return n;
    });
  }

  async function doSubmit() {
    setSubBusy(true); setSubErr("");
    try {
      await adminCoachApi.submitAttendance(session.id, Object.values(attMap));
      setSubOk(true); onSuccess();
    } catch (e: unknown) {
      setSubErr(e instanceof Error ? e.message : "Failed to submit.");
    } finally { setSubBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

        <div className="p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">
                Attendance —{" "}
                {session.schedule?.program?.name
                  ? session.className ? `${session.schedule.program.name} / ${session.className}` : session.schedule.program.name
                  : "Session"}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs border border-amber-500/20">Admin</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-white/40 text-xs">{fmtD(session.date)}</p>
              {!rosterBusy && roster.length > 0 && (
                <span className="text-xs text-white/30">
                  {Object.values(attMap).filter(r => r.status).length} of {roster.length} marked
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {rosterBusy ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>
          ) : roster.length === 0 ? (
            <div className="text-center py-12 text-white/30"><div className="text-4xl mb-2">👥</div><p className="text-sm">No enrolled students found</p></div>
          ) : (
            <div className="space-y-3">
              {/* Mark all row */}
              <div className="pb-3 border-b border-white/5 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white/40 text-xs">Mark all:</span>
                  {STATUS_OPTS.map(opt => (
                    <button key={opt.val} onClick={() => !isCompletedSession && markAll(opt.val)} disabled={isCompletedSession}
                      className={"px-2.5 py-1 rounded-lg text-xs font-medium " + (isCompletedSession ? "bg-white/5 text-white/20 cursor-not-allowed" : opt.cls)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                {markAllWarning && (
                  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-amber-400 text-xs">⚠️ {markAllWarning}</span>
                    <button onClick={() => setMarkAllWarning(null)} className="text-amber-400/50 hover:text-amber-400 text-sm leading-none">✕</button>
                  </div>
                )}
              </div>

              {roster.map(stu => {
                const rec = attMap[stu.id] ?? { studentId: stu.id, status: "PRESENT" as Status };
                const expired = stu.isExpired === true;
                const isPending = stu.paymentStatus === "pending";
                const isBlocked = expired || isPending;
                const sessLeft = stu.sessionsRemaining ?? null;
                return (
                  <div key={stu.id} className={"p-4 rounded-xl border space-y-3 " + (isPending ? "bg-amber-500/5 border-amber-500/15 opacity-50" : expired ? "bg-red-500/5 border-red-500/20 opacity-60" : "bg-white/3 border-white/5")}>
                    <div className="flex items-center gap-3 flex-wrap">
                      {stu.photo
                        ? <img src={stu.photo} alt={stu.firstName} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-white/10" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        : <div className={"w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 " + (isPending ? "bg-gradient-to-br from-amber-600 to-amber-700" : expired ? "bg-gradient-to-br from-gray-600 to-gray-700" : "bg-gradient-to-br from-blue-500 to-indigo-600")}>{stu.firstName.charAt(0)}</div>
                      }
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-semibold">{stu.firstName} {stu.lastName}</div>
                        {isPending && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">💵 Cash — Pending Approval</span>}
                        {!isPending && sessLeft !== null && (
                          expired
                            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">🚫 No sessions left</span>
                            : sessLeft <= 2
                              ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">⚠️ {sessLeft} session{sessLeft === 1 ? "" : "s"} left</span>
                              : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/70 text-xs">{sessLeft} sessions left</span>
                        )}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {STATUS_OPTS.map(opt => (
                          <button key={opt.val} onClick={() => !isBlocked && setF(stu.id, "status", opt.val)} disabled={isBlocked}
                            className={"px-2.5 py-1 rounded-lg text-xs font-medium transition-all " + (isBlocked ? "bg-white/3 text-white/20 cursor-not-allowed" : rec.status === opt.val ? opt.cls : "bg-white/5 text-white/40 hover:bg-white/10")}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {isPending && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/15">
                        <p className="text-amber-400/80 text-xs">⏳ Cash payment pending admin approval — attendance blocked.</p>
                      </div>
                    )}

                    {!isBlocked && (
                      <>
                        {/* Session note — visible first */}
                        <textarea value={rec.notes ?? ""} onChange={e => setF(stu.id, "notes", e.target.value)}
                          rows={2} placeholder="📝 Session note (visible to parent)…" disabled={isCompletedSession}
                          className="w-full bg-dark-700 border border-white/8 rounded-lg px-2.5 py-1.5 text-white text-xs placeholder-white/25 focus:outline-none focus:border-white/25 resize-none disabled:opacity-40" />

                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          {/* Star rating */}
                          <div className="flex items-center gap-2">
                            <span className="text-white/35 text-xs">Rating:</span>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(n => (
                                <button key={n}
                                  onClick={() => setF(stu.id, "performanceRating", rec.performanceRating === n ? undefined : n)}
                                  disabled={isCompletedSession}
                                  className={`text-lg leading-none transition-all disabled:opacity-40 ${rec.performanceRating != null && n <= rec.performanceRating ? "text-yellow-400" : "text-white/15 hover:text-yellow-400/50"}`}>
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>
                          {/* Injury toggle */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={!!rec.isInjured} onChange={e => setF(stu.id, "isInjured", e.target.checked)}
                              disabled={isCompletedSession} className="w-3.5 h-3.5 rounded accent-red-500 disabled:opacity-40" />
                            <span className="text-white/40 text-xs">🩹 Injured</span>
                          </label>
                        </div>

                        {rec.isInjured && (
                          <input type="text" value={rec.injuryNote ?? ""} onChange={e => setF(stu.id, "injuryNote", e.target.value)}
                            placeholder="Describe the injury…" disabled={isCompletedSession}
                            className="w-full bg-dark-700 border border-red-500/25 rounded-lg px-2.5 py-1.5 text-white text-xs placeholder-red-400/40 focus:outline-none disabled:opacity-40" />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 flex-shrink-0 space-y-3">
          {subErr && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{subErr}</div>}
          {subOk && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">✓ Attendance saved (logged under admin ID)</div>}
          {isCompletedSession && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm text-center">
              This session is completed — attendance is read-only.
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 text-sm rounded-xl transition-colors">Close</button>
            {!isCompletedSession && (
              <button onClick={doSubmit} disabled={subBusy || rosterBusy || roster.length === 0}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                {subBusy ? <Spin /> : "Save Attendance"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCoachViewPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const coachUserId = params.coachUserId as string;

  const [coachName, setCoachName] = useState("");
  const [coachPhoto, setCoachPhoto] = useState<string | null>(null);
  const [scheds, setScheds] = useState<Sched[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [myStudents, setMyStudents] = useState<MyStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);

  const [showStart, setShowStart] = useState(false);
  const [startSchedId, setStartSchedId] = useState<string | undefined>(undefined);
  const [attSession, setAttSession] = useState<Session | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSort, setStudentSort] = useState<"name" | "attendance" | "rating">("name");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push("/login"); return; }
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!token || !coachUserId) return;
    fetch(`${API}/coaches`, { headers: { "x-tenant-id": TENANT, Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const list = (data.data || data) as Array<{ userId: string; user?: { firstName: string; lastName: string; avatar?: string } }>;
        const match = list.find(c => c.userId === coachUserId);
        if (match?.user) {
          setCoachName(`${match.user.firstName} ${match.user.lastName}`);
          setCoachPhoto(match.user.avatar ?? null);
        }
      })
      .catch(() => {});
  }, [token, coachUserId]);

  const load = useCallback(async () => {
    if (!isAuthenticated || isLoading || !coachUserId) return;
    setLoading(true); setStudentsLoading(true);
    try {
      const [a, b, c] = await Promise.allSettled([
        adminCoachApi.getSchedules(coachUserId),
        adminCoachApi.getSessions(coachUserId),
        adminCoachApi.getStudents(coachUserId),
      ]);
      if (a.status === "fulfilled") setScheds((a.value.data as Sched[]) || []);
      if (b.status === "fulfilled") setSessions((b.value.data as Session[]) || []);
      if (c.status === "fulfilled") setMyStudents((c.value.data as MyStudent[]) || []);
    } finally { setLoading(false); setStudentsLoading(false); }
  }, [isAuthenticated, isLoading, coachUserId]);

  useEffect(() => { load(); }, [load]);

  const dow = new Date().getDay();
  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();

  const todayS = scheds.filter(s => s.dayOfWeek === dow && s.isActive);

  const sessionsThisMonth = sessions.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const todayAttendance = sessions
    .filter(s => s.date.slice(0, 10) === todayStr)
    .reduce((a, s) => a + (s._count?.attendance ?? 0), 0);

  const lowAttCount = myStudents.filter(
    s => s.totalSessions > 0 && s.attended / s.totalSessions < 0.6
  ).length;

  const activeSessions = sessions.filter(
    s => s.date.slice(0, 10) === todayStr && !s.isCompleted
  );

  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const historyThisWeek = sessions.filter(s => {
    const d = new Date(s.date);
    return s.date.slice(0, 10) !== todayStr && d >= weekAgo;
  });
  const historyOlder = sessions.filter(s => new Date(s.date) < weekAgo);

  const filteredStudents = myStudents
    .filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()))
    .sort((a, b) => {
      if (studentSort === "attendance") {
        const rA = a.totalSessions > 0 ? a.attended / a.totalSessions : 1;
        const rB = b.totalSessions > 0 ? b.attended / b.totalSessions : 1;
        return rA - rB;
      }
      if (studentSort === "rating") return (b.avgRating ?? 0) - (a.avgRating ?? 0);
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });

  function findTodaySession(schedId: string): Session | undefined {
    return sessions.find(sess => sess.schedule?.id === schedId && sess.date?.slice(0, 10) === todayStr);
  }

  async function doComplete(sessionId: string) {
    if (!confirm("Mark this session as completed?")) return;
    setCompletingId(sessionId);
    try {
      await adminCoachApi.completeSession(sessionId);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to complete session.");
    } finally { setCompletingId(null); }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark-900 pt-20">

      {/* Admin context banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3 text-sm">
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30">ADMIN VIEW</span>
          <span className="text-amber-400/60 text-xs">All actions are logged under your admin account ({user.firstName} {user.lastName})</span>
          <Link href="/dashboard/admin/coaches" className="ml-auto text-amber-400/50 hover:text-amber-400 text-xs transition-colors">← Back to Coaches</Link>
        </div>
      </div>

      {/* Header */}
      <div className="bg-dark-800 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden flex-shrink-0 border border-lebanon-green/20 bg-gradient-to-br from-lebanon-green/30 to-emerald-600/20 flex items-center justify-center">
            {coachPhoto
              ? <img src={coachPhoto} alt={coachName} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              : <span className="text-base font-bold text-lebanon-green">{coachName.charAt(0) || "C"}</span>
            }
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Coach {coachName || "…"}</h1>
            <p className="text-white/40 text-xs">{DAYS_FULL[dow]}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Active session banner */}
        {!loading && activeSessions.length > 0 && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <div>
                <div className="text-emerald-400 font-semibold text-sm">
                  {activeSessions.length === 1 ? "1 session in progress" : `${activeSessions.length} sessions in progress`}
                </div>
                <div className="text-emerald-400/50 text-xs">
                  {activeSessions.map(s => s.schedule?.program?.name ?? "Session").join(" · ")}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {activeSessions.map(s => (
                <button key={s.id} onClick={() => setAttSession(s)}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-lg transition-all">
                  Open {s.schedule?.program?.name ?? "Session"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            { icon: "📅", label: "This Month", value: sessionsThisMonth, sub: "sessions run", grad: "from-blue-500/15", valCls: "text-white" },
            { icon: "✅", label: "Today", value: todayAttendance, sub: "attendance logged", grad: "from-emerald-500/15", valCls: "text-white" },
            { icon: "⚠️", label: "Need Attention", value: lowAttCount, sub: "below 60% attendance", grad: lowAttCount > 0 ? "from-orange-500/15" : "from-white/5", valCls: lowAttCount > 0 ? "text-orange-400" : "text-white/40" },
            { icon: "👥", label: "Students", value: myStudents.length, sub: "on roster", grad: "from-purple-500/15", valCls: "text-white" },
          ] as { icon: string; label: string; value: number; sub: string; grad: string; valCls: string }[]).map(({ icon, label, value, sub, grad, valCls }) => (
            <div key={label} className={`glass-card p-4 bg-gradient-to-br ${grad} to-transparent`}>
              <div className="text-xl mb-1">{icon}</div>
              {loading
                ? <div className="h-7 w-10 bg-white/10 rounded animate-pulse mb-1" />
                : <div className={`text-2xl font-bold ${valCls}`}>{value}</div>
              }
              <div className="text-white/50 text-xs font-medium">{label}</div>
              <div className="text-white/25 text-[10px]">{sub}</div>
            </div>
          ))}
        </div>

        {/* Today's Classes — hero */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>📅</span> Today&apos;s Classes
              <span className="text-xs text-white/30 font-normal">{DAYS_FULL[dow]}</span>
            </h2>
            <button
              onClick={() => { setStartSchedId(undefined); setShowStart(true); }}
              className="px-3 py-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all"
            >
              + Other Session
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1,2].map(i => <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : todayS.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">🌙</div>
              <p className="text-white/40 text-sm font-medium">No classes scheduled today</p>
              <p className="text-white/25 text-xs mt-1">Check the weekly schedule below</p>
              <button onClick={() => { setStartSchedId(undefined); setShowStart(true); }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
                Start Unscheduled Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {todayS.map(s => {
                const inProgress = findTodaySession(s.id);
                const isCompleted = inProgress?.isCompleted === true;
                return (
                  <div key={s.id} className={`p-4 rounded-xl border ${isCompleted ? "bg-white/3 border-white/5 opacity-60" : inProgress ? "bg-emerald-500/10 border-emerald-500/25" : "bg-blue-500/5 border-blue-500/15"}`}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{s.program?.icon ?? "⚽"}</span>
                          <span className="text-white font-bold text-sm">{s.program?.name ?? "Program"}</span>
                        </div>
                        {inProgress?.className && <div className="text-white/40 text-xs mt-0.5 pl-7">{inProgress.className}</div>}
                      </div>
                      {isCompleted
                        ? <span className="text-xs bg-white/8 text-white/35 px-2 py-0.5 rounded-full flex-shrink-0">✓ Done</span>
                        : inProgress
                          ? <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex-shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
                            </span>
                          : null}
                    </div>
                    <div className="text-white/40 text-xs mb-1">🕐 {t12(s.startTime)} – {t12(s.endTime)}</div>
                    {s.location && <div className="text-white/30 text-xs mb-3">📍 {s.location.name}{s.location.city ? `, ${s.location.city}` : ""}</div>}

                    {isCompleted ? (
                      <div className="w-full py-2 bg-white/5 text-white/25 text-xs font-medium rounded-lg text-center">Session completed</div>
                    ) : inProgress ? (
                      <button onClick={() => setAttSession(inProgress)}
                        className="w-full py-2 bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-300 text-sm font-semibold rounded-lg transition-colors">
                        Open Attendance
                      </button>
                    ) : (
                      <button onClick={() => { setStartSchedId(s.id); setShowStart(true); }}
                        className="w-full py-2 bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 text-sm font-semibold rounded-lg transition-colors">
                        Start This Class
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Students + weekly schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Students */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>👥</span> Students
                  {!studentsLoading && <span className="text-xs text-white/30 font-normal">({myStudents.length})</span>}
                </h2>
                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  <input type="text" placeholder="Search..." value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-dark-900 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-blue-500/40 w-28" />
                  <select value={studentSort} onChange={e => setStudentSort(e.target.value as typeof studentSort)}
                    className="px-2 py-1.5 rounded-lg bg-dark-900 border border-white/10 text-white/60 text-xs focus:outline-none">
                    <option value="name">A–Z</option>
                    <option value="attendance">Low attendance</option>
                    <option value="rating">Top rated</option>
                  </select>
                </div>
              </div>

              {studentsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-white/30">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="text-sm">{studentSearch ? "No students match your search" : "No students enrolled in this coach's programs"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredStudents.map(stu => {
                    const rate = stu.totalSessions > 0 ? Math.round((stu.attended / stu.totalSessions) * 100) : null;
                    const isLow = rate !== null && rate < 60;
                    const isWarn = rate !== null && rate >= 60 && rate < 80;
                    return (
                      <div key={stu.id} className={`p-4 rounded-xl border transition-all ${isLow ? "bg-red-500/5 border-red-500/20" : isWarn ? "bg-orange-500/5 border-orange-500/15" : "bg-white/3 border-white/5 hover:border-white/10"}`}>
                        <div className="flex items-start gap-3 mb-3">
                          <div className="relative flex-shrink-0">
                            {stu.photo
                              ? <img src={stu.photo} alt={stu.firstName} className="w-10 h-10 rounded-full object-cover border border-white/10" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">{stu.firstName.charAt(0)}</div>
                            }
                            {isLow && <span className="absolute -top-1 -right-1 text-[10px]">🔴</span>}
                            {isWarn && !isLow && <span className="absolute -top-1 -right-1 text-[10px]">🟡</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-semibold truncate">{stu.firstName} {stu.lastName}</div>
                            {stu.programs.length > 0 && <div className="text-white/35 text-xs truncate">{stu.programs.join(", ")}</div>}
                          </div>
                          {stu.avgRating != null && (
                            <div className="flex gap-0.5 flex-shrink-0">
                              {[1,2,3,4,5].map(n => (
                                <span key={n} className={n <= Math.round(stu.avgRating!) ? "text-yellow-400" : "text-white/15"} style={{ fontSize: 10 }}>★</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {rate !== null ? (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-semibold ${isLow ? "text-red-400" : isWarn ? "text-orange-400" : "text-emerald-400"}`}>{rate}% attendance</span>
                              <span className="text-white/25 text-[10px]">{stu.attended}/{stu.totalSessions}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                              <div className={`h-full rounded-full ${isLow ? "bg-red-500" : isWarn ? "bg-orange-400" : "bg-emerald-400"}`} style={{ width: `${rate}%` }} />
                            </div>
                          </div>
                        ) : (
                          <div className="text-white/25 text-xs">No sessions yet</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Weekly schedule */}
          <div className="glass-card p-6 h-fit">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2"><span>🗓️</span> Weekly Schedule</h2>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}</div>
            ) : scheds.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-4">No schedules assigned</p>
            ) : (
              <div className="space-y-2">
                {[...scheds].sort((a, b) => a.dayOfWeek - b.dayOfWeek).map(s => (
                  <div key={s.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${s.dayOfWeek === dow ? "bg-blue-500/15 border border-blue-500/20" : "bg-white/3"}`}>
                    <span className={`text-xs font-bold w-8 text-center flex-shrink-0 ${s.dayOfWeek === dow ? "text-blue-400" : "text-white/30"}`}>{DAYS[s.dayOfWeek]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs font-medium truncate">{s.program?.name ?? "Program"}</div>
                      <div className="text-white/40 text-xs">{t12(s.startTime)} – {t12(s.endTime)}</div>
                      {s.location && <div className="text-white/25 text-xs truncate">📍 {s.location.name}</div>}
                    </div>
                    {s.dayOfWeek === dow && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full flex-shrink-0">Today</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Session History — collapsed */}
        <div className="glass-card overflow-hidden">
          <button onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-all text-left">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>🗂️</span> Session History
              <span className="text-xs text-white/30 font-normal">({sessions.length} total)</span>
            </h2>
            <span className="text-white/30 text-xs">{showHistory ? "▲ collapse" : "▼ expand"}</span>
          </button>

          {showHistory && (
            <div className="px-6 pb-6 space-y-4 border-t border-white/5">
              {sessions.length === 0 ? (
                <div className="text-center py-10 text-white/30">
                  <div className="text-3xl mb-2">📋</div><p className="text-sm">No session history yet</p>
                </div>
              ) : (
                <>
                  {historyThisWeek.length > 0 && (
                    <div className="pt-4">
                      <div className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">This Week</div>
                      <div className="space-y-2">
                        {historyThisWeek.map(sess => (
                          <SessionRow key={sess.id} sess={sess} completingId={completingId}
                            onOpenAtt={() => setAttSession(sess)} onComplete={() => doComplete(sess.id)} />
                        ))}
                      </div>
                    </div>
                  )}
                  {historyOlder.length > 0 && (
                    <div className={historyThisWeek.length > 0 ? "border-t border-white/5 pt-4" : "pt-4"}>
                      <div className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">Older</div>
                      <div className="space-y-2">
                        {historyOlder.map(sess => (
                          <SessionRow key={sess.id} sess={sess} completingId={completingId}
                            onOpenAtt={() => setAttSession(sess)} onComplete={() => doComplete(sess.id)} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      {showStart && (
        <AdminStartSessionModal
          coachUserId={coachUserId} scheds={scheds}
          initialScheduleId={startSchedId}
          onClose={() => { setShowStart(false); setStartSchedId(undefined); }}
          onSuccess={() => { setShowStart(false); setStartSchedId(undefined); load(); }}
        />
      )}
      {attSession && (
        <AdminAttendanceModal session={attSession}
          onClose={() => setAttSession(null)} onSuccess={() => load()} />
      )}
    </div>
  );
}
