import { geolocation } from "@vercel/functions";
import { NextRequest, NextResponse } from "next/server";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/locale-constants";
import { localeFromGeoSignals } from "@/lib/locale-from-geo";

export function proxy(request: NextRequest) {
  if (request.cookies.has(LOCALE_COOKIE)) {
    return NextResponse.next();
  }

  const { country } = geolocation(request);
  const locale = localeFromGeoSignals(
    country ?? request.headers.get("x-vercel-ip-country"),
    request.headers.get("accept-language"),
  );

  const response = NextResponse.next();
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon).*)"],
};
