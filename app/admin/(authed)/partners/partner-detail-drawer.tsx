"use client";

import { useEffect, useState, useCallback } from "react";
import { Avatar, StatusPill } from "../_components";
import { AdvertFormModal, type AdvertDraft } from "./advert-form-modal";
import { listAdverts, saveAdvert, removeAdvert, type Partner, type Advert } from "@/lib/partner-store";

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString([], { dateStyle: "medium" });
}

export function PartnerDetailDrawer({
  partner,
  onClose,
  onEditPartner,
}: {
  partner: Partner;
  onClose: () => void;
  onEditPartner: () => void;
}) {
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [loading, setLoading] = useState(true);
  const [advertModalOpen, setAdvertModalOpen] = useState(false);
  const [editingAdvert, setEditingAdvert] = useState<Advert | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAdverts(partner.id);
      setAdverts(data);
    } catch (err) {
      console.error("Failed to load adverts:", err);
    } finally {
      setLoading(false);
    }
  }, [partner.id]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSaveAdvert(draft: AdvertDraft) {
    const advertId = editingAdvert?.id ?? "";
    const payload: Partial<Advert> = {
      partnerId: partner.id,
      imageUrl: draft.imageUrl,
      headline: draft.headline,
      ctaLabel: draft.ctaLabel,
      ctaLink: draft.ctaLink,
      active: draft.active,
      startDate: draft.startDate || null,
      endDate: draft.endDate || null,
      priority: draft.priority,
    };
    try {
      await saveAdvert(payload, advertId || undefined);
      setAdvertModalOpen(false);
      setEditingAdvert(null);
      await refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteAdvert(id: string) {
    try {
      await removeAdvert(id);
      await refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button type="button" aria-label="Close drawer" onClick={onClose} className="flex-1 bg-foreground/40 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-label={`Partner — ${partner.name}`}
        aria-modal="true"
        className="ml-auto flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-border bg-card shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={partner.name} url={partner.logoUrl} size="lg" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">{partner.id}</span>
                <StatusPill status={partner.status === "active" ? "Active" : "Inactive"} tone={partner.status === "active" ? "success" : "neutral"} />
              </div>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">{partner.name}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {partner.contactName} · {partner.contactEmail} · {partner.contactPhone}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Adverts ({adverts.length})</h3>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onEditPartner} className="h-8 rounded-lg border border-border px-3 text-xs font-medium hover:bg-surface">
                Edit partner
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingAdvert(null);
                  setAdvertModalOpen(true);
                }}
                className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                + Add advert
              </button>
            </div>
          </div>

          {loading ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">Loading adverts...</p>
          ) : adverts.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">No adverts yet — add one to get started.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {adverts.map((advert) => (
                <li key={advert.id} className="overflow-hidden rounded-xl border border-border">
                  <div className="relative h-28 w-full bg-muted">
                    {advert.imageUrl ? (
                      <img src={advert.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/10 px-4 text-center">
                      <p className="text-sm font-bold text-white drop-shadow">{advert.headline}</p>
                      <span className="rounded-full border border-white/70 bg-white/10 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                        {advert.ctaLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusPill status={advert.active ? "Active" : "Inactive"} tone={advert.active ? "success" : "neutral"} />
                        <span className="text-[10px] text-muted-foreground">Priority {advert.priority}</span>
                      </div>
                      <p className="mt-1 truncate text-[11px] text-muted-foreground">
                        {advert.startDate || advert.endDate
                          ? `${advert.startDate || "—"} → ${advert.endDate || "—"}`
                          : "No schedule set"}
                        {" · Added "}
                        {formatDate(advert.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAdvert(advert);
                          setAdvertModalOpen(true);
                        }}
                        className="h-8 rounded-lg border border-border px-3 text-xs font-medium hover:bg-surface"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteAdvert(advert.id)}
                        className="h-8 rounded-lg border border-border px-3 text-xs font-medium text-red-600 hover:border-red-200 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <AdvertFormModal
        open={advertModalOpen}
        advert={editingAdvert}
        onClose={() => {
          setAdvertModalOpen(false);
          setEditingAdvert(null);
        }}
        onSave={handleSaveAdvert}
      />
    </div>
  );
}
