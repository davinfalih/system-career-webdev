import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

export type Role = "STUDENT" | "COMPANY" | "INSTITUTION" | "ADMIN";

export type SessionUser = {
  id: string;
  role: string;
  email: string;
  name: string;
};

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "jobmatch-dev-secret-change-in-production");

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("token")?.value ?? null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const id = payload.sub;
    if (!id) return null;
    return {
      id,
      role: (payload.role as string) ?? "STUDENT",
      email: (payload.email as string) ?? "",
      name: (payload.name as string) ?? "",
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSessionUser();
  if (!session) return null;

  const token = await getSessionToken();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  try {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role as Role)) {
    redirect(roleHome(user.role));
  }
  return user;
}

export function roleHome(role: string) {
  switch (role) {
    case "STUDENT":
      return "/dashboard";
    case "COMPANY":
      return "/employer";
    case "INSTITUTION":
      return "/institution";
    case "ADMIN":
      return "/admin";
    default:
      return "/";
  }
}
