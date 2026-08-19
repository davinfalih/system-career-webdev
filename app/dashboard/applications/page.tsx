import Link from "next/link";
import { CalendarClock, CheckCircle2, MapPin, Send, XCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { ApplicationTimeline } from "@/components/applications/application-timeline";

export const metadata = { title: "Lamaran Saya" };

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Terkirim",
  UNDER_REVIEW: "Sedang Ditinjau",
  SCREENING: "Proses Screening",
  INTERVIEW: "Undangan Wawancara",
  ACCEPTED: "Diterima",
  REJECTED: "Ditolak",
};

const STATUS_VARIANTS: Record<string, "default" | "success" | "warning" | "info" | "danger"> = {
  SUBMITTED: "info",
  UNDER_REVIEW: "warning",
  SCREENING: "warning",
  INTERVIEW: "info",
  ACCEPTED: "success",
  REJECTED: "danger",
};

export default async function ApplicationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: appsData } = await serverApi("/applications/my");
  const applications = Array.isArray(appsData?.applications) ? appsData.applications : [];

  const counts: Record<string, number> = {};
  applications.forEach((a) => {
    counts[a.status] = (counts[a.status] ?? 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Lamaran Saya</h1>
        <p className="mt-1 text-sm text-zinc-500">Pantau status setiap lamaranmu secara real-time.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="neutral">Total: {applications.length}</Badge>
        {Object.entries(counts).map(([status, count]) => (
          <Badge key={status} variant={STATUS_VARIANTS[status] ?? "neutral"}>
            {STATUS_LABELS[status] ?? status}: {count}
          </Badge>
        ))}
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="Belum ada lamaran"
          description="Temukan lowongan yang cocok dan lamar dengan satu klik."
          action={<Link href="/jobs" className="btn-primary">Jelajahi Lowongan</Link>}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {applications.map((a) => (
            <div key={a.id} className="card p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/jobs/${a.job.id}`} className="text-lg font-bold text-zinc-900 hover:text-brand-700">
                    {a.job.title}
                  </Link>
                  <p className="text-sm text-zinc-500">{a.job.company.name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.job.location ?? "Remote"}</span>
                    <span className="flex items-center gap-1"><Send className="h-3 w-3" />{formatDate(a.createdAt)}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <Badge variant={STATUS_VARIANTS[a.status] ?? "neutral"}>
                    {STATUS_LABELS[a.status] ?? a.status}
                  </Badge>
                  {a.matchScore != null && (
                    <p className="mt-1.5 text-xs font-bold text-brand-600">Match {a.matchScore}%</p>
                  )}
                </div>
              </div>

              <div className="mt-5 border-t border-zinc-100 pt-4">
                <ApplicationTimeline status={a.status} />
              </div>

              {a.interview && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Jadwal Wawancara</p>
                    <p>{formatDate(a.interview.scheduledAt)}</p>
                    {a.interview.link && (
                      <a href={a.interview.link} target="_blank" rel="noreferrer" className="mt-1 inline-block font-semibold underline">
                        {a.interview.link}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {a.status === "ACCEPTED" && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Selamat! Kamu diterima. Tim HR akan menghubungi untuk langkah selanjutnya.
                </div>
              )}
              {a.status === "REJECTED" && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                  <XCircle className="h-4 w-4 shrink-0" />
                  Mohon maaf, kamu belum lolos. Jangan menyerah, masih banyak lowongan lain!
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
