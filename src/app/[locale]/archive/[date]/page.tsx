import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ArchiveDayContent } from './ArchiveDayContent';
import type { ArchiveDayEntry } from './ArchiveDayContent';

export const revalidate = 3600; // ISR: revalidate every hour

type Props = {
  params: Promise<{ date: string; locale: string }>;
};

async function fetchArchiveDay(date: string, language: string): Promise<ArchiveDayEntry[]> {
  const supabase = await createClient();

  // Try RPC first
  const { data: rows, error } = await supabase.rpc('get_archive_day', {
    p_date: date,
    p_language: language,
  });

  if (!error && rows && (rows as ArchiveDayEntry[]).length > 0) {
    return rows as ArchiveDayEntry[];
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
