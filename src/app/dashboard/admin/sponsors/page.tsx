"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import MediaUpload from "@/components/ui/MediaUpload";

const API    = process.env.NEXT_PUBLIC_API_URL  || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

interface Sponsor {
  id: string;
  name: string;
  description?: string;
  logoUrl: string;
  websiteUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

const EMPTY = { name: "", description: "", logoUrl: "", websiteUrl: "", order: 0, isActive: true };

function ensureProtocol(url: string) {
  if (!url) return "#";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export default function AdminSponsorsPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const [editId, setEditId]       = useState<string | null>(null);
  const [editForm, setEditForm]   = useState(EMPTY);
  const [editSaving, setEditSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  const fetchSponsors = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/sponsors/admin/all`, {
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      if (res.ok) {
        const data = await res.json();
        setSponsors(data.data || []);
      } else {
        setError("Failed to load sponsors");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchSponsors(); }, [fetchSponsors]);

  async function handleAdd() {
    if (!form.name || !form.logoUrl || !form.websiteUrl) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/sponsors`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess("Sponsor added!");
        setForm(EMPTY);
        setShowForm(false);
        fetchSponsors();
      } else {
        const err = await res.json();
        setError(err.message || "Failed to add sponsor");
      }
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  }

  async function handleEdit() {
    if (!editId || !editForm.name || !editForm.logoUrl || !editForm.websiteUrl) return;
    setEditSaving(true);
    try {
      const res = await fetch(`${API}/sponsors/${editId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT, "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setSuccess("Sponsor updated!");
        setEditId(null);
        fetchSponsors();
      } else {
        const err = await res.json();
        setError(err.message || "Failed to update sponsor");
      }
    } catch { setError("Network error"); }
    finally { setEditSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this sponsor?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/sponsors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      if (res.ok) {
        setSuccess("Sponsor deleted");
        setSponsors((prev) => prev.filter((s) => s.id !== id));
      } else {
        setError("Failed to delete sponsor");
      }
    } catch { setError("Network error"); }
    finally { setDeletingId(null); }
  }

  async function toggleActive(sponsor: Sponsor) {
    try {
      await fetch(`${API}/sponsors/${sponsor.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT, "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !sponsor.isActive }),
      });
      fetchSponsors();
    } catch { setError("Network error"); }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/admin" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
                ←
              </Link>
              <div>
                <h1 className="text-2xl font-black text-white">🤝 Sponsors</h1>
                <p className="text-white/40 text-sm">{sponsors.length} sponsors · {sponsors.filter(s => s.isActive).length} active</p>
              </div>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setForm(EMPTY); }}
              className="px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 transition-all"
            >
              + Add Sponsor
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex justify-between">
            {error}<button onClick={() => setError(null)}>✕</button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex justify-between">
            {success}<button onClick={() => setSuccess(null)}>✕</button>
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="glass-card p-6 mb-6">
            <h3 className="text-white font-bold mb-4">Add New Sponsor</h3>
            <SponsorForm
              form={form}
              onChange={setForm}
              onSubmit={handleAdd}
              onCancel={() => setShowForm(false)}
              saving={saving}
              label="Add Sponsor"
            />
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card h-20 animate-pulse" />
            ))}
          </div>
        ) : sponsors.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">🤝</div>
            <p className="text-white/40">No sponsors yet. Add your first sponsor!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sponsors.map((sponsor) => (
              <div key={sponsor.id}>
                {editId === sponsor.id ? (
                  <div className="glass-card p-6">
                    <h3 className="text-white font-bold mb-4">Edit Sponsor</h3>
                    <SponsorForm
                      form={editForm}
                      onChange={setEditForm}
                      onSubmit={handleEdit}
                      onCancel={() => setEditId(null)}
                      saving={editSaving}
                      label="Save Changes"
                    />
                  </div>
                ) : (
                  <div className="glass-card p-4 flex items-center gap-4">
                    {/* Logo preview */}
                    <div className="w-20 h-14 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sponsor.logoUrl} alt={sponsor.name} className="max-w-full max-h-full object-contain p-1" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold truncate">{sponsor.name}</span>
                        {sponsor.description && <span className="text-white/40 text-xs truncate">{sponsor.description}</span>}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sponsor.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"}`}>
                          {sponsor.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <a href={ensureProtocol(sponsor.websiteUrl)} target="_blank" rel="noopener noreferrer" className="text-white/40 text-xs hover:text-lebanon-green/70 transition-colors truncate block">
                        {sponsor.websiteUrl}
                      </a>
                      <div className="text-white/30 text-xs mt-0.5">Order: {sponsor.order}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleActive(sponsor)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sponsor.isActive ? "bg-white/5 text-white/50 hover:bg-red-500/10 hover:text-red-400" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"}`}
                      >
                        {sponsor.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => { setEditId(sponsor.id); setEditForm({ name: sponsor.name, description: sponsor.description ?? "", logoUrl: sponsor.logoUrl, websiteUrl: sponsor.websiteUrl, order: sponsor.order, isActive: sponsor.isActive }); }}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sponsor.id)}
                        disabled={deletingId === sponsor.id}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 disabled:opacity-50 transition-all"
                      >
                        {deletingId === sponsor.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Reusable form ────────────────────────────────────────────────────────────

function SponsorForm({
  form, onChange, onSubmit, onCancel, saving, label,
}: {
  form: typeof EMPTY;
  onChange: (f: typeof EMPTY) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
  label: string;
}) {
  const inp = "px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm w-full";
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input placeholder="Sponsor name *" value={form.name} onChange={e => onChange({ ...form, name: e.target.value })} className={inp} />
        <input placeholder="Caption under logo (e.g. Lebanese Community)" value={form.description} onChange={e => onChange({ ...form, description: e.target.value })} className={inp} />
        <input placeholder="Website URL * (https://...)" value={form.websiteUrl} onChange={e => onChange({ ...form, websiteUrl: e.target.value })} className={inp} />
        <div className="flex items-center gap-3">
          <input type="number" placeholder="Display order (0 = first)" value={form.order} onChange={e => onChange({ ...form, order: Number(e.target.value) })} className={inp} />
        </div>
        <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={e => onChange({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-lebanon-green" />
          Active (show in ticker)
        </label>
      </div>
      <MediaUpload
        label="Sponsor Logo *"
        accept="image"
        value={form.logoUrl}
        onChange={url => onChange({ ...form, logoUrl: url })}
        hint="Upload a PNG or SVG with transparent background for best results"
      />
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={saving || !form.name || !form.logoUrl || !form.websiteUrl}
          className="px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 disabled:opacity-50 transition-all"
        >
          {saving ? "Saving..." : label}
        </button>
      </div>
    </div>
  );
}
