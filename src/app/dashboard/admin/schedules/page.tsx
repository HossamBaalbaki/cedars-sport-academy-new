"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";
const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAY_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const inputCls = "w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-lebanon-green/50 text-sm";
const labelCls = "block text-white/60 text-xs font-medium mb-1.5";
const selectCls = "w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm";

interface Schedule {
  id: string; programId: string; locationId?: string;
  dayOfWeek: number; startTime: string; endTime: string;
  isActive: boolean; createdAt: string;
  program?: { id: string; name: string; icon?: string };
  location?: { id: string; name: string; city?: string };
}
interface AgeGroup { id: string; name: string; minAge?: number; maxAge?: number; }
interface Program {
  id: string; name: string; icon?: string;
  ageGroupId?: string; ageGroup?: AgeGroup; coachId?: string;
  coach?: { user?: { firstName?: string; lastName?: string; avatar?: string } };
}
interface Location { id: string; name: string; city?: string; }
interface ScheduleForm {
  selectedSport: string; selectedAgeGroupId: string; programId: string;
  locationId: string; dayOfWeek: string; startTime: string; endTime: string; isActive: boolean;
}
interface DaySlot { dayOfWeek: number; startTime: string; endTime: string; }
interface CreateScheduleForm {
  selectedSport: string; selectedAgeGroupId: string; programId: string;
  locationId: string; isActive: boolean; daySlots: DaySlot[];
}

const EMPTY: ScheduleForm = {
  selectedSport: "", selectedAgeGroupId: "", programId: "",
  locationId: "", dayOfWeek: "1", startTime: "09:00", endTime: "10:30", isActive: true,
};
const EMPTY_CREATE: CreateScheduleForm = {
  selectedSport: "", selectedAgeGroupId: "", programId: "",
  locationId: "", isActive: true, daySlots: [],
};

function fmt12(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2,"0")} ${h >= 12 ? "PM" : "AM"}`;
}

function formFromSched(s: Schedule, programs: Program[]): ScheduleForm {
  const p = programs.find(x => x.id === s.programId);
  return {
    selectedSport: p?.name || "", selectedAgeGroupId: p?.ageGroupId || "",
    programId: s.programId, locationId: s.locationId || "",
    dayOfWeek: String(s.dayOfWeek), startTime: s.startTime,
    endTime: s.endTime, isActive: s.isActive,
  };
}

export default function AdminSchedulesPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [error, setError] = useState<string|null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateScheduleForm>({...EMPTY_CREATE});
  const [createSaving, setCreateSaving] = useState(false);
  const [createErr, setCreateErr] = useState<string|null>(null);
  const [editSched, setEditSched] = useState<Schedule|null>(null);
  const [editForm, setEditForm] = useState<ScheduleForm>({...EMPTY});
  const [editSaving, setEditSaving] = useState(false);
  const [editErr, setEditErr] = useState<string|null>(null);
  const [delSched, setDelSched] = useState<Schedule|null>(null);
  const [deleting, setDeleting] = useState(false);

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
      const [sR, pR, lR] = await Promise.all([
        fetch(`${API}/schedules`, { headers: hdrs() }),
        fetch(`${API}/programs`, { headers: hdrs() }),
        fetch(`${API}/locations`, { headers: hdrs() }),
      ]);
      if (sR.ok) { const d = await sR.json(); setSchedules(d.data || []); } else setError("Failed to load schedules");
      if (pR.ok) { const d = await pR.json(); setPrograms(d.data || []); }
      if (lR.ok) { const d = await lR.json(); setLocations(d.data || []); }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }, [token, hdrs]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const buildBody = (f: ScheduleForm) => {
    const b: Record<string,unknown> = {
      programId: f.programId, dayOfWeek: parseInt(f.dayOfWeek),
      startTime: f.startTime, endTime: f.endTime, isActive: f.isActive,
    };
    if (f.locationId) b.locationId = f.locationId;
    return b;
  };

  const handleCreate = async () => {
    if (!createForm.selectedSport) { setCreateErr("Please select a sport."); return; }
    if (!createForm.selectedAgeGroupId) { setCreateErr("Please select an age group."); return; }
    if (!createForm.programId) { setCreateErr("No matching program for this sport + age group."); return; }
    if (createForm.daySlots.length === 0) { setCreateErr("Please select at least one day."); return; }
    if (createForm.daySlots.some(s => !s.startTime || !s.endTime)) {
      setCreateErr("All selected days must have start and end time.");
      return;
    }

    setCreateSaving(true); setCreateErr(null);
    try {
      const results = await Promise.all(
        createForm.daySlots.map(async (slot) => {
          const body: Record<string, unknown> = {
            programId: createForm.programId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isActive: createForm.isActive,
          };
          if (createForm.locationId) body.locationId = createForm.locationId;
          return fetch(`${API}/schedules`, { method:"POST", headers:hdrs(), body:JSON.stringify(body) });
        })
      );

      const failed = results.find(r => !r.ok);
      if (failed) {
        const e = await failed.json().catch(()=>({}));
        setCreateErr(e.message || "Failed to create one or more schedules");
      } else {
        setCreateOpen(false);
        setCreateForm({...EMPTY_CREATE});
        fetchAll();
      }
    } catch { setCreateErr("Network error."); }
    finally { setCreateSaving(false); }
  };

  const openEdit = (s: Schedule) => { setEditSched(s); setEditForm(formFromSched(s, programs)); setEditErr(null); };

  const handleEdit = async () => {
    if (!editSched) return;
    if (!editForm.selectedSport) { setEditErr("Please select a sport."); return; }
    if (!editForm.selectedAgeGroupId) { setEditErr("Please select an age group."); return; }
    if (!editForm.programId) { setEditErr("No matching program for this sport + age group."); return; }
    setEditSaving(true); setEditErr(null);
    try {
      const r = await fetch(`${API}/schedules/${editSched.id}`, { method:"PATCH", headers:hdrs(), body:JSON.stringify(buildBody(editForm)) });
      if (r.ok) { setEditSched(null); fetchAll(); }
      else { const e = await r.json().catch(()=>({})); setEditErr(e.message || "Failed to update"); }
    } catch { setEditErr("Network error."); }
    finally { setEditSaving(false); }
  };

  const handleDelete = async () => {
    if (!delSched) return;
    setDeleting(true);
    try {
      const r = await fetch(`${API}/schedules/${delSched.id}`, { method:"DELETE", headers:hdrs() });
      if (r.ok) { setDelSched(null); fetchAll(); }
      else { const e = await r.json().catch(()=>({})); setError(e.message || "Failed to delete"); setDelSched(null); }
    } catch { setError("Network error"); setDelSched(null); }
    finally { setDeleting(false); }
  };

  const filtered = schedules.filter(s => {
    const pn = s.program?.name?.toLowerCase() || "";
    const ln = s.location?.name?.toLowerCase() || "";
    return (!search || pn.includes(search.toLowerCase()) || ln.includes(search.toLowerCase()))
      && (!filterDay || String(s.dayOfWeek) === filterDay)
      && (!filterProgram || s.programId === filterProgram);
  });

  const byDay = DAY_NAMES.map((day, idx) => ({
    day, idx, items: filtered.filter(s => s.dayOfWeek === idx),
  })).filter(g => g.items.length > 0);

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
              <h1 className="text-2xl font-black text-white">🗓️ Schedules</h1>
              <p className="text-white/40 text-sm">{schedules.length} total sessions</p>
            </div>
          </div>
          <button onClick={() => { setCreateForm({...EMPTY_CREATE}); setCreateErr(null); setCreateOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lebanon-green text-white font-semibold text-sm hover:bg-lebanon-green/90 transition-all shadow-lg shadow-lebanon-green/20">
            <span className="text-lg leading-none">+</span> Add Schedule
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input type="text" placeholder="Search by program or location..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm" />
          <select value={filterDay} onChange={e => setFilterDay(e.target.value)}
            className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm min-w-[140px]">
            <option value="">All Days</option>
            {DAY_NAMES.map((d,i) => <option key={i} value={String(i)}>{d}</option>)}
          </select>
          <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)}
            className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm min-w-[160px]">
            <option value="">All Programs</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.icon ? `${p.icon} ` : ""}{p.name}</option>)}
          </select>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex justify-between">
            <span>{error}</span><button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[0,1,2].map(i => <div key={i} className="glass-card p-6 animate-pulse h-24" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">🗓️</div>
            <p className="text-white/40 mb-4">{search || filterDay || filterProgram ? "No schedules match your filters" : "No schedules yet"}</p>
            {!search && !filterDay && !filterProgram && (
              <button onClick={() => { setCreateForm({...EMPTY_CREATE}); setCreateOpen(true); }}
                className="px-5 py-2.5 rounded-xl bg-lebanon-green text-white font-semibold text-sm">
                Add First Schedule
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {byDay.map(({ day, idx, items }) => (
              <div key={idx}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-lebanon-green/10 border border-lebanon-green/20 flex items-center justify-center">
                    <span className="text-lebanon-green text-xs font-bold">{DAY_SHORT[idx]}</span>
                  </div>
                  <h3 className="text-white font-bold">{day}</h3>
                  <span className="text-white/30 text-sm">({items.length} session{items.length !== 1 ? "s" : ""})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map(s => (
                    <div key={s.id} className="glass-card p-4 hover:border-lebanon-green/20 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {s.program?.icon && <span className="text-base">{s.program.icon}</span>}
                            <span className="text-white font-semibold text-sm truncate">{s.program?.name || "Unknown Program"}</span>
                          </div>
                          {s.location && (
                            <p className="text-white/40 text-xs mt-0.5">📍 {s.location.name}{s.location.city ? `, ${s.location.city}` : ""}</p>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${s.isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                          {s.isActive ? "Active" : "Off"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lebanon-green text-sm font-bold">⏰ {fmt12(s.startTime)}</span>
                        <span className="text-white/30 text-xs">→</span>
                        <span className="text-white/60 text-sm">{fmt12(s.endTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <button onClick={() => openEdit(s)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-lebanon-green/20 text-white/60 hover:text-lebanon-green text-xs font-medium transition-all">
                          ✏️ Edit
                        </button>
                        <button onClick={() => setDelSched(s)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition-all text-xs">
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {createOpen && (
        <CreateScheduleModal title="Add New Schedule"
          form={createForm} setForm={setCreateForm}
          programs={programs} locations={locations}
          saving={createSaving} err={createErr}
          onClose={() => { setCreateOpen(false); setCreateForm({...EMPTY_CREATE}); }}
          onSave={handleCreate} saveLabel="Create Schedules" />
      )}

      {editSched && (
        <ScheduleModal title="Edit Schedule"
          form={editForm} setForm={setEditForm}
          programs={programs} locations={locations}
          saving={editSaving} err={editErr}
          onClose={() => setEditSched(null)}
          onSave={handleEdit} saveLabel="Save Changes" />
      )}

      {delSched && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDelSched(null)} />
          <div className="relative w-full max-w-sm bg-dark-800 border border-white/10 rounded-2xl shadow-2xl p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Schedule</h3>
            <p className="text-white/50 text-sm mb-6">
              Delete <span className="text-white font-medium">{DAY_NAMES[delSched.dayOfWeek]}</span> session for{" "}
              <span className="text-white font-medium">{delSched.program?.name || "this program"}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDelSched(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Schedule Modal ─────────────────────────────────────────────────────────────

interface CreateModalProps {
  title: string;
  form: CreateScheduleForm; setForm: (f: CreateScheduleForm) => void;
  programs: Program[]; locations: Location[];
  saving: boolean; err: string | null;
  onClose: () => void; onSave: () => void; saveLabel: string;
}

function CreateScheduleModal({ title, form, setForm, programs, locations, saving, err, onClose, onSave, saveLabel }: CreateModalProps) {
  const sportOptions = Array.from(new Set(programs.map(p => p.name))).sort();

  const ageGroupOptions: AgeGroup[] = form.selectedSport
    ? programs
        .filter(p => p.name === form.selectedSport && p.ageGroup)
        .reduce<AgeGroup[]>((acc, p) => {
          if (p.ageGroup && !acc.find(a => a.id === p.ageGroup!.id)) acc.push(p.ageGroup!);
          return acc;
        }, [])
        .sort((a, b) => (a.minAge ?? 0) - (b.minAge ?? 0))
    : [];

  const resolved = form.selectedSport && form.selectedAgeGroupId
    ? programs.find(p => p.name === form.selectedSport && p.ageGroupId === form.selectedAgeGroupId)
    : undefined;

  const coachUser = resolved?.coach?.user;
  const coachName = coachUser ? `${coachUser.firstName || ""} ${coachUser.lastName || ""}`.trim() : "";

  const onSportChange = (sport: string) => setForm({ ...form, selectedSport: sport, selectedAgeGroupId: "", programId: "", daySlots: [] });
  const onAgeGroupChange = (agId: string) => {
    const matched = programs.find(p => p.name === form.selectedSport && p.ageGroupId === agId);
    setForm({ ...form, selectedAgeGroupId: agId, programId: matched?.id || "", daySlots: [] });
  };

  const toggleDay = (dayOfWeek: number) => {
    const exists = form.daySlots.find(s => s.dayOfWeek === dayOfWeek);
    if (exists) {
      setForm({ ...form, daySlots: form.daySlots.filter(s => s.dayOfWeek !== dayOfWeek) });
    } else {
      setForm({
        ...form,
        daySlots: [...form.daySlots, { dayOfWeek, startTime: "09:00", endTime: "10:30" }].sort((a, b) => a.dayOfWeek - b.dayOfWeek),
      });
    }
  };

  const updateSlot = (dayOfWeek: number, patch: Partial<DaySlot>) => {
    setForm({
      ...form,
      daySlots: form.daySlots.map(s => (s.dayOfWeek === dayOfWeek ? { ...s, ...patch } : s)),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {err && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{err}</div>}

          <div>
            <label className={labelCls}>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-lebanon-green/20 text-lebanon-green text-xs flex items-center justify-center font-bold">1</span>
                Sport <span className="text-red-400">*</span>
              </span>
            </label>
            <select value={form.selectedSport} onChange={e => onSportChange(e.target.value)} className={selectCls}>
              <option value="">— Select a sport —</option>
              {sportOptions.map(name => {
                const p = programs.find(x => x.name === name);
                return <option key={name} value={name}>{p?.icon ? `${p.icon} ` : ""}{name}</option>;
              })}
            </select>
          </div>

          {form.selectedSport && (
            <div>
              <label className={labelCls}>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-lebanon-green/20 text-lebanon-green text-xs flex items-center justify-center font-bold">2</span>
                  Age Group <span className="text-red-400">*</span>
                </span>
              </label>
              {ageGroupOptions.length === 0 ? (
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
                  ⚠️ No age groups configured for <strong>{form.selectedSport}</strong>.
                </div>
              ) : (
                <select value={form.selectedAgeGroupId} onChange={e => onAgeGroupChange(e.target.value)} className={selectCls}>
                  <option value="">— Select an age group —</option>
                  {ageGroupOptions.map(ag => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name}{ag.minAge != null && ag.maxAge != null ? ` (${ag.minAge}–${ag.maxAge} yrs)` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {form.selectedSport && form.selectedAgeGroupId && (
            <div className={`p-3 rounded-xl border ${resolved ? "bg-lebanon-green/5 border-lebanon-green/20" : "bg-red-500/10 border-red-500/20"}`}>
              {resolved ? (
                <div>
                  <div className="text-xs text-white/50 mb-1.5">✅ Program resolved — Coach (auto)</div>
                  <span className="text-sm text-white font-medium">{coachName || "No coach assigned"}</span>
                </div>
              ) : (
                <div className="text-sm text-red-400">⚠️ No program found for this sport + age group.</div>
              )}
            </div>
          )}

          <div>
            <label className={labelCls}>Location</label>
            <select value={form.locationId} onChange={e => setForm({ ...form, locationId: e.target.value })} className={selectCls}>
              <option value="">— Select location —</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}{l.city ? ` — ${l.city}` : ""}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Select Days <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-7 gap-2">
              {DAY_SHORT.map((d, i) => {
                const active = form.daySlots.some(s => s.dayOfWeek === i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`px-2 py-2 rounded-lg text-xs font-semibold border transition-all ${active ? "bg-lebanon-green text-white border-lebanon-green" : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {form.daySlots.length > 0 && (
            <div className="space-y-3">
              <label className={labelCls}>Time per selected day</label>
              {form.daySlots.map(slot => (
                <div key={slot.dayOfWeek} className="grid grid-cols-3 gap-3 items-end p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-white text-sm font-medium">{DAY_NAMES[slot.dayOfWeek]}</div>
                  <div>
                    <label className={labelCls}>Start</label>
                    <input type="time" value={slot.startTime} onChange={e => updateSlot(slot.dayOfWeek, { startTime: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End</label>
                    <input type="time" value={slot.endTime} onChange={e => updateSlot(slot.dayOfWeek, { endTime: e.target.value })} className={inputCls} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`w-10 h-6 rounded-full relative transition-colors ${form.isActive ? "bg-lebanon-green" : "bg-white/10"}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isActive ? "translate-x-5" : "translate-x-1"}`} />
            </button>
            <span className="text-white/60 text-sm">{form.isActive ? "Active" : "Inactive"}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all">Cancel</button>
          <button onClick={onSave} disabled={saving}
            className="px-5 py-2 rounded-xl bg-lebanon-green hover:bg-lebanon-green/90 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2">
            {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? "Saving..." : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ModalProps {
  title: string;
  form: ScheduleForm; setForm: (f: ScheduleForm) => void;
  programs: Program[]; locations: Location[];
  saving: boolean; err: string | null;
  onClose: () => void; onSave: () => void; saveLabel: string;
}

function ScheduleModal({ title, form, setForm, programs, locations, saving, err, onClose, onSave, saveLabel }: ModalProps) {
  const sportOptions = Array.from(new Set(programs.map(p => p.name))).sort();

  const ageGroupOptions: AgeGroup[] = form.selectedSport
    ? programs
        .filter(p => p.name === form.selectedSport && p.ageGroup)
        .reduce<AgeGroup[]>((acc, p) => {
          if (p.ageGroup && !acc.find(a => a.id === p.ageGroup!.id)) acc.push(p.ageGroup!);
          return acc;
        }, [])
        .sort((a, b) => (a.minAge ?? 0) - (b.minAge ?? 0))
    : [];

  const resolved = form.selectedSport && form.selectedAgeGroupId
    ? programs.find(p => p.name === form.selectedSport && p.ageGroupId === form.selectedAgeGroupId)
    : undefined;

  const coachUser = resolved?.coach?.user;
  const coachName = coachUser ? `${coachUser.firstName || ""} ${coachUser.lastName || ""}`.trim() : "";

  const onSportChange = (sport: string) => setForm({ ...form, selectedSport: sport, selectedAgeGroupId: "", programId: "" });
  const onAgeGroupChange = (agId: string) => {
    const matched = programs.find(p => p.name === form.selectedSport && p.ageGroupId === agId);
    setForm({ ...form, selectedAgeGroupId: agId, programId: matched?.id || "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {err && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{err}</div>}

          {/* Step 1 — Sport */}
          <div>
            <label className={labelCls}>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-lebanon-green/20 text-lebanon-green text-xs flex items-center justify-center font-bold">1</span>
                Sport <span className="text-red-400">*</span>
              </span>
            </label>
            <select value={form.selectedSport} onChange={e => onSportChange(e.target.value)} className={selectCls}>
              <option value="">— Select a sport —</option>
              {sportOptions.map(name => {
                const p = programs.find(x => x.name === name);
                return <option key={name} value={name}>{p?.icon ? `${p.icon} ` : ""}{name}</option>;
              })}
            </select>
          </div>

          {/* Step 2 — Age Group */}
          {form.selectedSport && (
            <div>
              <label className={labelCls}>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-lebanon-green/20 text-lebanon-green text-xs flex items-center justify-center font-bold">2</span>
                  Age Group <span className="text-red-400">*</span>
                </span>
              </label>
              {ageGroupOptions.length === 0 ? (
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
                  ⚠️ No age groups configured for <strong>{form.selectedSport}</strong>. Assign an age group to this program first.
                </div>
              ) : (
                <select value={form.selectedAgeGroupId} onChange={e => onAgeGroupChange(e.target.value)} className={selectCls}>
                  <option value="">— Select an age group —</option>
                  {ageGroupOptions.map(ag => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name}{ag.minAge != null && ag.maxAge != null ? ` (${ag.minAge}–${ag.maxAge} yrs)` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Coach auto-resolved */}
          {form.selectedSport && form.selectedAgeGroupId && (
            <div className={`p-3 rounded-xl border ${resolved ? "bg-lebanon-green/5 border-lebanon-green/20" : "bg-red-500/10 border-red-500/20"}`}>
              {resolved ? (
                <div>
                  <div className="text-xs text-white/50 mb-1.5">✅ Program resolved — Coach (auto)</div>
                  {coachName ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-lebanon-green/20 flex items-center justify-center text-sm">👨‍🏫</div>
                      <span className="text-sm text-white font-medium">{coachName}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-white/50">No coach assigned to this program</span>
                  )}
                </div>
              ) : (
                <div className="text-sm text-red-400">⚠️ No program found matching this sport + age group combination.</div>
              )}
            </div>
          )}

          {/* Location */}
          <div>
            <label className={labelCls}>Location <span className="text-white/30">(optional)</span></label>
            <select value={form.locationId} onChange={e => setForm({...form, locationId: e.target.value})} className={selectCls}>
              <option value="">— No specific location —</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}{l.city ? ` — ${l.city}` : ""}</option>)}
            </select>
          </div>

          {/* Day */}
          <div>
            <label className={labelCls}>Day of Week <span className="text-red-400">*</span></label>
            <select value={form.dayOfWeek} onChange={e => setForm({...form, dayOfWeek: e.target.value})} className={selectCls}>
              {DAY_NAMES.map((d,i) => <option key={i} value={String(i)}>{d}</option>)}
            </select>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start Time <span className="text-red-400">*</span></label>
              <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Time <span className="text-red-400">*</span></label>
              <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} className={inputCls} />
            </div>
          </div>

          {/* Time preview */}
          {form.startTime && form.endTime && (
            <div className="p-3 rounded-xl bg-lebanon-green/5 border border-lebanon-green/20 flex items-center gap-3">
              <span className="text-lebanon-green text-sm">⏰</span>
              <span className="text-white/70 text-sm">
                {DAY_NAMES[parseInt(form.dayOfWeek)]} · {fmt12(form.startTime)} → {fmt12(form.endTime)}
              </span>
            </div>
          )}

          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setForm({...form, isActive: !form.isActive})}
              className={`w-10 h-6 rounded-full relative transition-colors ${form.isActive ? "bg-lebanon-green" : "bg-white/10"}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isActive ? "translate-x-5" : "translate-x-1"}`} />
            </button>
            <span className="text-white/60 text-sm">{form.isActive ? "Active" : "Inactive"}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all">Cancel</button>
          <button onClick={onSave} disabled={saving}
            className="px-5 py-2 rounded-xl bg-lebanon-green hover:bg-lebanon-green/90 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2">
            {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? "Saving..." : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
