"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { studentsApi, programsApi, locationsApi, notificationsApi, paymentsApi } from "@/lib/api";
import {
  AddChildModal, EditChildModal, EnrollModal, UnenrollConfirm,
  EMPTY_FORM, type ChildFormData, type Program, type Location,
} from "./DashboardModals";
import {
  OverviewTab, ScheduleTab, AttendanceTab, PaymentTab,
  type Enrollment, type AttendanceRecord,
} from "./DashboardTabs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParentNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  source?: "server" | "local";
  severity?: "red" | "yellow" | "normal";
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality?: string;
  bloodType?: string;
  medicalNotes?: string;
  school?: string;
  medicalCardNumber?: string;
  enrollments: Enrollment[];
  attendance: AttendanceRecord[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAge(dob: string) {
  const b = new Date(dob), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a;
}

function attRate(records: AttendanceRecord[]) {
  if (!records.length) return 0;
  return Math.round(records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length / records.length * 100);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const [children, setChildren] = useState<Child[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "schedule" | "attendance" | "payments">("overview");

  // Subscription pricing state
  const [pricing, setPricing] = useState<{
    activeChildrenCount: number;
    singleChildRate: number;
    multiChildRate: number;
    pricePerChild: number;
    totalAmount: number;
    currency: string;
  } | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const buildLocalPaymentAlerts = useCallback((): ParentNotification[] => {
    const alerts: ParentNotification[] = [];
    for (const child of children) {
      for (const enrollment of child.enrollments ?? []) {
        if (!enrollment?.isActive) continue;
        const sessionsRemaining = Number((enrollment as { sessionsRemaining?: number }).sessionsRemaining ?? 0);
        if (sessionsRemaining > 1) continue;

        const programName = enrollment.program?.name || "Program";
        const coachName = enrollment.program?.coach?.user
          ? `${enrollment.program.coach.user.firstName || ""} ${enrollment.program.coach.user.lastName || ""}`.trim()
          : "Coach";

        if (sessionsRemaining <= 0) {
          alerts.push({
            id: `local-expired-${child.id}-${enrollment.id}`,
            title: `${child.firstName} ${child.lastName}`,
            message: `🏅 ${programName}\n👨‍🏫 ${coachName}\n🔴 Expired — payment required`,
            isRead: false,
            createdAt: new Date().toISOString(),
            source: "local",
            severity: "red",
          });
        } else if (sessionsRemaining === 1) {
          alerts.push({
            id: `local-soon-${child.id}-${enrollment.id}`,
            title: `${child.firstName} ${child.lastName}`,
            message: `🏅 ${programName}\n👨‍🏫 ${coachName}\n🟡 1 session left — renew soon`,
            isRead: false,
            createdAt: new Date().toISOString(),
            source: "local",
            severity: "yellow",
          });
        }
      }
    }
    return alerts;
  }, [children]);

  // Add modal state
  const [showAdd, setShowAdd] = useState(false);
  const [addStep, setAddStep] = useState<1 | 2>(1);
  const [addForm, setAddForm] = useState<ChildFormData>(EMPTY_FORM);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [newChildId, setNewChildId] = useState<string | null>(null);
  const [addEnrollId, setAddEnrollId] = useState("");
  const [addEnrollLocationId, setAddEnrollLocationId] = useState("");

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ChildFormData>(EMPTY_FORM);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Enroll modal state
  const [showEnroll, setShowEnroll] = useState(false);
  const [enrollChildId, setEnrollChildId] = useState<string | null>(null);
  const [enrollProgramId, setEnrollProgramId] = useState("");
  const [enrollLocationId, setEnrollLocationId] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // Unenroll state
  const [unenrollTarget, setUnenrollTarget] = useState<{ childId: string; enrollmentId: string; programName: string } | null>(null);
  const [unenrollLoading, setUnenrollLoading] = useState(false);

  // Auth redirect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user) {
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") router.push("/dashboard/admin");
      else if (user.role === "COACH") router.push("/dashboard/coach");
      else if (user.role === "STUDENT") router.push("/dashboard/student");
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Fetch
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [cr, pr, lr] = await Promise.all([
        studentsApi.getMyChildren(),
        programsApi.getAll(),
        locationsApi.getAll(),
      ]);
      const kids = (cr.data as Child[]) || [];
      setChildren(kids);
      setPrograms((pr.data as Program[]) || []);
      setLocations((lr.data as Location[]) || []);
      if (kids.length > 0) setSelId((p) => p ?? kids[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally { setLoading(false); }
  }, []); // eslint-disable-line

  const fetchPricing = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "PARENT") return;
    try {
      const res = await paymentsApi.getMyPricing();
      setPricing(res.data);
    } catch {
      // keep dashboard resilient if pricing fails
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "PARENT") {
      fetchData();
      fetchPricing();
    }
  }, [isAuthenticated, user, fetchData, fetchPricing]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "PARENT") return;
    try {
      const [listRes, unreadRes] = await Promise.all([
        notificationsApi.getAll(),
        notificationsApi.getUnreadCount(),
      ]);
      const serverNotifications = ((listRes.data as ParentNotification[]) || [])
        .slice(0, 20)
        .map((n) => ({ ...n, source: "server" as const, severity: "normal" as const }));
      const localAlerts = buildLocalPaymentAlerts();

      const merged = [...localAlerts, ...serverNotifications];
      merged.sort((a, b) => {
        const weight = (n: ParentNotification) => n.severity === "red" ? 3 : n.severity === "yellow" ? 2 : 1;
        const dw = weight(b) - weight(a);
        if (dw !== 0) return dw;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setNotifications(merged);
      const serverUnread = (unreadRes.data as { count?: number })?.count ?? 0;
      setUnreadCount(serverUnread + localAlerts.length);
    } catch {
      // keep dashboard resilient if notifications fail
      const localAlerts = buildLocalPaymentAlerts();
      setNotifications(localAlerts);
      setUnreadCount(localAlerts.length);
    }
  }, [isAuthenticated, user, buildLocalPaymentAlerts]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Computed
  const sel = children.find((c) => c.id === selId) ?? null;
  const totalEnroll = children.reduce((s, c) => s + c.enrollments.filter((e) => e.isActive).length, 0);
  const avgAtt = attRate(children.flatMap((c) => c.attendance));

  // ── Add handlers ──────────────────────────────────────────────────────────
  async function doAddStep1() {
    if (
      !addForm.firstName.trim() ||
      !addForm.lastName.trim() ||
      !addForm.dateOfBirth ||
      !addForm.nationality.trim() ||
      !addForm.bloodType.trim() ||
      !addForm.school.trim() ||
      !addForm.medicalNotes.trim()
    ) {
      setAddError("Please fill all required fields. Only medical card number is optional."); return;
    }
    setAddLoading(true); setAddError(null);
    try {
      const res = await studentsApi.addChild({
        firstName: addForm.firstName.trim(), lastName: addForm.lastName.trim(),
        dateOfBirth: addForm.dateOfBirth,
        nationality: addForm.nationality || undefined, bloodType: addForm.bloodType || undefined,
        school: addForm.school || undefined, medicalCardNumber: addForm.medicalCardNumber || undefined,
        medicalNotes: addForm.medicalNotes || undefined,
      });
      setNewChildId((res.data as { id: string }).id);
      await fetchData(); setAddStep(2);
    } catch (e) { setAddError(e instanceof Error ? e.message : "Failed to add child"); }
    finally { setAddLoading(false); }
  }

  async function doAddStep2() {
    if (addEnrollId && newChildId) {
      setAddLoading(true); setAddError(null);
      try { await studentsApi.enrollMyChild(newChildId, addEnrollId); await fetchData(); }
      catch (e) { setAddError(e instanceof Error ? e.message : "Failed to enroll"); setAddLoading(false); return; }
      setAddLoading(false);
    }
    if (newChildId) setSelId(newChildId);
    closeAdd();
  }

  function closeAdd() {
    setShowAdd(false); setAddStep(1); setAddForm(EMPTY_FORM);
    setNewChildId(null); setAddEnrollId(""); setAddEnrollLocationId(""); setAddError(null);
  }

  // ── Edit handlers ─────────────────────────────────────────────────────────
  function openEdit(child: Child) {
    setEditId(child.id);
    setEditForm({
      firstName: child.firstName, lastName: child.lastName,
      dateOfBirth: child.dateOfBirth?.split("T")[0] ?? "",
      nationality: child.nationality ?? "", bloodType: child.bloodType ?? "",
      school: child.school ?? "", medicalCardNumber: child.medicalCardNumber ?? "",
      medicalNotes: child.medicalNotes ?? "",
    });
    setEditError(null); setShowEdit(true);
  }

  async function doEdit() {
    if (
      !editId ||
      !editForm.firstName.trim() ||
      !editForm.lastName.trim() ||
      !editForm.dateOfBirth ||
      !editForm.nationality.trim() ||
      !editForm.bloodType.trim() ||
      !editForm.school.trim() ||
      !editForm.medicalNotes.trim()
    ) {
      setEditError("Please fill all required fields. Only medical card number is optional."); return;
    }
    setEditLoading(true); setEditError(null);
    try {
      await studentsApi.updateMyChild(editId, {
        firstName: editForm.firstName.trim(), lastName: editForm.lastName.trim(),
        dateOfBirth: editForm.dateOfBirth,
        nationality: editForm.nationality || undefined, bloodType: editForm.bloodType || undefined,
        school: editForm.school || undefined, medicalCardNumber: editForm.medicalCardNumber || undefined,
        medicalNotes: editForm.medicalNotes || undefined,
      });
      await fetchData(); setShowEdit(false);
    } catch (e) { setEditError(e instanceof Error ? e.message : "Failed to update"); }
    finally { setEditLoading(false); }
  }

  // ── Enroll handlers ───────────────────────────────────────────────────────
  function openEnroll(childId: string) {
    setEnrollChildId(childId); setEnrollProgramId(""); setEnrollLocationId(""); setEnrollError(null); setShowEnroll(true);
  }

  async function doEnroll() {
    if (!enrollChildId || !enrollProgramId) { setEnrollError("Please select a program."); return; }
    setEnrollLoading(true); setEnrollError(null);
    try { await studentsApi.enrollMyChild(enrollChildId, enrollProgramId); await fetchData(); setShowEnroll(false); }
    catch (e) { setEnrollError(e instanceof Error ? e.message : "Failed to enroll"); }
    finally { setEnrollLoading(false); }
  }

  // ── Unenroll handler ──────────────────────────────────────────────────────
  async function doUnenroll() {
    if (!unenrollTarget) return;
    setUnenrollLoading(true);
    try { await studentsApi.unenrollMyChild(unenrollTarget.childId, unenrollTarget.enrollmentId); await fetchData(); }
    catch { await fetchData(); }
    finally { setUnenrollLoading(false); setUnenrollTarget(null); }
  }

  async function markNotificationRead(id: string) {
    try {
      const target = notifications.find((n) => n.id === id);
      if (!target || target.source !== "server") return;
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore UI action failure silently
    }
  }

  async function markAllNotificationsRead() {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore UI action failure silently
    }
  }

  // ── Guards ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark-900 pt-20">

      {/* Header */}
      <div className="bg-gradient-to-r from-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">
              Welcome back, <span className="text-lebanon-green">{user.firstName}</span> 👋
            </h1>
            <p className="text-white/40 text-sm mt-1">Parent Portal — Cedars Sport Academy</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 flex items-center justify-center transition-all"
                aria-label="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-96 max-w-[90vw] rounded-2xl border border-white/10 bg-dark-800 shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-white font-bold text-sm">Notifications</h3>
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-lebanon-green hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-white/40 text-sm">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b border-white/5 ${
                            n.source === "local"
                              ? n.severity === "red"
                                ? "bg-red-500/10"
                                : "bg-yellow-500/10"
                              : n.isRead
                                ? "bg-transparent"
                                : "bg-lebanon-green/5"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 mt-2 rounded-full ${n.isRead ? "bg-white/20" : "bg-lebanon-green"}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-semibold truncate">{n.title}</p>
                              <p className="text-white/70 text-xs mt-0.5 break-words whitespace-pre-line">{n.message}</p>
                              <p className="text-white/30 text-[11px] mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                            </div>
                            {!n.isRead && n.source === "server" && (
                              <button
                                onClick={() => markNotificationRead(n.id)}
                                className="text-[11px] text-lebanon-green hover:underline whitespace-nowrap"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <span className="px-3 py-1 rounded-full bg-lebanon-green/20 text-lebanon-green text-xs font-semibold border border-lebanon-green/30">PARENT</span>
            <button onClick={logout} className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-sm transition-all">Sign Out</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "My Children", value: loading ? "—" : String(children.length), icon: "👶", color: "text-lebanon-green" },
            { label: "Active Enrollments", value: loading ? "—" : String(totalEnroll), icon: "🏅", color: "text-blue-400" },
            { label: "Avg Attendance", value: loading ? "—" : `${avgAtt}%`, icon: "✅", color: "text-emerald-400" },
            { label: "Programs Available", value: loading ? "—" : String(programs.length), icon: "📋", color: "text-yellow-400" },
          ].map((s) => (
            <div key={s.label} className="glass-card p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-white/40 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Subscription Plan Card */}
        {pricing && (
          <div className="mb-8 glass-card p-6 border border-lebanon-green/20 bg-gradient-to-r from-lebanon-green/5 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-lebanon-green/20 flex items-center justify-center text-xl">💎</div>
              <div>
                <h3 className="text-white font-bold text-base">Subscription Plan</h3>
                <p className="text-white/40 text-xs">Your current pricing based on enrolled children</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Per Child Rate */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Per Child</div>
                <div className="text-2xl font-black text-lebanon-green">
                  {pricing.pricePerChild.toLocaleString()} <span className="text-sm font-semibold text-white/40">{pricing.currency}</span>
                </div>
                <div className="text-white/30 text-xs mt-1">
                  {pricing.activeChildrenCount >= 2
                    ? `Multi-child rate (2+ children)`
                    : `Single child rate`}
                </div>
              </div>

              {/* Total */}
              <div className="rounded-xl bg-lebanon-green/10 border border-lebanon-green/20 p-4 text-center">
                <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Total</div>
                <div className="text-2xl font-black text-white">
                  {pricing.totalAmount.toLocaleString()} <span className="text-sm font-semibold text-white/40">{pricing.currency}</span>
                </div>
                <div className="text-white/30 text-xs mt-1">
                  {pricing.activeChildrenCount} enrolled child{pricing.activeChildrenCount !== 1 ? "ren" : ""}
                </div>
              </div>

              {/* Rate Tiers */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 text-center">Rate Tiers</div>
                <div className="space-y-2">
                  <div className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs ${pricing.activeChildrenCount < 2 ? "bg-lebanon-green/10 border border-lebanon-green/20" : "bg-white/3"}`}>
                    <span className={pricing.activeChildrenCount < 2 ? "text-lebanon-green font-semibold" : "text-white/40"}>
                      {pricing.activeChildrenCount < 2 && "● "}1 Child
                    </span>
                    <span className={pricing.activeChildrenCount < 2 ? "text-white font-bold" : "text-white/40"}>
                      {pricing.singleChildRate.toLocaleString()} {pricing.currency}
                    </span>
                  </div>
                  <div className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs ${pricing.activeChildrenCount >= 2 ? "bg-lebanon-green/10 border border-lebanon-green/20" : "bg-white/3"}`}>
                    <span className={pricing.activeChildrenCount >= 2 ? "text-lebanon-green font-semibold" : "text-white/40"}>
                      {pricing.activeChildrenCount >= 2 && "● "}2+ Children
                    </span>
                    <span className={pricing.activeChildrenCount >= 2 ? "text-white font-bold" : "text-white/40"}>
                      {pricing.multiChildRate.toLocaleString()} {pricing.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
            <span>⚠️ {error}</span>
            <button onClick={fetchData} className="ml-auto underline">Retry</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── Sidebar: Children List ── */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-bold text-white/50 uppercase tracking-wider">My Children</h2>
              <button
                onClick={() => { setShowAdd(true); setAddStep(1); setAddForm(EMPTY_FORM); setAddError(null); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-lebanon-green text-white text-xs font-semibold hover:bg-lebanon-green/80 transition-all"
              >
                + Add
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="glass-card p-4 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : children.length === 0 ? (
              <div className="glass-card p-6 text-center">
                <div className="text-3xl mb-3">👶</div>
                <p className="text-white/40 text-sm">No children added yet.</p>
                <button onClick={() => setShowAdd(true)} className="mt-3 text-lebanon-green text-sm hover:underline">Add your first child →</button>
              </div>
            ) : (
              children.map((child) => {
                const active = child.enrollments.filter((e) => e.isActive).length;
                const rate = attRate(child.attendance);
                const isSel = selId === child.id;
                return (
                  <button
                    key={child.id}
                    onClick={() => { setSelId(child.id); setTab("overview"); }}
                    className={`w-full text-left glass-card p-4 transition-all border ${isSel ? "border-lebanon-green/50 bg-lebanon-green/5" : "border-white/5 hover:border-white/20"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lebanon-green/40 to-blue-500/40 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {child.firstName[0]}{child.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-semibold text-sm truncate">{child.firstName} {child.lastName}</div>
                        <div className="text-white/40 text-xs">Age {calcAge(child.dateOfBirth)} · {active} program{active !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
                    {child.attendance.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-white/10">
                          <div className="h-1 rounded-full bg-emerald-400" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-white/40 text-xs">{rate}%</span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* ── Detail Panel ── */}
          <div className="lg:col-span-3">
            {!sel ? (
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-4">👈</div>
                <p className="text-white/40">Select a child to view details</p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Child Header */}
                <div className="glass-card p-5 flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lebanon-green/40 to-blue-500/40 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                      {sel.firstName[0]}{sel.lastName[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white">{sel.firstName} {sel.lastName}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-white/40 text-xs">Age {calcAge(sel.dateOfBirth)}</span>
                        {sel.nationality && <span className="text-white/40 text-xs">· {sel.nationality}</span>}
                        {sel.bloodType && <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">{sel.bloodType}</span>}
                        {sel.school && <span className="text-white/40 text-xs">· {sel.school}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEnroll(sel.id)} className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-500/30 transition-all">+ Enroll</button>
                    <button onClick={() => openEdit(sel)} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 border border-white/10 text-xs font-semibold hover:text-white hover:border-white/30 transition-all">✏️ Edit</button>
                  </div>
                </div>

                {/* Tab Nav */}
                <div className="flex gap-1 p-1 rounded-xl bg-dark-800 border border-white/5">
                  {(["overview", "schedule", "attendance", "payments"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-lebanon-green text-white" : "text-white/40 hover:text-white"}`}>
                      {t === "overview" ? "📋 Overview" : t === "schedule" ? "📅 Schedule" : t === "attendance" ? "✅ Attendance / Performance" : "💳 Payments"}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {tab === "overview" && (
                  <OverviewTab
                    enrollments={sel.enrollments}
                    medicalNotes={sel.medicalNotes}
                    medicalCardNumber={sel.medicalCardNumber}
                    childId={sel.id}
                    onEnroll={() => openEnroll(sel.id)}
                    onUnenroll={(enrollmentId, programName) => setUnenrollTarget({ childId: sel.id, enrollmentId, programName })}
                  />
                )}
                {tab === "schedule" && <ScheduleTab enrollments={sel.enrollments} />}
                {tab === "attendance" && <AttendanceTab records={sel.attendance} />}
                {tab === "payments" && (
                  <PaymentTab
                    childId={sel.id}
                    childName={`${sel.firstName} ${sel.lastName}`}
                    enrollments={sel.enrollments}
                    onPaymentSuccess={fetchData}
                  />
                )}


              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddChildModal
          step={addStep}
          form={addForm}
          programs={programs}
          locations={locations}
          enrollProgramId={addEnrollId}
          enrollLocationId={addEnrollLocationId}
          loading={addLoading}
          error={addError}
          onFormChange={setAddForm}
          onEnrollProgramChange={setAddEnrollId}
          onEnrollLocationChange={setAddEnrollLocationId}
          onStep1Submit={doAddStep1}
          onStep2Submit={doAddStep2}
          onSkip={closeAdd}
          onClose={closeAdd}
        />
      )}
      {showEdit && (
        <EditChildModal
          form={editForm}
          loading={editLoading}
          error={editError}
          onFormChange={setEditForm}
          onSubmit={doEdit}
          onClose={() => setShowEdit(false)}
        />
      )}
      {showEnroll && enrollChildId && (
        <EnrollModal
          programs={programs}
          locations={locations}
          childDob={children.find((c) => c.id === enrollChildId)?.dateOfBirth ?? ""}
          programId={enrollProgramId}
          locationId={enrollLocationId}
          loading={enrollLoading}
          error={enrollError}
          enrolledProgramIds={
            children.find((c) => c.id === enrollChildId)
              ?.enrollments.filter((e) => e.isActive)
              .map((e) => e.program.id) ?? []
          }
          onProgramChange={setEnrollProgramId}
          onLocationChange={setEnrollLocationId}
          onSubmit={doEnroll}
          onClose={() => setShowEnroll(false)}
        />
      )}
      {unenrollTarget && (
        <UnenrollConfirm
          programName={unenrollTarget.programName}
          loading={unenrollLoading}
          onConfirm={doUnenroll}
          onClose={() => setUnenrollTarget(null)}
        />
      )}

    </div>
  );
}
