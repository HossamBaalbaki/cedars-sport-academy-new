"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { CreateCoachModal, EditCoachModal, DeleteCoachModal } from "./CoachModals";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

interface Coach {
  id: string; userId: string; bio?: string; experience?: number;
  certifications?: string[]; instagram?: string; twitter?: string;
  linkedin?: string; featured: boolean; isActive: boolean;
  user: { id: string; firstName: string; lastName: string; email: string; avatar?: string; isActive: boolean };
  createdAt: string;
}

export default function AdminCoachesPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Create state
  const [createOpen, setCreateOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [uFN, setUFN] = useState(""); const [uLN, setULN] = useState("");
  const [uEmail, setUEmail] = useState(""); const [uPwd, setUPwd] = useState("");
  const [uPhone, setUPhone] = useState(""); const [createdUID, setCreatedUID] = useState<string | null>(null);
  const [pBio, setPBio] = useState(""); const [pExp, setPExp] = useState("");
  const [pCerts, setPCerts] = useState(""); const [pIG, setPIG] = useState("");
  const [pTW, setPTW] = useState(""); const [pLI, setPLI] = useState("");
  const [pFeat, setPFeat] = useState(false); const [pPhoto, setPPhoto] = useState("");
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  // Edit state
  const [editC, setEditC] = useState<Coach | null>(null);
  const [eBio, setEBio] = useState(""); const [eExp, setEExp] = useState("");
  const [eCerts, setECerts] = useState(""); const [eIG, setEIG] = useState("");
  const [eTW, setETW] = useState(""); const [eLI, setELI] = useState("");
  const [eFeat, setEFeat] = useState(false); const [ePhoto, setEPhoto] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);

  // Delete state
  const [delC, setDelC] = useState<Coach | null>(null);
  const [deleting, setDeleting] = useState(false);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    "x-tenant-id": TENANT,
    Authorization: `Bearer ${token}`,
  }), [token]);

  const fetchCoaches = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/coaches`, { headers: authHeaders() });
      const json = await res.json();
      setCoaches(Array.isArray(json.data) ? json.data : []);
    } catch {
      setError("Failed to load coaches");
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push("/login"); return; }
    if (!isLoading && user?.role !== "ADMIN") { router.push("/dashboard"); return; }
    if (!isLoading && isAuthenticated) fetchCoaches();
  }, [isLoading, isAuthenticated, user, router, fetchCoaches]);

  const resetCreate = () => {
    setStep(1); setUFN(""); setULN(""); setUEmail(""); setUPwd(""); setUPhone("");
    setPBio(""); setPExp(""); setPCerts(""); setPIG(""); setPTW(""); setPLI("");
    setPFeat(false); setPPhoto(""); setCreatedUID(null); setFormErr(null);
  };

  // Step 1: register user with COACH role
  const handleStep1 = async () => {
    if (!uFN.trim() || !uLN.trim() || !uEmail.trim() || !uPwd.trim()) {
      setFormErr("First name, last name, email and password are required."); return;
    }
    setSaving(true); setFormErr(null);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-tenant-id": TENANT },
        body: JSON.stringify({ firstName: uFN.trim(), lastName: uLN.trim(), email: uEmail.trim(), password: uPwd, phone: uPhone.trim() || undefined, role: "COACH" }),
      });
      const json = await res.json();
      if (!res.ok) { setFormErr(json.message || "Registration failed"); return; }
      const uid = json.data?.id || json.data?.user?.id;
      if (!uid) { setFormErr("User created but ID not returned"); return; }
      setCreatedUID(uid);
      setStep(2);
    } catch {
      setFormErr("Network error");
    } finally {
      setSaving(false);
    }
  };

  // Step 2: create coach profile
  const handleStep2 = async () => {
    if (!createdUID) { setFormErr("No user ID — go back and retry step 1"); return; }
    setSaving(true); setFormErr(null);
    try {
      const body: Record<string, unknown> = {
        userId: createdUID,
        bio: pBio.trim() || undefined,
        experience: pExp ? parseInt(pExp) : undefined,
        certifications: pCerts.trim() ? pCerts.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        instagram: pIG.trim() || undefined,
        twitter: pTW.trim() || undefined,
        linkedin: pLI.trim() || undefined,
        featured: pFeat,
        photo: pPhoto.trim() || undefined,
      };
      const res = await fetch(`${API}/coaches`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setFormErr(json.message || "Failed to create coach profile"); return; }
      setCreateOpen(false); resetCreate(); fetchCoaches();
    } catch {
      setFormErr("Network error");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (c: Coach) => {
    setEditC(c);
    setEBio(c.bio || "");
    setEExp(c.experience?.toString() || "");
    setECerts(c.certifications?.join(", ") || "");
    setEIG(c.instagram || "");
    setETW(c.twitter || "");
    setELI(c.linkedin || "");
    setEFeat(c.featured);
    setEPhoto(c.user?.avatar || "");
    setEditErr(null);
  };

  const handleEdit = async () => {
    if (!editC) return;
    setEditSaving(true); setEditErr(null);
    try {
      const body: Record<string, unknown> = {
        bio: eBio.trim() || undefined,
        experience: eExp ? parseInt(eExp) : undefined,
        certifications: eCerts.trim() ? eCerts.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        instagram: eIG.trim() || undefined,
        twitter: eTW.trim() || undefined,
        linkedin: eLI.trim() || undefined,
        featured: eFeat,
        photo: ePhoto.trim(),   // send even if empty so backend can clear it
      };
      const res = await fetch(`${API}/coaches/${editC.id}`, {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setEditErr(json.message || "Failed to update coach"); return; }
      setEditC(null); fetchCoaches();
    } catch {
      setEditErr("Network error");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!delC) return;
    setDeleting(true);
    try {
      await fetch(`${API}/coaches/${delC.id}`, { method: "DELETE", headers: authHeaders() });
      setDelC(null); fetchCoaches();
    } catch {
      /* ignore */
    } finally {
      setDeleting(false);
    }
  };

  const filtered = coaches.filter(c =>
    `${c.user?.firstName} ${c.user?.lastName} ${c.user?.email}`.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-lebanon-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Header — navigation only */}
      <div className="border-b border-white/5 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard/admin" className="text-white/40 hover:text-white transition-colors text-sm">← Dashboard</Link>
          <span className="text-white/20">/</span>
          <span className="text-white font-semibold">Coaches</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search + Add Coach row */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search coaches by name or email..."
            className="flex-1 max-w-md px-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
          />
          <button
            onClick={() => { setCreateOpen(true); resetCreate(); }}
            className="px-4 py-2.5 rounded-xl bg-lebanon-green hover:bg-lebanon-green/90 text-white text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Add Coach
          </button>
        </div>

        {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-lebanon-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <div className="text-5xl mb-4">🏃</div>
            <p className="text-lg font-medium">{search ? "No coaches match your search" : "No coaches yet"}</p>
            {!search && <p className="text-sm mt-2">Click &quot;Add Coach&quot; to get started</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(c => {
              const initials = `${c.user?.firstName?.[0] || ""}${c.user?.lastName?.[0] || ""}`.toUpperCase();
              const avatar = c.user?.avatar;
              return (
                <div key={c.id} className="bg-dark-800 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                  {/* Avatar */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-lebanon-green/20 to-lebanon-green/5 flex items-center justify-center border border-white/10">
                      {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatar} alt={`${c.user?.firstName} ${c.user?.lastName}`} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <span className="text-lebanon-green font-bold text-sm">{initials}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-semibold text-sm truncate">{c.user?.firstName} {c.user?.lastName}</div>
                      <div className="text-white/40 text-xs truncate">{c.user?.email}</div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {c.featured && <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs border border-yellow-500/20">⭐ Featured</span>}
                    {c.experience && <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/50 text-xs">{c.experience}y exp</span>}
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${c.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Bio */}
                  {c.bio && <p className="text-white/40 text-xs line-clamp-2 mb-3">{c.bio}</p>}

                  {/* Certifications */}
                  {c.certifications && c.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {c.certifications.slice(0, 2).map((cert, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">{cert}</span>
                      ))}
                      {c.certifications.length > 2 && <span className="text-white/30 text-xs self-center">+{c.certifications.length - 2}</span>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                    <div className="flex gap-2 text-white/30 text-xs flex-1">
                      {c.instagram && <span>📸</span>}
                      {c.twitter && <span>🐦</span>}
                      {c.linkedin && <span>💼</span>}
                    </div>
                    <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-lebanon-green/20 text-white/40 flex items-center justify-center transition-all text-sm">✏️</button>
                    <button onClick={() => setDelC(c)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 flex items-center justify-center transition-all text-sm">🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateCoachModal
        open={createOpen} step={step} saving={saving} formErr={formErr}
        uFN={uFN} uLN={uLN} uEmail={uEmail} uPwd={uPwd} uPhone={uPhone}
        pBio={pBio} pExp={pExp} pCerts={pCerts} pIG={pIG} pTW={pTW} pLI={pLI} pFeat={pFeat} pPhoto={pPhoto}
        setUFN={setUFN} setULN={setULN} setUEmail={setUEmail} setUPwd={setUPwd} setUPhone={setUPhone}
        setPBio={setPBio} setPExp={setPExp} setPCerts={setPCerts} setPIG={setPIG} setPTW={setPTW} setPLI={setPLI}
        setPFeat={setPFeat} setPPhoto={setPPhoto}
        onClose={() => { setCreateOpen(false); resetCreate(); }}
        onStep1={handleStep1} onStep2={handleStep2}
        onBack={() => setStep(1)}
      />

      <EditCoachModal
        coach={editC} saving={editSaving} err={editErr}
        bio={eBio} exp={eExp} certs={eCerts} ig={eIG} tw={eTW} li={eLI} feat={eFeat} photo={ePhoto}
        setBio={setEBio} setExp={setEExp} setCerts={setECerts}
        setIG={setEIG} setTW={setETW} setLI={setELI} setFeat={setEFeat} setPhoto={setEPhoto}
        onClose={() => setEditC(null)} onSave={handleEdit}
      />

      <DeleteCoachModal
        coach={delC} deleting={deleting}
        onClose={() => setDelC(null)} onConfirm={handleDelete}
      />
    </div>
  );
}
