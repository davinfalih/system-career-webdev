import { extractSkillsFromText } from "./skills";
import { chatJSON, hasOpenAIKey } from "./openai";

export interface ParsedSkill {
  name: string;
  category: "HARD" | "SOFT";
  level: number;
}

export interface ParsedCV {
  skills: ParsedSkill[];
  education: {
    school: string;
    degree: string;
    major: string;
    startYear?: number;
    endYear?: number;
  }[];
  experiences: {
    role: string;
    company: string;
    start?: string;
    end?: string;
    description?: string;
  }[];
  projects: { name: string; description?: string; link?: string }[];
  summary?: string;
}

const SYSTEM_PROMPT = `You are an expert CV parser. Extract structured data from the CV text provided.
Return strict JSON matching this schema:
{
  "skills": [{"name": string, "category": "HARD" | "SOFT", "level": 1-5}],
  "education": [{"school": string, "degree": string, "major": string, "startYear": number, "endYear": number}],
  "experiences": [{"role": string, "company": string, "start": string, "end": string, "description": string}],
  "projects": [{"name": string, "description": string, "link": string}],
  "summary": string
}
Only include data present in the CV. Use level as a confidence rating of proficiency.`;

export async function parseCvText(text: string): Promise<ParsedCV> {
  if (hasOpenAIKey()) {
    try {
      const result = await chatJSON(
        SYSTEM_PROMPT,
        `Parse this CV text:\n\n${text.slice(0, 15000)}`
      );
      return normalizeParsedCV(result);
    } catch {
      return mockParse(text);
    }
  }
  return mockParse(text);
}

function normalizeParsedCV(raw: Record<string, unknown>): ParsedCV {
  const skills: ParsedSkill[] = Array.isArray(raw.skills)
    ? raw.skills
        .filter((s) => s && typeof s === "object")
        .map((s): ParsedSkill => {
          const skill = s as Record<string, unknown>;
          return {
            name: String(skill.name ?? ""),
            category: skill.category === "SOFT" ? "SOFT" : "HARD",
            level: clampLevel(Number(skill.level)),
          };
        })
        .filter((s) => s.name)
    : [];

  const education = Array.isArray(raw.education)
    ? raw.education.map((e) => {
        const edu = e as Record<string, unknown>;
        return {
          school: String(edu.school ?? ""),
          degree: String(edu.degree ?? ""),
          major: String(edu.major ?? ""),
          startYear: edu.startYear ? Number(edu.startYear) : undefined,
          endYear: edu.endYear ? Number(edu.endYear) : undefined,
        };
      })
    : [];

  const experiences = Array.isArray(raw.experiences)
    ? raw.experiences.map((e) => {
        const exp = e as Record<string, unknown>;
        return {
          role: String(exp.role ?? ""),
          company: String(exp.company ?? ""),
          start: exp.start ? String(exp.start) : undefined,
          end: exp.end ? String(exp.end) : undefined,
          description: exp.description ? String(exp.description) : undefined,
        };
      })
    : [];

  const projects = Array.isArray(raw.projects)
    ? raw.projects.map((p) => {
        const proj = p as Record<string, unknown>;
        return {
          name: String(proj.name ?? ""),
          description: proj.description ? String(proj.description) : undefined,
          link: proj.link ? String(proj.link) : undefined,
        };
      })
    : [];

  return {
    skills,
    education,
    experiences,
    projects,
    summary: raw.summary ? String(raw.summary) : undefined,
  };
}

function clampLevel(level: number) {
  if (!Number.isFinite(level)) return 3;
  return Math.min(5, Math.max(1, Math.round(level)));
}

function mockParse(text: string): ParsedCV {
  const rawSkills = extractSkillsFromText(text);
  const skills: ParsedSkill[] = rawSkills.map((s) => ({ ...s, level: 4 }));

  const education: ParsedCV["education"] = [];
  const experiences: ParsedCV["experiences"] = [];
  const projects: ParsedCV["projects"] = [];

  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let currentSection = "";
  for (const line of lines) {
    const section = /^(education|pengalaman|experience|experience|proyek|project|projects|riwayat|data pendidikan)/i.test(
      line
    );
    if (section) {
      currentSection = line.toLowerCase();
      continue;
    }
    if (currentSection.includes("education") || currentSection.includes("pendidikan")) {
      if (/\b(sma|smk|universitas|politeknik|institut|high school|university)\b/i.test(line) && line.length < 120) {
        education.push({ school: line, degree: "", major: "" });
      }
    } else if (currentSection.includes("experience") || currentSection.includes("pengalaman") || currentSection.includes("riwayat")) {
      if (line.length < 120 && !line.includes(":") && !line.includes(",")) {
        experiences.push({ role: line, company: "" });
      }
    } else if (currentSection.includes("project") || currentSection.includes("proyek")) {
      if (line.length < 100) {
        projects.push({ name: line });
      }
    }
  }

  return { skills, education, experiences, projects, summary: text.split("\n").slice(0, 3).join(" ") };
}
