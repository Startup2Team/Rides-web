import type { ReportContent } from "./report-content";

function escapeCsvCell(cell: string | number): string {
  const s = String(cell);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildReportCsv(content: ReportContent): string {
  const lines = [content.headers.map(escapeCsvCell).join(",")];
  for (const row of content.rows) {
    lines.push(row.map(escapeCsvCell).join(","));
  }
  return lines.join("\n");
}

export function downloadReportCsv(content: ReportContent, filename: string) {
  const csv = buildReportCsv(content);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
