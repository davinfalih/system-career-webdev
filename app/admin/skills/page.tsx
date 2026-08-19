import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { SkillManager } from "@/components/admin/skill-manager";

export const metadata = { title: "Kelola Skill" };

export default async function AdminSkillsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;

  const { data } = await serverApi("/admin/skills");
  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const serialized = skills.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    demand: s.demand,
  }));

  return <SkillManager initialSkills={serialized} />;
}
