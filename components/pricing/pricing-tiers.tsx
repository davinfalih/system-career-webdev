import { CheckCircle2, Crown, GraduationCap, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    name: "Pelajar",
    price: "Gratis",
    icon: GraduationCap,
    features: ["Profil & CV dasar", "AI rekomendasi", "Apply tanpa batas", "Tracer study"],
    popular: false,
  },
  {
    name: "Perusahaan",
    price: "Rp 299rb/bln",
    icon: Building2,
    features: ["10 postingan lowongan", "ATS & match score", "Analitik pelamar", "Wawancara terjadwal"],
    popular: true,
  },
  {
    name: "Institusi",
    price: "Rp 99rb/bln",
    icon: GraduationCap,
    features: ["Verifikasi mahasiswa", "Tracer study", "Top skills industri", "Laporan PDF"],
    popular: false,
  },
];

export function PricingTiers({ activePlan }: { activePlan?: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {TIERS.map((tier) => {
        const isActive = activePlan === tier.name;
        return (
          <div
            key={tier.name}
            className={cn(
              "card relative p-7 transition-all",
              tier.popular && "border-brand-300 ring-2 ring-brand-100",
              isActive && "border-emerald-300 ring-2 ring-emerald-100"
            )}
          >
            {tier.popular && !isActive && (
              <Badge variant="default" className="absolute -top-3 left-6">
                <Crown className="mr-1 h-3 w-3" />
                Paling Populer
              </Badge>
            )}
            {isActive && (
              <Badge variant="success" className="absolute -top-3 left-6">
                Paket Aktif
              </Badge>
            )}
            <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-600">
              <tier.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-zinc-900">{tier.name}</h3>
            <p className="mt-2 text-3xl font-extrabold text-zinc-900">{tier.price}</p>
            <ul className="mt-6 space-y-3 text-sm text-zinc-600">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-500" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
