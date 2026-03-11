'use client';

import { useTranslations } from 'next-intl';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-serif text-4xl font-black text-text">{t('something_went_wrong')}</h1>
      <p className="text-text-muted">{t('try_again_message')}</p>
      <button
        onClick={reset}
        className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-medium text-white transition-all hover:bg-primary/90 cursor-pointer"
      >
        {t('try_again')}
      </button>
    </div>
  );
}
