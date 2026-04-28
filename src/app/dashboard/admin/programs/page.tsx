"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  CreateProgramModal, EditProgramModal, DeleteProgramModal, EnrollStudentModal,
  type Program, type AgeGroup, type CoachOption, type StudentOption, type ProgramFormData,
} from "./ProgramModals";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

const EMPTY_FORM: ProgramFormData = {
  name: "", nameAr: "", slug: "", description: "", icon: "", image: "",
  level: "", price: "", maxStudents: "", totalSessions: "7", isActive: true, ageGroupId: "", coachId: "",
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-500/10 text-green-400 border-green-500/20",
  INTERMEDIATE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ADVANCED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  ELITE: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminProgramsPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Create
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ProgramFormData>({ ...EMPTY_FORM });
  const [createSaving, setCreateSaving] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  // Edit
  const [editProg, setEditProg] = useState<Program | null>(null);
  const [editForm, setEditForm] = useState<ProgramFormData>({ ...EMPTY_FORM });
  const [editSaving, setEditSaving] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);

  // Delete
  const [delProg, setDelProg] = useState<Program | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Enroll
  const [enrollProg, setEnrollProg] = useState<Program | null>(null);
  const [enrollStudentId, setEnrollStudentId] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollErr, setEnrollErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  const hdrs = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Tenant-ID": TENANT,
  }), [token]);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [pRes, agRes, cRes, sRes] = await Promise.all([
        fetch(`${API}/programs`, { headers: hdrs() }),
        fetch(`${API}/age-groups`, { headers: hdrs() }),
        fetch(`${API}/coaches`, { headers: hdrs() }),
        fetch(`${API}/students`, { headers: hdrs() }),
      ]);
      if (pRes.ok) { const d = await pRes.json(); setPrograms(d.data || []); }
      else setError("Failed to load programs");
      if (agRes.ok) { const d = await agRes.json(); setAgeGroups(d.data || []); }
      if (cRes.ok) { const d = await cRes.json(); setCoaches(d.data || []); }
      if (sRes.ok) { const d = await sRes.json(); setStudents(d.data || []); }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }, [token, hdrs]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const buildBody = (form: ProgramFormData) => {
    const body: Record<string, unknown> = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      isActive: form.isActive,
    };
    if (form.nameAr.trim()) body.nameAr = form.nameAr.trim();
    if (form.description.trim()) body.description = form.description.trim();
    if (form.icon.trim()) body.icon = form.icon.trim();
    if (form.image.trim()) body.image = form.image.trim();
    if (form.level) body.level = form.level;
    if (form.price) body.price = parseFloat(form.price);
    if (form.maxStudents) body.maxStudents = parseInt(form.maxStudents, 10);
    if (form.totalSessions) body.totalSessions = parseInt(form.totalSessions, 10);
    if (form.ageGroupId) body.ageGroupId = form.ageGroupId;
    if (form.coachId) body.coachId = form.coachId;
    return body;
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) { setCreateErr("Program name is required."); return; }
    if (!createForm.slug.trim()) { setCreateErr("Slug is required."); return; }
    setCreateSaving(true); setCreateErr(null);
    try {
      const r = await fetch(`${API}/programs`, { method: "POST", headers: hdrs(), body: JSON.stringify(buildBody(createForm)) });
      if (r.ok) { setCreateOpen(false); setCreateForm({ ...EMPTY_FORM }); fetchAll(); }
      else { const e = await r.json().catch(() => ({})); setCreateErr(e.message || "Failed to create program"); }
    } catch { setCreateErr("Network error."); }
    finally { setCreateSaving(false); }
  };

  const openEdit = (prog: Program) => {
    setEditProg(prog);
    setEditForm({
      name: prog.name, nameAr: prog.nameAr || "", slug: prog.slug,
      description: prog.description || "", icon: prog.icon || "", image: prog.image || "",
      level: prog.level || "", price: prog.price?.toString() || "",
      maxStudents: prog.maxStudents?.toString() || "", totalSessions: prog.totalSessions?.toString() || "7", isActive: prog.isActive,
      ageGroupId: prog.ageGroupId || "", coachId: prog.coachId || "",
    });
    setEditErr(null);
  };

  const handleEdit = async () => {
    if (!editProg) return;
    if (!editForm.name.trim()) { setEditErr("Program name is required."); return; }
    setEditSaving(true); setEditErr(null);
    try {
      const r = await fetch(`${API}/programs/${editProg.id}`, { method: "PATCH", headers: hdrs(), body: JSON.stringify(buildBody(editForm)) });
      if (r.ok) { setEditProg(null); fetchAll(); }
      else { const e = await r.json().catch(() => ({})); setEditErr(e.message || "Failed to update program"); }
    } catch { setEditErr("Network error."); }
    finally { setEditSaving(false); }
  };

  const handleDelete = async () => {
    if (!delProg) return;
    setDeleting(true);
    try {
      const r = await fetch(`${API}/programs/${delProg.id}`, { method: "DELETE", headers: hdrs() });
      if (r.ok) { setDelProg(null); fetchAll(); }
      else { const e = await r.json().catch(() => ({})); setError(e.message || "Failed to delete"); setDelProg(null); }
    } catch { setError("Network error"); setDelProg(null); }
    finally { setDeleting(false); }
  };

  const openEnroll = (prog: Program) => { setEnrollProg(prog); setEnrollStudentId(""); setEnrollErr(null); };

  const handleEnroll = async () => {
    if (!enrollProg || !enrollStudentId) return;
    setEnrolling(true); setEnrollErr(null);
    try {
      const r = await fetch(`${API}/programs/${enrollProg.id}/enroll`, { method: "POST", headers: hdrs(), body: JSON.stringify({ studentId: enrollStudentId }) });
      if (r.ok) { setEnrollProg(null); fetchAll(); }
      else { const e = await r.json().catch(() => ({})); setEnrollErr(e.message || "Failed to enroll student"); }
    } catch { setEnrollErr("Network error."); }
    finally { setEnrolling(false); }
  };

  const filtered = programs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.ageGroup?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.coach?.user?.firstName?.toLowerCase().includes(search.toLowerCase())
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
      <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">←</Link>
            <div>
              <h1 className="text-2xl font-black text-white">📋 Programs</h1>
              <p className="text-white/40 text-sm">{programs.length} total programs</p>
            </div>
          </div>
          <button onClick={() => { setCreateForm({ ...EMPTY_FORM }); setCreateErr(null); setCreateOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lebanon-green text-white font-semibold text-sm hover:bg-lebanon-green/90 transition-all shadow-lg shadow-lebanon-green/20">
            <span className="text-lg leading-none">+</span> Add Program
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <input type="text" placeholder="Search by name, age group or coach..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm mb-6" />

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex justify-between">
            <span>{error}</span><button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card p-6 animate-pulse h-48" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-white/40 mb-4">{search ? "No programs match your search" : "No programs yet"}</p>
            {!search && <button onClick={() => { setCreateForm({ ...EMPTY_FORM }); setCreateOpen(true); }} className="px-5 py-2.5 rounded-xl bg-lebanon-green text-white font-semibold text-sm">Add First Program</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(p => (
              <div key={p.id} className="glass-card overflow-hidden hover:border-purple-500/20 transition-all">
                {/* Image thumbnail */}
                {p.image && (
                  <div className="relative w-full h-32 bg-dark-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-800/80 to-transparent" />
                    {p.icon && (
                      <div className="absolute bottom-2 left-3 w-9 h-9 rounded-xl bg-dark-900/80 backdrop-blur-sm flex items-center justify-center text-xl border border-white/10">
                        {p.icon}
                      </div>
                    )}
                  </div>
                )}

                {/* Card body */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!p.image && p.icon && <span className="text-xl">{p.icon}</span>}
                        <h3 className="text-white font-bold text-lg">{p.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {p.ageGroup && <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">{p.ageGroup.name}</span>}
                        {p.level && <span className={`text-xs px-2 py-0.5 rounded-full border ${LEVEL_COLORS[p.level] || "bg-white/5 text-white/40 border-white/10"}`}>{p.level}</span>}
                        {p.coach && <span className="text-xs text-white/40">👤 {p.coach.user.firstName} {p.coach.user.lastName}</span>}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${p.isActive !== false ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                      {p.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {p.description && <p className="text-white/40 text-sm mb-4 line-clamp-2">{p.description}</p>}

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-dark-800 rounded-xl p-3 text-center">
                      <div className="text-white font-bold">{p._count?.enrollments ?? 0}</div>
                      <div className="text-white/30 text-xs">Enrolled</div>
                    </div>
                    <div className="bg-dark-800 rounded-xl p-3 text-center">
                      <div className="text-white font-bold">{p.maxStudents ?? "∞"}</div>
                      <div className="text-white/30 text-xs">Max</div>
                    </div>
                    <div className="bg-dark-800 rounded-xl p-3 text-center">
                      <div className="text-lebanon-green font-bold">{p.price ?? 0} QAR</div>
                      <div className="text-white/30 text-xs">Price</div>
                    </div>
                  </div>

                  {p.schedules && p.schedules.length > 0 && (
                    <div className="mb-4">
                      <div className="text-white/30 text-xs mb-2">Schedule</div>
                      <div className="flex flex-wrap gap-1">
                        {p.schedules.map(s => (
                          <span key={s.id} className="px-2 py-1 rounded-lg bg-dark-800 text-white/60 text-xs">
                            {typeof s.dayOfWeek === 'number' ? DAYS[s.dayOfWeek] : s.dayOfWeek} {s.startTime}–{s.endTime}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                    <button onClick={() => openEnroll(p)} className="flex-1 px-3 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-medium transition-all border border-purple-500/20">
                      + Enroll Student
                    </button>
                    <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-lebanon-green/20 text-white/40 flex items-center justify-center transition-all text-sm">✏️</button>
                    <button onClick={() => setDelProg(p)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 flex items-center justify-center transition-all text-sm">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateProgramModal
        open={createOpen} saving={createSaving} err={createErr}
        form={createForm} setForm={setCreateForm}
        ageGroups={ageGroups} coaches={coaches}
        onClose={() => { setCreateOpen(false); setCreateForm({ ...EMPTY_FORM }); }}
        onSave={handleCreate}
      />

      <EditProgramModal
        program={editProg} saving={editSaving} err={editErr}
        form={editForm} setForm={setEditForm}
        ageGroups={ageGroups} coaches={coaches}
        onClose={() => setEditProg(null)} onSave={handleEdit}
      />

      <DeleteProgramModal
        program={delProg} deleting={deleting}
        onClose={() => setDelProg(null)} onConfirm={handleDelete}
      />

      <EnrollStudentModal
        program={enrollProg} students={students} enrolling={enrolling}
        selectedStudentId={enrollStudentId} setSelectedStudentId={setEnrollStudentId}
        err={enrollErr} onClose={() => setEnrollProg(null)} onEnroll={handleEnroll}
      />
    </div>
  );
}
