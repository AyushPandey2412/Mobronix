"use client";

import { useRef, useState } from "react";
import { Camera, Check, X, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";
import type { PhotoSlot } from "@/lib/types";

interface Props {
  slot:     PhotoSlot;
  done:     boolean;
  preview?: string | null;
  onToggle: (done: boolean) => void;
}

export function PhotoUploader({ slot, done, preview: externalPreview, onToggle }: Props) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const setPhoto  = useStore((s) => s.setPhoto);
  const user      = useStore((s) => s.user);

  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [uploadError,  setUploadError]  = useState<string | null>(null);

  const preview = localPreview ?? externalPreview ?? null;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately — don't wait for upload
    const blobUrl = URL.createObjectURL(file);
    setLocalPreview(blobUrl);
    setUploadError(null);
    setUploading(true);
    onToggle(true); // mark as done optimistically

    try {
      const sb = createBrowserClient();

      // Path: seller-{mobile}/{slotId}-{timestamp}.jpg
      // The storage RLS policy (migration 004) requires the first folder segment to
      // match 'seller-%', so the guest fallback must also carry that prefix.
      const folder   = `seller-${user?.mobile || "guest"}`;
      const ext      = file.name.split(".").pop() ?? "jpg";
      const path     = `${folder}/${slot.id}-${Date.now()}.${ext}`;

      const { error: upErr } = await sb.storage
        .from("enquiry-photos")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,   // overwrite if re-uploading same slot
          contentType: file.type || "image/jpeg",
        });

      if (upErr) {
        // Upload failed — still keep local preview + done=true
        // so the user isn't blocked. The path just won't reach Supabase.
        console.warn("[PhotoUploader] upload failed:", upErr.message);
        setUploadError("Upload failed — photo saved locally only.");
        setPhoto(slot.id, { done: true, path: null });
      } else {
        // Success — store the path so checkout can pass it to the API
        setPhoto(slot.id, { done: true, path });
        setUploadError(null);
      }
    } catch (err: any) {
      console.warn("[PhotoUploader] unexpected error:", err);
      setUploadError("Could not upload — saved locally.");
      setPhoto(slot.id, { done: true, path: null });
    } finally {
      setUploading(false);
    }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setUploadError(null);
    setUploading(false);
    setPhoto(slot.id, { done: false, path: null });
    onToggle(false);
    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className={cn(
        "animate-m-fade-up relative flex flex-col rounded-xl border bg-surface p-4 transition-colors",
        done && !uploadError ? "border-success-300 bg-success-50/40" : "border-border",
        uploadError           ? "border-warning-300 bg-warning-50/40" : ""
      )}
    >
      <button
        type="button"
        onClick={() => !done && inputRef.current?.click()}
        className={cn(
          "relative mb-3 grid aspect-square w-full place-items-center overflow-hidden rounded-lg border-2 border-dashed transition-colors",
          done && !uploadError ? "border-success-300 bg-success-100/50 cursor-default" :
          uploadError          ? "border-warning-300 bg-warning-50 cursor-pointer" :
                                 "border-border-strong bg-neutral-50 hover:border-brand cursor-pointer"
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={slot.label} className="h-full w-full object-cover" />
        ) : done && !uploading ? (
          <span className="grid h-12 w-12 place-items-center rounded-full bg-success-500 text-white">
            <Check className="h-6 w-6" />
          </span>
        ) : (
          <span className="flex flex-col items-center gap-1.5 text-text-tertiary">
            <Camera className="h-7 w-7" />
            <span className="text-caption font-semibold">Add photo</span>
          </span>
        )}

        {/* Upload spinner overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/40 rounded-lg">
            <Loader className="h-6 w-6 text-white animate-spin" />
          </div>
        )}

        {/* Clear button */}
        {done && !uploading && (
          <span
            onClick={clear}
            className="absolute right-2 top-2 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-neutral-900/70 text-white hover:bg-neutral-900/90 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      <h4 className="text-body-sm font-bold text-text-primary">{slot.label}</h4>
      <p className="mt-0.5 text-caption leading-snug text-text-tertiary">{slot.hint}</p>

      <p className={cn(
        "mt-2 text-caption font-bold",
        uploading    ? "text-text-tertiary" :
        uploadError  ? "text-warning-700"   :
        done         ? "text-success-700"   : "text-text-tertiary"
      )}>
        {uploading   ? "Uploading…"  :
         uploadError ? "Saved locally" :
         done        ? "Uploaded"    : "Pending"}
      </p>
    </div>
  );
}
