export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

export function setCookie(
  name: string,
  value: string,
  days?: number,
): void {
  if (typeof document === "undefined") return;
  const expires = days
    ? `; expires=${new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()}`
    : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/${expires}`;
}

export function deleteCookie(name: string): void {
  setCookie(name, "", -1);
}