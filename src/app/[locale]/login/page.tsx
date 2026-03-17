import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LoginContent from './LoginContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return {
    title: `${t('login_title')} — OneWord`,
    description: t('login_subtitle'),
    robots: { index: false, follow: true },
  };
}

export default function LoginPage() {
  return <LoginContent />;
}
