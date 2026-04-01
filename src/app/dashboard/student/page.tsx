"use client";

/**
 * Student Dashboard — Cedars Sport Academy
 * Dashboard for STUDENT role users.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { schedulesApi } from "@/lib/api";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface LiveSchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  program?: { id: string; name: string; icon?: string; image?: string };
  location?: { id: string; name: string; city?: string };
}

function fmt12(t: string): string {
  const parts = t.split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return (h % 12 || 12) + ":" + String(m).padStart(2, "0") + " " + (h >= 12 ? "PM" : "AM");
}

export default function StudentDashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<LiveSchedule[]>([]);
  const [schedLoading, setSchedLoading] = useState(true);
  const dow = new Date().getDay();

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    schedulesApi.getMyStudent()
      .then((res) => setSchedules((res.data as LiveSchedule[]) || []))
      .catch(() => setSchedules([]))
      .finally(() => setSchedLoading(false));
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isLoading && user && user.role !== "STUDENT") {
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        router.push("/dashboard/admin");
      } else if (user.role === "COACH") {
        router.push("/dashboard/coach");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/30 to-purple-700/30 flex items-center justify-center text-2xl">
              🏆
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">
                Athlete Portal
              </h1>
              <p className="text-white/40 text-sm">
                Welcome, <span className="text-purple-400 font-semibold">{user.firstName} {user.lastName}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
              🌐 View Site
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats — derived from live schedule data */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {schedLoading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-5">
                <div className="h-8 w-8 bg-white/10 rounded-lg animate-pulse mb-2" />
                <div className="h-7 w-12 bg-white/10 rounded animate-pulse mb-1" />
                <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
              </div>
            ))
          ) : (
            [
              {
                label: "Programs Enrolled",
                value: new Set(schedules.filter(s => s.program && s.isActive).map(s => s.program!.id)).size,
                icon: "📋",
                color: "text-purple-400",
              },
              {
                label: "Weekly Classes",
                value: schedules.filter(s => s.isActive).length,
                icon: "📅",
                color: "text-blue-400",
              },
              {
                label: "Today's Classes",
                value: schedules.filter(s => s.isActive && s.dayOfWeek === dow).length,
                icon: "✅",
                color: "text-emerald-400",
              },
              {
                label: "Locations",
                value: new Set(schedules.filter(s => s.location).map(s => s.location!.id)).size,
                icon: "📍",
                color: "text-yellow-400",
              },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-5">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className={"text-2xl font-black " + stat.color}>{stat.value}</div>
                <div className="text-white/40 text-xs mt-1">{stat.label}</div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Programs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                📋 My Programs
                {!schedLoading && (
                  <span className="ml-auto text-xs text-white/30 font-normal">
                    {Array.from(new Set(schedules.filter(s => s.program).map(s => s.program!.id))).length} enrolled
                  </span>
                )}
              </h2>
              {schedLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}
                </div>
              ) : schedules.filter(s => s.program && s.isActive).length === 0 ? (
                <div className="py-8 text-center text-white/30 text-sm">
                  You are not enrolled in any programs yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.from(
                    new Map(
                      schedules.filter(s => s.program && s.isActive).map(s => [s.program!.id, s.program!])
                    ).values()
                  ).map((prog) => {
                    const progSchedules = schedules.filter(s => s.program?.id === prog.id && s.isActive);
                    const days = progSchedules.map(s => DAY_NAMES[s.dayOfWeek]).join(" / ");
                    const times = progSchedules.length > 0 ? fmt12(progSchedules[0].startTime) : "";
                    const loc = progSchedules[0]?.location;
                    return (
                      <div key={prog.id} className="p-4 rounded-xl bg-dark-800 border border-white/5 hover:border-purple-500/20 transition-all">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-white font-semibold text-sm">
                              {prog.icon && <span className="mr-1">{prog.icon}</span>}
                              {prog.name}
                            </div>
                            {days && <div className="text-purple-400 text-xs mt-1">{days}{times ? ` · ${times}` : ""}</div>}
                            {loc && <div className="text-white/30 text-xs mt-0.5">{loc.name}{loc.city ? ` — ${loc.city}` : ""}</div>}
                          </div>
                          <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium flex-shrink-0">Active</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Link href="/programs" className="mt-4 block text-center text-purple-400 text-sm hover:underline">
                Browse more programs →
              </Link>
            </div>

            {/* Weekly Schedule */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                🗓️ Weekly Schedule
                {!schedLoading && schedules.length > 0 && (
                  <span className="ml-auto text-xs text-white/30 font-normal">{schedules.filter(s => s.isActive).length} classes/week</span>
                )}
              </h2>
              {schedLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : schedules.filter(s => s.isActive).length === 0 ? (
                <div className="py-8 text-center text-white/30 text-sm">No scheduled classes found.</div>
              ) : (
                <div className="space-y-2">
                  {[...schedules]
                    .filter(s => s.isActive)
                    .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                    .map((s) => (
                      <div
                        key={s.id}
                        className={"flex items-center gap-3 p-3 rounded-xl border transition-all " + (s.dayOfWeek === dow ? "bg-purple-500/10 border-purple-500/20" : "bg-white/3 border-white/5")}
                      >
                        <span className={"text-xs font-bold w-8 text-center flex-shrink-0 " + (s.dayOfWeek === dow ? "text-purple-400" : "text-white/30")}>
                          {DAY_NAMES[s.dayOfWeek]}
                        </span>
                        <span className="text-lg flex-shrink-0">{s.program?.icon ?? "⚽"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{s.program?.name ?? "Program"}</div>
                          <div className="text-white/40 text-xs">{fmt12(s.startTime)} – {fmt12(s.endTime)}{s.location ? " · " + s.location.name : ""}</div>
                        </div>
                        {s.dayOfWeek === dow && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full flex-shrink-0">Today</span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Today's Classes */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                📅 Today&apos;s Classes
                <span className="ml-2 text-xs text-white/30 font-normal">{DAY_NAMES[dow]}</span>
              </h2>
              {schedLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : schedules.filter(s => s.isActive && s.dayOfWeek === dow).length === 0 ? (
                <div className="py-6 text-center text-white/30">
                  <div className="text-3xl mb-2">🌙</div>
                  <p className="text-sm">No classes today</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {schedules.filter(s => s.isActive && s.dayOfWeek === dow).map((s) => (
                    <div key={s.id} className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <span>{s.program?.icon ?? "⚽"}</span>
                        <span className="text-white font-semibold text-sm">{s.program?.name ?? "Program"}</span>
                      </div>
                      <div className="text-white/50 text-xs mt-0.5">{fmt12(s.startTime)} – {fmt12(s.endTime)}</div>
                      {s.location && <div className="text-white/30 text-xs mt-0.5">📍 {s.location.name}{s.location.city ? ", " + s.location.city : ""}</div>}
                    </div>
                  ))}
                </div>
              )}
              <Link href="/achievements" className="mt-4 block text-center text-yellow-400 text-xs hover:underline">
                View achievements →
              </Link>
            </div>

            {/* Quick Links */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-4">⚡ Quick Links</h2>
              <div className="space-y-2">
                {[
                  { label: "View Schedule", href: "/programs", icon: "📅" },
                  { label: "Academy News", href: "/news", icon: "📰" },
                  { label: "Gallery", href: "/gallery", icon: "🖼️" },
                  { label: "Contact Us", href: "/contact", icon: "📞" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-3 p-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/5 hover:border-purple-500/20 transition-all group"
                  >
                    <span className="text-base">{link.icon}</span>
                    <span className="text-white/70 group-hover:text-white text-sm transition-colors">{link.label}</span>
                    <span className="ml-auto text-white/20 group-hover:text-purple-400 transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
