import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { CompanySettingsForm } from "@/components/employer/company-settings-form";

export const metadata = { title: "Profil Perusahaan" };

export default async function EmployerSettingsPage() {
  const user = await getCurrentUser();
  if (!user || !user.companyId) return null;

  const { data } = await serverApi("/company/me");
  const company = data?.company ?? null;
  if (!company) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Profil Perusahaan</h1>
        <p className="mt-1 text-sm text-zinc-500">Kelola branding dan informasi perusahaanmu.</p>
      </div>

      <CompanySettingsForm
        company={{
          name: company.name,
          description: company.description,
          industry: company.industry,
          location: company.location,
          website: company.website,
          verified: company.verified,
        }}
      />
    </div>
  );
}
