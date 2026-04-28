"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

const inputCls = "w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-lebanon-green/50 text-sm";
const labelCls = "block text-white/60 text-xs font-medium mb-1.5";

interface Location {
  id: string;
  name: string;
  address?: string;
  city?: string;
  image?: string;
  facilities: string[];
  isMain: boolean;
  isActive: boolean;
  createdAt: string;
}

interface LocationForm {
  name: string;
  address: string;
  city: string;
  image: string;
  facilities: string; // comma-separated
  isMain: boolean;
  isActive: boolean;
}

const EMPTY_FORM: LocationForm = {
  name: "", address: "", city: "",
  image: "", facilities: "", isMain: false, isActive: true,
};

export default function AdminLocationsPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Create
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<LocationForm>({ ...EMPTY_FORM });
  const [createSaving, setCreateSaving] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  // Edit
  const [editLoc, setEditLoc] = useState<Location | null>(null);
  const [editForm, setEditForm] = useState<LocationForm>({ ...EMPTY_FORM });
  const [editSaving, setEditSaving] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);

  // Delete
  const [delLoc, setDelLoc] = useState<Location | null>(null);
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
      const r = await fetch(`${API}/locations`, { headers: hdrs() });
      if (r.ok) { const d = await r.json(); setLocations(d.data || []); }
      else setError("Failed to load locations");
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }, [token, hdrs]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const buildBody = (form: LocationForm) => {
    const body: Record<string, unknown> = {
      name: form.name.trim(),
      isMain: form.isMain,
      isActive: form.isActive,
      facilities: form.facilities.split(",").map(f => f.trim()).filter(Boolean),
    };
    if (form.address.trim()) body.address = form.address.trim();
    if (form.city.trim()) body.city = form.city.trim();
    if (form.image.trim()) body.image = form.image.trim();
    return body;
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) { setCreateErr("Location name is required."); return; }
    setCreateSaving(true); setCreateErr(null);
    try {
      const r = await fetch(`${API}/locations`, { method: "POST", headers: hdrs(), body: JSON.stringify(buildBody(createForm)) });
      if (r.ok) { setCreateOpen(false); setCreateForm({ ...EMPTY_FORM }); fetchAll(); }
      else { const e = await r.json().catch(() => ({})); setCreateErr(e.message || "Failed to create location"); }
    } catch { setCreateErr("Network error."); }
    finally { setCreateSaving(false); }
  };

  const openEdit = (loc: Location) => {
    setEditLoc(loc);
    setEditForm({
      name: loc.name, address: loc.address || "", city: loc.city || "",
      image: loc.image || "",
      facilities: (loc.facilities || []).join(", "),
      isMain: loc.isMain, isActive: loc.isActive,
    });
    setEditErr(null);
  };

  const handleEdit = async () => {
    if (!editLoc) return;
    if (!editForm.name.trim()) { setEditErr("Location name is required."); return; }
    setEditSaving(true); setEditErr(null);
    try {
      const r = await fetch(`${API}/locations/${editLoc.id}`, { method: "PATCH", headers: hdrs(), body: JSON.stringify(buildBody(editForm)) });
      if (r.ok) { setEditLoc(null); fetchAll(); }
      else { const e = await r.json().catch(() => ({})); setEditErr(e.message || "Failed to update location"); }
    } catch { setEditErr("Network error."); }
    finally { setEditSaving(false); }
  };

  const handleDelete = async () => {
    if (!delLoc) return;
    setDeleting(true);
    try {
      const r = await fetch(`${API}/locations/${delLoc.id}`, { method: "DELETE", headers: hdrs() });
      if (r.ok) { setDelLoc(null); fetchAll(); }
      else { const e = await r.json().catch(() => ({})); setError(e.message || "Failed to delete"); setDelLoc(null); }
    } catch { setError("Network error"); setDelLoc(null); }
    finally { setDeleting(false); }
  };

  const filtered = locations.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.city?.toLowerCase().includes(search.toLowerCase()) ||
    l.address?.toLowerCase().includes(search.toLowerCase())
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
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">←</Link>
            <div>
              <h1 className="text-2xl font-black text-white">📍 Locations</h1>
              <p className="text-white/40 text-sm">{locations.length} total locations</p>
            </div>
          </div>
          <button
            onClick={() => { setCreateForm({ ...EMPTY_FORM }); setCreateErr(null); setCreateOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lebanon-green text-white font-semibold text-sm hover:bg-lebanon-green/90 transition-all shadow-lg shadow-lebanon-green/20"
          >
            <span className="text-lg leading-none">+</span> Add Location
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <input
          type="text" placeholder="Search by name, city or address..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm mb-6"
        />

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex justify-between">
            <span>{error}</span><button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card p-6 animate-pulse h-48" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">📍</div>
            <p className="text-white/40 mb-4">{search ? "No locations match your search" : "No locations yet"}</p>
            {!search && (
              <button onClick={() => { setCreateForm({ ...EMPTY_FORM }); setCreateOpen(true); }} className="px-5 py-2.5 rounded-xl bg-lebanon-green text-white font-semibold text-sm">
                Add First Location
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(loc => (
              <div key={loc.id} className="glass-card overflow-hidden hover:border-lebanon-green/20 transition-all">
                {/* Image */}
                {loc.image && (
                  <div className="relative w-full h-36 bg-dark-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-800/80 to-transparent" />
                    {loc.isMain && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-lebanon-green/90 text-white text-xs font-bold">
                        ⭐ Main
                      </div>
                    )}
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold text-base truncate">{loc.name}</h3>
                        {!loc.image && loc.isMain && (
                          <span className="px-1.5 py-0.5 rounded-full bg-lebanon-green/20 text-lebanon-green text-xs font-bold flex-shrink-0">Main</span>
                        )}
                      </div>
                      {loc.city && <p className="text-white/40 text-xs mt-0.5">📍 {loc.city}</p>}
                      {loc.address && <p className="text-white/30 text-xs mt-0.5 truncate">{loc.address}</p>}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${loc.isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                      {loc.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {loc.facilities && loc.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {loc.facilities.slice(0, 4).map(f => (
                        <span key={f} className="px-2 py-0.5 rounded-full bg-dark-800 text-white/40 text-xs border border-white/5">{f}</span>
                      ))}
                      {loc.facilities.length > 4 && (
                        <span className="px-2 py-0.5 rounded-full bg-dark-800 text-white/30 text-xs">+{loc.facilities.length - 4}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <button onClick={() => openEdit(loc)} className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-lebanon-green/20 text-white/60 hover:text-lebanon-green text-xs font-medium transition-all">
                      ✏️ Edit
                    </button>
                    <button onClick={() => setDelLoc(loc)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition-all text-sm">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      {createOpen && (
        <LocationModal
          title="Add New Location"
          form={createForm} setForm={setCreateForm}
          saving={createSaving} err={createErr}
          onClose={() => { setCreateOpen(false); setCreateForm({ ...EMPTY_FORM }); }}
          onSave={handleCreate}
          saveLabel="Create Location"
        />
      )}

      {/* ── Edit Modal ── */}
      {editLoc && (
        <LocationModal
          title={`Edit — ${editLoc.name}`}
          form={editForm} setForm={setEditForm}
          saving={editSaving} err={editErr}
          onClose={() => setEditLoc(null)}
          onSave={handleEdit}
          saveLabel="Save Changes"
        />
      )}

      {/* ── Delete Modal ── */}
      {delLoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDelLoc(null)} />
          <div className="relative w-full max-w-sm bg-dark-800 border border-white/10 rounded-2xl shadow-2xl p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Location</h3>
            <p className="text-white/50 text-sm mb-6">
              Are you sure you want to delete <span className="text-white font-medium">{delLoc.name}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDelLoc(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
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

// ── Location Form Modal ────────────────────────────────────────────────────────

interface LocationModalProps {
  title: string;
  form: LocationForm; setForm: (f: LocationForm) => void;
  saving: boolean; err: string | null;
  onClose: () => void; onSave: () => void;
  saveLabel: string;
}

function LocationModal({ title, form, setForm, saving, err, onClose, onSave, saveLabel }: LocationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center">✕</button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
          {err && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{err}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Location Name <span className="text-red-400">*</span></label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder=" Campus" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Doha" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main Street" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Image URL</label>
            <input type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." className={inputCls} />
          </div>

          {form.image.trim() && (
            <div>
              <label className={labelCls}>Image Preview</label>
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/10 bg-dark-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image.trim()} alt="Location preview"
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (next) next.style.display = "flex";
                  }}
                />
                <div className="absolute inset-0 hidden items-center justify-center text-white/30 text-sm flex-col gap-1">
                  <span className="text-2xl">🖼️</span><span>Invalid image URL</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/40 to-transparent pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className={labelCls}>Facilities <span className="text-white/30">(comma-separated)</span></label>
            <input type="text" value={form.facilities} onChange={e => setForm({ ...form, facilities: e.target.value })} placeholder="Football Pitch, Changing Rooms, Parking" className={inputCls} />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setForm({ ...form, isMain: !form.isMain })} className={`w-10 h-6 rounded-full relative transition-colors ${form.isMain ? "bg-lebanon-green" : "bg-white/10"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isMain ? "translate-x-5" : "translate-x-1"}`} />
              </button>
              <span className="text-white/60 text-sm">Main Location</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })} className={`w-10 h-6 rounded-full relative transition-colors ${form.isActive ? "bg-lebanon-green" : "bg-white/10"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isActive ? "translate-x-5" : "translate-x-1"}`} />
              </button>
              <span className="text-white/60 text-sm">{form.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-5 py-2 rounded-xl bg-lebanon-green hover:bg-lebanon-green/90 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2">
            {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? "Saving..." : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
