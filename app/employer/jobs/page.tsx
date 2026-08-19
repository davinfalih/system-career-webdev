import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { JobManager } from "@/components/employer/job-manager";

export const metadata = { title: "Kelola Lowongan" };

export default async function EmployerJobsPage() {
  const user = await getCurrentUser();
  if (!user || !user.companyId) return null;

  const { data } = await serverApi("/employer/jobs");
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];

  const serialized = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    type: j.type,
    mode: j.mode,
    location: j.location,
    salary: j.salary,
    description: j.description,
    mustHaveSkills: safeParse(j.mustHaveSkills, []),
    niceToHaveSkills: safeParse(j.niceToHaveSkills, []),
    majorRequired: j.majorRequired,
    minGpa: j.minGpa,
    forFreshGrads: j.forFreshGrads,
    status: j.status,
    deadline: j.deadline,
    applicationCount: j._count.applications,
    createdAt: j.createdAt,
  }));

  return <JobManager initialJobs={serialized} />;
}

function safeParse(value: string, fallback: unknown) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
