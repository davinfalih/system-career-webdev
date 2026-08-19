import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { JobCard } from "@/components/jobs/job-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Lowongan Tersimpan" };

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: bookmarksData } = await serverApi("/bookmarks/my");
  const bookmarks = Array.isArray(bookmarksData?.bookmarks) ? bookmarksData.bookmarks : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Lowongan Tersimpan</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {bookmarks.length} lowongan tersimpan untuk dilamar nanti.
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <EmptyState
          title="Belum ada lowongan tersimpan"
          description="Simpan lowongan menarik agar tidak terlewat."
          action={<Link href="/jobs" className="btn-primary">Jelajahi Lowongan</Link>}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((b) => (
            <div key={b.id} className="relative">
              <JobCard job={b.job} />
              <p className="mt-2 text-xs text-zinc-400">Disimpan pada {formatDate(b.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
