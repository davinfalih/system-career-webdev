import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { TracerStudyChart } from "@/components/institution/charts";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Portal Institusi" };

export default async function InstitutionDashboardPage() {
  const user = await getCurrentUser();
  if (!user || !user.institutionId) return null;

  const { data } = await serverApi("/institution/stats");
  const records = Array.isArray(data?.records) ? data.records : [];
  const students = Array.isArray(data?.students) ? data.students : [];
  const applications = Array.isArray(data?.applications) ? data.applications : [];
  const topSkills = Array.isArray(data?.topSkills) ? data.topSkills : [];

  const latest = records[records.length - 1];
  const employmentRate = latest && latest.totalGraduates > 0
    ? Math.round(((latest.employed + latest.interned) / latest.totalGraduates) * 100)
    : 0;

  const acceptedApplications = applications.filter((a) => a.status === "ACCEPTED").length;
  const unverifiedStudents = students.filter((s) => !s.verified).length;

  const skillUsage = new Map<string, number>();
  for (const student of students) {
    try {
      const arr = JSON.parse(student.profile?.skills ?? "[]") as string[];
      arr.forEach((s) => skillUsage.set(s, (skillUsage.get(s) ?? 0) + 1));
    } catch {
      /* ignore */
    }
  }
  const studentSkillData = Array.from(skillUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{user.institution?.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Pantau penyerapan lulusan dan perkembangan mahasiswa-mu.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/institution/verification" className="btn-primary">
            <ShieldCheck className="h-4 w-4" />
            Verifikasi Mahasiswa
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Mahasiswa Terdaftar" value={students.length} hint={`${unverifiedStudents} belum diverifikasi`} accent="info" />
        <StatCard icon={Briefcase} label="Tingkat Serapan" value={`${employmentRate}%`} hint={latest ? `Tahun ${latest.year}` : "Belum ada data"} accent="success" />
        <StatCard icon={UserCheck} label="Diterima Bekerja/Magang" value={acceptedApplications} hint="Via platform" />
        <StatCard icon={Users} label="Total Lamaran" value={applications.length} hint="Oleh mahasiswa-mu" accent="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Tracer Study & Penyerapan</h2>
              <p className="text-sm text-zinc-500">Lulusan bekerja, magang, lanjut studi, dan belum bekerja</p>
            </div>
            <TrendingUp className="h-5 w-5 text-brand-500" />
          </div>
          {latest ? (
            <TracerStudyChart
              data={[
                { name: "Bekerja", value: latest.employed },
                { name: "Magang", value: latest.interned },
                { name: "Lanjut Studi", value: latest.continueStudy },
                { name: "Belum Bekerja", value: latest.unemployed },
              ]}
            />
          ) : (
            <p className="py-12 text-center text-sm text-zinc-400">Belum ada data tracer study.</p>
          )}
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Skill Mahasiswa Teratas</h2>
              <p className="text-sm text-zinc-500">Berdasarkan profil & lamaran mahasiswa</p>
            </div>
            <Sparkles className="h-5 w-5 text-brand-500" />
          </div>
          {studentSkillData.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-400">Belum ada data skill.</p>
          ) : (
            <div className="space-y-3">
              {studentSkillData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="w-6 text-sm font-bold text-zinc-400">{i + 1}</span>
                  <span className="w-36 truncate text-sm font-medium text-zinc-700">{s.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-rose-500"
                      style={{ width: `${Math.min(100, (s.value / (studentSkillData[0]?.value || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-zinc-500">{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Statistik Mahasiswa</h2>
            <Link href="/institution/verification" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Lihat semua</Link>
          </div>
          <div className="space-y-2">
            {students.slice(0, 8).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-zinc-100 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-rose-600 text-xs font-bold text-white">
                    {s.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">{s.name}</p>
                    <p className="text-xs text-zinc-500">{s.major ?? "—"} {s.gpa ? `· IPK ${s.gpa}` : ""}</p>
                  </div>
                </div>
                {s.verified ? (
                  <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Terverifikasi</Badge>
                ) : (
                  <Badge variant="warning">Menunggu</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Skill Paling Diminati</h2>
              <p className="text-sm text-zinc-500">Dari data industri</p>
            </div>
            <Sparkles className="h-5 w-5 text-brand-500" />
          </div>
          <div className="space-y-2">
            {topSkills.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3.5 py-2.5">
                <span className="text-sm font-medium text-zinc-700">{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">{s.demand}%</span>
                  {i < 3 && <Badge>Top</Badge>}
                </div>
              </div>
            ))}
          </div>
          <Link href="/institution/skills" className="btn-secondary mt-4 w-full">Detail</Link>
        </div>
      </div>
    </div>
  );
}
