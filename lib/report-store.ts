/**
 * Local persistence for generated reports. There is no server-side file
 * storage for report content yet (the backend only logs template/format/date
 * metadata) — so a report generated from any page (Revenue, Drivers, etc.)
 * is stored here, keyed by id, and the Reports page reads it back to render
 * the exact same PDF layout on download instead of losing the generated data.
 */
import type { GeneratedReport } from "@/app/admin/(authed)/reports/report-content";
import type { ReportPdfMeta } from "@/app/admin/(authed)/reports/report-pdf-document";

const STORAGE_KEY = "taravelis:saved-reports";
const MAX_SAVED = 100;

export type SavedReport = {
  id: string;
  templateId: string;
  name: string;
  category: string;
  scope: string;
  format: "PDF" | "CSV";
  generatedAtMs: number;
  createdBy: string;
  report: GeneratedReport;
  pdfMeta: ReportPdfMeta;
};

function readAll(): SavedReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: SavedReport[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_SAVED)));
  } catch {
    // storage full or unavailable — the report was already downloaded once, so this is non-fatal
  }
}

export function saveReport(entry: SavedReport): SavedReport {
  const all = readAll().filter((r) => r.id !== entry.id);
  all.unshift(entry);
  writeAll(all);
  return entry;
}

export function listSavedReports(): SavedReport[] {
  return readAll().sort((a, b) => b.generatedAtMs - a.generatedAtMs);
}

export function getSavedReport(id: string): SavedReport | null {
  return readAll().find((r) => r.id === id) ?? null;
}

export function removeSavedReport(id: string) {
  writeAll(readAll().filter((r) => r.id !== id));
}
