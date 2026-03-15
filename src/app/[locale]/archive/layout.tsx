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
      canonical: locale === 'en' ? 'https://playoneword.app/archive' : `https://playoneword.app/es/archive`,
      languages: {
        en: 'https://playoneword.app/archive',
        es: 'https://playoneword.app/es/archive',
        'x-default': 'https://playoneword.app/archive',
      },
    },
  };
}

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
