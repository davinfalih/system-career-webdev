export interface CreateCompanyDto {
  name: string;
  industry?: string;
  location?: string;
  description?: string;
  website?: string;
  verified?: boolean;
}