import Link from "next/link";
import { CheckCircle2, Download, FileText, GraduationCap } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { PlacementDonut, TracerStudyChart } from "@/components/institution/charts";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Tracer Study" };

export default async function TracerStudyPage() {
  const user = await getCurrentUser();
  if (!user || !user.institutionId) return null;

  const { data } = await serverApi("/institution/tracer-study");
  const records = Array.isArray(data?.records) ? data.records : [];
  const applications = Array.isArray(data?.applications) ? data.applications : [];

  const latest = records[records.length - 1];
  const donutData = latest
    ? [
        { name: "Bekerja", value: latest.employed },
        { name: "Magang", value: latest.interned },
        { name: "Lanjut Studi", value: latest.continueStudy },
        { name: "Belum Bekerja", value: latest.unemployed },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Tracer Study</h1>
          <p className="mt-1 text-sm text-zinc-500">Rekapitulasi penyerapan lulusan dan aktivitas mahasiswa.</p>
        </div>
        <Link href="/api/reports/tracer-study" className="btn-primary">
          <Download className="h-4 w-4" />
          Ekspor PDF
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Total Lulusan" value={latest?.totalGraduates ?? 0} hint={`Tahun ${latest?.year ?? "—"}`} />
        <StatCard icon={CheckCircle2} label="Bekerja" value={latest?.employed ?? 0} accent="success" />
        <StatCard icon={FileText} label="Magang" value={latest?.interned ?? 0} accent="info" />
        <StatCard icon={GraduationCap} label="Lanjut Studi" value={latest?.continueStudy ?? 0} accent="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-bold">Distribusi Lulusan ({latest?.year ?? "—"})</h2>
          {donutData.length ? <PlacementDonut data={donutData} /> : <p className="py-12 text-center text-sm text-zinc-400">Belum ada data.</p>}
        </div>
        <div className="card p-6">
          <h2 className="mb-4 font-bold">Tren Tahunan</h2>
          <TracerStudyChart
            data={records.map((r) => ({ name: String(r.year), value: Math.round(((r.employed + r.interned) / r.totalGraduates) * 100) }))}
          />
          <p className="text-center text-xs text-zinc-400">Persentase penyerapan (bekerja + magang) per tahun</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 p-6">
          <h2 className="font-bold">Riwayat Tracer Study</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-400">
                <th className="px-6 py-3">Tahun</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Bekerja</th>
                <th className="px-6 py-3">Magang</th>
                <th className="px-6 py-3">Lanjut Studi</th>
                <th className="px-6 py-3">Belum Bekerja</th>
                <th className="px-6 py-3">Serapan</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-zinc-50">
                  <td className="px-6 py-3 font-semibold">{r.year}</td>
                  <td className="px-6 py-3">{r.totalGraduates}</td>
                  <td className="px-6 py-3 text-emerald-600">{r.employed}</td>
                  <td className="px-6 py-3 text-sky-600">{r.interned}</td>
                  <td className="px-6 py-3">{r.continueStudy}</td>
                  <td className="px-6 py-3 text-amber-600">{r.unemployed}</td>
                  <td className="px-6 py-3 font-semibold">
                    {r.totalGraduates > 0 ? Math.round(((r.employed + r.interned) / r.totalGraduates) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-bold">Aktivitas Mahasiswa Terkini</h2>
        <div className="space-y-2">
          {applications.slice(0, 8).map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border border-zinc-100 p-3.5">
              <div>
                <p className="text-sm font-semibold text-zinc-800">{a.user.name}</p>
                <p className="text-xs text-zinc-500">{a.job.title} · {a.job.company.name}</p>
              </div>
              <span className="text-xs text-zinc-400">{formatDate(a.createdAt)}</span>
            </div>
          ))}
          {applications.length === 0 && <p className="py-8 text-center text-sm text-zinc-400">Belum ada aktivitas lamaran.</p>}
        </div>
      </div>
    </div>
  );
}
