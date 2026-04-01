"use client";

export interface Enrollment {
  id: string;
  programId?: string;
  sessionsRemaining?: number;
  isActive?: boolean;
  enrolledAt?: string;
  program?: { name: string };
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  nationality?: string;
  bloodType?: string;
  medicalNotes?: string;
  parentId?: string;
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
}

export function ViewModal({ student, onClose, onEdit, onAttendance }: ViewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">👤 Student Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/30 to-blue-700/30 flex items-center justify-center text-2xl font-bold text-blue-400">
              {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{student.firstName} {student.lastName}</h3>
              <p className="text-white/40 text-sm">Age {calcAge(student.dateOfBirth)}{student.nationality ? ` · ${student.nationality}` : ""}</p>
            </div>
          </div>
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Blood Type", value: student.bloodType || "—" },
              { label: "Date of Birth", value: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "—" },
              { label: "Parent", value: student.parent ? `${student.parent.firstName} ${student.parent.lastName}` : "—" },
              { label: "Parent Email", value: student.parent?.email || "—" },
              { label: "Parent Phone", value: student.parent?.phone || "—" },
              { label: "Joined", value: new Date(student.createdAt).toLocaleDateString() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-dark-900/50 rounded-xl p-3">
                <div className="text-white/30 text-xs mb-1">{label}</div>
                <div className="text-white/80 text-sm font-medium truncate">{value}</div>
              </div>
            ))}
          </div>
          {/* Sessions */}
          <div className="bg-dark-900/50 rounded-xl p-3">
            <div className="text-white/30 text-xs mb-2">Enrollments & Sessions</div>
            {student.enrollments?.length ? (
              <div className="space-y-1.5">
                {student.enrollments.map((e) => {
                  const rem = e.sessionsRemaining ?? null;
                  const cls = rem === null ? "text-white/40" : rem <= 0 ? "text-red-400" : rem === 1 ? "text-yellow-400" : "text-white/60";
                  return (
                    <div key={e.id} className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">{e.program?.name || "Program"}</span>
                      <span className={`text-sm font-medium ${cls}`}>{rem === null ? "—" : rem <= 0 ? "0 sessions 🔴" : rem === 1 ? "1 session ⚠️" : `${rem} sessions`}</span>
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
          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button onClick={onAttendance} className="flex-1 px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-sm font-medium transition-all border border-purple-500/20">📊 Attendance</button>
            <button onClick={onEdit} className="flex-1 px-4 py-2.5 rounded-xl bg-lebanon-green/10 hover:bg-lebanon-green/20 text-lebanon-green text-sm font-medium transition-all border border-lebanon-green/20">✏️ Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Create / Edit Modal ───────────────────────────────────────────────────────

interface FormState { firstName: string; lastName: string; dateOfBirth: string; nationality: string; bloodType: string; medicalNotes: string; parentId: string; }

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
            <input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm" />
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
            <label className="block text-white/50 text-xs mb-1.5">Parent</label>
            <select value={form.parentId} onChange={(e) => set("parentId", e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm">
              <option value="">No parent assigned</option>
              {parents.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.email})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-white/50 text-xs mb-1.5">Medical Notes</label>
            <textarea value={form.medicalNotes} onChange={(e) => set("medicalNotes", e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-lebanon-green/50 text-sm resize-none" placeholder="Any medical conditions or notes..." />
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
