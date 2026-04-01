"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

interface AgeGroup {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  description?: string;
  isActive?: boolean;
  programs?: { id: string; name: string }[];
  createdAt: string;
}

const AGE_COLORS = [
  "from-blue-500/20 to-blue-700/20 border-blue-500/20 text-blue-400",
  "from-purple-500/20 to-purple-700/20 border-purple-500/20 text-purple-400",
  "from-orange-500/20 to-orange-700/20 border-orange-500/20 text-orange-400",
  "from-pink-500/20 to-pink-700/20 border-pink-500/20 text-pink-400",
  "from-cyan-500/20 to-cyan-700/20 border-cyan-500/20 text-cyan-400",
  "from-emerald-500/20 to-emerald-700/20 border-emerald-500/20 text-emerald-400",
];

export default function AdminAgeGroupsPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<AgeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<AgeGroup | null>(null);
  const [form, setForm] = useState({ name: "", minAge: "", maxAge: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  const fetchGroups = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/age-groups`, {
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data.data || []);
      } else {
        setError("Failed to load age groups");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", minAge: "", maxAge: "", description: "" });
    setShowForm(true);
  };

  const openEdit = (g: AgeGroup) => {
    setEditItem(g);
    setForm({ name: g.name, minAge: String(g.minAge), maxAge: String(g.maxAge), description: g.description || "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.minAge || !form.maxAge) return;
    setSaving(true);
    try {
      const url = editItem ? `${API}/age-groups/${editItem.id}` : `${API}/age-groups`;
      const method = editItem ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": TENANT,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          minAge: parseInt(form.minAge),
          maxAge: parseInt(form.maxAge),
          description: form.description || undefined,
        }),
      });
      if (res.ok) {
        setSuccess(editItem ? "Age group updated!" : "Age group created!");
        setShowForm(false);
        fetchGroups();
      } else {
        const err = await res.json();
        setError(err.message || "Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this age group?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/age-groups/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      if (res.ok) {
        setSuccess("Age group deleted");
        setGroups((prev) => prev.filter((g) => g.id !== id));
      } else {
        setError("Failed to delete");
      }
    } catch {
      setError("Network error");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/admin" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
                ←
              </Link>
              <div>
                <h1 className="text-2xl font-black text-white">🎯 Age Groups</h1>
                <p className="text-white/40 text-sm">{groups.length} age categories</p>
              </div>
            </div>
            <button
              onClick={openAdd}
              className="px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 transition-all"
            >
              + New Age Group
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex justify-between">
            {error} <button onClick={() => setError(null)}>✕</button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex justify-between">
            {success} <button onClick={() => setSuccess(null)}>✕</button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="glass-card p-6 mb-6">
            <h3 className="text-white font-bold mb-4">{editItem ? "Edit Age Group" : "New Age Group"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Name (e.g. Under 10) *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
              />
              <input
                type="number"
                placeholder="Min Age *"
                value={form.minAge}
                onChange={(e) => setForm({ ...form, minAge: e.target.value })}
                min={1}
                max={100}
                className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
              />
              <input
                type="number"
                placeholder="Max Age *"
                value={form.maxAge}
                onChange={(e) => setForm({ ...form, maxAge: e.target.value })}
                min={1}
                max={100}
                className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
              />
            </div>
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.minAge || !form.maxAge}
                className="px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 disabled:opacity-50 transition-all"
              >
                {saving ? "Saving..." : editItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse h-36" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-white/40">No age groups yet. Create your first category!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g, idx) => {
              const colorClass = AGE_COLORS[idx % AGE_COLORS.length];
              const [gradFrom, gradTo, borderColor, textColor] = colorClass.split(" ");
              return (
                <div key={g.id} className={`glass-card p-6 bg-gradient-to-br ${gradFrom} ${gradTo} border ${borderColor} hover:scale-[1.01] transition-all`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`text-lg font-black ${textColor}`}>{g.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white/60 text-sm">Ages</span>
                        <span className="text-white font-bold text-sm">{g.minAge} – {g.maxAge}</span>
                        <span className="text-white/40 text-xs">years</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradFrom} ${gradTo} flex items-center justify-center text-xl border ${borderColor}`}>
                      🎯
                    </div>
                  </div>

                  {g.description && (
                    <p className="text-white/50 text-xs mb-3 line-clamp-2">{g.description}</p>
                  )}

                  {g.programs && g.programs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {g.programs.slice(0, 3).map((p) => (
                        <span key={p.id} className="px-2 py-0.5 rounded-full bg-white/5 text-white/50 text-xs border border-white/10">
                          {p.name}
                        </span>
                      ))}
                      {g.programs.length > 3 && (
                        <span className="text-white/30 text-xs self-center">+{g.programs.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-white/30 text-xs">
                      {new Date(g.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(g)}
                        className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-all"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        disabled={deletingId === g.id}
                        className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-all disabled:opacity-50"
                      >
                        {deletingId === g.id ? "..." : "🗑️"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
