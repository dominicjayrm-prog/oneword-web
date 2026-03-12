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

  const filterByMonth = useCallback(
    (monthKey: string | null) => {
      if (!monthKey) {
        setEntries(allEntries.slice(0, PAGE_SIZE));
        setPage(1);
        setHasMore(allEntries.length > PAGE_SIZE);
        return;
      }
      const filtered = allEntries.filter((e) => {
        const d = new Date(e.word_date + 'T12:00:00Z');
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
        return key === monthKey;
      });
      setEntries(filtered);
      setHasMore(false);
    },
    [allEntries]
  );

  return { entries, loading, hasMore, loadMore, fetchCalendar, months, filterByMonth };
}

export function useArchiveDay(language: string) {
  const [data, setData] = useState<ArchiveDayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchDay = useCallback(
    async (date: string) => {
      setLoading(true);
      const { data: rows, error } = await supabase.rpc('get_archive_day', {
        p_date: date,
        p_language: language,
      });
      if (!error && rows) {
        setData(rows as ArchiveDayEntry[]);
      }
      setLoading(false);
    },
    [language, supabase]
  );

  return { data, loading, fetchDay };
}
