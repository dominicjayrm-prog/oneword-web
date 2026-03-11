'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(newLocale: 'en' | 'es') {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <nav aria-label="Language switcher" className="flex items-center gap-1 text-sm">
      <button
        onClick={() => switchTo('en')}
        aria-current={locale === 'en' ? 'true' : undefined}
        className={cn(
          'cursor-pointer rounded px-2 py-1 font-medium transition-colors',
          locale === 'en' ? 'text-primary' : 'text-text-muted hover:text-text'
        )}
      >
        EN
      </button>
      <span className="text-border">|</span>
      <button
        onClick={() => switchTo('es')}
        aria-current={locale === 'es' ? 'true' : undefined}
        className={cn(
          'cursor-pointer rounded px-2 py-1 font-medium transition-colors',
          locale === 'es' ? 'text-primary' : 'text-text-muted hover:text-text'
        )}
      >
        ES
      </button>
    </nav>
  );
}
