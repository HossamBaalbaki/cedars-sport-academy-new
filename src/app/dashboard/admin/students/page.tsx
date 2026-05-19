"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { studentsApi, programsApi } from "@/lib/api";
import {
  Student, Parent, AttendanceRecord,
  calcAge,
  AttendanceModal, ViewModal, EditModal, DeleteModal, CancelModal, IDCardModal,
  EnrollModal, RenewModal, type ProgramOption,
} from "./StudentModals";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

interface ExpiringEnrollment {
  studentId: string;
  firstName: string;
  lastName: string;
  programName: string;
  sessionsRemaining: number;
}

const EMPTY_FORM = { firstName: "", lastName: "", dateOfBirth: "", nationality: "", bloodType: "", medicalNotes: "", parentId: "", photo: "", newParentEmail: "", newParentPhone: "" };

export default function AdminStudentsPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Create/Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // View modal
  const [viewStudent, setViewStudent] = useState<Student | null>(null);

  // Attendance modal
  const [attendanceStudent, setAttendanceStudent] = useState<Student | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSearch, setAttendanceSearch] = useState("");

  // Expiring
  const [expiring, setExpiring] = useState<ExpiringEnrollment[]>([]);
  const [expiringDismissed, setExpiringDismissed] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ID Card
  const [idCardStudent, setIdCardStudent] = useState<Student | null>(null);

  // Cancel enrollment
  const [cancelTarget, setCancelTarget] = useState<{ enrollmentId: string; studentName: string; programName: string } | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Edit sessions
  const [sessionsTarget, setSessionsTarget] = useState<{ enrollmentId: string; studentName: string; programName: string; current: number } | null>(null);
  const [sessionsValue, setSessionsValue] = useState<string>("");
  const [savingSessions, setSavingSessions] = useState(false);

  // Programs list (for enroll modal)
  const [programs, setPrograms] = useState<ProgramOption[]>([]);

  // Admin Enroll
  const [enrollTarget, setEnrollTarget] = useState<Student | null>(null);
  const [enrollSaving, setEnrollSaving] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // Admin Renew
  const [renewTarget, setRenewTarget] = useState<{ student: Student; enrollmentId: string; programName: string } | null>(null);
  const [renewSaving, setRenewSaving] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);

  // Toggle enrollment active
  const [togglingEnrollment, setTogglingEnrollment] = useState<string | null>(null);

  // Toggle student isActive
  const [togglingStudent, setTogglingStudent] = useState<string | null>(null);

  // Status filter
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "NO_ENROLLMENT">("ALL");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  const hdrs = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Tenant-ID": TENANT,
  }), [token]);

  const fetchStudents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/students`, { headers: hdrs() });
      if (r.ok) { const d = await r.json(); setStudents(d.data || []); }
      else setError("Failed to load students");
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }, [token, hdrs]);

  const fetchParents = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch(`${API}/users?role=PARENT`, { headers: hdrs() });
      if (r.ok) { const d = await r.json(); setParents(d.data || []); }
    } catch { /* silent */ }
  }, [token, hdrs]);

  const fetchExpiring = useCallback(async () => {
    if (!token) return;
    try {
      const r = await studentsApi.getExpiring();
      setExpiring((r.data as ExpiringEnrollment[]) || []);
    } catch { /* silent */ }
  }, [token]);

  const fetchPrograms = useCallback(async () => {
    try { const r = await programsApi.getAll(); setPrograms((r.data as ProgramOption[]) || []); }
    catch { /* silent */ }
  }, []);

  useEffect(() => { fetchStudents(); fetchParents(); fetchExpiring(); fetchPrograms(); }, [fetchStudents, fetchParents, fetchExpiring, fetchPrograms]);

  const openAttendance = useCallback(async (s: Student) => {
    setAttendanceStudent(s);
    setAttendanceSearch("");
    setAttendanceRecords([]);
    setAttendanceLoading(true);
    try {
      const r = await fetch(`${API}/attendance/student/${s.id}`, { headers: hdrs() });
      if (r.ok) { const d = await r.json(); setAttendanceRecords(d.data || []); }
    } catch { /* silent */ }
    finally { setAttendanceLoading(false); }
  }, [hdrs]);

  const handleToggleStudent = async (s: Student) => {
    setTogglingStudent(s.id);
    try {
      await studentsApi.toggleActive(s.id);
      await fetchStudents();
      setViewStudent((prev) => prev?.id === s.id ? { ...prev, isActive: !(prev.isActive !== false) } : prev);
    }
    catch { /* silent */ }
    finally { setTogglingStudent(null); }
  };

  const handleAdminEnroll = async (data: { programId: string; sessionsCount: number; isPaid: boolean; paymentMethod: string; amount: number }) => {
    if (!enrollTarget) return;
    setEnrollSaving(true); setEnrollError(null);
    try {
      await studentsApi.adminEnroll(enrollTarget.id, data);
      setEnrollTarget(null); fetchStudents(); fetchExpiring();
    } catch (e) { setEnrollError(e instanceof Error ? e.message : "Failed to enroll"); }
    finally { setEnrollSaving(false); }
  };

  const handleAdminRenew = async (data: { sessionsCount: number; paymentMethod: string; amount: number }) => {
    if (!renewTarget) return;
    setRenewSaving(true); setRenewError(null);
    try {
      await studentsApi.adminRenew(renewTarget.student.id, renewTarget.enrollmentId, data);
      setRenewTarget(null); fetchStudents(); fetchExpiring();
    } catch (e) { setRenewError(e instanceof Error ? e.message : "Failed to renew"); }
    finally { setRenewSaving(false); }
  };

  const handleToggleEnrollment = async (student: Student, enrollmentId: string) => {
    setTogglingEnrollment(enrollmentId);
    try {
      await studentsApi.toggleEnrollment(student.id, enrollmentId);
      await fetchStudents();
      setViewStudent((prev) => prev?.id === student.id ? {
        ...prev,
        enrollments: prev.enrollments?.map((e) => e.id === enrollmentId ? { ...e, isActive: !e.isActive } : e),
      } : prev);
    }
    catch { /* silent */ }
    finally { setTogglingEnrollment(null); }
  };

  const openCreate = () => { setEditingStudent(null); setForm({ ...EMPTY_FORM }); setFormError(null); setModalOpen(true); };
  const openEdit = (s: Student) => {
    setEditingStudent(s);
    setForm({ firstName: s.firstName || "", lastName: s.lastName || "", dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split("T")[0] : "", nationality: s.nationality || "", bloodType: s.bloodType || "", medicalNotes: s.medicalNotes || "", parentId: s.parentId || "", photo: s.photo || "", newParentEmail: s.parentEmail || "", newParentPhone: s.parentPhone || "" });
    setFormError(null);
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditingStudent(null); setFormError(null); };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.dateOfBirth) {
      setFormError("First name, last name, and date of birth are required.");
      return;
    }
    setSaving(true); setFormError(null);
    try {
      const body: Record<string, string> = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: new Date(form.dateOfBirth).toISOString(),
      };
      if (form.nationality.trim()) body.nationality = form.nationality.trim();
      if (form.bloodType.trim()) body.bloodType = form.bloodType.trim();
      if (form.medicalNotes.trim()) body.medicalNotes = form.medicalNotes.trim();
      if (form.parentId) body.parentId = form.parentId;
      if (form.newParentEmail.trim()) body.parentEmail = form.newParentEmail.trim();
      if (form.newParentPhone.trim()) body.parentPhone = form.newParentPhone.trim();
      if (form.photo.trim()) body.photo = form.photo.trim();
      else if (editingStudent) body.photo = "";
      const r = await fetch(
        editingStudent ? `${API}/students/${editingStudent.id}` : `${API}/students`,
        { method: editingStudent ? "PATCH" : "POST", headers: hdrs(), body: JSON.stringify(body) }
      );
      if (r.ok) { closeModal(); fetchStudents(); }
      else { const e = await r.json().catch(() => ({})); setFormError(e.message || "Failed to save student"); }
    } catch { setFormError("Network error."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const r = await fetch(`${API}/students/${deleteTarget.id}`, { method: "DELETE", headers: hdrs() });
      if (r.ok) { setDeleteTarget(null); fetchStudents(); }
      else { const e = await r.json().catch(() => ({})); setError(e.message || "Failed to delete"); setDeleteTarget(null); }
    } catch { setError("Network error"); setDeleteTarget(null); }
    finally { setDeleting(false); }
  };

  const handleCancelEnrollment = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const r = await fetch(`${API}/programs/enrollments/${cancelTarget.enrollmentId}/cancel`, { method: "PATCH", headers: hdrs() });
      if (r.ok) { setCancelTarget(null); fetchStudents(); }
      else { const e = await r.json().catch(() => ({})); setError(e.message || "Failed to cancel"); setCancelTarget(null); }
    } catch { setError("Network error"); setCancelTarget(null); }
    finally { setCancelling(false); }
  };

  const handleSaveSessions = async () => {
    if (!sessionsTarget) return;
    const parsed = Number(sessionsValue);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("Sessions must be a non-negative number");
      return;
    }

    setSavingSessions(true);
    try {
      const r = await fetch(`${API}/programs/enrollments/${sessionsTarget.enrollmentId}/sessions`, {
        method: "PATCH",
        headers: hdrs(),
        body: JSON.stringify({ sessionsRemaining: Math.floor(parsed) }),
      });

      if (r.ok) {
        setSessionsTarget(null);
        setSessionsValue("");
        fetchStudents();
      } else {
        const e = await r.json().catch(() => ({}));
        setError(e.message || "Failed to update sessions");
      }
    } catch {
      setError("Network error");
    } finally {
      setSavingSessions(false);
    }
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      s.parent?.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.parent?.firstName?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    const isActive = s.isActive !== false;
    const hasEnrollment = (s.enrollments?.length ?? 0) > 0;
    if (statusFilter === "ACTIVE") return isActive;
    if (statusFilter === "INACTIVE") return !isActive;
    if (statusFilter === "NO_ENROLLMENT") return !hasEnrollment;
    return true;
  });

  const counts = {
    ALL: students.length,
    ACTIVE: students.filter((s) => s.isActive !== false).length,
    INACTIVE: students.filter((s) => s.isActive === false).length,
    NO_ENROLLMENT: students.filter((s) => (s.enrollments?.length ?? 0) === 0).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      {/* Page header */}
      <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">←</Link>
            <div>
              <h1 className="text-2xl font-black text-white">👥 Students</h1>
              <p className="text-white/40 text-sm">
                {statusFilter !== "ALL" || search ? `${filtered.length} of ${students.length}` : students.length} students
              </p>
            </div>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lebanon-green text-white font-semibold text-sm hover:bg-lebanon-green/90 transition-all shadow-lg shadow-lebanon-green/20">
            <span className="text-lg leading-none">+</span> Add Student
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Expiring subscriptions banner */}
        {!expiringDismissed && expiring.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/25">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⚠️</span>
                <div>
                  <h3 className="text-orange-400 font-bold text-sm mb-1">
                    Expiring Subscriptions — {expiring.length} enrollment{expiring.length !== 1 ? "s" : ""} running low
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {expiring.map((e, i) => (
                      <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${e.sessionsRemaining <= 0 ? "bg-red-500/15 text-red-400 border-red-500/25" : e.sessionsRemaining === 1 ? "bg-orange-500/15 text-orange-400 border-orange-500/25" : "bg-yellow-500/15 text-yellow-400 border-yellow-500/25"}`}>
                        <span className="font-semibold">{e.firstName} {e.lastName}</span>
                        <span className="text-white/40">·</span>
                        <span>{e.programName}</span>
                        <span className="text-white/40">·</span>
                        <span>{e.sessionsRemaining <= 0 ? "🔴 Expired" : `${e.sessionsRemaining} left`}</span>
                      </span>
                    ))}
                  </div>
                  <p className="text-orange-400/60 text-xs mt-2">
                    Go to <Link href="/dashboard/admin/payments" className="underline hover:text-orange-400">Payments</Link> to renew.
                  </p>
                </div>
              </div>
              <button onClick={() => setExpiringDismissed(true)} className="text-orange-400/40 hover:text-orange-400 text-lg leading-none flex-shrink-0">✕</button>
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div className="mb-6 space-y-3">
          <input
            type="text"
            placeholder="Search by name or parent email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
          />
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "ACTIVE", "INACTIVE", "NO_ENROLLMENT"] as const).map((f) => {
              const labels: Record<string, string> = { ALL: "All", ACTIVE: "✅ Active", INACTIVE: "⛔ Inactive", NO_ENROLLMENT: "📭 No Enrollment" };
              const active = statusFilter === f;
              const colorMap: Record<string, string> = {
                ALL: active ? "bg-white/15 text-white border-white/20" : "bg-dark-800 text-white/50 border-white/10 hover:text-white",
                ACTIVE: active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "bg-dark-800 text-white/50 border-white/10 hover:text-emerald-400",
                INACTIVE: active ? "bg-red-500/20 text-red-400 border-red-500/40" : "bg-dark-800 text-white/50 border-white/10 hover:text-red-400",
                NO_ENROLLMENT: active ? "bg-orange-500/20 text-orange-400 border-orange-500/40" : "bg-dark-800 text-white/50 border-white/10 hover:text-orange-400",
              };
              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${colorMap[f]}`}
                >
                  {labels[f]}
                  <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold">{counts[f]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400 ml-4">✕</button>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-white/40 mb-4">
              {search ? "No students match your search" : statusFilter !== "ALL" ? "No students in this category" : "No students yet"}
            </p>
            {!search && statusFilter === "ALL" && (
              <button onClick={openCreate} className="px-5 py-2.5 rounded-xl bg-lebanon-green text-white font-semibold text-sm hover:bg-lebanon-green/90 transition-all">
                Add First Student
              </button>
            )}
            {statusFilter !== "ALL" && (
              <button onClick={() => setStatusFilter("ALL")} className="px-4 py-2 rounded-xl bg-white/5 text-white/50 text-sm hover:bg-white/10 transition-all">
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Student", "Age", "Parent", "Programs", "Blood", "Joined", "Actions"].map((h) => (
                      <th key={h} className={`text-white/40 text-xs font-semibold uppercase tracking-wider px-6 py-4 ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((s) => {
                    const rowActive = s.isActive !== false;
                    return (
                      <tr
                        key={s.id}
                        className={`transition-colors border-l-2 ${rowActive ? "border-l-emerald-500/50 hover:bg-emerald-500/[0.03]" : "border-l-red-500/50 hover:bg-red-500/[0.03] opacity-75"}`}
                      >
                        {/* Student */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              {s.photo
                                ? <img src={s.photo} alt={s.firstName} className="w-9 h-9 rounded-full object-cover border border-white/10" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                : <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${rowActive ? "bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 text-emerald-400" : "bg-gradient-to-br from-red-500/10 to-red-700/10 text-red-400/60"}`}>{s.firstName?.charAt(0)}{s.lastName?.charAt(0)}</div>
                              }
                              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-dark-800 ${rowActive ? "bg-emerald-400" : "bg-red-500"}`} />
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium">{s.firstName} {s.lastName}</div>
                              {s.studentCode
                                ? <div className="text-lebanon-green/70 text-xs font-mono">{s.studentCode}</div>
                                : s.nationality
                                  ? <div className="text-white/30 text-xs">{s.nationality}</div>
                                  : null}
                            </div>
                          </div>
                        </td>
                        {/* Age */}
                        <td className="px-6 py-4 text-white/60 text-sm">{calcAge(s.dateOfBirth)}</td>
                        {/* Parent */}
                        <td className="px-6 py-4">
                          {s.parent ? (
                            <div>
                              <div className="text-white/70 text-sm">{s.parent.firstName} {s.parent.lastName}</div>
                              <div className="text-white/30 text-xs">{s.parent.email}</div>
                            </div>
                          ) : <span className="text-white/30 text-xs">—</span>}
                        </td>
                        {/* Programs */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {s.enrollments?.length ? s.enrollments.slice(0, 3).map((e) => (
                              <span key={e.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${e.isActive !== false ? "bg-lebanon-green/10 text-lebanon-green border-lebanon-green/20" : "bg-white/5 text-white/30 border-white/10"}`}>
                                {e.program?.name || "Program"}
                                <span className="font-bold">{Number.isFinite(Number(e.sessionsRemaining)) ? `·${e.sessionsRemaining}` : ""}</span>
                              </span>
                            )) : <span className="text-white/30 text-xs">None</span>}
                            {(s.enrollments?.length || 0) > 3 && <span className="text-white/30 text-xs">+{(s.enrollments?.length || 0) - 3}</span>}
                          </div>
                        </td>
                        {/* Blood */}
                        <td className="px-6 py-4">
                          {s.bloodType
                            ? <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs border border-red-500/20">{s.bloodType}</span>
                            : <span className="text-white/30 text-xs">—</span>}
                        </td>
                        {/* Joined */}
                        <td className="px-6 py-4 text-white/40 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => setViewStudent(s)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 text-white/40 flex items-center justify-center transition-all text-sm" title="View profile">👁️</button>
                            <button onClick={() => setIdCardStudent(s)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-lebanon-green/20 hover:text-lebanon-green text-white/40 flex items-center justify-center transition-all text-sm" title="ID Card">🪪</button>
                            <button onClick={() => setDeleteTarget(s)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/40 flex items-center justify-center transition-all text-sm" title="Delete">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {idCardStudent && (
        <IDCardModal student={idCardStudent} onClose={() => setIdCardStudent(null)} />
      )}

      {attendanceStudent && (
        <AttendanceModal
          student={attendanceStudent}
          records={attendanceRecords}
          loading={attendanceLoading}
          search={attendanceSearch}
          onSearchChange={setAttendanceSearch}
          onClose={() => setAttendanceStudent(null)}
        />
      )}

      {viewStudent && (
        <ViewModal
          student={viewStudent}
          onClose={() => setViewStudent(null)}
          onEdit={() => { openEdit(viewStudent); setViewStudent(null); }}
          onAttendance={() => { openAttendance(viewStudent); setViewStudent(null); }}
          onEnroll={() => { setEnrollTarget(viewStudent); setViewStudent(null); }}
          onToggleActive={() => handleToggleStudent(viewStudent)}
          togglingStudent={togglingStudent === viewStudent.id}
          onRenew={(enrollmentId, programName) => { setRenewTarget({ student: viewStudent, enrollmentId, programName }); setViewStudent(null); }}
          onToggleEnrollment={(enrollmentId) => handleToggleEnrollment(viewStudent, enrollmentId)}
          togglingEnrollment={togglingEnrollment}
        />
      )}

      {modalOpen && (
        <EditModal
          editing={editingStudent}
          form={form}
          parents={parents}
          saving={saving}
          formError={formError}
          onChange={setForm}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          student={deleteTarget}
          deleting={deleting}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {cancelTarget && (
        <CancelModal
          studentName={cancelTarget.studentName}
          programName={cancelTarget.programName}
          cancelling={cancelling}
          onConfirm={handleCancelEnrollment}
          onClose={() => setCancelTarget(null)}
        />
      )}

      {sessionsTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSessionsTarget(null)} />
          <div className="relative w-full max-w-sm bg-dark-800 border border-white/10 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Edit Sessions</h3>
            <p className="text-white/50 text-sm mb-4">
              {sessionsTarget.studentName} — {sessionsTarget.programName}
            </p>
            <input
              type="number"
              min={0}
              value={sessionsValue}
              onChange={(e) => setSessionsValue(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setSessionsTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSessions}
                disabled={savingSessions}
                className="flex-1 px-4 py-2.5 rounded-xl bg-lebanon-green hover:bg-lebanon-green/90 text-white text-sm font-semibold disabled:opacity-50"
              >
                {savingSessions ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {enrollTarget && (
        <EnrollModal
          student={enrollTarget}
          programs={programs}
          saving={enrollSaving}
          error={enrollError}
          onSave={handleAdminEnroll}
          onClose={() => { setEnrollTarget(null); setEnrollError(null); }}
        />
      )}

      {renewTarget && (
        <RenewModal
          student={renewTarget.student}
          programName={renewTarget.programName}
          saving={renewSaving}
          error={renewError}
          onSave={handleAdminRenew}
          onClose={() => { setRenewTarget(null); setRenewError(null); }}
        />
      )}
    </div>
  );
}
