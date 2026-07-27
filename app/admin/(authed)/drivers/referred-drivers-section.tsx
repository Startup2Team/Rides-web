"use client";

import Link from "next/link";
import { referralCountLabel } from "@/lib/referrals";

function ReferralsCard({
  driverId,
  count,
  size = "default",
}: {
  driverId: string;
  count: number;
  size?: "default" | "compact";
}) {
  const href = `/admin/drivers/${driverId}/referrals`;

  if (count === 0) {
    return (
      <div
        className={`rounded-xl border border-dashed border-border bg-surface/40 text-center ${
          size === "compact" ? "px-3 py-2.5" : "px-4 py-5"
        }`}
      >
        <p
          className={`font-bold tracking-tight text-muted-foreground ${
            size === "compact" ? "text-lg" : "text-3xl"
          }`}
        >
          0
        </p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Referrals
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">No referrals yet</p>
      </div>
    );
  }

  return (
    <Link
      href={href}
      title={`View ${count} referred driver${count === 1 ? "" : "s"}`}
      className={`group block rounded-xl border border-border bg-surface/50 text-center transition-colors hover:border-primary/40 hover:bg-primary/[0.04] ${
        size === "compact" ? "px-3 py-2.5" : "px-4 py-5"
      }`}
    >
      <p
        className={`font-bold tracking-tight text-primary transition-transform group-hover:scale-105 ${
          size === "compact" ? "text-lg" : "text-3xl"
        }`}
      >
        {count}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Referrals
      </p>
      {size === "default" ? (
        <p className="mt-2 text-[11px] font-semibold text-primary group-hover:underline">
          View referred drivers →
        </p>
      ) : (
        <p className="mt-0.5 text-[9px] text-muted-foreground group-hover:text-primary">
          Tap to view list
        </p>
      )}
    </Link>
  );
}

export function ReferredDriversSection({
  driverId,
  count,
  compact = false,
}: {
  driverId: string;
  count: number;
  compact?: boolean;
  defaultOpen?: boolean;
}) {
  if (compact) {
    return <ReferralsCard driverId={driverId} count={count} size="compact" />;
  }

  return (
    <section className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
          Referral activity
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{referralCountLabel(count)}</p>
      </div>
      <ReferralsCard driverId={driverId} count={count} />
    </section>
  );
}

export function ReferralCountLink({
  driverId,
  count,
  className = "",
}: {
  driverId: string;
  count: number;
  className?: string;
}) {
  const href = `/admin/drivers/${driverId}/referrals`;

  if (count === 0) {
    return (
      <span className={`text-muted-foreground ${className}`} title="No referrals yet">
        0
      </span>
    );
  }

  return (
    <Link
      href={href}
      title={`View ${count} referred driver${count === 1 ? "" : "s"}`}
      className={`font-semibold text-primary hover:underline ${className}`}
    >
      {count}
    </Link>
  );
}

/** Clickable referrals tile for driver grid cards — matches Accept / Rating stats row. */
export function ReferralStatTile({
  driverId,
  count,
}: {
  driverId: string;
  count: number;
}) {
  const href = `/admin/drivers/${driverId}/referrals`;
  const inner = (
    <>
      <p
        className={`text-sm font-bold tracking-tight ${
          count > 0 ? "text-primary group-hover:underline" : "text-muted-foreground"
        }`}
      >
        {count}
      </p>
      <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
        Referrals
      </p>
    </>
  );

  if (count === 0) {
    return <div className="text-center">{inner}</div>;
  }

  return (
    <Link
      href={href}
      title={`View ${count} referred drivers`}
      className="group block text-center rounded-lg transition-colors hover:bg-primary/[0.06] -my-1 py-1"
    >
      {inner}
    </Link>
  );
}
