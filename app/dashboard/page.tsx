import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Crown,
  FileText,
  GraduationCap,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  UserCircle,
} from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { apiFetch, serverApi } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { Progress, MatchRing } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SkillTrendChart, ApplicationsChart } from "@/components/dashboard/charts";
import { recommendCareers } from "@/lib/ai/recommend";
import { computeJobMatch } from "@/lib/ai/jobMatch";

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Terkirim",
  UNDER_REVIEW: "Ditinjau",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  ACCEPTED: "Diterima",
  REJECTED: "Ditolak",
};

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "info",
  UNDER_REVIEW: "warning",
  SCREENING: "warning",
  INTERVIEW: "info",
  ACCEPTED: "success",
  REJECTED: "danger",
};

export const metadata = { title: "Dashboard" };

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user || !user.profile) {
    return (
      <EmptyState
        title="Lengkapi Profilmu Dulu"
        description="Buat profil, unggah CV, atau isi data dirimu agar AI bisa memberikan rekomendasi."
        action={<Link href="/dashboard/profile" className="btn-primary">Mulai Lengkapi Profil</Link>}
      />
    );
  }

  const profile = user.profile;

  const { data: appsData } = await serverApi("/applications/my");
  const applications = Array.isArray(appsData?.applications) ? appsData.applications : [];
  const { data: bookmarksData } = await serverApi("/bookmarks/my");
  const bookmarks = Array.isArray(bookmarksData?.bookmarks) ? bookmarksData.bookmarks : [];
  const { data: jobsData } = await apiFetch("/jobs");
  const allJobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : [];

  let userSkills: string[] = [];
  try {
    userSkills = JSON.parse(profile.skills ?? "[]");
  } catch {
    userSkills = [];
  }

  const recommendations = recommendCareers(userSkills);
  const topRole = recommendations[0];

  const rankedJobs = allJobs
    .map((job) => ({ ...job, match: computeJobMatch(userSkills, job) }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 4);

  const statusCounts: Record<string, number> = {};
  applications.forEach((a) => {
    statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1;
  });

  const appChartData = [
    { name: "Submitted", value: statusCounts.SUBMITTED ?? 0 },
    { name: "Review", value: (statusCounts.UNDER_REVIEW ?? 0) + (statusCounts.SCREENING ?? 0) },
    { name: "Interview", value: statusCounts.INTERVIEW ?? 0 },
    { name: "Diterima", value: statusCounts.ACCEPTED ?? 0 },
  ];

  const trendData = [
    { name: "2023", user: Math.min(95, (profile.cvScore ?? 0) - 25), industry: 55 },
    { name: "2024", user: Math.min(95, (profile.cvScore ?? 0) - 10), industry: 68 },
    { name: "2025", user: Math.min(95, profile.cvScore ?? 0), industry: 80 },
    { name: "2026", user: Math.min(97, (profile.cvScore ?? 0) + 5), industry: 88 },
  ];

  const profileCompleteness = Math.min(
    100,
    20 +
      (profile.headline ? 10 : 0) +
      (profile.bio ? 10 : 0) +
      (profile.skills ? 20 : 0) +
      (profile.education ? 15 : 0) +
      (profile.experiences ? 15 : 0) +
      (profile.projects ? 10 : 0)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            Halo, {user.name.split(" ")[0]}! 
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Siap meningkatkan kariermu hari ini? Berikut ringkasan progresmu.
          </p>
        </div>
        <Link href="/jobs" className="btn-primary">
          Cari Lowongan
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={UserCircle} label="Kelengkapan Profil" value={`${profileCompleteness}%`} hint="Lengkapi untuk skor lebih tinggi" />
        <StatCard icon={FileText} label="Skor CV" value={`${profile.cvScore ?? 0}`} hint="0 - 100" accent="success" />
        <StatCard icon={Send} label="Total Lamaran" value={applications.length} hint={`${statusCounts.ACCEPTED ?? 0} diterima`} accent="info" />
        <StatCard icon={Bookmark} label="Lowongan Tersimpan" value={bookmarks.length} hint="Simpan yang menarik" accent="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Kecocokan Skill dengan Industri</h2>
                <p className="text-sm text-zinc-500">Perkembangan skill-mu dibanding kebutuhan industri</p>
              </div>
              <TrendingUp className="h-5 w-5 text-brand-500" />
            </div>
            <SkillTrendChart data={trendData} />
          </div>

          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Status Lamaran</h2>
                <p className="text-sm text-zinc-500">Ringkasan semua lamaran yang telah kamu kirim</p>
              </div>
              <Send className="h-5 w-5 text-brand-500" />
            </div>
            {applications.length === 0 ? (
              <EmptyState
                title="Belum ada lamaran"
                description="Mulai lamar lowongan yang cocok denganmu."
                action={<Link href="/jobs" className="btn-primary">Jelajahi Lowongan</Link>}
              />
            ) : (
              <ApplicationsChart data={appChartData} />
            )}
          </div>

          {/* Recent applications */}
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Lamaran Terbaru</h2>
              <Link href="/dashboard/applications" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                Lihat semua
              </Link>
            </div>
            {applications.length === 0 ? (
              <p className="text-sm text-zinc-500">Belum ada lamaran.</p>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-800">{a.job.title}</p>
                      <p className="text-xs text-zinc-500">{a.job.company.name}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {a.matchScore != null && <span className="text-xs font-semibold text-brand-600">{a.matchScore}%</span>}
                      <Badge variant={(STATUS_COLORS[a.status] as "info") ?? "neutral"}>{STATUS_LABELS[a.status] ?? a.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Match ring */}
          <div className="card p-6 text-center">
            <h2 className="mb-4 font-bold">Top Rekomendasi Karir</h2>
            {topRole ? (
              <>
                <div className="flex justify-center">
                  <MatchRing value={topRole.match} size={120} />
                </div>
                <p className="mt-3 text-lg font-bold text-zinc-900">{topRole.title}</p>
                <p className="text-xs text-zinc-500">{topRole.industry}</p>
                <Link href="/dashboard/recommendations" className="btn-secondary mt-4 w-full">
                  <Sparkles className="h-4 w-4" />
                  Lihat Semua Rekomendasi
                </Link>
              </>
            ) : (
              <p className="py-8 text-sm text-zinc-500">
                Tambahkan skill di profilmu untuk mendapatkan rekomendasi karir.
              </p>
            )}
          </div>

          {/* CV score */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Skor CV-mu</h2>
              <FileText className="h-5 w-5 text-brand-500" />
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-zinc-500">ATS Score</span>
                <span className="font-bold">{profile.atsScore ?? 0}/100</span>
              </div>
              <Progress value={profile.atsScore ?? 0} />
            </div>
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-zinc-500">CV Score</span>
                <span className="font-bold">{profile.cvScore ?? 0}/100</span>
              </div>
              <Progress value={profile.cvScore ?? 0} color="bg-emerald-500" />
            </div>
            <Link href="/dashboard/profile" className="btn-secondary mt-4 w-full">
              <Target className="h-4 w-4" />
              Perbaiki CV-mu
            </Link>
          </div>

          {/* Top matched jobs */}
          <div className="card p-6">
            <h2 className="mb-4 font-bold">Lowongan Paling Cocok</h2>
            <div className="space-y-3">
              {rankedJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-zinc-100 p-3.5 transition hover:border-brand-200 hover:bg-brand-50/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-800">{job.title}</p>
                    <p className="truncate text-xs text-zinc-500">{job.company.name}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600">
                    {job.match}%
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {user.verified && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Status mahasiswa terverifikasi
            </div>
          )}

          {/* Pricing info */}
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-xl bg-brand-50 p-2 text-brand-600">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold">Paket Aktif</h3>
                <p className="text-xs text-zinc-500">Pelajar</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-zinc-50 p-4">
              <p className="text-sm font-semibold text-zinc-900">Gratis</p>
              <p className="mt-1 text-xs text-zinc-500">Profil & CV dasar, AI rekomendasi, apply tanpa batas</p>
            </div>
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-800">Upgrade untuk Perusahaan</p>
              </div>
              <p className="mt-1 text-xs text-amber-700">Posting lowongan, ATS & match score, analitik pelamar</p>
              <p className="mt-1 text-xs font-bold text-amber-800">Rp 299rb/bln</p>
            </div>
            <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-sky-600" />
                <p className="text-xs font-semibold text-sky-800">Upgrade untuk Institusi</p>
              </div>
              <p className="mt-1 text-xs text-sky-700">Verifikasi mahasiswa, tracer study, laporan PDF</p>
              <p className="mt-1 text-xs font-bold text-sky-800">Rp 99rb/bln</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
