import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { GeneratedReport } from "./report-content";

const BRAND_BLUE = "#0b5fb8";
const BRAND_BLUE_DARK = "#07305c";
const INK = "#1c2733";
const MUTED = "#6b7685";
const BORDER = "#dbe2ea";
const ROW_ALT = "#f4f7fb";

const GOOD = "#0f8a3c";
const WARN = "#b8720b";
const BAD = "#c32b2b";

function statusTone(value: string): string | null {
  const v = value.trim().toUpperCase();
  if (["COMPLETED", "APPROVED", "ACTIVE", "AGREED", "SETTLED"].some((k) => v.includes(k))) return GOOD;
  if (["PENDING", "IN PROGRESS", "WARNING"].some((k) => v.includes(k))) return WARN;
  if (["REJECTED", "FAILED", "CANCELLED", "SUSPENDED", "DISPUTED", "HIGH"].some((k) => v.includes(k))) return BAD;
  return null;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontSize: 9,
    color: INK,
    fontFamily: "Helvetica",
  },
  watermark: {
    position: "absolute",
    top: 385,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 64,
    fontWeight: 700,
    color: BRAND_BLUE,
    opacity: 0.06,
    letterSpacing: 4,
    transform: "rotate(-45deg)",
    transformOrigin: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  logo: { width: 26, height: 26 },
  brandName: { fontSize: 15, fontWeight: 700, color: BRAND_BLUE },
  eyebrow: { fontSize: 6.5, fontWeight: 700, color: MUTED, letterSpacing: 0.6 },
  headerCenter: { flex: 2, paddingHorizontal: 10 },
  titleValue: { fontSize: 12.5, fontWeight: 700, color: INK, marginTop: 1, marginBottom: 6 },
  descValue: { fontSize: 8, color: MUTED, marginTop: 1 },
  periodBox: { flex: 1, alignItems: "flex-end" },
  periodGroup: { alignItems: "flex-end", marginBottom: 6 },
  periodValue: { fontSize: 9.5, fontWeight: 700, color: INK, marginTop: 1 },
  divider: { borderBottomWidth: 2, borderBottomColor: BRAND_BLUE, marginBottom: 16 },

  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: INK,
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  filtersRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  filterPill: {
    fontSize: 7.5,
    fontWeight: 700,
    color: BRAND_BLUE,
    backgroundColor: "#eaf2fc",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
  },

  table: { borderWidth: 1, borderColor: BORDER, borderRadius: 3, overflow: "hidden" },
  tHeadRow: { flexDirection: "row", backgroundColor: BRAND_BLUE_DARK },
  tHeadCell: {
    flex: 1,
    padding: 6,
    fontSize: 7.5,
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  tHeadCellIndex: {
    flex: 0.3,
    padding: 6,
    fontSize: 7.5,
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  tRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: BORDER },
  tRowAlt: { backgroundColor: ROW_ALT },
  tCell: { flex: 1, padding: 6, fontSize: 8, color: INK },
  tCellBold: { flex: 1, padding: 6, fontSize: 8, fontWeight: 700 },
  tCellIndex: { flex: 0.3, padding: 6, fontSize: 8, color: MUTED },
  emptyRow: { padding: 12, fontSize: 9, color: MUTED, textAlign: "center" },

  signBlock: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    marginTop: 28,
  },
  signCol: { flex: 1, padding: 18 },
  signColDivider: { borderRightWidth: 1, borderRightColor: BORDER },
  signTop: { alignItems: "center" },
  signHeading: { fontSize: 9, fontWeight: 700, color: BRAND_BLUE, marginBottom: 28, letterSpacing: 0.5 },
  signLine: { borderBottomWidth: 1, borderBottomColor: INK, width: "100%", marginBottom: 6 },
  signCaption: { fontSize: 7.5, color: MUTED, marginBottom: 16 },
  signFields: { marginTop: 2 },
  signFieldRow: { fontSize: 8.5, color: INK, marginBottom: 8 },
  signFieldLabel: { color: MUTED },

  footer: {
    position: "absolute",
    bottom: 16,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: MUTED, textAlign: "center" },
  pageNumber: { fontSize: 9, fontWeight: 700, color: INK, textAlign: "center", marginTop: 8 },
});

function formatCell(cell: string | number): string {
  return typeof cell === "number" ? cell.toLocaleString("en-US") : cell;
}

export type ReportPdfMeta = {
  logoSrc?: string;
  generatedByName?: string;
  generatedByEmail?: string;
  generatedByRole?: string;
};

const BLANK = "______________________";

export function ReportPdfDocument({ report, meta }: { report: GeneratedReport; meta: ReportPdfMeta }) {
  const generatedAt = report.generatedAt ? new Date(report.generatedAt) : new Date();
  const generatedAtDisplay = generatedAt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  const preparedDate = generatedAt.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
  const year = generatedAt.getFullYear();
  const generatedByLine = meta.generatedByName
    ? `Generated by: ${meta.generatedByName}${meta.generatedByEmail ? ` (${meta.generatedByEmail})` : ""} | `
    : "";

  return (
    <Document title={report.title}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark} fixed>
          RIDES.RW
        </Text>

        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {meta.logoSrc ? <Image src={meta.logoSrc} style={styles.logo} /> : null}
            <Text style={styles.brandName}>ides.rw</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.eyebrow}>REPORT TITLE</Text>
            <Text style={styles.titleValue}>{report.title}</Text>
            {report.subtitle ? (
              <>
                <Text style={styles.eyebrow}>DESCRIPTION</Text>
                <Text style={styles.descValue}>{report.subtitle}</Text>
              </>
            ) : null}
          </View>
          <View style={styles.periodBox}>
            <View style={styles.periodGroup}>
              <Text style={styles.eyebrow}>PERIOD</Text>
              <Text style={styles.periodValue}>{report.periodPhrase}</Text>
            </View>
            <View>
              <Text style={styles.eyebrow}>TIME</Text>
              <Text style={styles.periodValue}>{report.dateRangeLabel}</Text>
            </View>
          </View>
        </View>
        <View style={styles.divider} />

        {report.filtersApplied && report.filtersApplied.length > 0 ? (
          <View style={styles.filtersRow}>
            {report.filtersApplied.map((f, i) => (
              <Text key={i} style={styles.filterPill}>
                {f.label}: {f.value}
              </Text>
            ))}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>REPORT DETAIL{report.periodLabel ? ` — ${report.periodLabel.toUpperCase()}` : ""}</Text>

        <View style={styles.table} wrap>
          <View style={styles.tHeadRow} fixed>
            <Text style={styles.tHeadCellIndex}>#</Text>
            {report.headers.map((h, i) => (
              <Text key={i} style={styles.tHeadCell}>
                {h}
              </Text>
            ))}
          </View>
          {report.rows.length === 0 ? (
            <Text style={styles.emptyRow}>No data available for this report.</Text>
          ) : (
            report.rows.map((row, ri) => (
              <View key={ri} style={ri % 2 === 1 ? [styles.tRow, styles.tRowAlt] : styles.tRow} wrap={false}>
                <Text style={styles.tCellIndex}>{ri + 1}</Text>
                {row.map((cell, ci) => {
                  const text = formatCell(cell);
                  const tone = statusTone(text);
                  return (
                    <Text
                      key={ci}
                      style={tone ? [styles.tCellBold, { color: tone }] : styles.tCell}
                    >
                      {text}
                    </Text>
                  );
                })}
              </View>
            ))
          )}
        </View>

        <View style={styles.signBlock}>
          <View style={[styles.signCol, styles.signColDivider]}>
            <View style={styles.signTop}>
              <Text style={styles.signHeading}>PREPARED BY</Text>
              <View style={styles.signLine} />
              <Text style={styles.signCaption}>Signature</Text>
            </View>
            <View style={styles.signFields}>
              <Text style={styles.signFieldRow}>
                <Text style={styles.signFieldLabel}>Names: </Text>
                {meta.generatedByName || BLANK}
              </Text>
              <Text style={styles.signFieldRow}>
                <Text style={styles.signFieldLabel}>Role: </Text>
                {meta.generatedByRole || BLANK}
              </Text>
              <Text style={styles.signFieldRow}>
                <Text style={styles.signFieldLabel}>Date: </Text>
                {preparedDate}
              </Text>
            </View>
          </View>
          <View style={styles.signCol}>
            <View style={styles.signTop}>
              <Text style={styles.signHeading}>APPROVED BY</Text>
              <View style={styles.signLine} />
              <Text style={styles.signCaption}>Signature</Text>
            </View>
            <View style={styles.signFields}>
              <Text style={styles.signFieldRow}>
                <Text style={styles.signFieldLabel}>Names: </Text>
                {BLANK}
              </Text>
              <Text style={styles.signFieldRow}>
                <Text style={styles.signFieldLabel}>Role: </Text>
                {BLANK}
              </Text>
              <Text style={styles.signFieldRow}>
                <Text style={styles.signFieldLabel}>Date: </Text>
                {BLANK}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {generatedByLine}Generated on: {generatedAtDisplay} | © {year} Rides.rw.
          </Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
