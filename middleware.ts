import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

const SUPPORTED_LOCALES = new Set<string>(routing.locales);
const intlMiddleware = createIntlMiddleware(routing);

// Routes that require authentication — add new protected routes here
const AUTH_REQUIRED_PATTERNS = [/^\/play(\/|$)/];

export async function middleware(request: NextRequest) {
  // Run next-intl middleware first (handles locale detection + redirect)
  const intlResponse = intlMiddleware(request);

  // If intl redirected, return that redirect
  if (intlResponse.headers.get('location')) {
    return intlResponse;
  }

  // Now handle Supabase session on the (possibly rewritten) request
  const supabaseResponse = intlResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  function redirectToLogin(pathname: string) {
    const localeMatch = pathname.match(/^\/([a-z]{2})\//);
    const locale = localeMatch && localeMatch[1] && SUPPORTED_LOCALES.has(localeMatch[1]) ? localeMatch[1] : 'en';
    const url = request.nextUrl.clone();
    url.pathname = locale === 'en' ? '/login' : `/${locale}/login`;
    const redirectResponse = NextResponse.redirect(url);
    // Preserve any refreshed session cookies from the supabase response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // Strip locale prefix to get the base path for route matching
  function getBasePath(pathname: string): string {
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
    if (localeMatch && SUPPORTED_LOCALES.has(localeMatch[1])) {
      return localeMatch[2] || '/';
    }
    return pathname;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const basePath = getBasePath(pathname);
    const requiresAuth = AUTH_REQUIRED_PATTERNS.some((p) => p.test(basePath));
    if (!user && requiresAuth) {
      return redirectToLogin(pathname);
    }
  } catch {
    const pathname = request.nextUrl.pathname;
    const basePath = getBasePath(pathname);
    const requiresAuth = AUTH_REQUIRED_PATTERNS.some((p) => p.test(basePath));
    if (requiresAuth) {
      return redirectToLogin(pathname);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon|manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
