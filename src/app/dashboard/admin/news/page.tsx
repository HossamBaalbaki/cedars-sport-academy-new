"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "921a4273-78be-4b91-a99b-b013e9830456";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  slug?: string;
  imageUrl?: string;
  image?: string;
  category?: string;
  publishedAt?: string;
  createdAt: string;
}

export default function AdminNewsPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [form, setForm] = useState({ title: "", content: "", image: "", category: "", publishedAt: "" });
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [isLoading, isAuthenticated, user, router]);

  const fetchNews = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/news/admin/all`, {
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      if (res.ok) {
        const data = await res.json();
        setNews(data.data || []);
      } else {
        setError("Failed to load news");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const openAdd = () => {
    setEditItem(null);
    setForm({ title: "", content: "", image: "", category: "GENERAL", publishedAt: "" });
    setShowForm(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditItem(item);
    setForm({
      title: item.title,
      content: item.content,
      image: item.image || "",
      category: item.category || "",
      publishedAt: item.publishedAt ? item.publishedAt.slice(0, 10) : "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      const url = editItem ? `${API}/news/${editItem.id}` : `${API}/news`;
      const method = editItem ? "PATCH" : "POST";
      const body: Record<string, unknown> = {
        title: form.title,
        content: form.content,
        category: form.category || undefined,
        image: form.image || undefined,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
      };
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": TENANT,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSuccess(editItem ? "Article updated!" : "Article created!");
        setShowForm(false);
        fetchNews();
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

  const handleTogglePublish = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await fetch(`${API}/news/${id}/toggle-publish`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      if (res.ok) {
        const data = await res.json();
        setSuccess(data.message || "Status updated");
        fetchNews();
      } else {
        const err = await res.json();
        setError(err.message || "Failed to toggle publish");
      }
    } catch {
      setError("Network error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": TENANT },
      });
      if (res.ok) {
        setSuccess("Article deleted");
        setNews((prev) => prev.filter((n) => n.id !== id));
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
                <h1 className="text-2xl font-black text-white">📰 News & Events</h1>
                <p className="text-white/40 text-sm">{news.length} articles</p>
              </div>
            </div>
            <button
              onClick={openAdd}
              className="px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 transition-all"
            >
              + New Article
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
            <h3 className="text-white font-bold mb-4">{editItem ? "Edit Article" : "New Article"}</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white focus:outline-none focus:border-lebanon-green/50 text-sm"
                >
                  <option value="GENERAL">General</option>
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="EVENT">Event</option>
                  <option value="ACHIEVEMENT">Achievement</option>
                  <option value="MATCH_RESULT">Match Result</option>
                </select>
                <input
                  type="date"
                  placeholder="Publish Date"
                  value={form.publishedAt}
                  onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
                />
              </div>
              <input
                type="url"
                placeholder="Cover Image URL (optional)"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm"
              />
              <textarea
                placeholder="Content *"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-lebanon-green/50 text-sm resize-none"
              />
            </div>
            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.content}
                className="px-4 py-2 rounded-xl bg-lebanon-green text-white text-sm font-semibold hover:bg-lebanon-green/80 disabled:opacity-50 transition-all"
              >
                {saving ? "Saving..." : editItem ? "Update" : "Publish"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse h-28" />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">📰</div>
            <p className="text-white/40">No articles yet. Publish your first news!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <div key={item.id} className="glass-card p-6 hover:border-white/10 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-white font-bold">{item.title}</h3>
                      {item.publishedAt ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                          ✓ Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-xs border border-white/10">
                          Draft
                        </span>
                      )}
                      {item.category && (
                        <span className="px-2 py-0.5 rounded-full bg-lebanon-green/10 text-lebanon-green text-xs border border-lebanon-green/20">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-sm line-clamp-2 mb-2">{item.content}</p>
                    <div className="text-white/30 text-xs">
                      {item.publishedAt
                        ? `Published ${new Date(item.publishedAt).toLocaleDateString()}`
                        : `Created ${new Date(item.createdAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    <button
                      onClick={() => handleTogglePublish(item.id)}
                      disabled={togglingId === item.id}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-50 ${
                        item.publishedAt
                          ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400"
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {togglingId === item.id ? "..." : item.publishedAt ? "⬇️ Unpublish" : "🚀 Publish"}
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-all"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-all disabled:opacity-50"
                    >
                      {deletingId === item.id ? "..." : "🗑️"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
