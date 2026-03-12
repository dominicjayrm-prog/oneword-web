import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'archive' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: {
      canonical: locale === 'en' ? 'https://oneword.game/archive' : `https://oneword.game/es/archive`,
      languages: {
        en: 'https://oneword.game/archive',
        es: 'https://oneword.game/es/archive',
        'x-default': 'https://oneword.game/archive',
      },
    },
  };
}

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
