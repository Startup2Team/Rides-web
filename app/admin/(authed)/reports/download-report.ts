import { generateReport, type GeneratedReport, type ReportContent, type ReportMeta } from "./report-content";
import { downloadReportPdf } from "./generate-report-pdf";
import { downloadReportCsv } from "./build-csv";
import type { ReportPdfMeta } from "./report-pdf-document";

export type { ReportContent, ReportMeta, GeneratedReport } from "./report-content";

export function previewReport(templateId: string, meta: ReportMeta): Promise<GeneratedReport> {
  return generateReport(templateId, meta);
}

/** Export from already-generated report data — WYSIWYG with the on-screen preview. */
export async function exportGeneratedReport(
  report: GeneratedReport,
  filename: string,
  format: "PDF" | "CSV",
  pdfMeta?: ReportPdfMeta,
) {
  if (format === "CSV") downloadReportCsv(report, filename);
  else await downloadReportPdf(report, filename, pdfMeta);
}

/** @deprecated Prefer exportGeneratedReport when preview data is already available */
export async function downloadReport({
  templateId,
  filename,
  format,
  meta,
}: {
  templateId: string;
  filename: string;
  format: "PDF" | "CSV";
  meta: ReportMeta;
}) {
  const content = await generateReport(templateId, meta);
  await exportGeneratedReport(content, filename, format);
}
