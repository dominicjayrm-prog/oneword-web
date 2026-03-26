import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ContactContent from './ContactContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  const siteUrl = 'https://playoneword.app';

  const title = `${t('title')} — OneWord`;
  const description = locale === 'es'
    ? 'Ponte en contacto con el equipo de OneWord.'
    : 'Get in touch with the OneWord team.';
  const pageUrl = locale === 'es' ? `${siteUrl}/es/contact` : `${siteUrl}/contact`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        en: `${siteUrl}/contact`,
        es: `${siteUrl}/es/contact`,
        'x-default': `${siteUrl}/contact`,
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

export default function ContactPage() {
  return <ContactContent />;
}
