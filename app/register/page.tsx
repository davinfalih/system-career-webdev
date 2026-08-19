import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { apiFetch } from "@/lib/api";

export const metadata = { title: "Daftar" };

export default async function RegisterPage() {
  const { data } = await apiFetch("/meta/institutions");
  const institutions = Array.isArray(data?.institutions) ? data.institutions : [];

  return (
    <AuthShell>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Buat Akun Baru</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Masuk di sini
          </Link>
        </p>
      </div>
      <RegisterForm institutions={institutions} />
    </AuthShell>
  );
}