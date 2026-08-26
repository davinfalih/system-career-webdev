"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, Download, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import type { ProfileWorkspaceData } from "./profile-workspace";
import { recommendCareers } from "@/lib/ai/recommend";

export function GuidedBuilderTab({
  initialData,
  skillOptions,
}: {
  initialData: ProfileWorkspaceData;
  skillOptions: string[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [cvPdfBlob, setCvPdfBlob] = useState<Blob | null>(null);
  const [cvPreviewText, setCvPreviewText] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialData.profile?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    name: initialData.user.name,
    headline: initialData.profile?.headline ?? "",
    email: initialData.user.email,
    phone: initialData.profile?.phone ?? "",
    location: initialData.profile?.location ?? "",
    summary: initialData.profile?.bio ?? "",
    school: "",
    degree: "",
    major: initialData.user.major ?? "",
    gradYear: initialData.user.graduationYear ?? new Date().getFullYear(),
  });

  const [experiences, setExperiences] = useState<{ role: string; company: string; description: string }[]>([]);
  const [projects, setProjects] = useState<{ name: string; description: string }[]>([]);

  const recommendations = useMemo(() => recommendCareers(selectedSkills), [selectedSkills]);

  function update(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addSkill(name: string) {
    const clean = name.trim();
    if (!clean || selectedSkills.includes(clean)) return;
    setSelectedSkills((s) => [...s, clean]);
    setSkillInput("");
  }

  const canNext = step === 1
    ? form.name && form.email
    : step === 2
      ? selectedSkills.length > 0
      : true;

  async function generateCv() {
    setGenerating(true);
    try {
      const payload = {
        name: form.name,
        headline: form.headline,
        email: form.email,
        phone: form.phone,
        location: form.location,
        summary: form.summary,
        education: form.school ? [{ school: form.school, degree: form.degree, major: form.major, endYear: Number(form.gradYear) }] : [],
        experiences,
        projects,
        skills: selectedSkills.map((s) => ({ name: s })),
      };

      const [pdfRes] = await Promise.all([
        fetch("/api/cv/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            headline: form.headline,
            bio: form.summary,
            location: form.location,
            phone: form.phone,
            skills: selectedSkills,
            education: form.school ? [{ school: form.school, degree: form.degree, major: form.major, endYear: Number(form.gradYear) }] : [],
            experiences,
            projects,
          }),
        }),
      ]);

      if (!pdfRes.ok) {
        showToast("Gagal generate CV", "error");
        return;
      }

      const pdfBlob = await pdfRes.blob();
      setCvPdfBlob(pdfBlob);

      const preview = [
        form.name.toUpperCase(),
        form.headline,
        [form.email, form.phone, form.location].filter(Boolean).join(" | "),
        "",
        form.summary && `RINGKASAN\n${form.summary}`,
        selectedSkills.length && `KEAHLIAN\n${selectedSkills.join(", ")}`,
        form.school && `PENDIDIKAN\n${[form.degree, form.major && `(${form.major})`, form.school, form.gradYear && `- ${form.gradYear}`].filter(Boolean).join(" ")}`,
        experiences.length && `PENGALAMAN\n${experiences.map(e => `${e.role}${e.company ? ` - ${e.company}` : ""}${e.description ? `\n${e.description}` : ""}`).join("\n\n")}`,
        projects.length && `PROYEK\n${projects.map(p => `${p.name}${p.description ? `\n${p.description}` : ""}`).join("\n\n")}`,
      ].filter(Boolean).join("\n");
      setCvPreviewText(preview);

      setStep(4);
      showToast("CV berhasil dibuat!");
      router.refresh();
    } catch {
      showToast("Gagal generate CV", "error");
    } finally {
      setGenerating(false);
    }
  }

  async function copyCv() {
    await navigator.clipboard.writeText(cvPreviewText);
    showToast("CV disalin ke clipboard", "info");
  }

  function downloadCv() {
    if (!cvPdfBlob) return;
    const url = URL.createObjectURL(cvPdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CV-${form.name.replace(/\s+/g, "-")}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CV berhasil diunduh");
  }

  const inputCls = "input";
  const skillBadges = [...new Set([...selectedSkills, ...skillOptions])].sort();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Builder CV Terpandu</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Isi pertanyaan berikut langkah demi langkah. AI akan menyusun CV berstandar ATS otomatis untukmu.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex flex-1 flex-col gap-1">
            <div className={`h-2 rounded-full transition ${step >= s ? "bg-brand-600" : "bg-zinc-200"}`} />
            <span className={`text-[10px] font-semibold ${step >= s ? "text-brand-700" : "text-zinc-400"}`}>
              {s === 1 && "Data Diri"}
              {s === 2 && "Skill"}
              {s === 3 && "Riwayat"}
              {s === 4 && "Selesai"}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-up">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nama Lengkap *</label>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} placeholder="Nama kamu" />
            </div>
            <div>
              <label className="label">Headline (jabatan yang diinginkan)</label>
              <input value={form.headline} onChange={(e) => update("headline", e.target.value)} className={inputCls} placeholder="cth. Front-End Developer" />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="label">Nomor HP / WhatsApp</label>
              <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputCls} placeholder="08xxxxxxxxxx" />
            </div>
            <div>
              <label className="label">Kota</label>
              <input value={form.location} onChange={(e) => update("location", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="label">Ringkasan Singkat</label>
              <input value={form.summary} onChange={(e) => update("summary", e.target.value)} className={inputCls} placeholder="Satu kalimat tentang dirimu" />
            </div>
          </div>
          <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Pendidikan Terakhir</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Nama Sekolah / Kampus</label>
                <input value={form.school} onChange={(e) => update("school", e.target.value)} className={inputCls} placeholder="SMK Negeri 1 / Universitas" />
              </div>
              <div>
                <label className="label">Jurusan</label>
                <input value={form.major} onChange={(e) => update("major", e.target.value)} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Jenjang</label>
                  <select value={form.degree} onChange={(e) => update("degree", e.target.value)} className={inputCls}>
                    <option value="">-</option>
                    <option>SMA</option>
                    <option>SMK</option>
                    <option>D3</option>
                    <option>D4</option>
                    <option>S1</option>
                  </select>
                </div>
                <div>
                  <label className="label">Tahun Lulus</label>
                  <input type="number" value={form.gradYear} onChange={(e) => update("gradYear", Number(e.target.value))} className={inputCls} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-up">
          <p className="text-sm text-zinc-600">
            Pilih skill yang kamu miliki. Semakin spesifik semakin baik untuk rekomendasi.
          </p>
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill(skillInput);
                }
              }}
              className={inputCls}
              placeholder="Ketik skill lalu tekan Enter, cth. Figma"
              list="skill-suggestions"
            />
            <datalist id="skill-suggestions">
              {skillBadges.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <button onClick={() => addSkill(skillInput)} className="btn-secondary shrink-0">
              <Plus className="h-4 w-4" />
              Tambah
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.length === 0 && (
              <p className="text-sm text-zinc-500">Belum ada skill dipilih.</p>
            )}
            {selectedSkills.map((s) => (
              <span key={s} className="badge bg-brand-600 text-white">
                {s}
                <button onClick={() => setSelectedSkills((prev) => prev.filter((x) => x !== s))} className="ml-1 opacity-70 hover:opacity-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Rekomendasi Skill</p>
            <div className="flex flex-wrap gap-2">
              {skillOptions.filter((s) => !selectedSkills.includes(s)).slice(0, 12).map((s) => (
                <button key={s} onClick={() => addSkill(s)} className="badge bg-white text-zinc-600 ring-1 ring-zinc-200 transition hover:bg-brand-50 hover:text-brand-700">
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-fade-up">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pengalaman / Organisasi</p>
              <button
                onClick={() => setExperiences((e) => [...e, { role: "", company: "", description: "" }])}
                className="btn-secondary !py-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah
              </button>
            </div>
            <div className="space-y-3">
              {experiences.length === 0 && (
                <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">Belum ada pengalaman. Bisa diisi nanti.</p>
              )}
              {experiences.map((exp, i) => (
                <div key={i} className="grid gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 sm:grid-cols-2">
                  <input
                    value={exp.role}
                    onChange={(e) => setExperiences((prev) => prev.map((x, idx) => (idx === i ? { ...x, role: e.target.value } : x)))}
                    placeholder="Posisi, cth. Ketua OSIS"
                    className={inputCls}
                  />
                  <div className="flex gap-2">
                    <input
                      value={exp.company}
                      onChange={(e) => setExperiences((prev) => prev.map((x, idx) => (idx === i ? { ...x, company: e.target.value } : x)))}
                      placeholder="Organisasi / Perusahaan"
                      className={inputCls}
                    />
                    <button onClick={() => setExperiences((prev) => prev.filter((_, idx) => idx !== i))} className="shrink-0 rounded-xl border border-zinc-200 px-3 text-zinc-400 hover:text-rose-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    value={exp.description}
                    onChange={(e) => setExperiences((prev) => prev.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)))}
                    placeholder="Deskripsi singkat & pencapaian"
                    className={`${inputCls} sm:col-span-2`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Proyek</p>
              <button
                onClick={() => setProjects((p) => [...p, { name: "", description: "" }])}
                className="btn-secondary !py-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah
              </button>
            </div>
            <div className="space-y-3">
              {projects.length === 0 && (
                <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">Belum ada proyek. Bisa diisi nanti.</p>
              )}
              {projects.map((proj, i) => (
                <div key={i} className="grid gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 sm:grid-cols-2">
                  <input
                    value={proj.name}
                    onChange={(e) => setProjects((prev) => prev.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))}
                    placeholder="Nama proyek"
                    className={inputCls}
                  />
                  <div className="flex gap-2">
                    <input
                      value={proj.description}
                      onChange={(e) => setProjects((prev) => prev.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)))}
                      placeholder="Deskripsi proyek"
                      className={inputCls}
                    />
                    <button onClick={() => setProjects((prev) => prev.filter((_, idx) => idx !== i))} className="shrink-0 rounded-xl border border-zinc-200 px-3 text-zinc-400 hover:text-rose-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 4 && cvPdfBlob && (
        <div className="space-y-5 animate-fade-up">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            CV berstandar ATS berhasil dibuat. Download PDF atau salin teksnya!
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap font-sans text-sm text-zinc-800">{cvPreviewText}</pre>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={downloadCv} className="btn-primary flex-1">
              <Download className="h-4 w-4" />
              Download CV (.pdf)
            </button>
            <button onClick={copyCv} className="btn-secondary flex-1">
              <Copy className="h-4 w-4" />
              Salin Teks
            </button>
          </div>

          {recommendations.length > 0 && (
            <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-500" />
                <h3 className="font-bold">Rekomendasi Karir untukmu</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {recommendations.slice(0, 4).map((r) => (
                  <div key={r.title} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-card">
                    <div>
                      <p className="text-sm font-bold text-zinc-800">{r.title}</p>
                      <p className="text-xs text-zinc-500">{r.industry}</p>
                    </div>
                    <Badge variant={r.match >= 80 ? "success" : r.match >= 50 ? "default" : "warning"}>
                      {r.match}%
                    </Badge>
                  </div>
                ))}
              </div>
              <a href="/dashboard/recommendations" className="btn-primary mt-4 w-full">
                Lihat Detail & Skill Gap
              </a>
            </div>
          )}
        </div>
      )}

      {step < 4 && (
        <div className="flex justify-between border-t border-zinc-100 pt-5">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="btn-secondary"
            disabled={step === 1}
          >
            Kembali
          </button>
          {step < 3 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="btn-primary">
              Lanjut
            </button>
          ) : (
            <button onClick={generateCv} disabled={generating || !canNext} className="btn-primary">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Membuat CV..." : "Generate CV dengan AI"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
