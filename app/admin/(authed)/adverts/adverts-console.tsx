"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminPageHeader, Card, StatusPill } from "../_components";
import { AdvertFormModal, type AdvertDraft } from "./advert-form-modal";
import { listPartners, listAdverts, saveAdvert, removeAdvert, type Partner, type Advert } from "@/lib/partner-store";
import { resolveBackendUrl } from "@/lib/api";

export function AdvertsConsole() {
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAdvert, setEditingAdvert] = useState<Advert | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [aData, pData] = await Promise.all([listAdverts(), listPartners()]);
      setAdverts(aData);
      setPartners(pData);
    } catch (err) {
      console.error("Failed to fetch adverts data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleSaveAdvert(draft: AdvertDraft) {
    const isNew = !editingAdvert;
    const advertId = editingAdvert?.id ?? "";
    let cleanImageUrl = draft.imageUrl;
    if (cleanImageUrl && cleanImageUrl.includes("/uploads/objects/")) {
      cleanImageUrl = cleanImageUrl.split("/uploads/objects/")[1] ?? cleanImageUrl;
    }

    const payload: Partial<Advert> = {
      partnerId: draft.partnerId,
      headline: draft.headline,
      imageUrl: cleanImageUrl,
      ctaLabel: draft.ctaLabel,
      ctaLink: draft.ctaLink,
      priority: draft.priority,
      active: draft.active,
    };

    try {
      await saveAdvert(payload, advertId || undefined);
      setFormOpen(false);
      setEditingAdvert(null);
      await refresh();
      showToast(isNew ? "Advert banner created" : "Advert banner updated");
    } catch (err) {
      console.error(err);
      showToast("Error saving advert banner");
    }
  }

  async function handleToggleActive(advert: Advert) {
    try {
      await saveAdvert({ active: !advert.active }, advert.id);
      await refresh();
      showToast(advert.active ? "Banner deactivated" : "Banner activated");
    } catch (err) {
      console.error(err);
      showToast("Error toggling banner status");
    }
  }

  async function handleDeleteAdvert(id: string) {
    if (!confirm("Are you sure you want to delete this advert banner?")) return;
    try {
      await removeAdvert(id);
      await refresh();
      showToast("Advert banner removed");
    } catch (err) {
      console.error(err);
      showToast("Error removing advert banner");
    }
  }

  const partnerMap = new Map(partners.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[80] rounded-xl bg-foreground px-4 py-2.5 text-xs font-semibold text-background shadow-xl">
          {toast}
        </div>
      )}

      <AdminPageHeader
        eyebrow="Monetization"
        title="Advert Banners"
        subtitle="Manage live advertising banners shown to drivers on the mobile app."
        action={
          <button
            type="button"
            onClick={() => {
              setEditingAdvert(null);
              setFormOpen(true);
            }}
            className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            + New Advert Banner
          </button>
        }
      />

      {loading ? (
        <Card>
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            Loading advert banners from backend...
          </div>
        </Card>
      ) : adverts.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
              📢
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">No Advert Banners Created Yet</h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Create your first promotional banner image to display custom deals and partner offers live to drivers on their mobile dashboard.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingAdvert(null);
                setFormOpen(true);
              }}
              className="mt-5 inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              + Create First Advert
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adverts.map((ad) => {
            const partnerName = partnerMap.get(ad.partnerId) ?? "General Brand";
            const imageSrc = ad.imageUrl
              ? ad.imageUrl.startsWith("data:") || ad.imageUrl.startsWith("http")
                ? ad.imageUrl
                : resolveBackendUrl(ad.imageUrl)
              : null;

            return (
              <div
                key={ad.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
              >
                {/* Banner Image */}
                <div className="relative h-40 w-full overflow-hidden bg-muted/30">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={ad.headline}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      No Image Banner
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <StatusPill status={ad.active ? "active" : "inactive"} tone={ad.active ? "success" : "neutral"} />
                  </div>
                  <div className="absolute bottom-2 left-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                    Priority #{ad.priority ?? 1}
                  </div>
                </div>

                {/* Content Details */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {partnerName}
                    </span>
                    <h3 className="mt-1 text-sm font-bold text-foreground">{ad.headline}</h3>
                    {ad.ctaLink && (
                      <a
                        href={ad.ctaLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        {ad.ctaLabel || "Learn More"} ↗
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(ad)}
                      className={`text-xs font-medium ${
                        ad.active ? "text-amber-500 hover:text-amber-600" : "text-emerald-500 hover:text-emerald-600"
                      }`}
                    >
                      {ad.active ? "Deactivate" : "Activate"}
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAdvert(ad);
                          setFormOpen(true);
                        }}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAdvert(ad.id)}
                        className="text-xs font-medium text-destructive hover:text-destructive/80"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <AdvertFormModal
        open={formOpen}
        advert={editingAdvert}
        partners={partners}
        onClose={() => {
          setFormOpen(false);
          setEditingAdvert(null);
        }}
        onSave={handleSaveAdvert}
      />
    </div>
  );
}
