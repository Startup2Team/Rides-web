"use client";

import { useState } from "react";
import { AdminPageHeader, Avatar, Card, StatusPill } from "../_components";
import { PartnerFormModal, type PartnerDraft } from "./partner-form-modal";
import { PartnerDetailDrawer } from "./partner-detail-drawer";
import { listPartners, listAdverts, savePartner, removePartner, type Partner } from "@/lib/partner-store";

export function PartnersConsole() {
  const [partners, setPartners] = useState<Partner[]>(() => listPartners());
  const [formOpen, setFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [viewingPartner, setViewingPartner] = useState<Partner | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function refresh() {
    setPartners(listPartners());
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  function handleSavePartner(draft: PartnerDraft) {
    const id = editingPartner?.id ?? `PTR-${Date.now().toString(36).toUpperCase()}`;
    const updated: Partner = {
      id,
      name: draft.name,
      logoUrl: draft.logoUrl,
      contactName: draft.contactName,
      contactEmail: draft.contactEmail,
      contactPhone: draft.contactPhone,
      status: draft.status,
      createdAt: editingPartner?.createdAt ?? Date.now(),
    };
    savePartner(updated);
    setFormOpen(false);
    setEditingPartner(null);
    if (viewingPartner?.id === id) setViewingPartner(updated);
    refresh();
    showToast(editingPartner ? "Partner updated" : "Partner added");
  }

  function handleDeletePartner(id: string) {
    removePartner(id);
    if (viewingPartner?.id === id) setViewingPartner(null);
    refresh();
    showToast("Partner removed");
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Monetization"
        title="Partners"
        subtitle="Manage advertising partners and the in-app banners they run."
        action={
          <button
            type="button"
            onClick={() => {
              setEditingPartner(null);
              setFormOpen(true);
            }}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            + Add partner
          </button>
        }
      />

      {partners.length === 0 ? (
        <Card>
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted-foreground">No partners yet.</p>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="mt-3 text-xs font-semibold text-primary hover:underline"
            >
              Add your first partner
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => {
            const adverts = listAdverts(partner.id);
            const activeCount = adverts.filter((a) => a.active).length;
            return (
              <div
                key={partner.id}
                role="button"
                tabIndex={0}
                onClick={() => setViewingPartner(partner)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setViewingPartner(partner);
                }}
                className="cursor-pointer text-left"
              >
                <Card bodyClass="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={partner.name} url={partner.logoUrl} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{partner.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{partner.contactEmail}</p>
                    </div>
                    <StatusPill status={partner.status === "active" ? "Active" : "Inactive"} tone={partner.status === "active" ? "success" : "neutral"} />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
                    <span>{adverts.length} advert{adverts.length === 1 ? "" : "s"}</span>
                    <span>{activeCount} active</span>
                  </div>
                  <div className="mt-3 flex justify-end border-t border-border pt-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePartner(partner.id);
                      }}
                      className="text-[11px] font-medium text-muted-foreground hover:text-red-600"
                    >
                      Remove partner
                    </button>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      <PartnerFormModal
        open={formOpen}
        partner={editingPartner}
        onClose={() => {
          setFormOpen(false);
          setEditingPartner(null);
        }}
        onSave={handleSavePartner}
      />

      {viewingPartner ? (
        <PartnerDetailDrawer
          partner={viewingPartner}
          onClose={() => {
            setViewingPartner(null);
            refresh();
          }}
          onEditPartner={() => {
            setEditingPartner(viewingPartner);
            setFormOpen(true);
          }}
        />
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 right-6 z-[80] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-2xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-medium text-foreground">{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
