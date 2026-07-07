"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_LOCALE, STORAGE_KEY, isLocale, type Locale } from "./config";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import rw from "./locales/rw.json";

const dictionaries = { en, fr, rw } satisfies Record<Locale, typeof en>;

type Dictionary = typeof en;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dictionary: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Restore previously-selected language on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isLocale(saved)) setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, dictionary: dictionaries[locale] }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}

export function useLocale() {
  const { locale, setLocale } = useI18n();
  return { locale, setLocale };
}

export function useTranslations<Section extends keyof Dictionary>(
  section: Section,
) {
  const { dictionary } = useI18n();
  return useCallback(
    (key: keyof Dictionary[Section]) => dictionary[section][key] as string,
    [dictionary, section],
  );
}

// For sections with structured content (arrays/objects) rather than flat strings.
export function useSection<Section extends keyof Dictionary>(
  section: Section,
): Dictionary[Section] {
  const { dictionary } = useI18n();
  return dictionary[section];
}
