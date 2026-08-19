import { getCurrentUser } from "@/lib/session";
import { apiFetch } from "@/lib/api";
import { ProfileWorkspace } from "@/components/profile/profile-workspace";

export const metadata = { title: "Profil & CV" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: institutionsData } = await apiFetch("/meta/institutions");
  const institutions = Array.isArray(institutionsData?.institutions) ? institutionsData.institutions : [];
  const { data: skillsData } = await apiFetch("/meta/skills");
  const skills = Array.isArray(skillsData?.skills) ? skillsData.skills : [];

  const profile = user.profile;

  const initialData = {
    user: {
      name: user.name,
      email: user.email,
      major: user.major,
      graduationYear: user.graduationYear,
      gpa: user.gpa,
      nim: user.nim,
      institutionId: user.institutionId,
    },
    profile: profile
      ? {
          headline: profile.headline,
          bio: profile.bio,
          location: profile.location,
          phone: profile.phone,
          skills: safeParse(profile.skills, []),
          education: safeParse(profile.education, []),
          experiences: safeParse(profile.experiences, []),
          projects: safeParse(profile.projects, []),
          cvScore: profile.cvScore,
          atsScore: profile.atsScore,
        }
      : null,
    hasAIReview: Boolean(profile?.aiReview),
  };

  return (
    <ProfileWorkspace
      initialData={initialData}
      institutions={institutions.map((i) => ({ id: i.id, name: i.name, type: i.type }))}
      skillOptions={skills.map((s) => s.name)}
    />
  );
}

function safeParse(value: string | null, fallback: unknown) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
