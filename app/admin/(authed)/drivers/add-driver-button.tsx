"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createDriver } from "@/lib/api";
import { slugToTransportType } from "@/lib/drivers";

type VehicleType = "moto" | "cab" | "hilux" | "fuso";

const VEHICLE_TYPES: { value: VehicleType; label: string; description: string }[] = [
  { value: "moto", label: "Moto Bike", description: "Motorcycle transport" },
  { value: "cab", label: "Cab Taxi", description: "Standard sedan" },
  { value: "hilux", label: "Light Hilux", description: "Pickup transport" },
  { value: "fuso", label: "Heavy Fuso", description: "Cargo & logistics" },
];

const RWANDA_PROVINCES = ["Kigali City", "Eastern", "Western", "Northern", "Southern"];
const DISTRICTS: Record<string, string[]> = {
  "Kigali City": ["Gasabo", "Kicukiro", "Nyarugenge"],
  "Eastern": ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"],
  "Western": ["Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"],
  "Northern": ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"],
  "Southern": ["Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango"],
};
const SAMPLE_SECTORS: Record<string, string[]> = {
  Gasabo: ["Kacyiru", "Remera", "Kimironko", "Gisozi", "Ndera"],
  Kicukiro: ["Gahanga", "Gikondo", "Niboye", "Nyarugunga"],
  Nyarugenge: ["Nyamirambo", "Muhima", "Gitega", "Kanyinya"],
};
const SAMPLE_CELLS = ["Kamatamu", "Kibaza", "Karisimbi", "Rukiri I", "Rukiri II"];
const SAMPLE_VILLAGES = ["Gasenyi", "Gisenga", "Karisimbi", "Kabeza", "Akabande"];

const RWANDA_PLATE_PATTERNS = [
  /^R[A-Z]{2}\s\d{3}\s[A-Z]$/,
];

function validatePlate(plate: string): string | null {
  if (!plate.trim()) return null;
  const cleaned = plate.trim().toUpperCase();
  if (!/^[A-Z\s\d]+$/.test(cleaned)) return null;
  if (RWANDA_PLATE_PATTERNS.some((p) => p.test(cleaned))) return null;
  return "Format should match Rwanda standards: RAB 123 D";
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className || ""}`}>
      <span className="text-xs font-semibold text-foreground">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="block h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  );
}

function Select({
  value,
  options,
  placeholder,
  disabled,
  onChange,
}: {
  value: string;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`block h-10 w-full appearance-none rounded-lg border bg-surface px-3 pr-9 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
          disabled
            ? "cursor-not-allowed border-border/50 text-muted-foreground/60"
            : "border-border text-foreground"
        }`}
      >
        <option value="">{placeholder || "Select…"}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

type DocKey = "license" | "insurance" | "authorization";
const DOCS: { key: DocKey; label: string; hint: string }[] = [
  { key: "license", label: "Driver's licence (front)", hint: "JPEG, PNG or PDF" },
  { key: "insurance", label: "Vehicle insurance document", hint: "JPEG, PNG or PDF" },
  { key: "authorization", label: "Vehicle authorization / inspection certificate", hint: "JPEG, PNG or PDF" },
];

function DocUpload({
  doc,
  file,
  onFile,
}: {
  doc: { key: DocKey; label: string; hint: string };
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold text-foreground">
          {doc.label}
          <span className="ml-1 text-red-500">*</span>
        </p>
        <p className="text-[10px] text-muted-foreground">{doc.hint}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`mt-1.5 flex h-20 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors ${
          file
            ? "border-primary/40 bg-primary/5 text-primary"
            : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-surface"
        }`}
      >
        {file ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm font-semibold truncate max-w-[200px]">{file.name}</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-sm font-medium">Click to upload</span>
          </>
        )}
      </button>
    </div>
  );
}

const STEPS = ["Personal Info", "Vehicle Info", "Documents", "Payment"];

type FormState = {
  fullName: string;
  phone: string;
  dob: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  vehicleType: VehicleType;
  plate: string;
  license: string;
  passengerSeats: string;
  loadCapacityKg: string;
  momoProvider: "mtn" | "airtel";
  momoCode: string;
};

const INITIAL_FORM: FormState = {
  fullName: "",
  phone: "",
  dob: "",
  province: "",
  district: "",
  sector: "",
  cell: "",
  village: "",
  vehicleType: "moto",
  plate: "",
  license: "",
  passengerSeats: "",
  loadCapacityKg: "",
  momoProvider: "mtn",
  momoCode: "",
};

export function AddDriverButton({
  label = "Add driver",
  defaultVehicle,
}: {
  label?: string;
  defaultVehicle?: VehicleType;
} = {}) {
  const initialForm: FormState = defaultVehicle
    ? { ...INITIAL_FORM, vehicleType: defaultVehicle }
    : INITIAL_FORM;

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [docs, setDocs] = useState<Record<DocKey, File | null>>({
    license: null,
    insurance: null,
    authorization: null,
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reset = () => {
    setStep(0);
    setForm(initialForm);
    setDocs({ license: null, insurance: null, authorization: null });
    setAcceptedTerms(false);
    setSubmitError(null);
    setSubmitting(false);
  };

  async function handleSubmit() {
    if (!acceptedTerms) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const transportType = slugToTransportType(form.vehicleType);
      await createDriver({
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        transport_type: transportType,
        vehicle_plate: form.plate.trim().toUpperCase(),
        license_number: form.license.trim().toUpperCase(),
        date_of_birth: form.dob || undefined,
        province: form.province,
        district: form.district,
        sector: form.sector,
        cell: form.cell,
        village: form.village,
        city: "Kigali",
        momo_provider: form.momoProvider,
        momo_pay_code: form.momoCode.trim(),
        passenger_seats: form.passengerSeats
          ? parseInt(form.passengerSeats, 10)
          : undefined,
        load_capacity_kg: form.loadCapacityKg
          ? parseInt(form.loadCapacityKg, 10)
          : undefined,
      });
      close();
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to register driver",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const close = () => {
    setOpen(false);
    setTimeout(reset, 200);
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => {
      const next = { ...f, [k]: v } as FormState;
      if (k === "province") {
        next.district = "";
        next.sector = "";
        next.cell = "";
        next.village = "";
      } else if (k === "district") {
        next.sector = "";
        next.cell = "";
        next.village = "";
      } else if (k === "sector") {
        next.cell = "";
        next.village = "";
      } else if (k === "cell") {
        next.village = "";
      }
      return next;
    });
  };

  const plateWarning = useMemo(() => validatePlate(form.plate), [form.plate]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        + {label}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-md"
            onClick={close}
            aria-hidden
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-driver-title"
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div>
                <h2 id="add-driver-title" className="text-lg font-bold tracking-tight text-foreground">
                  Add new driver
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Step {step + 1} of {STEPS.length} · {STEPS[step]}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-border bg-surface/40 px-6 py-3">
              {STEPS.map((s, i) => {
                const active = i === step;
                const complete = i < step;
                return (
                  <div key={s} className="flex flex-1 items-center gap-2">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : complete
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {complete ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span
                      className={`hidden truncate text-xs font-medium sm:inline ${
                        active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {s}
                    </span>
                    {i < STEPS.length - 1 ? (
                      <span
                        className={`hidden h-px flex-1 sm:block ${
                          complete ? "bg-primary/40" : "bg-border"
                        }`}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {step === 0 ? (
                <div className="space-y-5">
                  <section>
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Driver information
                    </h3>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Full name" required>
                        <Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Aiden Mugisha" />
                      </Field>
                      <Field label="Phone number" required>
                        <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+250..." />
                      </Field>
                      <Field label="Date of birth" required>
                        <Input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} />
                      </Field>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Location (Rwanda administrative hierarchy)
                    </h3>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Province" required>
                        <Select
                          value={form.province}
                          options={RWANDA_PROVINCES}
                          placeholder="Select province"
                          onChange={(v) => update("province", v)}
                        />
                      </Field>
                      <Field label="District" required>
                        <Select
                          value={form.district}
                          options={form.province ? DISTRICTS[form.province] || [] : []}
                          placeholder={form.province ? "Select district" : "Select province first"}
                          disabled={!form.province}
                          onChange={(v) => update("district", v)}
                        />
                      </Field>
                      <Field label="Sector" required>
                        <Select
                          value={form.sector}
                          options={form.district ? SAMPLE_SECTORS[form.district] || ["Kacyiru", "Remera", "Kimironko"] : []}
                          placeholder={form.district ? "Select sector" : "Select district first"}
                          disabled={!form.district}
                          onChange={(v) => update("sector", v)}
                        />
                      </Field>
                      <Field label="Cell" required>
                        <Select
                          value={form.cell}
                          options={form.sector ? SAMPLE_CELLS : []}
                          placeholder={form.sector ? "Select cell" : "Select sector first"}
                          disabled={!form.sector}
                          onChange={(v) => update("cell", v)}
                        />
                      </Field>
                      <Field label="Village" required className="sm:col-span-2">
                        <Select
                          value={form.village}
                          options={form.cell ? SAMPLE_VILLAGES : []}
                          placeholder={form.cell ? "Select village" : "Select cell first"}
                          disabled={!form.cell}
                          onChange={(v) => update("village", v)}
                        />
                      </Field>
                    </div>
                  </section>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-5">
                  <section>
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Vehicle type
                    </h3>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {VEHICLE_TYPES.map((v) => {
                        const active = form.vehicleType === v.value;
                        return (
                          <button
                            key={v.value}
                            type="button"
                            onClick={() => update("vehicleType", v.value)}
                            className={`rounded-xl border p-3 text-left transition-colors ${
                              active
                                ? "border-primary bg-primary/10 ring-1 ring-inset ring-primary/30"
                                : "border-border bg-card hover:bg-surface"
                            }`}
                          >
                            <p className={`text-xs font-bold ${active ? "text-primary" : "text-foreground"}`}>
                              {v.label}
                            </p>
                            <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                              {v.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Vehicle details
                    </h3>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field
                        label="Plate number"
                        required
                        hint="Rwanda formats: RAD 000 A (Moto) · RAC 000 A (Commercial) · RAA 000 A (Private)"
                        error={plateWarning || undefined}
                      >
                        <Input
                          value={form.plate}
                          onChange={(e) => update("plate", e.target.value.toUpperCase())}
                          placeholder="RAB 123 D"
                        />
                      </Field>
                      <Field label="Driver licence number" required>
                        <Input
                          value={form.license}
                          onChange={(e) => update("license", e.target.value.toUpperCase())}
                          placeholder="DL-0000000"
                        />
                      </Field>
                      {(form.vehicleType === "cab" || form.vehicleType === "hilux") ? (
                        <Field label="Passenger seats" required className="sm:col-span-2">
                          <Input
                            type="number"
                            value={form.passengerSeats}
                            onChange={(e) => update("passengerSeats", e.target.value.replace(/\D/g, ""))}
                            placeholder="e.g. 4"
                          />
                        </Field>
                      ) : null}
                      {form.vehicleType === "fuso" ? (
                        <Field label="Max load capacity (kg)" required className="sm:col-span-2">
                          <Input
                            type="number"
                            value={form.loadCapacityKg}
                            onChange={(e) => update("loadCapacityKg", e.target.value.replace(/\D/g, ""))}
                            placeholder="e.g. 5000"
                          />
                        </Field>
                      ) : null}
                    </div>
                  </section>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    All documents are required. Accepted formats: JPEG, PNG, PDF.
                  </p>
                  {DOCS.map((d) => (
                    <DocUpload
                      key={d.key}
                      doc={d}
                      file={docs[d.key]}
                      onFile={(f) => setDocs((prev) => ({ ...prev, [d.key]: f }))}
                    />
                  ))}
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-5">
                  <section>
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Payment provider
                    </h3>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {(["mtn", "airtel"] as const).map((p) => {
                        const active = form.momoProvider === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => update("momoProvider", p)}
                            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                              active
                                ? "border-primary bg-primary/10 ring-1 ring-inset ring-primary/30"
                                : "border-border bg-card hover:bg-surface"
                            }`}
                          >
                            <span className="text-2xl">{p === "mtn" ? "🟡" : "🔴"}</span>
                            <span className={`text-sm font-bold ${active ? "text-primary" : "text-foreground"}`}>
                              {p === "mtn" ? "MTN MoMo" : "Airtel Money"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <Field label={`${form.momoProvider === "mtn" ? "MTN MoMo" : "Airtel Money"} phone number`} required>
                    <Input
                      value={form.momoCode}
                      onChange={(e) => update("momoCode", e.target.value.replace(/\D/g, ""))}
                      placeholder="250XXXXXXXXX"
                    />
                  </Field>

                  <button
                    type="button"
                    onClick={() => setAcceptedTerms((v) => !v)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      acceptedTerms
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:bg-surface"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                        acceptedTerms
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card"
                      }`}
                    >
                      {acceptedTerms ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : null}
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      I agree to the Driver Terms of Service, Safety Policy, and Privacy Policy.
                    </span>
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border bg-surface/40 px-6 py-3">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                >
                  ← Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                >
                  Cancel
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={!acceptedTerms || submitting}
                  className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit registration"}
                </button>
              )}
            </div>
            {submitError ? (
              <p className="border-t border-border px-6 py-2 text-center text-xs font-semibold text-red-600">
                {submitError}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
