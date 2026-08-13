type Job = {
  mustHaveSkills: string;
  niceToHaveSkills: string;
  [key: string]: unknown;
};

function toSkillArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return value.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export function computeJobMatch(userSkills: string[], job: Job): number {
  const mustHave = toSkillArray(job.mustHaveSkills);
  const niceHave = toSkillArray(job.niceToHaveSkills);
  const user = new Set(userSkills.map((s) => s.toLowerCase()));

  if (mustHave.length === 0) return 60;

  const matchedMust = mustHave.filter((s) => user.has(s.toLowerCase()));
  const matchedNice = niceHave.filter((s) => user.has(s.toLowerCase()));

  const score = Math.round(
    (matchedMust.length / mustHave.length) * 80 +
      (niceHave.length ? (matchedNice.length / niceHave.length) * 20 : 20)
  );
  return Math.min(99, Math.max(0, score));
}
