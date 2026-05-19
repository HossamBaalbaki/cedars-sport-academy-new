"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { schedulesApi, coachSessionsApi } from "@/lib/api";
import { StartSessionModal, AttendanceModal, StudentProfileModal } from "./CoachModals";
import type { Sched, Session, MyStudent } from "./CoachModals";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function t12(time: string): string {
  const parts = time.split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return (h % 12 || 12) + ":" + String(m).padStart(2, "0") + " " + (h >= 12 ? "PM" : "AM");
}

function fmtD(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function SessionRow({
  sess, completingId, onOpenAtt, onComplete,
}: {
  sess: Session;
  completingId: string | null;
  onOpenAtt: () => void;
  onComplete: () => void;
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
        <button
          onClick={onOpenAtt}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${done ? "bg-white/5 hover:bg-white/10 text-white/40" : "bg-blue-500/15 hover:bg-blue-500/25 text-blue-400"}`}
        >
          {cnt > 0 ? "View" : "Attend"}
        </button>
        {!done && (
          <button
            onClick={onComplete}
            disabled={completingId === sess.id}
            className="px-2.5 py-1.5 bg-orange-500/15 hover:bg-orange-500/25 disabled:opacity-40 text-orange-400 text-xs font-medium rounded-lg transition-all"
          >
            {completingId === sess.id ? "…" : "Done"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CoachDashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const [scheds, setScheds] = useState<Sched[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStart, setShowStart] = useState(false);
  const [startSchedId, setStartSchedId] = useState<string | undefined>(undefined);
  const [attSession, setAttSession] = useState<Session | null>(null);
  const [myStudents, setMyStudents] = useState<MyStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [profileStudentId, setProfileStudentId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSort, setStudentSort] = useState<"name" | "attendance" | "rating">("name");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push("/login"); return; }
    if (!isLoading && user && user.role !== "COACH") {
      router.push(user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? "/dashboard/admin" : "/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  const load = useCallback(async () => {
    if (!isAuthenticated || isLoading) return;
    setLoading(true);
    setStudentsLoading(true);
    try {
      const [a, b, c] = await Promise.allSettled([
        schedulesApi.getMyCoach(),
        coachSessionsApi.getMy(),
        coachSessionsApi.getMyStudents(),
      ]);
      if (a.status === "fulfilled") setScheds((a.value.data as Sched[]) || []);
      if (b.status === "fulfilled") setSessions((b.value.data as Session[]) || []);
      if (c.status === "fulfilled") setMyStudents((c.value.data as MyStudent[]) || []);
    } finally {
      setLoading(false);
      setStudentsLoading(false);
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => { load(); }, [load]);

  const dow = new Date().getDay();
  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();

  const todayS = scheds.filter((s) => s.dayOfWeek === dow && s.isActive);

  // Meaningful stats
  const sessionsThisMonth = sessions.filter((s) => {
    const d = new Date(s.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const todayAttendance = sessions
    .filter((s) => s.date.slice(0, 10) === todayStr)
    .reduce((a, s) => a + (s._count?.attendance ?? 0), 0);

  const lowAttCount = myStudents.filter(
    (s) => s.totalSessions > 0 && s.attended / s.totalSessions < 0.6
  ).length;

  // Active (in-progress) sessions today
  const activeSessions = sessions.filter(
    (s) => s.date.slice(0, 10) === todayStr && !s.isCompleted
  );

  // History groups (excluding today)
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const historyThisWeek = sessions.filter((s) => {
    const d = new Date(s.date);
    return s.date.slice(0, 10) !== todayStr && d >= weekAgo;
  });
  const historyOlder = sessions.filter((s) => new Date(s.date) < weekAgo);

  // Students: filtered + sorted
  const filteredStudents = myStudents
    .filter((s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase())
    )
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
    return sessions.find(
      (sess) => sess.schedule?.id === schedId && sess.date?.slice(0, 10) === todayStr
    );
  }

  async function doComplete(sessionId: string) {
    if (!confirm("Mark this session as completed?")) return;
    setCompletingId(sessionId);
    try {
      await coachSessionsApi.completeSession(sessionId);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to complete session.");
    } finally {
      setCompletingId(null);
    }
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

      {/* Header */}
      <div className="bg-dark-800 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              {user.avatar
                ? <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                : <span className="text-base font-bold text-white">{user.firstName?.charAt(0) ?? "C"}</span>
              }
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Coach {user.firstName}</h1>
              <p className="text-white/40 text-xs">{DAYS_FULL[dow]}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-xs text-white/30 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all"
          >
            Sign out
          </button>
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
                  {activeSessions.map((s) => s.schedule?.program?.name ?? "Session").join(" · ")}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {activeSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setAttSession(s)}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-lg transition-all"
                >
                  Open {s.schedule?.program?.name ?? "Session"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats — meaningful numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            { icon: "📅", label: "This Month", value: sessionsThisMonth, sub: "sessions run", grad: "from-blue-500/15", valCls: "text-white" },
            { icon: "✅", label: "Today", value: todayAttendance, sub: "attendance logged", grad: "from-emerald-500/15", valCls: "text-white" },
            { icon: "⚠️", label: "Need Attention", value: lowAttCount, sub: "below 60% attendance", grad: lowAttCount > 0 ? "from-orange-500/15" : "from-white/5", valCls: lowAttCount > 0 ? "text-orange-400" : "text-white/40" },
            { icon: "👥", label: "My Students", value: myStudents.length, sub: "on roster", grad: "from-purple-500/15", valCls: "text-white" },
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

        {/* Today's Classes — hero section, single entry point to start */}
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
              {[1, 2].map((i) => <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : todayS.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">🌙</div>
              <p className="text-white/40 text-sm font-medium">No classes scheduled today</p>
              <p className="text-white/25 text-xs mt-1">Check your weekly schedule on the right</p>
              <button
                onClick={() => { setStartSchedId(undefined); setShowStart(true); }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Start Unscheduled Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {todayS.map((s) => {
                const inProgress = findTodaySession(s.id);
                const isCompleted = inProgress?.isCompleted === true;
                return (
                  <div
                    key={s.id}
                    className={`p-4 rounded-xl border ${
                      isCompleted
                        ? "bg-white/3 border-white/5 opacity-60"
                        : inProgress
                          ? "bg-emerald-500/10 border-emerald-500/25"
                          : "bg-blue-500/5 border-blue-500/15"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{s.program?.icon ?? "⚽"}</span>
                          <span className="text-white font-bold text-sm">{s.program?.name ?? "Program"}</span>
                        </div>
                        {inProgress?.className && (
                          <div className="text-white/40 text-xs mt-0.5 pl-7">{inProgress.className}</div>
                        )}
                      </div>
                      {isCompleted ? (
                        <span className="text-xs bg-white/8 text-white/35 px-2 py-0.5 rounded-full flex-shrink-0">✓ Done</span>
                      ) : inProgress ? (
                        <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex-shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
                        </span>
                      ) : null}
                    </div>
                    <div className="text-white/40 text-xs mb-1">🕐 {t12(s.startTime)} – {t12(s.endTime)}</div>
                    {s.location && (
                      <div className="text-white/30 text-xs mb-3">📍 {s.location.name}{s.location.city ? `, ${s.location.city}` : ""}</div>
                    )}
                    {isCompleted ? (
                      <div className="w-full py-2 bg-white/5 text-white/25 text-xs font-medium rounded-lg text-center">
                        Session completed
                      </div>
                    ) : inProgress ? (
                      <button
                        onClick={() => setAttSession(inProgress)}
                        className="w-full py-2 bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-300 text-sm font-semibold rounded-lg transition-colors"
                      >
                        Open Attendance
                      </button>
                    ) : (
                      <button
                        onClick={() => { setStartSchedId(s.id); setShowStart(true); }}
                        className="w-full py-2 bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 text-sm font-semibold rounded-lg transition-colors"
                      >
                        Start This Class
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Main grid: students (primary) + weekly schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Students — moved to primary position */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>👥</span> My Students
                  {!studentsLoading && (
                    <span className="text-xs text-white/30 font-normal">({myStudents.length})</span>
                  )}
                </h2>
                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-dark-900 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-blue-500/40 w-28"
                  />
                  <select
                    value={studentSort}
                    onChange={(e) => setStudentSort(e.target.value as typeof studentSort)}
                    className="px-2 py-1.5 rounded-lg bg-dark-900 border border-white/10 text-white/60 text-xs focus:outline-none"
                  >
                    <option value="name">A–Z</option>
                    <option value="attendance">Low attendance</option>
                    <option value="rating">Top rated</option>
                  </select>
                </div>
              </div>

              {studentsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-white/30">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="text-sm">{studentSearch ? "No students match your search" : "No students enrolled in your programs yet"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredStudents.map((stu) => {
                    const rate = stu.totalSessions > 0
                      ? Math.round((stu.attended / stu.totalSessions) * 100)
                      : null;
                    const isLow = rate !== null && rate < 60;
                    const isWarn = rate !== null && rate >= 60 && rate < 80;
                    return (
                      <div
                        key={stu.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isLow
                            ? "bg-red-500/5 border-red-500/20"
                            : isWarn
                              ? "bg-orange-500/5 border-orange-500/15"
                              : "bg-white/3 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="relative flex-shrink-0">
                            {stu.photo
                              ? <img src={stu.photo} alt={stu.firstName} className="w-10 h-10 rounded-full object-cover border border-white/10" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">{stu.firstName.charAt(0)}</div>
                            }
                            {isLow && <span className="absolute -top-1 -right-1 text-[10px]">🔴</span>}
                            {isWarn && <span className="absolute -top-1 -right-1 text-[10px]">🟡</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-semibold truncate">{stu.firstName} {stu.lastName}</div>
                            {stu.programs.length > 0 && (
                              <div className="text-white/35 text-xs truncate">{stu.programs.join(", ")}</div>
                            )}
                          </div>
                          {stu.avgRating != null && (
                            <div className="flex gap-0.5 flex-shrink-0">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <span key={n} className={n <= Math.round(stu.avgRating!) ? "text-yellow-400" : "text-white/15"} style={{ fontSize: 10 }}>★</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Attendance progress bar */}
                        {rate !== null ? (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-semibold ${isLow ? "text-red-400" : isWarn ? "text-orange-400" : "text-emerald-400"}`}>
                                {rate}% attendance
                              </span>
                              <span className="text-white/25 text-[10px]">{stu.attended}/{stu.totalSessions} sessions</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isLow ? "bg-red-500" : isWarn ? "bg-orange-400" : "bg-emerald-400"}`}
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-white/25 text-xs mb-3">No sessions yet</div>
                        )}

                        <button
                          onClick={() => setProfileStudentId(stu.id)}
                          className="w-full py-1.5 bg-white/5 hover:bg-purple-600/20 hover:text-purple-300 text-white/40 text-xs font-medium rounded-lg transition-all"
                        >
                          View Profile
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Weekly schedule */}
          <div className="glass-card p-6 h-fit">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span>🗓️</span> Weekly Schedule
            </h2>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}
              </div>
            ) : scheds.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-4">No schedules assigned</p>
            ) : (
              <div className="space-y-2">
                {[...scheds].sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg ${s.dayOfWeek === dow ? "bg-blue-500/15 border border-blue-500/20" : "bg-white/3"}`}
                  >
                    <span className={`text-xs font-bold w-8 text-center flex-shrink-0 ${s.dayOfWeek === dow ? "text-blue-400" : "text-white/30"}`}>
                      {DAYS[s.dayOfWeek]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs font-medium truncate">{s.program?.name ?? "Program"}</div>
                      <div className="text-white/40 text-xs">{t12(s.startTime)} – {t12(s.endTime)}</div>
                      {s.location && <div className="text-white/25 text-xs truncate">📍 {s.location.name}</div>}
                    </div>
                    {s.dayOfWeek === dow && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full flex-shrink-0">Today</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Session History — collapsed by default */}
        <div className="glass-card overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-all text-left"
          >
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
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-sm">No session history yet</p>
                </div>
              ) : (
                <>
                  {historyThisWeek.length > 0 && (
                    <div className="pt-4">
                      <div className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">This Week</div>
                      <div className="space-y-2">
                        {historyThisWeek.map((sess) => (
                          <SessionRow
                            key={sess.id}
                            sess={sess}
                            completingId={completingId}
                            onOpenAtt={() => setAttSession(sess)}
                            onComplete={() => doComplete(sess.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {historyOlder.length > 0 && (
                    <div className={historyThisWeek.length > 0 ? "border-t border-white/5 pt-4" : "pt-4"}>
                      <div className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">Older</div>
                      <div className="space-y-2">
                        {historyOlder.map((sess) => (
                          <SessionRow
                            key={sess.id}
                            sess={sess}
                            completingId={completingId}
                            onOpenAtt={() => setAttSession(sess)}
                            onComplete={() => doComplete(sess.id)}
                          />
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
        <StartSessionModal
          scheds={scheds}
          initialScheduleId={startSchedId}
          onClose={() => setShowStart(false)}
          onSuccess={() => { setShowStart(false); load(); }}
        />
      )}
      {attSession && (
        <AttendanceModal
          session={attSession}
          onClose={() => setAttSession(null)}
          onSuccess={() => { load(); }}
        />
      )}
      {profileStudentId && (
        <StudentProfileModal
          studentId={profileStudentId}
          onClose={() => setProfileStudentId(null)}
        />
      )}
    </div>
  );
}
