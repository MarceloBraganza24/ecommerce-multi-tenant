import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { edgeDomainKey, normalizeHost } from "@/lib/domainKeys";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

function isRootDomain(host: string) {
  const normalized = normalizeHost(host);
  return normalized === normalizeHost(ROOT_DOMAIN);
}

function getSubdomainSlug(host: string) {
  const normalizedHost = normalizeHost(host);
  const normalizedRoot = normalizeHost(ROOT_DOMAIN);

  if (!normalizedHost.endsWith(`.${normalizedRoot}`)) {
    return null;
  }

  const subdomain = normalizedHost.replace(`.${normalizedRoot}`, "");

  if (!subdomain || subdomain === "www") {
    return null;
  }

  return subdomain;
}

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  const pathname = req.nextUrl.pathname;

  if (!host || isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  if (host.includes("localhost")) {
    return NextResponse.next();
  }

  const subdomainSlug = getSubdomainSlug(host);

  if (subdomainSlug) {
    const url = req.nextUrl.clone();
    url.pathname = `/${subdomainSlug}${pathname}`;

    return NextResponse.rewrite(url);
  }

  if (isRootDomain(host)) {
    return NextResponse.next();
  }

  try {
    const slug = await get<string>(edgeDomainKey(host));

    if (slug) {
      const url = req.nextUrl.clone();
      url.pathname = `/${slug}${pathname}`;

      return NextResponse.rewrite(url);
    }
  } catch (error) {
    console.error("Edge Config domain lookup error:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};