export type RegisterRole = 'STUDENT' | 'COMPANY' | 'INSTITUTION';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: RegisterRole;
  institutionId?: string;
  major?: string;
  graduationYear?: number;
  nim?: string;
  gpa?: number;
  companyName?: string;
  companyIndustry?: string;
  companyLocation?: string;
  companyDescription?: string;
  institutionName?: string;
  institutionType?: string;
}