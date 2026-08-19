import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { CareerReportExport } from "@/components/reports/career-report-export";
import { recommendCareers } from "@/lib/ai/recommend";

export const metadata = { title: "Laporan & Ekspor" };

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  let skills: string[] = [];
  try {
    skills = JSON.parse(user.profile?.skills ?? "[]");
  } catch {
    skills = [];
  }

  const { data: appsData } = await serverApi("/applications/my");
  const applications = Array.isArray(appsData?.applications) ? appsData.applications : [];
  const { data: bookmarksData } = await serverApi("/bookmarks/my");
  const bookmarks = Array.isArray(bookmarksData?.bookmarks) ? bookmarksData.bookmarks : [];

  const recommendations = recommendCareers(skills);
  const profile = user.profile;

  const reportData = {
    name: user.name,
    email: user.email,
    major: user.major,
    graduationYear: user.graduationYear,
    gpa: user.gpa,
    institution: user.institution?.name ?? "",
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    skills,
    cvScore: profile?.cvScore ?? 0,
    atsScore: profile?.atsScore ?? 0,
    recommendations: recommendations.slice(0, 5),
    applicationCount: applications.length,
    bookmarkCount: bookmarks.length,
    applications,
    generatedAt: new Date(),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Export Center</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Unduh laporan ringkasan karier dan CV-mu dalam format PDF.
        </p>
      </div>

      {/* Career summary */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-rose-600 p-6 text-white">
          <h2 className="text-lg font-bold">Career Summary Report (PDF)</h2>
          <p className="mt-1 text-sm text-white/80">
            Ringkasan profil AI, rekomendasi karier, dan rencana pengembangan skill.
          </p>
        </div>
        <div className="p-6">
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-zinc-50 p-4 text-center">
              <p className="text-2xl font-extrabold text-brand-600">{reportData.cvScore}</p>
              <p className="text-xs text-zinc-500">Skor CV</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-4 text-center">
              <p className="text-2xl font-extrabold text-zinc-800">{reportData.applicationCount}</p>
              <p className="text-xs text-zinc-500">Total Lamaran</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-4 text-center">
              <p className="text-2xl font-extrabold text-zinc-800">{reportData.recommendations.length}</p>
              <p className="text-xs text-zinc-500">Rekomendasi Karir</p>
            </div>
          </div>

          {reportData.recommendations.length > 0 && (
            <div className="mb-5">
              <p className="mb-3 text-sm font-semibold text-zinc-600">Top Rekomendasi:</p>
              <div className="space-y-2">
                {reportData.recommendations.map((r) => (
                  <div key={r.title} className="flex items-center justify-between rounded-xl border border-zinc-100 p-3">
                    <span className="text-sm font-semibold">{r.title}</span>
                    <span className="text-sm font-bold text-brand-600">{r.match}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <CareerReportExport data={reportData} />

          <p className="mt-3 text-xs text-zinc-400">
            Laporan dihasilkan secara otomatis dari profil, skor CV, dan riwayat lamaranmu.
          </p>
        </div>
      </div>

      {/* CV export */}
      <div className="card overflow-hidden">
        <div className="bg-zinc-900 p-6 text-white">
          <h2 className="text-lg font-bold">CV Export</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Unduh CV berstandar ATS dari data profilmu.
          </p>
        </div>
        <div className="p-6">
          <p className="mb-4 text-sm text-zinc-500">
            CV dibuat dari data yang kamu isi atau hasil ekstraksi AI di menu Profil & CV. Pastikan datamu sudah lengkap.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="/api/reports/cv" className="btn-primary">
              Download CV PDF
            </a>
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            Atau buat ulang CV-mu dengan Builder Terpandu di halaman Profil &amp; CV.
          </p>
        </div>
      </div>
    </div>
  );
}
