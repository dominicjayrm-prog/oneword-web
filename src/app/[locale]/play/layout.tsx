'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const { user, profile, loading } = useAuth();
  const t = useTranslations('play_nav');

  const navLinks = useMemo(() => [
    { href: '/play' as const, label: t('today') },
    { href: '/play/vote' as const, label: t('vote') },
    { href: '/play/results' as const, label: t('results') },
    { href: '/play/friends' as const, label: t('friends') },
  ], [t]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Build locale-prefixed paths for comparison
  // With localePrefix: 'as-needed', English has no prefix
  const localePrefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-serif text-xl font-bold">
            <span className="text-text">one</span>
            <span className="text-primary">word</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  pathname === `${localePrefix}${link.href}`
                    ? 'bg-primary-light text-primary'
                    : 'text-text-muted hover:text-text'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {profile && (
            <Link
              href="/play/profile"
              className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-sm font-medium text-text hover:bg-border transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {profile.username?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="hidden sm:inline">{profile.username}</span>
            </Link>
          )}
        </div>
      </nav>

      <main className="flex-1">
        <div className="mx-auto max-w-lg px-4 py-8">{children}</div>
      </main>

      <nav className="sticky bottom-0 border-t border-border bg-bg/95 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors',
                pathname === `${localePrefix}${link.href}` ? 'text-primary' : 'text-text-muted'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
