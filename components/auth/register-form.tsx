"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Mail, User, School, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/ui/password-input";

type Institution = { id: string; name: string; type: string };

const ROLES = [
  { value: "STUDENT", label: "Pelajar / Mahasiswa", icon: School, desc: "Cari magang & kerja" },
  { value: "COMPANY", label: "Perusahaan / HR", icon: Building2, desc: "Pasang lowongan & rekrut" },
];

export function RegisterForm({ institutions }: { institutions: Institution[] }) {
  const router = useRouter();
  const [role, setRole] = useState("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    institutionId: "",
    institutionName: "",
    institutionType: "SMK",
    major: "",
    graduationYear: new Date().getFullYear(),
    nim: "",
    gpa: "",
    companyName: "",
    companyIndustry: "Teknologi",
    companyLocation: "Jakarta",
    companyDescription: "",
  });

  function update(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      password: form.password,
      role,
    };

    if (role === "STUDENT") {
      payload.institutionId = form.institutionId || undefined;
      payload.institutionName = form.institutionName || undefined;
      payload.institutionType = form.institutionType;
      payload.major = form.major || undefined;
      payload.graduationYear = Number(form.graduationYear) || undefined;
      payload.nim = form.nim || undefined;
      payload.gpa = form.gpa ? Number(form.gpa) : undefined;
    } else {
      payload.companyName = form.companyName;
      payload.companyIndustry = form.companyIndustry;
      payload.companyLocation = form.companyLocation;
      payload.companyDescription = form.companyDescription;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registrasi gagal");
        setLoading(false);
        return;
      }
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      router.push(role === "STUDENT" ? "/dashboard/profile" : "/employer/settings");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan server");
      setLoading(false);
    }
  }

  const inputCls = "input";
  const fieldCls = "flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl border-2 p-4 text-center transition",
              role === r.value
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
            )}
          >
            <r.icon className="h-6 w-6" />
            <span className="text-sm font-bold">{r.label}</span>
            <span className="text-[11px] text-zinc-400">{r.desc}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="label">Nama Lengkap</label>
          <div className={fieldCls}>
            <User className="h-4 w-4 shrink-0 text-zinc-400" />
            <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nama kamu" className="w-full bg-transparent py-2.5 text-sm focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="label">Email</label>
          <div className={fieldCls}>
            <Mail className="h-4 w-4 shrink-0 text-zinc-400" />
            <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="nama@email.com" className="w-full bg-transparent py-2.5 text-sm focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="label">Password</label>
          <PasswordInput
            value={form.password}
            onChange={(v) => update("password", v)}
            placeholder="Minimal 6 karakter"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
      </div>

      {role === "STUDENT" ? (
        <div className="space-y-4 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Data Pendidikan</p>

          <div>
            <label className="label">Kampus / Sekolah</label>
            <select value={form.institutionId} onChange={(e) => update("institutionId", e.target.value)} className={inputCls}>
              <option value="">-- Pilih institusi terdaftar --</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>{i.name} ({i.type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Tipe Institusi</label>
            <select value={form.institutionType} onChange={(e) => update("institutionType", e.target.value)} className={inputCls}>
              <option>SMK</option>
              <option>SMA</option>
              <option>VOCATIONAL</option>
              <option>POLYTECHNIC</option>
              <option>UNIVERSITY</option>
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">NIM / NISN</label>
              <input value={form.nim} onChange={(e) => update("nim", e.target.value)} placeholder="Untuk verifikasi siswa" className={inputCls} />
            </div>
            <div>
              <label className="label">Jurusan</label>
              <input value={form.major} onChange={(e) => update("major", e.target.value)} placeholder="cth. Rekayasa Perangkat Lunak" className={inputCls} />
            </div>
            <div>
              <label className="label">Tahun Lulus</label>
              <input type="number" min={1990} max={2035} value={form.graduationYear} onChange={(e) => update("graduationYear", Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className="label">IPK / Nilai Rata-rata</label>
              <input type="number" step="0.01" min={0} max={4} value={form.gpa} onChange={(e) => update("gpa", e.target.value)} placeholder="0 - 4.00" className={inputCls} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Data Perusahaan</p>
          <div>
            <label className="label">Nama Perusahaan</label>
            <input required value={form.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="PT. Contoh Nusantara" className={inputCls} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Industri</label>
              <input value={form.companyIndustry} onChange={(e) => update("companyIndustry", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="label">Lokasi</label>
              <input value={form.companyLocation} onChange={(e) => update("companyLocation", e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="label">Deskripsi Singkat</label>
            <textarea value={form.companyDescription} onChange={(e) => update("companyDescription", e.target.value)} rows={3} placeholder="Tentang perusahaanmu..." className={inputCls} />
          </div>
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Membuat akun..." : "Daftar Sekarang"}
      </button>
    </form>
  );
}
