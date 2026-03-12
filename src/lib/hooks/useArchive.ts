'use client';

import { useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface ArchiveEntry {
  word_date: string;
  word: string;
  category: string;
  player_count: number;
}

export interface ArchiveDayEntry {
  word: string;
  category: string;
  word_date: string;
  description: string;
  username: string;
  elo_rating: number;
  rank: number;
  vote_count: number;
  player_count: number;
}

const PAGE_SIZE = 10;

export function useArchiveCalendar(language: string) {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [allEntries, setAllEntries] = useState<ArchiveEntry[]>([]);
  const [page, setPage] = useState(0);
  const supabase = useMemo(() => createClient(), []);

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_archive_calendar', {
      p_language: language,
    });
    if (!error && data) {
      const typed = data as ArchiveEntry[];
      setAllEntries(typed);
      setEntries(typed.slice(0, PAGE_SIZE));
      setPage(1);
      setHasMore(typed.length > PAGE_SIZE);
    }
    setLoading(false);
  }, [language, supabase]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    const nextEntries = allEntries.slice(0, nextPage * PAGE_SIZE);
    setEntries(nextEntries);
    setPage(nextPage);
    setHasMore(nextEntries.length < allEntries.length);
  }, [allEntries, page]);

  // Group entries by month for the month filter
  const months = useMemo(() => {
    const monthSet = new Map<string, string>();
    for (const entry of allEntries) {
      const d = new Date(entry.word_date + 'T12:00:00Z');
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      if (!monthSet.has(key)) {
        monthSet.set(key, key);
      }
    }
    return Array.from(monthSet.keys());
  }, [allEntries]);

  // Extract unique categories
  const categories = useMemo(() => {
    const catSet = new Set<string>();
    for (const entry of allEntries) {
      if (entry.category) catSet.add(entry.category);
    }
    return Array.from(catSet).sort();
  }, [allEntries]);

  const filterByMonth = useCallback(
    (monthKey: string | null, category?: string | null) => {
      let filtered = allEntries;
      if (monthKey) {
        filtered = filtered.filter((e) => {
          const d = new Date(e.word_date + 'T12:00:00Z');
          const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
          return key === monthKey;
        });
      }
      if (category) {
        filtered = filtered.filter((e) => e.category === category);
      }
      if (!monthKey && !category) {
        setEntries(allEntries.slice(0, PAGE_SIZE));
        setPage(1);
        setHasMore(allEntries.length > PAGE_SIZE);
        return;
      }
      setEntries(filtered);
      setHasMore(false);
    },
    [allEntries]
  );

  return { entries, loading, hasMore, loadMore, fetchCalendar, months, categories, filterByMonth };
}

export function useArchiveDay(language: string) {
  const [data, setData] = useState<ArchiveDayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchDay = useCallback(
    async (date: string) => {
      setLoading(true);

      // Try RPC first
      const { data: rows, error } = await supabase.rpc('get_archive_day', {
        p_date: date,
        p_language: language,
      });

      if (!error && rows && (rows as ArchiveDayEntry[]).length > 0) {
        setData(rows as ArchiveDayEntry[]);
        setLoading(false);
        return;
      }

      if (error) {
        console.error('get_archive_day RPC error:', error.code, error.message);
      }

      // Fallback: query tables directly
      const { data: wordData } = await supabase
        .from('daily_words')
        .select('id, word, category, date')
        .eq('date', date)
        .eq('language', language)
        .single();

      if (!wordData) {
        setLoading(false);
        return;
      }

      const { data: countData } = await supabase
        .from('descriptions')
        .select('user_id', { count: 'exact', head: false })
        .eq('word_id', wordData.id);

      const playerCount = countData ? new Set(countData.map((r: { user_id: string }) => r.user_id)).size : 0;

      const { data: descs, error: descError } = await supabase
        .from('descriptions')
        .select('description, vote_count, elo_rating, rank, user_id, profiles!inner(username)')
        .eq('word_id', wordData.id)
        .order('elo_rating', { ascending: false })
        .limit(10);

      if (descError) {
        console.error('Archive day fallback error:', descError.code, descError.message);
      }

      if (descs) {
        const mapped: ArchiveDayEntry[] = descs.map((row: Record<string, unknown>, i: number) => {
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
        setData(mapped);
      }

      setLoading(false);
    },
    [language, supabase]
  );

  return { data, loading, fetchDay };
}
