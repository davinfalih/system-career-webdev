"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/session-provider";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bookmark,
  Briefcase,
  Building2,
  CalendarClock,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Newspaper,
  Pencil,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";

const NAV: Record<string, { label: string; href: string; icon: typeof LayoutDashboard; exact?: boolean }[]> = {
  STUDENT: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { label: "Profil & CV", href: "/dashboard/profile", icon: UserCircle },
    { label: "Rekomendasi AI", href: "/dashboard/recommendations", icon: Sparkles },
    { label: "Lamaran Saya", href: "/dashboard/applications", icon: FileText },
    { label: "Tersimpan", href: "/dashboard/bookmarks", icon: Bookmark },
    { label: "Laporan", href: "/dashboard/reports", icon: BarChart3 },
  ],
  COMPANY: [
    { label: "Dashboard", href: "/employer", icon: LayoutDashboard, exact: true },
    { label: "Lowongan", href: "/employer/jobs", icon: Briefcase },
    { label: "Kandidat", href: "/employer/applicants", icon: Users },
    { label: "Wawancara", href: "/employer/interviews", icon: CalendarClock },
    { label: "Profil", href: "/employer/settings", icon: Building2 },
  ],
  INSTITUTION: [
    { label: "Dashboard", href: "/institution", icon: LayoutDashboard, exact: true },
    { label: "Tracer Study", href: "/institution/tracer-study", icon: GraduationCap },
    { label: "Verifikasi Mahasiswa", href: "/institution/verification", icon: ShieldCheck },
    { label: "Top Skills Industri", href: "/institution/skills", icon: Sparkles },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Institusi", href: "/admin/institutions", icon: GraduationCap },
    { label: "Perusahaan", href: "/admin/companies", icon: Building2 },
    { label: "Skill Master Data", href: "/admin/skills", icon: Sparkles },
    { label: "Pengguna", href: "/admin/users", icon: Users },
    { label: "Monetisasi", href: "/admin/monetization", icon: Settings },
  ],
};

const TITLES: Record<string, string> = {
  STUDENT: "Dashboard Mahasiswa",
  COMPANY: "Dashboard Perusahaan",
  INSTITUTION: "Portal Institusi",
  ADMIN: "Super Admin",
};

const BOTTOM_NAV_ROLES = ["STUDENT", "COMPANY"];

export function DashboardShell({
  role,
  userName,
  userEmail,
  userImage,
  children,
}: {
  role: string;
  userName: string;
  userEmail: string;
  userImage?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let saved = false;
    try {
      saved = localStorage.getItem("cs-sidebar") === "hidden";
    } catch {}
    setHidden(saved);
  }, []);

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(userName);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const [photo, setPhoto] = useState(userImage ?? null);
  const [savingPhoto, setSavingPhoto] = useState(false);

  const items = NAV[role] ?? NAV.STUDENT;
  const bottomNav = BOTTOM_NAV_ROLES.includes(role);

  function toggleHidden() {
    setSidebarOpen(false);
    setHidden((h) => {
      const next = !h;
      try {
        localStorage.setItem("cs-sidebar", next ? "hidden" : "shown");
      } catch {}
      return next;
    });
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setNameError("");
    if (name.trim().length < 2) {
      setNameError("Nama minimal 2 karakter.");
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch("/api/profile/name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNameError(data.error ?? "Gagal menyimpan");
        return;
      }
      setEditingName(false);
      window.location.reload();
    } finally {
      setSavingName(false);
    }
  }

  async function uploadPhoto(file: File) {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setNameError("Ukuran gambar maksimal 3MB.");
      return;
    }
    setSavingPhoto(true);
    setNameError("");
    try {
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/profile/photo", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: dataUrl,
      });
      const data = await res.json();
      if (!res.ok) {
        setNameError(data.error ?? "Gagal mengunggah foto");
        return;
      }
      setPhoto(data.image);
    } catch {
      setNameError("Terjadi kesalahan saat mengunggah foto");
    } finally {
      setSavingPhoto(false);
    }
  }

  const accountModal = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => setEditingName(false)} />
      <div className="glass-nav relative w-full max-w-sm animate-fade-up rounded-2xl p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold">Akun Saya</h3>
          <button
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"
            onClick={() => setEditingName(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar name={name || userName} src={photo} size="lg" />
            {savingPhoto && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 text-white">
                <Loader2 className="h-5 w-5 animate-spin" />
              </span>
            )}
          </div>
          <label className="btn-secondary !py-1.5 text-xs">
            <Pencil className="h-3.5 w-3.5" />
            {savingPhoto ? "Mengunggah..." : "Ubah Foto Profil"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadPhoto(f);
              }}
            />
          </label>
        </div>

        {role === "STUDENT" && (
          <Link
            href="/dashboard/profile"
            onClick={() => setEditingName(false)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-100"
          >
            <UserCircle className="h-4 w-4" />
            Edit Profil Lengkap
          </Link>
        )}

        <form onSubmit={saveName} className="space-y-4">
          <div>
            <label className="label">Nama Lengkap</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Nama lengkap Anda"
            />
            {nameError && <p className="mt-1 text-xs text-rose-600">{nameError}</p>}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditingName(false)} className="btn-secondary flex-1">
              Batal
            </button>
            <button type="submit" disabled={savingName} className="btn-primary flex-1">
              {savingName && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </button>
          </div>
        </form>

        <button
          onClick={() => signOut()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </div>
  );

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-zinc-100 px-5">
        <Logo size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-none">JobMatch</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {TITLES[role]}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-brand-50 hover:text-brand-700",
                active && "bg-brand-600 text-white shadow-card-hover hover:bg-brand-600 hover:text-white"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-100 p-3">
        <div
          className="group flex cursor-pointer items-center gap-3 rounded-xl p-1 transition hover:bg-zinc-50"
          onClick={() => setEditingName(true)}
          title="Klik untuk edit nama"
        >
          <div className="relative shrink-0">
            <Avatar name={userName} src={userImage} size="sm" />
            <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-brand-600 p-0.5 text-white opacity-0 transition group-hover:opacity-100">
              <Pencil className="h-2.5 w-2.5" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-800">{userName}</p>
            <p className="truncate text-xs text-zinc-400">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </div>
  );

  if (bottomNav) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-100/60 bg-white/70 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
            <div>
              <p className="text-sm font-bold leading-none">JobMatch</p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                {TITLES[role]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {role === "STUDENT" && (
              <Link
                href="/jobs"
                className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 sm:flex"
              >
                <Briefcase className="h-4 w-4" />
                Jelajahi Lowongan
              </Link>
            )}
            <button
              className="rounded-full p-1 hover:bg-zinc-100"
              onClick={() => setEditingName(true)}
              title="Akun"
            >
              <Avatar name={userName} src={userImage} size="sm" />
            </button>
          </div>
        </header>

        <main className="px-4 py-6 pb-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>

        <nav className="glass-nav fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full px-2 py-2 no-scrollbar">
          {items.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-0.5 rounded-full px-3.5 py-1.5 text-[10px] font-semibold transition",
                  active
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                    : "text-zinc-500 hover:bg-brand-50 hover:text-brand-700"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-[72px] truncate leading-none">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {editingName && accountModal}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-zinc-100 bg-white transition-[width] duration-200 lg:block",
          hidden && "lg:hidden"
        )}
      >
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <button
              className="absolute right-3 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className={cn("transition-[padding] duration-200", hidden ? "lg:pl-0" : "lg:pl-64")}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-100 bg-white/80 px-4 backdrop-blur-lg sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              className="hidden rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 lg:flex"
              onClick={toggleHidden}
              title={hidden ? "Tampilkan menu" : "Sembunyikan menu"}
            >
              {hidden ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <Newspaper className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-500">
                {TITLES[role]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/jobs"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 md:flex"
            >
              <Briefcase className="h-4 w-4" />
              Jelajah Lowongan
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      {editingName && accountModal}
    </div>
  );
}