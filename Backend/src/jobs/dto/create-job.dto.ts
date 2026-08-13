export type JobType = 'INTERNSHIP' | 'FULL_TIME' | 'PART_TIME' | 'PROJECT_BASED';
export type JobStatus = 'OPEN' | 'CLOSED';

export interface CreateJobDto {
  title: string;
  description: string;
  type: JobType;
  mode?: string;
  location?: string;
  salary?: string;
  mustHaveSkills?: string[];
  niceToHaveSkills?: string[];
  majorRequired?: string;
  minGpa?: number;
  forFreshGrads?: boolean;
  deadline?: string | Date;
  status?: JobStatus;
}