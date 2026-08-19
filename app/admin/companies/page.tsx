import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { CompanyManager } from "@/components/admin/company-manager";

export const metadata = { title: "Kelola Perusahaan" };

export default async function AdminCompaniesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;

  const { data } = await serverApi("/admin/companies");
  const companies = Array.isArray(data?.companies) ? data.companies : [];

  const serialized = companies.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    industry: c.industry,
    location: c.location,
    website: c.website,
    verified: c.verified,
    createdAt: c.createdAt,
    jobCount: c._count.jobs,
  }));

  return <CompanyManager initialCompanies={serialized} />;
}
