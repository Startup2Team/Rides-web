"use client";

import { useEffect, useState, useRef } from "react";
import { uploadAdvertBannerImage, resolveBackendUrl } from "@/lib/api";
import type { Partner, Advert } from "@/lib/partner-store";

export type AdvertDraft = {
  partnerId: string;
  headline: string;
  imageUrl: string | null;
  ctaLabel: string;
  ctaLink: string;
  priority: number;
  active: boolean;
};

function draftFromAdvert(advert: Advert | null, partners: Partner[]): AdvertDraft {
  const defaultPartnerId = partners[0]?.id ?? "";
  if (!advert) {
    return {
      partnerId: defaultPartnerId,
      headline: "",
      imageUrl: null,
      ctaLabel: "Learn More",
      ctaLink: "https://",
      priority: 1,
      active: true,
    };
  }
  return {
    partnerId: advert.partnerId || defaultPartnerId,
    headline: advert.headline ?? "",
    imageUrl: advert.imageUrl ?? null,
    ctaLabel: advert.ctaLabel ?? "Learn More",
    ctaLink: advert.ctaLink ?? "https://",
    priority: advert.priority ?? 1,
    active: advert.active ?? true,
  };
}

export function AdvertFormModal({
  open,
  advert,
  partners,
  onClose,
  onSave,
}: {
  open: boolean;
  advert: Advert | null;
  partners: Partner[];
  onClose: () => void;
  onSave: (draft: AdvertDraft) => Promise<void>;
}) {
  const [draft, setDraft] = useState<AdvertDraft>(() => draftFromAdvert(advert, partners));
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDraft(draftFromAdvert(advert, partners));
      setError(null);
      setUploading(false);
      setSaving(false);
      setShowAdvanced(false);
    }
  }, [open, advert, partners]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleFileSelected(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (PNG or JPG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file is too large (max 10MB).");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const objectKey = await uploadAdvertBannerImage(file);
      setDraft((prev) => ({ ...prev, imageUrl: objectKey }));
    } catch (err) {
      console.error(err);
      setError("Failed to upload image banner to storage.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    if (!draft.headline.trim()) {
      setError("Headline Title is required.");
      return;
    }
    if (!draft.imageUrl) {
      setError("Please upload a banner image.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(draft);
    } catch (err) {
      console.error(err);
      setError("Failed to save advert banner.");
    } finally {
      setSaving(false);
    }
  }

  const previewSrc = draft.imageUrl
    ? draft.imageUrl.startsWith("data:") || draft.imageUrl.startsWith("http")
      ? draft.imageUrl
      : resolveBackendUrl(draft.imageUrl)
    : null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {advert ? "Edit Advert Banner" : "New Advert Banner"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 p-5">
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Banner Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-foreground">Banner Image *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
            />

            {previewSrc ? (
              <div className="relative mt-1.5 overflow-hidden rounded-xl border border-border bg-muted/30">
                <img src={previewSrc} alt="Banner Preview" className="h-32 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm hover:bg-black/90"
                >
                  {uploading ? "Uploading..." : "Change Image"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-1.5 flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-muted/10 p-3 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  📷
                </div>
                <p className="text-xs font-semibold text-foreground">
                  {uploading ? "Uploading image..." : "Upload Banner Image"}
                </p>
              </button>
            )}
          </div>

          {/* Headline Title */}
          <div>
            <label className="block text-xs font-semibold text-foreground">Headline Title *</label>
            <input
              type="text"
              placeholder="e.g. Airtel 5G Special Offer"
              value={draft.headline}
              onChange={(e) => setDraft((prev) => ({ ...prev, headline: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary"
            />
          </div>

          {/* Target URL */}
          <div>
            <label className="block text-xs font-semibold text-foreground">Target URL (Link)</label>
            <input
              type="url"
              placeholder="https://..."
              value={draft.ctaLink}
              onChange={(e) => setDraft((prev) => ({ ...prev, ctaLink: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2">
            <span className="text-xs font-medium text-foreground">Active on Driver App</span>
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft((prev) => ({ ...prev, active: e.target.checked }))}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
          </div>

          {/* Optional Advanced Settings Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              {showAdvanced ? "▾ Hide Advanced Settings" : "▸ Show Advanced Settings (Partner, Priority, Button)"}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 rounded-xl border border-border/80 bg-muted/10 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground">Partner Brand</label>
                    <select
                      value={draft.partnerId}
                      onChange={(e) => setDraft((prev) => ({ ...prev, partnerId: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none"
                    >
                      {partners.length > 0 ? (
                        partners.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))
                      ) : (
                        <option value="">General Brand</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-foreground">Priority Order</label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={draft.priority}
                      onChange={(e) => setDraft((prev) => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground">CTA Button Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Learn More"
                    value={draft.ctaLabel}
                    onChange={(e) => setDraft((prev) => ({ ...prev, ctaLabel: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-border bg-muted/10 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={uploading || saving}
            className="rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : advert ? "Save Changes" : "Create Advert"}
          </button>
        </div>
      </div>
    </div>
  );
}
