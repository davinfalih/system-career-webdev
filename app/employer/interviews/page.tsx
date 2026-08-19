import { CalendarClock, MapPin, Video } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Wawancara" };

export default async function InterviewsPage() {
  const user = await getCurrentUser();
  if (!user || !user.companyId) return null;

  const { data } = await serverApi("/employer/interviews");
  const interviews = Array.isArray(data?.interviews) ? data.interviews : [];

  const upcoming = interviews.filter((i) => new Date(i.scheduledAt) > new Date());
  const past = interviews.filter((i) => new Date(i.scheduledAt) <= new Date());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Jadwal Wawancara</h1>
        <p className="mt-1 text-sm text-zinc-500">Kelola dan pantau semua wawancara kandidat.</p>
      </div>

      <div>
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <CalendarClock className="h-5 w-5 text-brand-500" />
          Mendatang ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState title="Tidak ada wawancara mendatang" description="Undang kandidat dari ATS Board untuk menjadwalkan wawancara." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((inv) => (
              <div key={inv.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-zinc-900">{inv.application.user.name}</p>
                    <p className="text-sm text-zinc-500">{inv.application.job.title}</p>
                  </div>
                  <Badge variant="info">
                    {new Date(inv.scheduledAt).toDateString() === new Date().toDateString() ? "Hari Ini" : "Mendatang"}
                  </Badge>
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-zinc-600">
                  <p className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-brand-500" />
                    {formatDateTime(inv.scheduledAt)}
                  </p>
                  {inv.link && (
                    <a href={inv.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-brand-600 hover:underline">
                      <Video className="h-4 w-4" />
                      {inv.link}
                    </a>
                  )}
                  {inv.application.user.institution && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand-500" />
                      {inv.application.user.institution.name}
                    </p>
                  )}
                </div>
                {inv.notes && (
                  <p className="mt-3 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">{inv.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="mb-4 font-bold text-zinc-500">Riwayat ({past.length})</h2>
          <div className="space-y-2">
            {past.map((inv) => (
              <div key={inv.id} className="card flex items-center justify-between p-4 opacity-70">
                <div>
                  <p className="text-sm font-semibold">{inv.application.user.name}</p>
                  <p className="text-xs text-zinc-500">{inv.application.job.title}</p>
                </div>
                <span className="text-xs text-zinc-400">{formatDateTime(inv.scheduledAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
