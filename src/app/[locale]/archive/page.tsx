import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import ArchiveContent from './ArchiveContent';

export const revalidate = 3600;

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

export default async function ArchivePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const language = locale === 'es' ? 'es' : 'en';
  const supabase = await createClient();
  const { data } = await supabase.rpc('get_archive_calendar', {
    p_language: language,
  });

  const initialEntries = (data as { word_date: string; word: string; category: string; player_count: number }[]) || [];

  return <ArchiveContent initialEntries={initialEntries} />;
}
