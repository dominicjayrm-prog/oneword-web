'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <Link href="/" className="font-serif text-xl font-bold">
          <span className="text-text">one</span>
          <span className="text-primary">word</span>
        </Link>
        <div className="flex gap-6 text-sm text-text-muted">
          <Link href="/privacy" className="hover:text-text transition-colors">{t('privacy')}</Link>
          <Link href="/terms" className="hover:text-text transition-colors">{t('terms')}</Link>
          <a href="mailto:hello@oneword.game" className="hover:text-text transition-colors">{t('contact')}</a>
          <a href="#" className="hover:text-text transition-colors">{t('twitter')}</a>
        </div>
      </div>
    </footer>
  );
}
