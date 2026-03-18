import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import SignupContent from './SignupContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return {
    title: `${t('signup_title')} — OneWord`,
    description: t('signup_subtitle'),
    robots: { index: false, follow: true },
  };
}

export default function SignupPage() {
  return <SignupContent />;
}
