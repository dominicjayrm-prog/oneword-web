import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import TermsContent from './TermsContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });
  const siteUrl = 'https://playoneword.app';

  return {
    title: `${t('title')} — OneWord`,
    description: t('subtitle'),
    alternates: {
      canonical: locale === 'es' ? `${siteUrl}/es/terms` : `${siteUrl}/terms`,
      languages: {
        en: `${siteUrl}/terms`,
        es: `${siteUrl}/es/terms`,
      },
    },
  };
}

export default function TermsPage() {
  return <TermsContent />;
}
