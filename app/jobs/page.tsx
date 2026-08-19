import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { JobCard } from "@/components/jobs/job-card";
import { EmptyState } from "@/components/ui/empty-state";
import { apiFetch } from "@/lib/api";

const JOB_TYPES = [
  { value: "", label: "Semua Tipe" },
  { value: "INTERNSHIP", label: "Magang" },
  { value: "FULL_TIME", label: "Full-Time" },
  { value: "PART_TIME", label: "Part-Time" },
  { value: "PROJECT_BASED", label: "Project-Based" },
];

const JOB_MODES = [
  { value: "", label: "Semua Mode" },
  { value: "REMOTE", label: "Remote" },
  { value: "ONSITE", label: "Onsite" },
  { value: "HYBRID", label: "Hybrid" },
];

const MAJORS = [
  "Teknik Informatika",
  "Rekayasa Perangkat Lunak",
  "Desain Komunikasi Visual",
  "Statistika",
  "Akuntansi",
  "Manajemen",
  "Multimedia",
];

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string; mode?: string; major?: string; fresh?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const type = searchParams.type ?? "";
  const mode = searchParams.mode ?? "";
  const major = searchParams.major ?? "";
  const freshOnly = searchParams.fresh === "1";

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (type) params.set("type", type);
  if (mode) params.set("mode", mode);
  if (major) params.set("major", major);
  if (freshOnly) params.set("fresh", "1");
  const query = params.toString();

  const { data } = await apiFetch(`/jobs${query ? `?${query}` : ""}`);
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  const totalJobs = data?.totalJobs ?? jobs.length;

  return (
    <>
      <PublicHeader />
      <main className="min-h-[70vh] pb-20">
        <section className="border-b border-zinc-100 bg-gradient-to-b from-brand-50 to-white py-10">
          <div className="container-page">
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              Cari <span className="text-gradient">Lowongan & Magang</span>
            </h1>
            <p className="mt-2 text-zinc-600">Temukan kesempatan terbaik yang cocok dengan skill dan jurusanmu.</p>

            <form method="GET" className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-card">
                <Search className="ml-3 h-5 w-5 shrink-0 text-zinc-400" />
                <input
                  name="q"
                  defaultValue={q}
                  type="text"
                  placeholder="Cari posisi, perusahaan, atau skill..."
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
                <button type="submit" className="btn-primary shrink-0">
                  Cari
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filter:
                </span>
                <select name="type" defaultValue={type} className="input !w-auto !py-2 text-xs">
                  {JOB_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <select name="mode" defaultValue={mode} className="input !w-auto !py-2 text-xs">
                  {JOB_MODES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <select name="major" defaultValue={major} className="input !w-auto !py-2 text-xs">
                  <option value="">Semua Jurusan</option>
                  {MAJORS.map((mj) => (
                    <option key={mj} value={mj}>{mj}</option>
                  ))}
                </select>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600">
                  <input
                    type="checkbox"
                    name="fresh"
                    value="1"
                    defaultChecked={freshOnly}
                    className="h-4 w-4 accent-brand-600"
                  />
                  Khusus Fresh Graduate
                </label>
              </div>
            </form>
          </div>
        </section>

        <section className="container-page mt-8">
          <p className="mb-5 text-sm text-zinc-500">
            Menampilkan <span className="font-semibold text-zinc-800">{jobs.length}</span> dari {totalJobs} lowongan aktif
          </p>
          {jobs.length === 0 ? (
            <EmptyState
              title="Tidak ada lowongan ditemukan"
              description="Coba ubah kata kunci atau filter pencarianmu."
              action={
                <Link href="/jobs" className="btn-primary">Reset Filter</Link>
              }
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
