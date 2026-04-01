"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { studentsApi } from "@/lib/api";
import {
  Student, Parent, AttendanceRecord, Enrollment,
  SBadge, getMin, calcAge,
  AttendanceModal, ViewModal, EditModal, DeleteModal, CancelModal,
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

const EMPTY_FORM = { firstName: "", lastName: "", dateOfBirth: "", nationality: "", bloodType: "", medicalNotes: "", parentId: "" };

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

  // Cancel enrollment
  const [cancelTarget, setCancelTarget] = useState<{ enrollmentId: string; studentName: string; programName: string } | null>(null);
  const [cancelling, setCancelling] = useState(false);

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

  useEffect(() => { fetchStudents(); fetchParents(); fetchExpiring(); }, [fetchStudents, fetchParents, fetchExpiring]);

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

  const openCreate = () => { setEditingStudent(null); setForm({ ...EMPTY_FORM }); setFormError(null); setModalOpen(true); };
  const openEdit = (s: Student) => {
    setEditingStudent(s);
    setForm({ firstName: s.firstName || "", lastName: s.lastName || "", dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split("T")[0] : "", nationality: s.nationality || "", bloodType: s.bloodType || "", medicalNotes: s.medicalNotes || "", parentId: s.parentId || "" });
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

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    s.parent?.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.parent?.firstName?.toLowerCase().includes(search.toLowerCase())
  );

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
              <p className="text-white/40 text-sm">{students.length} total students</p>
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

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or parent email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
          />
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
            <p className="text-white/40 mb-4">{search ? "No students match your search" : "No students yet"}</p>
            {!search && (
              <button onClick={openCreate} className="px-5 py-2.5 rounded-xl bg-lebanon-green text-white font-semibold text-sm hover:bg-lebanon-green/90 transition-all">
                Add First Student
              </button>
            )}
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Student", "Age", "Parent", "Programs", "Sessions", "Blood", "Joined", "Actions"].map((h) => (
                      <th key={h} className={`text-white/40 text-xs font-semibold uppercase tracking-wider px-6 py-4 ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((s) => {
                    const minSess = getMin(s.enrollments);
                    return (
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Student */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-700/30 flex items-center justify-center text-sm font-bold text-blue-400 flex-shrink-0">
                              {s.firstName?.charAt(0)}{s.lastName?.charAt(0)}
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium">{s.firstName} {s.lastName}</div>
                              {s.nationality && <div className="text-white/30 text-xs">{s.nationality}</div>}
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
                              <span key={e.id} className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-lebanon-green/10 text-lebanon-green text-xs border border-lebanon-green/20">
                                {e.program?.name || "Program"}
                                <button
                                  onClick={() => setCancelTarget({ enrollmentId: e.id, studentName: `${s.firstName} ${s.lastName}`, programName: e.program?.name || "Program" })}
                                  className="w-3.5 h-3.5 rounded-full bg-lebanon-green/20 hover:bg-red-500/40 hover:text-red-300 flex items-center justify-center transition-all leading-none"
                                  title="Cancel enrollment"
                                >×</button>
                              </span>
                            )) : <span className="text-white/30 text-xs">None</span>}
                            {(s.enrollments?.length || 0) > 3 && <span className="text-white/30 text-xs">+{(s.enrollments?.length || 0) - 3}</span>}
                          </div>
                        </td>
                        {/* Sessions */}
                        <td className="px-6 py-4"><SBadge min={minSess} /></td>
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
                            <button onClick={() => setViewStudent(s)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 text-white/40 flex items-center justify-center transition-all text-sm" title="View">👁️</button>
                            <button onClick={() => openAttendance(s)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 text-white/40 flex items-center justify-center transition-all text-sm" title="Attendance">📊</button>
                            <button onClick={() => openEdit(s)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-lebanon-green/20 hover:text-lebanon-green text-white/40 flex items-center justify-center transition-all text-sm" title="Edit">✏️</button>
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
    </div>
  );
}
