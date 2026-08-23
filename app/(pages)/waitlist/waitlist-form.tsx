"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  submitWaitlist,
  WaitlistError,
  type WaitlistReceipt,
  type WaitlistRole,
} from "@/lib/api";
import { renderTemplate } from "@/lib/i18n-template";
import {
  VEHICLE_SLUGS,
  normalizeRwandaMobilePhone,
  validateRwandaMobilePhone,
  type VehicleSlug,
} from "@/lib/driver-registration";
import { RWANDA_PROVINCES, getDistricts, getSectors } from "@/lib/rwanda-locations";
import { useTranslations } from "../../i18n/context";
import { TurnstileWidget } from "./turnstile-widget";

type FormState = "idle" | "sending" | "success" | "error";

// The shareable referral link always points at the public marketing domain,
// regardless of which environment (localhost/staging) the form itself is
// running against.
const WAITLIST_SHARE_BASE_URL = "https://rides.rw/waitlist";

type WaitlistVehicleLabelKey =
  | "vehicleMoto"
  | "vehicleRifani"
  | "vehicleCab"
  | "vehicleHilux"
  | "vehicleFuso";

const VEHICLE_LABEL_KEY: Record<VehicleSlug, WaitlistVehicleLabelKey> = {
  moto: "vehicleMoto",
  rifani: "vehicleRifani",
  cab: "vehicleCab",
  hilux: "vehicleHilux",
  fuso: "vehicleFuso",
};

function fillTemplateString(template: string, values: Record<string, string>): string {
  return template.replace(/\{([a-zA-Z]+)\}/g, (_, key: string) => values[key] ?? "");
}

/** Local 10-digit "0781234567" → E.164 "+250781234567" for SMS delivery. */
function toE164(rawPhone: string): string {
  const digits = normalizeRwandaMobilePhone(rawPhone);
  return `+250${digits.slice(1)}`;
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// Shared field wrapper — matches the underline-input aesthetic of contact-form.tsx.
function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-1">{children}</div>
      {error ? (
        <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p>
      ) : null}
    </label>
  );
}

const inputClass = (hasError: boolean) =>
  `block min-h-[44px] w-full bg-transparent border-0 border-b px-0 py-3 text-base text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary sm:text-sm ${
    hasError ? "border-red-300" : "border-border"
  }`;

type SelectOption = { value: string; label: string };

function SelectField({
  value,
  options,
  placeholder,
  disabled,
  hasError,
  onChange,
}: {
  value: string;
  options: SelectOption[];
  placeholder: string;
  disabled?: boolean;
  hasError?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass(Boolean(hasError))} appearance-none pr-6 ${
          disabled ? "cursor-not-allowed text-muted-foreground/60" : ""
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

const toOptions = (names: string[]): SelectOption[] => names.map((n) => ({ value: n, label: n }));

export function WaitlistForm() {
  const t = useTranslations("waitlist");
  const searchParams = useSearchParams();
  const referredBy = searchParams.get("ref") ?? undefined;

  const [role, setRole] = useState<WaitlistRole | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleSlug | "">("");
  const [consentLaunch, setConsentLaunch] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);

  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileUnavailable, setTurnstileUnavailable] = useState(false);
  const [showTurnstileError, setShowTurnstileError] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<FormState>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<WaitlistReceipt | null>(null);
  const [copied, setCopied] = useState(false);

  const districts = useMemo(
    () => (province ? getDistricts(province).map((d) => d.name) : []),
    [province],
  );
  const sectors = useMemo(
    () => (province && district ? getSectors(province, district).map((s) => s.name) : []),
    [province, district],
  );

  const errors: Record<"name" | "phone" | "sector" | "vehicleType" | "consentLaunch", string | null> = {
    name: !name.trim() ? t("errNameRequired") : null,
    phone: !phone.trim()
      ? t("errPhoneRequired")
      : validateRwandaMobilePhone(phone)
        ? t("errPhoneInvalid")
        : null,
    sector: !sector ? t("errSectorRequired") : null,
    vehicleType: role === "DRIVER" && !vehicleType ? t("errVehicleRequired") : null,
    consentLaunch: !consentLaunch ? t("errConsentRequired") : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function showError(field: keyof typeof errors): string | null {
    return touched[field] ? errors[field] : null;
  }

  function mapServerError(err: unknown): string {
    if (err instanceof WaitlistError) {
      switch (err.status) {
        case 400:
          return t("err400");
        case 403:
          return t("err403");
        case 409:
          return t("err409");
        case 429:
          return t("err429");
        default:
          return t("genericErrorFallback");
      }
    }
    return t("genericErrorFallback");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, phone: true, sector: true, vehicleType: true, consentLaunch: true });
    if (hasErrors) return;
    if (!turnstileUnavailable && !turnstileToken) {
      setShowTurnstileError(true);
      return;
    }
    setShowTurnstileError(false);

    setState("sending");
    setServerError(null);
    try {
      const area = [sector, district].filter(Boolean).join(", ");
      const result = await submitWaitlist({
        role: role as WaitlistRole,
        name: name.trim(),
        phone: toE164(phone),
        area,
        vehicle_type: role === "DRIVER" ? vehicleType || undefined : undefined,
        email: email.trim() || undefined,
        referred_by: referredBy,
        consent_launch: consentLaunch,
        consent_marketing: consentMarketing,
        turnstile_token: turnstileToken,
        source: "web_waitlist",
      });
      setReceipt(result);
      setState("success");
    } catch (err) {
      setServerError(mapServerError(err));
      setState("error");
    }
  }

  function resetForm() {
    setRole(null);
    setName("");
    setPhone("");
    setEmail("");
    setProvince("");
    setDistrict("");
    setSector("");
    setVehicleType("");
    setConsentLaunch(false);
    setConsentMarketing(false);
    setTurnstileToken("");
    setShowTurnstileError(false);
    setTouched({});
    setServerError(null);
    setReceipt(null);
    setState("idle");
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (state === "success" && receipt) {
    // The backend may not return a referral_code (e.g. referrals not enabled
    // yet) — still show a success message, just without a share link.
    const shareLink = receipt.referral_code
      ? `${WAITLIST_SHARE_BASE_URL}?ref=${receipt.referral_code}`
      : null;
    const whatsappHref = shareLink
      ? `https://wa.me/?text=${encodeURIComponent(fillTemplateString(t("whatsappShareText"), { link: shareLink }))}`
      : null;

    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-8 backdrop-blur-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/40">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="mt-5 text-xl font-bold tracking-[-0.02em] text-foreground">
          {t("successTitle")}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {renderTemplate(t("successBodyTemplate"), {
            name: <span className="font-semibold text-foreground">{name.split(" ")[0]}</span>,
          })}
        </p>

        {shareLink && whatsappHref ? (
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <h4 className="text-sm font-bold text-foreground">{t("successShareHeading")}</h4>
            <p className="mt-1 text-xs text-muted-foreground">{t("successShareBody")}</p>

            <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-xs font-mono text-foreground">
                {shareLink}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(shareLink).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
                className="shrink-0 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-surface-alt"
              >
                {copied ? t("copied") : t("copyLink")}
              </button>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-bold text-white transition-transform active:scale-[0.98] sm:w-auto"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                <path d="M17.6 6.32A7.85 7.85 0 0012.05 4a7.94 7.94 0 00-6.9 11.9L4 20l4.2-1.1a7.9 7.9 0 003.85 1h.01a7.94 7.94 0 007.94-7.94 7.9 7.9 0 00-2.4-5.64zm-5.55 12.2h-.01a6.6 6.6 0 01-3.36-.92l-.24-.14-2.5.65.67-2.44-.16-.25a6.6 6.6 0 01-1-3.5 6.62 6.62 0 0111.29-4.68 6.58 6.58 0 011.94 4.68 6.62 6.62 0 01-6.63 6.6zm3.62-4.95c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.5.64-.62.77-.11.13-.23.15-.42.05-.2-.1-.83-.3-1.58-.97-.58-.52-.98-1.15-1.09-1.35-.11-.2-.01-.3.09-.4.09-.1.2-.23.3-.35.1-.11.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.33-.11 0-.24-.01-.37-.01a.72.72 0 00-.52.24c-.18.2-.68.66-.68 1.6 0 .95.7 1.87.79 2 .1.13 1.37 2.1 3.33 2.94.46.2.83.32 1.11.41.47.15.9.13 1.24.08.38-.06 1.17-.48 1.33-.94.17-.46.17-.86.12-.94-.05-.09-.18-.14-.38-.24z" />
              </svg>
              {t("whatsappButton")}
            </a>
          </div>
        ) : null}

        <button
          type="button"
          onClick={resetForm}
          className="mt-6 inline-flex h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-alt"
        >
          {t("joinAnother")}
        </button>
      </div>
    );
  }

  // ── Role fork (shown before any fields) ─────────────────────────────────
  if (!role) {
    return (
      <div>
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-8 bg-border" />
            {t("eyebrow")}
          </div>
          <h1 className="mt-4 text-balance text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-4xl">
            {t("heading")}
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            {t("subheading")}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setRole("CUSTOMER")}
            className="rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-md active:scale-[0.99]"
          >
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              {t("roleCustomerTitle")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("roleCustomerHint")}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setRole("DRIVER")}
            className="rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-md active:scale-[0.99]"
          >
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              {t("roleDriverTitle")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("roleDriverHint")}
            </p>
          </button>
        </div>
      </div>
    );
  }

  // ── Fields ───────────────────────────────────────────────────────────────
  return (
    <div>
      <button
        type="button"
        onClick={() => setRole(null)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {role === "CUSTOMER" ? t("roleCustomerTitle") : t("roleDriverTitle")}
      </button>

      <h1 className="mt-4 text-balance text-2xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-3xl">
        {t("heading")}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
        <FormField label={t("nameLabel")} error={showError("name")}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((tt) => ({ ...tt, name: true }))}
            autoComplete="name"
            className={inputClass(Boolean(showError("name")))}
          />
        </FormField>

        <FormField label={t("phoneLabel")} error={showError("phone")}>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched((tt) => ({ ...tt, phone: true }))}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t("phoneHint")}
            className={inputClass(Boolean(showError("phone")))}
          />
        </FormField>

        <FormField label={t("emailLabel")}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            className={inputClass(false)}
          />
        </FormField>

        <div className="grid gap-6 sm:grid-cols-3">
          <FormField label={t("provinceLabel")}>
            <SelectField
              value={province}
              options={toOptions(RWANDA_PROVINCES.map((p) => p.name))}
              placeholder={t("selectProvincePlaceholder")}
              onChange={(v) => {
                setProvince(v);
                setDistrict("");
                setSector("");
              }}
            />
          </FormField>
          <FormField label={t("districtLabel")}>
            <SelectField
              value={district}
              options={toOptions(districts)}
              placeholder={province ? t("selectDistrictPlaceholder") : t("selectDistrictFirstPlaceholder")}
              disabled={!province}
              onChange={(v) => {
                setDistrict(v);
                setSector("");
              }}
            />
          </FormField>
          <FormField label={t("sectorLabel")} error={showError("sector")}>
            <SelectField
              value={sector}
              options={toOptions(sectors)}
              placeholder={district ? t("selectSectorPlaceholder") : t("selectSectorFirstPlaceholder")}
              disabled={!district}
              hasError={Boolean(showError("sector"))}
              onChange={(v) => {
                setSector(v);
                setTouched((tt) => ({ ...tt, sector: true }));
              }}
            />
          </FormField>
        </div>

        {role === "DRIVER" ? (
          <FormField label={t("vehicleTypeLabel")} error={showError("vehicleType")}>
            <SelectField
              value={vehicleType}
              options={VEHICLE_SLUGS.map((slug) => ({ value: slug, label: t(VEHICLE_LABEL_KEY[slug]) }))}
              placeholder={t("selectVehiclePlaceholder")}
              hasError={Boolean(showError("vehicleType"))}
              onChange={(v) => {
                setVehicleType(v as VehicleSlug);
                setTouched((tt) => ({ ...tt, vehicleType: true }));
              }}
            />
          </FormField>
        ) : null}

        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={consentLaunch}
              onChange={(e) => {
                setConsentLaunch(e.target.checked);
                setTouched((tt) => ({ ...tt, consentLaunch: true }));
              }}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">{t("consentLaunchLabel")}</span>
          </label>
          {showError("consentLaunch") ? (
            <p className="text-[11px] font-medium text-red-600">{errors.consentLaunch}</p>
          ) : null}

          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={consentMarketing}
              onChange={(e) => setConsentMarketing(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">{t("consentMarketingLabel")}</span>
          </label>

          <p className="text-[11px] text-muted-foreground">
            {renderTemplate(t("privacyNoteTemplate"), {
              privacyLink: (
                <Link href="/privacy" className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline">
                  {t("privacyLinkLabel")}
                </Link>
              ),
            })}
          </p>
        </div>

        <div>
          <TurnstileWidget
            onToken={(token) => {
              setTurnstileToken(token);
              if (token) setShowTurnstileError(false);
            }}
            onUnavailable={() => setTurnstileUnavailable(true)}
          />
          {turnstileUnavailable ? (
            <p className="mt-2 text-[11px] text-muted-foreground">{t("turnstileUnavailable")}</p>
          ) : null}
          {showTurnstileError ? (
            <p className="mt-2 text-[11px] font-medium text-red-600">{t("errTurnstileRequired")}</p>
          ) : null}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={state === "sending" || !consentLaunch}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-10 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-primary sm:w-auto"
          >
            {state === "sending" ? (
              <>
                <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </button>
        </div>

        {state === "error" ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
            {serverError ?? t("genericErrorFallback")}
          </p>
        ) : null}
      </form>
    </div>
  );
}
