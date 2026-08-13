import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const box =
    size === "lg"
      ? "h-12 w-12 rounded-2xl"
      : size === "sm"
        ? "h-9 w-9 rounded-xl"
        : "h-10 w-10 rounded-xl";
  const icon =
    size === "lg" ? "h-8 w-8" : size === "sm" ? "h-5 w-5" : "h-6 w-6";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br from-brand-600 to-rose-500 text-white shadow-card-hover",
        box,
        className
      )}
    >
      <svg
        viewBox="0 0 28 28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={icon}
        aria-hidden="true"
      >
        <path d="M8 6v9.5a3.5 3.5 0 0 0 7 0" />
        <path d="M15 8.5l3 -4 3 4v9" />
      </svg>
    </div>
  );
}