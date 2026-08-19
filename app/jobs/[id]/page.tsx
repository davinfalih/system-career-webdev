import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Badge } from "@/components/ui/badge";
import { JobActions } from "@/components/jobs/job-actions";
import { JobCard } from "@/components/jobs/job-card";
import { MatchRing } from "@/components/ui/progress";
import { serverApi } from "@/lib/api";

const TYPE_LABELS: Record<string, string> = {
  INTERNSHIP: "Magang",
  FULL_TIME: "Full-Time",
  PART_TIME: "Part-Time",
  PROJECT_BASED: "Project-Based",
};

const MODE_LABELS: Record<string, string> = {
  REMOTE: "Remote",
  ONSITE: "Onsite",
  HYBRID: "Hybrid",
};

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const { data } = await serverApi(`/jobs/${params.id}`);

  const job = data?.job;

  if (!job || job.status !== "OPEN") notFound();

  const mustHave = job.mustHaveSkills ?? [];
  const niceHave = job.niceToHaveSkills ?? [];

  const matchScore = data?.matchScore;
  const alreadyApplied = data?.applied;
  const bookmarked = data?.bookmarked;
  const similar = Array.isArray(data?.similar) ? data.similar : [];

  return (
    <>
      <PublicHeader />
      <main className="pb-20">
        <section className="border-b border-zinc-100 bg-gradient-to-b from-brand-50 to-white">
          <div className="container-page py-10">
            <Link href="/jobs" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              ← Kembali ke daftar lowongan
            </Link>

            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-5">
                <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-card sm:flex">
                  <Building2 className="h-8 w-8 text-brand-600" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-extrabold sm:text-4xl">{job.title}</h1>
                    {job.forFreshGrads && <Badge variant="success">Fresh Grad</Badge>}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-600">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-brand-500" />
                      {job.company.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-brand-500" />
                      {job.location ?? "Remote"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-brand-500" />
                      {MODE_LABELS[job.mode]}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-brand-500" />
                      {TYPE_LABELS[job.type]}
                    </span>
                    {job.deadline && (
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-brand-500" />
                        Batas: {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(job.deadline))}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col items-center gap-4 lg:w-64">
                {matchScore != null && (
                  <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-4 shadow-card">
                    <MatchRing value={matchScore} size={72} />
                    <div>
                      <p className="text-sm font-bold">Kecocokanmu</p>
                      <p className="text-xs text-zinc-500">dengan lowongan ini</p>
                    </div>
                  </div>
                )}
                <JobActions
                  jobId={job.id}
                  alreadyApplied={alreadyApplied}
                  matchScore={matchScore}
                  bookmarked={bookmarked}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="container-page mt-10 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="card p-7">
              <h2 className="text-lg font-bold">Deskripsi Pekerjaan</h2>
              <div className="mt-4 space-y-2 whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                {job.description}
              </div>
            </div>

            <div className="card p-7">
              <h2 className="text-lg font-bold">Kualifikasi</h2>
              <div className="mt-5 space-y-6">
                <div>
                  <p className="mb-3 text-sm font-semibold text-zinc-500">Skill Wajib (Must-Have)</p>
                  <div className="flex flex-wrap gap-2">
                    {mustHave.map((s) => (
                      <span key={s} className="badge bg-brand-600 text-white">
                        <CheckCircle2 className="h-3 w-3" />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-semibold text-zinc-500">Nilai Plus (Nice-To-Have)</p>
                  <div className="flex flex-wrap gap-2">
                    {niceHave.map((s) => (
                      <span key={s} className="badge bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                {(job.majorRequired || job.minGpa) && (
                  <div className="grid gap-4 rounded-xl bg-zinc-50 p-4 sm:grid-cols-2">
                    {job.majorRequired && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Jurusan</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-800">{job.majorRequired}</p>
                      </div>
                    )}
                    {job.minGpa && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">IPK / Nilai Minimal</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-800">{job.minGpa}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="card p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Informasi</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Gaji</dt>
                  <dd className="font-semibold text-brand-600">{job.salary ?? "Dibicarakan"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Pelamar</dt>
                  <dd className="flex items-center gap-1 font-semibold text-zinc-800">
                    <Users className="h-4 w-4 text-zinc-400" />
                    {job._count.applications}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Tipe</dt>
                  <dd className="font-semibold text-zinc-800">{TYPE_LABELS[job.type]}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Mode</dt>
                  <dd className="font-semibold text-zinc-800">{MODE_LABELS[job.mode]}</dd>
                </div>
              </dl>
              <Link href="/jobs" className="btn-secondary mt-5 w-full">
                <Sparkles className="h-4 w-4" />
                Temukan Lowongan Lain
              </Link>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-rose-600 p-6 text-white shadow-card-hover">
              <h3 className="font-bold">Cocok dengan lowongan ini?</h3>
              <p className="mt-2 text-sm text-white/90">
                Perbarui profil dan skill-mu di dashboard untuk mendapatkan rekomendasi yang lebih akurat.
              </p>
              <Link href="/register" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-700">
                Lengkapi Profil
              </Link>
            </div>
          </aside>
        </section>

        {similar.length > 0 && (
          <section className="container-page mt-16">
            <h2 className="text-xl font-bold">Lowongan Serupa</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {similar.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          </section>
        )}
      </main>
      <PublicFooter />
    </>
  );
}
