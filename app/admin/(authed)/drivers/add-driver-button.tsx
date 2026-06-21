"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  createDriver,
  uploadDriverDocument,
  uploadDriverFile,
  sendDriverOTP,
  verifyDriverOTP,
} from "@/lib/api";
import { slugToTransportType, VEHICLE_SLUG_LABELS } from "@/lib/drivers";
import {
  DOC_API_TYPE,
  DOC_LABELS,
  type DocFaces,
  type DocKey,
  type VehicleSlug,
  minAgeDob,
  normalizeRwandaMobilePhone,
  rwandaMobilePlaceholder,
  validatePlate,
  validateRwandaMobilePhone,
} from "@/lib/driver-registration";
import {
  RWANDA_PROVINCES,
  getCells,
  getDistricts,
  getSectors,
} from "@/lib/rwanda-locations";
import { ImageCaptureField } from "./image-capture-field";

const VEHICLE_TYPES: { value: VehicleSlug; label: string; description: string }[] = [
  { value: "moto", label: "Moto Bike", description: "Motorcycle transport" },
  { value: "cab", label: "Cab Taxi", description: "Standard sedan" },
  { value: "hilux", label: "Light Hilux", description: "Pickup transport" },
  { value: "fuso", label: "Heavy Fuso", description: "Cargo & logistics" },
];

const STEPS = ["Personal Info", "Vehicle Info", "Documents", "Payment"] as const;

type FormState = {
  fullName: string;
  phone: string;
  dob: string;
  province: string;
  district: string;
  sector: string;
  village: string;
  cell: string;
  vehicleType: VehicleSlug;
  plate: string;
  license: string;
  passengerSeats: string;
  loadCapacityKg: string;
  momoProvider: "mtn" | "airtel";
  momoCode: string;
  merchantCode: string;
};

const INITIAL_FORM: FormState = {
  fullName: "",
  phone: "",
  dob: "",
  province: "",
  district: "",
  sector: "",
  village: "",
  cell: "",
  vehicleType: "moto",
  plate: "",
  license: "",
  passengerSeats: "",
  loadCapacityKg: "",
  momoProvider: "mtn",
  momoCode: "",
  merchantCode: "",
};

function emptyDocs(): Record<DocKey, DocFaces> {
  return {
    license: [null, null],
    insurance: [null, null],
    authorization: [null, null],
  };
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

function validateStep(
  step: number,
  form: FormState,
  selfie: File | null,
  docs: Record<DocKey, DocFaces>,
  acceptedTerms: boolean,
): Record<string, string> {
  const e: Record<string, string> = {};
  const maxDob = minAgeDob();

  if (step === 0) {
    if (!form.fullName.trim()) e.fullName = "Required";
    const phoneErr = validateRwandaMobilePhone(form.phone);
    if (phoneErr) e.phone = phoneErr;
    if (!form.dob) e.dob = "Required";
    else if (form.dob > maxDob) e.dob = "Driver must be at least 16 years old";
    if (!selfie) e.selfie = "Identity photo is required";
    if (!form.province) e.province = "Required";
    if (!form.district) e.district = "Required";
    if (!form.sector) e.sector = "Required";
    if (!form.village) e.village = "Required";
    if (!form.cell) e.cell = "Required";
  }

  if (step === 1) {
    if (!form.plate.trim()) e.plate = "Required";
    if (!form.license.trim()) e.license = "Required";
    else if (form.license.trim().length !== 16) e.license = "Licence number must be exactly 16 characters";
    if (form.vehicleType === "cab" || form.vehicleType === "hilux") {
      if (!form.passengerSeats || parseInt(form.passengerSeats, 10) < 1) {
        e.passengerSeats = "Enter number of passenger seats";
      }
    }
    if (form.vehicleType === "fuso") {
      if (!form.loadCapacityKg || parseInt(form.loadCapacityKg, 10) < 1) {
        e.loadCapacityKg = "Enter load capacity in kg";
      }
    }
  }

  if (step === 2) {
    (["license", "insurance", "authorization"] as DocKey[]).forEach((key) => {
      if (!docs[key][0]) e[`${key}_front`] = `${DOC_LABELS[key].label} front face is required`;
      if (!docs[key][1]) e[`${key}_back`] = `${DOC_LABELS[key].label} back face is required`;
    });
  }

  if (step === 3) {
    const hasMomo = form.momoCode.replace(/\D/g, "").length > 0;
    const hasMerchant = form.merchantCode.trim().length > 0;
    if (!hasMomo && !hasMerchant) {
      e.momoCode = "Enter a phone number or merchant code";
      e.merchantCode = "Enter a phone number or merchant code";
    }
    if (hasMomo) {
      const momoErr = validateRwandaMobilePhone(form.momoCode, {
        provider: form.momoProvider,
        label: "MoMo phone number",
      });
      if (momoErr) e.momoCode = momoErr;
    }
    if (hasMerchant && form.merchantCode.trim().length < 3) {
      e.merchantCode = "Enter a valid merchant code";
    }
    if (!acceptedTerms) e.acceptedTerms = "Required";
  }

  return e;
}

export function AddDriverButton({
  label = "Add driver",
  defaultVehicle,
}: {
  label?: string;
  defaultVehicle?: VehicleSlug;
} = {}) {
  const lockedVehicle = defaultVehicle;
  const lockedVehicleMeta = lockedVehicle
    ? VEHICLE_TYPES.find((v) => v.value === lockedVehicle)
    : null;

  const initialForm: FormState = lockedVehicle
    ? { ...INITIAL_FORM, vehicleType: lockedVehicle }
    : INITIAL_FORM;

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [docs, setDocs] = useState<Record<DocKey, DocFaces>>(emptyDocs());
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Phone OTP verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const reset = () => {
    setStep(0);
    setForm(initialForm);
    setSelfie(null);
    setDocs(emptyDocs());
    setAcceptedTerms(false);
    setSubmitError(null);
    setSubmitting(false);
    setErrors({});
    setOtpSent(false);
    setOtpVerified(false);
    setOtpCode(["", "", "", "", "", ""]);
    setOtpError(null);
  };

  const close = () => {
    setOpen(false);
    setTimeout(reset, 200);
  };

  useEffect(() => {
    if (!open || !lockedVehicle) return;
    setForm((f) => (f.vehicleType === lockedVehicle ? f : { ...f, vehicleType: lockedVehicle }));
  }, [open, lockedVehicle]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    if (lockedVehicle && k === "vehicleType") return;
    if (k === "phone") {
      setOtpSent(false);
      setOtpVerified(false);
      setOtpCode(["", "", "", "", "", ""]);
      setOtpError(null);
    }
    setForm((f) => {
      const next = { ...f, [k]: v } as FormState;
      if (k === "province") {
        next.district = next.sector = next.village = next.cell = "";
      } else if (k === "district") {
        next.sector = next.village = next.cell = "";
      } else if (k === "sector") {
        next.cell = next.village = "";
      } else if (k === "cell") {
        next.village = "";
      }
      return next;
    });
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const setDocFace = (key: DocKey, face: 0 | 1, file: File | null) => {
    setDocs((d) => {
      const faces: DocFaces = [d[key][0], d[key][1]];
      faces[face] = file;
      return { ...d, [key]: faces };
    });
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const districts = useMemo(
    () => (form.province ? getDistricts(form.province).map((d) => d.name) : []),
    [form.province],
  );
  const sectors = useMemo(
    () =>
      form.province && form.district
        ? getSectors(form.province, form.district).map((s) => s.name)
        : [],
    [form.province, form.district],
  );
  const cellsInSector = useMemo(
    () =>
      form.province && form.district && form.sector
        ? getCells(form.province, form.district, form.sector)
        : [],
    [form.province, form.district, form.sector],
  );
  const villages = useMemo(
    () => cellsInSector.find((c) => c.name === form.cell)?.villages ?? [],
    [cellsInSector, form.cell],
  );

  const plateWarning = useMemo(() => validatePlate(form.plate), [form.plate]);
  const maxDob = minAgeDob();

  async function handleSendOTP() {
    const phoneErr = validateRwandaMobilePhone(form.phone);
    if (phoneErr) { setErrors((e) => ({ ...e, phone: phoneErr })); return; }
    setOtpBusy(true);
    setOtpError(null);
    try {
      const res = await sendDriverOTP("+250" + form.phone.slice(1)) as { dev_otp?: string } | void;
      setOtpSent(true);
      if (res && typeof res === "object" && res.dev_otp) {
        setOtpCode(res.dev_otp.split("") as string[]);
      }
    } catch {
      setOtpError("Failed to send OTP. Check the phone number and try again.");
    } finally {
      setOtpBusy(false);
    }
  }

  async function handleVerifyOTP() {
    const code = otpCode.join("");
    if (code.length !== 6) { setOtpError("Enter the 6-digit code."); return; }
    setOtpBusy(true);
    setOtpError(null);
    try {
      await verifyDriverOTP("+250" + form.phone.slice(1), code);
      setOtpVerified(true);
      setOtpError(null);
    } catch {
      setOtpError("Incorrect or expired code. Try again.");
    } finally {
      setOtpBusy(false);
    }
  }

  const handleContinue = () => {
    const e = validateStep(step, form, selfie, docs, acceptedTerms);
    if (Object.keys(e).length) { setErrors(e); return; }
    if (step === 0 && !otpVerified) { setOtpError("Verify the driver's phone number before continuing."); return; }
    setErrors({});
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else void handleSubmit();
  };

  async function handleSubmit() {
    const e = validateStep(3, form, selfie, docs, acceptedTerms);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      let profileImageUrl: string | undefined;
      if (selfie) {
        profileImageUrl = await uploadDriverFile(selfie);
      }

      const transportType = slugToTransportType(form.vehicleType);
      const created = await createDriver({
        full_name: form.fullName.trim(),
        phone: normalizeRwandaMobilePhone(form.phone),
        transport_type: transportType,
        vehicle_plate: form.plate.trim().toUpperCase(),
        license_number: form.license.trim().toUpperCase(),
        date_of_birth: form.dob,
        province: form.province,
        district: form.district,
        sector: form.sector,
        cell: form.cell,
        village: form.village,
        city: "Kigali",
        momo_provider: form.momoProvider,
        momo_pay_code: form.momoCode.trim()
          ? normalizeRwandaMobilePhone(form.momoCode)
          : "",
        merchant_pay_code: form.merchantCode.trim() || undefined,
        profile_image_url: profileImageUrl,
        passenger_seats: form.passengerSeats
          ? parseInt(form.passengerSeats, 10)
          : undefined,
        load_capacity_kg: form.loadCapacityKg
          ? parseInt(form.loadCapacityKg, 10)
          : undefined,
      });

      const driverId = created.id;
      if (profileImageUrl) {
        await uploadDriverDocument(driverId, "PROFILE_SELFIE", profileImageUrl);
      }

      const uploads: { type: string; file: File }[] = [];
      (Object.keys(DOC_API_TYPE) as DocKey[]).forEach((key) => {
        const types = DOC_API_TYPE[key];
        docs[key].forEach((file, idx) => {
          if (file) uploads.push({ type: types[idx], file });
        });
      });

      for (const item of uploads) {
        const url = await uploadDriverFile(item.file);
        await uploadDriverDocument(driverId, item.type, url);
      }

      close();
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to register driver");
    } finally {
      setSubmitting(false);
    }
  }

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
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={close} aria-hidden />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-driver-title"
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div>
                <h2 id="add-driver-title" className="text-lg font-bold tracking-tight text-foreground">
                  Register driver
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Step {step + 1} of {STEPS.length} · {STEPS[step]} — driver will be immediately approved upon submission
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
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : complete
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {complete ? "✓" : i + 1}
                    </span>
                    <span className={`hidden truncate text-xs font-medium sm:inline ${active ? "text-foreground" : "text-muted-foreground"}`}>
                      {s}
                    </span>
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
                      <Field label="Full name" required error={errors.fullName}>
                        <Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Aiden Mugisha" />
                      </Field>
                      <Field
                        label="Phone number"
                        required
                        error={errors.phone}
                        hint="10 digits — 078 (MTN), 072 or 073 (Airtel)"
                      >
                        <div className="flex gap-2">
                          <Input
                            value={form.phone}
                            onChange={(e) =>
                              update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                            }
                            placeholder={rwandaMobilePlaceholder()}
                            inputMode="numeric"
                            maxLength={10}
                            disabled={otpVerified}
                          />
                          {!otpVerified && (
                            <button
                              type="button"
                              onClick={() => void handleSendOTP()}
                              disabled={otpBusy || form.phone.length !== 10}
                              className="shrink-0 inline-flex h-10 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                            >
                              {otpBusy && !otpSent ? "Sending…" : otpSent ? "Resend" : "Send OTP"}
                            </button>
                          )}
                          {otpVerified && (
                            <span className="inline-flex h-10 items-center gap-1 rounded-lg bg-primary/10 px-3 text-xs font-semibold text-primary">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </Field>
                      {otpSent && !otpVerified && (
                        <div className="sm:col-span-2 rounded-xl border border-primary/20 bg-primary/[0.03] p-4 space-y-3">
                          <p className="text-xs font-semibold text-foreground">OTP sent — enter the 6-digit code from the driver's phone</p>
                          <div className="flex items-center gap-1.5">
                            {otpCode.map((v, i) => (
                              <input
                                key={i}
                                ref={(el) => { otpRefs.current[i] = el; }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                value={v}
                                disabled={otpBusy}
                                autoFocus={i === 0}
                                onChange={(e) => {
                                  const digit = e.target.value.replace(/\D/g, "").slice(-1);
                                  const next = [...otpCode]; next[i] = digit; setOtpCode(next);
                                  if (digit && i < 5) otpRefs.current[i + 1]?.focus();
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Backspace" && !otpCode[i] && i > 0) otpRefs.current[i - 1]?.focus();
                                }}
                                onPaste={(e) => {
                                  const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                                  if (!text) return; e.preventDefault();
                                  const next = otpCode.map((_, idx) => text[idx] ?? ""); setOtpCode(next);
                                  otpRefs.current[Math.min(text.length, 6) - 1]?.focus();
                                }}
                                className="h-12 w-11 rounded-lg border border-border bg-surface text-center text-lg font-bold text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                              />
                            ))}
                            <button
                              type="button"
                              onClick={() => void handleVerifyOTP()}
                              disabled={otpBusy || otpCode.join("").length !== 6}
                              className="ml-2 inline-flex h-12 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                            >
                              {otpBusy ? "Verifying…" : "Verify"}
                            </button>
                          </div>
                          {otpError && <p className="text-[11px] font-medium text-red-600">{otpError}</p>}
                          <p className="text-[11px] text-muted-foreground">Didn't receive it? <button type="button" onClick={() => void handleSendOTP()} className="font-semibold text-primary hover:underline">Resend OTP</button></p>
                        </div>
                      )}
                      {!otpSent && otpError && <p className="text-[11px] font-medium text-red-600 sm:col-span-2">{otpError}</p>}
                      <Field label="Date of birth" required error={errors.dob} className="sm:col-span-2">
                        <Input type="date" max={maxDob} value={form.dob} onChange={(e) => update("dob", e.target.value)} />
                      </Field>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Identity verification
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Clear selfie — use webcam or upload from this computer.
                    </p>
                    <div className="mt-3">
                      <ImageCaptureField
                        label="Identity photo (selfie)"
                        required
                        file={selfie}
                        previewUrl={null}
                        error={errors.selfie}
                        onChange={setSelfie}
                      />
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Location (Rwanda administrative hierarchy)
                    </h3>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Province" required error={errors.province}>
                        <Select
                          value={form.province}
                          options={RWANDA_PROVINCES.map((p) => p.name)}
                          placeholder="Select province"
                          onChange={(v) => update("province", v)}
                        />
                      </Field>
                      <Field label="District" required error={errors.district}>
                        <Select
                          value={form.district}
                          options={districts}
                          placeholder={form.province ? "Select district" : "Select province first"}
                          disabled={!form.province}
                          onChange={(v) => update("district", v)}
                        />
                      </Field>
                      <Field label="Sector" required error={errors.sector}>
                        <Select
                          value={form.sector}
                          options={sectors}
                          placeholder={form.district ? "Select sector" : "Select district first"}
                          disabled={!form.district}
                          onChange={(v) => update("sector", v)}
                        />
                      </Field>
                      <Field label="Cell" required error={errors.cell}>
                        <Select
                          value={form.cell}
                          options={cellsInSector.map((c) => c.name)}
                          placeholder={form.sector ? "Select cell" : "Select sector first"}
                          disabled={!form.sector}
                          onChange={(v) => update("cell", v)}
                        />
                      </Field>
                      <Field label="Village" required error={errors.village}>
                        <Select
                          value={form.village}
                          options={villages}
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
                  {lockedVehicle && lockedVehicleMeta ? (
                    <section>
                      <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        Vehicle type
                      </h3>
                      <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                        <p className="text-sm font-bold text-primary">{lockedVehicleMeta.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {VEHICLE_SLUG_LABELS[lockedVehicle]} — selected from this drivers page
                        </p>
                      </div>
                    </section>
                  ) : (
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
                              onClick={() => {
                                update("vehicleType", v.value);
                                setErrors((e) => ({ ...e, passengerSeats: "", loadCapacityKg: "" }));
                              }}
                              className={`rounded-xl border p-3 text-left transition-colors ${
                                active
                                  ? "border-primary bg-primary/10 ring-1 ring-inset ring-primary/30"
                                  : "border-border bg-card hover:bg-surface"
                              }`}
                            >
                              <p className={`text-xs font-bold ${active ? "text-primary" : "text-foreground"}`}>{v.label}</p>
                              <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{v.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  <section>
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Vehicle details
                    </h3>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {(form.vehicleType === "cab" || form.vehicleType === "hilux") ? (
                        <Field label="Passenger seats" required error={errors.passengerSeats} className="sm:col-span-2">
                          <Input
                            type="number"
                            min={1}
                            value={form.passengerSeats}
                            onChange={(e) => update("passengerSeats", e.target.value.replace(/\D/g, ""))}
                            placeholder="e.g. 4"
                          />
                        </Field>
                      ) : null}
                      {form.vehicleType === "fuso" ? (
                        <Field label="Max load capacity (kg)" required error={errors.loadCapacityKg} className="sm:col-span-2">
                          <Input
                            type="number"
                            min={1}
                            value={form.loadCapacityKg}
                            onChange={(e) => update("loadCapacityKg", e.target.value.replace(/\D/g, ""))}
                            placeholder="e.g. 5000"
                          />
                        </Field>
                      ) : null}
                      <Field
                        label="Plate number"
                        required
                        hint="Rwanda formats: RAD 000 A (Moto) · RAC 000 A (Commercial) · RAA 000 A (Private)"
                        error={errors.plate || plateWarning || undefined}
                      >
                        <Input
                          value={form.plate}
                          onChange={(e) => update("plate", e.target.value.toUpperCase())}
                          placeholder="RAD 000 A"
                        />
                      </Field>
                      <Field label="Driver licence number" required error={errors.license} hint="Exactly 16 characters">
                        <Input
                          value={form.license}
                          onChange={(e) => update("license", e.target.value.toUpperCase().slice(0, 16))}
                          placeholder="DL-0000000"
                          maxLength={16}
                        />
                      </Field>
                    </div>
                  </section>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-6">
                  <p className="text-xs text-muted-foreground">
                    Both front and back faces are required for all documents. JPEG, PNG, or PDF — camera or file upload.
                  </p>
                  {(Object.keys(DOC_LABELS) as DocKey[]).map((key) => (
                    <div key={key} className="rounded-xl border border-border bg-surface/40 p-4">
                      <p className="text-sm font-semibold text-foreground">{DOC_LABELS[key].label}</p>
                      <p className="text-[11px] text-muted-foreground">{DOC_LABELS[key].hint}</p>
                      <div className="mt-3 grid gap-4 sm:grid-cols-2">
                        <div>
                          <ImageCaptureField
                            label="Front face"
                            required
                            acceptPdf
                            file={docs[key][0]}
                            previewUrl={null}
                            error={errors[`${key}_front`]}
                            onChange={(f) => setDocFace(key, 0, f)}
                          />
                        </div>
                        <div>
                          <ImageCaptureField
                            label="Back face"
                            required
                            acceptPdf
                            file={docs[key][1]}
                            previewUrl={null}
                            error={errors[`${key}_back`]}
                            onChange={(f) => setDocFace(key, 1, f)}
                          />
                        </div>
                      </div>
                    </div>
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

                  <Field
                    label={`${form.momoProvider === "mtn" ? "MTN MoMo" : "Airtel Money"} phone number`}
                    error={errors.momoCode}
                    hint={
                      form.momoProvider === "mtn"
                        ? "10 digits starting with 078 — or use merchant code below"
                        : "10 digits starting with 072 or 073 — or use merchant code below"
                    }
                  >
                    <Input
                      value={form.momoCode}
                      onChange={(e) =>
                        update("momoCode", e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder={rwandaMobilePlaceholder(form.momoProvider)}
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </Field>

                  <Field label="Merchant code (optional)" error={errors.merchantCode}>
                    <Input
                      value={form.merchantCode}
                      onChange={(e) => update("merchantCode", e.target.value)}
                      placeholder="Merchant / pay code"
                    />
                  </Field>

                  <button
                    type="button"
                    onClick={() => {
                      setAcceptedTerms((v) => !v);
                      setErrors((e) => ({ ...e, acceptedTerms: "" }));
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      acceptedTerms ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-surface"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        acceptedTerms ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                      }`}
                    >
                      {acceptedTerms ? "✓" : null}
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      Driver terms accepted on behalf of the applicant — driver will be activated immediately.
                    </span>
                  </button>
                  {errors.acceptedTerms ? (
                    <p className="text-[11px] font-medium text-red-600">{errors.acceptedTerms}</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border bg-surface/40 px-6 py-3">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setErrors({});
                    setStep((s) => s - 1);
                  }}
                  className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium"
                >
                  ← Back
                </button>
              ) : (
                <button type="button" onClick={close} className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium">
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleContinue}
                disabled={submitting}
                className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50"
              >
                {submitting
                  ? "Submitting…"
                  : step < STEPS.length - 1
                    ? "Continue →"
                    : "Submit registration"}
              </button>
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
