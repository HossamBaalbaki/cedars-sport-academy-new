"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  videoUrl?: string | null;
  category?: string;
  isFeatured?: boolean;
  createdAt: string;
}

export default function AdminGalleryPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const GALLERY_CATEGORIES = ["GENERAL", "TRAINING", "MATCHES", "EVENTS", "ACHIEVEMENTS"] as const;
  const [mediaType, setMediaType] = useState<"photo" | "video">("photo");
  const [form, setForm] = useState({ title: "", description: "", imageUrl: "", videoUrl: "", category: "GENERAL", isFeatured: false });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  const fetchGallery = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/gallery`, {
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
      } else {
        setError("Failed to load gallery");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  const handleAdd = async () => {
    if (!form.title) return;
    if (mediaType === "photo" && !form.imageUrl) return;
    if (mediaType === "video" && !form.videoUrl) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/gallery`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": TENANT,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          mediaType === "video"
            ? { ...form, imageUrl: form.imageUrl || "" }
            : { ...form, videoUrl: undefined }
        ),
      });
      if (res.ok) {
        setSuccess("Gallery item added!");
        setForm({ title: "", description: "", imageUrl: "", videoUrl: "", category: "GENERAL", isFeatured: false });
        setMediaType("photo");
        setShowForm(false);
        fetchGallery();
      } else {
        const err = await res.json();
        setError(err.message || "Failed to add item");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this gallery item?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/gallery/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      if (res.ok) {
        setSuccess("Item deleted");
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        setError("Failed to delete item");
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
                <h1 className="text-2xl font-black text-white">🖼️ Gallery</h1>
                <p className="text-white/40 text-sm">{items.length} items</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 transition-all"
            >
              + Add Item
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex justify-between">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex justify-between">
            {success}
            <button onClick={() => setSuccess(null)}>✕</button>
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="glass-card p-6 mb-6">
            <h3 className="text-white font-bold mb-4">Add New Gallery Item</h3>

            {/* Media Type Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMediaType("photo")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  mediaType === "photo"
                    ? "bg-lebanon-green text-white"
                    : "bg-dark-800 border border-white/10 text-white/50 hover:text-white"
                }`}
              >
                📷 Photo
              </button>
              <button
                onClick={() => setMediaType("video")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  mediaType === "video"
                    ? "bg-blue-600 text-white"
                    : "bg-dark-800 border border-white/10 text-white/50 hover:text-white"
                }`}
              >
                🎬 Video
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm"
              >
                {GALLERY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                ))}
              </select>

              {mediaType === "photo" ? (
                <input
                  type="url"
                  placeholder="Image URL *"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm md:col-span-2"
                />
              ) : (
                <>
                  <input
                    type="url"
                    placeholder="Video URL * (YouTube: https://youtube.com/watch?v=... or direct .mp4 URL)"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-dark-800 border border-blue-500/30 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60 text-sm md:col-span-2"
                  />
                  <input
                    type="url"
                    placeholder="Thumbnail Image URL (optional — leave blank to auto-use YouTube thumbnail)"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm md:col-span-2"
                  />
                  <div className="md:col-span-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                    💡 <strong>YouTube tip:</strong> Paste a YouTube URL like <code className="bg-white/10 px-1 rounded">https://www.youtube.com/watch?v=VIDEO_ID</code> — the thumbnail will be auto-generated if you leave the thumbnail field blank.
                  </div>
                </>
              )}

              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm md:col-span-2 resize-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-lebanon-green"
                />
                Featured
              </label>
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => { setShowForm(false); setMediaType("photo"); }}
                  className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving || !form.title || (mediaType === "photo" ? !form.imageUrl : !form.videoUrl)}
                  className="px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 disabled:opacity-50 transition-all"
                >
                  {saving ? "Saving..." : `Add ${mediaType === "video" ? "Video" : "Photo"}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card animate-pulse aspect-square" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">🖼️</div>
            <p className="text-white/40">No gallery items yet. Add your first photo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="glass-card overflow-hidden group relative">
                <div className="aspect-square bg-dark-800 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      item.imageUrl ||
                      (item.videoUrl && item.videoUrl.includes("youtube.com/watch?v=")
                        ? `https://img.youtube.com/vi/${new URLSearchParams(item.videoUrl.split("?")[1]).get("v")}/hqdefault.jpg`
                        : item.videoUrl && item.videoUrl.includes("youtu.be/")
                        ? `https://img.youtube.com/vi/${item.videoUrl.split("youtu.be/")[1]?.split("?")[0]}/hqdefault.jpg`
                        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23222'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23555' font-size='30'%3E🎬%3C/text%3E%3C/svg%3E")
                    }
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23333'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23666' font-size='30'%3E🖼️%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  {item.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                        <span className="text-white text-lg ml-0.5">▶</span>
                      </div>
                    </div>
                  )}
                  {item.isFeatured && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-lebanon-green text-white text-xs font-bold">
                      ⭐ Featured
                    </div>
                  )}
                  {item.videoUrl && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold">
                      🎬 Video
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="px-3 py-1.5 rounded-lg bg-red-500/80 text-white text-xs font-semibold hover:bg-red-500 transition-all"
                    >
                      {deletingId === item.id ? "Deleting..." : "🗑️ Delete"}
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-white text-sm font-medium truncate">{item.title}</div>
                  {item.category && (
                    <div className="text-white/40 text-xs mt-0.5">{item.category}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
