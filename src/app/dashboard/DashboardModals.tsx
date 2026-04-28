"use client";

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChildFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  bloodType: string;
  school: string;
  medicalCardNumber: string;
  medicalNotes: string;
}

export interface Location {
  id: string;
  name: string;
  city?: string;
}

export interface Program {
  id: string;
  name: string;
  sport?: string;
  ageGroup?: { name: string; minAge?: number; maxAge?: number };
  coach?: { firstName: string; lastName: string };
  locations?: { location: Location }[];
  schedules?: { id: string; dayOfWeek: string; startTime: string; endTime: string; locationId?: string }[];
}

export const EMPTY_FORM: ChildFormData = {
  firstName: "", lastName: "", dateOfBirth: "",
  nationality: "", bloodType: "", school: "",
  medicalCardNumber: "", medicalNotes: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAge(dob: string): number {
  if (!dob) return 0;
  const b = new Date(dob), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a;
}

function filterPrograms(programs: Program[], locationId: string, childDob: string): Program[] {
  const childAge = calcAge(childDob);
  return programs.filter((p) => {
    const ageOk = !p.ageGroup ||
      (childAge >= (p.ageGroup.minAge ?? 0) && childAge <= (p.ageGroup.maxAge ?? 99));
    const locOk = !locationId || p.locations?.some((pl) => pl.location.id === locationId);
    return ageOk && locOk;
  });
}

// ─── ChildFormFields ──────────────────────────────────────────────────────────

export function ChildFormFields({
  form, onChange, error,
}: {
  form: ChildFormData;
  onChange: (f: ChildFormData) => void;
  error: string | null;
}) {
  const set = (k: keyof ChildFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange({ ...form, [k]: e.target.value });

  const inp = "w-full px-3 py-2 rounded-lg bg-dark-800 border border-white/10 text-white text-sm focus:outline-none focus:border-lebanon-green/50";

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-white/50 text-xs mb-1">First Name *</label>
          <input value={form.firstName} onChange={set("firstName")} placeholder="Ahmad" className={inp} />
        </div>
        <div>
          <label className="block text-white/50 text-xs mb-1">Last Name *</label>
          <input value={form.lastName} onChange={set("lastName")} placeholder="Khalil" className={inp} />
        </div>
      </div>
      <div>
        <label className="block text-white/50 text-xs mb-1">Date of Birth *</label>
        <input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} className={inp} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-white/50 text-xs mb-1">Nationality *</label>
          <input value={form.nationality} onChange={set("nationality")} placeholder="Lebanese" className={inp} />
        </div>
        <div>
          <label className="block text-white/50 text-xs mb-1">Blood Type *</label>
          <select value={form.bloodType} onChange={set("bloodType")} className={inp}>
            <option value="">Select...</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bt) => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
          <label className="block text-white/50 text-xs mb-1">School *</label>
        <input value={form.school} onChange={set("school")} placeholder="Cedars International School" className={inp} />
      </div>
      <div>
        <label className="block text-white/50 text-xs mb-1">Medical Card Number</label>
        <input value={form.medicalCardNumber} onChange={set("medicalCardNumber")} placeholder="Optional" className={inp} />
      </div>
      <div>
          <label className="block text-white/50 text-xs mb-1">Medical Notes *</label>
        <textarea value={form.medicalNotes} onChange={set("medicalNotes")} rows={2} placeholder="Allergies, conditions..." className={`${inp} resize-none`} />
      </div>
    </div>
  );
}

// ─── Modal Wrapper ────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-dark-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center">×</button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Program + Location Selector (shared) ────────────────────────────────────

function ProgramLocationSelector({
  programs, locations, childDob, programId, locationId, error,
  onProgramChange, onLocationChange, enrolledProgramIds = [],
}: {
  programs: Program[];
  locations: Location[];
  childDob: string;
  programId: string;
  locationId: string;
  error: string | null;
  onProgramChange: (id: string) => void;
  onLocationChange: (id: string) => void;
  enrolledProgramIds?: string[];
}) {
  const childAge = calcAge(childDob);
  const ageFilteredPrograms = filterPrograms(programs, "", childDob)
    .filter((p) => !enrolledProgramIds.includes(p.id));

  const selectedProgram = ageFilteredPrograms.find((p) => p.id === programId);
  const availableLocationIds = new Set<string>();

  if (selectedProgram) {
    selectedProgram.locations?.forEach((pl) => {
      if (pl.location?.id) availableLocationIds.add(pl.location.id);
    });
    selectedProgram.schedules?.forEach((s) => {
      if (s.locationId) availableLocationIds.add(s.locationId);
    });
  }

  const availableLocations = locations.filter((l) => availableLocationIds.has(l.id));

  const filtered = ageFilteredPrograms;
  const inp = "w-full px-3 py-2 rounded-lg bg-dark-800 border border-white/10 text-white text-sm focus:outline-none focus:border-lebanon-green/50";

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {/* Child age info */}
      {childDob && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <span className="text-blue-400 text-xs">👶 Child age: <strong>{childAge} years</strong> — showing programs for this age group</span>
        </div>
      )}

      {/* Program selector */}
      <div>
        <label className="block text-white/50 text-xs mb-1">
          Sports / Program * {filtered.length === 0 ? "(no programs match)" : `(${filtered.length} available)`} 
        </label>
        <select
          value={programId}
          onChange={(e) => { onProgramChange(e.target.value); onLocationChange(""); }}
          className={inp}
        >
          <option value="">— Choose a program —</option>
          {filtered.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.sport ? ` (${p.sport})` : ""}
              {p.ageGroup ? ` · ${p.ageGroup.name}` : ""}
              {p.coach ? ` · Coach ${p.coach.firstName}` : ""}
            </option>
          ))}
        </select>
        {filtered.length === 0 && programs.length > 0 && (
          <p className="text-white/30 text-xs mt-1">No programs match this child&apos;s age group.</p>
        )}
      </div>

      {/* Location selector */}
      <div>
        <label className="block text-white/50 text-xs mb-1">Location {programId ? "*" : "(select program first)"}</label>
        <select
          value={locationId}
          onChange={(e) => onLocationChange(e.target.value)}
          className={inp}
          disabled={!programId}
        >
          <option value="">— Choose location —</option>
          {availableLocations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}{l.city ? ` · ${l.city}` : ""}</option>
          ))}
        </select>
        {!!programId && availableLocations.length === 0 && (
          <p className="text-white/30 text-xs mt-1">No locations available for this program.</p>
        )}
      </div>
    </div>
  );
}

// ─── Add Child Modal ──────────────────────────────────────────────────────────

export function AddChildModal({
  step, form, programs, locations, enrollProgramId, enrollLocationId,
  loading, error,
  onFormChange, onEnrollProgramChange, onEnrollLocationChange,
  onStep1Submit, onStep2Submit, onSkip, onClose,
}: {
  step: 1 | 2;
  form: ChildFormData;
  programs: Program[];
  locations: Location[];
  enrollProgramId: string;
  enrollLocationId: string;
  loading: boolean;
  error: string | null;
  onFormChange: (f: ChildFormData) => void;
  onEnrollProgramChange: (id: string) => void;
  onEnrollLocationChange: (id: string) => void;
  onStep1Submit: () => void;
  onStep2Submit: () => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={step === 1 ? "Add Child — Details" : "Enroll in a Program (Optional)"} onClose={onClose}>
      {step === 1 ? (
        <>
          <ChildFormFields form={form} onChange={onFormChange} error={error} />
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
              Cancel
            </button>
            <button onClick={onStep1Submit} disabled={loading} className="flex-1 py-2 rounded-xl bg-lebanon-green text-white font-semibold text-sm hover:bg-lebanon-green/80 disabled:opacity-50 transition-all">
              {loading ? "Saving..." : "Next: Enroll →"}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-white/50 text-sm mb-4">Child added! Optionally enroll them in a program now, or skip.</p>
          <ProgramLocationSelector
            programs={programs} locations={locations} childDob={form.dateOfBirth}
            programId={enrollProgramId} locationId={enrollLocationId} error={error}
            onProgramChange={onEnrollProgramChange} onLocationChange={onEnrollLocationChange}
          />
          <div className="flex gap-3 mt-5">
            <button onClick={onSkip} className="flex-1 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
              Skip
            </button>
            <button onClick={onStep2Submit} disabled={loading || !enrollProgramId || !enrollLocationId} className="flex-1 py-2 rounded-xl bg-lebanon-green text-white font-semibold text-sm hover:bg-lebanon-green/80 disabled:opacity-50 transition-all">
              {loading ? "Enrolling..." : "Enroll & Finish"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

// ─── Edit Child Modal ─────────────────────────────────────────────────────────

export function EditChildModal({
  form, loading, error, onFormChange, onSubmit, onClose,
}: {
  form: ChildFormData;
  loading: boolean;
  error: string | null;
  onFormChange: (f: ChildFormData) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Edit Child Details" onClose={onClose}>
      <ChildFormFields form={form} onChange={onFormChange} error={error} />
      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
          Cancel
        </button>
        <button onClick={onSubmit} disabled={loading} className="flex-1 py-2 rounded-xl bg-lebanon-green text-white font-semibold text-sm hover:bg-lebanon-green/80 disabled:opacity-50 transition-all">
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Enroll Modal ─────────────────────────────────────────────────────────────

export function EnrollModal({
  programs, locations, childDob, programId, locationId, loading, error,
  enrolledProgramIds = [],
  onProgramChange, onLocationChange, onSubmit, onClose,
}: {
  programs: Program[];
  locations: Location[];
  childDob: string;
  programId: string;
  locationId: string;
  loading: boolean;
  error: string | null;
  enrolledProgramIds?: string[];
  onProgramChange: (id: string) => void;
  onLocationChange: (id: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Enroll in Program" onClose={onClose}>
      <ProgramLocationSelector
        programs={programs} locations={locations} childDob={childDob}
        programId={programId} locationId={locationId} error={error}
        onProgramChange={onProgramChange} onLocationChange={onLocationChange}
        enrolledProgramIds={enrolledProgramIds}
      />
      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
          Cancel
        </button>
        <button onClick={onSubmit} disabled={loading || !programId || !locationId} className="flex-1 py-2 rounded-xl bg-lebanon-green text-white font-semibold text-sm hover:bg-lebanon-green/80 disabled:opacity-50 transition-all">
          {loading ? "Enrolling..." : "Enroll"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Unenroll Confirm ─────────────────────────────────────────────────────────

export function UnenrollConfirm({
  programName, loading, onConfirm, onClose,
}: {
  programName: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Unenroll from Program" onClose={onClose}>
      <p className="text-white/70 text-sm mb-6">
        Are you sure you want to unenroll from{" "}
        <span className="text-white font-semibold">{programName}</span>?
        This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 py-2 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 disabled:opacity-50 transition-all">
          {loading ? "Removing..." : "Yes, Unenroll"}
        </button>
      </div>
    </Modal>
  );
}
