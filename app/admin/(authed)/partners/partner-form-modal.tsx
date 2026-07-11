"use client";

import { useEffect, useState } from "react";
import { AdvertImageField } from "./advert-image-field";
import type { Partner } from "@/lib/partner-store";

export type PartnerDraft = {
  name: string;
  logoUrl: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: "active" | "inactive";
};

function draftFromPartner(partner: Partner | null): PartnerDraft {
  if (!partner) {
    return { name: "", logoUrl: null, contactName: "", contactEmail: "", contactPhone: "", status: "active" };
  }
  return {
    name: partner.name,
    logoUrl: partner.logoUrl,
    contactName: partner.contactName,
    contactEmail: partner.contactEmail,
    contactPhone: partner.contactPhone,
    status: partner.status,
  };
}

export function PartnerFormModal({
  open,
  partner,
  onClose,
  onSave,
}: {
  open: boolean;
  partner: Partner | null;
  onClose: () => void;
  onSave: (draft: PartnerDraft) => void;
}) {
  const [draft, setDraft] = useState<PartnerDraft>(() => draftFromPartner(partner));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(draftFromPartner(partner));
      setError(null);
    }
  }, [open, partner]);

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
    if (!draft.name.trim()) {
      setError("Partner name is required.");
      return;
    }
    onSave(draft);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold text-foreground">{partner ? "Edit partner" : "Add partner"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="text-xs font-semibold text-foreground">Partner / business name</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Heineken Rwanda"
              className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <AdvertImageField
            label="Logo (optional)"
            value={draft.logoUrl}
            onChange={(v) => setDraft((d) => ({ ...d, logoUrl: v }))}
            aspectHint="Square works best"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground">Contact name</label>
              <input
                type="text"
                value={draft.contactName}
                onChange={(e) => setDraft((d) => ({ ...d, contactName: e.target.value }))}
                className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Contact phone</label>
              <input
                type="text"
                value={draft.contactPhone}
                onChange={(e) => setDraft((d) => ({ ...d, contactPhone: e.target.value }))}
                className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Contact email</label>
            <input
              type="email"
              value={draft.contactEmail}
              onChange={(e) => setDraft((d) => ({ ...d, contactEmail: e.target.value }))}
              className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.status === "active"}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.checked ? "active" : "inactive" }))}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-xs font-medium text-foreground">Active partner</span>
          </label>

          {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button type="button" onClick={onClose} className="h-9 rounded-lg border border-border px-4 text-xs font-medium hover:bg-surface">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
            {partner ? "Save changes" : "Add partner"}
          </button>
        </div>
      </div>
    </div>
  );
}
