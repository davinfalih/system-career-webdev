export interface CVBuilderData {
  name: string;
  headline?: string;
  email: string;
  phone?: string;
  location?: string;
  education: { school: string; degree?: string; major?: string; startYear?: number; endYear?: number }[];
  experiences: { role: string; company?: string; start?: string; end?: string; description?: string }[];
  projects: { name: string; description?: string; link?: string }[];
  skills: { name: string; level?: number }[];
  summary?: string;
}

export function buildATSResume(data: CVBuilderData): string {
  const lines: string[] = [];
  lines.push(data.name.toUpperCase());
  lines.push(data.headline ?? "");
  lines.push([data.email, data.phone, data.location].filter(Boolean).join(" | "));
  lines.push("");

  if (data.summary) {
    lines.push("RINGKASAN");
    lines.push(data.summary);
    lines.push("");
  }

  if (data.skills.length) {
    lines.push("KEAHLIAN");
    lines.push(data.skills.map((s) => s.name).join(", "));
    lines.push("");
  }

  if (data.education.length) {
    lines.push("PENDIDIKAN");
    for (const edu of data.education) {
      lines.push(
        [edu.degree, edu.major && `(${edu.major})`, edu.school, edu.endYear && `- ${edu.endYear}`]
          .filter(Boolean)
          .join(" ") || edu.school
      );
    }
    lines.push("");
  }

  if (data.experiences.length) {
    lines.push("PENGALAMAN");
    for (const exp of data.experiences) {
      lines.push(`${exp.role} - ${exp.company ?? ""}${exp.start ? ` (${exp.start}${exp.end ? ` - ${exp.end}` : ""})` : ""}`);
      if (exp.description) lines.push(exp.description);
      lines.push("");
    }
  }

  if (data.projects.length) {
    lines.push("PROYEK");
    for (const proj of data.projects) {
      lines.push(proj.name);
      if (proj.description) lines.push(proj.description);
      if (proj.link) lines.push(proj.link);
      lines.push("");
    }
  }

  return lines.filter((l) => l.trim()).join("\n");
}
