import { Banknote, Building2, GraduationCap, Sparkles, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Monetisasi" };

const PRICE_TIERS = [
  {
    name: "Pelajar",
    price: "Gratis",
    features: ["Profil & CV dasar", "AI rekomendasi", "Apply tanpa batas", "Tracer study"],
    popular: false,
  },
  {
    name: "Perusahaan",
    price: "Rp 299rb/bln",
    features: ["10 postingan lowongan", "ATS & match score", "Analitik pelamar", "Wawancara terjadwal"],
    popular: true,
  },
  {
    name: "Institusi",
    price: "Rp 99rb/bln",
    features: ["Verifikasi mahasiswa", "Tracer study", "Top skills industri", "Laporan PDF"],
    popular: false,
  },
];

export default async function AdminMonetizationPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;

  const { data } = await serverApi("/admin/monetization");
  const totalCompanies = data?.totalCompanies ?? 0;
  const totalInstitutions = data?.totalInstitutions ?? 0;
  const totalUsers = data?.totalUsers ?? 0;
  const totalJobs = data?.totalJobs ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Monetisasi</h1>
        <p className="mt-1 text-sm text-zinc-500">Kelola paket berlangganan dan alur pendapatan platform.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Perusahaan Aktif" value={totalCompanies} icon={Building2} />
        <StatCard label="Institusi" value={totalInstitutions} icon={GraduationCap} />
        <StatCard label="Total Pengguna" value={totalUsers} icon={Users} />
        <StatCard label="Total Lowongan" value={totalJobs} icon={Sparkles} accent="warning" />
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <Banknote className="h-5 w-5 text-brand-500" />
          <h2 className="font-bold">Paket Berlangganan</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {PRICE_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`card relative p-6 ${tier.popular ? "border-brand-300 ring-2 ring-brand-100" : ""}`}
            >
              {tier.popular && (
                <Badge variant="default" className="absolute -top-3 left-6">Paling Populer</Badge>
              )}
              <h3 className="font-bold text-zinc-900">{tier.name}</h3>
              <p className="mt-2 text-2xl font-extrabold text-zinc-900">{tier.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold">Catatan Implementasi</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Pembayaran dapat diintegrasikan dengan payment gateway (Midtrans/Xendit) pada production.
          Saat ini paket ditampilkan sebagai panduan tiers; fitur sesuai peran sudah aktif.
        </p>
      </div>
    </div>
  );
}
