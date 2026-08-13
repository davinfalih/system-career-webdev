"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/ui/password-input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState("");
  const [remember, setRemember] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Email atau password salah. Silakan coba lagi.");
        return;
      }
      const dest = data.user.role === "COMPANY" ? "/employer" : data.user.role === "INSTITUTION" ? "/institution" : data.user.role === "ADMIN" ? "/admin" : callbackUrl;
      router.push(dest);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function handleOAuth(provider: string) {
    setOauthLoading(provider);
    window.location.href = `/api/auth/oauth/${provider}`;
  }

  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Masuk ke Akunmu</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Daftar gratis
          </Link>
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="input !pl-10"
            />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
          <div className="mt-3 flex items-center justify-between">
            <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 accent-brand-600"
              />
              Ingat saya
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Lupa password?
            </Link>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs font-medium text-zinc-400">atau masuk dengan</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleOAuth("google")}
          disabled={!!oauthLoading}
          className="btn-secondary"
        >
          {oauthLoading === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Google
        </button>
        <button
          onClick={() => handleOAuth("linkedin")}
          disabled={!!oauthLoading}
          className="btn-secondary"
        >
          {oauthLoading === "linkedin" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45z"/>
            </svg>
          )}
          LinkedIn
        </button>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <AuthShell>
        <LoginForm />
      </AuthShell>
    </Suspense>
  );
}