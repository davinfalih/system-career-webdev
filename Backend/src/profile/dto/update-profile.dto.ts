export interface UpdateProfileDto {
  skills?: string[];
  education?: unknown[];
  experiences?: unknown[];
  projects?: unknown[];
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
  institutionId?: string;
}