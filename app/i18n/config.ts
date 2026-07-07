export const LOCALES = ["en", "fr", "rw"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const STORAGE_KEY = "rides-language";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
