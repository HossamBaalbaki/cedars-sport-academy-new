"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

export default function AdminSettingsPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();

  const [phones, setPhones] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")
      router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  const fetchSettings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/settings`, {
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      if (res.ok) {
        const data = await res.json();
        setPhones(data.data?.whatsappAdminPhones ?? []);
      } else {
        setError("Failed to load settings");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const savePhones = async (updated: string[]) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API}/settings/whatsapp`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": TENANT,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phones: updated }),
      });
      if (res.ok) {
        const data = await res.json();
        setPhones(data.data?.whatsappAdminPhones ?? updated);
        setSuccess("WhatsApp numbers saved successfully");
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

  const handleAdd = () => {
    const trimmed = newPhone.trim();
    if (!trimmed) return;
    if (phones.includes(trimmed)) {
      setError("This number is already in the list");
      return;
    }
    const updated = [...phones, trimmed];
    setNewPhone("");
    savePhones(updated);
  };

  const handleRemove = (phone: string) => {
    const updated = phones.filter((p) => p !== phone);
    savePhones(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/admin"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">⚙️ Settings</h1>
              <p className="text-white/40 text-sm">Notification & WhatsApp configuration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex justify-between items-center">
            {error}
            <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400 ml-4">✕</button>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex justify-between items-center">
            {success}
            <button onClick={() => setSuccess(null)} className="text-emerald-400/60 hover:text-emerald-400 ml-4">✕</button>
          </div>
        )}

        {/* WhatsApp Admin Phones */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💬</span>
            <div>
              <h2 className="text-white font-bold text-lg">WhatsApp Admin Numbers</h2>
              <p className="text-white/40 text-sm">
                These numbers receive WhatsApp alerts for new registrations and payments.
              </p>
            </div>
          </div>

          <div className="mt-5 mb-4 flex gap-3">
            <input
              type="tel"
              placeholder="e.g. +97412345678"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
            />
            <button
              onClick={handleAdd}
              disabled={saving || !newPhone.trim()}
              className="px-5 py-3 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 disabled:opacity-50 transition-all"
            >
              {saving ? "Saving..." : "Add"}
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-dark-800 animate-pulse" />
              ))}
            </div>
          ) : phones.length === 0 ? (
            <div className="p-8 rounded-xl bg-dark-800 border border-white/5 text-center">
              <div className="text-3xl mb-2">📵</div>
              <p className="text-white/40 text-sm">No admin WhatsApp numbers configured yet.</p>
              <p className="text-white/25 text-xs mt-1">Add a number above to start receiving alerts.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {phones.map((phone) => (
                <div
                  key={phone}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-dark-800 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lebanon-green text-sm">📱</span>
                    <span className="text-white font-mono text-sm">{phone}</span>
                  </div>
                  <button
                    onClick={() => handleRemove(phone)}
                    disabled={saving}
                    className="text-white/30 hover:text-red-400 transition-colors text-xs px-2 py-1 rounded-lg hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-white/25 text-xs">
            Enter numbers in international format (e.g. +97412345678). Alerts are sent for new parent registrations, cash payments, and card payments.
          </p>
        </div>
      </div>
    </div>
  );
}
