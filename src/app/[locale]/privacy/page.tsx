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

  return {
    title: `${t('title')} — OneWord`,
    description: t('subtitle'),
    alternates: {
      canonical: locale === 'es' ? `${siteUrl}/es/privacy` : `${siteUrl}/privacy`,
      languages: {
        en: `${siteUrl}/privacy`,
        es: `${siteUrl}/es/privacy`,
      },
    },
  };
}

export default function PrivacyPage() {
  return <PrivacyContent />;
}
