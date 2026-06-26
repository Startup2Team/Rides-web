"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DOC_LABELS } from "@/lib/driver-registration";
import {
  getDriver,
  approveDriver,
  rejectDriver,
} from "@/lib/api";
import { mapDriverDetailToVerify } from "@/lib/drivers";
import { isMockDriverId, MOCK_DRIVERS } from "@/lib/mock-drivers";
import { isLocalDriverId, getLocalDriverDetail } from "@/lib/local-drivers";
import type { VerifyDriver, ReviewHistoryEntry } from "../verify-driver-modal";

type DocKey = "national_id" | "license" | "insurance" | "authorization";

const DOCS: { key: DocKey; label: string }[] = [
  { key: "national_id", label: "National ID" },
  { key: "license", label: "Driver's licence" },
  { key: "insurance", label: "Vehicle insurance certificate" },
  { key: "authorization", label: "Vehicle authorization / inspection" },
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
  return doc?.file_url?.trim() || null;
}

function docFacesFor(driver: VerifyDriver, kind: DocKey): { front: string | null; back: string | null } {
  return {
    front: findDocUrl(driver, DOC_TYPES[kind].front),
    back: findDocUrl(driver, DOC_TYPES[kind].back),
  };
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
  // Render nothing if no prior decisions — keeps the page clean for first-time reviews.
  if (!history || history.length === 0) return null;

  // Newest first — defensively re-sort in case the backend hasn't.
  const sorted = [...history].sort(
    (a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime(),
  );
  const latest = sorted[0];
  const latestMeta = decisionMeta(latest.decision);
  const previousCount = sorted.length - 1;

  const [expanded, setExpanded] = useState(latest.decision !== "approved");

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
  const two = DOC_LABELS[kind].twoFaces;

  return (
    <div className="space-y-3">
      {front ? (
        <DocFaceCard label="Front face" url={front} />
      ) : (
        <div className="rounded-lg border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
          Front face not yet uploaded
        </div>
      )}
      {two ? (
        back ? (
          <DocFaceCard label="Back face" url={back} />
        ) : (
          <div className="rounded-lg border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
            Back face not yet uploaded
          </div>
        )
      ) : null}
    </div>
  );
}

export default function DriverReviewPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [driver, setDriver] = useState<VerifyDriver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isMock = isMockDriverId(id);
  const isLocal = isLocalDriverId(id);

  // Admin-added drivers are trusted — pre-accept all documents on load.
  const [decisions, setDecisions] = useState<Record<DocKey, DocDecision>>(() => {
    const s: FaceDecision["status"] = isLocal ? "accepted" : "none";
    const base = (): DocDecision => ({ front: emptyFace(s), back: emptyFace(s) });
    return { national_id: base(), license: base(), insurance: base(), authorization: base() };
  });

  useEffect(() => {
    setLoading(true);
    if (isMock) {
      // Simulate a brief network delay so the loading state is visible.
      const t = setTimeout(() => {
        setDriver(mapDriverDetailToVerify(MOCK_DRIVERS[id as keyof typeof MOCK_DRIVERS]));
        setLoading(false);
      }, 400);
      return () => clearTimeout(t);
    }
    if (isLocal) {
      const detail = getLocalDriverDetail(id);
      if (detail) {
        setDriver(mapDriverDetailToVerify(detail));
      } else {
        setError("Locally-saved driver not found. It may have been cleared from storage.");
      }
      setLoading(false);
      return;
    }
    getDriver(id)
      .then((detail) => {
        setDriver(mapDriverDetailToVerify(detail));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load driver profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, isMock, isLocal]);

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
  const someRejected = DOCS.some((d) => docStatus(d.key, decisions[d.key]) === "rejected");
  const primaryAction: "approve" | "reject" = someRejected ? "reject" : "approve";

  const handleApprove = async () => {
    if (!driver) return;
    setActionLoading(true);
    try {
      if (!isMock && !isLocal) await approveDriver(driver.id);
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
      if (!isMock && !isLocal) await rejectDriver(driver.id, reasons || "Application rejected by admin");
      setToast(isMock || isLocal ? "[Local] Application rejected — no real API call made." : "Driver application rejected");
      setTimeout(() => router.push("/admin/drivers"), 1500);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Failed to reject application");
    } finally {
      setActionLoading(false);
    }
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
  const profilePicUrl = profilePicDoc?.file_url || null;

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
          </div>
        </div>
        <Link
          href="/admin/drivers"
          className="inline-flex h-9 items-center rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-surface"
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
                                  Accept
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
                                  Reject
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
                                    {REJECTION_REASONS.map((r) => (
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

        <div className="pt-2 border-t border-border">
          {primaryAction === "reject" ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1 rounded-xl border border-red-200 bg-red-50/20 px-3 py-2.5">
                <p className="text-[11px] leading-snug text-red-700">
                  <strong>Rejection active</strong> — provide a reason for each rejected document, then submit.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReject}
                disabled={
                  actionLoading ||
                  !allReviewed ||
                  DOCS.some((d) => {
                    const dec = decisions[d.key];
                    const faceInvalid = (f: FaceDecision) =>
                      f.status === "rejected" && (!f.reason.preset || (f.reason.preset === "Other" && !f.reason.custom.trim()));
                    return faceInvalid(dec.front) || (DOC_LABELS[d.key].twoFaces && faceInvalid(dec.back));
                  })
                }
                className="shrink-0 inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Submitting…" : "Reject Driver Application"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              {!allAccepted && (
                <p className="text-[11px] text-muted-foreground">
                  Accept all documents to enable approval.
                </p>
              )}
              <button
                type="button"
                onClick={handleApprove}
                disabled={actionLoading || !allAccepted}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.01] disabled:scale-100 disabled:opacity-40 disabled:shadow-none"
              >
                {actionLoading ? "Approving…" : "Approve Driver Application"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
