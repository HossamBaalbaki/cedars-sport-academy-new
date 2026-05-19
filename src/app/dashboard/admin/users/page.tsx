"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Child { id: string; firstName: string; lastName: string; studentCode?: string | null; isActive?: boolean; }

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  children: Child[];
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  ADMIN:       "bg-red-500/15 text-red-300 border-red-500/30",
  COACH:       "bg-blue-500/15 text-blue-300 border-blue-500/30",
  PARENT:      "bg-green-500/15 text-green-300 border-green-500/30",
  STUDENT:     "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
};

const ROLES = ["SUPER_ADMIN", "ADMIN", "COACH", "PARENT", "STUDENT"];

function initials(u: UserRow) {
  return `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase();
}

// ── Edit Modal ─────────────────────────────────────────────────────────────────
interface EditForm { firstName: string; lastName: string; email: string; phone: string; role: string; }

function EditUserModal({ user, saving, error, onSave, onClose }: {
  user: UserRow; saving: boolean; error: string | null;
  onSave: (f: EditForm) => void; onClose: () => void;
}) {
  const [form, setForm] = useState<EditForm>({
    firstName: user.firstName, lastName: user.lastName,
    email: user.email, phone: user.phone || "", role: user.role,
  });
  const set = (k: keyof EditForm, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Edit User</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            {(["firstName","lastName"] as const).map(k => (
              <div key={k}>
                <label className="block text-white/50 text-xs mb-1.5">{k === "firstName" ? "First Name" : "Last Name"}</label>
                <input value={form[k]} onChange={e => set(k, e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-lebanon-green/50 text-sm" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-white/50 text-xs mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-lebanon-green/50 text-sm" />
          </div>
          <div>
            <label className="block text-white/50 text-xs mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-lebanon-green/50 text-sm" placeholder="+974 ..." />
          </div>
          <div>
            <label className="block text-white/50 text-xs mb-1.5">Role</label>
            <select value={form.role} onChange={e => set("role", e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm">
              {ROLES.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-white/5 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium transition-all">Cancel</button>
          <button onClick={() => onSave(form)} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-lebanon-green hover:bg-lebanon-green/90 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Children tooltip/panel ─────────────────────────────────────────────────────
function ChildrenBadge({ items }: { items: Child[] }) {
  const [open, setOpen] = useState(false);
  if (!items.length) return <span className="text-white/25 text-sm">—</span>;
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all border border-white/10"
      >
        <span>👶</span>
        <span>{items.length} {items.length === 1 ? "child" : "children"}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-8 z-20 w-56 bg-dark-800 border border-white/10 rounded-xl shadow-2xl p-2">
            {items.map(c => (
              <div key={c.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5">
                <div className="w-6 h-6 rounded-full bg-lebanon-green/20 flex items-center justify-center text-xs font-bold text-lebanon-green shrink-0">
                  {c.firstName[0]}{c.lastName[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-white/80 text-xs font-medium truncate">{c.firstName} {c.lastName}</div>
                  {c.studentCode && <div className="text-white/30 text-xs">{c.studentCode}</div>}
                </div>
                <div className={`ml-auto w-1.5 h-1.5 rounded-full shrink-0 ${c.isActive ? "bg-green-400" : "bg-red-400"}`} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const { token } = useAuth();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const hdrs = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Tenant-ID": TENANT,
  }), [token]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const r = await fetch(`${API}/users`, { headers: hdrs() });
      if (!r.ok) throw new Error("Failed to load users");
      const d = await r.json();
      setUsers(d.data ?? []);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  }, [hdrs]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSave = async (form: EditForm) => {
    if (!editUser) return;
    setSaving(true); setEditError(null);
    try {
      const r = await fetch(`${API}/users/${editUser.id}`, {
        method: "PATCH", headers: hdrs(),
        body: JSON.stringify({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phone: form.phone.trim() || null, role: form.role }),
      });
      if (r.ok) { setEditUser(null); fetchUsers(); }
      else { const e = await r.json().catch(() => ({})); setEditError(e.message || "Failed to save"); }
    } catch { setEditError("Network error"); }
    finally { setSaving(false); }
  };

  const handleToggle = async (u: UserRow) => {
    setToggling(u.id);
    try {
      await fetch(`${API}/users/${u.id}/toggle`, { method: "PATCH", headers: hdrs() });
      fetchUsers();
    } finally { setToggling(null); }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${u.firstName} ${u.lastName} ${u.email} ${u.phone ?? ""}`.toLowerCase().includes(q);
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Users</h1>
            <p className="text-white/40 text-sm mt-1">{users.length} registered accounts</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, phone…"
              className="px-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm w-64"
            />
            <select
              value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm"
            >
              <option value="ALL">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
            </select>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {ROLES.map(r => {
            const count = users.filter(u => u.role === r).length;
            return (
              <button key={r} onClick={() => setRoleFilter(prev => prev === r ? "ALL" : r)}
                className={`rounded-xl border p-3 text-left transition-all ${roleFilter === r ? ROLE_COLORS[r] + " border-opacity-60" : "bg-dark-800 border-white/5 hover:border-white/20"}`}
              >
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-xs text-white/40 mt-0.5">{r.replace("_", " ")}</div>
              </button>
            );
          })}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/30">Loading…</div>
        ) : error ? (
          <div className="text-red-400 text-center py-10">{error}</div>
        ) : (
          <div className="bg-dark-800 border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {["User", "Contact", "Role", "Children", "Status", "Joined", "Actions"].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-white/30 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-white/25">No users found</td></tr>
                  )}
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-white/2 transition-colors">
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-lebanon-green/40 to-lebanon-green/10 border border-lebanon-green/20 flex items-center justify-center text-sm font-bold text-lebanon-green shrink-0">
                            {initials(u)}
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm">{u.firstName} {u.lastName}</div>
                            <div className="text-white/30 text-xs">{u.id.slice(0, 8)}…</div>
                          </div>
                        </div>
                      </td>
                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="text-white/70 text-sm">{u.email}</div>
                        {u.phone && <div className="text-white/35 text-xs mt-0.5">{u.phone}</div>}
                      </td>
                      {/* Role */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[u.role] ?? "bg-white/5 text-white/50 border-white/10"}`}>
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      {/* Children */}
                      <td className="px-5 py-4">
                        <ChildrenBadge items={u.children} />
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${u.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-green-400" : "bg-red-400"}`} />
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      {/* Joined */}
                      <td className="px-5 py-4 text-white/40 text-sm whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditUser(u); setEditError(null); }}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-all border border-white/5"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggle(u)}
                            disabled={toggling === u.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border disabled:opacity-50 ${u.isActive ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20" : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20"}`}
                          >
                            {toggling === u.id ? "…" : u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editUser && (
        <EditUserModal user={editUser} saving={saving} error={editError} onSave={handleSave} onClose={() => setEditUser(null)} />
      )}
    </div>
  );
}
