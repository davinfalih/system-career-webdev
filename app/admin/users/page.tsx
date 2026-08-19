import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { UsersManager } from "@/components/admin/users-manager";

export const metadata = { title: "Kelola Pengguna" };

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;

  const { data } = await serverApi("/admin/users");
  const users = Array.isArray(data?.users) ? data.users : [];

  const serialized = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    verified: u.verified,
    company: u.company?.name ?? null,
    institution: u.institution?.name ?? null,
    createdAt: u.createdAt,
  }));

  return <UsersManager initialUsers={serialized} />;
}
