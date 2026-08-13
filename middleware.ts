import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "jobmatch-dev-secret-change-in-production");

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  let valid = false;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      valid = Boolean(payload.sub);
    } catch {
      valid = false;
    }
  }

  if (!valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/employer/:path*",
    "/institution/:path*",
    "/admin/:path*",
  ],
};
