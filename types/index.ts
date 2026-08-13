export type { Role, SessionUser } from "@/lib/session";

export type JobType = "INTERNSHIP" | "FULL_TIME" | "PART_TIME" | "PROJECT_BASED";
export type JobStatus = "OPEN" | "CLOSED";

export interface Job {
  id: string;
  title: string;
  type: JobType;
  mode: string;
  location: string | null;
  salary: string | null;
  description: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  majorRequired: string | null;
  minGpa: number | null;
  forFreshGrads: boolean;
  deadline: string | null;
  status: JobStatus;
  createdAt: string;
  company?: {
    id: string;
    name: string;
    slug: string;
    industry: string;
    location: string;
    verified: boolean;
  };
}