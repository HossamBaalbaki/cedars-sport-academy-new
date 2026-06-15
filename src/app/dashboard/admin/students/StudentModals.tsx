"use client";
import { useState } from "react";
import { useTenant } from "@/context/TenantContext";
import MediaUpload from "@/components/ui/MediaUpload";

export interface Enrollment {
  id: string;
  programId?: string;
  sessionsRemaining?: number;
  isActive?: boolean;
  enrolledAt?: string;
  sessionStartDate?: string | null;
  sessionEndDate?: string | null;
  program?: { name: string; locations?: { location?: { name: string } }[] };
}

export interface Student {
  id: string;
  studentCode?: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  nationality?: string;
  bloodType?: string;
  photo?: string | null;
  medicalNotes?: string;
  medicalCardNumber?: string | null;
  school?: string;
  coachNotes?: string;
  parentId?: string;
  parentEmail?: string | null;
  parentPhone?: string | null;
  isActive?: boolean;
  parent?: { id: string; firstName: string; lastName: string; email: string; phone?: string };
  enrollments?: Enrollment[];
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  scheduleId: string;
  coachId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  performanceRating?: number | null;
  isInjured: boolean;
  injuryNote?: string | null;
  notes?: string | null;
  schedule?: {
    id: string;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    program?: { id: string; name: string; icon?: string };
    location?: { id: string; name: string; city?: string };
  };
  coach?: { id: string; user?: { firstName: string; lastName: string } };
}

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export const calcAge = (dob?: string): string | number => {
  if (!dob) return "—";
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
};

export const getMin = (enr?: Enrollment[]): number | null => {
  if (!enr?.length) return null;
  const v = enr.map((e) => e.sessionsRemaining).filter((x): x is number => x != null);
  return v.length ? Math.min(...v) : null;
};

export const exportCSV = (records: AttendanceRecord[], name: string) => {
  const h = ["Date", "Program", "Coach", "Location", "Status", "Performance", "Injured", "Injury Note", "Notes"];
  const rows = records.map((r) => [
    new Date(r.date).toLocaleDateString(),
    r.schedule?.program?.name || "—",
    r.coach?.user ? `${r.coach.user.firstName} ${r.coach.user.lastName}` : "—",
    r.schedule?.location?.name || "—",
    r.status,
    r.performanceRating ?? "",
    r.isInjured ? "Yes" : "No",
    r.injuryNote || "",
    r.notes || "",
  ]);
  const csv = [h, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `attendance_${name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
};

// ── Sub-components ────────────────────────────────────────────────────────────

export const SBadge = ({ min }: { min: number | null }) => {
  if (min === null) return <span className="text-white/20 text-xs">—</span>;
  if (min <= 0) return <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25 text-xs font-semibold">0 left 🔴</span>;
  if (min === 1) return <span className="px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 text-xs font-semibold">1 left ⚠️</span>;
  return <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 text-xs">{min} left</span>;
};

const statusColor = (s: string) =>
  ({ PRESENT: "bg-green-500/15 text-green-400 border-green-500/25", ABSENT: "bg-red-500/15 text-red-400 border-red-500/25", LATE: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25", EXCUSED: "bg-blue-500/15 text-blue-400 border-blue-500/25" }[s] || "bg-white/5 text-white/40 border-white/10");

const Stars = ({ r }: { r?: number | null }) =>
  r ? <span className="text-yellow-400 text-sm">{"★".repeat(r)}{"☆".repeat(5 - r)}</span> : <span className="text-white/20 text-xs">—</span>;

// ── Attendance Modal ──────────────────────────────────────────────────────────

interface AttendanceModalProps {
  student: Student;
  records: AttendanceRecord[];
  loading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onClose: () => void;
}

export function AttendanceModal({ student, records, loading, search, onSearchChange, onClose }: AttendanceModalProps) {
  const filtered = records.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [
      new Date(r.date).toLocaleDateString(),
      r.schedule?.program?.name || "",
      r.coach?.user ? `${r.coach.user.firstName} ${r.coach.user.lastName}` : "",
      r.schedule?.location?.name || "",
      r.status,
    ].some((v) => v.toLowerCase().includes(q));
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">📊 Attendance — {student.firstName} {student.lastName}</h2>
            <p className="text-white/40 text-xs mt-0.5">{records.length} records total</p>
          </div>
          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <button
                onClick={() => exportCSV(filtered, `${student.firstName} ${student.lastName}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lebanon-green/10 hover:bg-lebanon-green/20 text-lebanon-green text-xs font-medium transition-all border border-lebanon-green/20"
              >
                ⬇️ Export CSV
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all">✕</button>
          </div>
        </div>
        {/* Search */}
        <div className="px-6 py-3 border-b border-white/5 flex-shrink-0">
          <input
            type="text"
            placeholder="Search by date, program, coach, location, status..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
          />
        </div>
        {/* Enrollment session summary */}
        {student.enrollments && student.enrollments.length > 0 && (
          <div className="px-6 py-3 border-b border-white/5 flex-shrink-0 flex flex-wrap gap-2">
            {student.enrollments.map((e) => {
              const rem = e.sessionsRemaining ?? null;
              const cls = rem === null ? "bg-white/5 text-white/40 border-white/10" : rem <= 0 ? "bg-red-500/15 text-red-400 border-red-500/25" : rem === 1 ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" : "bg-white/5 text-white/50 border-white/10";
              return (
                <span key={e.id} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cls}`}>
                  <span>{e.program?.name || "Program"}</span>
                  <span className="text-white/30">·</span>
                  <span>{rem === null ? "—" : rem <= 0 ? "0 sessions 🔴" : rem === 1 ? "1 session ⚠️" : `${rem} sessions`}</span>
                </span>
              );
            })}
          </div>
        )}
        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-white/40 text-sm">{search ? "No records match your search" : "No attendance records yet"}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-dark-800 z-10">
                <tr className="border-b border-white/5">
                  {["Date", "Program", "Coach", "Location", "Status", "Performance", "Injured", "Notes"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-white/70 text-sm whitespace-nowrap">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="text-white/80 text-sm">{r.schedule?.program?.name || "—"}</div>
                      {r.schedule?.location?.city && <div className="text-white/30 text-xs">{r.schedule.location.city}</div>}
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm whitespace-nowrap">
                      {r.coach?.user ? `${r.coach.user.firstName} ${r.coach.user.lastName}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">{r.schedule?.location?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Stars r={r.performanceRating} /></td>
                    <td className="px-4 py-3">
                      {r.isInjured ? (
                        <div>
                          <span className="text-red-400 text-xs font-medium">🩹 Yes</span>
                          {r.injuryNote && <div className="text-white/30 text-xs mt-0.5">{r.injuryNote}</div>}
                        </div>
                      ) : (
                        <span className="text-white/30 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs max-w-[160px] truncate">{r.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────

interface ViewModalProps {
  student: Student;
  onClose: () => void;
  onEdit: () => void;
  onAttendance: () => void;
  onEnroll: () => void;
  onToggleActive: () => void;
  togglingStudent: boolean;
  onRenew: (enrollmentId: string, programName: string) => void;
  onToggleEnrollment: (enrollmentId: string) => void;
  togglingEnrollment: string | null;
}

export function ViewModal({
  student, onClose, onEdit, onAttendance, onEnroll,
  onToggleActive, togglingStudent,
  onRenew, onToggleEnrollment, togglingEnrollment,
}: ViewModalProps) {
  const isActive = student.isActive !== false;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <h2 className="text-base font-bold text-white">👤 Student Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all">✕</button>
        </div>

        {/* Action toolbar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5 bg-dark-900/40 flex-shrink-0 flex-wrap">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lebanon-green/10 hover:bg-lebanon-green/20 text-lebanon-green text-xs font-semibold border border-lebanon-green/20 transition-all"
          >✏️ Edit</button>
          <button
            onClick={onEnroll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/20 transition-all"
          >🏅 Enroll</button>
          <button
            onClick={onAttendance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-semibold border border-purple-500/20 transition-all"
          >📊 Attendance</button>
          <button
            onClick={onToggleActive}
            disabled={togglingStudent}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 ${
              isActive
                ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/20"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
            }`}
          >
            {togglingStudent
              ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              : isActive ? "⏸ Deactivate" : "▶ Activate"}
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">

          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            {student.photo
              ? <img src={student.photo} alt={student.firstName} className="w-20 h-20 rounded-2xl object-cover border border-white/10 flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              : <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/30 to-blue-700/30 flex items-center justify-center text-3xl font-bold text-blue-400 flex-shrink-0">{student.firstName?.charAt(0)}{student.lastName?.charAt(0)}</div>
            }
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-white">{student.firstName} {student.lastName}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-white/40 text-sm mt-0.5">Age {calcAge(student.dateOfBirth)}{student.nationality ? ` · ${student.nationality}` : ""}</p>
              {student.studentCode && (
                <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-lebanon-green/10 border border-lebanon-green/25 text-lebanon-green text-xs font-mono font-semibold">
                  🪪 {student.studentCode}
                </span>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Blood Type", value: student.bloodType || "—" },
              { label: "Date of Birth", value: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "—" },
              { label: "Parent", value: student.parent ? `${student.parent.firstName} ${student.parent.lastName}` : "—" },
              { label: "Parent Email", value: student.parent?.email || student.parentEmail || "—" },
              { label: "Parent Phone", value: student.parent?.phone || student.parentPhone || "—" },
              { label: "Joined", value: new Date(student.createdAt).toLocaleDateString() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-dark-900/50 rounded-xl p-3">
                <div className="text-white/30 text-xs mb-1">{label}</div>
                <div className="text-white/80 text-sm font-medium truncate">{value}</div>
              </div>
            ))}
          </div>

          {/* Enrollments */}
          <div className="bg-dark-900/50 rounded-xl p-4">
            <div className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">Enrollments</div>
            {student.enrollments?.length ? (
              <div className="space-y-2">
                {student.enrollments.map((e) => {
                  const rem = e.sessionsRemaining ?? null;
                  const sessColor = rem === null ? "text-white/40" : rem <= 0 ? "text-red-400" : rem <= 2 ? "text-yellow-400" : "text-emerald-400";
                  const enrolled = e.isActive !== false;
                  return (
                    <div key={e.id} className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${enrolled ? "bg-emerald-400" : "bg-white/20"}`} />
                          <span className="text-white/70 text-sm truncate">
                            {e.program?.name || "Program"}
                            {(() => { const loc = e.program?.locations?.[0]?.location?.name; return loc ? <span className="text-white/35 text-xs"> · {loc}</span> : null; })()}
                          </span>
                        </div>
                        {(e.sessionStartDate || e.sessionEndDate) && (
                          <div className="flex items-center gap-1.5 ml-3.5 text-[11px] text-white/35">
                            <span>📅</span>
                            <span>{e.sessionStartDate ? new Date(e.sessionStartDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}</span>
                            <span>→</span>
                            <span className={e.sessionEndDate && new Date(e.sessionEndDate) < new Date() ? "text-red-400/60" : "text-white/35"}>
                              {e.sessionEndDate ? new Date(e.sessionEndDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-sm font-bold ${sessColor}`}>
                          {rem === null ? "—" : rem <= 0 ? "0 🔴" : rem === 1 ? "1 ⚠️" : rem}
                          <span className="text-white/30 text-xs font-normal ml-0.5">sess</span>
                        </span>
                        {/* Renew */}
                        <button
                          onClick={() => onRenew(e.id, e.program?.name || "Program")}
                          className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 text-xs font-semibold border border-blue-500/20 transition-all"
                          title="Renew sessions"
                        >↻ Renew</button>
                        {/* Toggle active */}
                        <button
                          onClick={() => onToggleEnrollment(e.id)}
                          disabled={togglingEnrollment === e.id}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 ${
                            enrolled
                              ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/20"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                          }`}
                          title={enrolled ? "Hide from coach roster" : "Show on coach roster"}
                        >
                          {togglingEnrollment === e.id
                            ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />
                            : enrolled ? "● Active" : "○ Off"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <span className="text-white/30 text-sm">No active enrollments</span>}
          </div>

          {/* Medical notes */}
          {student.medicalNotes && (
            <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
              <div className="text-red-400/70 text-xs mb-1">⚕️ Medical Notes</div>
              <div className="text-white/60 text-sm">{student.medicalNotes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Create / Edit Modal ───────────────────────────────────────────────────────

interface FormState { firstName: string; lastName: string; dateOfBirth: string; nationality: string; bloodType: string; medicalNotes: string; parentId: string; photo: string; newParentEmail: string; newParentPhone: string; }

interface EditModalProps {
  editing: Student | null;
  form: FormState;
  parents: Parent[];
  saving: boolean;
  formError: string | null;
  onChange: (f: FormState) => void;
  onSave: () => void;
  onClose: () => void;
}

export function EditModal({ editing, form, parents, saving, formError, onChange, onSave, onClose }: EditModalProps) {
  const set = (k: keyof FormState, v: string) => onChange({ ...form, [k]: v });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">{editing ? "✏️ Edit Student" : "➕ Add Student"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all">✕</button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {formError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{formError}</div>}
          <div className="grid grid-cols-2 gap-3">
            {(["firstName", "lastName"] as const).map((k) => (
              <div key={k}>
                <label className="block text-white/50 text-xs mb-1.5 capitalize">{k === "firstName" ? "First Name *" : "Last Name *"}</label>
                <input value={form[k]} onChange={(e) => set(k, e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-lebanon-green/50 text-sm" placeholder={k === "firstName" ? "First name" : "Last name"} />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-white/50 text-xs mb-1.5">Date of Birth *</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
              min={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 80); return d.toISOString().split("T")[0]; })()}
              max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 2); return d.toISOString().split("T")[0]; })()}
              className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm"
            />
            <p className="text-white/25 text-xs mt-1">Age must be between 2 and 80 years</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Nationality</label>
              <input value={form.nationality} onChange={(e) => set("nationality", e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-lebanon-green/50 text-sm" placeholder="e.g. Lebanese" />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Blood Type</label>
              <select value={form.bloodType} onChange={(e) => set("bloodType", e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm">
                <option value="">Select...</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-white/50 text-xs mb-1.5">Link to Parent Account</label>
            <select value={form.parentId} onChange={(e) => set("parentId", e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm">
              <option value="">No account linked</option>
              {parents.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.email}){p.phone ? ` · ${p.phone}` : ""}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Parent Email <span className="text-white/25">(optional)</span></label>
              <input type="email" value={form.newParentEmail} onChange={(e) => set("newParentEmail", e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-lebanon-green/50 text-sm" placeholder="parent@email.com" />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Parent Phone <span className="text-white/25">(optional)</span></label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2.5 bg-dark-800/80 border border-r-0 border-white/10 rounded-l-xl text-white/40 text-xs select-none font-mono">+974</span>
                <input
                  type="tel"
                  value={form.newParentPhone.replace(/^\+?974/, '')}
                  onChange={(e) => set("newParentPhone", '+974' + e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-3 py-2.5 rounded-r-xl bg-dark-900 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-lebanon-green/50 text-sm"
                  placeholder="50 000 000"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-white/50 text-xs mb-1.5">Medical Notes</label>
            <textarea value={form.medicalNotes} onChange={(e) => set("medicalNotes", e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-lebanon-green/50 text-sm resize-none" placeholder="Any medical conditions or notes..." />
          </div>
          <div>
            <MediaUpload
              label="Student Photo"
              value={form.photo}
              onChange={url => set("photo", url)}
              accept="image"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-white/5 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium transition-all">Cancel</button>
          <button onClick={onSave} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-lebanon-green hover:bg-lebanon-green/90 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? "Saving..." : editing ? "Save Changes" : "Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

interface DeleteModalProps { student: Student; deleting: boolean; onConfirm: () => void; onClose: () => void; }

export function DeleteModal({ student, deleting, onConfirm, onClose }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-dark-800 border border-white/10 rounded-2xl shadow-2xl p-6 text-center">
        <div className="text-4xl mb-3">🗑️</div>
        <h3 className="text-lg font-bold text-white mb-2">Delete Student</h3>
        <p className="text-white/50 text-sm mb-6">Are you sure you want to delete <span className="text-white font-medium">{student.firstName} {student.lastName}</span>? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium transition-all">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {deleting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cancel Enrollment Confirm Modal ──────────────────────────────────────────

interface CancelModalProps { studentName: string; programName: string; cancelling: boolean; onConfirm: () => void; onClose: () => void; }

export function CancelModal({ studentName, programName, cancelling, onConfirm, onClose }: CancelModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-dark-800 border border-white/10 rounded-2xl shadow-2xl p-6 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h3 className="text-lg font-bold text-white mb-2">Cancel Enrollment</h3>
        <p className="text-white/50 text-sm mb-6">Remove <span className="text-white font-medium">{studentName}</span> from <span className="text-white font-medium">{programName}</span>?</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium transition-all">Keep</button>
          <button onClick={onConfirm} disabled={cancelling} className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {cancelling && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {cancelling ? "Cancelling..." : "Cancel Enrollment"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Admin Enroll Modal ────────────────────────────────────────────────────────

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmt12(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")}${ampm}`;
}

export interface ProgramOption {
  id: string;
  name: string;
  price: number;
  currency?: string;
  icon?: string | null;
  image?: string | null;
  level?: string | null;
  ageGroup?: { name: string; minAge?: number; maxAge?: number } | null;
  coach?: {
    user?: {
      firstName: string;
      lastName: string;
      avatar?: string | null;
    };
  } | null;
  locations?: { location?: { id: string; name: string } }[];
  schedules?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive?: boolean;
    locationId?: string | null;
    location?: { id: string; name: string } | null;
  }[];
}

interface EnrollModalProps {
  student: Student;
  programs: ProgramOption[];
  enrolledProgramIds?: string[];
  saving: boolean;
  error: string | null;
  onSave: (data: { programId: string; locationId?: string; sessionsCount: number; isPaid: boolean; paymentMethod: string; amount: number }) => void;
  onClose: () => void;
}

export function EnrollModal({ student, programs, enrolledProgramIds = [], saving, error, onSave, onClose }: EnrollModalProps) {
  const [programId, setProgramId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [search, setSearch] = useState("");
  const [sessionsCount, setSessionsCount] = useState(8);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amount, setAmount] = useState("");

  const filtered = programs.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.coach?.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    p.coach?.user?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    p.locations?.some((l) => l.location?.name.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedProgram = programs.find((p) => p.id === programId);
  const availableLocations = (() => {
    const map = new Map<string, { id: string; name: string }>();
    // From program_locations join table
    for (const pl of selectedProgram?.locations ?? []) {
      if (pl.location?.id) map.set(pl.location.id, pl.location);
    }
    // From schedules — use locationId directly as it's always a scalar field
    for (const s of (selectedProgram?.schedules ?? []).filter(s => s.isActive !== false)) {
      if (s.locationId && !map.has(s.locationId)) {
        const name = s.location?.name ?? map.get(s.locationId)?.name ?? "Location";
        map.set(s.locationId, { id: s.locationId, name });
      }
    }
    return Array.from(map.values());
  })();

  function selectProgram(p: ProgramOption) {
    setProgramId(p.id);
    setLocationId("");
    setAmount(String(p.price));
  }

  function handleSave() {
    if (!programId) return;
    onSave({ programId, locationId: locationId || undefined, sessionsCount, isPaid, paymentMethod, amount: isPaid ? Number(amount) : 0 });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-dark-800 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">🏅 Enroll Student</h2>
            <p className="text-white/40 text-xs mt-0.5">{student.firstName} {student.lastName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all">✕</button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          {/* Search */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/50 text-xs uppercase tracking-wider">Select Program *</label>
              <span className="text-white/30 text-xs">{filtered.length} available</span>
            </div>
            <input
              type="text"
              placeholder="Search by name, coach, location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-lebanon-green/50 mb-3"
            />

            {/* Program cards */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-sm">No programs match your search</div>
              ) : (
                filtered.map((p) => {
                  const isSelected = programId === p.id;
                  const isEnrolled = enrolledProgramIds.includes(p.id);
                  const activeSchedules = (p.schedules ?? []).filter((s) => s.isActive !== false);
                  const locationNames = [
                    ...(p.locations ?? []).map((l) => l.location?.name).filter(Boolean),
                    ...(activeSchedules.map((s) => s.location?.name).filter(Boolean)),
                  ];
                  const uniqueLocations = [...new Set(locationNames)] as string[];

                  return (
                    <div
                      key={p.id}
                      onClick={() => !isEnrolled && selectProgram(p)}
                      className={`relative rounded-xl border p-4 transition-all ${
                        isEnrolled
                          ? "border-white/5 bg-white/2 opacity-50 cursor-not-allowed"
                          : isSelected
                          ? "cursor-pointer border-lebanon-green bg-lebanon-green/8 ring-1 ring-lebanon-green/20"
                          : "cursor-pointer border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      {isEnrolled && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                          ✓ Enrolled
                        </span>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        {/* Left: name + details */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {p.icon && (
                            <span className="text-2xl flex-shrink-0 mt-0.5">{p.icon}</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-white text-sm">{p.name}</span>
                              {p.level && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/8 text-white/40 border border-white/10">{p.level}</span>
                              )}
                              {p.ageGroup && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400/70 border border-blue-500/15">{p.ageGroup.name}</span>
                              )}
                            </div>

                            {/* Coach */}
                            {p.coach?.user && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                {p.coach.user.avatar ? (
                                  <img src={p.coach.user.avatar} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-lebanon-green/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[9px] font-bold text-lebanon-green">{p.coach.user.firstName[0]}</span>
                                  </div>
                                )}
                                <span className="text-white/50 text-xs">Coach <span className="text-white/75 font-medium">{p.coach.user.firstName} {p.coach.user.lastName}</span></span>
                              </div>
                            )}

                            {/* Locations */}
                            {uniqueLocations.length > 0 && (
                              <div className="flex items-center gap-1 mt-1.5 text-xs text-white/40">
                                <span>📍</span>
                                <span>{uniqueLocations.join(" · ")}</span>
                              </div>
                            )}

                            {/* Schedules */}
                            {activeSchedules.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {activeSchedules.map((s, i) => (
                                  <span key={i} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/8">
                                    <span className="font-semibold text-white/70">{DAYS_SHORT[s.dayOfWeek]}</span>
                                    <span>{fmt12(s.startTime)}–{fmt12(s.endTime)}</span>
                                    {s.location?.name && uniqueLocations.length > 1 && (
                                      <span className="text-white/30">· {s.location.name}</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: price + checkmark */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className={`font-bold text-sm ${isSelected ? "text-lebanon-green" : "text-white/70"}`}>
                            {p.price} <span className="text-xs font-normal opacity-60">{p.currency ?? "QAR"}</span>
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-lebanon-green flex items-center justify-center">
                              <span className="text-white text-[10px] font-bold">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Location selector — shown only when program has multiple locations */}
          {programId && availableLocations.length > 1 && (
            <div>
              <label className="block text-white/50 text-xs mb-1.5 uppercase tracking-wider">Select Location *</label>
              <div className="space-y-1.5">
                {availableLocations.map((loc) => loc && (
                  <div
                    key={loc.id}
                    onClick={() => setLocationId(loc.id)}
                    className={`cursor-pointer px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      locationId === loc.id
                        ? "border-lebanon-green bg-lebanon-green/10 text-white"
                        : "border-white/10 bg-white/3 text-white/60 hover:border-white/20"
                    }`}
                  >
                    📍 {loc.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sessions */}
          <div>
            <label className="block text-white/50 text-xs mb-1.5 uppercase tracking-wider">Sessions to assign</label>
            <div className="flex gap-2">
              {[4, 8, 12, 16].map((n) => (
                <button key={n} onClick={() => setSessionsCount(n)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${sessionsCount === n ? "bg-lebanon-green text-white border-lebanon-green" : "bg-white/5 text-white/50 border-white/10 hover:border-white/30"}`}>{n}</button>
              ))}
              <input type="number" min={1} max={50} value={sessionsCount} onChange={(e) => setSessionsCount(Number(e.target.value))} className="w-16 px-2 py-2 rounded-lg bg-dark-900 border border-white/10 text-white text-sm text-center focus:outline-none focus:border-lebanon-green/50" />
            </div>
          </div>

          {/* Paid toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/8">
            <div>
              <div className="text-white text-sm font-medium">Mark as Paid</div>
              <div className="text-white/40 text-xs">Record payment now</div>
            </div>
            <button onClick={() => setIsPaid((v) => !v)} className={`relative w-11 h-6 rounded-full transition-colors ${isPaid ? "bg-lebanon-green" : "bg-white/10"}`}>
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: isPaid ? "22px" : "2px" }} />
            </button>
          </div>

          {/* Payment fields */}
          {isPaid && (
            <div className="space-y-3 p-3 rounded-xl bg-lebanon-green/5 border border-lebanon-green/15">
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Payment Method</label>
                <div className="flex gap-2">
                  {[["CASH", "💵 Cash"], ["TRANSFER", "🏦 Transfer"], ["CARD", "💳 Card"]].map(([val, label]) => (
                    <button key={val} onClick={() => setPaymentMethod(val)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all border ${paymentMethod === val ? "bg-lebanon-green text-white border-lebanon-green" : "bg-white/5 text-white/50 border-white/10 hover:border-white/20"}`}>{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Amount (QAR)</label>
                <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm" placeholder="0" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving || !programId} className="flex-1 px-4 py-2.5 rounded-xl bg-lebanon-green hover:bg-lebanon-green/90 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? "Saving..." : isPaid ? "Enroll & Record Payment" : "Enroll"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Admin Renew Modal ─────────────────────────────────────────────────────────

interface RenewModalProps {
  student: Student;
  programName: string;
  saving: boolean;
  error: string | null;
  onSave: (data: { sessionsCount: number; paymentMethod: string; amount: number }) => void;
  onClose: () => void;
}

export function RenewModal({ student, programName, saving, error, onSave, onClose }: RenewModalProps) {
  const [sessionsCount, setSessionsCount] = useState(8);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amount, setAmount] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white">🔄 Renew Sessions</h2>
            <p className="text-white/40 text-xs mt-0.5">{student.firstName} {student.lastName} · {programName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          <div>
            <label className="block text-white/50 text-xs mb-1.5">Sessions to add</label>
            <div className="flex gap-2">
              {[4, 8, 12, 16].map((n) => (
                <button key={n} onClick={() => setSessionsCount(n)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${sessionsCount === n ? "bg-lebanon-green text-white border-lebanon-green" : "bg-white/5 text-white/50 border-white/10 hover:border-white/30"}`}>{n}</button>
              ))}
              <input type="number" min={1} max={50} value={sessionsCount} onChange={(e) => setSessionsCount(Number(e.target.value))} className="w-16 px-2 py-2 rounded-lg bg-dark-900 border border-white/10 text-white text-sm text-center focus:outline-none focus:border-lebanon-green/50" />
            </div>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-1.5">Payment Method</label>
            <div className="flex gap-2">
              {[["CASH", "💵 Cash"], ["TRANSFER", "🏦 Transfer"], ["CARD", "💳 Card"]].map(([val, label]) => (
                <button key={val} onClick={() => setPaymentMethod(val)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all border ${paymentMethod === val ? "bg-lebanon-green text-white border-lebanon-green" : "bg-white/5 text-white/50 border-white/10 hover:border-white/20"}`}>{label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-1.5">Amount (QAR)</label>
            <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm" placeholder="0" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/5 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all">Cancel</button>
          <button onClick={() => onSave({ sessionsCount, paymentMethod, amount: Number(amount) })} disabled={saving || !amount} className="flex-1 px-4 py-2.5 rounded-xl bg-lebanon-green hover:bg-lebanon-green/90 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? "Saving..." : "Renew & Record Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ID Card Modal ─────────────────────────────────────────────────────────────

interface IDCardModalProps { student: Student; onClose: () => void; }

const CARD_W = 420;
const CARD_H = 265;

const CARD_BG = "linear-gradient(145deg, #002610 0%, #00401a 40%, #006625 70%, #00A651 100%)";
const CARD_RED = "#EE161F";
const CARD_SHADOW = "0 2px 4px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.35), 0 20px 40px rgba(0,0,0,0.3), 0 40px 80px rgba(0,0,0,0.2)";

function CardFrontFace({ student, tenant }: { student: Student; tenant: { name: string; logo: string; phone: string; email: string; whatsapp: string } }) {
  const initials = `${student.firstName?.charAt(0) ?? ""}${student.lastName?.charAt(0) ?? ""}`.toUpperCase();
  const academyName = tenant.name || "CEDARS SPORT ACADEMY";

  return (
    <div style={{ width: CARD_W, height: CARD_H, borderRadius: 16, background: CARD_BG, overflow: "hidden", position: "relative", fontFamily: "'Segoe UI', system-ui, sans-serif", boxShadow: CARD_SHADOW }}>

      {/* Gloss overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 45%, transparent 100%)", pointerEvents: "none", zIndex: 10 }} />

      {/* Red diagonal accent top-right */}
      <div style={{ position: "absolute", top: -30, right: -30, width: 110, height: 110, background: CARD_RED, transform: "rotate(45deg)", opacity: 0.85, zIndex: 1 }} />
      {/* Thin red stripe bottom */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: `linear-gradient(90deg, ${CARD_RED}, ${CARD_RED}aa)`, zIndex: 2 }} />
      {/* Decorative circle bottom-left */}
      <div style={{ position: "absolute", bottom: -40, left: -40, width: 130, height: 130, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.07)", zIndex: 1 }} />
      <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", zIndex: 1 }} />

      {/* Top-left logo + academy name */}
      <div style={{ position: "absolute", top: 12, left: 16, display: "flex", alignItems: "center", gap: 7, zIndex: 5 }}>
        <div style={{ width: 32, height: 32, borderRadius: 7, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", padding: 3, flexShrink: 0 }}>
          {tenant.logo
            ? <img src={tenant.logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            : <span style={{ fontWeight: 900, fontSize: 14, color: "#00A651" }}>{academyName.charAt(0)}</span>
          }
        </div>
        <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>{academyName}</span>
      </div>

      {/* STUDENT ID badge top-right (under red corner) */}
      <div style={{ position: "absolute", top: 14, right: 18, zIndex: 6 }}>
        <span style={{ color: "white", fontSize: 8, fontWeight: 800, letterSpacing: "0.16em", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 20, padding: "3px 9px" }}>STUDENT ID</span>
      </div>

      {/* Photo */}
      <div style={{ position: "absolute", left: 20, top: 54, zIndex: 5 }}>
        {student.photo
          ? <img src={student.photo} alt={student.firstName} style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.35)", boxShadow: "0 0 0 2px #00A651, 0 4px 16px rgba(0,0,0,0.5)" }} />
          : <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))", border: "3px solid rgba(255,255,255,0.25)", boxShadow: "0 0 0 2px #00A651, 0 4px 16px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.9)" }}>{initials}</div>
        }
      </div>

      {/* Info block */}
      <div style={{ position: "absolute", left: 124, top: 52, right: 16, zIndex: 5 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "white", lineHeight: 1.15, textShadow: "0 1px 4px rgba(0,0,0,0.5)", marginBottom: 5 }}>{student.firstName} {student.lastName}</div>

        {student.studentCode && (
          <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 20, padding: "3px 11px", marginBottom: 7 }}>
            <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.95)", letterSpacing: "0.05em" }}>{student.studentCode}</span>
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
          {student.bloodType && (
            <span style={{ background: "rgba(238,22,31,0.25)", border: "1px solid rgba(238,22,31,0.5)", borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 700, color: "rgba(255,160,165,1)" }}>{student.bloodType}</span>
          )}
          {student.nationality && (
            <span style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{student.nationality}</span>
          )}
        </div>

        {student.medicalCardNumber && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Medical Card</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", fontFamily: "monospace" }}>{student.medicalCardNumber}</span>
          </div>
        )}
        {student.dateOfBirth && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>DOB</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>{new Date(student.dateOfBirth).toLocaleDateString("en-GB")}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CardBackFace({ tenant }: { tenant: { name: string; logo: string; phone: string; email: string; whatsapp: string } }) {
  const academyName = tenant.name || "CEDARS SPORT ACADEMY";

  return (
    <div style={{ width: CARD_W, height: CARD_H, borderRadius: 16, background: CARD_BG, overflow: "hidden", position: "relative", fontFamily: "'Segoe UI', system-ui, sans-serif", boxShadow: CARD_SHADOW }}>

      {/* Gloss overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 45%, transparent 100%)", pointerEvents: "none", zIndex: 10 }} />

      {/* Red diagonal accent bottom-left */}
      <div style={{ position: "absolute", bottom: -30, left: -30, width: 110, height: 110, background: CARD_RED, transform: "rotate(45deg)", opacity: 0.8, zIndex: 1 }} />
      {/* Red stripe top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: `linear-gradient(90deg, ${CARD_RED}aa, ${CARD_RED})`, zIndex: 2 }} />
      {/* Decorative circles top-right */}
      <div style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.06)", zIndex: 1 }} />
      <div style={{ position: "absolute", top: -25, right: -25, width: 90, height: 90, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", zIndex: 1 }} />

      {/* Large centered logo */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, zIndex: 5, padding: "18px 40px 14px" }}>
        <div style={{ width: 80, height: 80, borderRadius: 18, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", padding: 8, marginBottom: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {tenant.logo
            ? <img src={tenant.logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            : <span style={{ fontWeight: 900, fontSize: 32, color: "#00A651" }}>{academyName.charAt(0)}</span>
          }
        </div>

        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", margin: 0 }}>If found, please contact the academy</p>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, width: "100%" }}>
          {tenant.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13 }}>📞</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "white", letterSpacing: "0.03em", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{tenant.phone}</span>
            </div>
          )}
          {tenant.whatsapp && tenant.whatsapp !== tenant.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12 }}>💬</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{tenant.whatsapp}</span>
            </div>
          )}
          {tenant.email && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12 }}>✉️</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{tenant.email}</span>
            </div>
          )}
        </div>

        <div style={{ width: "60%", height: 1, background: "rgba(255,255,255,0.12)", margin: "2px 0" }} />

        <p style={{ fontSize: 8.5, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, textAlign: "center", margin: 0 }}>
          This card is the property of {academyName}.<br />Unauthorized use is prohibited.
        </p>
      </div>
    </div>
  );
}

export function IDCardModal({ student, onClose }: IDCardModalProps) {
  const { tenant } = useTenant();
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <style>{`
        .id-card-scene { perspective: 1200px; }
        .id-card-flipper {
          width: ${CARD_W}px; height: ${CARD_H}px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1);
        }
        .id-card-flipper.is-flipped { transform: rotateY(180deg); }
        .id-card-face {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 14px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.35);
        }
        .id-card-face-back { transform: rotateY(180deg); }
        @media print {
          body > * { display: none !important; }
          .id-card-print-area {
            display: flex !important;
            position: fixed !important;
            top: 10mm; left: 10mm; gap: 14mm;
          }
          .id-card-print-area > div { box-shadow: none !important; border: 1px solid #e5e7eb !important; border-radius: 10px; overflow: hidden; }
        }
      `}</style>

      <div className="relative flex flex-col items-center gap-6">
        {/* Header */}
        <div className="flex items-center justify-between w-full" style={{ maxWidth: CARD_W }}>
          <div>
            <h2 className="text-xl font-bold text-white">🪪 Student ID Card</h2>
            <p className="text-white/40 text-sm mt-0.5">{student.firstName} {student.lastName} · {student.studentCode || "No ID"}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all text-lg">✕</button>
        </div>

        {/* Flip card */}
        <div className="id-card-scene cursor-pointer" onClick={() => setFlipped(f => !f)} title="Click to flip">
          <div className={`id-card-flipper${flipped ? " is-flipped" : ""}`}>
            <div className="id-card-face id-card-face-front">
              <CardFrontFace student={student} tenant={tenant} />
            </div>
            <div className="id-card-face id-card-face-back">
              <CardBackFace tenant={tenant} />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFlipped(f => !f)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all"
          >
            🔄 {flipped ? "Show Front" : "Show Back"}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lebanon-green hover:bg-lebanon-green/90 text-white text-sm font-semibold transition-all"
          >
            🖨️ Print Both Sides
          </button>
        </div>

        <p className="text-white/25 text-xs">Click the card or the button to flip · Print outputs both sides</p>
      </div>

      {/* Hidden print layout — both sides side by side */}
      <div className="id-card-print-area" style={{ display: "none" }}>
        <div><CardFrontFace student={student} tenant={tenant} /></div>
        <div><CardBackFace tenant={tenant} /></div>
      </div>
    </div>
  );
}
