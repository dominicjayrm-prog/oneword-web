import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PrivacyContent from './PrivacyContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  const siteUrl = 'https://playoneword.app';

  const title = `${t('title')} — OneWord`;
  const description = t('subtitle');
  const pageUrl = locale === 'es' ? `${siteUrl}/es/privacy` : `${siteUrl}/privacy`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        en: `${siteUrl}/privacy`,
        es: `${siteUrl}/es/privacy`,
        'x-default': `${siteUrl}/privacy`,
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

export default function PrivacyPage() {
  return <PrivacyContent />;
}
