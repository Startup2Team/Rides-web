/**
 * Legacy plain-text multi-page PDF engine. Kept only for the standalone
 * driver-registration PDF builder, which still calls buildPdfDocument directly.
 * The reports hub itself renders through ReportPdfDocument (@react-pdf/renderer).
 */

import { pdf } from "@react-pdf/renderer";
import type { GeneratedReport } from "./report-content";
import { ReportPdfDocument, type ReportPdfMeta } from "./report-pdf-document";

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

  let pdfBody = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(pdfBody.length);
    pdfBody += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefStart = pdfBody.length;
  pdfBody += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdfBody += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  pdfBody += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const bytes = new Uint8Array(pdfBody.length);
  for (let i = 0; i < pdfBody.length; i++) bytes[i] = pdfBody.charCodeAt(i);
  return bytes;
}

/** Renders a generated report through the styled ReportPdfDocument layout. */
export async function buildReportPdfBlob(report: GeneratedReport, meta: ReportPdfMeta = {}): Promise<Blob> {
  const instance = pdf(<ReportPdfDocument report={report} meta={meta} />);
  return instance.toBlob();
}

export async function downloadReportPdf(report: GeneratedReport, filename: string, meta: ReportPdfMeta = {}) {
  const blob = await buildReportPdfBlob(report, meta);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
