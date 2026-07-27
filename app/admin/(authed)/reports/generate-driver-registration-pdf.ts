import type { DriverRegistrationReport } from "@/lib/driver-registration-report";
import { buildPdfDocument, type PdfLine } from "./generate-report-pdf";

export function downloadDriverRegistrationPdf(report: DriverRegistrationReport) {
  const lines: PdfLine[] = [
    { text: "Taravelis Admin", size: 10 },
    { text: "Driver Registration Report", size: 18, bold: true },
    { text: "", size: 8 },
    { text: `Reporting period: ${report.periodLabel}`, size: 11 },
    { text: `Generated: ${report.generatedAt}`, size: 10 },
    { text: "", size: 8 },
    { text: "Summary", size: 14, bold: true },
    { text: `Total registered drivers: ${report.summary.totalRegistered}`, size: 11 },
    { text: `Approved: ${report.summary.approved}`, size: 11 },
    { text: `Pending verification: ${report.summary.pendingVerification}`, size: 11 },
    { text: `Rejected: ${report.summary.rejected}`, size: 11 },
    { text: "", size: 8 },
    { text: "Detailed driver records", size: 14, bold: true },
  ];

  if (report.drivers.length === 0) {
    lines.push({ text: "No driver registrations found for the selected period.", size: 11 });
  } else {
    report.drivers.forEach((d, i) => {
      lines.push({ text: `${i + 1}. ${d.fullName} (${d.id})`, size: 11, bold: true });
      lines.push({
        text: `Phone: ${d.phone} · Vehicle: ${d.vehicleType} · Plate: ${d.vehiclePlate} · District: ${d.district}`,
        size: 9,
      });
      lines.push({
        text: `Registered: ${d.registeredAt} · Status: ${d.verificationLabel} · License: ${d.licenseNumber} · MoMo: ${d.momoProvider}`,
        size: 9,
      });
      lines.push({ text: "", size: 4 });
    });
  }

  lines.push({ text: "", size: 8 });
  lines.push({ text: "Conclusion & insights", size: 14, bold: true });
  for (const insight of report.insights) {
    lines.push({ text: `• ${insight}`, size: 10 });
  }
  lines.push({ text: "", size: 8 });
  lines.push({
    text: "This report was generated automatically from Taravelis admin. Confidential — for internal use only.",
    size: 8,
  });

  const bytes = buildPdfDocument(lines);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const slug = report.periodLabel.replace(/\s+/g, "-").toLowerCase();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `driver-registration-report-${slug}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
