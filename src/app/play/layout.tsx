'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/play', label: 'Today' },
  { href: '/play/vote', label: 'Vote' },
  { href: '/play/results', label: 'Results' },
  { href: '/play/friends', label: 'Friends' },
];

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();

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

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-serif text-xl font-bold">
            <span className="text-text">one</span>
            <span className="text-primary">word</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-primary-light text-primary'
                    : 'text-text-muted hover:text-text'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Profile */}
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

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-lg px-4 py-8">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="sticky bottom-0 border-t border-border bg-bg/95 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors',
                pathname === link.href ? 'text-primary' : 'text-text-muted'
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
