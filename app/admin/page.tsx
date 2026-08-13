import Link from "next/link";
import { ArrowRight, Building2, FileText, GraduationCap, UserCheck, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { apiFetch, serverApi } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { PlatformGrowthChart } from "@/components/dashboard/charts";

export const metadata = { title: "Super Admin" };

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;

  const [{ data: stats }, { data: usersData }, { data: jobsData }] = await Promise.all([
    serverApi("/admin/stats"),
    serverApi("/admin/users"),
    apiFetch("/jobs"),
  ]);

  const totalUsers = stats.totalUsers;
  const totalCompanies = stats.totalCompanies;
  const totalInstitutions = stats.totalInstitutions;
  const totalJobs = stats.totalJobs;
  const totalApplications = stats.totalApplications;
  const totalVerified = stats.totalVerified;
  const recentUsers = usersData.users.slice(0, 8);
  const recentJobs = jobsData.jobs.slice(0, 5);

  const growthData = [
    { name: "Jan", users: 120, jobs: 30 },
    { name: "Feb", users: 180, jobs: 42 },
    { name: "Mar", users: 240, jobs: 55 },
    { name: "Apr", users: 310, jobs: 68 },
    { name: "Mei", users: 380, jobs: 80 },
    { name: "Jun", users: 450, jobs: 92 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Ringkasan Platform</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Pantau pertumbuhan pengguna, institusi, dan lowongan di JobMatch.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Pengguna" value={totalUsers} icon={Users} />
        <StatCard label="Perusahaan" value={totalCompanies} icon={Building2} />
        <StatCard label="Institusi" value={totalInstitutions} icon={GraduationCap} />
        <StatCard label="Lowongan Aktif" value={totalJobs} icon={FileText} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-1 font-bold">Pertumbuhan Platform</h2>
          <p className="mb-4 text-sm text-zinc-500">Pengguna & lowongan per bulan</p>
          <PlatformGrowthChart data={growthData} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Total Lamaran" value={totalApplications} icon={FileText} />
          <StatCard label="Akun Terverifikasi" value={totalVerified} icon={UserCheck} />
          <div className="card p-5 sm:col-span-2">
            <h2 className="mb-3 font-bold">Aksi Cepat</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/admin/institutions" className="btn-secondary justify-start">
                <GraduationCap className="h-4 w-4" /> Kelola Institusi
              </Link>
              <Link href="/admin/companies" className="btn-secondary justify-start">
                <Building2 className="h-4 w-4" /> Kelola Perusahaan
              </Link>
              <Link href="/admin/skills" className="btn-secondary justify-start">
                <Users className="h-4 w-4" /> Kelola Skill
              </Link>
              <Link href="/admin/monetization" className="btn-secondary justify-start">
                <ArrowRight className="h-4 w-4" /> Monetisasi
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b border-zinc-100 p-5">
            <h2 className="font-bold">Pengguna Terbaru</h2>
          </div>
          <div className="divide-y divide-zinc-50">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-600">
                  {(u.name ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-800">{u.name}</p>
                  <p className="truncate text-xs text-zinc-400">{u.email}</p>
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-zinc-100 p-5">
            <h2 className="font-bold">Lowongan Terbaru</h2>
          </div>
          <div className="divide-y divide-zinc-50">
            {recentJobs.map((j) => (
              <div key={j.id} className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">
                  {(j.company?.name ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-800">{j.title}</p>
                  <p className="truncate text-xs text-zinc-400">{j.company?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
