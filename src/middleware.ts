import { NextResponse, type NextRequest } from "next/server";
import { siteConfig } from "@/data/site-config";

const PRIMARY_HOST = new URL(siteConfig.url).host;
const REDIRECT_HOSTS = new Set(["mingfen.fun", "www.mingfen.fun", "www.mingfen.sbs"]);

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/pro-test/play") || request.nextUrl.pathname.startsWith("/pro-test/complete")) {
    const url = request.nextUrl.clone();
    url.pathname = "/pro-test";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }

  const host = request.headers.get("host")?.toLowerCase();

  if (!host || host === PRIMARY_HOST || host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return NextResponse.next();
  }

  if (REDIRECT_HOSTS.has(host) || host.endsWith(".pages.dev") || host.endsWith(".workers.dev")) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = PRIMARY_HOST;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}
