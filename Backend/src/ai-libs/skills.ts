import skillData from "./skills-data.json";

export type SkillDef = { name: string; category: "HARD" | "SOFT"; keywords: string[] };

export const SKILL_MASTER: SkillDef[] = skillData as SkillDef[];

export const ALL_SKILL_NAMES = SKILL_MASTER.map((s) => s.name);

export function extractSkillsFromText(text: string): { name: string; category: "HARD" | "SOFT" }[] {
  const lower = text.toLowerCase();
  const found: { name: string; category: "HARD" | "SOFT" }[] = [];
  for (const skill of SKILL_MASTER) {
    if (skill.keywords.some((k) => lower.includes(k))) {
      found.push({ name: skill.name, category: skill.category });
    }
  }
  return found;
}

export const CAREER_ROLES = [
  {
    title: "Front-End Developer",
    industry: "Teknologi",
    required: ["HTML", "CSS", "JavaScript", "React"],
    niceToHave: ["TypeScript", "Git", "UI/UX Design"],
    levels: ["Junior", "Entry"],
  },
  {
    title: "Back-End Developer",
    industry: "Teknologi",
    required: ["Node.js", "SQL", "JavaScript", "Git"],
    niceToHave: ["Python", "Docker", "MongoDB"],
    levels: ["Junior", "Entry"],
  },
  {
    title: "UI/UX Designer",
    industry: "Desain",
    required: ["Figma", "UI/UX Design"],
    niceToHave: ["HTML", "CSS", "Adobe Photoshop"],
    levels: ["Junior", "Intern"],
  },
  {
    title: "Data Analyst",
    industry: "Data & Analitik",
    required: ["SQL", "Excel", "Data Analysis"],
    niceToHave: ["Python", "Data Visualization", "Machine Learning"],
    levels: ["Junior", "Entry"],
  },
  {
    title: "Data Scientist",
    industry: "Data & Analitik",
    required: ["Python", "Machine Learning", "Data Analysis"],
    niceToHave: ["SQL", "Data Visualization", "GCP"],
    levels: ["Junior", "Entry"],
  },
  {
    title: "Mobile Developer",
    industry: "Teknologi",
    required: ["Kotlin", "Java", "Git"],
    niceToHave: ["Flutter", "React", "MongoDB"],
    levels: ["Junior", "Intern"],
  },
  {
    title: "Full-Stack Developer",
    industry: "Teknologi",
    required: ["JavaScript", "React", "Node.js", "SQL"],
    niceToHave: ["TypeScript", "Docker", "AWS"],
    levels: ["Junior", "Entry"],
  },
  {
    title: "DevOps Engineer",
    industry: "Teknologi",
    required: ["Docker", "Linux", "AWS"],
    niceToHave: ["Kubernetes", "Python", "CI/CD"],
    levels: ["Junior", "Entry"],
  },
  {
    title: "Digital Marketing Specialist",
    industry: "Marketing",
    required: ["Digital Marketing", "Copywriting"],
    niceToHave: ["Data Analysis", "Social Media Management"],
    levels: ["Entry", "Intern"],
  },
  {
    title: "Content Creator",
    industry: "Kreatif",
    required: ["Copywriting", "Creativity"],
    niceToHave: ["Social Media Management", "Adobe Photoshop"],
    levels: ["Entry", "Intern"],
  },
  {
    title: "Accountant",
    industry: "Finance",
    required: ["Accountancy", "Excel"],
    niceToHave: ["Finance", "Attention to Detail"],
    levels: ["Junior", "Entry"],
  },
  {
    title: "Graphic Designer",
    industry: "Desain",
    required: ["Adobe Illustrator", "Adobe Photoshop", "Creativity"],
    niceToHave: ["Figma", "UI/UX Design"],
    levels: ["Junior", "Intern"],
  },
];

export function matchRole(
  userSkills: string[],
  role: (typeof CAREER_ROLES)[number]
) {
  const user = new Set(userSkills.map((s) => s.toLowerCase()));
  const required = role.required;
  const nice = role.niceToHave;
  const hasRequired = required.filter((r) => user.has(r.toLowerCase()));
  const hasNice = nice.filter((r) => user.has(r.toLowerCase()));
  const match = Math.round(
    (hasRequired.length / required.length) * 80 + (hasNice.length / nice.length) * 20
  );
  const missingRequired = required.filter((r) => !user.has(r.toLowerCase()));
  const missingNice = nice.filter((r) => !user.has(r.toLowerCase()));
  return {
    title: role.title,
    industry: role.industry,
    match: Math.min(99, Math.max(0, match)),
    missing: [...missingRequired, ...missingNice],
    missingCount: missingRequired.length + missingNice.length,
  };
}
