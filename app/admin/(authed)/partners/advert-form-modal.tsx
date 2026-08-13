"use client";

import { useEffect, useState } from "react";
import { AdvertImageField } from "./advert-image-field";
import type { Advert } from "@/lib/partner-store";

export type AdvertDraft = {
  imageUrl: string | null;
  headline: string;
  ctaLabel: string;
  ctaLink: string;
  active: boolean;
  startDate: string;
  endDate: string;
  priority: number;
};

function draftFromAdvert(advert: Advert | null): AdvertDraft {
  if (!advert) {
    return {
      imageUrl: null,
      headline: "",
      ctaLabel: "Explore",
      ctaLink: "",
      active: true,
      startDate: "",
      endDate: "",
      priority: 1,
    };
  }
  return {
    imageUrl: advert.imageUrl ?? "",
    headline: advert.headline,
    ctaLabel: advert.ctaLabel ?? "",
    ctaLink: advert.ctaLink ?? "",
    active: advert.active,
    startDate: advert.startDate ?? "",
    endDate: advert.endDate ?? "",
    priority: advert.priority ?? 0,
  };
}

export function AdvertFormModal({
  open,
  advert,
  onClose,
  onSave,
}: {
  open: boolean;
  advert: Advert | null;
  onClose: () => void;
  onSave: (draft: AdvertDraft) => void;
}) {
  const [draft, setDraft] = useState<AdvertDraft>(() => draftFromAdvert(advert));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(draftFromAdvert(advert));
      setError(null);
    }
  }, [open, advert]);

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

  function handleSave() {
    if (!draft.headline.trim()) {
      setError("Headline is required.");
      return;
    }
    if (!draft.imageUrl) {
      setError("A banner image is required.");
      return;
    }
    onSave(draft);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold text-foreground">{advert ? "Edit advert" : "Add advert"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {/* Live preview */}
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Preview</p>
          <div className="relative mb-5 flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
            {draft.imageUrl ? (
              <img src={draft.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-muted-foreground">Upload an image to preview</span>
            )}
            {draft.imageUrl && (draft.headline || draft.ctaLabel) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/10 px-6 text-center">
                {draft.headline ? (
                  <p className="text-lg font-bold text-white drop-shadow">{draft.headline}</p>
                ) : null}
                {draft.ctaLabel ? (
                  <span className="rounded-full border border-white/70 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                    {draft.ctaLabel}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <AdvertImageField label="Banner image" value={draft.imageUrl} onChange={(v) => setDraft((d) => ({ ...d, imageUrl: v }))} />

            <div>
              <label className="text-xs font-semibold text-foreground">Headline</label>
              <input
                type="text"
                value={draft.headline}
                onChange={(e) => setDraft((d) => ({ ...d, headline: e.target.value }))}
                placeholder="Browse through our catalogue"
                className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">CTA button label</label>
                <input
                  type="text"
                  value={draft.ctaLabel}
                  onChange={(e) => setDraft((d) => ({ ...d, ctaLabel: e.target.value }))}
                  placeholder="Explore"
                  className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Priority</label>
                <input
                  type="number"
                  min={1}
                  value={draft.priority}
                  onChange={(e) => setDraft((d) => ({ ...d, priority: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                  className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">CTA link</label>
              <input
                type="text"
                value={draft.ctaLink}
                onChange={(e) => setDraft((d) => ({ ...d, ctaLink: e.target.value }))}
                placeholder="https://example.com/catalogue"
                className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Start date (optional)</label>
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
                  className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">End date (optional)</label>
                <input
                  type="date"
                  value={draft.endDate}
                  onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))}
                  className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <span className="text-xs font-medium text-foreground">Active — visible in the app</span>
            </label>
          </div>

          {error ? <p className="mt-3 text-xs font-medium text-red-600">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button type="button" onClick={onClose} className="h-9 rounded-lg border border-border px-4 text-xs font-medium hover:bg-surface">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
            {advert ? "Save changes" : "Add advert"}
          </button>
        </div>
      </div>
    </div>
  );
}
