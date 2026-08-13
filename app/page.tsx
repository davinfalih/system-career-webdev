import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  FileSearch,
  GraduationCap,
  Mail,
  MapPin,
  Rocket,
  Search,
  Sparkles,
  Star,
  Target,
  Upload,
  UserPlus,
  Zap,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { apiFetch } from "@/lib/api";
import { JobCard } from "@/components/jobs/job-card";

const FEATURES = [
  {
    icon: FileSearch,
    title: "Analisis CV Berbasis AI",
    description:
      "Unggah CV-mu dalam format PDF. AI kami membaca, mengekstrak skill, pengalaman, dan proyek secara otomatis, lalu memberikannya skor ATS beserta saran perbaikan.",
    points: ["Ekstraksi skill otomatis", "Skor ATS & saran perbaikan", "Review hasil AI"],
  },
  {
    icon: Target,
    title: "Rekomendasi Karir & Magang",
    description:
      "AI memetakan skill-mu ke berbagai peran industri dan menghitung persentase kecocokan. Ketahui skill apa yang masih kurang untuk mencapai posisi impianmu.",
    points: ["Skill gap analysis", "Match percentage", "Prioritas untuk fresh grad"],
  },
  {
    icon: Zap,
    title: "ATS Builder & Tracking",
    description:
      "Bangun CV berstandar ATS langkah demi langkah, lamar dengan satu klik, dan pantau status lamaranmu secara real-time.",
    points: ["One-click apply", "Status tracker real-time", "Bookmark & alert"],
  },
];

const STEPS = [
  {
    icon: UserPlus,
    title: "Daftar & Lengkapi Profil",
    description:
      "Daftar dengan Google/LinkedIn atau email, lalu pilih kampus/sekolah, jurusan, dan tahun lulus. Verifikasi NIM/NISN-mu.",
  },
  {
    icon: Upload,
    title: "Unggah CV atau Isi Builder",
    description:
      "Unggah CV PDF untuk dianalisis AI, atau isi formulir terbimbing jika belum punya CV. Hasilnya menjadi CV berstandar ATS.",
  },
  {
    icon: Sparkles,
    title: "Dapatkan Rekomendasi AI",
    description:
      "AI mencocokkan skill-mu dengan lowongan magang & kerja entry level. Lihat persentase match dan skill yang perlu ditingkatkan.",
  },
  {
    icon: Rocket,
    title: "Lamar & Pantau Status",
    description:
      "Lamar dengan satu klik, terima notifikasi setiap perubahan status, dan jadwalkan wawancara lewat platform.",
  },
];

async function getData() {
  const { data } = await apiFetch("/home");

  return {
    companies: data.companies,
    institutions: data.institutions,
    jobs: data.recentJobs,
    testimonials: [
      { name: "Rina Maharani", role: "Lulusan SMK, sekarang UI/UX Designer", text: "Berkat analisis CV AI-nya, aku tahu skill apa yang kurang dan akhirnya diterima magang di agency impianku!", initials: "RM" },
      { name: "Dimas Prasetyo", role: "Mahasiswa Teknik Informatika", text: "Match score-nya akurat banget. Dalam 2 minggu aku sudah dapat 3 undangan wawancara dari rekomendasi platform ini.", initials: "DP" },
      { name: "Maya Anggraini", role: "Fresh Graduate Statistika", text: "Fitur skill gap-nya membantuku belajar SQL untuk jadi Data Analyst. Sekarang aku kerja di perusahaan konsultan data.", initials: "MA" },
    ],
  };
}

export default async function HomePage() {
  const { companies, institutions, jobs, testimonials } = await getData();

  return (
    <>
      {/* PublicHeader HARUS jadi sibling top-level (bukan di-nest di dalam div
          bertinggi terbatas) supaya position:sticky-nya mengikuti scroll SELURUH
          halaman, bukan cuma setinggi hero. */}
      <PublicHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Layer gradient dekoratif ditarik ke atas (-top-28) supaya menutupi
            area di belakang header yang transparan — menghindari jahitan putih
            tanpa perlu membungkus header dalam div bertinggi terbatas. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-28 -z-10 h-[calc(100%+7rem)] bg-gradient-to-b from-rose-100 via-white to-white"
        />
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-32 h-80 w-80 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="container-page relative py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Rekomendasi Karir & Magang Berbasis AI
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Temukan Karier & Magang <span className="text-gradient">Impianmu</span> dengan Kecerdasan Buatan
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600">
              JobMatch membantu pelajar, mahasiswa, dan fresh graduate terhubung dengan ribuan
              lowongan dari perusahaan terbaik Indonesia. Analisis CV-mu, tingkatkan skill, dan lamar dengan satu klik.
            </p>

            <form
              action="/jobs"
              className="mx-auto mt-9 flex max-w-2xl items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-card-hover"
            >
              <Search className="ml-3 h-5 w-5 shrink-0 text-zinc-400" />
              <input
                name="q"
                type="text"
                placeholder="Cari lowongan, posisi, atau skill..."
                className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
              <button type="submit" className="btn-primary shrink-0">
                Cari Lowongan
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
              <span className="font-medium text-zinc-700">Populer:</span>
              {["Front-End Developer", "UI/UX Designer", "Data Analyst", "Digital Marketing"].map((q) => (
                <Link
                  key={q}
                  href={`/jobs?q=${encodeURIComponent(q)}`}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 transition hover:border-brand-300 hover:text-brand-700"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "1.200+", label: "Lowongan Aktif" },
              { value: "450+", label: "Perusahaan Mitra" },
              { value: "30K+", label: "Pelamar Terdaftar" },
              { value: "92%", label: "Tingkat Kepuasan" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-zinc-100 bg-white p-5 text-center shadow-card">
                <p className="text-2xl font-extrabold text-brand-600">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Satu Platform, <span className="text-gradient">Semua Kebutuhan Kariermu</span>
            </h2>
            <p className="mt-4 text-zinc-600">
              Dari analisis CV hingga statistik tracer study, semua terintegrasi dalam satu ekosistem.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card group relative overflow-hidden p-7 transition-all hover:-translate-y-1 hover:shadow-card-hover">
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-50 transition group-hover:scale-150" />
                <div className="relative">
                  <div className="inline-flex rounded-2xl bg-brand-600 p-3.5 text-white shadow-card-hover">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{f.description}</p>
                  <ul className="mt-4 space-y-2">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-zinc-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-500" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-zinc-950 py-20 text-white">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Cara Kerjanya <span className="text-brand-400">Sangat Mudah</span>
            </h2>
            <p className="mt-4 text-zinc-400">
              Mulai langkah pertamamu menuju karier impian dalam 4 langkah sederhana.
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-glow">
                  <step.icon className="h-7 w-7" />
                </div>
                <p className="mt-4 text-sm font-bold uppercase tracking-wider text-brand-400">Langkah {i + 1}</p>
                <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOBS PREVIEW */}
      <section className="py-20">
        <div className="container-page">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-3xl font-extrabold">Lowongan <span className="text-gradient">Terbaru</span></h2>
              <p className="mt-2 text-zinc-600">Prioritas untuk magang dan lowongan entry-level fresh graduate.</p>
            </div>
            <Link href="/jobs" className="btn-primary">
              Lihat Semua Lowongan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* COMPANIES */}
      <section id="companies" className="border-t border-zinc-100 bg-zinc-50 py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
              <Building2 className="h-3.5 w-3.5" />
              Perusahaan & Institusi Mitra
            </div>
            <h2 className="text-3xl font-extrabold">Dipercaya oleh <span className="text-gradient">Perusahaan Terbaik</span></h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {companies.map((c) => (
              <div key={c.id} className="flex items-center justify-center rounded-xl border border-zinc-100 bg-white p-4 text-center shadow-card transition hover:border-brand-200">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-700">{c.name}</p>
                  <p className="text-[10px] text-zinc-400">{c.industry}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {institutions.map((inst) => (
              <div key={inst.id} className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3 shadow-card">
                <GraduationCap className="h-5 w-5 shrink-0 text-brand-500" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-800">{inst.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400">{inst.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold">Apa Kata <span className="text-gradient">Mereka?</span></h2>
            <p className="mt-4 text-zinc-600">Cerita nyata dari pengguna yang sudah merasakan manfaat JobMatch.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="card flex flex-col p-7">
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-700">&quot;{t.text}&quot;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-rose-600 text-sm font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-rose-600 px-8 py-14 text-center text-white shadow-card-hover sm:px-16">
            <div className="pointer-events-none absolute -top-16 right-0 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 left-0 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <h2 className="text-3xl font-extrabold sm:text-4xl">Siap Memulai Kariermu?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/90">
              Daftar gratis sekarang, unggah CV-mu, dan biarkan AI menemukan lowongan terbaik untukmu.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow-lg transition hover:scale-105"
              >
                <Rocket className="h-4 w-4" />
                Daftar Gratis
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Jelajahi Lowongan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="border-t border-zinc-100 py-20">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold">Hubungi & <span className="text-gradient">Beri Feedback</span></h2>
              <p className="mt-4 text-zinc-600">
                Punya pertanyaan, saran, atau ingin menjadi mitra perusahaan/institusi? Tim kami siap membantu.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 rounded-xl border border-zinc-100 p-4 shadow-card">
                  <div className="rounded-lg bg-brand-50 p-3 text-brand-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Email</p>
                    <p className="text-sm text-zinc-500">halo@jobmatch.id</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-zinc-100 p-4 shadow-card">
                  <div className="rounded-lg bg-brand-50 p-3 text-brand-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Kantor</p>
                    <p className="text-sm text-zinc-500">Jl. Sudirman No. 123, Jakarta Selatan</p>
                  </div>
                </div>
              </div>
            </div>
            <form
              action="mailto:halo@jobmatch.id"
              method="post"
              encType="text/plain"
              className="card space-y-4 p-7"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Nama</label>
                  <input required name="name" className="input" placeholder="Nama lengkap" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input required name="email" type="email" className="input" placeholder="email@contoh.com" />
                </div>
              </div>
              <div>
                <label className="label">Subjek</label>
                <select className="input" name="subject">
                  <option>Pertanyaan Umum</option>
                  <option>Kerja Sama Perusahaan</option>
                  <option>Kerja Sama Institusi</option>
                  <option>Feedback & Saran</option>
                </select>
              </div>
              <div>
                <label className="label">Pesan</label>
                <textarea required name="body" rows={5} className="input resize-none" placeholder="Tulis pesan atau saranmu di sini..." />
              </div>
              <button type="submit" className="btn-primary w-full">
                Kirim Pesan
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}