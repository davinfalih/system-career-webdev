"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { PublicFooter } from "@/components/layout/public-footer";
import { Logo } from "@/components/ui/logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Terjadi kesalahan");
      return;
    }
    setSuccess(true);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-100 bg-white/80 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-lg font-bold">
              Job<span className="text-gradient">Match</span>
            </span>
          </Link>
          <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-brand-700">
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="card p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold">Lupa Password?</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Masukkan email terdaftarmu. Kami akan mengirimkan tautan untuk mereset password.
            </p>

            {success && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> Link reset telah dikirim
                </div>
                <p className="mt-1 text-emerald-600">
                  Cek email <strong>{email}</strong> untuk tautan reset password. Kembali ke halaman login.
                </p>
              </div>
            )}

            {!success && (
              <>
                {error && (
                  <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="input"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Mengirim..." : "Kirim Link Reset"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-500">
                  Ingat passwordmu?{" "}
                  <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                    Masuk di sini
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}