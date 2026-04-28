"use client";

const inputCls = "w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-lebanon-green/50 text-sm";
const labelCls = "block text-white/60 text-xs font-medium mb-1.5";
const selectCls = "w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm";

export interface AgeGroup { id: string; name: string; minAge: number; maxAge: number; }
export interface CoachOption { id: string; user: { firstName: string; lastName: string; }; }
export interface StudentOption { id: string; firstName: string; lastName: string; }

export interface ProgramFormData {
  name: string; nameAr: string; slug: string; description: string;
  icon: string; image: string; level: string; price: string;
  maxStudents: string; totalSessions: string; isActive: boolean; ageGroupId: string; coachId: string;
}

export interface Program {
  id: string; name: string; nameAr?: string; slug: string; description?: string;
  icon?: string; image?: string; level?: string; price?: number; maxStudents?: number; totalSessions?: number;
  isActive: boolean; ageGroupId?: string; coachId?: string;
  ageGroup?: { id: string; name: string };
  coach?: { id: string; user: { firstName: string; lastName: string } };
  schedules?: { id: string; dayOfWeek: number | string; startTime: string; endTime: string }[];
  _count?: { enrollments: number };
  createdAt: string;
}

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

interface ProgramFormProps {
  form: ProgramFormData; setForm: (f: ProgramFormData) => void;
  ageGroups: AgeGroup[]; coaches: CoachOption[];
}

export function ProgramFormFields({ form, setForm, ageGroups, coaches }: ProgramFormProps) {
  const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ELITE"];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Program Name <span className="text-red-400">*</span></label>
          <input type="text" value={form.name} onChange={e => { const n = e.target.value; setForm({ ...form, name: n, slug: slugify(n) }); }} placeholder="Football Academy" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Name (Arabic)</label>
          <input type="text" value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} placeholder="أكاديمية كرة القدم" className={inputCls} dir="rtl" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Slug <span className="text-white/30">(auto-generated)</span></label>
        <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="football-academy" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Program description..." rows={3} className={`${inputCls} resize-none`} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Age Group</label>
          <select value={form.ageGroupId} onChange={e => setForm({ ...form, ageGroupId: e.target.value })} className={selectCls}>
            <option value="">— None —</option>
            {ageGroups.map(ag => <option key={ag.id} value={ag.id}>{ag.name} ({ag.minAge}–{ag.maxAge} yrs)</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Coach</label>
          <select value={form.coachId} onChange={e => setForm({ ...form, coachId: e.target.value })} className={selectCls}>
            <option value="">— None —</option>
            {coaches.map(c => <option key={c.id} value={c.id}>{c.user.firstName} {c.user.lastName}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className={labelCls}>Level</label>
          <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className={selectCls}>
            <option value="">— None —</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Price (QAR)</label>
          <input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Max Students</label>
          <input type="number" min="1" value={form.maxStudents} onChange={e => setForm({ ...form, maxStudents: e.target.value })} placeholder="20" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Total Sessions</label>
          <input type="number" min="1" value={form.totalSessions} onChange={e => setForm({ ...form, totalSessions: e.target.value })} placeholder="7" className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Icon (emoji or URL)</label>
          <input type="text" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="⚽" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Image URL</label>
          <input type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." className={inputCls} />
        </div>
      </div>
      {form.image.trim() && (
        <div>
          <label className={labelCls}>Image Preview</label>
          <div className="relative w-full h-40 rounded-xl overflow-hidden border border-white/10 bg-dark-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.image.trim()}
              alt="Program preview"
              className="w-full h-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; const next = e.currentTarget.nextElementSibling as HTMLElement | null; if (next) next.style.display = "flex"; }}
            />
            <div className="absolute inset-0 hidden items-center justify-center text-white/30 text-sm flex-col gap-1">
              <span className="text-2xl">🖼️</span>
              <span>Invalid image URL</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/40 to-transparent pointer-events-none" />
          </div>
        </div>
      )}
      <div>
        <label className={labelCls}>Status</label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })} className={`w-10 h-6 rounded-full relative transition-colors ${form.isActive ? "bg-lebanon-green" : "bg-white/10"}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isActive ? "translate-x-5" : "translate-x-1"}`} />
          </button>
          <span className="text-white/60 text-sm">{form.isActive ? "Active" : "Inactive"}</span>
        </div>
      </div>
    </div>
  );
}

interface CreateModalProps {
  open: boolean; saving: boolean; err: string | null;
  form: ProgramFormData; setForm: (f: ProgramFormData) => void;
  ageGroups: AgeGroup[]; coaches: CoachOption[];
  onClose: () => void; onSave: () => void;
}

export function CreateProgramModal(p: CreateModalProps) {
  if (!p.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={p.onClose} />
      <div className="relative w-full max-w-xl bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Add New Program</h2>
          <button onClick={p.onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center">✕</button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {p.err && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{p.err}</div>}
          <ProgramFormFields form={p.form} setForm={p.setForm} ageGroups={p.ageGroups} coaches={p.coaches} />
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button onClick={p.onClose} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all">Cancel</button>
          <button onClick={p.onSave} disabled={p.saving} className="px-5 py-2 rounded-xl bg-lebanon-green hover:bg-lebanon-green/90 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2">
            {p.saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {p.saving ? "Creating..." : "Create Program"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditModalProps {
  program: Program | null; saving: boolean; err: string | null;
  form: ProgramFormData; setForm: (f: ProgramFormData) => void;
  ageGroups: AgeGroup[]; coaches: CoachOption[];
  onClose: () => void; onSave: () => void;
}

export function EditProgramModal(p: EditModalProps) {
  if (!p.program) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={p.onClose} />
      <div className="relative w-full max-w-xl bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Edit — {p.program.name}</h2>
          <button onClick={p.onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center">✕</button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {p.err && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{p.err}</div>}
          <ProgramFormFields form={p.form} setForm={p.setForm} ageGroups={p.ageGroups} coaches={p.coaches} />
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button onClick={p.onClose} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all">Cancel</button>
          <button onClick={p.onSave} disabled={p.saving} className="px-5 py-2 rounded-xl bg-lebanon-green hover:bg-lebanon-green/90 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2">
            {p.saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {p.saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface DeleteModalProps { program: Program | null; deleting: boolean; onClose: () => void; onConfirm: () => void; }

export function DeleteProgramModal(p: DeleteModalProps) {
  if (!p.program) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={p.onClose} />
      <div className="relative w-full max-w-sm bg-dark-800 border border-white/10 rounded-2xl shadow-2xl p-6 text-center">
        <div className="text-4xl mb-3">🗑️</div>
        <h3 className="text-lg font-bold text-white mb-2">Delete Program</h3>
        <p className="text-white/50 text-sm mb-6">Are you sure you want to delete <span className="text-white font-medium">{p.program.name}</span>? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={p.onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all">Cancel</button>
          <button onClick={p.onConfirm} disabled={p.deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {p.deleting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {p.deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface EnrollModalProps {
  program: Program | null; students: StudentOption[]; enrolling: boolean;
  selectedStudentId: string; setSelectedStudentId: (id: string) => void;
  err: string | null; onClose: () => void; onEnroll: () => void;
}

export function EnrollStudentModal(p: EnrollModalProps) {
  if (!p.program) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={p.onClose} />
      <div className="relative w-full max-w-sm bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white">Enroll Student</h2>
            <p className="text-white/40 text-xs mt-0.5">{p.program.name}</p>
          </div>
          <button onClick={p.onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {p.err && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{p.err}</div>}
          <div>
            <label className={labelCls}>Select Student <span className="text-red-400">*</span></label>
            <select value={p.selectedStudentId} onChange={e => p.setSelectedStudentId(e.target.value)} className={selectCls}>
              <option value="">— Choose a student —</option>
              {p.students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
            </select>
          </div>
          {p.students.length === 0 && <p className="text-white/30 text-xs text-center">No students available</p>}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button onClick={p.onClose} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all">Cancel</button>
          <button onClick={p.onEnroll} disabled={p.enrolling || !p.selectedStudentId} className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2">
            {p.enrolling && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {p.enrolling ? "Enrolling..." : "Enroll Student"}
          </button>
        </div>
      </div>
    </div>
  );
}
