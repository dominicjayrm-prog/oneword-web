import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createDirectClient } from '@supabase/supabase-js';
import { ArchiveDayContent } from './ArchiveDayContent';
import type { ArchiveDayEntry } from './ArchiveDayContent';

export const revalidate = 3600; // ISR: revalidate every hour

type Props = {
  params: Promise<{ date: string; locale: string }>;
};

export async function generateStaticParams() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  const supabase = createDirectClient(url, key);
  const { data: words } = await supabase
    .from('daily_words')
    .select('date')
    .lte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(90);

  if (!words) return [];

  return words.flatMap((w) => [
    { locale: 'en', date: w.date },
    { locale: 'es', date: w.date },
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

async function fetchArchiveDay(date: string, language: string): Promise<ArchiveDayEntry[]> {
  try {
    const supabase = await createClient();

    // Try RPC first
    const { data: rows, error } = await supabase.rpc('get_archive_day', {
      p_date: date,
      p_language: language,
    });

    if (!error && rows && (rows as ArchiveDayEntry[]).length > 0) {
      // RPC sorts by elo_rating; re-sort by vote_count so ranking matches what users see
      const sorted = (rows as ArchiveDayEntry[]).slice().sort(
        (a, b) => b.vote_count - a.vote_count || b.elo_rating - a.elo_rating
      );
      return sorted;
    }

    // Fallback: query tables directly
    const { data: wordData } = await supabase
      .from('daily_words')
      .select('id, word, category, date')
      .eq('date', date)
      .eq('language', language)
      .single();

    if (!wordData) return [];

    const { data: countData } = await supabase
      .from('descriptions')
      .select('user_id', { count: 'exact', head: false })
      .eq('word_id', wordData.id);

    const playerCount = countData
      ? new Set(countData.map((r: { user_id: string }) => r.user_id)).size
      : 0;

    const { data: descs } = await supabase
      .from('descriptions')
      .select('description, vote_count, elo_rating, rank, user_id, profiles!inner(username)')
      .eq('word_id', wordData.id)
      .order('vote_count', { ascending: false })
      .order('elo_rating', { ascending: false })
      .limit(10);

    if (!descs) return [];

    return descs.map((row: Record<string, unknown>, i: number) => {
      const profile = row.profiles as Record<string, unknown> | undefined;
      return {
        word: wordData.word,
        category: wordData.category,
        word_date: wordData.date,
        description: row.description as string,
        username: (profile?.username || '') as string,
        elo_rating: (row.elo_rating ?? 0) as number,
        rank: (row.rank ?? i + 1) as number,
        vote_count: (row.vote_count ?? 0) as number,
        player_count: playerCount,
      };
    });
  } catch {
    return [];
  }
}

export default async function ArchiveDayPage({ params }: Props) {
  const { date, locale } = await params;
  setRequestLocale(locale);

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  const language = locale === 'es' ? 'es' : 'en';
  const data = await fetchArchiveDay(date, language);

  return <ArchiveDayContent data={data} date={date} />;
}
