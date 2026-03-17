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

  return {
    title: `${t('title')} — OneWord`,
    description: locale === 'es'
      ? 'Ponte en contacto con el equipo de OneWord.'
      : 'Get in touch with the OneWord team.',
    alternates: {
      canonical: locale === 'es' ? `${siteUrl}/es/contact` : `${siteUrl}/contact`,
      languages: {
        en: `${siteUrl}/contact`,
        es: `${siteUrl}/es/contact`,
      },
    },
  };
}

export default function ContactPage() {
  return <ContactContent />;
}
