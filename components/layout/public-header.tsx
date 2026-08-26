"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/session-provider";
import { useState } from "react";
import { Bell, LogOut, Menu, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/jobs", label: "Lowongan" },
  { href: "/#how-it-works", label: "Cara Kerja" },
  { href: "/#pricing", label: "Paket" },
  { href: "/#companies", label: "Perusahaan" },
  { href: "/#contact", label: "Kontak" },
];

export function PublicHeader() {
  const { user: sessionUser, signOut } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="px-4 pt-4 pb-4">
        <div className="glass-clear mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full py-2 pl-4 pr-2">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Logo size="sm" />
            <span className="text-lg font-bold tracking-tight">
              Job<span className="text-gradient">Match</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium text-zinc-600 transition hover:bg-brand-50 hover:text-brand-700",
                  pathname === link.href && "bg-brand-50 text-brand-700"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {sessionUser ? (
              <>
                <Link href="/dashboard" className="btn-ghost !rounded-full">
                  <Sparkles className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/notifications"
                  className="relative rounded-full p-2 text-zinc-500 hover:bg-zinc-100"
                >
                  <Bell className="h-5 w-5" />
                </Link>
                <Link href="/dashboard" className="flex items-center gap-2 rounded-full p-1 hover:bg-zinc-100">
                  <Avatar name={sessionUser.name ?? "User"} src={sessionUser.image} />
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost !rounded-full">
                  Masuk
                </Link>
                <Link href="/register" className="btn-primary !rounded-full">
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="glass-clear mx-auto mt-2 max-w-5xl overflow-hidden rounded-2xl px-4 py-3 lg:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-brand-50 hover:text-brand-700"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-zinc-200/60 pt-3">
                {sessionUser ? (
                  <>
                    <Link href="/dashboard" onClick={() => setOpen(false)} className="btn-secondary w-full">
                      <Sparkles className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button onClick={() => signOut()} className="btn-secondary w-full">
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setOpen(false)} className="btn-secondary w-full">
                      Masuk
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)} className="btn-primary w-full">
                      Daftar Gratis
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}