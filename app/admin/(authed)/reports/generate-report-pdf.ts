/**
 * Shared multi-page PDF engine for all admin reports — generalized from the
 * original driver-registration-only builder so every report gets the same
 * pagination, wrapping, and bold/regular text quality.
 */

import type { ReportContent } from "./report-content";

function escapePdf(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export type PdfLine = { text: string; size: number; bold?: boolean };

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars) {
      if (cur) lines.push(cur);
      cur = w.length > maxChars ? w.slice(0, maxChars) : w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

export function buildPdfDocument(lines: PdfLine[]): Uint8Array {
  let y = 760;
  const marginBottom = 48;
  const streams: string[] = [];
  let currentStream: string[] = [];

  const flushPage = () => {
    if (currentStream.length === 0) return;
    streams.push(currentStream.join("\n"));
    currentStream = [];
    y = 760;
  };

  for (const line of lines) {
    const wrapped = wrapText(line.text, line.size >= 14 ? 52 : line.size >= 11 ? 88 : 95);
    for (const w of wrapped) {
      if (y < marginBottom) flushPage();
      const fontSize = line.size;
      const font = line.bold ? "/F2" : "/F1";
      currentStream.push(`BT ${font} ${fontSize} Tf 50 ${y} Td (${escapePdf(w)}) Tj ET`);
      y -= fontSize + (line.bold ? 8 : 5);
    }
  }
  flushPage();

  if (streams.length === 0) streams.push("");

  const pageCount = streams.length;
  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");

  const kids = Array.from({ length: pageCount }, (_, i) => `${3 + i * 2} 0 R`);
  objects.push(`<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pageCount} >>`);

  let objIdx = 3;
  for (let p = 0; p < pageCount; p++) {
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents ${objIdx + 1} 0 R >>`,
    );
    objIdx++;
    const stream = streams[p]!;
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    objIdx++;
  }

  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i);
  return bytes;
}

function formatCell(cell: string | number): string {
  return typeof cell === "number" ? cell.toLocaleString("en-US") : cell;
}

export function buildReportPdf(content: ReportContent): Uint8Array {
  const lines: PdfLine[] = [
    { text: "Taravelis Admin", size: 10 },
    { text: content.title, size: 18, bold: true },
    { text: content.subtitle, size: 11 },
    { text: `Generated: ${content.generatedAt ? new Date(content.generatedAt).toLocaleString() : new Date().toLocaleString()}`, size: 9 },
    { text: "", size: 8 },
  ];

  if (content.summary && content.summary.length > 0) {
    lines.push({ text: "Summary", size: 14, bold: true });
    for (const metric of content.summary) {
      const val = typeof metric.value === "number" ? metric.value.toLocaleString("en-US") : metric.value;
      lines.push({ text: `${metric.label}: ${val}`, size: 10 });
    }
    lines.push({ text: "", size: 8 });
  }

  if (content.insights.length > 0) {
    lines.push({ text: "Insights", size: 14, bold: true });
    for (const insight of content.insights) {
      lines.push({ text: `• ${insight}`, size: 10 });
    }
    lines.push({ text: "", size: 8 });
  }

  lines.push({ text: content.headers.join("  ·  "), size: 10, bold: true });

  if (content.rows.length === 0) {
    lines.push({ text: "No data available for this report.", size: 11 });
  } else {
    for (const row of content.rows) {
      lines.push({
        text: row.map((c) => formatCell(c)).join("  ·  "),
        size: 9,
      });
    }
  }

  lines.push({ text: "", size: 8 });
  lines.push({
    text: "This report was generated automatically from Taravelis admin. Confidential — for internal use only.",
    size: 8,
  });

  return buildPdfDocument(lines);
}

export function downloadReportPdf(content: ReportContent, filename: string) {
  const bytes = buildReportPdf(content);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
