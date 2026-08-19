import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { VerificationManager } from "@/components/institution/verification-manager";

export const metadata = { title: "Verifikasi Mahasiswa" };

export default async function VerificationPage() {
  const user = await getCurrentUser();
  if (!user || !user.institutionId) return null;

  const { data } = await serverApi("/institution/students");
  const students = Array.isArray(data?.students) ? data.students : [];

  const serialized = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    nim: s.nim,
    major: s.major,
    gpa: s.gpa,
    graduationYear: s.graduationYear,
    verified: s.verified,
    createdAt: s.createdAt,
    skillCount: s.profile ? safeCount(s.profile.skills) : 0,
    applicationCount: s.applications?.length ?? 0,
  }));

  return <VerificationManager initialStudents={serialized} />;
}

function safeCount(value: string | null): number {
  if (!value) return 0;
  try {
    const arr = JSON.parse(value);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return value.split(",").filter(Boolean).length;
  }
}
