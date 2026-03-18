import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ArchiveContent from './ArchiveContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'archive' });
  const siteUrl = 'https://playoneword.app';

  return {
    title: `${t('title')} — OneWord`,
    description: t('subtitle'),
    alternates: {
      canonical: locale === 'es' ? `${siteUrl}/es/archive` : `${siteUrl}/archive`,
      languages: {
        en: `${siteUrl}/archive`,
        es: `${siteUrl}/es/archive`,
        'x-default': `${siteUrl}/archive`,
      },
    },
  };
}

export default function ArchivePage() {
  return <ArchiveContent />;
}
