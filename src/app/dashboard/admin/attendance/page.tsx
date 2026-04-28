"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

interface AttendanceRecord {
  id: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  date?: string;
  notes?: string;
  student?: { firstName: string; lastName: string };
  coach?: { firstName: string; lastName: string };
  schedule?: { dayOfWeek: number | string; startTime: string; program?: { name: string } };
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  PRESENT: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  ABSENT: "bg-red-500/10 text-red-400 border-red-500/20",
  LATE: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  EXCUSED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const STATUS_ICONS: Record<string, string> = {
  PRESENT: "✅",
  ABSENT: "❌",
  LATE: "⏰",
  EXCUSED: "📋",
};

export default function AdminAttendancePage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  const fetchAttendance = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/attendance`, {
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data.data || []);
      } else {
        setError("Failed to load attendance records");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const filtered = filter === "ALL" ? records : records.filter((r) => r.status === filter);

  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;
  const lateCount = records.filter((r) => r.status === "LATE").length;
  const rate = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;

  if (isLoading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">📊 Attendance</h1>
              <p className="text-white/40 text-sm">{records.length} total records</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5">
            <div className="text-3xl font-black text-lebanon-green">{rate}%</div>
            <div className="text-white/40 text-xs mt-1">📈 Attendance Rate</div>
          </div>
          <div className="glass-card p-5">
            <div className="text-3xl font-black text-emerald-400">{presentCount}</div>
            <div className="text-white/40 text-xs mt-1">✅ Present</div>
          </div>
          <div className="glass-card p-5">
            <div className="text-3xl font-black text-red-400">{absentCount}</div>
            <div className="text-white/40 text-xs mt-1">❌ Absent</div>
          </div>
          <div className="glass-card p-5">
            <div className="text-3xl font-black text-yellow-400">{lateCount}</div>
            <div className="text-white/40 text-xs mt-1">⏰ Late</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["ALL", "PRESENT", "ABSENT", "LATE", "EXCUSED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === s
                  ? "bg-lebanon-green text-white"
                  : "bg-dark-800 text-white/50 hover:text-white border border-white/10"
              }`}
            >
              {STATUS_ICONS[s] || "📋"} {s}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-white/40">No attendance records found</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Student</th>
                    <th className="text-left px-6 py-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Program</th>
                    <th className="text-left px-6 py-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Coach</th>
                    <th className="text-left px-6 py-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 text-white text-sm font-medium">
                        {r.student ? `${r.student.firstName} ${r.student.lastName}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {r.schedule?.program?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {r.coach ? `${r.coach.firstName} ${r.coach.lastName}` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[r.status] || ""}`}>
                          {STATUS_ICONS[r.status]} {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/40 text-xs">
                        {r.date ? new Date(r.date).toLocaleDateString() : new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-white/40 text-xs max-w-xs truncate">
                        {r.notes || "—"}
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
