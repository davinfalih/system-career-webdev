import Link from "next/link";
import { Bell, Mail } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { timeAgo } from "@/lib/utils";
import { MarkReadButton } from "@/components/notifications/mark-read-button";

export const metadata = { title: "Notifikasi" };

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: notificationsData } = await serverApi("/notifications/my");
  const notifications = Array.isArray(notificationsData?.notifications) ? notificationsData.notifications : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Notifikasi</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}
          </p>
        </div>
        <MarkReadButton disabled={unreadCount === 0} />
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="Belum ada notifikasi"
          description="Notifikasi status lamaran, undangan wawancara, dan update lainnya akan muncul di sini."
          action={<Link href="/jobs" className="btn-primary">Jelajahi Lowongan</Link>}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`card flex items-start gap-4 p-5 transition ${n.read ? "opacity-70" : "border-brand-200 bg-brand-50/30"}`}
            >
              <div className={`rounded-xl p-3 ${n.read ? "bg-zinc-100 text-zinc-400" : "bg-brand-600 text-white"}`}>
                {n.title.includes("Interview") ? (
                  <Mail className="h-5 w-5" />
                ) : (
                  <Bell className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-zinc-900">{n.title}</h3>
                  <span className="shrink-0 text-xs text-zinc-400">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-zinc-600">{n.message}</p>
                {!n.read && <Badge className="mt-2">Baru</Badge>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
