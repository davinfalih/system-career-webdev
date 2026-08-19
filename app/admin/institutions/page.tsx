import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { InstitutionManager } from "@/components/admin/institution-manager";

export const metadata = { title: "Kelola Institusi" };

export default async function AdminInstitutionsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;

  const { data } = await serverApi("/admin/institutions");
  const institutions = Array.isArray(data?.institutions) ? data.institutions : [];

  const serialized = institutions.map((i) => ({
    id: i.id,
    name: i.name,
    type: i.type,
    city: i.city,
    verified: i.verified,
    createdAt: i.createdAt,
    userCount: i._count.users,
  }));

  return <InstitutionManager initialInstitutions={serialized} />;
}
