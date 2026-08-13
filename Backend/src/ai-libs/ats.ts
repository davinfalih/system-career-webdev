import { chatJSON, hasOpenAIKey } from "./openai";

export interface ATSCheckResult {
  score: number;
  strengths: string[];
  improvements: string[];
  keywordsMatched: string[];
}

export async function checkATS(cvText: string): Promise<ATSCheckResult> {
  if (hasOpenAIKey()) {
    try {
      const result = await chatJSON(
        "You are an ATS (Applicant Tracking System) expert. Score this CV 0-100 and return JSON {score, strengths:[], improvements:[], keywordsMatched:[]}.",
        cvText.slice(0, 15000)
      );
      return {
        score: clamp(Number(result.score)),
        strengths: toArray(result.strengths),
        improvements: toArray(result.improvements),
        keywordsMatched: toArray(result.keywordsMatched),
      };
    } catch {
      return mockATS(cvText);
    }
  }
  return mockATS(cvText);
}

function mockATS(cvText: string): ATSCheckResult {
  const lower = cvText.toLowerCase();
  let score = 35;

  const sections = [
    { name: "pengalaman", weight: 15, has: /(pengalaman|experience)/i.test(lower) },
    { name: "pendidikan", weight: 10, has: /(pendidikan|education|sma|smk|universitas)/i.test(lower) },
    { name: "skills", weight: 15, has: /(skill|keahlian|kemampuan)/i.test(lower) },
    { name: "kontak", weight: 10, has: /(@|email|whatsapp|phone|no\.? telp)/i.test(lower) },
  ];
  const matchedSectionNames: string[] = [];
  for (const s of sections) {
    if (s.has) {
      score += s.weight;
      matchedSectionNames.push(s.name);
    }
  }

  const actionWords = ["membangun", "mengembangkan", "mengelola", "menciptakan", "meningkatkan", "memimpin", "developed", "built", "led", "created", "improved", "managed"];
  if (actionWords.some((w) => lower.includes(w))) score += 10;

  if (score > 90) score = 90;

  const strengths: string[] = [];
  if (matchedSectionNames.includes("kontak")) strengths.push("Informasi kontak tersedia");
  if (matchedSectionNames.includes("pengalaman")) strengths.push("Riwayat pengalaman terstruktur");
  if (matchedSectionNames.includes("pendidikan")) strengths.push("Riwayat pendidikan tercantum");
  if (strengths.length === 0) strengths.push("Dasar CV tersedia");

  const improvements: string[] = [];
  if (!matchedSectionNames.includes("skills")) improvements.push("Tambahkan bagian keahlian (skills) yang spesifik");
  if (!matchedSectionNames.includes("kontak")) improvements.push("Cantumkan email/telepon yang aktif");
  if (!actionWords.some((w) => lower.includes(w))) improvements.push("Gunakan kata kerja aksi (achievement verbs) pada deskripsi pengalaman");
  if (score < 60) improvements.push("Kuantifikasi pencapaianmu dengan angka (mis. meningkatkan 30%)");
  if (improvements.length === 0) improvements.push("Pertahankan dan terus perbarui CV-mu secara berkala");

  const keywords = ["komunikasi", "leadership", "teamwork", "problem solving", "manajemen waktu"];
  const keywordsMatched = keywords.filter((k) => lower.includes(k));

  return { score, strengths, improvements, keywordsMatched };
}

function clamp(score: number) {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

function toArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).filter(Boolean);
}
