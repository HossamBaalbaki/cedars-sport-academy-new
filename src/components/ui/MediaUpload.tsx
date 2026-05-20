"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadMedia } from "@/lib/api";

interface MediaUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  accept?: "image" | "video" | "both";
  label?: string;
  hint?: string;
  className?: string;
}

export default function MediaUpload({
  value,
  onChange,
  accept = "image",
  label,
  hint,
  className = "",
}: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptAttr =
    accept === "image" ? "image/*" :
    accept === "video" ? "video/*" :
    "image/*,video/*";

  const isVideo = value && (
    value.includes("video") ||
    /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(value) ||
    value.includes("cloudinary.com") && value.includes("/video/")
  );

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const url = await uploadMedia(file);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm text-white/70 block">{label}</label>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer
          ${uploading ? "border-lebanon-green/50 bg-lebanon-green/5" : "border-white/10 hover:border-lebanon-green/40 hover:bg-white/3"}
          ${value ? "p-2" : "p-8"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr}
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        />

        {uploading && (
          <div className="absolute inset-0 rounded-xl bg-dark-900/60 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-lebanon-green/30 border-t-lebanon-green rounded-full animate-spin" />
              <span className="text-xs text-lebanon-green">Uploading…</span>
            </div>
          </div>
        )}

        {value ? (
          /* Preview */
          <div className="relative group">
            {isVideo ? (
              <video
                src={value}
                controls
                className="w-full max-h-48 rounded-lg object-contain bg-black"
              />
            ) : (
              <div className="relative w-full h-40">
                <Image
                  src={value}
                  alt="Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain rounded-lg"
                  unoptimized
                />
              </div>
            )}
            <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                className="px-3 py-1.5 rounded-lg bg-lebanon-green text-white text-xs font-semibold"
              >
                Change
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onChange(""); }}
                className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-3xl">
              {accept === "video" ? "🎬" : accept === "both" ? "📎" : "🖼️"}
            </div>
            <div className="text-white/50 text-sm">
              Drag & drop or <span className="text-lebanon-green">browse</span>
            </div>
            <div className="text-white/30 text-xs">
              {accept === "image" && "JPG, PNG, WebP, GIF — max 10 MB"}
              {accept === "video" && "MP4, MOV, WebM — max 100 MB"}
              {accept === "both" && "Images (10 MB) or Videos (100 MB)"}
            </div>
          </div>
        )}
      </div>

      {hint && <p className="text-white/30 text-xs">{hint}</p>}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
