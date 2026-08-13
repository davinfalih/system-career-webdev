import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const FOOTER_COLS = [
  {
    title: "Fitur",
    links: [
      { label: "Analisis CV AI", href: "/#features" },
      { label: "Rekomendasi Karir", href: "/#features" },
      { label: "Tracer Study", href: "/#how-it-works" },
      { label: "Cari Lowongan", href: "/jobs" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Pasang Lowongan", href: "/register" },
      { label: "Dashboard HR", href: "/login" },
      { label: "Screening Kandidat", href: "/#features" },
      { label: "Mitra Kami", href: "/#companies" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Cara Kerja", href: "/#how-it-works" },
      { label: "Kontak Kami", href: "/#contact" },
      { label: "Feedback", href: "/#contact" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-zinc-100 bg-zinc-950 text-zinc-400">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-lg font-bold text-white">
              Job<span className="text-brand-400">Match</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Platform pencari kerja dan penyedia lowongan untuk pelajar, mahasiswa, dan fresh graduate di
            Indonesia. Hubungkan skill-mu dengan karier impianmu bersama AI.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-400" /> fakhrizafaraby@gmail.com
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-400" /> +62 85746964546
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-400" /> Malang, Indonesia
            </p>
          </div>
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {col.title}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition hover:text-brand-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-800 py-5">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-xs sm:flex-row">
          <p>&copy; 2026 JobMatch. Semua hak dilindungi.</p>
          <p>Dibangun dengan untuk masa depan karir Indonesia.</p>
        </div>
      </div>
    </footer>
  );
}
