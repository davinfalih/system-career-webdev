import { CAREER_ROLES, matchRole, extractSkillsFromText } from "./skills";
import { chatJSON, hasOpenAIKey } from "./openai";

export interface Recommendation {
  title: string;
  industry: string;
  match: number;
  missing: string[];
}

export function recommendCareers(skillNames: string[]): Recommendation[] {
  const results = CAREER_ROLES.map((role) => matchRole(skillNames, role))
    .filter((r) => r.match > 0)
    .sort((a, b) => b.match - a.match)
    .slice(0, 6);

  return results.map((r) => ({
    title: r.title,
    industry: r.industry,
    match: r.match,
    missing: r.missing,
  }));
}

export function recommendCareersFromText(text: string): Recommendation[] {
  return recommendCareers(extractSkillsFromText(text).map((s) => s.name));
}

export interface SkillGap {
  role: string;
  match: number;
  missingSkills: { name: string; category: string }[];
  message: string;
}

export function analyzeSkillGap(skillNames: string[], dreamRole?: string): SkillGap[] {
  const recommendation = dreamRole
    ? recommendCareers(skillNames).find((r) => r.title.toLowerCase() === dreamRole.toLowerCase())
    : recommendCareers(skillNames)[0];

  const target = recommendation
    ? CAREER_ROLES.find((r) => r.title === recommendation.title)
    : undefined;

  if (!target) {
    return [{
      role: dreamRole ?? "Unknown",
      match: 0,
      missingSkills: [],
      message: "Role yang kamu tuju belum terpetakan dalam database karir kami.",
    }];
  }

  const result = matchRole(skillNames, target);
  const missing = result.missing.map((name) => ({
    name,
    category: [...target.required, ...target.niceToHave].includes(name)
      ? target.required.includes(name)
        ? "Required"
        : "Nice to have"
      : "Required",
  }));

  let message: string;
  if (result.match >= 80) {
    message = `Kamu sudah sangat cocok sebagai ${target.title}! Sempurnakan portofolio dan persiapkan diri untuk wawancara.`;
  } else if (result.match >= 50) {
    message = `Kamu cukup cocok sebagai ${target.title}. Tingkatkan ${missing.slice(0, 2).map((m) => m.name).join(" dan ")} untuk meningkatkan peluangmu.`;
  } else {
    const first = missing[0];
    message = first
      ? `Kamu perlu mempelajari ${first.name} untuk lebih cocok sebagai ${target.title}.`
      : `Ayo lengkapi skill-mu untuk menuju karir ${target.title}.`;
  }

  return [
    {
      role: target.title,
      match: result.match,
      missingSkills: missing,
      message,
    },
  ];
}

export async function aiRecommendations(skillNames: string[], dreamRole?: string) {
  if (hasOpenAIKey()) {
    try {
      const result = await chatJSON(
        "You are a career advisor AI for fresh graduates and vocational students. Return strict JSON {recommendations:[{title, industry, match, missing:[..]}], advice:string}.",
        `Skills: ${skillNames.join(", ")}. Dream role: ${dreamRole ?? "none"}. Recommend the best matching entry-level jobs and internships.`
      );
      return {
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
        advice: String(result.advice ?? ""),
      };
    } catch {
      return mockAIRecommendation(skillNames);
    }
  }
  return mockAIRecommendation(skillNames);
}

function mockAIRecommendation(skillNames: string[]) {
  const recommendations = recommendCareers(skillNames);
  const top = recommendations[0];
  const advice = top
    ? `Berdasarkan skill kamu, peluang karir terbaik adalah sebagai ${top.title} dengan kecocokan ${top.match}%. ` +
      (top.missing.length > 0
        ? `Untuk meningkatkan kecocokan, pelajari ${top.missing.slice(0, 3).join(", ")}.`
        : "Kamu sudah siap melamar! Fokuslah pada portofolio dan persiapan wawancara.")
    : "Lengkapi profil skill-mu terlebih dahulu untuk mendapatkan rekomendasi karir.";
  return { recommendations, advice };
}
