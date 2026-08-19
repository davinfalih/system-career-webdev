import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { SkillTrendChart } from "@/components/dashboard/charts";

export const metadata = { title: "Top Skills Industri" };

export default async function InstitutionSkillsPage() {
  const user = await getCurrentUser();
  if (!user || !user.institutionId) return null;

  const { data } = await serverApi("/institution/skills");
  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];

  const topSkills = skills.slice(0, 10);

  const trendData = [
    { name: "2023", user: 45, industry: 55 },
    { name: "2024", user: 58, industry: 68 },
    { name: "2025", user: 70, industry: 80 },
    { name: "2026", user: 82, industry: 88 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Top Skills Industri</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Skill yang paling diminati industri berdasarkan data lowongan dan tren aplikasi mahasiswa.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Peringkat Demand Skill</h2>
              <p className="text-sm text-zinc-500">Diurutkan dari kebutuhan pasar kerja</p>
            </div>
            <TrendingUp className="h-5 w-5 text-brand-500" />
          </div>
          <div className="space-y-3">
            {topSkills.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="flex w-7 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-600">
                  {i + 1}
                </span>
                <span className="w-40 truncate text-sm font-medium text-zinc-700">{s.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-rose-500"
                    style={{ width: `${s.demand}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-semibold text-zinc-500">{s.demand}%</span>
                <Badge variant={s.category === "HARD" ? "default" : "info"}>{s.category === "HARD" ? "Hard" : "Soft"}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Tren Kebutuhan Skill</h2>
                <p className="text-sm text-zinc-500">Kecocokan skill mahasiswa vs kebutuhan industri</p>
              </div>
              <Sparkles className="h-5 w-5 text-brand-500" />
            </div>
            <SkillTrendChart data={trendData} />
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-bold">Rekomendasi untuk Institusi</h2>
            <ul className="space-y-3 text-sm text-zinc-600">
              <li className="flex gap-2">
                <Badge variant="default">1</Badge>
                Tambahkan kurikulum untuk skill populer seperti <strong>{topSkills[0]?.name ?? "—"}</strong> dan <strong>{topSkills[1]?.name ?? "—"}</strong>.
              </li>
              <li className="flex gap-2">
                <Badge variant="default">2</Badge>
                Dorong mahasiswa untuk mengisi profil & skill di platform agar data tracer study lebih akurat.
              </li>
              <li className="flex gap-2">
                <Badge variant="default">3</Badge>
                Jalin kerja sama dengan perusahaan yang membuka lowongan di skill tersebut.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-zinc-100 p-6">
          <h2 className="font-bold">Open Job yang Paling Diminati</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-400">
                <th className="px-6 py-3">Lowongan</th>
                <th className="px-6 py-3">Perusahaan</th>
                <th className="px-6 py-3">Tipe</th>
                <th className="px-6 py-3">Pelamar</th>
              </tr>
            </thead>
            <tbody>
              {jobs
                .slice()
                .sort((a, b) => b._count.applications - a._count.applications)
                .slice(0, 8)
                .map((j) => (
                  <tr key={j.id} className="border-b border-zinc-50">
                    <td className="px-6 py-3 font-semibold text-zinc-800">{j.title}</td>
                    <td className="px-6 py-3 text-zinc-600">{j.company.name}</td>
                    <td className="px-6 py-3">
                      <Badge variant={j.type === "INTERNSHIP" ? "success" : "default"}>
                        {j.type === "INTERNSHIP" ? "Magang" : j.type === "FULL_TIME" ? "Full-Time" : j.type === "PART_TIME" ? "Part-Time" : "Project"}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 font-semibold">{j._count.applications}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="p-6">
          <Link href="/jobs" className="btn-secondary">Jelajahi Semua Lowongan</Link>
        </div>
      </div>
    </div>
  );
}
