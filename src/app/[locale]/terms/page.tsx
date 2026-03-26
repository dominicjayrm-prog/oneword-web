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

  const title = `${t('title')} — OneWord`;
  const description = t('subtitle');
  const pageUrl = locale === 'es' ? `${siteUrl}/es/terms` : `${siteUrl}/terms`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        en: `${siteUrl}/terms`,
        es: `${siteUrl}/es/terms`,
        'x-default': `${siteUrl}/terms`,
      },
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      siteName: 'OneWord',
    },
  };
}

export default function TermsPage() {
  return <TermsContent />;
}
