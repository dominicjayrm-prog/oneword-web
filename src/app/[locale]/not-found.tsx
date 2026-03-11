import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('errors');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-serif text-6xl font-black text-text">404</h1>
      <p className="text-lg text-text-muted">{t('not_found')}</p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-medium text-white transition-all hover:bg-primary/90"
      >
        {t('go_home')}
      </Link>
    </div>
  );
}
