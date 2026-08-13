import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const HIGHLIGHTS = [
  "1.200+ Lowongan aktif dari perusahaan terbaik",
  "Analisis CV & ATS dengan kecerdasan buatan",
  "Rekomendasi karier sesuai skill-mu",
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-rose-50 via-white to-white">
      <header className="border-b border-white/60 bg-white/50 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-lg font-bold">
              Job<span className="text-gradient">Match</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl animate-fade-up">
          <div className="grid overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl lg:grid-cols-2">
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <div className="mx-auto w-full max-w-md">{children}</div>
            </div>

            <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 lg:block">
              <div className="pattern-dots absolute inset-0 opacity-25" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-16 top-16 h-60 w-60 rounded-full bg-white/15 blur-3xl" />
              <div className="pointer-events-none absolute right-10 top-40 h-28 w-28 rounded-full bg-rose-300/30 blur-2xl" />

              <div className="relative flex h-full flex-col justify-between p-10 text-white">
                <div>
                  <p className="text-3xl font-extrabold leading-tight">
                    Temukan Karier &{" "}
                    <span className="text-brand-100">Magang</span> Impianmu
                  </p>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/85">
                    Satu platform untuk pelamar, perusahaan, dan institusi — semua kebutuhan
                    kariermu terhubung dalam satu tempat.
                  </p>
                </div>

                <div className="mt-10 space-y-3.5">
                  {HIGHLIGHTS.map((h) => (
                    <div key={h} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
                        <CheckCircle2 className="h-4 w-4 text-brand-100" />
                      </span>
                      <span className="text-sm font-medium text-white/90">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}