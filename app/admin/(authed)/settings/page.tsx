import { AdminPageHeader, Card } from "../_components";

export const metadata = {
  title: "Admin · Settings",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="System"
        title="Platform settings"
        subtitle="Configure commission, fares, vehicle categories, and integrations."
        action={
          <button className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30">
            Save changes
          </button>
        }
      />

      <Card title="Commission">
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Cab Taxi
            </span>
            <div className="relative mt-2">
              <input
                defaultValue="15"
                className="block h-11 w-full rounded-xl border border-border bg-surface pl-3.5 pr-9 text-sm font-semibold text-foreground outline-none focus:border-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                %
              </span>
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Moto Bike
            </span>
            <div className="relative mt-2">
              <input
                defaultValue="12"
                className="block h-11 w-full rounded-xl border border-border bg-surface pl-3.5 pr-9 text-sm font-semibold text-foreground outline-none focus:border-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                %
              </span>
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Heavy Fuso
            </span>
            <div className="relative mt-2">
              <input
                defaultValue="18"
                className="block h-11 w-full rounded-xl border border-border bg-surface pl-3.5 pr-9 text-sm font-semibold text-foreground outline-none focus:border-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                %
              </span>
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Light Hilux
            </span>
            <div className="relative mt-2">
              <input
                defaultValue="16"
                className="block h-11 w-full rounded-xl border border-border bg-surface pl-3.5 pr-9 text-sm font-semibold text-foreground outline-none focus:border-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                %
              </span>
            </div>
          </label>
        </div>
      </Card>

      <Card title="Negotiation rules">
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Max rounds
            </span>
            <input
              defaultValue="4"
              className="mt-2 block h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm font-semibold text-foreground outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Response timeout
            </span>
            <input
              defaultValue="15s"
              className="mt-2 block h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm font-semibold text-foreground outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Masked call max
            </span>
            <input
              defaultValue="30s"
              className="mt-2 block h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm font-semibold text-foreground outline-none focus:border-primary"
            />
          </label>
        </div>
      </Card>

      <Card title="Regions">
        <ul className="divide-y divide-border">
          {[
            { name: "Kigali · Central", status: "Active", count: "89 drivers" },
            { name: "Kigali · East", status: "Active", count: "32 drivers" },
            { name: "Kigali · West", status: "Active", count: "21 drivers" },
            { name: "Musanze", status: "Pilot", count: "8 drivers" },
            { name: "Huye", status: "Coming soon", count: "—" },
          ].map((r) => (
            <li key={r.name} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  {r.name}
                </p>
                <p className="text-[11px] text-muted-foreground">{r.count}</p>
              </div>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                {r.status}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
