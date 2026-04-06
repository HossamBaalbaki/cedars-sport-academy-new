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
  const todayS = scheds.filter((s) => s.dayOfWeek === dow && s.isActive);
  const totalAtt = sessions.reduce((a, s) => a + (s._count?.attendance ?? 0), 0);
  const progCount = new Set(sessions.map((s) => s.schedule?.program?.id).filter(Boolean)).size;

  function findTodaySession(schedId: string): Session | undefined {
    return sessions.find(
      (sess) => sess.schedule?.id === schedId && sess.date?.slice(0, 10) === todayStr
    );
  }

  async function doComplete(sessionId: string) {
    if (!confirm("Mark this session as completed? It will be removed from your active list.")) return;
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
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white">
              {user.firstName?.charAt(0) ?? "C"}
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Coach {user.firstName}</h1>
              <p className="text-white/40 text-xs">{DAYS_FULL[dow]} — Coach Dashboard</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setStartSchedId(undefined); setShowStart(true); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Start Session
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-sm rounded-xl transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {([
            ["📅", "Today's Classes", todayS.length, "from-blue-500/20"],
            ["🎯", "Total Sessions", sessions.length, "from-purple-500/20"],
            ["✅", "Attendance Logged", totalAtt, "from-emerald-500/20"],
            ["🏆", "Programs", progCount, "from-yellow-500/20"],
          ] as [string, string, number, string][]).map(([icon, label, val, grad]) => (
            <div key={label} className={"glass-card p-5 bg-gradient-to-br " + grad + " to-transparent"}>
              <div className="text-2xl mb-1">{icon}</div>
              {loading
                ? <div className="h-7 w-10 bg-white/10 rounded animate-pulse mb-1" />
                : <div className="text-2xl font-bold text-white">{val}</div>
              }
              <div className="text-white/50 text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="space-y-6">

            {/* Today's Classes */}
            <div className="glass-card p-6">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span>📅</span> Today&apos;s Classes
                <span className="ml-auto text-xs text-white/30">{DAYS[dow]}</span>
              </h2>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : todayS.length === 0 ? (
                <div className="text-center py-8 text-white/30">
                  <div className="text-3xl mb-2">🌙</div>
                  <p className="text-sm">No classes today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayS.map((s) => {
                    const inProgress = findTodaySession(s.id);
                    const isCompleted = inProgress?.isCompleted === true;
                    return (
                      <div
                        key={s.id}
                        className={"p-3 rounded-xl border " + (isCompleted
                          ? "bg-white/3 border-white/10 opacity-70"
                          : inProgress
                            ? "bg-emerald-500/10 border-emerald-500/20"
                            : "bg-blue-500/10 border-blue-500/20")}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span>{s.program?.icon ?? "⚽"}</span>
                          <span className="text-white font-semibold text-sm">
                            {s.program?.name ?? "Program"}
                            {inProgress?.className ? (
                              <span className="text-white/50 font-normal"> / {inProgress.className}</span>
                            ) : null}
                          </span>
                          {isCompleted ? (
                            <span className="ml-auto text-xs bg-white/10 text-white/40 px-2 py-0.5 rounded-full font-medium">
                              ✓ Completed
                            </span>
                          ) : inProgress ? (
                            <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                              🟢 In Progress
                            </span>
                          ) : null}
                        </div>
                        <div className="text-white/50 text-xs">{t12(s.startTime)} – {t12(s.endTime)}</div>
                        {s.location && (
                          <div className="text-white/40 text-xs mt-0.5">
                            📍 {s.location.name}{s.location.city ? ", " + s.location.city : ""}
                          </div>
                        )}
                        {isCompleted ? (
                          <div className="mt-2 w-full py-1.5 bg-white/5 text-white/30 text-xs font-medium rounded-lg text-center">
                            ✓ Session Completed
                          </div>
                        ) : inProgress ? (
                          <button
                            onClick={() => setAttSession(inProgress)}
                            className="mt-2 w-full py-1.5 bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-300 text-xs font-medium rounded-lg transition-colors"
                          >
                            Open Session
                          </button>
                        ) : (
                          <button
                            onClick={() => { setStartSchedId(s.id); setShowStart(true); }}
                            className="mt-2 w-full py-1.5 bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 text-xs font-medium rounded-lg transition-colors"
                          >
                            Start This Session
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Weekly Schedule */}
            <div className="glass-card p-6">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span>🗓️</span> Weekly Schedule
              </h2>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />)}
                </div>
              ) : scheds.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-4">No schedules assigned</p>
              ) : (
                <div className="space-y-2">
                  {[...scheds].sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((s) => (
                    <div
                      key={s.id}
                      className={"flex items-center gap-3 p-2.5 rounded-lg " + (s.dayOfWeek === dow
                        ? "bg-blue-500/15 border border-blue-500/20"
                        : "bg-white/3")}
                    >
                      <span className={"text-xs font-bold w-8 text-center flex-shrink-0 " + (s.dayOfWeek === dow ? "text-blue-400" : "text-white/30")}>
                        {DAYS[s.dayOfWeek]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate">{s.program?.name ?? "Program"}</div>
                        <div className="text-white/40 text-xs">{t12(s.startTime)} – {t12(s.endTime)}</div>
                        {s.location && (
                          <div className="text-white/30 text-xs truncate">📍 {s.location.name}</div>
                        )}
                      </div>
                      {s.dayOfWeek === dow && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full flex-shrink-0">Today</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column — Sessions list */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🎯</span> My Sessions
                </h2>
                <button
                  onClick={() => { setStartSchedId(undefined); setShowStart(true); }}
                  className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs font-medium rounded-lg transition-colors"
                >
                  + New Session
                </button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-16 text-white/30">
                  <div className="text-5xl mb-3">📋</div>
                  <p className="text-sm font-medium">No sessions yet</p>
                  <p className="text-xs mt-1">Start a session to begin taking attendance</p>
                  <button
                    onClick={() => { setStartSchedId(undefined); setShowStart(true); }}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Start First Session
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((sess) => {
                    const prog = sess.schedule?.program;
                    const loc = sess.schedule?.location;
                    const cnt = sess._count?.attendance ?? 0;
                    const done = sess.isCompleted === true;
                    return (
                      <div
                        key={sess.id}
                        className={"flex items-center gap-4 p-4 rounded-xl border transition-all " + (done
                          ? "bg-white/2 border-white/5 opacity-60"
                          : "bg-white/3 hover:bg-white/5 border-white/5 hover:border-white/10")}
                      >
                        <div className={"w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 " + (done ? "bg-white/5" : "bg-blue-500/20")}>
                          {prog?.icon ?? "⚽"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-semibold text-sm">
                              {prog?.name ?? "Session"}
                              {sess.className ? (
                                <span className="text-white/50 font-normal"> / {sess.className}</span>
                              ) : null}
                            </span>
                            {done && (
                              <span className="text-xs bg-white/10 text-white/40 px-2 py-0.5 rounded-full">
                                ✓ Completed
                              </span>
                            )}
                            {cnt > 0 && (
                              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                                {cnt} logged
                              </span>
                            )}
                          </div>
                          <div className="text-white/40 text-xs mt-0.5">
                            {fmtD(sess.date)}
                            {loc && <span> · 📍 {loc.name}</span>}
                            {sess.schedule && <span> · {t12(sess.schedule.startTime)}–{t12(sess.schedule.endTime)}</span>}
                          </div>
                          {sess.notes && (
                            <div className="text-white/30 text-xs mt-0.5 truncate">📝 {sess.notes}</div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0 items-center">
                          <button
                            onClick={() => setAttSession(sess)}
                            className={"px-3 py-1.5 text-xs font-medium rounded-lg transition-colors " + (done
                              ? "bg-white/5 hover:bg-white/10 text-white/40"
                              : "bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300")}
                          >
                            {cnt > 0 ? "View" : "Attend"}
                          </button>
                          {done ? (
                            <span className="px-3 py-1.5 bg-white/5 text-white/25 text-xs font-medium rounded-lg">
                              ✓ Done
                            </span>
                          ) : (
                            <button
                              onClick={() => doComplete(sess.id)}
                              disabled={completingId === sess.id}
                              className="px-3 py-1.5 bg-orange-600/30 hover:bg-orange-600/50 disabled:opacity-40 text-orange-300 text-xs font-medium rounded-lg transition-colors"
                              title="Mark session as completed"
                            >
                              {completingId === sess.id ? "…" : "✓ Done"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My Students Section */}
        <div className="mt-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>👥</span> My Students
                {!studentsLoading && (
                  <span className="text-xs text-white/30 font-normal">({myStudents.length})</span>
                )}
              </h2>
            </div>

            {studentsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : myStudents.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <div className="text-4xl mb-2">👥</div>
                <p className="text-sm">No students enrolled in your programs yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {myStudents.map((stu) => {
                  const rate = stu.totalSessions > 0
                    ? Math.round((stu.attended / stu.totalSessions) * 100)
                    : null;
                  return (
                    <div key={stu.id} className="p-4 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {stu.firstName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-semibold truncate">{stu.firstName} {stu.lastName}</div>
                          {stu.programs.length > 0 && (
                            <div className="text-white/40 text-xs truncate">{stu.programs.join(", ")}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <div>
                          {rate !== null ? (
                            <span className={"font-semibold " + (rate >= 80 ? "text-emerald-400" : rate >= 60 ? "text-yellow-400" : "text-red-400")}>
                              {rate}% attendance
                            </span>
                          ) : (
                            <span className="text-white/25">No sessions</span>
                          )}
                        </div>
                        {stu.avgRating != null && (
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <span
                                key={n}
                                className={n <= Math.round(stu.avgRating!) ? "text-yellow-400" : "text-white/15"}
                                style={{ fontSize: 10 }}
                              >★</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setProfileStudentId(stu.id)}
                        className="w-full py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>👁</span> View Profile
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
