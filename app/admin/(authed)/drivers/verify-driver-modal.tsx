"use client";

import { useEffect, useState } from "react";
import { Avatar } from "../_components";

export type DriverDocument = {
  document_type: string;
  file_url: string;
  uploaded_at?: string;
};

export type ReviewDecision = "approved" | "rejected" | "more_info_requested";

export type ReviewHistoryEntry = {
  id: string;
  /** ISO timestamp of the decision */
  decidedAt: string;
  /** Email or display name of the admin who decided */
  decidedBy: string;
  decision: ReviewDecision;
  /** Overall reason (joined message) — present on rejected/more-info entries */
  reason?: string;
  /** Per-document decisions if the backend tracks them */
  documentDecisions?: Array<{
    documentType: string;
    decision: "accepted" | "rejected" | "more_info";
    comment?: string;
  }>;
};

export type VerifyDriver = {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  /** Raw approval state from the backend (e.g. "pending", "approved", "rejected"). */
  approvalStatus: string;
  kyc: {
    phone: string;
    dob: string;
    age: number;
    location: string;
    licenseNumber: string;
    submittedAt: string;
    momoProvider: "MTN MoMo" | "Airtel Money";
    momoCode: string;
  };
  documents?: DriverDocument[];
  /** Past admin decisions on this driver, newest first. Empty if no prior reviews. */
  reviewHistory?: ReviewHistoryEntry[];
};

const RWANDA_PLATE = /^R[A-Z]{2}\s\d{3}\s[A-Z]$/;
const MIN_DRIVER_AGE = 21;

type ChecklistItem = {
  label: string;
  detail?: string;
  status: "pass" | "fail" | "manual";
};

function buildChecklist(driver: VerifyDriver): ChecklistItem[] {
  const plateOk = RWANDA_PLATE.test(driver.plate.toUpperCase());
  const ageOk = driver.kyc.age >= MIN_DRIVER_AGE;
  const phoneOk = driver.kyc.phone.replace(/\D/g, "").length >= 10;
  const licenseOk = /^DL-\d{6,}$/i.test(driver.kyc.licenseNumber);
  const momoOk = driver.kyc.momoCode.replace(/\D/g, "").length >= 9;

  return [
    {
      label: "Plate matches Rwanda format",
      detail: plateOk
        ? `${driver.plate} — valid (RAB / RAC / RAD pattern)`
        : `${driver.plate} — does not match expected format`,
      status: plateOk ? "pass" : "fail",
    },
    {
      label: "Age requirement met",
      detail: ageOk
        ? `${driver.kyc.age} years old · meets minimum ${MIN_DRIVER_AGE}`
        : `${driver.kyc.age} years old · below minimum ${MIN_DRIVER_AGE}`,
      status: ageOk ? "pass" : "fail",
    },
    {
      label: "Phone number valid",
      detail: phoneOk ? driver.kyc.phone : "Phone number incomplete",
      status: phoneOk ? "pass" : "fail",
    },
    {
      label: "Driver licence number format valid",
      detail: licenseOk ? driver.kyc.licenseNumber : "Format should be DL-XXXXXXX",
      status: licenseOk ? "pass" : "fail",
    },
    {
      label: "Mobile Money pay code present",
      detail: momoOk
        ? `${driver.kyc.momoProvider} · ${driver.kyc.momoCode}`
        : "Pay code is missing or incomplete",
      status: momoOk ? "pass" : "fail",
    },
    {
      label: "Driver licence photo matches name",
      detail: "Open the document and compare against the application",
      status: "manual",
    },
    {
      label: "Insurance document is current",
      detail: "Confirm policy is active and covers the listed plate",
      status: "manual",
    },
    {
      label: "Vehicle authorization is recent (within 1 year)",
      detail: "Check inspection certificate date stamp",
      status: "manual",
    },
    {
      label: "No duplicate plate in the system",
      detail: "Cross-check against existing fleet",
      status: "manual",
    },
  ];
}

type DocKey = "license" | "insurance" | "authorization";

const DOCS: { key: DocKey; label: string }[] = [
  { key: "license", label: "Driver's licence (front)" },
  { key: "insurance", label: "Vehicle insurance certificate" },
  { key: "authorization", label: "Vehicle authorization / inspection" },
];

function licenseCategory(vehicle: string) {
  if (vehicle.includes("Moto")) return "A — Motorcycle";
  if (vehicle.includes("Cab")) return "B — Light vehicle";
  if (vehicle.includes("Hilux")) return "C1 — Light commercial";
  if (vehicle.includes("Fuso")) return "C — Heavy goods";
  return "B — Light vehicle";
}

function PreviewField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-0.5 text-xs font-semibold tracking-tight text-foreground ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

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

function DocumentPreview({
  kind,
  driver,
}: {
  kind: DocKey;
  driver: VerifyDriver;
}) {
  const fileUrl = docUrlFor(driver, kind);
  if (fileUrl) {
    const label = DOCS.find((d) => d.key === kind)?.label ?? "Document";
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
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
              className="max-h-48 w-full rounded-md object-contain"
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

function StatusBadge({ status }: { status: "pass" | "fail" | "manual" }) {
  if (status === "pass") {
    return (
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (status === "fail") {
    return (
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="h-3 w-3" aria-hidden>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </span>
    );
  }
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3 w-3" aria-hidden>
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </span>
  );
}

export function VerifyDriverModal({
  driver,
  mode = "verify",
  onClose,
  onApprove,
  onReject,
}: {
  driver: VerifyDriver | null;
  mode?: "verify" | "view";
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const open = driver !== null;
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [manualChecks, setManualChecks] = useState<Set<number>>(new Set());
  const [expandedDoc, setExpandedDoc] = useState<DocKey | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!open) {
      setReviewed(new Set());
      setManualChecks(new Set());
      setExpandedDoc(null);
      setRejectOpen(false);
      setRejectReason("");
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !driver) return null;

  const checklist = buildChecklist(driver);
  const autoFailures = checklist.filter((c) => c.status === "fail").length;
  const allDocsReviewed = DOCS.every((d) => reviewed.has(d.key));
  const allManualChecked = checklist
    .map((c, i) => (c.status === "manual" ? i : -1))
    .filter((i) => i >= 0)
    .every((i) => manualChecks.has(i));

  const canApprove = autoFailures === 0 && allDocsReviewed && allManualChecked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar name={driver.name} />
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {mode === "verify" ? "Verify driver application" : "Driver profile"}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {driver.name} · {driver.kyc.submittedAt}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {mode === "verify" ? (
          <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
            <div className="flex items-start gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-5 w-5 text-primary" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <div>
                <p className="text-xs font-semibold tracking-tight text-foreground">
                  What to consider before approving
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Open each document, confirm it matches the application data, and tick every
                  manual check. The approve button unlocks only when all auto-checks pass and
                  every manual item is confirmed.
                </p>
              </div>
            </div>
          </div>
          ) : null}

          <section className="mt-5">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Driver details
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Detail label="Full name" value={driver.name} />
              <Detail label="Phone" value={driver.kyc.phone} />
              <Detail label="Date of birth" value={`${driver.kyc.dob} · age ${driver.kyc.age}`} />
              <Detail label="Location" value={driver.kyc.location} className="sm:col-span-2" />
              <Detail label="Submitted" value={driver.kyc.submittedAt} />
            </div>
          </section>

          <section className="mt-5">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Vehicle
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Detail label="Type" value={driver.vehicle} />
              <Detail label="Plate" value={driver.plate} mono />
              <Detail label="Licence" value={driver.kyc.licenseNumber} mono />
              <Detail label="Payment" value={`${driver.kyc.momoProvider} · ${driver.kyc.momoCode}`} className="sm:col-span-2" />
            </div>
          </section>

          <section className="mt-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Documents
              </h3>
              <span className="text-[10px] text-muted-foreground">
                {reviewed.size} / {DOCS.length} reviewed
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {DOCS.map((d) => {
                const isReviewed = reviewed.has(d.key);
                const isExpanded = expandedDoc === d.key;
                return (
                  <li
                    key={d.key}
                    className="overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <div className="flex items-center gap-3 p-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold tracking-tight text-foreground">
                          {d.label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {isReviewed
                            ? "Reviewed by you"
                            : isExpanded
                            ? "Confirm the details below match the application"
                            : "Click View to inspect"}
                        </p>
                      </div>
                      {isReviewed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Reviewed
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedDoc(isExpanded ? null : d.key)
                        }
                        className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                      >
                        {isExpanded ? "Hide" : "View"}
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`h-3 w-3 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          aria-hidden
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </div>

                    {isExpanded ? (
                      <div className="space-y-3 border-t border-border bg-surface/40 p-3">
                        <DocumentPreview kind={d.key} driver={driver} />
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-muted-foreground">
                            Confirm the data above matches the submitted application.
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              setReviewed((prev) => {
                                const next = new Set(prev);
                                if (next.has(d.key)) next.delete(d.key);
                                else next.add(d.key);
                                return next;
                              })
                            }
                            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              isReviewed
                                ? "border border-border bg-card text-foreground hover:bg-surface"
                                : "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                            }`}
                          >
                            {isReviewed ? "Unmark as reviewed" : "Mark as reviewed"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>

          {mode === "verify" ? (
          <section className="mt-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Verification checklist
              </h3>
              {autoFailures > 0 ? (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                  {autoFailures} issue{autoFailures > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Auto-checks passed
                </span>
              )}
            </div>
            <ul className="mt-3 space-y-2">
              {checklist.map((c, i) => {
                const isManual = c.status === "manual";
                const checked = isManual ? manualChecks.has(i) : c.status === "pass";
                return (
                  <li
                    key={c.label}
                    className={`flex items-start gap-3 rounded-xl border p-3 ${
                      c.status === "fail"
                        ? "border-red-200 bg-red-50/50"
                        : isManual
                        ? "border-border bg-card"
                        : "border-primary/20 bg-primary/[0.03]"
                    }`}
                  >
                    {isManual ? (
                      <button
                        type="button"
                        onClick={() =>
                          setManualChecks((prev) => {
                            const next = new Set(prev);
                            if (next.has(i)) next.delete(i);
                            else next.add(i);
                            return next;
                          })
                        }
                        aria-label={c.label}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          checked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card"
                        }`}
                      >
                        {checked ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : null}
                      </button>
                    ) : (
                      <span className="mt-0.5">
                        <StatusBadge status={c.status} />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold tracking-tight text-foreground">
                        {c.label}
                      </p>
                      {c.detail ? (
                        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                          {c.detail}
                        </p>
                      ) : null}
                    </div>
                    {isManual ? (
                      <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                        Manual
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
          ) : null}
        </div>

        {mode === "verify" ? (
        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface/40 px-6 py-3">
          <p className="hidden text-[11px] text-muted-foreground sm:block">
            {canApprove
              ? "All checks complete — safe to approve."
              : `${
                  DOCS.length - reviewed.size +
                  checklist.filter((c, i) => c.status === "manual" && !manualChecks.has(i))
                    .length
                } item${
                  DOCS.length -
                    reviewed.size +
                    checklist.filter((c, i) => c.status === "manual" && !manualChecks.has(i))
                      .length ===
                  1
                    ? ""
                    : "s"
                } remaining`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRejectOpen(true)}
              className="inline-flex h-10 items-center rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              Reject application
            </button>
            <button
              type="button"
              onClick={() => onApprove(driver.id)}
              disabled={!canApprove}
              className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              Approve driver
            </button>
          </div>
        </div>
        ) : (
        <div className="flex items-center justify-end border-t border-border bg-surface/40 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Close
          </button>
        </div>
        )}

        {rejectOpen ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl">
              <h3 className="text-sm font-bold text-foreground">Reject application</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Provide a reason — stored on the driver record.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="e.g. Licence photo unreadable, plate mismatch…"
                className="mt-3 block w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectOpen(false);
                    setRejectReason("");
                  }}
                  className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!rejectReason.trim()}
                  onClick={() => {
                    onReject(driver.id, rejectReason.trim());
                    setRejectOpen(false);
                    setRejectReason("");
                  }}
                  className="inline-flex h-9 items-center rounded-lg bg-red-600 px-3 text-xs font-semibold text-white disabled:opacity-40"
                >
                  Confirm reject
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold tracking-tight text-foreground ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </p>
    </div>
  );
}
