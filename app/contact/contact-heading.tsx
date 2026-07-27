"use client";

import { useTranslations } from "../i18n/context";

export function ContactHeading() {
  const t = useTranslations("contact");
  return (
    <h1 className="text-balance text-[2.75rem] font-bold leading-[1.02] tracking-[-0.035em] text-muted-foreground sm:text-6xl md:text-7xl lg:text-8xl">
      {t("heading")}
    </h1>
  );
}
