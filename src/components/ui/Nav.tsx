'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from './Button';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations('nav');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-2xl font-bold">
          <span className="text-text">one</span>
          <span className="text-primary">word</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <a href="#how-it-works" className="text-sm text-text-muted hover:text-text transition-colors">
            {t('how_it_works')}
          </a>
          <LanguageSwitcher />
          <Button variant="dark" size="sm" as="a" href="#">
            {t('download')}
          </Button>
          <Button variant="primary" size="sm" as="a" href="/play">
            {t('play_now')}
          </Button>
        </div>

        <button
          className="md:hidden text-text"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-bg px-6 py-4 md:hidden flex flex-col gap-3">
          <a
            href="#how-it-works"
            className="text-sm text-text-muted hover:text-text"
            onClick={() => setMobileOpen(false)}
          >
            {t('how_it_works')}
          </a>
          <LanguageSwitcher />
          <Button variant="dark" size="sm" as="a" href="#">
            {t('download')}
          </Button>
          <Button variant="primary" size="sm" as="a" href="/play">
            {t('play_now')}
          </Button>
        </div>
      )}
    </nav>
  );
}
