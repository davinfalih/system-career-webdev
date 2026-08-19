import { getSessionToken } from "@/lib/session";

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? process.env.BACKEND_URL ?? ""
).replace(/\/$/, "");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function doFetch<T = any>(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiFetch<T = any>(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T }> {
  try {
    return await doFetch<T>(path, init);
  } catch {
    return { ok: false, status: 0, data: {} as T };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function serverApi<T = any>(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T }> {
  const token = await getSessionToken();
  try {
    return await doFetch<T>(path, {
      ...init,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    return { ok: false, status: 0, data: {} as T };
  }
}
