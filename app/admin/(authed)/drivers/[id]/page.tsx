"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getDriver,
  approveDriver,
  rejectDriver,
  requestDriverMoreInfo,
} from "@/lib/api";
import { mapDriverDetailToVerify } from "@/lib/drivers";
import type { VerifyDriver, ReviewHistoryEntry } from "../verify-driver-modal";

type DocKey = "license" | "insurance" | "authorization";

const DOCS: { key: DocKey; label: string }[] = [
  { key: "license", label: "Driver's licence (front)" },
  { key: "insurance", label: "Vehicle insurance certificate" },
  { key: "authorization", label: "Vehicle authorization / inspection" },
];

type DocDecision = {
  status: "none" | "accepted" | "rejected" | "more_info";
  comment?: string;
};

function docUrlFor(driver: VerifyDriver, kind: DocKey): string | null {
  const map: Record<DocKey, string[]> = {
    license: ["licence_front", "license", "drivers_license"],
    insurance: ["vehicle_insurance", "insurance"],
    authorization: ["vehicle_authorization", "authorization"],
  };
  const keys = map[kind];
  const doc = driver.documents?.find((d) =>
    keys.some((k) => d.document_type.toLowerCase().includes(k.toLowerCase())),
  );
  return doc?.file_url?.trim() || null;
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

function DocumentPreview({ kind, driver }: { kind: DocKey; driver: VerifyDriver }) {
  const fileUrl = docUrlFor(driver, kind);
  if (fileUrl) {
    const label = DOCS.find((d) => d.key === kind)?.label ?? "Document";
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/20">
          <span className="text-xs font-semibold text-foreground">{label}</span>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            Open full file ↗
          </a>
        </div>
        <div className="p-3">
          {/\.(png|jpe?g|webp|gif)(\?|$)/i.test(fileUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fileUrl}
              alt={label}
              className="max-h-60 w-full rounded-md object-contain"
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              Preview not available for this file type. Use the link above to open it.
            </p>
          )}
        </div>
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

export default function DriverReviewPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [driver, setDriver] = useState<VerifyDriver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [decisions, setDecisions] = useState<Record<DocKey, DocDecision>>({
    license: { status: "none" },
    insurance: { status: "none" },
    authorization: { status: "none" },
  });

  useEffect(() => {
    setLoading(true);
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
  }, [id]);

  const updateDecision = (key: DocKey, status: DocDecision["status"], comment?: string) => {
    setDecisions((prev) => ({
      ...prev,
      [key]: { status, comment },
    }));
  };

  const allReviewed = DOCS.every((d) => decisions[d.key].status !== "none");
  const allAccepted = DOCS.every((d) => decisions[d.key].status === "accepted");
  const someRejected = DOCS.some((d) => decisions[d.key].status === "rejected");
  const someMoreInfo = DOCS.some((d) => decisions[d.key].status === "more_info");
  // Precedence: rejection trumps more-info trumps approval.
  const primaryAction: "approve" | "reject" | "more_info" =
    someRejected ? "reject" : someMoreInfo ? "more_info" : "approve";

  const handleApprove = async () => {
    if (!driver) return;
    setActionLoading(true);
    try {
      await approveDriver(driver.id);
      setToast("Driver approved successfully!");
      setTimeout(() => {
        router.push("/admin/drivers");
      }, 1500);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Failed to approve driver");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!driver) return;
    setActionLoading(true);

    const reasons = DOCS.filter((d) => decisions[d.key].status === "rejected")
      .map((d) => `${DOCS.find((item) => item.key === d.key)?.label}: ${decisions[d.key].comment || "No comment"}`)
      .join("; ");

    try {
      await rejectDriver(driver.id, reasons || "Application rejected by admin");
      setToast("Driver application rejected");
      setTimeout(() => {
        router.push("/admin/drivers");
      }, 1500);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Failed to reject application");
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Ask the driver to re-upload only the flagged documents. Different from a
   * rejection: the application is kept open and the driver app reopens the
   * specific documents for fresh upload.
   */
  const handleRequestMoreInfo = async () => {
    if (!driver) return;
    setActionLoading(true);

    const flagged = DOCS.filter((d) => decisions[d.key].status === "more_info");
    const reason = flagged
      .map((d) => `${d.label}: ${decisions[d.key].comment || "No comment"}`)
      .join("; ");
    const documents = flagged.map((d) => ({
      document_type: d.key,
      comment: decisions[d.key].comment,
    }));

    try {
      await requestDriverMoreInfo(driver.id, reason, documents);
      setToast("Request sent — driver will be asked to re-upload the flagged documents");
      setTimeout(() => {
        router.push("/admin/drivers");
      }, 1500);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Failed to send the request");
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

  const profilePicDoc = driver.documents?.find(
    (d) =>
      d.document_type.toUpperCase().includes("SELFIE") ||
      d.document_type.toUpperCase().includes("PROFILE")
  );
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

      {driver.reviewHistory && driver.reviewHistory.length > 0 ? (
        <ReviewHistorySection history={driver.reviewHistory} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Documents Review List */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Submitted Documents</h2>
          <ul className="space-y-4">
            {DOCS.map((d) => {
              const current = decisions[d.key];
              const fileUrl = docUrlFor(driver, d.key);
              return (
                <li
                  key={d.key}
                  className={`overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300 ${
                    current.status === "accepted"
                      ? "border-emerald-500/30 shadow-md shadow-emerald-500/5"
                      : current.status === "rejected"
                      ? "border-red-500/30 shadow-md shadow-red-500/5"
                      : current.status === "more_info"
                      ? "border-amber-500/30 shadow-md shadow-amber-500/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{d.label}</h3>
                        {fileUrl && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Filename: {fileUrl.split("/").pop()}
                          </p>
                        )}
                      </div>
                      <DocumentPreview kind={d.key} driver={driver} />
                    </div>

                    {/* Checkbox Accept / Reject one-by-one */}
                    <div className="shrink-0 space-y-4 md:w-48 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Document Decision
                      </p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={current.status === "accepted"}
                            onChange={() =>
                              updateDecision(
                                d.key,
                                current.status === "accepted" ? "none" : "accepted"
                              )
                            }
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          />
                          Accept Document
                        </label>

                        <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={current.status === "more_info"}
                            onChange={() =>
                              updateDecision(
                                d.key,
                                current.status === "more_info" ? "none" : "more_info",
                                current.comment,
                              )
                            }
                            className="h-4 w-4 rounded border-border text-amber-600 focus:ring-amber-500"
                          />
                          Ask to re-upload
                        </label>

                        <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={current.status === "rejected"}
                            onChange={() =>
                              updateDecision(
                                d.key,
                                current.status === "rejected" ? "none" : "rejected",
                                current.comment
                              )
                            }
                            className="h-4 w-4 rounded border-border text-red-600 focus:ring-red-500"
                          />
                          Reject Document
                        </label>
                      </div>

                      {current.status === "more_info" && (
                        <div className="space-y-1">
                          <label className="block text-[10px] font-semibold uppercase text-amber-700">
                            What does the driver need to fix?
                          </label>
                          <textarea
                            value={current.comment || ""}
                            onChange={(e) => updateDecision(d.key, "more_info", e.target.value)}
                            placeholder="e.g. The licence photo is blurry — please re-take it in daylight."
                            rows={3}
                            className="w-full rounded-xl border border-amber-200 bg-amber-50/20 px-3 py-2 text-xs text-foreground outline-none focus:border-amber-500"
                            required
                          />
                        </div>
                      )}

                      {current.status === "rejected" && (
                        <div className="space-y-1">
                          <label className="block text-[10px] font-semibold text-red-600 uppercase">
                            Rejection Comment
                          </label>
                          <textarea
                            value={current.comment || ""}
                            onChange={(e) => updateDecision(d.key, "rejected", e.target.value)}
                            placeholder="Reason for rejection (required)"
                            rows={3}
                            className="w-full rounded-xl border border-red-200 bg-red-50/20 px-3 py-2 text-xs text-foreground outline-none focus:border-red-500"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sidebar Info & Overall Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Driver Details Card */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Driver and Vehicle Info</h2>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Phone Number</p>
                <p className="text-xs font-bold text-foreground">{driver.kyc.phone}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Date of Birth / Age</p>
                <p className="text-xs font-bold text-foreground">{driver.kyc.dob} (Age {driver.kyc.age})</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Residential Location</p>
                <p className="text-xs font-bold text-foreground">{driver.kyc.location}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Licence number</p>
                <p className="text-xs font-bold text-foreground font-mono">{driver.kyc.licenseNumber}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Vehicle details</p>
                <p className="text-xs font-bold text-foreground">{driver.vehicle} · {driver.plate}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">MoMo Payout Code</p>
                <p className="text-xs font-bold text-foreground font-mono">{driver.kyc.momoProvider} · {driver.kyc.momoCode}</p>
              </div>
            </div>
          </div>

          {/* Action Decision Panel */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Review Progress</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Progress:</span>
                <span className="font-bold text-foreground">
                  {DOCS.filter((d) => decisions[d.key].status !== "none").length} / {DOCS.length} reviewed
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${
                      (DOCS.filter((d) => decisions[d.key].status !== "none").length / DOCS.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-2 space-y-2 border-t border-border">
              {primaryAction === "reject" ? (
                <>
                  <div className="rounded-xl border border-red-200 bg-red-50/20 p-3">
                    <p className="text-[11px] leading-snug text-red-700">
                      <strong>Rejection active</strong>: You must provide rejection reasons for all rejected items, then submit the rejection.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={
                      actionLoading ||
                      !allReviewed ||
                      DOCS.some((d) => decisions[d.key].status === "rejected" && !decisions[d.key].comment?.trim())
                    }
                    className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-red-600 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading ? "Submitting Rejection..." : "Reject Driver Application"}
                  </button>
                  {!allReviewed && (
                    <p className="text-[10px] text-center text-muted-foreground leading-normal mt-1">
                      Review every document before submitting.
                    </p>
                  )}
                </>
              ) : primaryAction === "more_info" ? (
                <>
                  <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-3">
                    <p className="text-[11px] leading-snug text-amber-800">
                      <strong>More info requested</strong>: The driver will be notified to re-upload the flagged documents with your guidance.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestMoreInfo}
                    disabled={
                      actionLoading ||
                      !allReviewed ||
                      DOCS.some((d) => decisions[d.key].status === "more_info" && !decisions[d.key].comment?.trim())
                    }
                    className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-amber-600 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
                  >
                    {actionLoading ? "Sending Request..." : "Request More Info from Driver"}
                  </button>
                  {!allReviewed && (
                    <p className="text-[10px] text-center text-muted-foreground leading-normal mt-1">
                      Review every document before submitting.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={actionLoading || !allAccepted}
                    className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.01] disabled:scale-100 disabled:opacity-40 disabled:shadow-none"
                  >
                    {actionLoading ? "Approving..." : "Approve Driver Application"}
                  </button>
                  {!allAccepted && (
                    <p className="text-[10px] text-center text-muted-foreground leading-normal mt-1">
                      Accept all 3 documents to enable approval.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
