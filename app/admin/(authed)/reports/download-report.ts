import type { ReportFormat } from "./new-report-modal";

type ReportContent = {
  headers: string[];
  rows: (string | number)[][];
  title: string;
  subtitle: string;
};

const generators: Record<string, () => ReportContent> = {
  "ops-daily": () => ({
    title: "Daily Operations Report",
    subtitle: "Snapshot of rides, revenue, drivers, customers",
    headers: ["Hour", "Rides Requested", "Rides Completed", "Active Drivers", "Revenue (RWF)"],
    rows: [
      ["00:00", 18, 14, 22, 38500],
      ["03:00", 8, 6, 12, 14200],
      ["06:00", 56, 48, 64, 168000],
      ["09:00", 142, 124, 98, 412000],
      ["12:00", 168, 152, 108, 524000],
      ["15:00", 224, 198, 126, 678000],
      ["18:00", 312, 284, 142, 924000],
      ["21:00", 188, 168, 88, 542000],
    ],
  }),
  "driver-performance": () => ({
    title: "Driver Performance Report",
    subtitle: "Acceptance, completion, rating per driver",
    headers: ["Driver", "Vehicle", "Trips", "Acceptance %", "Completion %", "Rating", "Earnings (RWF)"],
    rows: [
      ["Helen Niyibizi", "Cab Taxi", 432, 96, 98, 4.95, 1_544_400],
      ["Olivier Hakizimana", "Cab Taxi", 401, 94, 97, 4.93, 1_412_300],
      ["Joyce Habineza", "Moto Bike", 388, 92, 96, 4.91, 882_200],
      ["Aiden Mugisha", "Cab Taxi", 376, 94, 95, 4.89, 1_325_400],
      ["Patrick Nshimiyimana", "Light Hilux", 312, 88, 94, 4.87, 1_812_000],
      ["Roland Karangwa", "Moto Bike", 298, 90, 93, 4.86, 692_400],
      ["Beni Karenzi", "Moto Bike", 268, 88, 92, 4.78, 612_500],
      ["Claude Rwema", "Light Hilux", 244, 86, 91, 4.82, 1_412_000],
      ["Eric Nshuti", "Heavy Fuso", 142, 78, 92, 4.65, 2_412_000],
      ["Diane Uwase", "Cab Taxi", 232, 84, 90, 4.74, 798_400],
    ],
  }),
  "revenue-breakdown": () => ({
    title: "Revenue Breakdown",
    subtitle: "Earnings, commission, payouts split by vehicle category",
    headers: ["Vehicle Category", "Trips", "Gross Revenue (RWF)", "Commission (RWF)", "Driver Payouts (RWF)", "Avg Fare (RWF)"],
    rows: [
      ["Cab Taxi", 19_954, 58_652_000, 7_038_240, 51_613_760, 2940],
      ["Moto Bike", 6_758, 19_866_000, 2_383_920, 17_482_080, 2940],
      ["Light Hilux", 3_540, 10_406_000, 1_248_720, 9_157_280, 2940],
      ["Heavy Fuso", 1_932, 5_676_000, 681_120, 4_994_880, 2938],
      ["TOTAL", 32_184, 94_600_000, 11_352_000, 83_248_000, 2940],
    ],
  }),
  "negotiation-stats": () => ({
    title: "Negotiation Statistics",
    subtitle: "Round counts, outcomes, fare uplift trends",
    headers: ["Outcome", "Count", "Avg Rounds", "Avg Initial (RWF)", "Avg Final (RWF)", "Avg Uplift %"],
    rows: [
      ["Agreed", 8_412, 3.2, 3_200, 3_780, 18.1],
      ["Failed", 1_840, 4.8, 2_900, 0, 0],
      ["Disputed", 124, 5.2, 8_200, 0, 0],
      ["In progress", 86, 1.8, 4_100, 0, 0],
    ],
  }),
  "customer-cohort": () => ({
    title: "Customer Cohort Retention",
    subtitle: "Sign-up cohorts and 1/7/30-day return rates",
    headers: ["Cohort", "New Sign-ups", "Day 1 Return %", "Day 7 Return %", "Day 30 Return %", "Avg Trips / User"],
    rows: [
      ["Jan 2026", 412, 62, 38, 24, 4.8],
      ["Feb 2026", 524, 64, 41, 28, 5.2],
      ["Mar 2026", 612, 66, 43, 31, 5.4],
      ["Apr 2026", 740, 68, 45, 32, 5.1],
      ["May 2026", 884, 71, 48, 34, 4.9],
    ],
  }),
  "ride-completion": () => ({
    title: "Ride Completion Rate",
    subtitle: "Funnel from request to completed trip, per region",
    headers: ["District", "Requested", "Matched", "Agreed", "Completed", "Completion %"],
    rows: [
      ["Gasabo", 18_412, 17_492, 15_412, 15_140, 82.2],
      ["Nyarugenge", 12_140, 11_524, 10_124, 9_882, 81.4],
      ["Kicukiro", 7_760, 7_224, 6_914, 6_762, 87.1],
    ],
  }),
};

function getContent(templateId: string): ReportContent {
  const fn = generators[templateId];
  if (fn) return fn();
  return {
    title: "Report",
    subtitle: "Generated report",
    headers: ["Field", "Value"],
    rows: [
      ["Generated", new Date().toISOString()],
      ["Note", "Demo content"],
    ],
  };
}

function toCSV(content: ReportContent): string {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [content.headers.map(escape).join(",")];
  for (const row of content.rows) lines.push(row.map(escape).join(","));
  return lines.join("\n");
}

function toExcelHTML(content: ReportContent): string {
  const cell = (v: string | number, isHeader = false) => {
    const tag = isHeader ? "th" : "td";
    return `<${tag}>${String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</${tag}>`;
  };
  const headerRow = `<tr>${content.headers.map((h) => cell(h, true)).join("")}</tr>`;
  const bodyRows = content.rows
    .map((r) => `<tr>${r.map((v) => cell(v)).join("")}</tr>`)
    .join("");
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${content.title}</title></head><body><h2>${content.title}</h2><p>${content.subtitle}</p><table border="1">${headerRow}${bodyRows}</table></body></html>`;
}

function buildPDF(content: ReportContent): Uint8Array {
  const escapePdf = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const lines: string[] = [];
  lines.push(content.title);
  lines.push(content.subtitle);
  lines.push("");
  lines.push(content.headers.join(" | "));
  lines.push("-".repeat(80));
  for (const row of content.rows) {
    lines.push(row.map((v) => String(v)).join(" | "));
  }
  lines.push("");
  lines.push(`Generated ${new Date().toLocaleString()}`);

  let y = 760;
  const textOps = lines
    .map((line) => {
      const op = `BT /F1 ${line === content.title ? 16 : line === content.subtitle ? 11 : 9} Tf 50 ${y} Td (${escapePdf(line)}) Tj ET`;
      y -= line === content.title ? 24 : 14;
      return op;
    })
    .join("\n");

  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  objects.push(
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
  );
  const stream = textOps;
  objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  let pdf = "%PDF-1.3\n";
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

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadReport({
  templateId,
  format,
  filename,
}: {
  templateId: string;
  format: ReportFormat;
  filename: string;
}) {
  const content = getContent(templateId);

  if (format === "CSV") {
    const blob = new Blob([toCSV(content)], { type: "text/csv;charset=utf-8" });
    triggerDownload(blob, `${filename}.csv`);
    return;
  }

  if (format === "Excel") {
    const blob = new Blob([toExcelHTML(content)], {
      type: "application/vnd.ms-excel",
    });
    triggerDownload(blob, `${filename}.xls`);
    return;
  }

  // PDF
  const bytes = buildPDF(content);
  const blob = new Blob([bytes], { type: "application/pdf" });
  triggerDownload(blob, `${filename}.pdf`);
}
