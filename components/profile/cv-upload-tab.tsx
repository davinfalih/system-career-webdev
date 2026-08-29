"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FileText,
  FileUp,
  Loader2,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import type { ProfileWorkspaceData } from "./profile-workspace";

type ParsedSkill = { name: string; category: string; level: number };
type ParsedEducation = { school: string; degree?: string; major?: string };
type ParsedExperience = { role: string; company?: string; description?: string };

export function CvUploadTab({ initialData }: { initialData: ProfileWorkspaceData }) {
  const router = useRouter();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<{
    skills: ParsedSkill[];
    education: ParsedEducation[];
    experiences: ParsedExperience[];
    projects: { name: string; description?: string }[];
    summary?: string;
  } | null>(null);
  const [stats, setStats] = useState<{ skillCount: number; educationCount: number; experienceCount: number; projectCount: number; cvScore: number; knowledge: { known: number; total: number; recognizedRate: number } } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("File harus berformat PDF", "error");
      return;
    }
    setUploading(true);
    setFileName(file.name);
    setParsed(null);
    setStats(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/cv/parse", { method: "POST", body: formData });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: `HTTP ${res.status} - respons tidak valid` };
      }
      if (!res.ok) {
        showToast(data.message ?? data.error ?? `Gagal menganalisis CV (${res.status})`, "error");
        return;
      }
      setParsed(data.parsed);
      setStats(data.stats);
      showToast("AI berhasil menganalisis CV-mu!");
    } catch {
      showToast("Terjadi kesalahan saat upload", "error");
    } finally {
      setUploading(false);
    }
  }

  async function confirmExtraction() {
    if (!parsed) return;
    setSaving(true);
    try {
      const payload = {
        skills: parsed.skills.map((s) => s.name),
        education: parsed.education,
        experiences: parsed.experiences,
        projects: parsed.projects,
      };
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        showToast("Gagal menyimpan profil", "error");
        return;
      }
      showToast("Hasil ekstraksi berhasil disimpan ke profilmu!");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Unggah CV & Analisis AI</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Upload CV dalam format PDF. AI akan mengekstrak skill, riwayat pendidikan, pengalaman, dan proyekmu secara otomatis.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => fileRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition ${
          dragOver ? "border-brand-500 bg-brand-50" : "border-zinc-200 bg-zinc-50/50 hover:border-brand-300 hover:bg-brand-50/40"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        {uploading ? (
          <Loader2 className="h-12 w-12 animate-spin text-brand-500" />
        ) : (
          <FileUp className="h-12 w-12 text-brand-500" />
        )}
        <p className="mt-4 text-sm font-semibold text-zinc-800">
          {uploading ? "AI sedang membaca CV-mu..." : "Tarik & letakkan CV-mu di sini"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          atau klik untuk memilih file · Maksimal PDF, tanpa scan gambar
        </p>
        {fileName && !uploading && (
          <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-zinc-600 shadow-card">
            <FileText className="h-3.5 w-3.5 text-brand-500" />
            {fileName}
          </span>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl bg-brand-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-brand-600">{stats.skillCount}</p>
            <p className="mt-1 text-xs text-zinc-500">Skill Ditemukan</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-zinc-800">{stats.educationCount}</p>
            <p className="mt-1 text-xs text-zinc-500">Pendidikan</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-zinc-800">{stats.experienceCount}</p>
            <p className="mt-1 text-xs text-zinc-500">Pengalaman</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-zinc-800">{stats.projectCount}</p>
            <p className="mt-1 text-xs text-zinc-500">Proyek</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-emerald-600">{stats.cvScore}</p>
            <p className="mt-1 text-xs text-zinc-500">CV Score</p>
          </div>
        </div>
      )}

      {parsed && (
        <div className="space-y-5 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-500" />
              <h3 className="font-bold">Hasil Ekstraksi AI - Tinjau & Perbaiki</h3>
            </div>
            <button onClick={() => setParsed(null)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Keahlian (Skills)</p>
            <div className="flex flex-wrap gap-2">
              {parsed.skills.length === 0 && <p className="text-sm text-zinc-500">Tidak ada skill terdeteksi.</p>}
              {parsed.skills.map((s, i) => (
                <span key={i} className="badge bg-white text-zinc-700 ring-1 ring-zinc-200">
                  {s.name}
                  <button
                    onClick={() => setParsed((p) => p && { ...p, skills: p.skills.filter((_, idx) => idx !== i) })}
                    className="ml-1 text-zinc-400 hover:text-rose-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Pendidikan</p>
              <div className="space-y-2">
                {parsed.education.length === 0 && <p className="text-sm text-zinc-500">Tidak ada.</p>}
                {parsed.education.map((e, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-white p-3 text-sm">
                    <span>{e.school} {e.major && <span className="text-zinc-400">· {e.major}</span>}</span>
                    <button onClick={() => setParsed((p) => p && { ...p, education: p.education.filter((_, idx) => idx !== i) })} className="text-zinc-400 hover:text-rose-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Pengalaman</p>
              <div className="space-y-2">
                {parsed.experiences.length === 0 && <p className="text-sm text-zinc-500">Tidak ada.</p>}
                {parsed.experiences.map((e, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-white p-3 text-sm">
                    <span>{e.role} {e.company && <span className="text-zinc-400">· {e.company}</span>}</span>
                    <button onClick={() => setParsed((p) => p && { ...p, experiences: p.experiences.filter((_, idx) => idx !== i) })} className="text-zinc-400 hover:text-rose-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={confirmExtraction} disabled={saving} className="btn-primary w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {saving ? "Menyimpan..." : "Simpan Hasil Ekstraksi ke Profil"}
          </button>
        </div>
      )}

      {initialData.hasAIReview && !parsed && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>
            CV-mu sudah pernah dianalisis. <button onClick={() => { setFileName(""); }} className="font-semibold underline">Upload CV baru</button> untuk memperbarui hasil, atau lanjut ke tab Edit Profil.
          </span>
        </div>
      )}

      <button
        onClick={() => {
          setFileName("");
          setParsed(null);
          setStats(null);
        }}
        className="btn-ghost"
      >
        <RefreshCw className="h-4 w-4" />
        Upload ulang
      </button>
    </div>
  );
}
