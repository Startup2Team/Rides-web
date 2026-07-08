import { generateReport, type GeneratedReport, type ReportContent, type ReportMeta } from "./report-content";
import { downloadReportPdf } from "./generate-report-pdf";
import { downloadReportCsv } from "./build-csv";

export type { ReportContent, ReportMeta, GeneratedReport } from "./report-content";

export function previewReport(templateId: string, meta: ReportMeta): Promise<GeneratedReport> {
  return generateReport(templateId, meta);
}

/** Export from already-generated report data — WYSIWYG with the on-screen preview. */
export function exportGeneratedReport(report: GeneratedReport, filename: string, format: "PDF" | "CSV") {
  if (format === "CSV") downloadReportCsv(report, filename);
  else downloadReportPdf({ ...report, summary: report.summary }, filename);
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
  exportGeneratedReport(content, filename, format);
}
