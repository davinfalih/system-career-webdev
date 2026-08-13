export interface GenerateCvEducation {
  school: string;
  degree?: string;
  major?: string;
  startYear?: number;
  endYear?: number;
}

export interface GenerateCvExperience {
  role: string;
  company?: string;
  start?: string;
  end?: string;
  description?: string;
}

export interface GenerateCvProject {
  name: string;
  description?: string;
  link?: string;
}

export interface GenerateCvSkill {
  name: string;
  level?: number;
}

export interface GenerateCvDto {
  name: string;
  headline?: string;
  email: string;
  phone?: string;
  location?: string;
  education: GenerateCvEducation[];
  experiences: GenerateCvExperience[];
  projects: GenerateCvProject[];
  skills: GenerateCvSkill[];
  summary?: string;
}