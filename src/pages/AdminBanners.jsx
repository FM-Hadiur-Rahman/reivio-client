import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [q, setQ] = useState("");
  const [form, setForm] = useState({ imageUrl: "", caption: "", link: "" });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/banners");
      setBanners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to fetch banners:", err);
      toast.error("Could not load banners");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return banners;
    return banners.filter((b) => {
      const hay = `${b.caption || ""} ${b.link || ""}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [banners, q]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await api.post("/api/upload/banner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      toast.success("✅ Image uploaded");
    } catch (err) {
      console.error("❌ Upload error:", err);
      toast.error(err?.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.imageUrl) return toast.error("Please upload an image first");
    if (!form.caption.trim()) return toast.error("Caption is required");

    try {
      setSaving(true);
      await api.post("/api/banners", form);
      toast.success("✅ Banner added");
      setForm({ imageUrl: "", caption: "", link: "" });
      fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "❌ Failed to add");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this banner?");
    if (!ok) return;

    try {
      await api.delete(`/api/banners/${id}`);
      toast.success("🗑 Deleted");
      fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "❌ Failed to delete");
    }
  };

  const isValidUrl = (v) => {
    if (!v) return true;
    try {
      // allow relative links too
      if (v.startsWith("/")) return true;
      new URL(v);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              System
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              🖼 Banners
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Upload homepage banners, add captions, and attach optional links.
            </p>
          </div>

          <button
            onClick={fetchBanners}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}{" "}
            <span className="text-white/70">↻</span>
          </button>
        </div>

        {/* Create / Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
          {/* Form card */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Add new banner
              </div>
              <span className="text-xs text-slate-500">
                {uploading
                  ? "Uploading…"
                  : form.imageUrl
                  ? "Ready"
                  : "No image"}
              </span>
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Banner image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm
                             file:mr-3 file:rounded-xl file:border-0 file:bg-teal-600 file:px-3 file:py-2 file:text-white
                             hover:file:bg-teal-700 transition"
                  disabled={uploading}
                />
                <div className="text-[0.7rem] text-slate-500 mt-1">
                  Recommended: 1600×500 (JPG/PNG/WebP)
                </div>
              </div>

              {form.imageUrl ? (
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="h-36 w-full object-cover"
                  />
                  <div className="px-3 py-2 bg-slate-50 text-xs text-slate-600">
                    Preview
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 h-36 grid place-items-center text-sm text-slate-500">
                  Upload an image to preview
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Caption <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Winter deal — up to 30% off"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                             placeholder:text-slate-400 outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                  value={form.caption}
                  onChange={(e) =>
                    setForm({ ...form, caption: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Link <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://… or /listings?district=CoxsBazar"
                  className={[
                    "mt-1 w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition",
                    "bg-slate-50 placeholder:text-slate-400 text-slate-900",
                    "focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
                    isValidUrl(form.link)
                      ? "border-slate-200"
                      : "border-red-300",
                  ].join(" ")}
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                />
                {!isValidUrl(form.link) && (
                  <div className="text-xs text-red-600 mt-1">
                    Please enter a valid URL (or a relative path starting with
                    /).
                  </div>
                )}
              </div>

              <button
                onClick={handleAdd}
                disabled={
                  uploading ||
                  saving ||
                  !form.imageUrl ||
                  !form.caption.trim() ||
                  !isValidUrl(form.link)
                }
                className="w-full rounded-2xl px-4 py-2.5 text-sm font-semibold text-white
                           bg-teal-600 hover:bg-teal-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "➕ Add Banner"}
              </button>
            </div>
          </div>

          {/* List card */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Existing banners
                </div>
                <div className="text-xs text-slate-500">
                  {filtered.length} banner{filtered.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="flex-1 md:max-w-sm">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search caption or link…"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                             outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-slate-600">Loading banners…</div>
            ) : filtered.length === 0 ? (
              <div className="p-8">
                <div className="text-sm font-semibold text-slate-900">
                  No banners found
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  Try a different search or add a new banner.
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <div
                    key={b._id}
                    className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50/70 transition"
                  >
                    <div className="w-full md:w-52 shrink-0 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={b.imageUrl}
                        alt={b.caption || "Banner"}
                        className="h-28 md:h-24 w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {b.caption || "—"}
                          </div>
                          {b.link ? (
                            <a
                              href={b.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-teal-700 hover:underline break-all"
                            >
                              {b.link}
                            </a>
                          ) : (
                            <div className="text-sm text-slate-500">
                              No link
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleDelete(b._id)}
                          className="shrink-0 rounded-2xl px-3 py-2 text-sm font-semibold
                                     border border-red-200 text-red-600 hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700">
                          🖼 Banner
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-teal-50 text-teal-700 ring-1 ring-teal-200">
                          Ready
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500 bg-slate-50">
              Tip: Use short captions and links to curated landing pages for
              higher conversion.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
