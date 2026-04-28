"use client";

const inputCls = "w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-lebanon-green/50 text-sm";
const labelCls = "block text-white/60 text-xs font-medium mb-1.5";

interface Coach {
  id: string; userId: string; bio?: string; experience?: number;
  certifications?: string[]; instagram?: string; twitter?: string;
  linkedin?: string; featured: boolean; isActive: boolean;
  user: { id: string; firstName: string; lastName: string; email: string; avatar?: string; isActive: boolean };
  createdAt: string;
}

interface CreateModalProps {
  open: boolean; step: 1 | 2; saving: boolean; formErr: string | null;
  uFN: string; uLN: string; uEmail: string; uPwd: string; uPhone: string;
  pBio: string; pExp: string; pCerts: string; pIG: string; pTW: string; pLI: string; pFeat: boolean; pPhoto: string;
  setUFN: (v: string) => void; setULN: (v: string) => void; setUEmail: (v: string) => void;
  setUPwd: (v: string) => void; setUPhone: (v: string) => void;
  setPBio: (v: string) => void; setPExp: (v: string) => void; setPCerts: (v: string) => void;
  setPIG: (v: string) => void; setPTW: (v: string) => void; setPLI: (v: string) => void;
  setPFeat: (v: boolean) => void; setPPhoto: (v: string) => void;
  onClose: () => void; onStep1: () => void; onStep2: () => void; onBack: () => void;
}

export function CreateCoachModal(p: CreateModalProps) {
  if (!p.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={p.onClose} />
      <div className="relative w-full max-w-lg bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white">Add New Coach</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-6 h-1.5 rounded-full ${p.step >= 1 ? "bg-lebanon-green" : "bg-white/10"}`} />
              <div className={`w-6 h-1.5 rounded-full ${p.step >= 2 ? "bg-lebanon-green" : "bg-white/10"}`} />
              <span className="text-white/30 text-xs ml-1">Step {p.step} of 2</span>
            </div>
          </div>
          <button onClick={p.onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {p.formErr && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{p.formErr}</div>}
          {p.step === 1 ? (
            <div className="space-y-4">
              <p className="text-white/40 text-xs">Create a user account with the COACH role first.</p>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>First Name <span className="text-red-400">*</span></label><input type="text" value={p.uFN} onChange={e => p.setUFN(e.target.value)} placeholder="Karim" className={inputCls} /></div>
                <div><label className={labelCls}>Last Name <span className="text-red-400">*</span></label><input type="text" value={p.uLN} onChange={e => p.setULN(e.target.value)} placeholder="Mansour" className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Email <span className="text-red-400">*</span></label><input type="email" value={p.uEmail} onChange={e => p.setUEmail(e.target.value)} placeholder="coach@cedars.lb" className={inputCls} /></div>
              <div><label className={labelCls}>Password <span className="text-red-400">*</span></label><input type="password" value={p.uPwd} onChange={e => p.setUPwd(e.target.value)} placeholder="Min 8 characters" className={inputCls} /></div>
              <div><label className={labelCls}>Phone</label><input type="text" value={p.uPhone} onChange={e => p.setUPhone(e.target.value)} placeholder="+961 70 000 000" className={inputCls} /></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-lebanon-green/10 border border-lebanon-green/20">
                <span className="text-lebanon-green text-sm">✓</span>
                <span className="text-lebanon-green text-xs font-medium">User account created for {p.uFN} {p.uLN}</span>
              </div>
              <p className="text-white/40 text-xs">Fill in the coach profile details (all optional).</p>

              {/* Photo URL with live preview */}
              <div>
                <label className={labelCls}>Photo URL</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-dark-900 border border-white/10 flex-shrink-0 flex items-center justify-center">
                    {p.pPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.pPhoto} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <span className="text-white/20 text-xl">👤</span>
                    )}
                  </div>
                  <input
                    type="url"
                    value={p.pPhoto}
                    onChange={e => p.setPPhoto(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className={`${inputCls} flex-1`}
                  />
                </div>
              </div>

              <div><label className={labelCls}>Bio</label><textarea value={p.pBio} onChange={e => p.setPBio(e.target.value)} placeholder="Coach biography..." rows={3} className={`${inputCls} resize-none`} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Experience (years)</label><input type="number" min="0" value={p.pExp} onChange={e => p.setPExp(e.target.value)} placeholder="5" className={inputCls} /></div>
                <div>
                  <label className={labelCls}>Featured Coach</label>
                  <div className="flex items-center h-[42px] gap-2">
                    <button type="button" onClick={() => p.setPFeat(!p.pFeat)} className={`w-10 h-6 rounded-full relative transition-colors ${p.pFeat ? "bg-lebanon-green" : "bg-white/10"}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${p.pFeat ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
                    <span className="text-white/60 text-sm">{p.pFeat ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
              <div><label className={labelCls}>Certifications <span className="text-white/30">(comma-separated)</span></label><input type="text" value={p.pCerts} onChange={e => p.setPCerts(e.target.value)} placeholder="UEFA B, FIFA Coaching" className={inputCls} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className={labelCls}>Instagram</label><input type="text" value={p.pIG} onChange={e => p.setPIG(e.target.value)} placeholder="@handle" className={inputCls} /></div>
                <div><label className={labelCls}>Twitter / X</label><input type="text" value={p.pTW} onChange={e => p.setPTW(e.target.value)} placeholder="@handle" className={inputCls} /></div>
                <div><label className={labelCls}>LinkedIn</label><input type="text" value={p.pLI} onChange={e => p.setPLI(e.target.value)} placeholder="URL" className={inputCls} /></div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
          {p.step === 2
            ? <button onClick={p.onBack} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all">← Back</button>
            : <button onClick={p.onClose} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all">Cancel</button>
          }
          <button onClick={p.step === 1 ? p.onStep1 : p.onStep2} disabled={p.saving} className="px-5 py-2 rounded-xl bg-lebanon-green hover:bg-lebanon-green/90 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2">
            {p.saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {p.saving ? "Processing..." : p.step === 1 ? "Next: Coach Profile →" : "Create Coach"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditModalProps {
  coach: Coach | null; saving: boolean; err: string | null;
  bio: string; exp: string; certs: string; ig: string; tw: string; li: string; feat: boolean; photo: string;
  setBio: (v: string) => void; setExp: (v: string) => void; setCerts: (v: string) => void;
  setIG: (v: string) => void; setTW: (v: string) => void; setLI: (v: string) => void;
  setFeat: (v: boolean) => void; setPhoto: (v: string) => void;
  onClose: () => void; onSave: () => void;
}

export function EditCoachModal(p: EditModalProps) {
  if (!p.coach) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={p.onClose} />
      <div className="relative w-full max-w-lg bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Edit — {p.coach.user?.firstName} {p.coach.user?.lastName}</h2>
          <button onClick={p.onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {p.err && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{p.err}</div>}

          {/* Photo URL with live preview */}
          <div>
            <label className={labelCls}>Photo URL</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-dark-900 border border-white/10 flex-shrink-0 flex items-center justify-center">
                {p.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photo} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <span className="text-white/20 text-xl">👤</span>
                )}
              </div>
              <input
                type="url"
                value={p.photo}
                onChange={e => p.setPhoto(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className={`${inputCls} flex-1`}
              />
            </div>
          </div>

          <div><label className={labelCls}>Bio</label><textarea value={p.bio} onChange={e => p.setBio(e.target.value)} placeholder="Coach biography..." rows={3} className={`${inputCls} resize-none`} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Experience (years)</label><input type="number" min="0" value={p.exp} onChange={e => p.setExp(e.target.value)} placeholder="5" className={inputCls} /></div>
            <div>
              <label className={labelCls}>Featured Coach</label>
              <div className="flex items-center h-[42px] gap-2">
                <button type="button" onClick={() => p.setFeat(!p.feat)} className={`w-10 h-6 rounded-full relative transition-colors ${p.feat ? "bg-lebanon-green" : "bg-white/10"}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${p.feat ? "translate-x-5" : "translate-x-1"}`} />
                </button>
                <span className="text-white/60 text-sm">{p.feat ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
          <div><label className={labelCls}>Certifications <span className="text-white/30">(comma-separated)</span></label><input type="text" value={p.certs} onChange={e => p.setCerts(e.target.value)} placeholder="UEFA B, FIFA Coaching" className={inputCls} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={labelCls}>Instagram</label><input type="text" value={p.ig} onChange={e => p.setIG(e.target.value)} placeholder="@handle" className={inputCls} /></div>
            <div><label className={labelCls}>Twitter / X</label><input type="text" value={p.tw} onChange={e => p.setTW(e.target.value)} placeholder="@handle" className={inputCls} /></div>
            <div><label className={labelCls}>LinkedIn</label><input type="text" value={p.li} onChange={e => p.setLI(e.target.value)} placeholder="URL" className={inputCls} /></div>
          </div>
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

interface DeleteModalProps { coach: Coach | null; deleting: boolean; onClose: () => void; onConfirm: () => void; }

export function DeleteCoachModal(p: DeleteModalProps) {
  if (!p.coach) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={p.onClose} />
      <div className="relative w-full max-w-sm bg-dark-800 border border-white/10 rounded-2xl shadow-2xl p-6 text-center">
        <div className="text-4xl mb-3">🗑️</div>
        <h3 className="text-lg font-bold text-white mb-2">Delete Coach</h3>
        <p className="text-white/50 text-sm mb-6">Are you sure you want to delete <span className="text-white font-medium">{p.coach.user?.firstName} {p.coach.user?.lastName}</span>? This cannot be undone.</p>
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
