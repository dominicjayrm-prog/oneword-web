import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createClient as createDirectClient } from '@supabase/supabase-js';

export async function generateStaticParams() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  const supabase = createDirectClient(url, key);
  const { data: words } = await supabase
    .from('words')
    .select('word_date')
    .lte('word_date', new Date().toISOString().split('T')[0])
    .order('word_date', { ascending: false })
    .limit(90);

  if (!words) return [];

  return words.flatMap((w) => [
    { locale: 'en', date: w.word_date },
    { locale: 'es', date: w.word_date },
  ]);
}

function formatDateForTitle(dateStr: string, locale: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; date: string }>;
}): Promise<Metadata> {
  const { locale, date } = await params;
  const t = await getTranslations({ locale, namespace: 'archive' });
  const formattedDate = formatDateForTitle(date, locale);
  const title = `${formattedDate} — OneWord ${locale === 'es' ? 'Archivo' : 'Archive'}`;
  const description = t('meta_description');
  const baseUrl = 'https://playoneword.app';

  return {
    title,
    description,
    alternates: {
      canonical:
        locale === 'en'
          ? `${baseUrl}/archive/${date}`
          : `${baseUrl}/es/archive/${date}`,
      languages: {
        en: `${baseUrl}/archive/${date}`,
        es: `${baseUrl}/es/archive/${date}`,
        'x-default': `${baseUrl}/archive/${date}`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'article',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
    },
  };
}

export default function ArchiveDayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
