import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

// Only allow redirects to local paths to prevent open redirect attacks
const ALLOWED_PREFIXES = ['/play', '/'];

function getSafeRedirect(next: string | null): string {
  if (!next) return '/play';
  // Must be a relative path starting with /
  if (!next.startsWith('/')) return '/play';
  // Block protocol-relative URLs (//evil.com)
  if (next.startsWith('//')) return '/play';
  // Only allow known safe prefixes
  if (ALLOWED_PREFIXES.some((prefix) => next === prefix || next.startsWith(prefix + '/'))) {
    return next;
  }
  return '/play';
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = getSafeRedirect(requestUrl.searchParams.get('next'));

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Cookie setting may fail in some contexts
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // If no code or exchange failed, redirect to login with error context
  const loginUrl = new URL('/login', request.url);
  if (code) {
    loginUrl.searchParams.set('error', 'auth_failed');
  }
  return NextResponse.redirect(loginUrl);
}
