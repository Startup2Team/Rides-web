"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Card } from "../_components";

type Tab = "commission" | "negotiation" | "fares" | "regions" | "integrations" | "notifications";

const tabs: { id: Tab; label: string }[] = [
  { id: "commission", label: "Commission" },
  { id: "negotiation", label: "Negotiation" },
  { id: "fares", label: "Fares" },
  { id: "regions", label: "Regions" },
  { id: "integrations", label: "Integrations" },
  { id: "notifications", label: "Notifications" },
];

type State = {
  commission: { moto: string; cab: string; hilux: string; fuso: string };
  negotiation: { maxRounds: string; responseTimeoutSec: string; maskedCallSec: string };
  fares: {
    motoBase: string;
    motoPerKm: string;
    cabBase: string;
    cabPerKm: string;
    hiluxBase: string;
    hiluxPerKm: string;
    fusoBase: string;
    fusoPerKm: string;
  };
  regions: { id: string; name: string; status: "Active" | "Pilot" | "Coming soon"; drivers: number }[];
  integrations: {
    mtnMomo: boolean;
    airtelMoney: boolean;
    mapsProvider: "Google" | "Mapbox" | "OSM";
    sms: boolean;
    email: boolean;
  };
  notifications: {
    sosToOps: boolean;
    sosToAdmins: boolean;
    payoutSummary: boolean;
    weeklyDigest: boolean;
    incidentEscalation: boolean;
  };
};

const initial: State = {
  commission: { moto: "12", cab: "15", hilux: "16", fuso: "18" },
  negotiation: { maxRounds: "4", responseTimeoutSec: "15", maskedCallSec: "30" },
  fares: {
    motoBase: "500",
    motoPerKm: "180",
    cabBase: "1000",
    cabPerKm: "300",
    hiluxBase: "1500",
    hiluxPerKm: "450",
    fusoBase: "3000",
    fusoPerKm: "800",
  },
  regions: [
    { id: "r1", name: "Kigali · Central", status: "Active", drivers: 89 },
    { id: "r2", name: "Kigali · East", status: "Active", drivers: 32 },
    { id: "r3", name: "Kigali · West", status: "Active", drivers: 21 },
    { id: "r4", name: "Musanze", status: "Pilot", drivers: 8 },
    { id: "r5", name: "Huye", status: "Coming soon", drivers: 0 },
  ],
  integrations: {
    mtnMomo: true,
    airtelMoney: true,
    mapsProvider: "Google",
    sms: true,
    email: true,
  },
  notifications: {
    sosToOps: true,
    sosToAdmins: true,
    payoutSummary: true,
    weeklyDigest: true,
    incidentEscalation: true,
  },
};

function Field({
  label,
  suffix,
  children,
}: {
  label: string;
  suffix?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <div className="relative mt-2">
        {children}
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  suffix,
}: {
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`block h-11 w-full rounded-xl border border-border bg-surface pl-3.5 ${
        suffix ? "pr-9" : "pr-3.5"
      } text-sm font-semibold text-foreground outline-none focus:border-primary`}
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface/40 p-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description ? (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

const regionStatusStyles: Record<State["regions"][number]["status"], string> = {
  Active: "bg-primary/15 text-primary",
  Pilot: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  "Coming soon": "bg-muted text-muted-foreground",
};

export function SettingsConsole() {
  const [tab, setTab] = useState<Tab>("commission");
  const [state, setState] = useState<State>(initial);
  const [savedState, setSavedState] = useState<State>(initial);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const dirty = JSON.stringify(state) !== JSON.stringify(savedState);

  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {dirty ? (
            <button
              type="button"
              onClick={() => setState(savedState)}
              className="inline-flex h-9 items-center rounded-xl border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
            >
              Discard
            </button>
          ) : null}
          <button
            type="button"
            disabled={!dirty}
            onClick={() => {
              setSavedState(state);
              setToast("Settings saved");
            }}
            className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save changes
          </button>
        </div>
      </div>

      {tab === "commission" ? (
        <Card title="Commission take rate per vehicle">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {(["moto", "cab", "hilux", "fuso"] as const).map((key) => (
              <Field
                key={key}
                label={
                  {
                    moto: "Moto Bike",
                    cab: "Cab Taxi",
                    hilux: "Light Hilux",
                    fuso: "Heavy Fuso",
                  }[key]
                }
                suffix="%"
              >
                <NumberInput
                  value={state.commission[key]}
                  onChange={(v) => set("commission", { ...state.commission, [key]: v })}
                  suffix="%"
                />
              </Field>
            ))}
          </div>
          <p className="border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
            Commission is deducted from every settled fare before driver payout.
            Take effect on new rides only — existing rides keep their original rate.
          </p>
        </Card>
      ) : null}

      {tab === "negotiation" ? (
        <Card title="Negotiation rules">
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <Field label="Max rounds">
              <NumberInput
                value={state.negotiation.maxRounds}
                onChange={(v) =>
                  set("negotiation", { ...state.negotiation, maxRounds: v })
                }
              />
            </Field>
            <Field label="Response timeout" suffix="sec">
              <NumberInput
                value={state.negotiation.responseTimeoutSec}
                onChange={(v) =>
                  set("negotiation", {
                    ...state.negotiation,
                    responseTimeoutSec: v,
                  })
                }
                suffix="sec"
              />
            </Field>
            <Field label="Masked call max" suffix="sec">
              <NumberInput
                value={state.negotiation.maskedCallSec}
                onChange={(v) =>
                  set("negotiation", { ...state.negotiation, maskedCallSec: v })
                }
                suffix="sec"
              />
            </Field>
          </div>
          <p className="border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
            If a side doesn't respond within the timeout, negotiation auto-fails and
            both parties can rebook.
          </p>
        </Card>
      ) : null}

      {tab === "fares" ? (
        <Card title="Base fare guidance per vehicle">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {(
              [
                { key: "moto", label: "Moto Bike" },
                { key: "cab", label: "Cab Taxi" },
                { key: "hilux", label: "Light Hilux" },
                { key: "fuso", label: "Heavy Fuso" },
              ] as const
            ).map(({ key, label }) => (
              <div
                key={key}
                className="space-y-3 rounded-xl border border-border bg-surface/40 p-4"
              >
                <p className="text-xs font-bold text-foreground">{label}</p>
                <Field label="Base fare" suffix="RWF">
                  <NumberInput
                    value={state.fares[`${key}Base` as keyof State["fares"]]}
                    onChange={(v) =>
                      set("fares", {
                        ...state.fares,
                        [`${key}Base`]: v,
                      })
                    }
                    suffix="RWF"
                  />
                </Field>
                <Field label="Per kilometre" suffix="RWF">
                  <NumberInput
                    value={state.fares[`${key}PerKm` as keyof State["fares"]]}
                    onChange={(v) =>
                      set("fares", {
                        ...state.fares,
                        [`${key}PerKm`]: v,
                      })
                    }
                    suffix="RWF"
                  />
                </Field>
              </div>
            ))}
          </div>
          <p className="border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
            These figures power the suggested fare shown to customers at request
            time. Actual fares are negotiated between rider and driver.
          </p>
        </Card>
      ) : null}

      {tab === "regions" ? (
        <Card title="Service regions">
          <ul className="divide-y divide-border">
            {state.regions.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                    {r.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.drivers === 0 ? "—" : `${r.drivers} drivers`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={r.status}
                    onChange={(e) =>
                      set(
                        "regions",
                        state.regions.map((x) =>
                          x.id === r.id
                            ? {
                                ...x,
                                status: e.target.value as typeof x.status,
                              }
                            : x,
                        ),
                      )
                    }
                    className="h-8 rounded-lg border border-border bg-surface px-2 text-[11px] font-medium text-foreground outline-none focus:border-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Pilot">Pilot</option>
                    <option value="Coming soon">Coming soon</option>
                  </select>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${regionStatusStyles[r.status]}`}
                  >
                    {r.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {tab === "integrations" ? (
        <div className="space-y-4">
          <Card title="Payment providers">
            <div className="space-y-2 p-4">
              <Toggle
                checked={state.integrations.mtnMomo}
                onChange={(v) =>
                  set("integrations", { ...state.integrations, mtnMomo: v })
                }
                label="MTN Mobile Money"
                description="Accept payments and disburse driver payouts via MTN MoMo."
              />
              <Toggle
                checked={state.integrations.airtelMoney}
                onChange={(v) =>
                  set("integrations", { ...state.integrations, airtelMoney: v })
                }
                label="Airtel Money"
                description="Accept payments and disburse driver payouts via Airtel."
              />
            </div>
          </Card>

          <Card title="Maps & messaging">
            <div className="space-y-2 p-4">
              <div className="rounded-xl border border-border bg-surface/40 p-3">
                <p className="text-sm font-semibold text-foreground">Maps provider</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Tile + geocoding source for in-app maps.
                </p>
                <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-border bg-card p-0.5">
                  {(["Google", "Mapbox", "OSM"] as const).map((p) => {
                    const active = state.integrations.mapsProvider === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() =>
                          set("integrations", {
                            ...state.integrations,
                            mapsProvider: p,
                          })
                        }
                        className={`shrink-0 rounded-md px-3 py-1 text-[11px] font-medium transition-colors ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Toggle
                checked={state.integrations.sms}
                onChange={(v) =>
                  set("integrations", { ...state.integrations, sms: v })
                }
                label="SMS gateway"
                description="OTP, ride codes, and ops alerts via SMS."
              />
              <Toggle
                checked={state.integrations.email}
                onChange={(v) =>
                  set("integrations", { ...state.integrations, email: v })
                }
                label="Transactional email"
                description="Receipts, password resets, and report delivery."
              />
            </div>
          </Card>
        </div>
      ) : null}

      {tab === "notifications" ? (
        <Card title="Admin notification rules">
          <div className="space-y-2 p-4">
            <Toggle
              checked={state.notifications.sosToOps}
              onChange={(v) =>
                set("notifications", { ...state.notifications, sosToOps: v })
              }
              label="SOS to ops on-call"
              description="Immediate push + phone call to on-call ops engineer."
            />
            <Toggle
              checked={state.notifications.sosToAdmins}
              onChange={(v) =>
                set("notifications", { ...state.notifications, sosToAdmins: v })
              }
              label="SOS to all admins"
              description="Broadcast SOS to every admin's notification feed."
            />
            <Toggle
              checked={state.notifications.incidentEscalation}
              onChange={(v) =>
                set("notifications", {
                  ...state.notifications,
                  incidentEscalation: v,
                })
              }
              label="Incident escalation"
              description="Email admins when any incident is escalated."
            />
            <Toggle
              checked={state.notifications.payoutSummary}
              onChange={(v) =>
                set("notifications", { ...state.notifications, payoutSummary: v })
              }
              label="Daily payout summary"
              description="Send a recap email after each payout batch."
            />
            <Toggle
              checked={state.notifications.weeklyDigest}
              onChange={(v) =>
                set("notifications", { ...state.notifications, weeklyDigest: v })
              }
              label="Weekly performance digest"
              description="Monday-morning email with last week's KPIs."
            />
          </div>
        </Card>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-2xl">
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
