"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { FileText, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, color: "#18181b", fontFamily: "Helvetica" },
  header: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 3, borderBottomColor: "#e11d48" },
  brand: { fontSize: 18, fontWeight: "bold", color: "#e11d48" },
  title: { fontSize: 14, fontWeight: "bold", marginTop: 4 },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", color: "#e11d48", marginBottom: 6, textTransform: "uppercase" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  muted: { color: "#71717a" },
  badge: { fontSize: 9 },
  table: { marginTop: 6 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e4e4e7", paddingVertical: 4 },
  tableCell: { flex: 1 },
});

function CareerReport({ data }: { data: ReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>JobMatch</Text>
          <Text style={styles.title}>Career Summary Report</Text>
          <Text style={styles.muted}>
            Dihasilkan: {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(data.generatedAt))}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil Kandidat</Text>
          <View style={styles.row}><Text style={styles.muted}>Nama</Text><Text>{data.name}</Text></View>
          <View style={styles.row}><Text style={styles.muted}>Email</Text><Text>{data.email}</Text></View>
          {data.major && <View style={styles.row}><Text style={styles.muted}>Jurusan</Text><Text>{data.major}</Text></View>}
          {data.institution && <View style={styles.row}><Text style={styles.muted}>Institusi</Text><Text>{data.institution}</Text></View>}
          {data.graduationYear && <View style={styles.row}><Text style={styles.muted}>Tahun Lulus</Text><Text>{data.graduationYear}</Text></View>}
          {data.gpa != null && <View style={styles.row}><Text style={styles.muted}>IPK</Text><Text>{data.gpa}</Text></View>}
          <View style={styles.row}><Text style={styles.muted}>Skor CV / ATS</Text><Text>{data.cvScore} / {data.atsScore}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keahlian (Skills)</Text>
          <Text>{data.skills.length ? data.skills.join(", ") : "Belum ada skill tercatat"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Rekomendasi Karir</Text>
          <View style={styles.table}>
            {data.recommendations.map((r) => (
              <View key={r.title} style={styles.tableRow}>
                <Text style={styles.tableCell}>{r.title}</Text>
                <Text style={styles.tableCell}>{r.industry}</Text>
                <Text style={styles.tableCell}>{r.match}% match</Text>
              </View>
            ))}
            {data.recommendations.length === 0 && <Text style={styles.muted}>Belum ada rekomendasi. Lengkapi profilmu.</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rencana Pengembangan Skill</Text>
          {data.recommendations.slice(0, 2).map((r) => (
            <Text key={r.title} style={{ marginBottom: 4 }}>
              • Untuk menjadi {r.title}, pelajari: {r.missing.slice(0, 3).join(", ") || "tidak ada skill kurang."}
            </Text>
          ))}
          {data.recommendations.length === 0 && <Text style={styles.muted}>Lengkapi profil untuk mendapatkan rencana.</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistik</Text>
          <View style={styles.row}><Text style={styles.muted}>Total Lamaran</Text><Text>{data.applicationCount}</Text></View>
          <View style={styles.row}><Text style={styles.muted}>Lowongan Tersimpan</Text><Text>{data.bookmarkCount}</Text></View>
        </View>
      </Page>
    </Document>
  );
}

type ReportData = {
  name: string;
  email: string;
  major: string | null;
  graduationYear: number | null;
  gpa: number | null;
  institution: string;
  headline: string | null;
  bio: string | null;
  skills: string[];
  cvScore: number;
  atsScore: number;
  recommendations: { title: string; industry: string; match: number; missing: string[] }[];
  applicationCount: number;
  bookmarkCount: number;
  applications: { id: string; status: string; job: { title: string; company: { name: string } } }[];
  generatedAt: Date;
};

export function CareerReportExport({ data }: { data: ReportData }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="btn-primary pointer-events-none opacity-60">
        <Loader2 className="h-4 w-4 animate-spin" />
        Menyiapkan PDF...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<CareerReport data={data} />}
      fileName={`Career-Report-${data.name.replace(/\s+/g, "-")}.pdf`}
      className="btn-primary inline-flex"
    >
      {({ loading }) => (
        <>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {loading ? "Menyiapkan..." : "Unduh Career Summary Report (PDF)"}
        </>
      )}
    </PDFDownloadLink>
  );
}
