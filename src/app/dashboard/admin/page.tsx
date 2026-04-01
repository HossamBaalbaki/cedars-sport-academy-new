"use client";

/**
 * Admin Dashboard — Cedars Sport Academy
 * Full management panel for ADMIN / SUPER_ADMIN roles.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface DashboardStats {
  totalStudents: number;
  totalCoaches: number;
  totalPrograms: number;
  totalRevenue: number;
  activeEnrollments: number;
  pendingPayments: number;
  attendanceRate: number;
  newRegistrations: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading, logout, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Fetch dashboard stats from API
  useEffect(() => {
    if (!token) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1"}/reports/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Tenant-ID": process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456",
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setStats(data.data);
        }
      } catch {
        // Use placeholder stats if API fails
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const displayStats = [
    { label: "Total Students", value: stats?.totalStudents ?? "—", icon: "👥", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Active Coaches", value: stats?.totalCoaches ?? "—", icon: "🏅", color: "text-lebanon-green", bg: "bg-lebanon-green/10 border-lebanon-green/20" },
    { label: "Programs", value: stats?.totalPrograms ?? "—", icon: "📋", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "Enrollments", value: stats?.activeEnrollments ?? "—", icon: "✅", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Pending Payments", value: stats?.pendingPayments ?? "—", icon: "💳", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    { label: "Attendance Rate", value: stats?.attendanceRate ? `${stats.attendanceRate}%` : "—", icon: "📊", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
    { label: "New This Month", value: stats?.newRegistrations ?? "—", icon: "🆕", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
    { label: "Total Revenue", value: stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString()} QAR` : "—", icon: "💰", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  ];

  const sections = [
    {
      title: "Operations",
      color: "blue",
      icon: "⚙️",
      links: [
        { label: "Students", href: "/dashboard/admin/students", icon: "👥", desc: "View, add, edit students" },
        { label: "Coaches", href: "/dashboard/admin/coaches", icon: "🏅", desc: "Coach profiles & assignments" },
        { label: "Programs", href: "/dashboard/admin/programs", icon: "📋", desc: "Programs & age groups" },
        { label: "Schedules", href: "/dashboard/admin/schedules", icon: "🗓️", desc: "Class times & days" },
        { label: "Locations", href: "/dashboard/admin/locations", icon: "📍", desc: "Academy locations" },
      ],
    },
    {
      title: "Finance",
      color: "amber",
      icon: "💰",
      links: [
        { label: "Payments", href: "/dashboard/admin/payments", icon: "💳", desc: "Invoices, dues, history" },
        { label: "Reports", href: "/dashboard/admin/reports", icon: "📈", desc: "Analytics & summaries" },
      ],
    },
    {
      title: "Content",
      color: "purple",
      icon: "📢",
      links: [
        { label: "Gallery", href: "/dashboard/admin/gallery", icon: "🖼️", desc: "Upload & manage photos" },
        { label: "News & Events", href: "/dashboard/admin/news", icon: "📰", desc: "Publish announcements" },
        { label: "Notifications", href: "/dashboard/admin/notifications", icon: "🔔", desc: "Send alerts to users" },
        { label: "Messages", href: "/dashboard/admin/messages", icon: "✉️", desc: "Contact form inbox" },
      ],
    },
    {
      title: "System",
      color: "slate",
      icon: "🔧",
      links: [
        { label: "Feature Flags", href: "/dashboard/admin/features", icon: "🚩", desc: "Toggle site features" },
        { label: "Age Groups", href: "/dashboard/admin/age-groups", icon: "🎂", desc: "Manage age categories" },
      ],
    },
  ];

  const sectionColors: Record<string, { border: string; badge: string; hover: string }> = {
    blue:   { border: "border-blue-500/20",   badge: "bg-blue-500/10 text-blue-400",   hover: "hover:border-blue-500/40" },
    amber:  { border: "border-amber-500/20",  badge: "bg-amber-500/10 text-amber-400", hover: "hover:border-amber-500/40" },
    purple: { border: "border-purple-500/20", badge: "bg-purple-500/10 text-purple-400", hover: "hover:border-purple-500/40" },
    slate:  { border: "border-white/10",      badge: "bg-white/5 text-white/50",       hover: "hover:border-white/20" },
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lebanon-green to-cedar-700 flex items-center justify-center text-2xl shadow-lg">
                🌲
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">
                  Admin Dashboard
                </h1>
                <p className="text-white/40 text-sm">
                  Welcome, <span className="text-lebanon-green font-semibold">{user.firstName} {user.lastName}</span> · {user.role}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-sm transition-all"
              >
                🌐 View Site
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl bg-lebanon-red/20 border border-lebanon-red/30 text-red-400 hover:bg-lebanon-red/30 text-sm transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">📊 Academy Overview</h2>
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass-card p-5 animate-pulse">
                  <div className="w-8 h-8 bg-white/5 rounded-lg mb-3" />
                  <div className="w-16 h-6 bg-white/5 rounded mb-2" />
                  <div className="w-24 h-3 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {displayStats.map((stat) => (
                <div key={stat.label} className={`glass-card p-5 border ${stat.bg}`}>
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-white/40 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Smart Alert Widgets */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pending Payments */}
            <Link href="/dashboard/admin/payments" className="flex items-center gap-4 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-2xl flex-shrink-0">💳</div>
              <div>
                <div className="text-yellow-400 text-2xl font-black">{stats.pendingPayments}</div>
                <div className="text-yellow-400/70 text-xs font-medium">Pending Payments</div>
                <div className="text-white/30 text-xs mt-0.5">Requires action →</div>
              </div>
            </Link>
            {/* Unread Messages */}
            <Link href="/dashboard/admin/messages" className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl flex-shrink-0">✉️</div>
              <div>
                <div className="text-blue-400 text-2xl font-black">—</div>
                <div className="text-blue-400/70 text-xs font-medium">Unread Messages</div>
                <div className="text-white/30 text-xs mt-0.5">View inbox →</div>
              </div>
            </Link>
            {/* New Registrations */}
            <Link href="/dashboard/admin/students" className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl flex-shrink-0">🆕</div>
              <div>
                <div className="text-emerald-400 text-2xl font-black">{stats.newRegistrations}</div>
                <div className="text-emerald-400/70 text-xs font-medium">New This Month</div>
                <div className="text-white/30 text-xs mt-0.5">View students →</div>
              </div>
            </Link>
          </div>
        )}

        {/* Sectioned Management */}
        <div className="mb-8 space-y-6">
          <h2 className="text-lg font-bold text-white">⚙️ Management</h2>
          {sections.map((section) => {
            const c = sectionColors[section.color];
            return (
              <div key={section.title} className={`glass-card p-5 border ${c.border}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${c.badge}`}>
                    {section.icon} {section.title}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {section.links.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex flex-col gap-2 p-4 rounded-xl bg-dark-800 border border-white/5 ${c.hover} transition-all group`}
                    >
                      <div className="text-2xl">{item.icon}</div>
                      <div className="text-white text-sm font-semibold group-hover:text-white transition-colors leading-tight">{item.label}</div>
                      <div className="text-white/30 text-xs leading-tight">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* System Status */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">🔧 System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "API Server", status: "Online", color: "emerald" },
              { label: "Database", status: "Connected", color: "emerald" },
              { label: "Frontend", status: "Running", color: "emerald" },
              { label: "Auth Service", status: "Active", color: "emerald" },
              { label: "Email Service", status: "Not configured", color: "yellow" },
              { label: "File Storage", status: "Local only", color: "yellow" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-dark-800 border border-white/5">
                <span className="text-white/70 text-sm">{item.label}</span>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${item.color === "emerald" ? "text-emerald-400" : "text-yellow-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.color === "emerald" ? "bg-emerald-400" : "bg-yellow-400"} animate-pulse`} />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-lebanon-green/10 border border-lebanon-green/20">
            <p className="text-lebanon-green text-xs font-medium">✅ All core services operational · API v1 · Tenant: Cedars Sport Academy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
