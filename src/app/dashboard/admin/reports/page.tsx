"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

interface DashboardStats {
  totalStudents: number;
  totalCoaches: number;
  totalPrograms: number;
  totalLocations: number;
  activeEnrollments: number;
  totalRevenue: number;
  pendingPayments: number;
  unreadMessages: number;
}

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: string;
}

interface RevenueSummary {
  totalRevenue: number;
  totalTransactions: number;
  byType: Record<string, number>;
}

interface EnrollmentSummary {
  total: number;
  active: number;
  inactive: number;
}

interface QuarterlyRating {
  student: { id: string; firstName: string; lastName: string };
  total: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
  rating: "GREEN" | "YELLOW" | "RED";
}

interface QuarterlyReport {
  quarter: string;
  quarterStart: string;
  ratings: QuarterlyRating[];
  summary: { green: number; yellow: number; red: number };
}

interface DashboardIndicators {
  red: { count: number; label: string; overdue: number };
  yellow: { count: number; label: string };
  green: { label: string; isAllClear: boolean };
}

type ReportTab = "overview" | "attendance" | "revenue" | "enrollments" | "quarterly" | "indicators";

export default function AdminReportsPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentSummary | null>(null);
  const [quarterly, setQuarterly] = useState<QuarterlyReport | null>(null);
  const [indicators, setIndicators] = useState<DashboardIndicators | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const hdrs = { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT };
    try {
      const [r1, r2, r3, r4, r5, r6] = await Promise.all([
        fetch(`${API}/reports/dashboard`, { headers: hdrs }),
        fetch(`${API}/reports/attendance`, { headers: hdrs }),
        fetch(`${API}/reports/revenue`, { headers: hdrs }),
        fetch(`${API}/reports/enrollments`, { headers: hdrs }),
        fetch(`${API}/reports/quarterly`, { headers: hdrs }),
        fetch(`${API}/reports/indicators`, { headers: hdrs }),
      ]);
      if (r1.ok) { const d = await r1.json(); setStats(d.data); }
      if (r2.ok) { const d = await r2.json(); setAttendance(d.data?.summary); }
      if (r3.ok) { const d = await r3.json(); setRevenue(d.data?.summary); }
      if (r4.ok) { const d = await r4.json(); setEnrollments(d.data?.summary); }
      if (r5.ok) { const d = await r5.json(); setQuarterly(d.data); }
      if (r6.ok) { const d = await r6.json(); setIndicators(d.data); }
    } catch {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const TABS: { key: ReportTab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "attendance", label: "Attendance", icon: "📋" },
    { key: "revenue", label: "Revenue", icon: "💰" },
    { key: "enrollments", label: "Enrollments", icon: "📝" },
    { key: "quarterly", label: "Quarterly", icon: "🏆" },
    { key: "indicators", label: "Indicators", icon: "🚦" },
  ];

  if (isLoading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">📈 Reports & Analytics</h1>
              <p className="text-white/40 text-sm">Academy performance overview</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.key
                  ? "bg-lebanon-green text-white"
                  : "bg-dark-800 text-white/50 hover:text-white border border-white/10"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse h-24" />
            ))}
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-5">
                    <div className="text-3xl font-black text-blue-400">{stats.totalStudents}</div>
                    <div className="text-white/40 text-xs mt-1">👥 Active Students</div>
                  </div>
                  <div className="glass-card p-5">
                    <div className="text-3xl font-black text-purple-400">{stats.totalCoaches}</div>
                    <div className="text-white/40 text-xs mt-1">🏅 Active Coaches</div>
                  </div>
                  <div className="glass-card p-5">
                    <div className="text-3xl font-black text-lebanon-green">{stats.totalPrograms}</div>
                    <div className="text-white/40 text-xs mt-1">📋 Programs</div>
                  </div>
                  <div className="glass-card p-5">
                    <div className="text-3xl font-black text-orange-400">{stats.totalLocations}</div>
                    <div className="text-white/40 text-xs mt-1">📍 Locations</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-5">
                    <div className="text-3xl font-black text-cyan-400">{stats.activeEnrollments}</div>
                    <div className="text-white/40 text-xs mt-1">📝 Active Enrollments</div>
                  </div>
                  <div className="glass-card p-5">
                    <div className="text-3xl font-black text-emerald-400">{stats.totalRevenue.toLocaleString()} QAR</div>
                    <div className="text-white/40 text-xs mt-1">💰 Total Revenue</div>
                  </div>
                  <div className="glass-card p-5">
                    <div className="text-3xl font-black text-yellow-400">{stats.pendingPayments}</div>
                    <div className="text-white/40 text-xs mt-1">⏳ Pending Payments</div>
                  </div>
                  <div className="glass-card p-5">
                    <div className="text-3xl font-black text-red-400">{stats.unreadMessages}</div>
                    <div className="text-white/40 text-xs mt-1">✉️ Unread Messages</div>
                  </div>
                </div>

                {/* Quick links to sub-reports */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { tab: "attendance" as ReportTab, icon: "📋", label: "Attendance Report", desc: "Track student presence rates" },
                    { tab: "revenue" as ReportTab, icon: "💰", label: "Revenue Report", desc: "Payment collection analysis" },
                    { tab: "enrollments" as ReportTab, icon: "📝", label: "Enrollment Report", desc: "Program enrollment stats" },
                  ].map((item) => (
                    <button
                      key={item.tab}
                      onClick={() => setActiveTab(item.tab)}
                      className="glass-card p-5 text-left hover:border-lebanon-green/20 transition-all"
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-white font-bold text-sm">{item.label}</div>
                      <div className="text-white/40 text-xs mt-1">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ATTENDANCE TAB */}
            {activeTab === "attendance" && (
              <div className="space-y-6">
                {attendance ? (
                  <>
                    <div className="glass-card p-6">
                      <h3 className="text-white font-bold mb-4">Attendance Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-dark-800 rounded-xl p-4 text-center">
                          <div className="text-3xl font-black text-lebanon-green">{attendance.attendanceRate}%</div>
                          <div className="text-white/40 text-xs mt-1">Attendance Rate</div>
                        </div>
                        <div className="bg-dark-800 rounded-xl p-4 text-center">
                          <div className="text-3xl font-black text-white">{attendance.total}</div>
                          <div className="text-white/40 text-xs mt-1">Total Records</div>
                        </div>
                        <div className="bg-dark-800 rounded-xl p-4 text-center">
                          <div className="text-3xl font-black text-emerald-400">{attendance.present}</div>
                          <div className="text-white/40 text-xs mt-1">Present</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-dark-800 rounded-xl p-4 text-center">
                          <div className="text-2xl font-black text-red-400">{attendance.absent}</div>
                          <div className="text-white/40 text-xs mt-1">Absent</div>
                        </div>
                        <div className="bg-dark-800 rounded-xl p-4 text-center">
                          <div className="text-2xl font-black text-yellow-400">{attendance.late}</div>
                          <div className="text-white/40 text-xs mt-1">Late</div>
                        </div>
                        <div className="bg-dark-800 rounded-xl p-4 text-center">
                          <div className="text-2xl font-black text-blue-400">{attendance.excused}</div>
                          <div className="text-white/40 text-xs mt-1">Excused</div>
                        </div>
                      </div>
                    </div>

                    {/* Visual bar */}
                    {attendance.total > 0 && (
                      <div className="glass-card p-6">
                        <h3 className="text-white font-bold mb-4">Distribution</h3>
                        <div className="space-y-3">
                          {[
                            { label: "Present", count: attendance.present, color: "bg-emerald-500" },
                            { label: "Absent", count: attendance.absent, color: "bg-red-500" },
                            { label: "Late", count: attendance.late, color: "bg-yellow-500" },
                            { label: "Excused", count: attendance.excused, color: "bg-blue-500" },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center gap-3">
                              <div className="w-20 text-white/60 text-sm">{item.label}</div>
                              <div className="flex-1 bg-dark-800 rounded-full h-3 overflow-hidden">
                                <div
                                  className={`h-full ${item.color} rounded-full transition-all`}
                                  style={{ width: `${(item.count / attendance.total) * 100}%` }}
                                />
                              </div>
                              <div className="w-10 text-white/40 text-xs text-right">{item.count}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="glass-card p-12 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-white/40">No attendance data available</p>
                  </div>
                )}
              </div>
            )}

            {/* REVENUE TAB */}
            {activeTab === "revenue" && (
              <div className="space-y-6">
                {revenue ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="glass-card p-6">
                        <div className="text-4xl font-black text-emerald-400 mb-1">
                          {revenue.totalRevenue.toLocaleString()} QAR
                        </div>
                        <div className="text-white/40 text-sm">Total Revenue Collected</div>
                      </div>
                      <div className="glass-card p-6">
                        <div className="text-4xl font-black text-white mb-1">{revenue.totalTransactions}</div>
                        <div className="text-white/40 text-sm">Total Transactions</div>
                      </div>
                    </div>

                    {revenue.byType && Object.keys(revenue.byType).length > 0 && (
                      <div className="glass-card p-6">
                        <h3 className="text-white font-bold mb-4">Revenue by Type</h3>
                        <div className="space-y-3">
                          {Object.entries(revenue.byType).map(([type, amount]) => (
                            <div key={type} className="flex items-center justify-between p-3 bg-dark-800 rounded-xl">
                              <span className="text-white/70 text-sm capitalize">{type.toLowerCase()}</span>
                              <span className="text-emerald-400 font-bold">{Number(amount).toLocaleString()} QAR</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="glass-card p-12 text-center">
                    <div className="text-4xl mb-3">💰</div>
                    <p className="text-white/40">No revenue data available</p>
                  </div>
                )}
              </div>
            )}

            {/* QUARTERLY TAB */}
            {activeTab === "quarterly" && (
              <div className="space-y-6">
                {quarterly ? (
                  <>
                    {/* Quarter header + summary pills */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="glass-card px-5 py-3 flex items-center gap-2">
                        <span className="text-white/40 text-sm">Quarter:</span>
                        <span className="text-white font-bold">{quarterly.quarter}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-sm font-semibold border border-emerald-500/20">
                          🟢 {quarterly.summary.green} Green
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-yellow-500/15 text-yellow-400 text-sm font-semibold border border-yellow-500/20">
                          🟡 {quarterly.summary.yellow} Yellow
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 text-sm font-semibold border border-red-500/20">
                          🔴 {quarterly.summary.red} Red
                        </span>
                      </div>
                    </div>

                    {quarterly.ratings.length === 0 ? (
                      <div className="glass-card p-12 text-center">
                        <div className="text-4xl mb-3">🏆</div>
                        <p className="text-white/40">No attendance records for this quarter yet</p>
                      </div>
                    ) : (
                      <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-white/5">
                                <th className="text-left px-6 py-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Student</th>
                                <th className="text-center px-4 py-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Sessions</th>
                                <th className="text-center px-4 py-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Present</th>
                                <th className="text-center px-4 py-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Absent</th>
                                <th className="text-center px-4 py-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Late</th>
                                <th className="text-center px-4 py-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Rate</th>
                                <th className="text-center px-4 py-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Rating</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {quarterly.ratings.map((r) => (
                                <tr key={r.student.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="px-6 py-3">
                                    <div className="text-white text-sm font-medium">
                                      {r.student.firstName} {r.student.lastName}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center text-white/60 text-sm">{r.total}</td>
                                  <td className="px-4 py-3 text-center text-emerald-400 text-sm font-medium">{r.present}</td>
                                  <td className="px-4 py-3 text-center text-red-400 text-sm font-medium">{r.absent}</td>
                                  <td className="px-4 py-3 text-center text-yellow-400 text-sm font-medium">{r.late}</td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="w-16 bg-dark-800 rounded-full h-1.5 overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${r.attendanceRate >= 80 ? "bg-emerald-500" : r.attendanceRate >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                                          style={{ width: `${r.attendanceRate}%` }}
                                        />
                                      </div>
                                      <span className="text-white/60 text-xs w-8">{r.attendanceRate}%</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {r.rating === "GREEN" && <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs border border-emerald-500/20">🟢 Good</span>}
                                    {r.rating === "YELLOW" && <span className="px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 text-xs border border-yellow-500/20">🟡 Fair</span>}
                                    {r.rating === "RED" && <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-xs border border-red-500/20">🔴 At Risk</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="glass-card p-12 text-center">
                    <div className="text-4xl mb-3">🏆</div>
                    <p className="text-white/40">No quarterly data available</p>
                  </div>
                )}
              </div>
            )}

            {/* INDICATORS TAB */}
            {activeTab === "indicators" && (
              <div className="space-y-6">
                {indicators ? (
                  <>
                    {/* All-clear banner */}
                    {indicators.green.isAllClear && (
                      <div className="glass-card p-5 border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-4">
                        <div className="text-3xl">✅</div>
                        <div>
                          <div className="text-emerald-400 font-bold">All Clear</div>
                          <div className="text-white/40 text-sm">No outstanding payments or session warnings</div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* RED */}
                      <div className={`glass-card p-6 border ${indicators.red.count > 0 ? "border-red-500/30 bg-red-500/5" : "border-white/5"}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl">🔴</div>
                          <div>
                            <div className="text-white font-bold">Red Alert</div>
                            <div className="text-white/40 text-xs">{indicators.red.label}</div>
                          </div>
                        </div>
                        <div className="text-4xl font-black text-red-400 mb-1">{indicators.red.count}</div>
                        <div className="text-white/40 text-xs">Unpaid / Pending</div>
                        {indicators.red.overdue > 0 && (
                          <div className="mt-3 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                            ⚠️ {indicators.red.overdue} overdue
                          </div>
                        )}
                      </div>

                      {/* YELLOW */}
                      <div className={`glass-card p-6 border ${indicators.yellow.count > 0 ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/5"}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-xl">🟡</div>
                          <div>
                            <div className="text-white font-bold">Warning</div>
                            <div className="text-white/40 text-xs">{indicators.yellow.label}</div>
                          </div>
                        </div>
                        <div className="text-4xl font-black text-yellow-400 mb-1">{indicators.yellow.count}</div>
                        <div className="text-white/40 text-xs">Enrollments ≤1 session left</div>
                      </div>

                      {/* GREEN */}
                      <div className={`glass-card p-6 border ${indicators.green.isAllClear ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5"}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">🟢</div>
                          <div>
                            <div className="text-white font-bold">Status</div>
                            <div className="text-white/40 text-xs">{indicators.green.label}</div>
                          </div>
                        </div>
                        <div className={`text-4xl font-black mb-1 ${indicators.green.isAllClear ? "text-emerald-400" : "text-white/30"}`}>
                          {indicators.green.isAllClear ? "✓" : "—"}
                        </div>
                        <div className="text-white/40 text-xs">
                          {indicators.green.isAllClear ? "All payments & sessions OK" : "Issues require attention"}
                        </div>
                      </div>
                    </div>

                    {/* Action links */}
                    {(indicators.red.count > 0 || indicators.yellow.count > 0) && (
                      <div className="glass-card p-5">
                        <h3 className="text-white font-bold mb-3 text-sm">Recommended Actions</h3>
                        <div className="space-y-2">
                          {indicators.red.count > 0 && (
                            <a href="/dashboard/admin/payments" className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-all">
                              <span className="text-red-400">💳</span>
                              <span className="text-white/70 text-sm">Review {indicators.red.count} unpaid payment{indicators.red.count !== 1 ? "s" : ""} →</span>
                            </a>
                          )}
                          {indicators.yellow.count > 0 && (
                            <a href="/dashboard/admin/students" className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 hover:border-yellow-500/30 transition-all">
                              <span className="text-yellow-400">📋</span>
                              <span className="text-white/70 text-sm">{indicators.yellow.count} student{indicators.yellow.count !== 1 ? "s" : ""} need session renewal →</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="glass-card p-12 text-center">
                    <div className="text-4xl mb-3">🚦</div>
                    <p className="text-white/40">No indicator data available</p>
                  </div>
                )}
              </div>
            )}

            {/* ENROLLMENTS TAB */}
            {activeTab === "enrollments" && (
              <div className="space-y-6">
                {enrollments ? (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="glass-card p-6 text-center">
                        <div className="text-4xl font-black text-white mb-1">{enrollments.total}</div>
                        <div className="text-white/40 text-sm">Total Enrollments</div>
                      </div>
                      <div className="glass-card p-6 text-center">
                        <div className="text-4xl font-black text-emerald-400 mb-1">{enrollments.active}</div>
                        <div className="text-white/40 text-sm">Active</div>
                      </div>
                      <div className="glass-card p-6 text-center">
                        <div className="text-4xl font-black text-red-400 mb-1">{enrollments.inactive}</div>
                        <div className="text-white/40 text-sm">Inactive</div>
                      </div>
                    </div>

                    {enrollments.total > 0 && (
                      <div className="glass-card p-6">
                        <h3 className="text-white font-bold mb-4">Enrollment Health</h3>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1 bg-dark-800 rounded-full h-4 overflow-hidden flex">
                            <div
                              className="h-full bg-emerald-500 transition-all"
                              style={{ width: `${(enrollments.active / enrollments.total) * 100}%` }}
                            />
                            <div
                              className="h-full bg-red-500 transition-all"
                              style={{ width: `${(enrollments.inactive / enrollments.total) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs text-white/40">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Active ({Math.round((enrollments.active / enrollments.total) * 100)}%)</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Inactive ({Math.round((enrollments.inactive / enrollments.total) * 100)}%)</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="glass-card p-12 text-center">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="text-white/40">No enrollment data available</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
