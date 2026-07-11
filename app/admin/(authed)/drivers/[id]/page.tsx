"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DOC_LABELS as SHARED_DOC_LABELS, DOC_API_TYPE as SHARED_DOC_API_TYPE } from "@/lib/driver-registration";
import {
  getDriver,
  approveDriver,
  rejectDriver,
  requestDriverMoreInfo,
  resolveBackendUrl,
} from "@/lib/api";
import { mapDriverDetailToVerify } from "@/lib/drivers";
import { getMockDriverById, isMockDriverId, isMockReferredId, setMockDriverStatus, type MockDriverId } from "@/lib/mock-drivers";
import { isLocalDriverId, getLocalDriverDetail, updateLocalDriverStatus } from "@/lib/local-drivers";
import type { VerifyDriver, ReviewHistoryEntry } from "../verify-driver-modal";
import { ReferredDriversSection } from "../referred-drivers-section";

type DocKey = "profile_photo" | "national_id" | "license" | "insurance" | "authorization";

const DOCS: { key: DocKey; label: string }[] = [
  { key: "profile_photo", label: "Profile photo (selfie)" },
  { key: "national_id", label: "National ID" },
  { key: "license", label: "Driver's licence" },
  { key: "insurance", label: "Vehicle insurance certificate" },
  { key: "authorization", label: "Vehicle authorization / inspection" },
];

const DOC_LABELS: Record<
  DocKey,
  { label: string; hint: string; frontRequired: boolean; backRequired: boolean; twoFaces: boolean }
> = {
  ...SHARED_DOC_LABELS,
  profile_photo: {
    label: "Profile photo (selfie)",
    hint: "Driver selfie / portrait photo — JPEG or PNG",
    frontRequired: true,
    backRequired: false,
    twoFaces: false,
  },
};

const DOC_API_TYPE: Record<DocKey, string[]> = {
  ...SHARED_DOC_API_TYPE,
  profile_photo: ["PROFILE_SELFIE"],
};

const PROFILE_REJECTION_REASONS = [
  "Photo is blurry or low quality",
  "Not a clear portrait (selfie) photo",
  "Face is obstructed (sunglasses, hat, mask)",
  "Does not match the licence/ID photo",
  "Invalid format (not a photo of a person)",
  "Other",
];

const REJECTION_REASONS = [
  "Image is blurry or unreadable",
  "Document has expired",
  "Personal information does not match",
  "Wrong document type submitted",
  "Document is cut off or incomplete",
  "Signature or stamp is missing",
  "Other",
] as const;

type FaceReason = { preset: string; custom: string };
const emptyFaceReason = (): FaceReason => ({ preset: "", custom: "" });

type FaceDecision = { status: "none" | "accepted" | "rejected"; reason: FaceReason };
const emptyFace = (status: FaceDecision["status"] = "none"): FaceDecision => ({ status, reason: emptyFaceReason() });

type DocDecision = { front: FaceDecision; back: FaceDecision };

function docStatus(key: DocKey, dec: DocDecision): "none" | "accepted" | "rejected" {
  const two = DOC_LABELS[key].twoFaces;
  if (dec.front.status === "rejected" || (two && dec.back.status === "rejected")) return "rejected";
  if (dec.front.status === "accepted" && (!two || dec.back.status === "accepted")) return "accepted";
  return "none";
}
function docReviewed(key: DocKey, dec: DocDecision): boolean {
  const two = DOC_LABELS[key].twoFaces;
  return dec.front.status !== "none" && (!two || dec.back.status !== "none");
}

// Exact document_type values sent by both the mobile app and the admin add-driver form.
const DOC_TYPES: Record<DocKey, { front: string[]; back: string[] }> = {
  profile_photo: {
    front: ["PROFILE_SELFIE", "SELFIE", "PROFILE_PHOTO"],
    back: [],
  },
  national_id: {
    front: ["NATIONAL_ID_FRONT", "NATIONAL_ID"],
    back: ["NATIONAL_ID_BACK"],
  },
  license: {
    front: ["LICENCE_FRONT", "LICENSE_FRONT", "DRIVERS_LICENSE"],
    back: ["LICENCE_BACK", "LICENSE_BACK"],
  },
  insurance: {
    front: ["VEHICLE_INSURANCE"],
    back: [],
  },
  authorization: {
    front: ["VEHICLE_AUTHORIZATION"],
    back: [],
  },
};

function findDocUrl(driver: VerifyDriver, types: string[]): string | null {
  const doc = driver.documents?.find((d) =>
    types.some((t) => d.document_type.toUpperCase() === t.toUpperCase()),
  );
  return resolveBackendUrl(doc?.file_url?.trim()) || null;
}

function docFacesFor(driver: VerifyDriver, kind: DocKey): { front: string | null; back: string | null } {
  return {
    front: findDocUrl(driver, DOC_TYPES[kind].front),
    back: findDocUrl(driver, DOC_TYPES[kind].back),
  };
}

/**
 * Rebuild the checkbox state from the driver's record instead of always starting blank,
 * so a previously-approved document stays checked when the review page is reopened.
 * Prefers the granular per-document decisions from the latest review; falls back to
 * marking everything accepted when the driver's overall status is already "approved"
 * (older approvals didn't persist per-document decisions).
 */
function buildInitialDecisions(
  driver: VerifyDriver | null,
  isLocal: boolean,
): Record<DocKey, DocDecision> {
  const keys: DocKey[] = ["profile_photo", "national_id", "license", "insurance", "authorization"];
  const base = (status: FaceDecision["status"]): DocDecision => ({
    front: emptyFace(status),
    back: emptyFace(status),
  });

  if (isLocal) {
    return keys.reduce(
      (acc, key) => ({ ...acc, [key]: base("accepted") }),
      {} as Record<DocKey, DocDecision>,
    );
  }
  if (!driver) {
    return keys.reduce(
      (acc, key) => ({ ...acc, [key]: base("none") }),
      {} as Record<DocKey, DocDecision>,
    );
  }

  const latestReview = driver.reviewHistory?.length
    ? [...driver.reviewHistory].sort(
        (a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime(),
      )[0]
    : undefined;
  const approvedOverall = driver.approvalStatus?.trim().toUpperCase() === "APPROVED";

  const result = keys.reduce(
    (acc, key) => ({ ...acc, [key]: base("none") }),
    {} as Record<DocKey, DocDecision>,
  );

  keys.forEach((key) => {
    (["front", "back"] as const).forEach((face) => {
      const types = DOC_TYPES[key][face];
      if (types.length === 0) return;
      const match = latestReview?.documentDecisions?.find((d) =>
        types.some((t) => d.documentType.toUpperCase() === t.toUpperCase()),
      );
      if (match) {
        const status: FaceDecision["status"] =
          match.decision === "accepted" ? "accepted" : match.decision === "rejected" ? "rejected" : "none";
        result[key][face] = emptyFace(status);
      } else if (approvedOverall) {
        result[key][face] = emptyFace("accepted");
      }
    });
  });

  return result;
}

function licenseCategory(vehicle: string) {
  if (vehicle.includes("Moto")) return "A — Motorcycle";
  if (vehicle.includes("Cab")) return "B — Light vehicle";
  if (vehicle.includes("Hilux")) return "C1 — Light commercial";
  if (vehicle.includes("Fuso")) return "C — Heavy goods";
  return "B — Light vehicle";
}

/* ───────────────────────────────────────────────────────────────────────── */
/* Review history — past admin decisions for this driver                       */
/* ───────────────────────────────────────────────────────────────────────── */

function formatHistoryDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function decisionMeta(decision: ReviewHistoryEntry["decision"]) {
  switch (decision) {
    case "approved":
      return {
        label: "Approved",
        pillCls: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
        edgeCls: "border-emerald-200",
      };
    case "rejected":
      return {
        label: "Rejected",
        pillCls: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
        edgeCls: "border-red-200",
      };
    case "more_info_requested":
      return {
        label: "More info requested",
        pillCls: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
        edgeCls: "border-amber-200",
      };
  }
}

function ReviewHistorySection({ history }: { history: ReviewHistoryEntry[] }) {
  const [expanded, setExpanded] = useState(() => {
    if (!history || history.length === 0) return false;
    const sortedHistory = [...history].sort(
      (a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime(),
    );
    return sortedHistory[0].decision !== "approved";
  });

  // Render nothing if no prior decisions — keeps the page clean for first-time reviews.
  if (!history || history.length === 0) return null;

  // Newest first — defensively re-sort in case the backend hasn't.
  const sorted = [...history].sort(
    (a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime(),
  );
  const latest = sorted[0];
  const latestMeta = decisionMeta(latest.decision);
  const previousCount = sorted.length - 1;

  return (
    <section
      aria-label="Previous reviews"
      className={`overflow-hidden rounded-2xl border-2 bg-card ${latestMeta.edgeCls}`}
    >
      {/* Header / summary */}
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Previous review{sorted.length === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-sm font-bold tracking-tight text-foreground">
              This driver was{" "}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${latestMeta.pillCls}`}
              >
                {latestMeta.label}
              </span>{" "}
              previously
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {formatHistoryDate(latest.decidedAt)} · by{" "}
              <span className="font-semibold text-foreground">{latest.decidedBy}</span>
              {previousCount > 0
                ? ` · ${previousCount} earlier review${previousCount === 1 ? "" : "s"}`
                : ""}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted sm:self-auto"
        >
          {expanded ? "Hide details" : "Show details"}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Expandable timeline */}
      {expanded ? (
        <ol className="divide-y divide-border border-t border-border">
          {sorted.map((entry) => {
            const meta = decisionMeta(entry.decision);
            return (
              <li key={entry.id} className="px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.pillCls}`}
                  >
                    {meta.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatHistoryDate(entry.decidedAt)} · {entry.decidedBy}
                  </span>
                </div>

                {entry.reason ? (
                  <p className="mt-2 rounded-lg bg-muted/40 px-3 py-2 text-xs leading-relaxed text-foreground">
                    {entry.reason}
                  </p>
                ) : null}

                {entry.documentDecisions && entry.documentDecisions.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {entry.documentDecisions.map((d, i) => (
                      <li
                        key={`${entry.id}-${i}`}
                        className="flex items-start gap-2 text-[11px] leading-snug text-muted-foreground"
                      >
                        <span
                          className={`mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                            d.decision === "accepted"
                              ? "bg-emerald-500"
                              : d.decision === "rejected"
                              ? "bg-red-500"
                              : "bg-amber-500"
                          }`}
                          aria-hidden
                        />
                        <span>
                          <strong className="font-semibold text-foreground">
                            {d.documentType}
                          </strong>
                          : <span className="capitalize">{d.decision.replace(/_/g, " ")}</span>
                          {d.comment ? <span> — {d.comment}</span> : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}

/** Small inline status pill — colour matches the approval state. */
function ApprovalStatusPill({ status }: { status: string }) {
  const normalised = (status ?? "").trim().toLowerCase();
  const config: Record<string, { label: string; cls: string }> = {
    pending: {
      label: "Pending review",
      cls: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
    },
    approved: {
      label: "Approved",
      cls: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
    },
    rejected: {
      label: "Rejected",
      cls: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
    },
    suspended: {
      label: "Suspended",
      cls: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
    },
  };
  const fallback = {
    label: normalised
      ? normalised.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())
      : "Unknown",
    cls: "bg-muted text-muted-foreground",
  };
  const { label, cls } = config[normalised] ?? fallback;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}
      aria-label={`Approval status: ${label}`}
    >
      {label}
    </span>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase font-semibold text-muted-foreground">{label}</p>
      <p className={`text-xs font-bold text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function PreviewField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-0.5 text-xs font-semibold tracking-tight text-foreground ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function DocFaceCard({ label, url }: { label: string; url: string }) {
  const isImage = /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url) || url.startsWith("data:image/");
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold text-primary hover:underline"
        >
          Open ↗
        </a>
      </div>
      <div className="p-3">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="max-h-52 w-full rounded-md object-contain" />
        ) : (
          <p className="text-xs text-muted-foreground">
            Preview not available — use the link above to open the file.
          </p>
        )}
      </div>
    </div>
  );
}

function DocumentPreview({ kind, driver }: { kind: DocKey; driver: VerifyDriver }) {
  const { front, back } = docFacesFor(driver, kind);
  const isTwoFace = DOC_LABELS[kind].twoFaces;

  if (kind === "profile_photo") {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-muted/10 border border-border rounded-xl space-y-3">
        {front ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={front}
            alt={driver.name}
            className="h-36 w-36 rounded-full object-cover ring-4 ring-primary/10 shadow-sm"
          />
        ) : (
          <span className="flex h-36 w-36 items-center justify-center rounded-full bg-primary/15 text-primary text-4xl font-bold ring-4 ring-primary/10">
            {driver.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">{driver.name}</p>
          {front && (
            <a
              href={front}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex text-xs font-semibold text-primary hover:underline"
            >
              Open original ↗
            </a>
          )}
        </div>
      </div>
    );
  }

  if (front || back) {
    return (
      <div className="space-y-3">
        {front ? (
          <DocFaceCard label={isTwoFace ? "Front face" : "Document"} url={front} />
        ) : (
          <div className="rounded-lg border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
            {isTwoFace ? "Front face not yet uploaded" : "Document not yet uploaded"}
          </div>
        )}
        {isTwoFace ? (
          back ? (
            <DocFaceCard label="Back face" url={back} />
          ) : (
            <div className="rounded-lg border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
              Back face not uploaded
            </div>
          )
        ) : null}
      </div>
    );
  }

  if (kind === "license") {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-gradient-to-br from-surface to-card">
        <div className="flex items-center justify-between border-b border-border bg-primary/[0.05] px-3 py-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
            Republic of Rwanda · Driver Licence
          </span>
          <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary">
            Valid
          </span>
        </div>
        <div className="flex gap-3 p-3">
          <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground ring-1 ring-inset ring-border">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden>
              <circle cx="12" cy="8" r="4" />
              <path d="M5 20a7 7 0 0 1 14 0" />
            </svg>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-2">
            <PreviewField label="Name" value={driver.name} />
            <PreviewField label="Licence no." value={driver.kyc.licenseNumber} mono />
            <PreviewField label="Date of birth" value={driver.kyc.dob} />
            <PreviewField label="Category" value={licenseCategory(driver.vehicle)} />
            <PreviewField label="Issued" value="05 Jan 2022" />
            <PreviewField label="Expires" value="05 Jan 2027" />
          </div>
        </div>
      </div>
    );
  }

  if (kind === "insurance") {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-gradient-to-br from-surface to-card">
        <div className="flex items-center justify-between border-b border-border bg-primary/[0.05] px-3 py-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
            Insurance Certificate
          </span>
          <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary">
            Active
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 p-3">
          <PreviewField label="Provider" value="SONARWA Insurance Ltd." />
          <PreviewField label="Policy no." value="POL-2026-04821" mono />
          <PreviewField label="Insured" value={driver.name} />
          <PreviewField label="Vehicle plate" value={driver.plate} mono />
          <PreviewField label="Coverage" value="Third-party + Comprehensive" />
          <PreviewField label="Valid from" value="01 Mar 2026" />
          <PreviewField label="Valid until" value="28 Feb 2027" />
          <PreviewField label="Premium" value="148,000 RWF" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-gradient-to-br from-surface to-card">
      <div className="flex items-center justify-between border-b border-border bg-primary/[0.05] px-3 py-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
          Vehicle Authorization · Rwanda Police
        </span>
        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary">
          Passed
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 p-3">
        <PreviewField label="Certificate no." value="VA-2026-09127" mono />
        <PreviewField label="Vehicle plate" value={driver.plate} mono />
        <PreviewField label="Vehicle type" value={driver.vehicle} />
        <PreviewField label="Owner" value={driver.name} />
        <PreviewField label="Inspection date" value="14 Mar 2026" />
        <PreviewField label="Valid until" value="14 Mar 2027" />
        <PreviewField label="Inspection result" value="Passed — no defects" />
        <PreviewField label="Inspector ID" value="INS-RNP-0421" mono />
      </div>
    </div>
  );
}

/**
 * Unsubmitted per-document decisions only ever lived in React state, so refreshing
 * the page mid-review silently discarded every checkbox and reason the admin had
 * already entered. Mirroring the draft to localStorage keeps it around across
 * refreshes and browser restarts alike; it's cleared once the review is actually
 * submitted.
 */
const DRAFT_KEY_PREFIX = "taravelis_driver_review_draft_";

function loadDraftDecisions(driverId: string): Record<DocKey, DocDecision> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY_PREFIX + driverId);
    return raw ? (JSON.parse(raw) as Record<DocKey, DocDecision>) : null;
  } catch {
    return null;
  }
}

function saveDraftDecisions(driverId: string, decisions: Record<DocKey, DocDecision>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY_PREFIX + driverId, JSON.stringify(decisions));
  } catch {
    // Storage unavailable — the draft simply won't survive a refresh this time.
  }
}

function clearDraftDecisions(driverId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY_PREFIX + driverId);
  } catch {
    // ignore
  }
}

export default function DriverReviewPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [driver, setDriver] = useState<VerifyDriver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isMock = isMockDriverId(id) || isMockReferredId(id);
  const isLocal = isLocalDriverId(id);

  // Admin-added drivers are trusted — pre-accept all documents on load. Everyone else
  // gets their decisions rebuilt from the driver record once it loads (see below), so a
  // previously-approved document stays checked instead of resetting to unreviewed.
  const [decisions, setDecisions] = useState<Record<DocKey, DocDecision>>(() => {
    const s: FaceDecision["status"] = isLocal ? "accepted" : "none";
    const base = (): DocDecision => ({ front: emptyFace(s), back: emptyFace(s) });
    return { profile_photo: base(), national_id: base(), license: base(), insurance: base(), authorization: base() };
  });
  // Gates the draft-saving effect below until the initial load has restored
  // (or built) the decisions for this driver — otherwise it would overwrite a
  // saved draft with blank state during the split second before data arrives.
  const draftReadyRef = useRef(false);

  useEffect(() => {
    setLoading(true);
    draftReadyRef.current = false;
    if (isMock) {
      const t = setTimeout(() => {
        const detail = getMockDriverById(id);
        if (!detail) {
          setError("Driver profile not found.");
          setDriver(null);
          setLoading(false);
          return;
        }
        const mapped = mapDriverDetailToVerify(detail);
        setDriver(mapped);
        setDecisions(loadDraftDecisions(id) ?? buildInitialDecisions(mapped, isLocal));
        draftReadyRef.current = true;
        setLoading(false);
      }, 400);
      return () => clearTimeout(t);
    }
    if (isLocal) {
      const detail = getLocalDriverDetail(id);
      if (detail) {
        const mapped = mapDriverDetailToVerify(detail);
        setDriver(mapped);
        setDecisions(loadDraftDecisions(id) ?? buildInitialDecisions(mapped, isLocal));
        draftReadyRef.current = true;
      } else {
        setError("Locally-saved driver not found. It may have been cleared from storage.");
      }
      setLoading(false);
      return;
    }
    getDriver(id)
      .then((detail) => {
        const mapped = mapDriverDetailToVerify(detail);
        setDriver(mapped);
        setDecisions(loadDraftDecisions(id) ?? buildInitialDecisions(mapped, isLocal));
        draftReadyRef.current = true;
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load driver profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, isMock, isLocal]);

  useEffect(() => {
    if (!draftReadyRef.current) return;
    saveDraftDecisions(id, decisions);
  }, [id, decisions]);

  useEffect(() => {
    if (!confirmOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [confirmOpen]);

  const updateFaceStatus = (key: DocKey, face: "front" | "back", status: FaceDecision["status"]) => {
    setDecisions((prev) => ({
      ...prev,
      [key]: { ...prev[key], [face]: { status, reason: emptyFaceReason() } },
    }));
  };

  const updateFaceReason = (key: DocKey, face: "front" | "back", field: keyof FaceReason, value: string) => {
    setDecisions((prev) => ({
      ...prev,
      [key]: { ...prev[key], [face]: { ...prev[key][face], reason: { ...prev[key][face].reason, [field]: value } } },
    }));
  };

  const allReviewed = DOCS.every((d) => docReviewed(d.key, decisions[d.key]));
  const allAccepted = DOCS.every((d) => docStatus(d.key, decisions[d.key]) === "accepted");
  const allRejected = DOCS.every((d) => docStatus(d.key, decisions[d.key]) === "rejected");

  const faceInvalid = (f: FaceDecision) =>
    f.status === "rejected" && (!f.reason.preset || (f.reason.preset === "Other" && !f.reason.custom.trim()));
  const hasInvalidRejectedReason = DOCS.some((d) => {
    const dec = decisions[d.key];
    return faceInvalid(dec.front) || (DOC_LABELS[d.key].twoFaces && faceInvalid(dec.back));
  });

  const handleApprove = async () => {
    if (!driver) return;
    setActionLoading(true);
    try {
      if (isMock) {
        setMockDriverStatus(id as MockDriverId, "APPROVED");
        window.dispatchEvent(new Event("localDriversUpdated"));
      } else if (isLocal) {
        updateLocalDriverStatus(driver.id, "APPROVED");
        window.dispatchEvent(new Event("localDriversUpdated"));
      } else {
        await approveDriver(driver.id);
      }
      clearDraftDecisions(driver.id);
      setToast(isMock || isLocal ? "[Local] Driver approved — no real API call made." : "Driver approved successfully!");
      setTimeout(() => router.push("/admin/drivers"), 1500);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Failed to approve driver");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!driver) return;
    setActionLoading(true);
    const faceText = (f: FaceDecision) =>
      f.status === "accepted" ? "Accepted" :
      f.reason.preset === "Other" ? f.reason.custom || "Other" : f.reason.preset || "No reason given";
    const reasons = DOCS.filter((d) => docStatus(d.key, decisions[d.key]) === "rejected")
      .map((d) => {
        const dec = decisions[d.key];
        const isTwoFace = DOC_LABELS[d.key].twoFaces;
        const frontPart = `Front: ${faceText(dec.front)}`;
        const backPart = isTwoFace ? ` | Back: ${faceText(dec.back)}` : "";
        return `${d.label}: ${frontPart}${backPart}`;
      })
      .join("; ");
    try {
      if (isMock) {
        setMockDriverStatus(id as MockDriverId, "REJECTED");
        window.dispatchEvent(new Event("localDriversUpdated"));
      } else if (isLocal) {
        updateLocalDriverStatus(driver.id, "REJECTED");
        window.dispatchEvent(new Event("localDriversUpdated"));
      } else {
        await rejectDriver(driver.id, reasons || "Application rejected by admin");
      }
      clearDraftDecisions(driver.id);
      setToast(isMock || isLocal ? "[Local] Application rejected — no real API call made." : "Driver application rejected");
      setTimeout(() => router.push("/admin/drivers"), 1500);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Failed to reject application");
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Asks the driver to re-upload just the flagged documents instead of rejecting the
   * whole application — the accepted documents and the driver's overall status are
   * left untouched pending resubmission.
   */
  const handleRequestMoreInfo = async () => {
    if (!driver) return;
    setActionLoading(true);
    const faceComment = (f: FaceDecision) =>
      f.reason.preset === "Other" ? f.reason.custom || "Other" : f.reason.preset || "No reason given";
    const flaggedDocs = DOCS.filter((d) => docStatus(d.key, decisions[d.key]) === "rejected");
    const documents = flaggedDocs.flatMap((d) => {
      const dec = decisions[d.key];
      const isTwoFace = DOC_LABELS[d.key].twoFaces;
      const items: { document_type: string; comment?: string }[] = [];
      if (dec.front.status === "rejected") {
        items.push({ document_type: DOC_API_TYPE[d.key][0], comment: faceComment(dec.front) });
      }
      if (isTwoFace && dec.back.status === "rejected") {
        items.push({ document_type: DOC_API_TYPE[d.key][1], comment: faceComment(dec.back) });
      }
      return items;
    });
    const reason = `Please re-upload the following document(s): ${flaggedDocs.map((d) => d.label).join(", ")}`;
    try {
      if (!isMock && !isLocal) await requestDriverMoreInfo(driver.id, reason, documents);
      clearDraftDecisions(driver.id);
      setToast(
        isMock || isLocal
          ? "[Local] Re-upload request sent — no real API call made."
          : "Driver asked to re-upload the flagged documents.",
      );
      setTimeout(() => router.push("/admin/drivers"), 1500);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Failed to send re-upload request");
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Single submit action for the whole review: approves if every document was
   * accepted, rejects the whole application only if every document was rejected,
   * and otherwise asks the driver to re-upload just the rejected documents while
   * leaving the accepted ones and the driver's overall status untouched.
   */
  const handleDone = () => {
    if (allAccepted) return handleApprove();
    if (allRejected) return handleReject();
    return handleRequestMoreInfo();
  };

  const describeFaceStatus = (f: FaceDecision): string => {
    if (f.status === "accepted") return "Accepted";
    if (f.status === "rejected") {
      const reasonText =
        f.reason.preset === "Other" ? f.reason.custom || "Other" : f.reason.preset || "No reason given";
      return `Rejected — ${reasonText}`;
    }
    return "Not reviewed";
  };

  const confirmCopy = allAccepted
    ? {
        title: "Approve this driver?",
        body: "Every document was accepted. Confirming will approve the driver application.",
        confirmLabel: "Confirm Approval",
        confirmCls: "bg-primary hover:opacity-90",
      }
    : allRejected
    ? {
        title: "Reject this application?",
        body: "Every document was rejected. Confirming will reject the whole driver application.",
        confirmLabel: "Confirm Rejection",
        confirmCls: "bg-red-600 hover:bg-red-700",
      }
    : {
        title: "Send documents back for re-upload?",
        body: "Accepted documents stay as-is. Confirming will ask the driver to re-upload the rejected documents below.",
        confirmLabel: "Confirm & Submit",
        confirmCls: "bg-amber-500 hover:bg-amber-600",
      };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading driver profile…</p>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="mx-auto max-w-xl text-center py-12">
        <p className="text-sm font-semibold text-red-600">Error loading profile</p>
        <p className="mt-1 text-xs text-muted-foreground">{error || "Driver profile not found."}</p>
        <Link
          href="/admin/drivers"
          className="mt-4 inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground"
        >
          Back to list
        </Link>
      </div>
    );
  }

  const profilePicDoc = driver.documents?.find((d) => {
    const t = d.document_type.toUpperCase();
    return t === "PROFILE_SELFIE" || t.includes("SELFIE") || t.includes("PROFILE");
  });
  const profilePicUrl = resolveBackendUrl(profilePicDoc?.file_url) || null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-foreground text-background px-4 py-3 text-xs font-semibold shadow-lg">
          {toast}
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {profilePicUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profilePicUrl}
              alt={driver.name}
              className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/10"
            />
          ) : (
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-2xl font-bold ring-4 ring-primary/10">
              {driver.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              Driver Review
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {driver.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:justify-start">
              <span>
                Plate: <strong className="text-foreground">{driver.plate}</strong>
              </span>
              <span aria-hidden>·</span>
              <span>
                Phone: <strong className="text-foreground">{driver.kyc.phone || "—"}</strong>
              </span>
              <span aria-hidden>·</span>
              <ApprovalStatusPill status={driver.approvalStatus} />
            </div>
            <div className="mt-4 max-w-xs mx-auto sm:mx-0">
              <ReferredDriversSection
                driverId={driver.id}
                count={driver.referralCount}
                compact
              />
            </div>
          </div>
        </div>
        <Link
          href="/admin/drivers"
          className="inline-flex h-9 shrink-0 items-center rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-surface"
        >
          ← Back to Drivers
        </Link>
      </div>

      {!isLocal && driver.reviewHistory && driver.reviewHistory.length > 0 ? (
        <ReviewHistorySection history={driver.reviewHistory} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Documents Review List */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Submitted Documents</h2>
          <ul className="space-y-4">
            {DOCS.map((d) => {
              const current = decisions[d.key];
              const ds = docStatus(d.key, current);
              const faces = docFacesFor(driver, d.key);
              const hasAnyFace = !!(faces.front || faces.back);
              const isTwoFace = DOC_LABELS[d.key].twoFaces;
              return (
                <li
                  key={d.key}
                  className={`overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300 ${
                    ds === "accepted"
                      ? "border-emerald-500/30 shadow-md shadow-emerald-500/5"
                      : ds === "rejected"
                      ? "border-red-500/30 shadow-md shadow-red-500/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-foreground">{d.label}</h3>
                        {hasAnyFace && (
                          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {faces.front && faces.back ? "2 faces" : "1 face"}
                          </span>
                        )}
                      </div>
                      <DocumentPreview kind={d.key} driver={driver} />
                    </div>

                    {/* Per-face document decisions */}
                    <div className="shrink-0 space-y-4 md:w-56 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Document Decision
                      </p>
                      {(["front", "back"] as const)
                        .filter((face) => face === "front" || isTwoFace)
                        .map((face) => {
                          const fd = current[face];
                          return (
                            <div key={face} className="space-y-2">
                              {isTwoFace && (
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  {face === "front" ? "Front face" : "Back face"}
                                </p>
                              )}
                              <div className="flex gap-4">
                                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer select-none text-emerald-700">
                                  <input
                                    type="checkbox"
                                    checked={fd.status === "accepted"}
                                    onChange={() =>
                                      updateFaceStatus(d.key, face, fd.status === "accepted" ? "none" : "accepted")
                                    }
                                    className="h-3.5 w-3.5 rounded border-border accent-emerald-600"
                                  />
                                  {fd.status === "accepted" ? "Accepted" : "Accept"}
                                </label>
                                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer select-none text-red-600">
                                  <input
                                    type="checkbox"
                                    checked={fd.status === "rejected"}
                                    onChange={() =>
                                      updateFaceStatus(d.key, face, fd.status === "rejected" ? "none" : "rejected")
                                    }
                                    className="h-3.5 w-3.5 rounded border-border accent-red-600"
                                  />
                                  {fd.status === "rejected" ? "Rejected" : "Reject"}
                                </label>
                              </div>
                              {fd.status === "rejected" && (
                                <div className="space-y-1">
                                  <select
                                    value={fd.reason.preset}
                                    onChange={(e) => updateFaceReason(d.key, face, "preset", e.target.value)}
                                    className="w-full rounded-lg border border-red-200 bg-white px-2 py-1.5 text-xs text-foreground outline-none focus:border-red-500"
                                  >
                                    <option value="">— Select reason —</option>
                                    {(d.key === "profile_photo" ? PROFILE_REJECTION_REASONS : REJECTION_REASONS).map((r) => (
                                      <option key={r} value={r}>{r}</option>
                                    ))}
                                  </select>
                                  {fd.reason.preset === "Other" && (
                                    <textarea
                                      value={fd.reason.custom}
                                      onChange={(e) => updateFaceReason(d.key, face, "custom", e.target.value)}
                                      placeholder="Describe the issue…"
                                      rows={2}
                                      className="w-full rounded-lg border border-red-200 bg-red-50/20 px-2 py-1.5 text-xs text-foreground outline-none focus:border-red-500 resize-none"
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sidebar Info — sticky so it stays visible while scrolling docs */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 rounded-2xl border border-border bg-card p-5 space-y-5">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Driver and Vehicle Info</h2>

            {/* Circular Profile Selfie */}
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              {profilePicUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profilePicUrl}
                  alt={driver.name}
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-primary/10 shadow-sm"
                />
              ) : (
                <span className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/15 text-primary text-3xl font-bold ring-4 ring-primary/10">
                  {driver.name.charAt(0).toUpperCase()}
                </span>
              )}
              <p className="text-sm font-semibold text-foreground text-center">{driver.name}</p>
            </div>

            <div className="border-t border-border" />

            {/* Personal */}
            <div className="space-y-3">
              <InfoRow label="Phone number" value={driver.kyc.phone} />
              <InfoRow label="Date of birth / Age" value={`${driver.kyc.dob} (Age ${driver.kyc.age})`} />
              <InfoRow label="Residential location" value={driver.kyc.location} />
              <InfoRow label="Vehicle" value={`${driver.vehicle} · ${driver.plate}`} />
              <InfoRow label="MoMo payout" value={`${driver.kyc.momoProvider} · ${driver.kyc.momoCode}`} mono />
            </div>

            <div className="border-t border-border" />

            {/* National ID */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">National ID</p>
              <InfoRow label="ID number" value={driver.kyc.nationalIdNumber || "—"} mono />
            </div>

            <div className="border-t border-border" />

            {/* Driver's Licence */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Driver's Licence</p>
              <InfoRow label="Licence number" value={driver.kyc.licenseNumber} mono />
              <InfoRow label="Issued" value={driver.kyc.licenseIssuedDate || "—"} />
              <InfoRow label="Expires" value={driver.kyc.licenseExpiryDate || "—"} />
            </div>

            <div className="border-t border-border" />

            {/* Vehicle Insurance */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Vehicle Insurance</p>
              <InfoRow label="Issued" value={driver.kyc.insuranceIssuedDate || "—"} />
              <InfoRow label="Expires" value={driver.kyc.insuranceExpiryDate || "—"} />
            </div>

            <div className="border-t border-border" />

            {/* Vehicle Authorization */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Vehicle Authorization</p>
              <InfoRow label="Issued" value={driver.kyc.authorizationIssuedDate || "—"} />
              <InfoRow label="Expires" value={driver.kyc.authorizationExpiryDate || "—"} />
            </div>
          </div>
        </div>
      </div>

      {/* Review Progress — full-width bar at the bottom */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Review Progress</h2>
          <span className="text-xs font-bold text-foreground">
            {DOCS.filter((d) => docReviewed(d.key, decisions[d.key])).length} / {DOCS.length} reviewed
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${(DOCS.filter((d) => docReviewed(d.key, decisions[d.key])).length / DOCS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Final decision — one button, its action decided by the per-document choices above */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-snug text-muted-foreground">
            {!allReviewed
              ? "Accept or reject every document above to continue."
              : hasInvalidRejectedReason
              ? "Select a reason for each rejected document to continue."
              : "Review complete — click Done to confirm."}
          </p>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={actionLoading || !allReviewed || hasInvalidRejectedReason}
            className={`shrink-0 inline-flex h-11 items-center justify-center rounded-xl px-8 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] disabled:scale-100 disabled:opacity-40 disabled:shadow-none ${
              allRejected
                ? "bg-red-600 hover:bg-red-700"
                : !allAccepted
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-primary shadow-primary/30"
            }`}
          >
            {actionLoading ? "Submitting…" : "Done"}
          </button>
        </div>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setConfirmOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-bold text-foreground">{confirmCopy.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{confirmCopy.body}</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {DOCS.map((d) => {
                const dec = decisions[d.key];
                const isTwoFace = DOC_LABELS[d.key].twoFaces;
                return (
                  <div key={d.key} className="rounded-xl border border-border p-3">
                    <p className="text-xs font-semibold text-foreground">{d.label}</p>
                    <div className="mt-1 space-y-0.5">
                      <p className="text-[11px] text-muted-foreground">
                        {isTwoFace ? "Front: " : ""}
                        {describeFaceStatus(dec.front)}
                      </p>
                      {isTwoFace ? (
                        <p className="text-[11px] text-muted-foreground">
                          Back: {describeFaceStatus(dec.back)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  handleDone();
                }}
                className={`inline-flex h-9 items-center rounded-xl px-4 text-xs font-semibold text-white ${confirmCopy.confirmCls}`}
              >
                {confirmCopy.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
